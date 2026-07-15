import { inboxSource } from "./inboxSource.js";
import { githubScanSource } from "./githubScanSource.js";

// Danh sách nguồn được quét mỗi ngày. Thêm nguồn thật (booking platform, official_gov...)
// bằng cách viết adapter mới cùng interface { id, type, fetch() } rồi thêm vào đây.
//
// - inboxSource: đọc file cục bộ trong data/ingestion-inbox/ — dùng khi chạy script thủ
//   công/local (`scripts/run-daily-ingest.mjs`).
// - githubScanSource: đọc file mới nhất do phiên AI đặt lịch (claude.ai routine) commit
//   lên GitHub — dùng khi chạy qua Vercel Cron (`app/api/cron/daily-ingest`), vì phiên AI
//   không gọi thẳng được Upstash (bị chặn mạng ở môi trường cloud của nó).
//
// TODO(v2): nguồn screenshot OCR — đọc ảnh trong data/ingestion-inbox/screenshots/,
// OCR ra text, rồi map về cùng shape { sourceId, sourceType: "screenshot_ocr", records }.
// Chưa code OCR ở task này, chỉ chừa thư mục (xem data/ingestion-inbox/screenshots/README.md).
export const SOURCES = [inboxSource, githubScanSource];
