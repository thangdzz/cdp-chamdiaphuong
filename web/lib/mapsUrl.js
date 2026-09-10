export function mapsUrl(place) {
  const query = `${place.name}, ${place.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
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
