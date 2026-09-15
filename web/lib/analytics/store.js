// Kho ghi nhận hoạt động ẩn danh (NOTE-08 §5, §7, §8). First-party, không dịch vụ ngoài, không lưu
// IP hay vị trí. Đơn vị là "khách" = mã `v-…` trình duyệt tự sinh (khác anonId hồ sơ đóng góp — người
// chỉ xem cũng được đếm); có hồ sơ thì gắn thêm anonId để sau này gộp vào tài khoản (NOTE-08 §8).
//
// Ngân sách lệnh Redis (gói Upstash miễn phí 500K lệnh/tháng): trình duyệt gom sự kiện rồi gửi theo
// đợt; mỗi đợt là MỘT lần gọi script Lua, bên trong chỉ đọc-ghi gộp (HMGET/HSET) chứ không HINCRBY
// từng trường. Dữ liệu theo ngày không đặt TTL: vài chục KB/ngày, còn cần cho biểu đồ 30 ngày.

import { redis } from "../redis.js";

function key(suffix) {
  const namespace = (process.env.CDP_ANALYTICS_NAMESPACE ?? process.env.CDP_GAME_NAMESPACE)?.trim();
  return namespace ? `${namespace}:analytics:${suffix}` : `analytics:${suffix}`;
}

export const ANALYTICS_KEYS = {
  // Hash: firstSeenAt, lastSeenAt, sessions, <tên sự kiện> (số lần), device, lastPath,
  // firstReferrer, anonId, displayName.
  visitor: (visitorId) => key(`visitor:${visitorId}`),
  // ZSET score = lastSeenAt (ms): danh sách khách mới hoạt động gần nhất cho /admin/users.
  visitorsByLastSeen: () => key("visitors:by-last-seen"),
  // Hash visitorId → tên hiển thị gần nhất: tìm theo tên không phải đọc từng hash khách.
  visitorNames: () => key("visitor-names"),
  // Hash theo ngày giờ VN: sessions, new_visitors, event:<tên>, hour:<HH>:sessions,
  // hour:<HH>:page_view, path:<đường dẫn>.
  day: (day) => key(`day:${day}`),
  // HyperLogLog theo ngày (PFCOUNT nhiều ngày = số khách KHÁC NHAU trong khoảng — lọc 7/30 ngày).
  dayVisitors: (day) => key(`day:${day}:visitors`),
  dayReturning: (day) => key(`day:${day}:returning`),
  // Phễu game (NOTE-08 §7): xem bài lễ hội → mở game → bắt đầu báo → gửi báo → người chơi quay lại.
  dayFunnel: (day, stage) => key(`day:${day}:funnel:${stage}`),
};

export const FUNNEL_STAGES = ["post_view", "game_open", "sighting_start", "sighting_submit", "game_returning"];

// KEYS: 1 visitor · 2 day · 3 by-last-seen · 4 visitor-names · 5 visitors HLL · 6 returning HLL ·
//       7..11 funnel HLL theo thứ tự FUNNEL_STAGES.
// ARGV: 1 visitorId · 2 nowMs · 3 dayStartMs · 4 hour "HH" · 5 sessionStart "1"/"0" · 6 postView "1"/"0" ·
//       7 anonId · 8 displayName · 9 device · 10 referrer · 11 lastPath ·
//       12 số cặp sự kiện N, rồi N cặp (tên, số lần) · sau đó số cặp M, rồi M cặp (trường ngày, số cộng).
const RECORD_SCRIPT = `
local vid = ARGV[1]
local now = tonumber(ARGV[2])
local dayStart = tonumber(ARGV[3])
local hour = ARGV[4]
local n = tonumber(ARGV[12])

local fields = { 'firstSeenAt', 'sessions', 'displayName' }
for i = 0, n - 1 do fields[#fields + 1] = ARGV[13 + 2 * i] end
local cur = redis.call('HMGET', KEYS[1], unpack(fields))

local out = { 'lastSeenAt', ARGV[2], 'device', ARGV[9] }
if ARGV[11] ~= '' then out[#out + 1] = 'lastPath'; out[#out + 1] = ARGV[11] end
local dayAdd = {}
local counts = {}

local first = tonumber(cur[1])
local isNew = first == nil
if isNew then
  first = now
  out[#out + 1] = 'firstSeenAt'; out[#out + 1] = ARGV[2]
  if ARGV[10] ~= '' then out[#out + 1] = 'firstReferrer'; out[#out + 1] = ARGV[10] end
  dayAdd['new_visitors'] = 1
end

local sessions = tonumber(cur[2]) or 0
if ARGV[5] == '1' or sessions == 0 then
  sessions = sessions + 1
  out[#out + 1] = 'sessions'; out[#out + 1] = sessions
  dayAdd['sessions'] = 1
  dayAdd['hour:' .. hour .. ':sessions'] = 1
end

for i = 0, n - 1 do
  local name = ARGV[13 + 2 * i]
  local c = tonumber(ARGV[14 + 2 * i])
  counts[name] = c
  out[#out + 1] = name; out[#out + 1] = (tonumber(cur[4 + i]) or 0) + c
end
if ARGV[7] ~= '' then out[#out + 1] = 'anonId'; out[#out + 1] = ARGV[7] end
if ARGV[8] ~= '' then
  out[#out + 1] = 'displayName'; out[#out + 1] = ARGV[8]
  if cur[3] ~= ARGV[8] then redis.call('HSET', KEYS[4], vid, ARGV[8]) end
end
redis.call('HSET', KEYS[1], unpack(out))

local base = 13 + 2 * n
local m = tonumber(ARGV[base])
for i = 0, m - 1 do
  local f = ARGV[base + 1 + 2 * i]
  dayAdd[f] = (dayAdd[f] or 0) + tonumber(ARGV[base + 2 + 2 * i])
end
local dayFields = {}
for f, _ in pairs(dayAdd) do dayFields[#dayFields + 1] = f end
if #dayFields > 0 then
  local dayCur = redis.call('HMGET', KEYS[2], unpack(dayFields))
  local dayOut = {}
  for i, f in ipairs(dayFields) do
    dayOut[#dayOut + 1] = f; dayOut[#dayOut + 1] = (tonumber(dayCur[i]) or 0) + dayAdd[f]
  end
  redis.call('HSET', KEYS[2], unpack(dayOut))
end

redis.call('PFADD', KEYS[5], vid)
if first < dayStart then redis.call('PFADD', KEYS[6], vid) end
if ARGV[6] == '1' then redis.call('PFADD', KEYS[7], vid) end
if (counts['game_open'] or 0) > 0 then
  redis.call('PFADD', KEYS[8], vid)
  if sessions >= 2 then redis.call('PFADD', KEYS[11], vid) end
end
if (counts['sighting_start'] or 0) > 0 then redis.call('PFADD', KEYS[9], vid) end
if (counts['sighting_submit'] or 0) > 0 then redis.call('PFADD', KEYS[10], vid) end
redis.call('ZADD', KEYS[3], now, vid)
return sessions
`;

let recordScript = null;

const VN_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
const VN_HOUR = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", hourCycle: "h23" });

// "2026-09-20" theo giờ VN — đêm hội qua 0h UTC vẫn cùng một ngày (cùng quy ước lib/game/store.vnDayKey).
export function analyticsDayKey(date = new Date()) {
  return VN_DAY.format(date);
}

/**
 * Ghi một đợt sự kiện của một khách. Đầu vào ĐÃ được route kiểm tra (app/api/track/route.js).
 * @param {{ visitorId, anonId, displayName, device, referrer, sessionStart, postView,
 *           paths: string[], counts: Record<string, number> }} batch
 */
export async function recordAnalyticsBatch(batch) {
  const now = new Date();
  const day = analyticsDayKey(now);
  const dayStart = Date.parse(`${day}T00:00:00+07:00`);
  const hour = VN_HOUR.format(now);

  const counts = { ...batch.counts };
  if (batch.paths.length > 0) counts.page_view = (counts.page_view ?? 0) + batch.paths.length;
  const eventPairs = Object.entries(counts).filter(([, n]) => n > 0);

  const dayAdd = new Map();
  const bump = (field, n) => dayAdd.set(field, (dayAdd.get(field) ?? 0) + n);
  for (const [name, n] of eventPairs) bump(`event:${name}`, n);
  if (batch.paths.length > 0) bump(`hour:${hour}:page_view`, batch.paths.length);
  for (const path of batch.paths) bump(`path:${path}`, 1);

  recordScript ??= redis.createScript(RECORD_SCRIPT);
  const keys = [
    ANALYTICS_KEYS.visitor(batch.visitorId),
    ANALYTICS_KEYS.day(day),
    ANALYTICS_KEYS.visitorsByLastSeen(),
    ANALYTICS_KEYS.visitorNames(),
    ANALYTICS_KEYS.dayVisitors(day),
    ANALYTICS_KEYS.dayReturning(day),
    ...FUNNEL_STAGES.map((stage) => ANALYTICS_KEYS.dayFunnel(day, stage)),
  ];
  const args = [
    batch.visitorId,
    String(now.getTime()),
    String(dayStart),
    hour,
    batch.sessionStart ? "1" : "0",
    batch.postView ? "1" : "0",
    batch.anonId ?? "",
    batch.displayName ?? "",
    batch.device ?? "",
    batch.referrer ?? "",
    batch.paths.at(-1) ?? "",
    String(eventPairs.length),
    ...eventPairs.flatMap(([name, n]) => [name, String(n)]),
    String(dayAdd.size),
    ...[...dayAdd].flatMap(([field, n]) => [field, String(n)]),
  ];
  return recordScript.exec(keys, args);
}
