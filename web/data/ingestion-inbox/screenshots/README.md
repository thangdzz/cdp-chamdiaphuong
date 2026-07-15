# screenshots (chỗ chừa cho OCR — chưa hoàn thiện)

Dự kiến: bỏ ảnh chụp màn hình (Google Maps, Facebook, Zalo...) vào đây, một tiến trình OCR
sẽ đọc ảnh -> tách thành text -> map về cùng shape bản ghi thô mà
`lib/ingestion/sources/inboxSource.js` đang dùng (`name`, `category_primary`,
`address_text`, `phone`, `price_range_text`...), gắn `sourceType: "screenshot_ocr"`
(đã có trọng số tin cậy riêng ở `lib/ingestion/schema.js` — thấp hơn nguồn khác vì OCR dễ
sai).

**Chưa code OCR ở đây.** Khi làm, thêm 1 adapter mới (ví dụ `screenshotOcrSource.js`) cùng
interface `fetch()` như các adapter khác, rồi thêm vào `lib/ingestion/sources/index.js`.
