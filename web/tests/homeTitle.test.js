// A4: tiêu đề Trang chủ tối đa 60 ký tự, đếm theo ký tự NFC (SPEC-A4 §3.3, PM duyệt A4 §2: mặc định 25/60),
// và điều kiện hiện nội dung theo mùa của Trang chủ (A4-b).

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  HOME_TITLE_DEFAULT,
  HOME_TITLE_MAX,
  countHomeTitle,
  homeTitleServerError,
  normalizeHomeTitle,
  validateHomeTitle,
} from "../lib/homeTitle.js";
import { groupEvents } from "../lib/events.js";
import { FESTIVAL_EVENTS } from "../lib/postEvents/le-hoi-thanh-tuyen-2026.js";

test("tiêu đề mặc định đếm 25/60 (NFC), không phải 24", () => {
  assert.equal(HOME_TITLE_DEFAULT, "Hôm nay bạn muốn ghé đâu?");
  assert.equal(HOME_TITLE_MAX, 60);
  assert.equal(countHomeTitle(HOME_TITLE_DEFAULT), 25);
  const result = validateHomeTitle(HOME_TITLE_DEFAULT);
  assert.equal(result.ok, true);
  assert.equal(`${result.length}/${result.max}`, "25/60");
});

test("chữ Việt gõ kiểu tổ hợp (NFD) đếm bằng NFC và được lưu dạng NFC", () => {
  const nfd = HOME_TITLE_DEFAULT.normalize("NFD");
  assert.notEqual(nfd.length, HOME_TITLE_DEFAULT.length); // NFD thật sự dài hơn khi đếm thô
  assert.equal(countHomeTitle(nfd), 25);
  assert.equal(validateHomeTitle(nfd).text, HOME_TITLE_DEFAULT);
  assert.equal(validateHomeTitle(nfd).text.normalize("NFC"), validateHomeTitle(nfd).text);
});

test("đúng 60 ký tự có dấu: lưu được; 61: bị chặn và báo thừa 1", () => {
  const sixty = "Ở".repeat(30) + "ệ".repeat(30);
  assert.equal(countHomeTitle(sixty), 60);
  assert.equal(validateHomeTitle(sixty).ok, true);
  assert.equal(validateHomeTitle(sixty.normalize("NFD")).ok, true);

  const r61 = validateHomeTitle(sixty + "a");
  assert.equal(r61.ok, false);
  assert.equal(r61.length, 61);
  assert.equal(r61.over, 1);
  assert.equal(r61.message, "Quá 1 ký tự — rút gọn để lưu được.");
});

test("dán 80 ký tự: không cắt, báo đúng 80 và thừa 20", () => {
  const eighty = "Đặc sản Tuyên Quang ".repeat(4).trim() + "!";
  assert.equal([...eighty].length, 80);
  const result = validateHomeTitle(eighty);
  assert.equal(result.length, 80);
  assert.equal(result.text, eighty); // nội dung giữ nguyên, không bị cắt ngắn
  assert.equal(result.ok, false);
  assert.equal(result.over, 20);
  assert.equal(result.message, "Quá 20 ký tự — rút gọn để lưu được.");
});

test("khoảng trắng thừa và ký tự điều khiển không tính", () => {
  assert.equal(normalizeHomeTitle("  Hôm   nay  bạn  "), "Hôm nay bạn");
  assert.equal(countHomeTitle("  Hôm   nay  bạn  "), 11);
  // Giống hệt cleanText() lúc lưu (lib/navigation.js): ký tự điều khiển (kể cả tab/xuống dòng) bị bỏ TRƯỚC khi gộp
  // khoảng trắng — nên con số đếm khớp đúng chuỗi được lưu.
  assert.equal(normalizeHomeTitle("A\u0007B"), "AB");
  assert.equal(normalizeHomeTitle("Hôm nay\tbạn"), "Hôm naybạn");
});

test("chuỗi rỗng / chỉ khoảng trắng / không phải chuỗi: bị chặn", () => {
  for (const value of ["", "   ", null, undefined, 42]) {
    const result = validateHomeTitle(value);
    assert.equal(result.ok, false);
    assert.equal(result.length, 0);
    assert.equal(result.message, "Tiêu đề trang chủ không được để trống.");
  }
});

test("câu báo lỗi máy chủ nêu số ký tự và nói cấu hình cũ chưa đổi", () => {
  assert.equal(
    homeTitleServerError(73),
    "Tiêu đề trang chủ đang có 73 ký tự, tối đa 60. Cấu hình cũ chưa bị thay đổi."
  );
});

// A4-b: Trang chủ chỉ hiện nội dung theo mùa khi còn hiệu lực (DESIGN §7). page.js hiện card khi
// groupEvents(...).next có giá trị — test đúng điều kiện đó với lịch lễ hội thật và thời điểm giả lập.

const seasonActive = (iso) => Boolean(groupEvents(FESTIVAL_EVENTS, Date.parse(iso)).next);

test("theo mùa: trước và trong lễ hội → hiện; sau lễ hội → ẩn", () => {
  assert.equal(seasonActive("2026-09-10T09:00:00+07:00"), true); // trước 20/9: còn mốc sắp tới
  assert.equal(seasonActive("2026-09-20T20:00:00+07:00"), true); // đang diễn ra
  assert.equal(seasonActive("2026-09-28T09:00:00+07:00"), false); // sau 27/9: hết mốc
  assert.equal(seasonActive("2026-11-13T09:00:00+07:00"), false); // hôm nay (13/11)
});
