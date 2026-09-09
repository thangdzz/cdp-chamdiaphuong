// Bộ câu hỏi bấm chọn (Chặng 2) — SPEC-chang-2.md §2. Thêm/bớt câu hoặc thêm loại địa điểm
// mới (Chặng 3: "choi"/"dilai", xem lib/placeTypes.js) chỉ sửa file này, không rải if/else
// nơi khác.
//
// Ba khoá tuỳ chọn để lọc theo `transportSubtype` (NOTE-04 §1–§2, xem lib/transport.js):
//   subtypes: [...]          -> CHỈ hỏi cho các subtype này
//   skipSubtypes: [...]      -> KHÔNG hỏi cho các subtype này (câu chung nhưng vô nghĩa với nó)
//   supersededBySubtype      -> thôi hỏi ngay khi admin đã chọn subtype (admin biết chắc hơn)

export const QUESTIONS = [
  // --- Dùng chung mọi loại (§2.1) ---
  {
    id: "parking",
    scope: "all",
    // Xe ghép đón tận nơi thì khách không gửi xe ở đâu cả — hỏi là ép dùng field của quán ăn
    // (NOTE-04 §2 dòng cuối).
    skipSubtypes: ["xe-ghep"],
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
    skipSubtypes: ["xe-ghep"], // xe ghép không có "cửa" để vào
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
    // "Giờ nào đông?" không hợp với xe ghép — câu "Lúc nào có xe?" bên dưới mới đúng thứ cần biết.
    skipSubtypes: ["xe-ghep"],
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
    // Admin đã chọn `transportSubtype` thì thôi hỏi khách — admin biết chắc hơn, và bộ đáp án
    // dưới đây cũng thiếu hẳn "Xe ghép" (NOTE-04 §1).
    supersededBySubtype: true,
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

  // --- Riêng "Đi lại → Xe ghép" (NOTE-04 §2) ---
  // 5 câu đúng theo danh sách field ở §2 mà khách đi rồi mới biết thật. Loại xe và Tuyến
  // chính KHÔNG nằm đây — đó là 2 ô admin tự điền (xem lib/transport.js).
  {
    id: "ride_form",
    scope: "dilai",
    subtypes: ["xe-ghep"],
    icon: "🚐",
    label: "Hình thức",
    text: "Nhà xe này chạy kiểu gì?",
    multi: true,
    options: [
      { value: "shared", label: "Ghép khách" },
      { value: "whole", label: "Bao cả xe" },
    ],
  },
  {
    id: "pickup",
    scope: "dilai",
    subtypes: ["xe-ghep"],
    icon: "📍",
    label: "Điểm đón",
    text: "Đón khách ở đâu?",
    multi: false,
    options: [
      { value: "door", label: "Đón tận nơi" },
      { value: "fixed", label: "Điểm cố định" },
      {
        value: "depends",
        label: "Tuỳ tuyến",
        followUp: { label: "Tuỳ thế nào?", maxLength: 60 },
      },
    ],
  },
  {
    id: "dropoff",
    scope: "dilai",
    subtypes: ["xe-ghep"],
    icon: "🏁",
    label: "Điểm trả",
    text: "Trả khách ở đâu?",
    multi: false,
    options: [
      { value: "door", label: "Trả tận nơi" },
      { value: "fixed", label: "Điểm cố định" },
      {
        value: "depends",
        label: "Tuỳ tuyến",
        followUp: { label: "Tuỳ thế nào?", maxLength: 60 },
      },
    ],
  },
  {
    id: "booking_needed",
    scope: "dilai",
    subtypes: ["xe-ghep"],
    icon: "📅",
    label: "Đặt trước",
    text: "Có cần đặt trước không?",
    multi: false,
    options: [
      { value: "required", label: "Phải đặt trước" },
      { value: "recommended", label: "Nên đặt trước" },
      { value: "walkin", label: "Gọi là đi được" },
    ],
  },
  {
    id: "luggage",
    scope: "dilai",
    subtypes: ["xe-ghep"],
    icon: "🧳",
    label: "Hành lý",
    text: "Hành lý thế nào?",
    multi: false,
    options: [
      { value: "free", label: "Thoải mái" },
      { value: "limited", label: "Gọn thôi" },
      { value: "extra_fee", label: "Cồng kềnh tính thêm phí" },
    ],
  },
];

/**
 * Câu hỏi áp dụng cho một địa điểm.
 * @param {string} type loại chính (an/choi/ngu/dilai)
 * @param {string|null} subtype `transportSubtype` nếu có — không truyền thì hành xử y như cũ,
 *   nên mọi nơi gọi cũ vẫn chạy đúng.
 */
export function getQuestionsForType(type, subtype = null) {
  return QUESTIONS.filter((q) => {
    if (q.scope !== "all" && q.scope !== type) return false;
    if (q.subtypes && !q.subtypes.includes(subtype)) return false;
    if (subtype && q.skipSubtypes?.includes(subtype)) return false;
    if (subtype && q.supersededBySubtype) return false;
    return true;
  });
}

// Ngữ cảnh mẹo nào đã có sẵn câu hỏi bấm chọn (NOTE-04 §3–§4). Khách chọn "Gửi xe" thì đưa
// thẳng bộ đáp án của câu "Gửi xe ở đâu?" ra bấm, thay vì bắt gõ lại đúng thứ đã có nút —
// "chọn là mặc định, gõ là ngoại lệ". Lấy câu ĐẦU TIÊN hợp với loại địa điểm đang xem, nên
// câu riêng của từng loại phải xếp TRƯỚC câu dùng chung: ở một chỗ Chơi, "Lúc nào đi đẹp
// nhất?" đúng ý "thời điểm" hơn hẳn câu chung "Giờ nào đông?".
// Ngữ cảnh không có tên ở đây (Di chuyển, Khác) thì mở thẳng ô gõ.
const CONTEXT_QUESTION_IDS = {
  "gui-xe": ["parking"],
  "loi-vao": ["entrance"],
  "thoi-diem": ["best_time", "available_when", "busy_hours"],
  // Chỉ `payment` — `price_style` nói về cách RA GIÁ (niêm yết/trả giá/đồng hồ), không phải
  // cách trả tiền, nên không thuộc ngữ cảnh này.
  "thanh-toan": ["payment"],
  "tien-ich": ["amenities_an", "amenities_ngu", "facilities"],
};

export function getQuestionForContext(contextId, type, subtype = null) {
  const ids = CONTEXT_QUESTION_IDS[contextId];
  if (!ids) return null;
  const available = getQuestionsForType(type, subtype);
  for (const id of ids) {
    const found = available.find((q) => q.id === id);
    if (found) return found;
  }
  return null;
}

export function getQuestion(id) {
  return QUESTIONS.find((q) => q.id === id) ?? null;
}
