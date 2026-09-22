// Tên dân hay gọi (NOTE-15 §7) + cái bẫy "form thiếu ô thì xoá sạch dữ liệu cũ".

import { test } from "node:test";
import assert from "node:assert/strict";
import { placeSearchHaystack, normalizeForSearch, matchesSearchQuery } from "../lib/placeTextSearch.js";
import { placeFromFormData } from "../lib/placeForm.js";

const quan = {
  name: "Quán Cơm Bình Dân 79",
  address: "12 Trần Phú",
  ward: "Minh Xuân",
  searchAliases: ["cơm bà The", "đỉnh dốc Bà The"],
};
const timThay = (place, q) => matchesSearchQuery(placeSearchHaystack(place), normalizeForSearch(q).trim());

test("gõ tên dân gian ra đúng chỗ", () => {
  assert.equal(timThay(quan, "cơm bà The"), true);
  assert.equal(timThay(quan, "com ba the"), true); // không dấu
  assert.equal(timThay(quan, "đỉnh dốc"), true);
});

test("tên trên biển vẫn tìm được như cũ", () => {
  assert.equal(timThay(quan, "bình dân"), true);
  assert.equal(timThay({ name: "Phở Vinh" }, "pho vinh"), true);
});

test("không khớp thì không ra", () => {
  assert.equal(timThay(quan, "bún ốc"), false);
});

// FormData giả — chỉ cần 3 hàm mà placeFromFormData dùng tới.
function fakeForm(entries, coOSearchAliases = true) {
  const m = new Map(entries);
  return {
    get: (k) => m.get(k) ?? null,
    getAll: () => [],
    has: (k) => (k === "searchAliases" ? coOSearchAliases : m.has(k)),
  };
}
const base = [["name", "Quán Cơm Bình Dân 79"], ["type", "an"], ["address", "12 Trần Phú"]];

test("tách dấu phẩy, bỏ trùng, bỏ tên trùng chính nó", () => {
  const out = placeFromFormData(
    fakeForm([...base, ["searchAliases", "cơm bà The, cơm bà The , Quán Cơm Bình Dân 79, đầu dốc"]])
  );
  assert.deepEqual(out.searchAliases, ["cơm bà The", "đầu dốc"]);
});

test("FORM KHÔNG CÓ Ô ĐÓ thì không đụng tới alias đã lưu", () => {
  // Thẻ hàng chờ tự động không hiện ô này. Trả [] từ đó là mỗi lần admin duyệt một chỗ trong
  // hàng chờ sẽ xoá sạch tên dân gian đã gõ trước đó.
  const out = placeFromFormData(fakeForm(base, false));
  assert.equal("searchAliases" in out, false);
});

test("admin xoá trắng ô thì đúng là xoá hết", () => {
  assert.deepEqual(placeFromFormData(fakeForm([...base, ["searchAliases", ""]])).searchAliases, []);
});
