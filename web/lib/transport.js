// Nhóm "Đi lại" gộp những thứ khác hẳn nhau: bến xe, taxi, thuê xe máy, xe ghép, bãi đỗ...
// Trước đây cả 15 chỗ dùng chung đúng một bộ field, nên "Xe ghép Anh Huy" bị hỏi "Gửi xe ở
// đâu?", "Lối vào thế nào?" và "Đây là chỗ gì? → Bến xe / Thuê xe / Điểm taxi / Bãi gửi xe"
// (không ô nào đúng). `transportSubtype` nói rõ đây là loại nào để mỗi loại được hỏi đúng
// câu hỏi của nó (NOTE-04 §1).
//
// Ai điền gì (anh chốt 2026-09-09, đúng cách NOTE-04 §5 tách 2 cơ chế):
//   - Loại xe + Tuyến chính -> admin điền trong /admin. Đây là thông tin cố định của nhà xe,
//     quét được và hiếm khi đổi; khách vãng lai cũng không rõ bằng chính nhà xe.
//   - Hình thức / Điểm đón / Điểm trả / Đặt trước / Hành lý -> khách bấm chọn (lib/questions.js),
//     vì đó là thứ đi rồi mới biết thật.

export const TRANSPORT_SUBTYPES = [
  { id: "xe-ghep", label: "Xe ghép" },
  { id: "taxi", label: "Taxi" },
  { id: "xe-khach", label: "Xe khách" },
  { id: "xe-buyt", label: "Xe buýt" },
  { id: "thue-xe", label: "Thuê xe" },
  { id: "diem-don-tra", label: "Điểm đón trả" },
  { id: "bai-xe", label: "Bãi xe" },
];

export function transportSubtypeLabel(id) {
  return TRANSPORT_SUBTYPES.find((s) => s.id === id)?.label ?? null;
}

export function isValidTransportSubtype(id) {
  return TRANSPORT_SUBTYPES.some((s) => s.id === id);
}

/**
 * Dòng nhận diện đầu thẻ: `Xe ghép · 7 chỗ` (NOTE-04 §2).
 * @returns {string|null} null khi chỗ này không thuộc "Đi lại" hoặc admin chưa chọn loại —
 *   nơi gọi giữ nguyên dòng cũ (địa chỉ rút gọn), không hiện chỗ trống.
 */
export function transportSummary(place) {
  if (place?.type !== "dilai") return null;
  const label = transportSubtypeLabel(place.transportSubtype);
  if (!label) return null;
  return [label, place.vehicleSeats].filter(Boolean).join(" · ");
}

// Ô nào admin đã tự điền -> thôi hỏi khách câu tương ứng (lib/questions.js
// `supersededByField`). Chỉ liệt kê ô có câu hỏi trùng nội dung.
const ADMIN_OWNED_FIELDS = ["vehicleSeats"];
export function adminFilledFields(place) {
  return ADMIN_OWNED_FIELDS.filter((field) => place?.[field]);
}

// Danh xưng để sinh câu mời góp ý tự nhiên (NOTE-05 §9, §11): gọi một nhà xe ghép là "chỗ này"
// thì sai hẳn — nó không phải một chỗ để đến.
const SUBTYPE_NOUNS = {
  "xe-ghep": "dịch vụ",
  "xe-khach": "nhà xe",
  "diem-don-tra": "điểm",
  "bai-xe": "địa điểm",
};

export function contributionPrompt(place) {
  const noun = place?.type === "dilai" ? SUBTYPE_NOUNS[place.transportSubtype] : null;
  return noun ? `Bạn biết thêm về ${noun} này?` : "Bạn biết gì thêm về chỗ này?";
}

// CTA chính theo subtype (NOTE-05 §6). Với dịch vụ đi xe, "Chỉ đường" là nút vô nghĩa —
// địa chỉ của nhà xe ghép là nơi họ đăng ký, không phải nơi khách cần tới.
//   directions -> mở bản đồ (mặc định, giữ y như trước cho mọi loại khác)
//   contact    -> mở khối "Liên hệ" ngay trong thẻ, nơi có nhãn tin cậy + Gọi + Tìm số trên
//                 Google + Xác nhận/Báo sai (NOTE-05 §7: KHÔNG biến nút Gọi thành CTA chính,
//                 vì số điện thoại ở CDP luôn chỉ là số tham khảo)
//   google     -> chỗ chưa có số nào: đưa thẳng ra Google để khách tự tìm, thay vì một nút
//                 "Liên hệ" bấm vào chẳng có gì
const SUBTYPE_ACTIONS = {
  "xe-ghep": { kind: "contact", label: "Liên hệ đặt xe", missingPhoneLabel: "Tìm số nhà xe" },
  "xe-khach": { kind: "contact", label: "Liên hệ nhà xe", missingPhoneLabel: "Tìm số nhà xe" },
  // taxi / xe-buyt / thue-xe: P1 (NOTE-05 §13), tạm giữ "Chỉ đường" như cũ.
  // diem-don-tra / bai-xe: NOTE-05 §6 chốt "Chỉ đường" — đúng mặc định, không cần khai báo.
};

/**
 * @returns {{kind: "directions"|"contact"|"google", label: string}}
 */
export function primaryAction(place) {
  const action = place?.type === "dilai" ? SUBTYPE_ACTIONS[place.transportSubtype] : null;
  if (!action) return { kind: "directions", label: "Chỉ đường" };
  if (!place.phone) return { kind: "google", label: action.missingPhoneLabel };
  return { kind: "contact", label: action.label };
}

// Truy vấn Google tìm số — cùng mẫu với nút "Tìm số trên Google" trong PhoneBlock, để 2 nơi
// luôn ra cùng một kết quả.
export function findPhoneOnGoogleUrl(place) {
  const query = `${place.name} ${place.ward ?? ""} Tuyên Quang số điện thoại`.replace(/\s+/g, " ").trim();
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`;
}
