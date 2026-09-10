// Taxonomy nhóm "Đi lại" (NOTE-06 §1). Hai tầng:
//
//   transportFamily  -> quyết định bộ field / câu hỏi / CTA NỀN
//   transportSubtype -> chỉ override phần khác biệt
//
// Gom 2 tầng vì "Đi lại" trộn những thứ hành xử khác hẳn nhau: gọi một hãng taxi và đi tới một
// bãi đỗ xe chẳng có gì chung ngoài chữ "đi lại". Có family thì thêm loại mới sau này chỉ là
// khai báo thêm 1 dòng, không phải rải if/else khắp nơi (§14).
//
// KHÔNG lưu `transportFamily` vào từng địa điểm: mỗi subtype thuộc đúng 1 family nên lưu cả 2
// là tự tạo ra khả năng lệch nhau (đã có 2 lần dữ liệu bị ghi đè âm thầm vì kiểu này). Family
// suy ra từ subtype qua transportFamilyOf(). Muốn lưu thật thì chỉ cần đổi đúng hàm đó.

export const TRANSPORT_FAMILIES = [
  { id: "pickup-service", label: "Dịch vụ đón khách" },
  { id: "scheduled-route", label: "Theo tuyến" },
  { id: "transport-place", label: "Điểm giao thông" },
  { id: "self-drive", label: "Tự lái" },
];

export const TRANSPORT_SUBTYPES = [
  // Dịch vụ đón khách — nhóm DUY NHẤT được hoàn thiện ở chặng này (§3)
  { id: "xe-ghep", label: "Xe ghép", family: "pickup-service" },
  { id: "taxi", label: "Taxi", family: "pickup-service" },
  { id: "thue-xe-co-lai", label: "Thuê xe có lái", family: "pickup-service" },

  // 3 family còn lại: mới định nghĩa taxonomy, chưa hoàn thiện logic (§11)
  { id: "xe-khach", label: "Xe khách", family: "scheduled-route" },
  { id: "xe-buyt", label: "Xe buýt", family: "scheduled-route" },
  { id: "ben-xe", label: "Bến xe", family: "transport-place" },
  { id: "diem-don-tra", label: "Điểm đón/trả", family: "transport-place" },
  { id: "bai-xe", label: "Bãi xe", family: "transport-place" },
  { id: "thue-o-to", label: "Thuê ô tô tự lái", family: "self-drive" },
  { id: "thue-xe-may", label: "Thuê xe máy", family: "self-drive" },

  // Giá trị CŨ, giữ để dữ liệu đã lưu không thành không hợp lệ (§13 việc 8). Ẩn khỏi ô chọn
  // của admin — chỗ nào còn giá trị này thì chọn lại "Thuê ô tô tự lái" / "Thuê xe máy".
  { id: "thue-xe", label: "Thuê xe (cũ)", family: "self-drive", legacy: true },
];

// Loại xe — nhiều giá trị cùng lúc (§8): một nhà xe chạy đồng thời 4 chỗ, 7 chỗ và 16 chỗ là
// chuyện thường. Dùng chung id giữa ô admin điền và đáp án khách bấm để 2 nguồn nói cùng
// một thứ tiếng.
export const VEHICLE_TYPES = [
  { id: "4", label: "4 chỗ" },
  { id: "7", label: "7 chỗ" },
  { id: "16", label: "9–16 chỗ" },
  { id: "29", label: "29 chỗ trở lên" },
];

export function vehicleTypeLabel(id) {
  return VEHICLE_TYPES.find((v) => v.id === id)?.label ?? null;
}

export function transportSubtypeLabel(id) {
  return TRANSPORT_SUBTYPES.find((s) => s.id === id)?.label ?? null;
}

export function isValidTransportSubtype(id) {
  return TRANSPORT_SUBTYPES.some((s) => s.id === id);
}

// Danh sách cho ô chọn trong /admin — bỏ giá trị cũ, nhóm theo family.
export function transportSubtypeGroups() {
  return TRANSPORT_FAMILIES.map((family) => ({
    ...family,
    subtypes: TRANSPORT_SUBTYPES.filter((s) => s.family === family.id && !s.legacy),
  }));
}

export function familyOfSubtype(subtypeId) {
  return TRANSPORT_SUBTYPES.find((s) => s.id === subtypeId)?.family ?? null;
}

export function transportFamilyOf(place) {
  if (place?.type !== "dilai") return null;
  return familyOfSubtype(place.transportSubtype);
}

/**
 * Loại xe của một địa điểm, đã gộp cả dữ liệu cũ.
 * @returns {string[]} mảng id trong VEHICLE_TYPES; rỗng nếu chưa có gì.
 */
export function vehicleTypesOf(place) {
  if (Array.isArray(place?.vehicleTypes) && place.vehicleTypes.length > 0) {
    return place.vehicleTypes.filter((id) => vehicleTypeLabel(id));
  }
  // `vehicleSeats` là ô CHỮ TỰ DO của bản trước ("7 chỗ"). Dò lấy con số đầu tiên để chỗ cũ
  // vẫn hiện đúng mà không cần chạy script sửa dữ liệu (§13 việc 8).
  const legacy = place?.vehicleSeats?.match(/\d+/)?.[0];
  return legacy && vehicleTypeLabel(legacy) ? [legacy] : [];
}

// Ô nào admin đã tự điền -> thôi hỏi khách câu tương ứng (lib/questions.js
// `supersededByField`). Chỉ liệt kê ô có câu hỏi trùng nội dung.
export function adminFilledFields(place) {
  const filled = [];
  if (vehicleTypesOf(place).length > 0) filled.push("vehicleTypes");
  return filled;
}

/**
 * Dòng nhận diện đầu thẻ: `Xe ghép · 4 chỗ · 7 chỗ` (NOTE-04 §2, NOTE-06 §8).
 * @returns {string|null} null khi chỗ này không thuộc "Đi lại" hoặc admin chưa chọn loại —
 *   nơi gọi giữ nguyên dòng cũ (địa chỉ rút gọn), không hiện chỗ trống.
 */
export function transportSummary(place) {
  if (place?.type !== "dilai") return null;
  const label = transportSubtypeLabel(place.transportSubtype);
  if (!label) return null;
  return [label, ...vehicleTypesOf(place).map(vehicleTypeLabel)].join(" · ");
}

/**
 * Dòng thứ 2 dưới tên: tuyến chính với xe ghép/xe khách, khu vực phục vụ với taxi/thuê xe có
 * lái (NOTE-06 §4–§7). Chỗ nào có cả hai thì tuyến chính quan trọng hơn.
 * @returns {string|null}
 */
export function transportDetailLine(place) {
  if (place?.type !== "dilai") return null;
  return place.mainRoute || place.serviceArea || null;
}

// --- Danh xưng ------------------------------------------------------------------------
// Để sinh câu mời góp ý tự nhiên (NOTE-05 §9, §11): gọi một hãng taxi là "chỗ này" thì sai
// hẳn — nó không phải một chỗ để đến. Khai theo family, subtype nào cần khác thì override.
const FAMILY_NOUNS = {
  "pickup-service": "dịch vụ",
  "scheduled-route": "nhà xe",
  "transport-place": "địa điểm",
  "self-drive": "cửa hàng",
};
const SUBTYPE_NOUNS = {
  "diem-don-tra": "điểm",
};

export function contributionPrompt(place) {
  const noun = SUBTYPE_NOUNS[place?.transportSubtype] ?? FAMILY_NOUNS[transportFamilyOf(place)];
  return noun ? `Bạn biết thêm về ${noun} này?` : "Bạn biết gì thêm về chỗ này?";
}

// --- CTA chính ------------------------------------------------------------------------
// NOTE-05 §6 + NOTE-06 §10. Với dịch vụ đón khách, "Chỉ đường" là nút vô nghĩa — địa chỉ của
// một hãng taxi là văn phòng của họ, không phải nơi khách cần tới.
//   directions -> mở bản đồ (mặc định, giữ y như trước cho mọi loại khác)
//   contact    -> mở khối "Liên hệ" ngay trong thẻ, nơi có nhãn tin cậy + Gọi + Tìm số trên
//                 Google + Xác nhận/Báo sai (NOTE-05 §7: KHÔNG biến nút Gọi thành CTA chính,
//                 vì số điện thoại ở CDP luôn chỉ là số tham khảo)
//   google     -> chỗ chưa có số nào: đưa thẳng ra Google để khách tự tìm, thay vì một nút
//                 "Liên hệ" bấm vào chẳng có gì
const FAMILY_ACTIONS = {
  "pickup-service": { kind: "contact", label: "Xem thông tin liên hệ", missingPhoneLabel: "Tìm số liên hệ" },
  // scheduled-route / transport-place / self-drive: chưa hoàn thiện (§11–§12). Riêng
  // transport-place và self-drive thì "Chỉ đường" vốn ĐÚNG — đó là chỗ khách phải tới thật.
};
const SUBTYPE_ACTIONS = {
  "xe-ghep": { kind: "contact", label: "Liên hệ đặt xe", missingPhoneLabel: "Tìm số nhà xe" },
  "thue-xe-co-lai": { kind: "contact", label: "Liên hệ thuê xe", missingPhoneLabel: "Tìm số nhà xe" },
  // NOTE-06 §6 muốn taxi đổi thành "Gọi/Đặt taxi" KHI số đủ tin cậy. Không làm: mức tin cậy
  // nằm ở place_phone_confirmations, mỗi chỗ một lệnh Redis riêng — đọc cho cả trang chủ là
  // vỡ quy tắc "3 lệnh/lượt xem" ở ARCHITECTURE. Đọc phía khách thì nhãn nút sẽ nhảy chữ sau
  // khi trang đã hiện. "Xem thông tin gọi xe" luôn đúng, và bấm vào là thấy ngay nhãn đã có
  // mấy người xác nhận.
  taxi: { kind: "contact", label: "Xem thông tin gọi xe", missingPhoneLabel: "Tìm số tổng đài" },
  "xe-khach": { kind: "contact", label: "Liên hệ nhà xe", missingPhoneLabel: "Tìm số nhà xe" },
};

/**
 * @returns {{kind: "directions"|"contact"|"google", label: string}}
 */
export function primaryAction(place) {
  const action =
    place?.type === "dilai"
      ? (SUBTYPE_ACTIONS[place.transportSubtype] ?? FAMILY_ACTIONS[transportFamilyOf(place)])
      : null;
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
