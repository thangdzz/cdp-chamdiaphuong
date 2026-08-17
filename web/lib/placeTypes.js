// Nguồn duy nhất cho danh sách loại địa điểm (SPEC-chang-3.md §2) — thêm loại mới chỉ sửa
// file này, 6 nơi khác (form nhập, bộ lọc, câu hỏi, nhãn còn chỗ...) đọc từ đây.
// Thứ tự hiển thị: Ăn · Chơi · Ngủ · Đi lại (đúng thứ tự tên dự án hay nói).

export const PLACE_TYPES = [
  { id: "an", label: "Ăn", noun: "chỗ" },
  { id: "choi", label: "Chơi", noun: "chỗ" },
  { id: "ngu", label: "Ngủ", noun: "phòng" },
  { id: "dilai", label: "Đi lại", noun: "chỗ" },
];

const VALID_TYPE_IDS = new Set(PLACE_TYPES.map((t) => t.id));

export function isValidPlaceType(id) {
  return VALID_TYPE_IDS.has(id);
}

export function getPlaceTypeLabel(id) {
  return PLACE_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function getPlaceTypeNoun(id) {
  return PLACE_TYPES.find((t) => t.id === id)?.noun ?? "chỗ";
}

// Ném ra thay vì âm thầm quy về "ngu" (SPEC-chang-3.md §2 — bài học từ lỗi "nếu không phải
// Ăn thì là Ngủ" cũ). Có class riêng để nơi xử lý theo lô (ingestBatch.js) phân biệt được
// lỗi này với lỗi thật khác, chỉ bỏ qua đúng bản ghi hỏng thay vì làm hỏng cả lô.
export class InvalidPlaceTypeError extends Error {
  constructor(value) {
    super(`Loại địa điểm không hợp lệ: "${value}"`);
    this.name = "InvalidPlaceTypeError";
  }
}

export function assertValidPlaceType(id) {
  if (!isValidPlaceType(id)) throw new InvalidPlaceTypeError(id);
  return id;
}
