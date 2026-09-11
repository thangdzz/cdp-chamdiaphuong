import { normalizeForSearch } from "./placeTextSearch.js";

// Chuỗi đem tra Google Maps. Ba việc nhỏ nhưng đều là lỗi thật đã gặp:
//
//  1. Luôn kèm ĐỊA CHỈ, không chỉ mỗi tên. "Winmart Hàng Bún" gửi trần sang Google thì ra
//     Hàng Bún ở Hà Nội, vì tên đó có thật ngoài Tuyên Quang.
//  2. Luôn kèm "Tuyên Quang" khi chuỗi chưa có — địa chỉ trong danh bạ hay ghi kiểu
//     "12 Trần Phú", trùng tên với hàng trăm phố Trần Phú khắp nước.
//  3. Bỏ phần rỗng thay vì nối bừa: chỗ chưa có địa chỉ trước đây thành "Tên quán, " —
//     dấu phẩy cụt làm Google đoán lung tung.
const AREA_HINT = "Tuyên Quang";

function withAreaHint(query) {
  if (!query) return null;
  const hasArea = normalizeForSearch(query).includes(normalizeForSearch(AREA_HINT));
  return hasArea ? query : `${query}, ${AREA_HINT}`;
}

function buildQuery(parts) {
  const query = parts.filter(Boolean).join(", ").trim();
  return withAreaHint(query || null);
}

export function mapsUrl(place) {
  const query = buildQuery([place.name, place.address]);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Chuỗi tra cứu của MỘT ĐIỂM DỪNG trong lộ trình — dùng chung cho trang lộ trình và cho bản
 * chụp chia sẻ (trước đây mỗi nơi tự ghép một kiểu, sửa một chỗ là chỗ kia lệch).
 *
 * Điểm riêng ("Nhà Tuấn", "Xuất phát tại nhà") gửi đi bằng ĐỊA CHỈ, KHÔNG gửi cái tên: tên đó
 * người tạo đặt cho mình đọc, Google tra ra thì càng sai. Không nhập địa chỉ -> trả null, tức
 * điểm đó không nằm trong link Google. Thà thiếu một chặng còn hơn dẫn người ta tới chỗ khác.
 *
 * @param {object} stop điểm đã qua resolveRouteStops()
 * @returns {string|null}
 */
export function stopMapsQuery(stop) {
  if (!stop) return null;
  if (stop.place) return buildQuery([stop.place.name, stop.place.address || stop.place.ward]);
  if (stop.proposal) {
    return buildQuery([stop.proposal.name, stop.proposal.address || stop.proposal.ward]);
  }
  return buildQuery([stop.customAddress]);
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
