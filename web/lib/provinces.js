// Tỉnh/thành của ĐIỂM RIÊNG trong lộ trình (2026-09-11).
//
// Vì sao cần: khách từ tỉnh khác về Tuyên Quang chơi thì "Xuất phát tại nhà" nằm ở Hà Nội,
// Đà Nẵng... chứ không phải Tuyên Quang. Trước đó CDP tự gắn "Tuyên Quang" vào mọi chuỗi gửi
// Google — đúng với quán trong danh bạ (danh bạ chỉ có Tuyên Quang), SAI với nhà của khách:
// "31 Hàng Bún" thành "31 Hàng Bún, Tuyên Quang" và Google dẫn đi một nơi khác hẳn.
//
// 34 đơn vị hành chính cấp tỉnh theo sắp xếp có hiệu lực 01/7/2025 (28 tỉnh + 6 thành phố).
// Dùng TÊN MỚI: Google tra tên cũ (Hà Giang, Bắc Kạn, Vĩnh Phúc...) vẫn ra, nhưng tên mới là
// thứ khách đang thấy trên giấy tờ và biển báo.

import { stripDiacritics } from "./ingestion/normalize.js";

export const DEFAULT_PROVINCE = "Tuyên Quang";

// Tuyên Quang đứng đầu danh sách để người địa phương chọn nhanh, nhưng giao diện luôn bắt đầu
// ở lựa chọn trống: thứ tự thuận tiện không được biến thành một phán đoán về vị trí.
export const PROVINCES = [
  DEFAULT_PROVINCE,
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Huế",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thái Nguyên",
  "Thanh Hóa",
  "TP Hồ Chí Minh",
  "Vĩnh Long",
];

export function isValidProvince(value) {
  const text = (value ?? "").toString().trim();
  return PROVINCES.includes(text);
}

/**
 * Hàm tương thích cho các ngữ cảnh cũ vốn chỉ nhận Tuyên Quang. Không dùng hàm này để nhận
 * điểm riêng mới hay tạo từ khoá Maps: hai luồng đó bắt buộc kiểm tra `isValidProvince` để
 * không đoán sai tỉnh của người dùng.
 */
export function normalizeProvince(value) {
  const text = (value ?? "").toString().trim();
  return isValidProvince(text) ? text : DEFAULT_PROVINCE;
}

/**
 * Đoán tỉnh/thành từ một địa chỉ Google trả về ("12 Lê Duẩn, Minh Xuân, Tuyên Quang, Việt Nam").
 * CHỈ dùng để điền sẵn ô chọn cho khách bớt một thao tác — khách vẫn sửa được, và không đoán ra
 * thì để trống chứ không rơi về Tuyên Quang (NOTE-15 §2: "31 Hàng Bún" là Hà Nội).
 *
 * So khớp không dấu để chịu được cả "Tuyen Quang" lẫn "TP Hồ Chí Minh". Tỉnh tên dài khớp
 * trước, tránh tên ngắn nuốt mất tên dài khi địa chỉ có cả hai.
 *
 * Địa chỉ Google còn ghi TÊN CŨ (Hà Nam, Hà Giang, Vĩnh Phúc...) thì hàm này trả null: những
 * tỉnh đó đã sáp nhập 01/7/2025 và không còn trong danh sách. Để khách tự chọn vẫn đúng hơn là
 * đoán, vì có tỉnh cũ bị chia về nhiều nơi.
 */
export function provinceFromAddress(address) {
  const text = stripDiacritics(address ?? "").toLowerCase();
  if (!text) return null;
  return (
    [...PROVINCES]
      .sort((a, b) => b.length - a.length)
      .find((p) => text.includes(stripDiacritics(p).toLowerCase())) ?? null
  );
}
