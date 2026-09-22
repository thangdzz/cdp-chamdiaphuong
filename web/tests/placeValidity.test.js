// Chỗ tạm theo dịp (NOTE-15 §13). Ca đáng giá nhất ở đây là MÚI GIỜ: máy chủ Vercel chạy giờ
// UTC, nên 23h tối ngày cuối ở Tuyên Quang rất dễ bị tính thành đã hết hạn — đúng lúc lễ hội
// đông nhất. Test này giữ cho lỗi đó không quay lại.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  placeValidity,
  placeValidityLabel,
  isPlaceExpired,
  PLACE_VALIDITY,
} from "../lib/placeValidity.js";

const baiXeLeHoi = { temporary: true, validFrom: "2026-09-19", validUntil: "2026-09-25" };
const at = (iso) => Date.parse(iso);

test("chỗ thường trực không có hạn", () => {
  assert.equal(placeValidity({ name: "Phở Vinh" }).status, PLACE_VALIDITY.PERMANENT);
  assert.equal(placeValidityLabel({ name: "Phở Vinh" }), null);
});

test("trước ngày bắt đầu thì là sắp có", () => {
  assert.equal(placeValidity(baiXeLeHoi, at("2026-09-18T10:00:00+07:00")).status, PLACE_VALIDITY.UPCOMING);
});

test("trong kỳ thì đang có", () => {
  for (const moment of ["2026-09-19T00:05:00+07:00", "2026-09-22T20:00:00+07:00"]) {
    assert.equal(placeValidity(baiXeLeHoi, at(moment)).status, PLACE_VALIDITY.ACTIVE, moment);
  }
});

test("23h tối NGÀY CUỐI giờ Việt Nam vẫn còn hiệu lực", () => {
  // Lúc này ở giờ UTC đã là 16h ngày 25 — so thô theo ngày UTC vẫn đúng, nhưng 23h30 thì UTC
  // đã sang 16h30 ngày 25 vẫn ổn; ca vỡ thật là nếu ai đó cắt hạn ở 00:00 ngày cuối.
  assert.equal(placeValidity(baiXeLeHoi, at("2026-09-25T23:00:00+07:00")).status, PLACE_VALIDITY.ACTIVE);
  assert.equal(placeValidity(baiXeLeHoi, at("2026-09-25T23:59:58+07:00")).status, PLACE_VALIDITY.ACTIVE);
});

test("sang ngày hôm sau thì hết", () => {
  assert.equal(placeValidity(baiXeLeHoi, at("2026-09-26T00:30:00+07:00")).status, PLACE_VALIDITY.EXPIRED);
  assert.equal(isPlaceExpired(baiXeLeHoi, at("2026-09-26T00:30:00+07:00")), true);
});

test("đánh dấu tạm mà quên điền ngày thì coi như thường trực", () => {
  // Thà hiện thừa một chỗ còn hơn ẩn mất một chỗ có thật vì admin bỏ trống ô.
  assert.equal(
    placeValidity({ temporary: true, validFrom: null, validUntil: null }).status,
    PLACE_VALIDITY.PERMANENT
  );
});

test("ngày gõ sai khuôn thì không ẩn oan", () => {
  assert.equal(placeValidity({ temporary: true, validUntil: "25/09/2026" }).status, PLACE_VALIDITY.PERMANENT);
});

test("nhãn viết theo lối người ta nói", () => {
  assert.equal(placeValidityLabel(baiXeLeHoi, at("2026-09-22T20:00:00+07:00")), "Chỗ tạm — chỉ có tới 25/9");
  assert.equal(placeValidityLabel(baiXeLeHoi, at("2026-09-18T10:00:00+07:00")), "Chỗ tạm — có từ 19/9 đến 25/9");
  assert.equal(placeValidityLabel(baiXeLeHoi, at("2026-09-27T10:00:00+07:00")), "Chỗ tạm — đã hết ngày 25/9");
});
