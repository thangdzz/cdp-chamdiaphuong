// Bộ câu hỏi bấm chọn (Chặng 2) — SPEC-chang-2.md §2. Thêm/bớt câu hoặc thêm loại địa điểm
// mới (Chặng 3: "choi"/"dilai", xem lib/placeTypes.js) chỉ sửa file này, không rải if/else
// nơi khác.
//
// Lọc theo nhóm "Đi lại" (NOTE-04 §1–§2, NOTE-06 §9, xem lib/transport.js). Family là lớp
// NỀN, subtype chỉ override phần khác biệt — nhờ vậy thêm loại mới chỉ là khai báo, không
// phải rải if/else khắp nơi:
//   families: [...]          -> CHỈ hỏi cho các family này (câu nền của cả nhóm)
//   subtypes: [...]          -> CHỈ hỏi cho các subtype này (câu riêng, hẹp hơn family)
//   skipFamilies: [...]      -> KHÔNG hỏi cho cả family này
//   skipSubtypes: [...]      -> KHÔNG hỏi cho các subtype này (câu chung nhưng vô nghĩa với nó)
//   supersededBySubtype      -> thôi hỏi ngay khi admin đã chọn subtype (admin biết chắc hơn)
//   supersededByField: "x"   -> thôi hỏi khi admin đã điền ô `x` của địa điểm đó

import { familyOfSubtype } from "./transport.js";

export const QUESTIONS = [
  // --- Dùng chung mọi loại (§2.1) ---
  {
    id: "parking",
    scope: "all",
    // Dịch vụ đón khách và xe khách thì khách không gửi xe ở đâu cả — hỏi là ép dùng field
    // của quán ăn (NOTE-04 §2 dòng cuối, NOTE-05 §5). Bến xe / điểm đón / bãi xe và các hàng
    // cho thuê xe tự lái thì vẫn hỏi bình thường: đó là chỗ khách tới thật.
    // Bỏ cho cả 3 nhóm: dịch vụ đón khách không có chỗ để gửi, cửa hàng thuê xe thì khách
    // đi RA bằng xe chứ không gửi xe lại, còn bãi/bến xe thì chính nó LÀ chỗ gửi xe — hỏi
    // thành vòng tròn, mà đáp án lại toàn chữ của quán ăn ("Bãi riêng của quán", "Vỉa hè
    // cạnh quán"). Bãi/bến xe có câu "Gửi xe mất bao nhiêu?" riêng bên dưới.
    skipFamilies: ["pickup-service", "self-drive", "transport-place"],
    skipSubtypes: ["xe-khach"],
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
    skipFamilies: ["pickup-service"], // dịch vụ đón khách không có "cửa" để vào
    skipSubtypes: ["xe-khach"],
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
    // "Giờ nào đông?" không hợp với dịch vụ đi xe — đã có câu giờ chạy / giờ hoạt động riêng.
    skipFamilies: ["pickup-service"],
    skipSubtypes: ["xe-khach"],
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
    // Bãi/bến xe đã có câu "Gửi xe mất bao nhiêu?" cụ thể hơn hẳn, và "Theo đồng hồ" thì chỉ
    // đúng với taxi.
    skipFamilies: ["transport-place"],
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
    // Dịch vụ đón khách và xe khách có câu giờ riêng bên dưới, chi tiết hơn hẳn — giữ cả hai
    // là hỏi 2 lần cùng một chuyện. Bãi gửi xe thì không có "xe" nào để chờ cả.
    skipFamilies: ["pickup-service"],
    skipSubtypes: ["xe-khach", "bai-xe"],
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

  // --- Dịch vụ đón khách (NOTE-06 §9) + Xe khách ---------------------------------------
  // Bộ NỀN khai theo family `pickup-service`: xe ghép, taxi, thuê xe có lái đều được hỏi.
  // Câu nào chỉ đúng với một loại thì khai `subtypes`, câu nào không hợp thì `skipSubtypes` —
  // không có if/else nào ở nơi khác.
  // KHÔNG đưa "Không rõ" vào options: nút "Không rõ" đã có sẵn ở khối hỏi cuối thẻ và nó BỎ
  // QUA câu hỏi, không ghi phiếu — đưa vào đây sẽ thành một đáp án đi vào đồng thuận, tức là
  // "nhiều người đồng thuận rằng không ai biết".
  {
    id: "vehicle_types",
    scope: "dilai",
    families: ["pickup-service", "self-drive"],
    subtypes: ["xe-khach"],
    // multi: một nhà xe chạy đồng thời 4 chỗ và 7 chỗ là chuyện thường. Đồng thuận tính
    // TỪNG loại một, không có loại nào "thắng" rồi ẩn loại khác (NOTE-06 §8).
    multi: true,
    showCounts: true,
    // Admin đã điền ô "Loại xe" thì thôi hỏi — nhà xe biết chắc hơn khách, và câu trả lời đã
    // nằm ngay dòng đầu thẻ ("Xe ghép · 4 chỗ · 7 chỗ").
    supersededByField: "vehicleTypes",
    icon: "🚗",
    label: "Loại xe",
    text: "Thường có những loại xe nào?",
    options: [
      { value: "4", label: "4 chỗ" },
      { value: "7", label: "7 chỗ" },
      { value: "16", label: "9–16 chỗ" },
      { value: "29", label: "29 chỗ trở lên" },
    ],
  },
  {
    id: "pickup",
    scope: "dilai",
    families: ["pickup-service"],
    subtypes: ["xe-khach"],
    // Taxi thì luôn đón đúng chỗ khách đứng — hỏi "đón thế nào" là thừa (NOTE-06 §6).
    skipSubtypes: ["taxi"],
    icon: "🚐",
    label: "Đón",
    text: "Đón khách thế nào?",
    multi: false,
    options: [
      { value: "door", label: "Đón tận nơi" },
      { value: "fixed", label: "Điểm cố định", followUp: { label: "Điểm đón ở đâu?", maxLength: 60 } },
      { value: "both", label: "Cả hai", followUp: { label: "Điểm đón cố định ở đâu?", maxLength: 60 } },
    ],
  },
  {
    id: "dropoff",
    scope: "dilai",
    families: ["pickup-service"],
    subtypes: ["xe-khach"],
    skipSubtypes: ["taxi"], // taxi trả khách ở đâu khách bảo, không có điểm trả cố định
    icon: "📍",
    label: "Trả",
    text: "Trả khách thế nào?",
    multi: false,
    options: [
      { value: "door", label: "Trả tận nơi" },
      { value: "fixed", label: "Điểm cố định", followUp: { label: "Điểm trả ở đâu?", maxLength: 60 } },
      { value: "both", label: "Cả hai", followUp: { label: "Điểm trả cố định ở đâu?", maxLength: 60 } },
    ],
  },
  {
    // KHÔNG đặt tên "booking" — id đó đã thuộc câu "Đặt phòng qua đâu?" của nhóm Ngủ, mà
    // getQuestion(id) lấy câu ĐẦU TIÊN khớp id nên phiếu gửi lên sẽ bị kiểm tra nhầm theo bộ
    // đáp án của Ngủ rồi bị từ chối. Mỗi id phải là duy nhất trong cả file.
    id: "ride_booking",
    scope: "dilai",
    families: ["pickup-service"],
    subtypes: ["xe-khach"],
    icon: "📅",
    label: "Đặt trước",
    // Chữ chung cho cả xe ghép (đặt xe), taxi (đặt trước) và xe khách (đặt vé).
    text: "Cần đặt trước không?",
    multi: false,
    options: [
      { value: "should_book", label: "Nên đặt trước" },
      { value: "last_minute", label: "Có thể gọi sát giờ" },
      { value: "depends", label: "Tuỳ chuyến" },
    ],
  },
  {
    id: "luggage",
    scope: "dilai",
    families: ["pickup-service"],
    subtypes: ["xe-khach"],
    skipSubtypes: ["taxi"], // NOTE-06 §6 không liệt kê hành lý trong bộ field của taxi
    icon: "🧳",
    label: "Hành lý",
    text: "Hành lý thế nào?",
    multi: false,
    options: [
      { value: "normal", label: "Hành lý thông thường" },
      { value: "bulky", label: "Nhận đồ cồng kềnh" },
      { value: "ask", label: "Cần hỏi trước" },
    ],
  },
  {
    id: "vehicle_amenities",
    scope: "dilai",
    families: ["pickup-service"],
    subtypes: ["xe-khach"],
    icon: "✨",
    label: "Trên xe có",
    text: "Trên xe có gì?",
    multi: true,
    // NOTE-05 §4 có liệt kê "Đón tận nơi / Trả tận nơi" trong tiện ích, nhưng 2 thứ đó đã là
    // câu hỏi riêng ở trên — để lại đây sẽ thành hỏi 2 lần cùng một chuyện (§4 dòng cuối:
    // "chỉ đưa lựa chọn có ý nghĩa với subtype").
    options: [
      { value: "aircon", label: "Điều hoà" },
      { value: "kid_seat", label: "Ghế trẻ em" },
      { value: "pet", label: "Chở thú cưng" },
    ],
  },
  {
    // Giờ hoạt động của cả dịch vụ (§4 "Thời gian hoạt động", §6 taxi "24/7 hay theo giờ").
    // Khác `schedule` bên dưới: đó là giờ CHẠY CHUYẾN của xe ghép/xe khách.
    id: "service_hours",
    scope: "dilai",
    families: ["pickup-service"],
    skipSubtypes: ["xe-ghep"],
    icon: "🕐",
    label: "Hoạt động",
    text: "Hoạt động lúc nào?",
    multi: false,
    options: [
      { value: "24_7", label: "24/7" },
      { value: "day", label: "Chủ yếu ban ngày" },
      { value: "office", label: "Giờ hành chính" },
      { value: "ask", label: "Cần hỏi trước" },
    ],
  },

  // --- Riêng từng subtype ---------------------------------------------------------------
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
    id: "schedule",
    scope: "dilai",
    subtypes: ["xe-ghep", "xe-khach"],
    icon: "🕐",
    label: "Chạy",
    text: "Xe thường chạy khi nào?",
    multi: false,
    options: [
      { value: "fixed_trips", label: "Theo chuyến cố định" },
      { value: "all_day", label: "Có xe cả ngày" },
      { value: "morning", label: "Chủ yếu buổi sáng" },
      { value: "afternoon", label: "Chủ yếu buổi chiều" },
      { value: "evening", label: "Chủ yếu buổi tối" },
      { value: "ask", label: "Cần hỏi trước" },
    ],
  },
  {
    // NOTE-06 §6: taxi cần "cách gọi", xe ghép/thuê xe thì gọi thẳng số nên không cần.
    id: "taxi_hail",
    scope: "dilai",
    subtypes: ["taxi"],
    icon: "📞",
    label: "Cách gọi",
    text: "Gọi xe kiểu gì?",
    multi: true,
    options: [
      { value: "hotline", label: "Tổng đài" },
      { value: "direct", label: "Gọi thẳng lái xe" },
      { value: "app", label: "Qua app" },
      { value: "street", label: "Vẫy dọc đường" },
    ],
  },
  {
    // NOTE-06 §7: thuê xe có lái hay được thuê đi tỉnh, và cách tính giá khác hẳn taxi.
    id: "intercity",
    scope: "dilai",
    subtypes: ["thue-xe-co-lai"],
    icon: "🛣️",
    label: "Đi tỉnh",
    text: "Có nhận đi tỉnh không?",
    multi: false,
    options: [
      { value: "yes", label: "Có nhận đi tỉnh" },
      { value: "nearby", label: "Chỉ quanh Tuyên Quang" },
      { value: "ask", label: "Cần hỏi trước" },
    ],
  },
  {
    id: "price_basis",
    scope: "dilai",
    subtypes: ["thue-xe-co-lai"],
    icon: "💰",
    label: "Tính giá",
    text: "Tính giá kiểu gì?",
    multi: true,
    options: [
      { value: "trip", label: "Theo chuyến" },
      { value: "day", label: "Theo ngày" },
      { value: "km", label: "Theo km" },
    ],
  },
  // --- Tự lái: thuê ô tô / thuê xe máy (NOTE-06 §11) ------------------------------------
  // Khách tới tận cửa hàng lấy xe, nên vẫn hỏi lối vào / giờ đông như chỗ vật lý. Cái khác
  // hẳn là cọc, giấy tờ và cách giao xe — 3 thứ quyết định có thuê được hay không.
  {
    id: "rental_deposit",
    scope: "dilai",
    families: ["self-drive"],
    icon: "💰",
    label: "Đặt cọc",
    text: "Đặt cọc thế nào?",
    multi: false,
    options: [
      { value: "cash", label: "Cọc tiền" },
      { value: "papers", label: "Giữ giấy tờ" },
      { value: "either", label: "Cọc tiền hoặc giữ giấy tờ" },
      { value: "none", label: "Không cần cọc" },
    ],
  },
  {
    id: "rental_papers",
    scope: "dilai",
    families: ["self-drive"],
    icon: "🪪",
    label: "Giấy tờ",
    text: "Cần giấy tờ gì?",
    multi: true,
    options: [
      { value: "id", label: "CCCD" },
      { value: "licence", label: "Bằng lái" },
      { value: "residence", label: "Sổ hộ khẩu" },
      { value: "none", label: "Không cần giấy tờ" },
    ],
  },
  {
    id: "rental_handover",
    scope: "dilai",
    families: ["self-drive"],
    icon: "🔑",
    label: "Nhận xe",
    text: "Nhận xe thế nào?",
    multi: false,
    options: [
      { value: "shop", label: "Đến cửa hàng lấy" },
      { value: "delivery", label: "Giao tận nơi" },
      { value: "both", label: "Cả hai" },
    ],
  },

  // --- Điểm giao thông: bến xe / bãi xe / điểm đón trả (NOTE-06 §11) ---------------------
  {
    id: "parking_fee",
    scope: "dilai",
    families: ["transport-place"],
    // Điểm đón/trả chỉ là chỗ đứng chờ xe, không phải bãi giữ xe.
    skipSubtypes: ["diem-don-tra"],
    icon: "🎫",
    label: "Phí gửi xe",
    text: "Gửi xe mất bao nhiêu?",
    multi: false,
    options: [
      { value: "free", label: "Miễn phí" },
      { value: "per_turn", label: "Có phí theo lượt" },
      { value: "per_hour", label: "Tính theo giờ" },
      { value: "per_day", label: "Tính theo ngày" },
    ],
  },
  {
    id: "parking_accepts",
    scope: "dilai",
    families: ["transport-place"],
    // Điểm đón/trả chỉ là chỗ đứng chờ xe, không phải bãi giữ xe.
    skipSubtypes: ["diem-don-tra"],
    icon: "🛵",
    label: "Nhận trông",
    text: "Nhận trông xe gì?",
    multi: true,
    options: [
      { value: "motorbike", label: "Xe máy" },
      { value: "car", label: "Ô tô" },
      { value: "bicycle", label: "Xe đạp" },
    ],
  },
  {
    id: "parking_overnight",
    scope: "dilai",
    families: ["transport-place"],
    // Điểm đón/trả chỉ là chỗ đứng chờ xe, không phải bãi giữ xe.
    skipSubtypes: ["diem-don-tra"],
    icon: "🌙",
    label: "Qua đêm",
    text: "Có trông qua đêm không?",
    multi: false,
    options: [
      { value: "yes", label: "Có trông qua đêm" },
      { value: "no", label: "Chỉ trông ban ngày" },
      { value: "ask", label: "Cần hỏi trước" },
    ],
  },

  {
    id: "coach_seat",
    scope: "dilai",
    subtypes: ["xe-khach"],
    icon: "🛏️",
    label: "Chỗ ngồi",
    text: "Ghế ngồi hay giường nằm?",
    multi: false,
    options: [
      { value: "seat", label: "Ghế ngồi" },
      { value: "bed", label: "Giường nằm" },
      { value: "both", label: "Có cả hai" },
    ],
  },
];

/**
 * Câu hỏi áp dụng cho một địa điểm.
 * @param {string} type loại chính (an/choi/ngu/dilai)
 * @param {string|null} subtype `transportSubtype` nếu có — không truyền thì hành xử y như cũ,
 *   nên mọi nơi gọi cũ vẫn chạy đúng.
 */
/**
 * Câu hỏi áp dụng cho một địa điểm. Family là lớp NỀN, subtype override (NOTE-06 §9).
 * @param {string} type loại chính (an/choi/ngu/dilai)
 * @param {string|null} subtype `transportSubtype`
 * @param {string[]} filledFields ô admin đã điền -> thôi hỏi câu tương ứng
 * @param {string|null} family `transportFamily` — không truyền thì tự suy từ subtype, nên
 *   mọi nơi gọi cũ vẫn chạy đúng.
 */
export function getQuestionsForType(type, subtype = null, filledFields = [], family = undefined) {
  const fam = family === undefined ? familyOfSubtype(subtype) : family;
  return QUESTIONS.filter((q) => {
    if (q.scope !== "all" && q.scope !== type) return false;
    // Câu có `families` hoặc `subtypes` là câu HẸP: chỉ cần khớp 1 trong 2 là được hỏi.
    if (q.families || q.subtypes) {
      const matched =
        (fam && q.families?.includes(fam)) || (subtype && q.subtypes?.includes(subtype));
      if (!matched) return false;
    }
    if (fam && q.skipFamilies?.includes(fam)) return false;
    if (subtype && q.skipSubtypes?.includes(subtype)) return false;
    if (subtype && q.supersededBySubtype) return false;
    if (q.supersededByField && filledFields.includes(q.supersededByField)) return false;
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
  // Ngữ cảnh riêng của dịch vụ đi xe (NOTE-05 §8) — chỉ hiện với xe ghép / xe khách, xem
  // noteContextsForPlace() trong lib/notes.js.
  "diem-don": ["pickup"],
  "diem-tra": ["dropoff"],
  "gio-chay": ["schedule", "service_hours"],
  "loai-xe": ["vehicle_types"],
  "dat-xe": ["ride_booking"],
  "hanh-ly": ["luggage"],
  "cach-goi": ["taxi_hail"],
  "dat-coc": ["rental_deposit"],
  "giay-to": ["rental_papers"],
  "nhan-xe": ["rental_handover"],
  "phi-gui-xe": ["parking_fee"],
  "trong-xe": ["parking_overnight", "parking_accepts"],

  "gui-xe": ["parking"],
  "loi-vao": ["entrance"],
  "thoi-diem": ["best_time", "available_when", "busy_hours"],
  // Chỉ `payment` — `price_style` nói về cách RA GIÁ (niêm yết/trả giá/đồng hồ), không phải
  // cách trả tiền, nên không thuộc ngữ cảnh này.
  "thanh-toan": ["payment"],
  "tien-ich": ["vehicle_amenities", "amenities_an", "amenities_ngu", "facilities"],
};

export function getQuestionForContext(contextId, type, subtype = null, filledFields = [], family = undefined) {
  const ids = CONTEXT_QUESTION_IDS[contextId];
  if (!ids) return null;
  const available = getQuestionsForType(type, subtype, filledFields, family);
  for (const id of ids) {
    const found = available.find((q) => q.id === id);
    if (found) return found;
  }
  return null;
}

export function getQuestion(id) {
  return QUESTIONS.find((q) => q.id === id) ?? null;
}
