// Xếp hạng tìm kiếm /tim (owner test 30/9). Ca gốc: tìm "Phở" ra "Xe ghép Anh Huy" đầu tiên vì
// địa chỉ nó có "… nội thành phố" — "phố" bỏ dấu cũng là "pho".

import { test } from "node:test";
import assert from "node:assert/strict";
import { rankBySearch, relevanceScore, parseQuery } from "../lib/placeRank.js";
import { filterPlaces } from "../lib/placeFilter.js";

// Thứ tự đầu vào = thứ tự độ tin cậy (đáng tin nhất trước), đúng như /tim đưa vào.
const places = [
  { id: "xe", type: "dilai", name: "Xe ghép Anh Huy", address: "Đón trả tận nơi nội thành phố Tuyên Quang", ward: "Minh Xuân" },
  { id: "bbq", type: "an", name: "Min-Max BBQ", address: "12 đường 17/8, Thành phố Tuyên Quang" },
  { id: "pho10", type: "an", name: "Phở 10", address: "18 Tân Trào, Minh Xuân" },
  { id: "phohung", type: "an", name: "Phở Hùng", address: "5 Quang Trung" },
  { id: "phobo", type: "an", name: "Quán Phở bò Nam Định", address: "20 Lê Duẩn" },
  { id: "com", type: "an", name: "Cơm Bình Dân 79", address: "Phố Chiêm Hoá", signatureDishes: ["phở trộn"] },
  { id: "cafe", type: "an", name: "Feline Café", address: "9 Lê Duẩn" },
  { id: "ks", type: "ngu", name: "Khách sạn Lô Giang", address: "Phố Lê Lợi" },
  { id: "nghi", type: "ngu", name: "Nhà nghỉ Sông Lô", address: "Đường Lô Giang" },
];
const ids = (list) => list.map((p) => p.id);
const score = (id, q) => relevanceScore(places.find((p) => p.id === id), parseQuery(q));

test('"Phở": quán phở lên đầu, Xe ghép Anh Huy xuống cuối', () => {
  const result = ids(rankBySearch(places, "Phở"));
  assert.deepEqual(result.slice(0, 3), ["pho10", "phohung", "phobo"]);
  assert.ok(result.indexOf("xe") > result.indexOf("com"), "chỉ khớp 'phố' ở địa chỉ thì đứng sau món 'phở trộn'");
  // Ba chỗ chỉ khớp "phố"/"Thành phố" ở địa chỉ nằm dưới cùng, giữ thứ tự độ tin cậy.
  assert.deepEqual(result.slice(-3), ["xe", "bbq", "ks"]);
});

test('"Phở": khớp đúng dấu ở tên luôn trên khớp bỏ dấu ở địa chỉ', () => {
  assert.ok(score("phohung", "Phở") > score("xe", "Phở"));
  assert.ok(score("com", "Phở") > score("xe", "Phở")); // món đặc trưng (nhóm/thẻ) > địa chỉ chỉ khớp bỏ dấu
});

test('"pho" không dấu: vẫn đưa tên lên trên địa chỉ', () => {
  const result = ids(rankBySearch(places, "pho"));
  assert.deepEqual(result.slice(0, 3), ["pho10", "phohung", "phobo"]);
});

test("tên trùng khớp > tên bắt đầu bằng > tên chứa > nhóm > địa chỉ", () => {
  assert.ok(score("pho10", "Phở 10") > score("pho10", "Phở"));
  assert.ok(score("phohung", "Phở") > score("phobo", "Phở")); // bắt đầu bằng > chứa ở giữa
  assert.ok(score("phobo", "Phở") > score("com", "Phở")); // tên > món đặc trưng
});

test("không so chuỗi con giữa từ", () => {
  assert.equal(score("ks", "iang"), null); // "Giang" không khớp "iang"
  assert.equal(score("pho10", "ho"), null); // "Phở" không khớp "ho"
});

test("từ đồng nghĩa vẫn chạy: cafe / cà phê / coffee", () => {
  assert.deepEqual(ids(rankBySearch(places, "cafe")), ["cafe"]);
  assert.deepEqual(ids(rankBySearch(places, "coffee")), ["cafe"]);
});

test('"Lô Giang": chỗ tên có "Lô Giang" trước chỗ chỉ có ở địa chỉ', () => {
  assert.deepEqual(ids(rankBySearch(places, "Lô Giang")), ["ks", "nghi"]);
});

test("nhiều từ: mọi từ phải khớp, có thể ở các trường khác nhau", () => {
  assert.deepEqual(ids(rankBySearch(places, "phở Tân Trào")), ["pho10"]);
  assert.deepEqual(ids(rankBySearch(places, "phở Hà Nội")), []);
});

test("cùng hạng thì giữ thứ tự đầu vào (độ tin cậy)", () => {
  const both = [places[3], places[2]]; // Phở Hùng rồi Phở 10, cả hai "tên bắt đầu bằng"
  assert.deepEqual(ids(rankBySearch(both, "Phở")), ["phohung", "pho10"]);
});

test("ô tìm trống: không lọc, không đổi thứ tự", () => {
  assert.deepEqual(ids(rankBySearch(places, "  ")), ids(places));
});

test("filterPlaces dùng cùng cách xếp và vẫn bỏ Chỗ quen gọi", () => {
  const withMoc = [...places, { id: "moc", type: "moc", name: "Phở cụ đầu dốc" }];
  const result = ids(filterPlaces(withMoc, { search: "Phở", type: "an" }));
  assert.deepEqual(result.slice(0, 3), ["pho10", "phohung", "phobo"]);
  assert.ok(!result.includes("moc") && !result.includes("xe"));
});
