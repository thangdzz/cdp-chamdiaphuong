// Bộ lọc dùng chung cho trang chủ cũ và trang kết quả /tim (vNext bước 1): hai nơi phải lọc
// giống hệt nhau, và "Chỗ quen gọi" không bao giờ lọt vào danh sách để đi ăn/chơi/ngủ.

import { test } from "node:test";
import assert from "node:assert/strict";
import { filterPlaces, matchesPriceBucket, wardsOf, sortByReliability, groupByBrowsableType } from "../lib/placeFilter.js";
import { formatCheckinAge, formatShortAddress } from "../lib/placeDisplay.js";

const places = [
  { id: "a1", type: "an", name: "Phở Vinh", address: "5 Tân Trào", ward: "Minh Xuân", priceMin: 40000, priceMax: 60000 },
  { id: "a2", type: "an", name: "Cà phê Gió", address: "9 Lê Duẩn", ward: "Phan Thiết" },
  { id: "n1", type: "ngu", name: "Khách sạn Sông Lô", ward: "Minh Xuân", priceMin: 600000, priceMax: 900000 },
  { id: "c1", type: "choi", name: "Quảng trường", ward: "Tân Quang" },
  { id: "m1", type: "moc", name: "Đỉnh dốc Bà The", ward: "Minh Xuân" },
];
const ids = (list) => list.map((p) => p.id);

test("không lọc gì: đủ 4 nhóm, bỏ Chỗ quen gọi", () => {
  assert.deepEqual(ids(filterPlaces(places)), ["a1", "a2", "n1", "c1"]);
});

test("lọc theo nhóm", () => {
  assert.deepEqual(ids(filterPlaces(places, { type: "an" })), ["a1", "a2"]);
  assert.deepEqual(ids(filterPlaces(places, { type: "all" })), ["a1", "a2", "n1", "c1"]);
});

test("tìm theo tên, địa chỉ, không dấu và từ đồng nghĩa", () => {
  assert.deepEqual(ids(filterPlaces(places, { search: "pho vinh" })), ["a1"]);
  assert.deepEqual(ids(filterPlaces(places, { search: "Lê Duẩn" })), ["a2"]);
  assert.deepEqual(ids(filterPlaces(places, { search: "coffee" })), ["a2"]);
  assert.deepEqual(ids(filterPlaces(places, { search: "Bà The" })), []); // mốc không lên danh sách
});

test("lọc khu vực + giá cùng lúc", () => {
  assert.deepEqual(ids(filterPlaces(places, { ward: "Minh Xuân", priceBucket: "500k-1tr" })), ["n1"]);
});

test("mã giá lạ trên URL không làm rỗng danh sách", () => {
  assert.equal(matchesPriceBucket(places[0], "khong-co"), true);
  assert.equal(matchesPriceBucket(places[1], "duoi-100k"), false); // chưa có giá thì không khớp mức giá nào
});

test("danh sách khu vực không trùng, có thứ tự", () => {
  assert.deepEqual(wardsOf(places), ["Minh Xuân", "Phan Thiết", "Tân Quang"]);
});

test("sắp xếp không đổi mảng gốc; chia nhóm đúng thứ tự Ăn · Chơi · Ngủ · Đi lại", () => {
  const copy = [...places];
  sortByReliability(places);
  assert.deepEqual(places, copy);
  assert.deepEqual(groupByBrowsableType(filterPlaces(places)).map((g) => g.type.id), ["an", "choi", "ngu", "dilai"]);
});

test("địa chỉ rút gọn bỏ phần phường/thành phố", () => {
  assert.equal(formatShortAddress("12 Trần Phú, Phường Minh Xuân, TP Tuyên Quang"), "12 Trần Phú");
  assert.equal(formatShortAddress("Phường Minh Xuân"), "Phường Minh Xuân");
});

test("dòng xác nhận còn mở theo tuổi", () => {
  const now = Date.parse("2026-09-29T12:00:00+07:00");
  const daysAgo = (d) => new Date(now - d * 86400000).toISOString();
  assert.equal(formatCheckinAge(daysAgo(0), now).text, "Còn mở · xác nhận hôm nay");
  assert.equal(formatCheckinAge(daysAgo(10), now).text, "Còn mở · xác nhận 2 tuần trước");
  assert.equal(formatCheckinAge(daysAgo(40), now).tone, "muted");
  assert.equal(formatCheckinAge(daysAgo(120), now), null);
  assert.equal(formatCheckinAge(null, now), null);
});

// --- Trang kết quả /tim: URL <-> bộ lọc, bản gọn của địa điểm -------------------------------
import { filtersFromParams, paramsFromFilters, toResultItem } from "../lib/searchResults.js";

test("URL /tim đọc đúng bộ lọc, giá trị lạ bị bỏ qua", () => {
  assert.deepEqual(filtersFromParams({ q: "phở", loai: "an", gia: "duoi-100k", khu: "Minh Xuân" }), {
    search: "phở", type: "an", priceBucket: "duoi-100k", ward: "Minh Xuân",
  });
  assert.deepEqual(filtersFromParams({ loai: "moc", gia: "re" }), { search: "", type: "all", priceBucket: "all", ward: "all" });
  assert.equal(filtersFromParams({ q: ["a", "b"] }).search, "a");
});

test("bộ lọc ghi ngược ra URL, bỏ tiêu chí 'tất cả', đi hai chiều không mất gì", () => {
  assert.equal(paramsFromFilters({ search: " cafe ", type: "an" }), "q=cafe&loai=an");
  assert.equal(paramsFromFilters({}), "");
  const f = { search: "phở bò", type: "ngu", ward: "Phan Thiết", priceBucket: "tren-1tr" };
  assert.deepEqual(filtersFromParams(Object.fromEntries(new URLSearchParams(paramsFromFilters(f)))), f);
});

test("bản gọn giữ đủ trường để lọc và không mang ảnh/câu trả lời xuống trình duyệt", () => {
  const item = toResultItem({
    ...places[0], localArea: "Chợ Tam Cờ", searchAliases: ["phở cụ Vinh"], photos: [{ url: "x" }], consensus: { a: 1 },
  });
  assert.equal(item.typeLabel, "Ăn");
  assert.equal(item.priceCompact, "40–60k");
  assert.equal(item.photos, undefined);
  assert.equal(item.consensus, undefined);
  assert.deepEqual(filterPlaces([item], { search: "cụ vinh" }).length, 1);
  assert.ok(item.mapHref.startsWith("https://www.google.com/maps/"));
});
