// NHẬT KÝ ĐỔI VỊ TRÍ của một địa điểm (NOTE-15 §19).
//
// Vì sao cần: ghim đè lên ghim là mất sạch dấu vết. Hôm nay admin chốt một chỗ, tuần sau một
// phiếu cộng đồng khiến admin chốt lại chỗ khác — không có nhật ký thì không ai trả lời được
// "trước đó nó nằm ở đâu, ai đổi, vì sao", và cũng không lùi lại được khi đổi nhầm.
//
// Chỉ GHI, chưa có màn hình xem (NOTE-15 xếp "location history UI" vào P2). Ghi trước vì dữ
// liệu không ghi lúc xảy ra thì sau này dựng lại không được.
//
// Dạng lưu: HASH `place_location:history`, field = placeId, value = mảng các lần đổi, mới nhất
// đứng đầu, giữ tối đa 20 lần. HSET theo field nên hai địa điểm sửa cùng lúc không đè nhau;
// cả bảng đọc đúng 1 lệnh khi nào dựng màn xem. Không nhét vào `places:live`: hồ sơ địa điểm
// là thứ mọi trang công khai đọc, không nên phình ra vì dữ liệu quản trị.

import { redis } from "./redis.js";
import { coordinatesOf } from "./coordinates.js";
import { googlePlaceIdOf } from "./placeLocation.js";

const HISTORY_KEY = "place_location:history";
const MAX_ENTRIES = 20;

/** Ảnh chụp gọn vị trí của một hồ sơ địa điểm — null khi chỗ đó chưa có toạ độ nào. */
function snapshot(entity) {
  const coords = coordinatesOf(entity);
  const googlePlaceId = googlePlaceIdOf(entity);
  if (!coords && !googlePlaceId) return null;
  return {
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    source: coords?.source ?? null,
    confirmed: coords?.confirmed === true,
    googlePlaceId,
  };
}

/**
 * Ghi lại một lần đổi vị trí. Không đổi gì thật (bấm lưu mà toạ độ y nguyên) thì KHÔNG ghi —
 * nhật ký đầy những dòng giống hệt nhau thì đọc cũng như không.
 *
 * @param {string} placeId
 * @param {object|null} before hồ sơ địa điểm TRƯỚC khi đổi
 * @param {object|null} after hồ sơ địa điểm SAU khi đổi
 * @param {string} actor ai đổi: "admin" | "community" | anonId của khách
 * @param {string|null} reason lý do/ngữ cảnh ngắn, VD "chốt theo phiếu cộng đồng"
 */
export async function recordLocationChange({ placeId, before, after, actor = "admin", reason = null }) {
  if (!placeId) return;
  const from = snapshot(before);
  const to = snapshot(after);
  if (JSON.stringify(from) === JSON.stringify(to)) return;

  const current = await getLocationHistory(placeId);
  const next = [
    {
      at: new Date().toISOString(),
      actor: String(actor).slice(0, 80),
      reason: reason ? String(reason).slice(0, 200) : null,
      from,
      to,
    },
    ...current,
  ].slice(0, MAX_ENTRIES);
  await redis.hset(HISTORY_KEY, { [placeId]: next });
}

/** Các lần đổi vị trí của một địa điểm, mới nhất trước. */
export async function getLocationHistory(placeId) {
  if (!placeId) return [];
  const raw = await redis.hget(HISTORY_KEY, placeId);
  return Array.isArray(raw) ? raw : [];
}

/** Xoá địa điểm thì xoá luôn nhật ký của nó — cùng lúc với phiếu và câu trả lời. */
export async function removeLocationHistory(placeId) {
  if (!placeId) return;
  await redis.hdel(HISTORY_KEY, placeId);
}
