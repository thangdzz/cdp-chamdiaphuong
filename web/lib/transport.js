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
