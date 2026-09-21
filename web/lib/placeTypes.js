// Nguồn duy nhất cho danh sách loại địa điểm (SPEC-chang-3.md §2) — thêm loại mới chỉ sửa
// file này, 6 nơi khác (form nhập, bộ lọc, câu hỏi, nhãn còn chỗ...) đọc từ đây.
// Thứ tự hiển thị: Ăn · Chơi · Ngủ · Đi lại (đúng thứ tự tên dự án hay nói).

// `browsable` / `asksStatus` mặc định TRUE — 4 loại cũ không khai gì nên không đổi hành vi.
//   browsable: false  -> không lên danh sách + bộ lọc trang chủ (vẫn tìm và chọn được khi làm
//                        lộ trình, vẫn có trang riêng, vẫn hiện trong admin)
//   asksStatus: false -> không hỏi khách "vẫn mở / gửi xe ở đâu / còn phòng không"
//
// `moc` = mốc (chỗ dân lấy làm mốc để chỉ đường). Mã ngắn cho đồng bộ với an/choi/ngu/dilai;
// chữ khách nhìn thấy là **"Chỗ quen gọi"** — "đỉnh dốc Bà The", "cây đa đầu làng", "ngã ba
// chợ": chỗ có thật, có tên truyền miệng, không có địa chỉ, và Google không có. Đúng thứ CDP
// hơn Google (NOTE-15 §20), nên phải giữ được thay vì bắt mỗi người tự gõ lại vào lộ trình.
// KHÔNG lên trang chủ: nó không phải chỗ để đi ăn/chơi/ngủ, và cũng không trả lời được mấy
// câu "còn chỗ không, giá bao nhiêu" mà trang chủ sinh ra để trả lời.
export const PLACE_TYPES = [
  { id: "an", label: "Ăn", noun: "chỗ" },
  { id: "choi", label: "Chơi", noun: "chỗ" },
  { id: "ngu", label: "Ngủ", noun: "phòng" },
  { id: "dilai", label: "Đi lại", noun: "chỗ" },
  { id: "moc", label: "Chỗ quen gọi", noun: "chỗ", browsable: false, asksStatus: false },
];

/** Các loại được bày ở trang chủ (danh sách + 4 tab lọc). Giữ đúng mặt "Ăn · Chơi · Ngủ · Đi lại". */
export const BROWSABLE_PLACE_TYPES = PLACE_TYPES.filter((t) => t.browsable !== false);

/** Chỗ này có hỏi khách "vẫn mở / còn chỗ / gửi xe ở đâu" không. Một cái dốc thì không. */
export function placeTypeAsksStatus(id) {
  return PLACE_TYPES.find((t) => t.id === id)?.asksStatus !== false;
}

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
