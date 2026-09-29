# ingestion-inbox

Thư mục "nguồn công khai" cho luồng quét dữ liệu hằng ngày. File `.json` ở **thư mục gốc
này** (không phải trong `examples/`) sẽ được quét thật mỗi lần chạy — mảng các bản ghi thô,
tối thiểu có `name` và `category_primary` — một trong **4 nhóm**: `"an"` (Ăn), `"choi"` (Chơi),
`"ngu"` (Ngủ), `"dilai"` (Đi lại). Danh sách chuẩn nằm ở `lib/placeTypes.js`; giá trị ngoài danh
sách bị từ chối (`assertValidPlaceType`). Loại thứ 5 `"moc"` (Chỗ quen gọi) cũng hợp lệ nhưng
không lên trang chủ, thường do admin/khách tạo chứ không do routine quét.

## Nguồn dữ liệu thật hiện tại: phiên AI đặt lịch trên claude.ai
Mỗi ngày (8h sáng), 1 routine trên claude.ai tự tìm kiếm web, ghi kết quả vào
`web-scan-latest.json` rồi commit lên GitHub — vì môi trường cloud của nó bị chặn gọi
thẳng tới Upstash. Vercel Cron (`app/api/cron/daily-ingest`, xem `vercel.json`) đọc file
này qua HTTP mỗi khi chạy (`lib/ingestion/sources/githubScanSource.js`) và ghi vào hàng
chờ duyệt — không cần deploy lại mỗi ngày.

## Test thủ công / nguồn khác
Có thể thêm file `.json` khác vào đây để `inboxSource.js` (đọc file cục bộ) quét khi chạy
`scripts/run-daily-ingest.mjs` trên máy. Xem `examples/sample-public-source.json` làm ví
dụ cấu trúc (file này không được quét thật, chỉ để tham khảo). Thư mục `screenshots/` —
xem README riêng.
