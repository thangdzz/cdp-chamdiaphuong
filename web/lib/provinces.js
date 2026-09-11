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

export const DEFAULT_PROVINCE = "Tuyên Quang";

// Tuyên Quang đứng đầu vì phần lớn điểm riêng vẫn nằm ngay tại đây (nhà người quen, điểm hẹn);
// phần còn lại xếp theo bảng chữ cái để dò cho nhanh.
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

/**
 * Điểm riêng cũ (trước 2026-09-11) không có trường này -> coi như Tuyên Quang, đúng bằng hành
 * vi trước đây. Giao diện hiện rõ ô đang chọn Tuyên Quang để khách đổi nếu sai, thay vì giấu
 * một giả định trong code.
 */
export function normalizeProvince(value) {
  const text = (value ?? "").toString().trim();
  return PROVINCES.includes(text) ? text : DEFAULT_PROVINCE;
}
