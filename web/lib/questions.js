// Bộ câu hỏi bấm chọn (Chặng 2) — SPEC-chang-2.md §2. Thêm/bớt câu hoặc thêm loại địa điểm
// mới (Chặng 3: "choi"/"dilai", xem lib/placeTypes.js) chỉ sửa file này, không rải if/else
// nơi khác.

export const QUESTIONS = [
  // --- Dùng chung mọi loại (§2.1) ---
  {
    id: "parking",
    scope: "all",
    icon: "🅿️",
    label: "Gửi xe",
    text: "Gửi xe ở đâu?",
    multi: false,
    options: [
      { value: "front", label: "Trước cửa" },
      { value: "sidewalk", label: "Vỉa hè cạnh quán" },
      { value: "own_lot", label: "Bãi riêng của quán" },
      {
        value: "paid_nearby",
        label: "Bãi gần, mất phí",
        followUp: { label: "Bãi nào?", maxLength: 60 },
      },
      { value: "hard", label: "Khó gửi, nên đi bộ tới" },
    ],
  },
  {
    id: "entrance",
    scope: "all",
    icon: "🚪",
    label: "Lối vào",
    text: "Lối vào thế nào?",
    multi: false,
    options: [
      { value: "street", label: "Mặt đường dễ thấy" },
      { value: "alley", label: "Trong ngõ" },
      { value: "upstairs", label: "Trên tầng" },
      {
        value: "diff_sign",
        label: "Biển hiệu khác tên",
        followUp: { label: "Trên biển ghi gì?", maxLength: 40 },
      },
      { value: "shared", label: "Chung cửa với chỗ khác" },
    ],
  },
  {
    id: "busy_hours",
    scope: "all",
    icon: "🕐",
    label: "Giờ đông",
    text: "Giờ nào đông?",
    multi: true,
    options: [
      { value: "morning", label: "Sáng 6–8h" },
      { value: "noon", label: "Trưa 11–13h" },
      { value: "afternoon", label: "Chiều" },
      { value: "evening", label: "Tối 18–21h" },
      { value: "late", label: "Khuya" },
      { value: "weekend", label: "Cuối tuần" },
      { value: "festival", label: "Dịp lễ hội" },
    ],
  },
  {
    id: "payment",
    scope: "all",
    icon: "💳",
    label: "Thanh toán",
    text: "Trả tiền kiểu gì?",
    multi: true,
    options: [
      { value: "cash", label: "Tiền mặt" },
      { value: "transfer", label: "Chuyển khoản" },
      { value: "qr", label: "Quét QR" },
      { value: "card", label: "Thẻ" },
    ],
  },

  // --- Riêng "Ăn" (§2.2) ---
  {
    id: "space",
    scope: "an",
    icon: "🏠",
    label: "Không gian",
    text: "Không gian thế nào?",
    multi: false,
    options: [
      { value: "indoor", label: "Trong nhà" },
      { value: "outdoor", label: "Ngoài trời" },
      { value: "private_room", label: "Có phòng riêng" },
      { value: "street", label: "Vỉa hè" },
    ],
  },
  {
    id: "good_for",
    scope: "an",
    icon: "👥",
    label: "Hợp đi với",
    text: "Hợp đi với ai?",
    multi: true,
    options: [
      { value: "solo", label: "Một mình" },
      { value: "couple", label: "Cặp đôi" },
      { value: "family", label: "Gia đình có trẻ" },
      { value: "group", label: "Nhóm đông" },
      { value: "business", label: "Tiếp khách" },
    ],
  },
  {
    id: "amenities_an",
    scope: "an",
    icon: "✨",
    label: "Tiện nghi",
    text: "Có gì tiện?",
    multi: true,
    options: [
      { value: "wifi", label: "Wifi" },
      { value: "aircon", label: "Điều hoà" },
      { value: "kid_chair", label: "Ghế trẻ em" },
    ],
  },
  {
    id: "serving_speed",
    scope: "an",
    icon: "⏱️",
    label: "Ra món",
    text: "Ra món nhanh không?",
    multi: false,
    options: [
      { value: "fast", label: "Nhanh" },
      { value: "slow", label: "Phải chờ" },
    ],
  },

  // --- Riêng "Ngủ" (§2.3) ---
  {
    id: "amenities_ngu",
    scope: "ngu",
    icon: "🛏️",
    label: "Phòng có",
    text: "Phòng có gì?",
    multi: true,
    options: [
      { value: "elevator", label: "Thang máy" },
      { value: "hot_water", label: "Nước nóng" },
      { value: "aircon", label: "Điều hoà" },
      { value: "balcony", label: "Ban công" },
      { value: "car_park", label: "Chỗ để ô tô" },
      { value: "late_checkin", label: "Nhận khách sau 22h" },
      { value: "pet", label: "Cho mang thú cưng" },
    ],
  },
  {
    id: "noise",
    scope: "ngu",
    icon: "🔈",
    label: "Độ ồn",
    text: "Có ồn không?",
    multi: false,
    options: [
      { value: "quiet", label: "Yên tĩnh" },
      { value: "street_noise", label: "Nghe tiếng đường" },
      { value: "morning_noise", label: "Sáng ồn" },
    ],
  },
  {
    id: "booking",
    scope: "ngu",
    icon: "📞",
    label: "Đặt phòng",
    text: "Đặt phòng qua đâu?",
    multi: true,
    options: [
      { value: "phone", label: "Gọi điện" },
      { value: "zalo", label: "Zalo" },
      { value: "facebook", label: "Facebook" },
      { value: "walkin", label: "Đến thẳng" },
    ],
  },

  // --- Riêng "Chơi" (SPEC-chang-3.md §4.1) ---
  {
    id: "ticket",
    scope: "choi",
    icon: "🎫",
    label: "Vé",
    text: "Có mất phí không?",
    multi: false,
    options: [
      { value: "free", label: "Miễn phí" },
      { value: "paid", label: "Có vé" },
      { value: "paid_service", label: "Miễn phí vào, trả tiền dịch vụ" },
    ],
  },
  {
    id: "best_time",
    scope: "choi",
    icon: "🕐",
    label: "Lúc đẹp nhất",
    text: "Lúc nào đi đẹp nhất?",
    multi: true,
    options: [
      { value: "morning", label: "Sáng sớm" },
      { value: "afternoon", label: "Chiều" },
      { value: "sunset", label: "Hoàng hôn" },
      { value: "evening", label: "Tối" },
      { value: "festival", label: "Dịp lễ hội" },
    ],
  },
  {
    id: "suitable_for",
    scope: "choi",
    icon: "👥",
    label: "Hợp với ai",
    text: "Hợp với ai?",
    multi: true,
    options: [
      { value: "family", label: "Gia đình có trẻ" },
      { value: "couple", label: "Cặp đôi" },
      { value: "group", label: "Nhóm bạn" },
      { value: "photo", label: "Chụp ảnh" },
      { value: "elderly", label: "Người lớn tuổi" },
    ],
  },
  {
    id: "facilities",
    scope: "choi",
    icon: "✨",
    label: "Có gì ở đó",
    text: "Có gì ở đó?",
    multi: true,
    options: [
      { value: "toilet", label: "Nhà vệ sinh" },
      { value: "shade", label: "Chỗ ngồi có mái" },
      { value: "food_nearby", label: "Hàng ăn gần đó" },
      { value: "wheelchair", label: "Lối cho xe lăn" },
    ],
  },

  // --- Riêng "Đi lại" (SPEC-chang-3.md §4.2) ---
  {
    id: "transport_kind",
    scope: "dilai",
    icon: "🚌",
    label: "Loại hình",
    text: "Đây là chỗ gì?",
    multi: false,
    options: [
      { value: "bus_station", label: "Bến xe" },
      { value: "rental", label: "Thuê xe" },
      { value: "taxi", label: "Điểm taxi/xe ôm" },
      { value: "parking", label: "Bãi gửi xe" },
    ],
  },
  {
    id: "price_style",
    scope: "dilai",
    icon: "💳",
    label: "Giá",
    text: "Giá thế nào?",
    multi: false,
    options: [
      { value: "fixed", label: "Niêm yết rõ" },
      { value: "negotiate", label: "Phải hỏi/trả giá" },
      { value: "meter", label: "Theo đồng hồ" },
    ],
  },
  {
    id: "available_when",
    scope: "dilai",
    icon: "🕐",
    label: "Lúc nào có xe",
    text: "Lúc nào có xe?",
    multi: true,
    options: [
      { value: "early", label: "Sáng sớm" },
      { value: "daytime", label: "Ban ngày" },
      { value: "evening", label: "Tối" },
      { value: "late", label: "Khuya" },
      { value: "always", label: "Cả ngày" },
    ],
  },
  {
    id: "festival_note",
    scope: "dilai",
    icon: "🎉",
    label: "Dịp lễ hội",
    text: "Dịp lễ hội thì sao?",
    multi: false,
    options: [
      { value: "normal", label: "Bình thường" },
      { value: "crowded", label: "Rất đông, nên đến sớm" },
      { value: "blocked", label: "Bị chặn/đổi lộ trình" },
    ],
  },
];

export function getQuestionsForType(type) {
  return QUESTIONS.filter((q) => q.scope === "all" || q.scope === type);
}

export function getQuestion(id) {
  return QUESTIONS.find((q) => q.id === id) ?? null;
}
