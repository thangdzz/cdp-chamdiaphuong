// Nguyên tắc cốt lõi: "CDP xác định điểm, Google chỉ tính đường." Ghim đã có người xác nhận
// phải THẮNG chuỗi chữ ghép từ tên + phường, vì chuỗi chữ ở Việt Nam hay bị Google gán sang
// số nhà khác cùng đường.

import { test } from "node:test";
import assert from "node:assert/strict";
import { stopRouteTarget, stopMapsQuery } from "../lib/mapsUrl.js";

const ghim = { lat: 21.82796, lng: 105.20024, source: "user_pin", confirmed: true };

test("đề xuất đã ghim thì dẫn bằng toạ độ", () => {
  const stop = {
    type: "proposed_place",
    proposal: { name: "Quán bún cô Hoa", address: "1 ngõ 63 Lê Duẩn" },
    coordinates: ghim,
  };
  assert.ok(stopRouteTarget(stop));
  assert.equal(stopMapsQuery(stop), "21.82796,105.20024");
});

test("đề xuất chưa ghim thì vẫn tra theo chữ như cũ", () => {
  const stop = {
    type: "proposed_place",
    proposal: { name: "Quán bún cô Hoa", address: "1 ngõ 63 Lê Duẩn" },
    coordinates: null,
  };
  assert.equal(stopRouteTarget(stop), null);
  // Đề xuất chỉ nhận chỗ trong vùng CDP nên được phép nối tỉnh vào.
  assert.match(stopMapsQuery(stop), /Tuyên Quang$/);
});

test("điểm riêng chọn từ Google giữ nguyên Place ID", () => {
  const stop = {
    type: "custom_stop",
    customTitle: "Nhà Tuấn",
    customProvince: "Tuyên Quang",
    coordinates: { lat: 21.8, lng: 105.2, source: "google_place", confirmed: true },
    googlePlaceId: "ChIJabc123",
  };
  assert.equal(stopRouteTarget(stop).placeId, "ChIJabc123");
});

test("điểm riêng gõ tay chưa ghim thì không dẫn đường", () => {
  const stop = { type: "custom_stop", customTitle: "Nhà Tuấn", customProvince: "Tuyên Quang" };
  assert.equal(stopRouteTarget(stop), null);
});
