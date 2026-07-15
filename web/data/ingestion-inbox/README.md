# ingestion-inbox

Thư mục mô phỏng "nguồn công khai" cho luồng quét dữ liệu hằng ngày
(`lib/ingestion/sources/inboxSource.js`).

Hiện tại **chưa nối API tìm kiếm/Google Places thật** — mỗi file `.json` ở đây đại diện
cho kết quả 1 nguồn công khai trả về trong ngày. Cấu trúc: 1 mảng các bản ghi thô, tối
thiểu có `name` và `category_primary` (`"an"` hoặc `"ngu"`).

Khi có nguồn thật (booking platform, API tìm kiếm...), viết adapter riêng cùng interface
`{ id, type, fetch() }` trong `lib/ingestion/sources/`, không cần đổi gì ở normalize/match.

Xem `sample-public-source.json` làm ví dụ. Thư mục `screenshots/` — xem README riêng.
