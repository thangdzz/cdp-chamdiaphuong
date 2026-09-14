// Cấu hình mùa game "Săn đèn Thành Tuyên 2026" (NOTE-04). Đây là DỮ LIỆU, không phải code
// riêng cho Trung thu: mùa khác (chợ phiên, mùa hoa...) chỉ cần thêm một file cùng khuôn rồi
// đăng ký trong lib/game/registry.js.

export const THANH_TUYEN_2026 = {
  id: "thanh-tuyen-2026",
  slug: "thanh-tuyen-2026",
  name: "Săn đèn Thành Tuyên 2026",
  shortName: "Săn đèn Thành Tuyên",
  year: 2026,
  // Mô hình bắt đầu diễu diễu từ 21/8; lễ hội chính 19–25/9. Để dư tới hết tháng 9 cho những
  // tối rước muộn. Hết mùa thì game chỉ còn xem lại, dữ liệu giữ nguyên (NOTE-03 §2.8).
  startAt: "2026-08-21T00:00:00+07:00",
  endAt: "2026-09-30T23:59:59+07:00",
  postHref: "/le-hoi-thanh-tuyen",
  postTitle: "Lễ hội Thành Tuyên 2026",

  copy: {
    objectNoun: "mô hình",
    tagline: "Tối nay bạn gặp được bao nhiêu mô hình?",
    collectionTitle: "Bộ sưu tập Thành Tuyên 2026",
    reportCta: "Bạn vừa thấy mô hình nào?",
    reportIcon: "🏮",
  },

  // Không hard-code tổng số mô hình (NOTE-03 §1 "Nguyên tắc dữ liệu"): con số dưới đây chỉ là
  // thông tin tham khảo có nguồn, KHÔNG dùng làm mẫu số của bộ sưu tập.
  catalogNote: {
    text: "Đêm hội 20/9 dự kiến có 45 mô hình diễn diễu.",
    source: "Kế hoạch 246/KH-UBND tỉnh Tuyên Quang",
    updatedAt: "2026-06-27",
  },

  map: {
    // Quảng trường Nguyễn Tất Thành, phường Minh Xuân — nơi tập trung chính.
    center: { lat: 21.8236, lng: 105.214 },
    zoom: 14.5,
    // Tỉnh Tuyên Quang (sau sáp nhập) + biên. Lượt báo ngoài khung này bị từ chối.
    bounds: [
      [104.2, 21.4],
      [106.0, 23.5],
    ],
  },

  // "Bản đồ tối nay" hiện lượt báo trong khoảng này. Mô hình di chuyển nên dữ liệu cũ hơn vài
  // giờ không còn giúp ai đi tìm.
  recentWindowMinutes: 180,

  categories: [
    { id: "linh-vat", label: "Linh vật", icon: "🐉" },
    { id: "con-vat", label: "Con vật", icon: "🐟" },
    { id: "co-tich", label: "Cổ tích", icon: "🌕" },
    { id: "khac", label: "Khác", icon: "🏮" },
  ],

  // Danh sách mở đầu: các KIỂU mô hình quen thuộc ở Thành Tuyên, CHƯA đối chiếu với danh sách
  // chính thức (chưa có danh sách công khai theo tên). Để unverified + source riêng để admin
  // đổi tên/ghép/ẩn ở /admin/game khi có dữ liệu thật — game không phải chờ data hoàn hảo
  // (NOTE-04 §2, §15).
  objects: [
    { id: "tt26-rong-vang", name: "Rồng vàng", icon: "🐉", category: "linh-vat" },
    { id: "tt26-ca-chep", name: "Cá chép trông trăng", icon: "🐟", category: "con-vat" },
    { id: "tt26-su-tu", name: "Sư tử", icon: "🦁", category: "linh-vat" },
    { id: "tt26-phuong-hoang", name: "Phượng hoàng", icon: "🦚", category: "linh-vat" },
    { id: "tt26-rua-than", name: "Rùa thần", icon: "🐢", category: "linh-vat" },
    { id: "tt26-tho-ngoc", name: "Thỏ ngọc", icon: "🐇", category: "co-tich" },
    { id: "tt26-cuoi-hang", name: "Chú Cuội – chị Hằng", icon: "🌕", category: "co-tich" },
    { id: "tt26-coc-tia", name: "Cóc tía", icon: "🐸", category: "co-tich" },
    { id: "tt26-trau-vang", name: "Trâu vàng", icon: "🐃", category: "con-vat" },
    { id: "tt26-voi", name: "Voi", icon: "🐘", category: "con-vat" },
  ].map((object) => ({
    ...object,
    kind: "model",
    eventYear: 2026,
    verificationStatus: "unverified",
    source: "cdp_seed_placeholder",
  })),
};
