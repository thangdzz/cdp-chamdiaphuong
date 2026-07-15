# STATUS — Tình trạng hiện tại

> Cập nhật file này **cuối mỗi phiên làm việc**. Mục tiêu: ai đọc file này cũng biết ngay
> đang ở đâu, không cần đọc lại toàn bộ lịch sử chat. Chi tiết từng giai đoạn xem
> [ROADMAP.md](ROADMAP.md); lý do các quyết định xem [DECISIONS.md](DECISIONS.md).

## Đang ở giai đoạn nào
**Giai đoạn 5a hoàn thành + AI quét dữ liệu hằng ngày (v2, sớm hơn dự kiến)** — chuẩn bị
Giai đoạn 6 (hoàn thiện + kiểm thử trước lễ hội).

## Tóm tắt tiến độ
- Bộ khung tài liệu, 21 địa điểm (10 Ngủ + 11 Ăn — anh đã tự thêm qua `/admin`), web hiển
  thị + bộ lọc (loại hình/khu vực/giá) + trạng thái còn chỗ (3 mức, suy luận theo lịch lễ
  hội), banner + bài viết Lễ hội Thành Tuyên 2026, trang quản trị `/admin` chạy trên
  Upstash Redis.
- **Pipeline "AI quét dữ liệu hằng ngày"** (`lib/ingestion/`): quét nguồn công khai →
  chuẩn hoá → so khớp/dedupe → ghi hàng chờ duyệt riêng (`ingestion:review_queue`, không
  đụng `places:live`). `/admin` đã có mục "Hàng chờ duyệt tự động — AI quét" để duyệt/từ
  chối từng loại (địa điểm mới, có thay đổi, nghi trùng lặp, lâu chưa xác nhận, độ tin cậy
  thấp).
- Link thật: 👉 https://web-five-xi-28.vercel.app (trang duyệt ở `/admin`)

## Cập nhật gần nhất

### 2026-07-15 — Sửa lỗi định dạng giá tiền
- Phát hiện: anh tự thêm "Min Garden Coffee" qua `/admin`, gõ giá "35000" (không dấu chấm,
  không đơn vị) vào ô "Giá (hiển thị)" — ô này trước đây là gõ tay tự do nên dễ lệch định
  dạng so với các chỗ em nhập sẵn có dấu chấm + đơn vị.
- Đã sửa tận gốc: bỏ hẳn ô "Giá (hiển thị)" gõ tay. Giờ chỉ nhập **giá thấp nhất, giá cao
  nhất, đơn vị** (đêm/bát/ly...) — hệ thống tự tính ra chữ hiển thị (`lib/priceFormat.js`),
  luôn đúng định dạng "35.000 đ/...". Trang `/admin` có hiện thử "Giá sẽ hiển thị cho
  khách" để anh kiểm tra trước khi lưu.
- Đã cập nhật dữ liệu cũ cho khớp (script `scripts/backfill-price-unit.mjs`), đã kiểm tra
  trên trình duyệt và triển khai lên bản thật.
- Bước tiếp theo hợp lý nhất: Giai đoạn 6 — bổ sung dữ liệu thật (giá, SĐT) qua `/admin`,
  kiểm thử kỹ trên điện thoại thật, trước mốc 21/08/2026.

### 2026-07-15 — Pipeline AI quét dữ liệu hằng ngày + duyệt trong /admin
- Đã làm: Xây `lib/ingestion/` (normalize, match/dedupe, review queue, source_runs, place
  snapshots) theo yêu cầu chi tiết của anh — quét → chuẩn hoá → so khớp → ghi hàng chờ
  duyệt, không tự publish. Đã test kỹ bằng dữ liệu mẫu (4 tình huống: chỗ mới, có đổi giá,
  nghi trùng lặp, thiếu dữ liệu) — phân loại đúng, chạy lại không tạo trùng.
- Đã làm: Thêm mục "Hàng chờ duyệt tự động" vào `/admin`, nút Duyệt/Từ chối theo từng loại.
- Sự cố phát hiện & đã sửa: 2 nút Duyệt/Từ chối ban đầu dùng chung 1 hàm phân biệt bằng
  `name`/`value` trên nút — cách này **không hoạt động đúng với Server Action** của
  Next.js (cả 2 nút đều bị hiểu là 1 loại). Đã sửa: tách thành 2 hàm riêng
  (`approveReviewItem`/`rejectReviewItem`), giống cách đã làm đúng ở phần "Chờ duyệt" cũ.
  Test lại xác nhận cả 4 tình huống hoạt động đúng.
- Anh chọn hướng lấy dữ liệu thật: **đặt lịch cho 1 phiên AI tự tìm kiếm web mỗi ngày**
  (không phải job chạy nền thông thường) — tốn hạn mức dùng AI, khác với Vercel Cron miễn
  phí đã viết sẵn (`app/api/cron/daily-ingest`, chưa bật).
- Bước tiếp theo hợp lý nhất: Đặt lịch phiên AI hằng ngày (đang làm), sau đó quay lại
  Giai đoạn 6 (bổ sung dữ liệu thật, kiểm thử trước 21/08/2026).

## Câu hỏi/vướng mắc đang mở
- 21 địa điểm: vài ô giá/SĐT/địa chỉ còn để trống — anh có thể tự điền qua `/admin`.
- Chưa nối code với GitHub (cần cài `gh` hoặc thiết lập git đăng nhập trên máy anh) — không
  chặn tiến độ, làm sau khi tiện.
- Lọc theo giờ mở cửa/tiện ích: chờ có dữ liệu thật cho các địa điểm.
- Mật khẩu `/admin` hiện khá đơn giản (anh tự chọn) — nên đổi khi làm Giai đoạn 5b (bảo mật
  đầy đủ).
- Nguồn dữ liệu ingestion hiện là mock (đọc file JSON nội bộ) — sắp thay bằng phiên AI đặt
  lịch tìm kiếm web thật.
- Vercel Cron (`app/api/cron/daily-ingest`) đã viết nhưng chưa bật lịch trong `vercel.json`
  — dự phòng nếu sau này đổi sang nguồn API trả phí thay vì phiên AI.
