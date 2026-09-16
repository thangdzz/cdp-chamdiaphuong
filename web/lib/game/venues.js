// Điểm tổ chức của một Event (quảng trường, tuyến phố đi bộ...) — lớp nền cố định trên Map Layer,
// khác object/sighting (không sưu tầm, không di chuyển). Thuần, client dùng được.
// venue: { id, kind: "area" | "route", name, shortName, icon, dashed?, coordinates: [[lng, lat], ...] }
// `dashed` chỉ dùng cho tuyến: vẽ NÉT ĐỨT thay vì nét liền (tuyến đoàn đi qua, không phải chỗ đứng).

export function venueFeatureCollection(venues = []) {
  return {
    type: "FeatureCollection",
    features: venues
      .filter((venue) => Array.isArray(venue.coordinates) && venue.coordinates.length > 1)
      .map((venue) => ({
        type: "Feature",
        id: venue.id,
        properties: { id: venue.id, kind: venue.kind, dashed: venue.dashed === true },
        geometry:
          venue.kind === "area"
            ? { type: "Polygon", coordinates: [venue.coordinates] }
            : { type: "LineString", coordinates: venue.coordinates },
      })),
  };
}

// Chỗ đặt nhãn: tâm (trung bình các đỉnh) cho vùng, điểm giữa theo chiều dài cho tuyến.
export function venueLabelPoint(venue) {
  const coords = venue.coordinates ?? [];
  if (coords.length === 0) return null;
  if (venue.kind === "area") {
    const ring = coords.length > 1 && coords[0][0] === coords.at(-1)[0] && coords[0][1] === coords.at(-1)[1]
      ? coords.slice(0, -1)
      : coords;
    const sum = ring.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
    return { lng: sum[0] / ring.length, lat: sum[1] / ring.length };
  }
  const segments = coords.slice(1).map((point, i) => {
    const [lng1, lat1] = coords[i];
    return { from: coords[i], to: point, length: Math.hypot(point[0] - lng1, point[1] - lat1) };
  });
  let remaining = segments.reduce((total, s) => total + s.length, 0) / 2;
  for (const segment of segments) {
    if (remaining <= segment.length) {
      const t = segment.length === 0 ? 0 : remaining / segment.length;
      return {
        lng: segment.from[0] + (segment.to[0] - segment.from[0]) * t,
        lat: segment.from[1] + (segment.to[1] - segment.from[1]) * t,
      };
    }
    remaining -= segment.length;
  }
  const [lng, lat] = coords.at(-1);
  return { lng, lat };
}

// Khung bao mọi điểm tổ chức [[minLng, minLat], [maxLng, maxLat]] — để bản đồ mở ra thấy đủ.
export function venueBounds(venues = []) {
  const points = venues.flatMap((venue) => venue.coordinates ?? []);
  if (points.length === 0) return null;
  const lngs = points.map(([lng]) => lng);
  const lats = points.map(([, lat]) => lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}
