// "Đi bằng gì" của lộ trình (owner test 30/9): mỗi lựa chọn phải đổi thật `travelmode` gửi sang
// Google Maps; "Kết hợp" bỏ, lộ trình cũ đang lưu "hon-hop" vẫn đọc được.

import { test } from "node:test";
import assert from "node:assert/strict";
import { TRANSPORT_MODES, normalizeTransportMode, transportMapsMode, transportModeLabel } from "../lib/routes.js";
import { routeMapsUrl } from "../lib/mapsUrl.js";

test("mỗi phương tiện một travelmode khác nhau — không còn hai lựa chọn ra cùng một đường", () => {
  assert.deepEqual(TRANSPORT_MODES.map((m) => [m.id, m.mapsMode]), [
    ["xe-may", "two-wheeler"],
    ["o-to", "driving"],
    ["di-bo", "walking"],
  ]);
  assert.equal(new Set(TRANSPORT_MODES.map((m) => m.mapsMode)).size, TRANSPORT_MODES.length);
});

test('lộ trình cũ "Kết hợp" hoặc thiếu phương tiện → Xe máy, không lỗi', () => {
  assert.equal(normalizeTransportMode("hon-hop"), "xe-may");
  assert.equal(normalizeTransportMode(undefined), "xe-may");
  assert.equal(transportMapsMode("hon-hop"), "two-wheeler");
  assert.equal(transportModeLabel("hon-hop"), "Xe máy");
  assert.equal(transportMapsMode("di-bo"), "walking");
});

const point = (lat, lng) => ({ placeId: null, lat, lng, label: null });
const stops = [point(21.82, 105.21), point(21.823, 105.215), point(21.826, 105.22), point(21.83, 105.225)];

test("nhiều điểm dừng + xe máy: đủ điểm đầu, điểm giữa (waypoints), điểm cuối", () => {
  const { url, legs } = routeMapsUrl(stops, transportMapsMode("xe-may"));
  const q = new URL(url).searchParams;
  assert.equal(legs.length, 1);
  assert.equal(q.get("travelmode"), "two-wheeler");
  assert.equal(q.get("origin"), "21.82,105.21");
  assert.equal(q.get("destination"), "21.83,105.225");
  assert.equal(q.get("waypoints"), "21.823,105.215|21.826,105.22");
});

test("lộ trình dài hơn sức chứa một link: chia chặng nối đuôi, chặng nào cũng giữ đúng travelmode", () => {
  const many = Array.from({ length: 14 }, (_, i) => point(21.8 + i / 1000, 105.2));
  const { legs } = routeMapsUrl(many, transportMapsMode("o-to"));
  assert.equal(legs.length, 2);
  assert.deepEqual([legs[0].to, legs[1].from], [10, 10]); // điểm cuối chặng 1 = điểm đầu chặng 2
  for (const leg of legs) assert.equal(new URL(leg.url).searchParams.get("travelmode"), "driving");
});
