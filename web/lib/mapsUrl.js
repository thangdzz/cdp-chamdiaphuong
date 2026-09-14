import { normalizeForSearch } from "./placeTextSearch.js";
import { DEFAULT_PROVINCE, isValidProvince } from "./provinces.js";

// Chuỗi đem tra Google Maps. Các việc nhỏ dưới đây đều là lỗi thật đã gặp:
//
//  1. Địa điểm CDP gửi TÊN + KHU VỰC + TỈNH, không gửi nguyên trường địa chỉ. Trường này có
//     thể chứa cả chỉ dẫn dài; ghép hết từng làm Google nhận cả đoạn văn như từ khoá.
//  2. Điểm riêng/đề xuất vẫn cần địa chỉ, nhưng bỏ phần chú thích trong ngoặc và giới hạn số
//     cụm địa chỉ để câu dẫn đường không biến thành đoạn mô tả.
//  3. Luôn kèm TỈNH/THÀNH khi chuỗi chưa có — địa chỉ hay ghi kiểu "12 Trần Phú", trùng tên
//     với hàng trăm phố Trần Phú khắp nước.
//  4. Bỏ phần rỗng thay vì nối bừa: chỗ chưa có địa chỉ trước đây thành "Tên quán, " —
//     dấu phẩy cụt làm Google đoán lung tung.
//
// Tỉnh nào thì tuỳ loại điểm: địa điểm trong danh bạ CDP luôn ở Tuyên Quang, còn ĐIỂM RIÊNG
// của khách thì nằm ở đâu cũng được — khách từ Hà Nội về Tuyên Quang chơi thì nhà họ ở Hà Nội.
// Gắn cứng "Tuyên Quang" cho điểm riêng (như bản 2026-09-11 sáng) là dẫn sai đường.
const AREA_HINT = DEFAULT_PROVINCE;

function withAreaHint(query, areaHint) {
  if (!query) return null;
  if (!areaHint) return query;
  const hasArea = normalizeForSearch(query).includes(normalizeForSearch(areaHint));
  return hasArea ? query : `${query}, ${areaHint}`;
}

function buildQuery(parts, areaHint = AREA_HINT) {
  const query = parts.filter(Boolean).join(", ").trim();
  return withAreaHint(query || null, areaHint);
}

function cleanPart(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/** Địa chỉ nhập tay có thể lẫn cả đoạn "nếu đi từ... thì rẽ trái" — không gửi phần đó sang Maps. */
export function compactMapsAddress(value, maxParts = 3) {
  const text = cleanPart(value).split("(")[0].trim().replace(/[;,]+$/, "");
  if (!text) return null;
  const parts = text.split(",").map(cleanPart).filter(Boolean).slice(0, maxParts);
  return parts.join(", ") || null;
}

function cdpPlaceQuery(place) {
  const name = cleanPart(place?.name);
  if (!name) return null;
  // Tên chính thức đã tự nói rõ tỉnh thì thêm phường/địa chỉ chỉ làm câu tìm kiếm dài hơn.
  if (normalizeForSearch(name).includes(normalizeForSearch(AREA_HINT))) return name;
  return buildQuery([name, cleanPart(place?.ward)]);
}

export function mapsUrl(place) {
  const query = cdpPlaceQuery(place);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Chuỗi tra cứu của MỘT ĐIỂM DỪNG trong lộ trình — dùng chung cho trang lộ trình và cho bản
 * chụp chia sẻ (trước đây mỗi nơi tự ghép một kiểu, sửa một chỗ là chỗ kia lệch).
 *
 * Điểm riêng ưu tiên ĐỊA CHỈ + TỈNH KHÁCH CHỌN. Nếu không nhập địa chỉ thì dùng TÊN + TỈNH:
 * chỗ công cộng như "Winmart Hàng Bún, Hà Nội" vẫn đủ để Google nhận ra mà người dùng không
 * phải gõ cùng một tên hai lần. Tên riêng kiểu "Nhà Tuấn" nên có địa chỉ để dẫn chính xác.
 *
 * @param {object} stop điểm đã qua resolveRouteStops()
 * @returns {string|null}
 */
export function stopMapsQuery(stop) {
  if (!stop) return null;
  if (stop.place) return cdpPlaceQuery(stop.place);
  if (stop.proposal) {
    // Đề xuất là chỗ xin đưa vào danh bạ CDP, mà danh bạ chỉ nhận Tuyên Quang.
    return buildQuery([
      cleanPart(stop.proposal.name),
      compactMapsAddress(stop.proposal.address || stop.proposal.ward),
    ]);
  }
  // Điểm ngoài danh bạ không được tự rơi về Tuyên Quang. Dữ liệu cũ thiếu tỉnh tạm không
  // đưa vào link của chủ cho tới khi họ mở màn sửa và chọn đúng tỉnh/thành.
  if (!isValidProvince(stop.customProvince)) return null;
  return buildQuery(
    [compactMapsAddress(stop.customAddress, 4) || cleanPart(stop.customTitle)],
    stop.customProvince
  );
}

// Mở CẢ lộ trình trên Google Maps (CDP_P1-P8 §P7 giai đoạn 1) — "CDP lo kế hoạch, Google lo
// đường". Ghép waypoint từ tên + địa chỉ, KHÔNG cần toạ độ: hiện 0/210 địa điểm có toạ độ,
// mà Google tự tra được từ tên + địa chỉ.
//
// Google Maps chỉ nhận tối đa 9 điểm giữa (cộng điểm đầu và điểm cuối là 11). Lộ trình dài
// hơn thì CẮT BỚT các điểm giữa và báo lại cho nơi gọi để nói thật với khách, thay vì im lặng
// bỏ điểm hoặc mở ra một link hỏng.
const MAX_WAYPOINTS = 9;

/**
 * @param {{mapsQuery: string|null}[]} stops các điểm đã có sẵn chuỗi tra cứu
 * @param {string} mapsMode driving | walking (xem TRANSPORT_MODES ở lib/routes.js)
 * @returns {{url: string, omitted: number}|null} null khi chưa đủ 2 điểm tra được
 */
export function routeMapsUrl(stops, mapsMode = "driving") {
  const points = (stops ?? []).map((s) => s.mapsQuery).filter(Boolean);
  if (points.length < 2) return null;

  const origin = points[0];
  const destination = points[points.length - 1];
  const middle = points.slice(1, -1);
  const kept = middle.slice(0, MAX_WAYPOINTS);

  const params = new URLSearchParams({ api: "1", origin, destination, travelmode: mapsMode });
  if (kept.length > 0) params.set("waypoints", kept.join("|"));
  return {
    url: `https://www.google.com/maps/dir/?${params.toString()}`,
    omitted: middle.length - kept.length,
  };
}
