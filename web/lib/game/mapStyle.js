// Nền bản đồ cho game layer: MapLibre + dữ liệu OpenStreetMap (NOTE-04 §6). Gom về một chỗ để
// đổi nhà cung cấp tile/màu chỉ phải sửa file này.
//
// Nguồn: OpenFreeMap (vector tile dựng lại từ OSM khoảng mỗi tuần, miễn phí, không key, cho dùng
// thương mại). KHÔNG dùng thẳng tile.openstreetmap.org làm nguồn chính: chính sách OSM không cho
// app lưu lượng lớn, và test 14/9/2026 thấy DNS mạng gia đình ở VN chặn domain đó. Xem DECISIONS.
//
// Style gốc "liberty" đủ lớp (nước, công viên, POI) nhưng màu kiểu OSM và nhãn ưu tiên tên tiếng
// Anh (`name_en` trước `name`) — nên "Tan Trao Road" thay vì "Đường Tân Trào". toGameStyle()
// chỉnh lại lúc tải: tên địa phương trước, nền sáng, đường trắng viền xám, nước xanh nhẹ, POI
// tiết chế — gần cảm giác Google Maps để marker mô hình nổi lên (DECISIONS 2026-09-15).

export const GAME_MAP_BASE_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

export const OSM_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>';

const PALETTE = {
  land: "#f5f3ef",
  residential: "rgba(236, 233, 227, 0.6)",
  park: "#d5ebce",
  wood: "#cfe6c6",
  water: "#aad3f0",
  waterLabel: "#4f7fae",
  roadFill: "#ffffff",
  roadCasing: "#dcdcd8",
  majorCasing: "#cfcfca",
  motorwayFill: "#fce8a8",
  motorwayCasing: "#e5c77a",
  path: "#ffffff",
  rail: "#c9c9c4",
  building: "#e9e6e0",
  buildingOutline: "#dcd8d0",
  hospital: "#f7e3e1",
  school: "#f1eee2",
  boundary: "#c4c0b8",
  label: "#5f6368",
  labelStrong: "#3c4043",
  halo: "#ffffff",
  poi: "#80868b",
};

// Tên địa phương (tiếng Việt) trước, không có mới dùng tên tiếng Anh.
const LOCAL_NAME = ["coalesce", ["get", "name"], ["get", "name_en"]];

// Lớp bỏ hẳn: nền địa hình zoom thấp, nhà 3D, mũi tên một chiều, POI hạng thấp (quá dày ở phố).
const DROP_LAYERS = new Set([
  "natural_earth",
  "building-3d",
  "road_one_way_arrow",
  "road_one_way_arrow_opposite",
  "poi_r20",
  "poi_r7",
  "park_outline",
]);

function setPaint(layer, values) {
  layer.paint = { ...(layer.paint ?? {}), ...values };
}

function recolor(layer) {
  const id = layer.id;
  const t = layer.type;

  if (id === "background") return setPaint(layer, { "background-color": PALETTE.land });
  if (id === "park") return setPaint(layer, { "fill-color": PALETTE.park, "fill-outline-color": PALETTE.park });
  if (id === "landcover_wood" || id === "landcover_grass" || id === "landuse_pitch") {
    return setPaint(layer, { "fill-color": PALETTE.wood, "fill-opacity": 0.8 });
  }
  if (id === "landuse_residential") return setPaint(layer, { "fill-color": PALETTE.residential });
  if (id === "landuse_hospital") return setPaint(layer, { "fill-color": PALETTE.hospital });
  if (id === "landuse_school") return setPaint(layer, { "fill-color": PALETTE.school });
  if (id === "water") return setPaint(layer, { "fill-color": PALETTE.water });
  if (id.startsWith("waterway") && t === "line") return setPaint(layer, { "line-color": PALETTE.water });
  if (id === "building") {
    return setPaint(layer, { "fill-color": PALETTE.building, "fill-outline-color": PALETTE.buildingOutline });
  }
  if (id.startsWith("boundary")) return setPaint(layer, { "line-color": PALETTE.boundary });

  if (t === "line" && /^(road|bridge|tunnel)_/.test(id)) {
    if (/rail/.test(id)) return setPaint(layer, { "line-color": PALETTE.rail });
    if (/motorway/.test(id)) {
      return setPaint(layer, { "line-color": /casing/.test(id) ? PALETTE.motorwayCasing : PALETTE.motorwayFill });
    }
    if (/casing/.test(id)) {
      return setPaint(layer, {
        "line-color": /trunk_primary|secondary_tertiary|link/.test(id) ? PALETTE.majorCasing : PALETTE.roadCasing,
      });
    }
    return setPaint(layer, { "line-color": /path_pedestrian/.test(id) ? PALETTE.path : PALETTE.roadFill });
  }
}

function relabel(layer) {
  if (layer.type !== "symbol" || !layer.layout?.["text-field"]) return;
  // Biển số đường (QL37...) giữ nguyên `ref`.
  if (!/shield/.test(layer.id)) layer.layout["text-field"] = LOCAL_NAME;

  if (layer.id.startsWith("water") || layer.id.startsWith("waterway")) {
    setPaint(layer, { "text-color": PALETTE.waterLabel, "text-halo-color": PALETTE.halo });
  } else if (layer.id.startsWith("poi") || layer.id === "airport") {
    setPaint(layer, { "text-color": PALETTE.poi, "text-halo-color": PALETTE.halo, "icon-opacity": 0.7 });
  } else if (layer.id.startsWith("label_")) {
    setPaint(layer, { "text-color": PALETTE.labelStrong, "text-halo-color": PALETTE.halo });
  } else if (!/shield/.test(layer.id)) {
    setPaint(layer, { "text-color": PALETTE.label, "text-halo-color": PALETTE.halo, "text-halo-width": 1.2 });
  }
}

/** Nhận style JSON "liberty" gốc, trả bản đã chỉnh. Không mutate đầu vào. */
export function toGameStyle(baseStyle) {
  const style = structuredClone(baseStyle);
  style.layers = style.layers.filter((layer) => !DROP_LAYERS.has(layer.id));
  if (style.sources?.ne2_shaded) delete style.sources.ne2_shaded;
  for (const layer of style.layers) {
    recolor(layer);
    relabel(layer);
    // POI hạng cao vẫn chỉ hiện khi đã zoom sát phố — để marker mô hình là thứ nổi nhất.
    if (layer.id === "poi_r1") layer.minzoom = Math.max(layer.minzoom ?? 0, 16);
  }
  return style;
}

let baseStylePromise = null;

// Dùng chung cho mọi bản đồ trên trang (bản đồ chính + bản đồ chọn vị trí): tải style một lần.
export function loadGameMapStyle() {
  baseStylePromise ??= fetch(GAME_MAP_BASE_STYLE_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`style ${response.status}`);
      return response.json();
    })
    .then(toGameStyle)
    .catch((error) => {
      baseStylePromise = null; // lần mở sau thử lại
      throw error;
    });
  return baseStylePromise;
}

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
  layers: [{ id: "osm", type: "raster", source: "osm", paint: { "raster-saturation": -0.3 } }],
};
