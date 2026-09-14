// Nền bản đồ cho game layer: MapLibre + dữ liệu OpenStreetMap (NOTE-04 §6). Gom về một chỗ để
// đổi nhà cung cấp tile chỉ phải sửa file này.
//
// Nguồn chính là OpenFreeMap (vector tile từ dữ liệu OSM, miễn phí, không cần key, cho phép dùng
// thương mại). KHÔNG dùng thẳng tile.openstreetmap.org làm nguồn chính: (1) chính sách của OSM
// không cho app có lượng truy cập lớn dùng máy chủ tile công cộng, (2) test 14/9/2026 thấy DNS
// mạng gia đình ở VN trả 127.0.0.1 cho domain đó => bản đồ trắng. Xem DECISIONS 2026-09-14.

export const GAME_MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

// Dự phòng khi style chính không tải được (mạng chặn, dịch vụ tạm lỗi).
export const FALLBACK_MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution: OSM_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
      paint: { "raster-saturation": -0.45, "raster-contrast": -0.08 },
    },
  ],
};
