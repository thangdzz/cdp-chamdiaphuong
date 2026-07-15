import { inboxSource } from "./inboxSource.js";

// Danh sách nguồn được quét mỗi ngày. Thêm nguồn thật (booking platform, official_gov...)
// bằng cách viết adapter mới cùng interface { id, type, fetch() } rồi thêm vào đây.
//
// TODO(v2): nguồn screenshot OCR — đọc ảnh trong data/ingestion-inbox/screenshots/,
// OCR ra text, rồi map về cùng shape { sourceId, sourceType: "screenshot_ocr", records }.
// Chưa code OCR ở task này, chỉ chừa thư mục (xem data/ingestion-inbox/screenshots/README.md).
export const SOURCES = [inboxSource];
