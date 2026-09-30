// Ô SĐT nhiều số (owner test 30/9): mỗi số một tel: riêng, không bao giờ nối các số lại.
// Các ca lấy đúng cách viết đang có trong places:live (quét 30/9).

import { test } from "node:test";
import assert from "node:assert/strict";
import { splitPhoneNumbers, telHref } from "../lib/phone.js";

const tels = (raw) => splitPhoneNumbers(raw).map((n) => n.tel);

test("1 số: giữ nguyên, tel chỉ gồm chữ số", () => {
  assert.deepEqual(splitPhoneNumbers("0946622262"), [{ display: "0946622262", tel: "0946622262" }]);
  assert.deepEqual(splitPhoneNumbers("0946 622 262"), [{ display: "0946 622 262", tel: "0946622262" }]);
  assert.equal(telHref(splitPhoneNumbers("0946 622 262")[0]), "tel:0946622262");
});

test('2 số cách nhau " - " thành 2 số — không ra 03930835960356569627', () => {
  const numbers = splitPhoneNumbers("0393 083 596 - 0356 569 627");
  assert.deepEqual(numbers, [
    { display: "0393 083 596", tel: "0393083596" },
    { display: "0356 569 627", tel: "0356569627" },
  ]);
  assert.ok(!numbers.some((n) => n.tel.includes("03930835960356569627")));
});

test('nhiều số cách nhau " / " (có ô 3 số)', () => {
  assert.deepEqual(tels("0333770088 / 0973801000"), ["0333770088", "0973801000"]);
  assert.deepEqual(tels("0207 3827 999 / 0911 386 186 / 0974 591 999"), ["02073827999", "0911386186", "0974591999"]);
  assert.deepEqual(tels("0207 3811651 / 0978 326999"), ["02073811651", "0978326999"]);
});

test("cách viết khác trong một số: dấu chấm, +84, số tổng đài ngắn", () => {
  assert.deepEqual(tels("0207.3.898.898"), ["02073898898"]);
  assert.deepEqual(tels("+84 38 932 1995"), ["+84389321995"]);
  assert.deepEqual(tels("+84965161315"), ["+84965161315"]);
  assert.deepEqual(tels("1055"), ["1055"]);
  assert.deepEqual(tels("1900 2088"), ["19002088"]);
  assert.deepEqual(tels("0207 381 3888"), ["02073813888"]);
});

test("dấu ngăn chưa gặp nhưng đỡ sẵn: , ; xuống dòng, hoặc, dính liền", () => {
  assert.deepEqual(tels("0393083596, 0356569627"), ["0393083596", "0356569627"]);
  assert.deepEqual(tels("0393083596;0356569627"), ["0393083596", "0356569627"]);
  assert.deepEqual(tels("0393083596\n0356569627"), ["0393083596", "0356569627"]);
  assert.deepEqual(tels("0393083596 hoặc 0356569627"), ["0393083596", "0356569627"]);
  assert.deepEqual(tels("0393083596-0356569627"), ["0393083596", "0356569627"]);
  assert.deepEqual(tels("0393083596 0356569627"), ["0393083596", "0356569627"]);
});

test("ô trống / rác không ra số nào; số trùng chỉ giữ một", () => {
  assert.deepEqual(tels(null), []);
  assert.deepEqual(tels(""), []);
  assert.deepEqual(tels(" - "), []);
  assert.deepEqual(tels("0946622262 / 0946 622 262"), ["0946622262"]);
});
