// Lịch Lễ hội Thành Tuyên 2026 — DỮ LIỆU THUẦN, không có giao diện nào ở đây.
//
// Chuyển từ JSX của app/le-hoi-thanh-tuyen/page.js sang (2026-09-11, CDP_P1-P8 §P1). Trước đó
// 12 mốc lịch nằm thẳng trong mã giao diện: không biết mốc nào đã qua, sửa một giờ cũng phải
// sửa mã, và không dùng lại được cho bài nào khác.
//
// Nội dung giữ NGUYÊN VĂN như bản đang chạy — đây là chuyển chỗ chứa, không phải viết lại lịch.
//
// Chưa đọc từ Redis: sửa lịch vẫn phải deploy (§Phase 2 mới làm Content Monitor + admin duyệt
// diff). Đổi về sau chỉ cần thay hàm trả mảng này, phần còn lại không đụng tới.

import { VERIFICATION } from "../events.js";

const SOURCE_UBND = {
  name: "Kế hoạch số 246/KH-UBND, UBND tỉnh Tuyên Quang",
  updatedAt: "2026-06-27",
};
const SOURCE_PHUONG = {
  name: "Kế hoạch UBND phường Minh Xuân",
  updatedAt: "2026-07-01",
};

export const POST_META = {
  slug: "le-hoi-thanh-tuyen",
  title: "Lễ hội Thành Tuyên 2026",
  subtitle: "19 – 25/9/2026 · TP Tuyên Quang",
  cover: "/images/le-hoi-thanh-tuyen-2026.jpg",
};

// Khung kế hoạch gợi ý cho đêm chính (CDP_P1-P8 §P3 "Interactive Plan").
//
// Mục đích: người đọc xong lịch thì KHÔNG dừng ở "đọc rồi thoát". Mỗi dòng là một khung giờ
// bỏ trống, khách bấm chọn chỗ của mình — chọn tới đâu thành lộ trình tới đó.
//
// Giờ giấc là GỢI Ý, khách sửa lại được hết ở trang lộ trình. Chỉ có Đêm hội là mốc cứng vì
// đó là giờ ban tổ chức công bố.
export const PLAN_TEMPLATE = {
  heading: "Bạn định đi thế nào?",
  routeTitle: "Đi Đêm hội Thành Tuyên 20/9",
  slots: [
    { id: "an-toi", plannedAt: "17:30", label: "Ăn tối", placeType: "an", cta: "Chọn chỗ ăn" },
    {
      id: "gui-xe",
      plannedAt: "19:00",
      label: "Gửi xe",
      placeType: "dilai",
      cta: "Chọn chỗ gửi xe",
    },
    {
      id: "dem-hoi",
      plannedAt: "20:00",
      label: "Đêm hội Thành Tuyên",
      durationMinutes: 150,
      // Điểm cố định: không phải chỗ trong danh bạ, nhưng có địa chỉ thật nên vẫn vào được
      // link Google Maps của lộ trình.
      fixed: {
        title: "Đêm hội Thành Tuyên",
        address: "Quảng trường Nguyễn Tất Thành, phường Minh Xuân",
        province: "Tuyên Quang",
      },
    },
    { id: "cafe", plannedAt: "22:15", label: "Cafe nghỉ chân", placeType: "an", cta: "Chọn quán" },
    {
      id: "ngu",
      plannedAt: null,
      whenText: "Sau đó",
      label: "Ngủ lại",
      placeType: "ngu",
      cta: "Chọn chỗ ngủ",
    },
  ],
};

export const FESTIVAL_EVENTS = [
  {
    id: "dieu-dieu-hang-ngay",
    title: "Diễu diễu mô hình đèn hằng ngày",
    description: "Mô hình đèn của các phường diễu qua phố mỗi tối.",
    startAt: "2026-08-21T19:30:00+07:00",
    endAt: "2026-09-04T22:00:00+07:00",
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "dieu-dieu-cuoi-tuan",
    title: "Diễu diễu tối thứ Sáu và thứ Bảy hằng tuần",
    description: "Hết giai đoạn hằng ngày, chỉ còn diễu diễu hai tối cuối tuần.",
    startAt: "2026-09-05T19:30:00+07:00",
    endAt: "2026-09-27T22:00:00+07:00",
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "thi-mo-hinh-minh-xuan",
    title: "Thi mô hình đèn Trung thu cấp phường Minh Xuân",
    description: "Chọn mô hình đẹp nhất tham gia Đêm hội chính 20/9.",
    location: "Quảng trường Nguyễn Tất Thành, phường Minh Xuân",
    startAt: "2026-09-12T00:00:00+07:00",
    endAt: "2026-09-12T23:59:00+07:00",
    allDay: true,
    verificationStatus: VERIFICATION.EXPECTED,
    source: SOURCE_PHUONG,
  },
  {
    id: "pho-di-bo",
    title: "Hoạt động trên tuyến phố đi bộ",
    description: "Dân vũ, không gian âm nhạc, trò chơi dân gian.",
    location: "Tuyến phố đi bộ, phường Minh Xuân",
    startAt: "2026-09-11T00:00:00+07:00",
    endAt: "2026-09-25T23:59:00+07:00",
    verificationStatus: VERIFICATION.EXPECTED,
    source: SOURCE_PHUONG,
  },
  {
    id: "den-trang-tri",
    title: "Đèn trang trí, điện chiếu sáng bật sớm quanh phố",
    description: "Đi dạo, chụp ảnh được cả những ngày không phải cao điểm.",
    startAt: "2026-09-13T18:30:00+07:00",
    endAt: "2026-09-25T23:59:00+07:00",
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "dem-hoi-trang-ram-thieu-nhi",
    title: "Đêm hội trăng rằm, thắp sáng ước mơ thiếu nhi Tuyên Quang",
    location: "Quảng trường 26/3, phường Hà Giang 1",
    startAt: "2026-09-19T00:00:00+07:00",
    endAt: "2026-09-19T23:59:00+07:00",
    allDay: true,
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "dem-hoi-thanh-tuyen",
    title: "Đêm hội Thành Tuyên",
    description:
      'Sự kiện lớn nhất — chủ đề "Lung linh đêm hội trăng rằm", 45 mô hình đèn diễn diễu (40 mô hình được lựa chọn + 5 mô hình của đơn vị tài trợ), truyền hình trực tiếp.',
    location: "Quảng trường Nguyễn Tất Thành, phường Minh Xuân",
    startAt: "2026-09-20T20:00:00+07:00",
    endAt: "2026-09-20T23:00:00+07:00",
    // Mốc chính của cả bài — giao diện cho nó nổi hơn hẳn các mốc còn lại.
    highlight: true,
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "mam-co-trung-thu",
    title: "Trưng bày Mâm cỗ Trung thu",
    description: "Sản vật địa phương trang trí đẹp mắt, cùng đêm hội chính.",
    location: "Quảng trường Nguyễn Tất Thành",
    startAt: "2026-09-20T00:00:00+07:00",
    endAt: "2026-09-20T23:59:00+07:00",
    allDay: true,
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "am-thuc-hoi-cho",
    title: "Không gian ẩm thực & Lễ hội Bia + Hội chợ Nông sản OCOP",
    description: "Khoảng 30 gian hàng.",
    location: "Đường Chiến thắng Sông Lô, phường Minh Xuân",
    startAt: "2026-09-19T00:00:00+07:00",
    endAt: "2026-09-25T23:59:00+07:00",
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "dem-trang-ram-chinh",
    title: "Đêm trăng rằm chính",
    description: "Rằm Trung Thu, 15/8 âm lịch.",
    startAt: "2026-09-25T00:00:00+07:00",
    endAt: "2026-09-25T23:59:00+07:00",
    allDay: true,
    verificationStatus: VERIFICATION.CONFIRMED,
    source: SOURCE_UBND,
  },
  {
    id: "giai-xe-dia-hinh",
    title: "Giải trình diễn lái xe ô tô - mô tô địa hình Tuyên Quang mở rộng lần IV",
    location: "Phường Minh Xuân",
    // Không có startAt: nguồn mới nói "trong tháng 9". Mốc kiểu này xuống cuối timeline kèm
    // nhãn riêng, KHÔNG đoán bừa một ngày rồi để khách đi trượt.
    startAt: null,
    whenText: "Trong tháng 9/2026 — chưa có ngày cụ thể",
    verificationStatus: VERIFICATION.EXPECTED,
    source: SOURCE_UBND,
  },
];
