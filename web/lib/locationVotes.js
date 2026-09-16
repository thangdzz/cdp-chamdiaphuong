// PHIẾU VỊ TRÍ CỦA KHÁCH + đồng thuận toạ độ (spec CDP-Google-Places-Location-Consensus §6, §7,
// §8, §17).
//
// Vì sao cần: CDP có 234 địa điểm, chủ dự án ghim tay được vài chỗ mỗi ngày. Khách đang đứng
// trước cửa quán mới là người biết chính xác chỗ đó nằm đâu. Cho họ ghim, và khi ĐỦ NGƯỜI ĐỘC LẬP
// cùng chỉ về một chỗ thì coi như đã xác minh — Google Maps được dẫn tới đó thay vì tự đoán theo tên.
//
// Đi đúng khuôn lib/answers.js (Chặng 2): thao tác của khách, nhiều người bấm cùng lúc, nên KHÔNG
// đọc-cả-mảng-rồi-ghi-lại. Mỗi phiếu là 1 field trong hash (HSET nguyên tử, không đụng phiếu người
// khác), và kết quả đồng thuận được tính sẵn vào 1 hash riêng để trang công khai đọc đúng 1 lệnh.
//
// KHÔNG ghi đè `places:live`: phiếu khách nằm ở kho riêng, chỉ admin chốt mới ghi vào hồ sơ địa
// điểm (§8 — admin luôn là mức tin cao nhất). Nhờ vậy khách bấm nhầm cũng không hỏng dữ liệu gốc.

import { redis } from "./redis.js";
import { cleanCoordinates } from "./coordinates.js";
import { trySpendDailyPoints } from "./pointsCap.js";
import { addContributorPoints } from "./contributors.js";

const CONSENSUS_KEY = "place_location:consensus";

function votesKey(placeId) {
  return `place_location:votes:${placeId}`;
}

function countKey(anonId, dateStr) {
  return `location_votes:count:${anonId}:${dateStr}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Hai phiếu cách nhau trong bán kính này coi như cùng chỉ MỘT chỗ (spec §7). 40m: đủ rộng để hai
 * người đứng hai đầu một cái quán vẫn tính là đồng ý với nhau, đủ hẹp để hai nhà kế bên không bị
 * gộp làm một.
 */
export const LOCATION_CONSENSUS_RADIUS_METERS = 40;

/** Bao nhiêu người độc lập thì tin (spec §7). 2 người — giống ngưỡng đồng thuận câu hỏi Chặng 2. */
const MIN_VOTERS_FOR_CONSENSUS = 2;

// Trần số phiếu vị trí một người gửi được mỗi ngày. Không phải để tiết kiệm điểm (trần điểm chung
// 30đ/ngày đã lo việc đó) mà để một người bấm liên tục không bơm phồng kho dữ liệu.
const DAILY_VOTE_CAP = 20;
const DAILY_VOTE_TTL_SECONDS = 48 * 60 * 60;

// Điểm thưởng: giống Chặng 2 — người đầu tiên chỉ đúng chỗ được nhiều hơn, vì lúc đó chưa có gì
// để dựa vào.
const POINTS_FIRST_VOTER = 3;
const POINTS_OTHER_VOTER = 1;

// Chỉ giữ vài cụm đầu cho trang admin xem — một chỗ có 20 cụm khác nhau thì vấn đề không nằm ở
// cụm thứ 4.
const MAX_CLUSTERS_STORED = 3;

/** Khoảng cách hai điểm trên mặt đất, mét (haversine). Không gọi API nào. */
export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Gom các phiếu chỉ về cùng một chỗ thành cụm (spec §7). Phiếu vào cụm nào thì tâm cụm dịch theo
 * trung bình, nên cụm luôn nằm giữa những người đã đồng ý với nhau.
 *
 * Xét theo thứ tự thời gian để kết quả không đổi giữa hai lần tính (cùng dữ liệu → cùng cụm).
 *
 * @param {{anonId: string, lat: number, lng: number, googlePlaceId?: string|null, at: string}[]} votes
 * @returns {{lat: number, lng: number, googlePlaceId: string|null, voters: string[], firstAt: string}[]}
 *          cụm đông nhất đứng trước; đông bằng nhau thì cụm có người chỉ ra sớm hơn đứng trước
 */
export function clusterLocationVotes(votes) {
  const sorted = [...(votes ?? [])].sort((a, b) => new Date(a.at) - new Date(b.at));
  const clusters = [];

  for (const vote of sorted) {
    const point = { lat: vote.lat, lng: vote.lng };
    const cluster = clusters.find(
      (c) => distanceMeters(c, point) <= LOCATION_CONSENSUS_RADIUS_METERS
    );
    if (!cluster) {
      clusters.push({
        lat: vote.lat,
        lng: vote.lng,
        googlePlaceId: vote.googlePlaceId ?? null,
        voters: [vote.anonId],
        firstAt: vote.at,
      });
      continue;
    }
    // Tâm mới = trung bình cộng mọi phiếu trong cụm.
    const n = cluster.voters.length;
    cluster.lat = (cluster.lat * n + vote.lat) / (n + 1);
    cluster.lng = (cluster.lng * n + vote.lng) / (n + 1);
    cluster.googlePlaceId = cluster.googlePlaceId ?? vote.googlePlaceId ?? null;
    cluster.voters.push(vote.anonId);
  }

  const round = (n) => Math.round(n * 1e6) / 1e6;
  for (const cluster of clusters) {
    cluster.lat = round(cluster.lat);
    cluster.lng = round(cluster.lng);
  }

  return clusters.sort(
    (a, b) => b.voters.length - a.voters.length || new Date(a.firstAt) - new Date(b.firstAt)
  );
}

/**
 * Kết luận về vị trí của một chỗ, từ toàn bộ phiếu khách đã gửi (spec §7).
 *
 * - `community_verified` — cụm đông nhất có từ 2 người và ĐÔNG HƠN HẲN cụm nhì: dùng được để dẫn đường.
 * - `conflict` — hai cụm cùng đông, cách xa nhau: KHÔNG tự chọn bừa, đẩy sang admin.
 * - `pending` — có người ghim nhưng chưa đủ 2 người đồng ý.
 *
 * `conflict: true` vẫn được gắn kèm cả khi đã đủ đồng thuận, để admin biết có người báo chỗ khác.
 *
 * @returns {{lat, lng, googlePlaceId, voters, status, conflict, at, clusters}|null} null khi chưa có phiếu nào
 */
export function computeLocationConsensus(votes) {
  const clusters = clusterLocationVotes(votes);
  if (clusters.length === 0) return null;

  const [top, second] = clusters;
  const runnerUp = second?.voters.length ?? 0;
  // Cụm nhì cũng có từ 2 người → có mâu thuẫn thật, admin cần biết (spec §7, §15).
  const conflict = runnerUp >= MIN_VOTERS_FOR_CONSENSUS;
  const enough = top.voters.length >= MIN_VOTERS_FOR_CONSENSUS;
  // Hai cụm cùng đông thì không có "đa số" — im lặng chọn một bên là đoán bừa đúng thứ spec cấm.
  const decided = enough && top.voters.length > runnerUp;

  return {
    lat: top.lat,
    lng: top.lng,
    googlePlaceId: top.googlePlaceId ?? null,
    voters: top.voters.length,
    status: decided ? "community_verified" : conflict ? "conflict" : "pending",
    conflict,
    at: top.firstAt,
    clusters: clusters.slice(0, MAX_CLUSTERS_STORED).map((c) => ({
      lat: c.lat,
      lng: c.lng,
      voters: c.voters.length,
    })),
  };
}

/** Bảng đồng thuận vị trí của MỌI chỗ — 1 lệnh Redis, dùng cho trang chủ và trang địa điểm. */
export async function getAllLocationConsensus() {
  const data = await redis.hgetall(CONSENSUS_KEY);
  return data ?? {};
}

/**
 * Gắn kết luận đồng thuận vào từng địa điểm, để `locationOf()` (lib/placeLocation.js) biết chỗ nào
 * đã được cộng đồng xác nhận. Đúng 1 lệnh Redis cho cả danh sách, dù bao nhiêu chỗ — giống cách
 * trang chủ đang gắn `consensus` của câu hỏi và `lastCheckinAt` của lượt xác nhận.
 */
export async function attachLocationConsensus(places) {
  const list = places ?? [];
  if (list.length === 0) return list;
  const all = await getAllLocationConsensus();
  return list.map((place) => ({ ...place, locationConsensus: all[place.id] ?? null }));
}

/** Phiếu vị trí của một chỗ (field = anonId). Chỉ đọc khi admin xem bảng, không đọc ở trang khách. */
export async function getLocationVotesForPlace(placeId) {
  const data = await redis.hgetall(votesKey(placeId));
  return data ?? {};
}

/** Phiếu của chính người đang xem, để giao diện biết họ đã bấm chưa. */
export async function getMyLocationVote(anonId, placeId) {
  if (!anonId || !placeId) return null;
  return (await redis.hget(votesKey(placeId), anonId)) ?? null;
}

/**
 * Khách gửi một phiếu vị trí. Thứ tự: chặn trần trước → ghi phiếu → tính lại đồng thuận → thưởng điểm.
 *
 * MỘT người MỘT phiếu cho MỘT chỗ (§17): gửi lại là thay phiếu cũ, không cộng thêm lượt. `awarded`
 * đã bật thì không bao giờ cộng điểm lần hai cho chỗ đó — nếu không, ghim chỗ A lấy điểm rồi dời
 * sang chỗ B lấy tiếp là farm được.
 *
 * @returns {{ok: boolean, capped?: boolean, error?: string, status?: string, voters?: number, pointsAwarded?: boolean}}
 */
export async function submitLocationVote({ anonId, placeId, lat, lng, googlePlaceId = null }) {
  if (!anonId || !placeId) return { ok: false, error: "Thiếu thông tin." };
  // Server Action gọi thẳng được bất kể giao diện — tự kiểm khuôn dạng, không tin dữ liệu client.
  const coords = cleanCoordinates({ lat, lng });
  if (!coords) return { ok: false, error: "Toạ độ không hợp lệ." };

  const cKey = countKey(anonId, todayStr());
  const count = await redis.incr(cKey);
  if (count === 1) await redis.expire(cKey, DAILY_VOTE_TTL_SECONDS);
  if (count > DAILY_VOTE_CAP) return { ok: false, capped: true };

  const vKey = votesKey(placeId);
  const existing = await redis.hget(vKey, anonId);
  const cleanPlaceId =
    typeof googlePlaceId === "string" && googlePlaceId.trim()
      ? googlePlaceId.trim().slice(0, 200)
      : null;
  const vote = {
    lat: coords.lat,
    lng: coords.lng,
    googlePlaceId: cleanPlaceId,
    // Đổi ý không mất mốc "người chỉ ra chỗ này đầu tiên".
    at: existing?.at ?? new Date().toISOString(),
    awarded: existing?.awarded === true,
  };
  await redis.hset(vKey, { [anonId]: vote });

  const allVotes = await redis.hgetall(vKey);
  const votes = Object.entries(allVotes ?? {}).map(([id, v]) => ({ anonId: id, ...v }));
  const consensus = computeLocationConsensus(votes);

  if (consensus) await redis.hset(CONSENSUS_KEY, { [placeId]: consensus });
  else await redis.hdel(CONSENSUS_KEY, placeId);

  // §17: chỉ cộng điểm khi phiếu TRÙNG với kết luận cuối cùng, và chỉ khi kết luận đã đủ tin.
  let pointsAwarded = false;
  if (consensus?.status === "community_verified") {
    const winners = votes
      .filter(
        (v) =>
          !v.awarded &&
          distanceMeters({ lat: v.lat, lng: v.lng }, consensus) <= LOCATION_CONSENSUS_RADIUS_METERS
      )
      .sort((a, b) => new Date(a.at) - new Date(b.at));

    for (const [index, winner] of winners.entries()) {
      // Người đầu tiên của cụm thắng (theo mốc phiếu) được thưởng cao hơn — nhưng chỉ khi chính
      // họ chưa từng được thưởng ở chỗ này, nên mốc tính lại từ danh sách chưa thưởng.
      const amount = index === 0 && winner.at === consensus.at ? POINTS_FIRST_VOTER : POINTS_OTHER_VOTER;
      const allowed = await trySpendDailyPoints(winner.anonId, amount);
      if (allowed) await addContributorPoints(winner.anonId, amount);
      const { anonId: winnerId, ...stored } = winner;
      await redis.hset(vKey, { [winnerId]: { ...stored, awarded: true } });
      if (winnerId === anonId && allowed) pointsAwarded = true;
    }
  }

  return {
    ok: true,
    capped: false,
    status: consensus?.status ?? "pending",
    voters: consensus?.voters ?? 1,
    conflict: consensus?.conflict ?? false,
    pointsAwarded,
  };
}

/** Dọn theo chỗ bị xoá/gộp — gọi cùng removeLatestCheckin/removePlaceAnswers. */
export async function removePlaceLocationVotes(placeId) {
  await redis.hdel(CONSENSUS_KEY, placeId);
  await redis.del(votesKey(placeId));
}
