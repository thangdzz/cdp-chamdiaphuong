"use server";

// Tra toạ độ gần đúng từ địa chỉ chữ, để MỞ BẢN ĐỒ cho người dùng kéo ghim (NOTE-14 §6).
// Phần thuần (ghép câu tra, đọc kết quả, mốc dự phòng) nằm ở lib/geocode.js.
//
// Gọi từ máy chủ chứ không từ trình duyệt: giấu được việc CDP dùng nhà cung cấp nào, đổi nhà cung
// cấp không phải đụng giao diện, và chặn được lượt tra dồn dập từ một máy.
//
// KHÔNG ghi Redis: kết quả tra chỉ là gợi ý mở bản đồ, thứ đáng lưu là toạ độ người dùng đã xác
// nhận (lưu cùng điểm dừng). Nhờ vậy tính năng này không tốn thêm lệnh Redis nào.

import { geocodeQueryOf, provinceCenter, readGeocodeResults } from "@/lib/geocode";
import { isValidProvince } from "@/lib/provinces";

const ENDPOINT = "https://photon.komoot.io/api/";
// Tự xưng danh kèm cách liên hệ, theo thông lệ dùng dịch vụ OSM miễn phí.
const USER_AGENT = "ChamDiaPhuong/1.0 (https://chamdiaphuong.io.vn)";
const TIMEOUT_MS = 6000;
// Giãn lượt tra để không dội vào dịch vụ miễn phí. Người dùng gõ xong địa chỉ mới bấm xem bản đồ,
// nên khoảng cách này gần như không ai thấy.
const MIN_GAP_MS = 400;
const CACHE_MAX = 200;
// Khung Việt Nam, giống lib/coordinates.js — chặn kết quả ở nước khác ngay từ lúc tra.
const VN_BBOX = "102,8,110,24";

// Bộ nhớ tạm theo tiến trình (mỗi máy chủ một bản, mất khi khởi động lại). Gõ lại cùng địa chỉ,
// hoặc mở lại đúng màn đó, thì không tra lại lần nữa.
const cache = new Map();
let lastCallAt = 0;

async function callPhoton(query, center) {
  const wait = MIN_GAP_MS - (Date.now() - lastCallAt);
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  lastCallAt = Date.now();

  // `lat`/`lon` chỉ để xếp hạng ưu tiên quanh tỉnh đã chọn: cùng tên phố có ở nhiều tỉnh.
  const params = new URLSearchParams({
    q: query,
    limit: "3",
    bbox: VN_BBOX,
    lat: String(center.lat),
    lon: String(center.lng),
  });

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`photon ${response.status}`);
  return readGeocodeResults(await response.json());
}

/**
 * Tra vị trí gần đúng của một địa chỉ.
 *
 * LUÔN trả về một điểm để mở bản đồ: tra được thì `found: true` ở đúng chỗ tra ra, không thì
 * `found: false` ở giữa tỉnh đã chọn. Người dùng kéo ghim và xác nhận ở bước sau — nên "tra
 * không ra" không phải lỗi, chỉ là bản đồ mở rộng hơn một chút.
 *
 * @returns {{ok: true, found: boolean, lat: number, lng: number, label: string|null}|{ok: false, error: string}}
 */
export async function geocodeAddress({ addressLine, wardOrDistrict, province }) {
  if (!isValidProvince(province)) {
    return { ok: false, error: "Chọn tỉnh/thành trước khi xem trên bản đồ." };
  }
  const center = provinceCenter(province);
  const query = geocodeQueryOf({ addressLine, wardOrDistrict, province });
  if (!query) return { ok: true, found: false, ...center, label: null };

  if (cache.has(query)) return { ok: true, ...cache.get(query) };

  let result;
  try {
    const hit = await callPhoton(query, center);
    result = hit ? { found: true, lat: hit.lat, lng: hit.lng, label: hit.label } : { found: false, ...center, label: null };
  } catch {
    // Mạng lỗi, quá hạn, hoặc nhà cung cấp chặn: vẫn mở bản đồ ở giữa tỉnh để người dùng tự kéo.
    // Không ghi nhớ kết quả hỏng — lần sau thử lại.
    return { ok: true, found: false, ...center, label: null };
  }

  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(query, result);
  return { ok: true, ...result };
}
