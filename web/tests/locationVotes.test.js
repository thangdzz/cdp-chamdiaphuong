// Cộng đồng xác nhận vị trí (NOTE-15 §8). Luật quan trọng nhất: hai cụm BẰNG NHAU thì KHÔNG tự
// chọn — đẩy sang admin. Tự chọn bừa là CDP tự tay khẳng định một vị trí chưa ai chắc.

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  distanceMeters,
  computeLocationConsensus,
  LOCATION_CONSENSUS_RADIUS_METERS,
} from "../lib/locationVotes.js";

// ~11m mỗi 0.0001 độ vĩ. Dùng để đặt phiếu gần/xa nhau một cách có chủ ý.
const goc = { lat: 21.8233, lng: 105.2142 };
const lech = (met) => ({ lat: goc.lat + met / 111320, lng: goc.lng });
const phieu = (ai, diem, luc) => ({ anonId: ai, lat: diem.lat, lng: diem.lng, at: luc });

test("đo khoảng cách sát thực tế", () => {
  assert.ok(Math.abs(distanceMeters(goc, lech(100)) - 100) < 2);
});

test("chưa ai bỏ phiếu thì không có kết luận", () => {
  assert.equal(computeLocationConsensus([]), null);
});

test("một người ghim thì chưa đủ", () => {
  const kq = computeLocationConsensus([phieu("a", goc, 1)]);
  assert.equal(kq.status, "pending");
  assert.equal(kq.voters, 1);
});

test("hai người ghim gần nhau thì tính là đã xác nhận", () => {
  const kq = computeLocationConsensus([phieu("a", goc, 1), phieu("b", lech(20), 2)]);
  assert.equal(kq.status, "community_verified");
  assert.equal(kq.voters, 2);
  assert.equal(kq.conflict, false);
});

test(`xa quá ${LOCATION_CONSENSUS_RADIUS_METERS}m thì là hai chỗ khác nhau`, () => {
  const kq = computeLocationConsensus([phieu("a", goc, 1), phieu("b", lech(200), 2)]);
  assert.equal(kq.status, "pending");
  assert.equal(kq.voters, 1);
});

test("HAI CỤM BẰNG NHAU thì không tự chọn, đẩy sang admin", () => {
  const kq = computeLocationConsensus([
    phieu("a", goc, 1),
    phieu("b", lech(10), 2),
    phieu("c", lech(300), 3),
    phieu("d", lech(310), 4),
  ]);
  assert.equal(kq.status, "conflict");
  assert.equal(kq.conflict, true);
});

test("đa số rõ ràng thì chọn, nhưng vẫn bật cờ cho admin xem lại", () => {
  const kq = computeLocationConsensus([
    phieu("a", goc, 1),
    phieu("b", lech(10), 2),
    phieu("c", lech(15), 3),
    phieu("d", lech(300), 4),
    phieu("e", lech(310), 5),
  ]);
  assert.equal(kq.status, "community_verified");
  assert.equal(kq.voters, 3);
  assert.equal(kq.conflict, true);
});
