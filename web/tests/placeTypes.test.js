// Loại địa điểm — giữ cho "Chỗ quen gọi" (NOTE-15, 21/9) không rò ra trang chủ và không kéo
// theo bộ câu hỏi dành cho hàng quán.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PLACE_TYPES,
  BROWSABLE_PLACE_TYPES,
  placeTypeAsksStatus,
  isValidPlaceType,
  getPlaceTypeLabel,
} from "../lib/placeTypes.js";
import { getQuestionsForType } from "../lib/questions.js";

test("trang chủ vẫn đúng 4 tab Ăn · Chơi · Ngủ · Đi lại", () => {
  assert.deepEqual(
    BROWSABLE_PLACE_TYPES.map((t) => t.label),
    ["Ăn", "Chơi", "Ngủ", "Đi lại"]
  );
});

test("danh bạ có 5 loại, loại thứ 5 lưu được", () => {
  assert.equal(PLACE_TYPES.length, 5);
  assert.equal(isValidPlaceType("moc"), true);
  assert.equal(getPlaceTypeLabel("moc"), "Chỗ quen gọi");
});

test("Chỗ quen gọi không bị hỏi câu nào", () => {
  // Một cái dốc không mở cũng không đóng, không có chỗ gửi xe. Phần lớn câu trong
  // lib/questions.js là scope "all" nên mặc định sẽ hỏi hết — chặn ở getQuestionsForType.
  assert.equal(placeTypeAsksStatus("moc"), false);
  assert.equal(getQuestionsForType("moc").length, 0);
});

test("4 loại cũ vẫn hỏi y như trước", () => {
  for (const type of ["an", "choi", "ngu", "dilai"]) {
    assert.equal(placeTypeAsksStatus(type), true, type);
    assert.ok(getQuestionsForType(type).length > 0, type);
  }
});
