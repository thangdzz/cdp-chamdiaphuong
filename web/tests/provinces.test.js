// Đoán tỉnh/thành từ địa chỉ Google trả về (NOTE-15 §2). Đoán sai còn tệ hơn không đoán:
// gắn nhầm tỉnh là Google dẫn khách đi một nơi khác hẳn.

import { test } from "node:test";
import assert from "node:assert/strict";
import { provinceFromAddress } from "../lib/provinces.js";

test("đọc được tỉnh từ địa chỉ Google", () => {
  assert.equal(provinceFromAddress("12 Lê Duẩn, Minh Xuân, Tuyên Quang, Việt Nam"), "Tuyên Quang");
  assert.equal(provinceFromAddress("31 Hàng Bún, Ba Đình, Hà Nội, Việt Nam"), "Hà Nội");
});

test("địa chỉ không dấu vẫn đọc được", () => {
  assert.equal(provinceFromAddress("123 Nguyen Trai, Tuyen Quang"), "Tuyên Quang");
});

test("tên tỉnh CŨ thì để trống, không đoán", () => {
  // Hà Nam đã sáp nhập vào Ninh Bình 01/7/2025. Có tỉnh cũ bị chia về nhiều nơi nên đoán là
  // đoán sai — để khách tự chọn.
  assert.equal(provinceFromAddress("Phủ Lý, Hà Nam, Việt Nam"), null);
});

test("không nhận ra gì thì trả null, không rơi về Tuyên Quang", () => {
  assert.equal(provinceFromAddress("Somewhere else"), null);
  assert.equal(provinceFromAddress(""), null);
  assert.equal(provinceFromAddress(null), null);
});
