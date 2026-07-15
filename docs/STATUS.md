# STATUS — Tình trạng hiện tại

> Cập nhật file này **cuối mỗi phiên làm việc**. Mục tiêu: ai đọc file này cũng biết ngay
> đang ở đâu, không cần đọc lại toàn bộ lịch sử chat. Chi tiết từng giai đoạn xem
> [ROADMAP.md](ROADMAP.md); lý do các quyết định xem [DECISIONS.md](DECISIONS.md).

## Đang ở giai đoạn nào
**Giai đoạn 5a + AI quét dữ liệu hằng ngày (bán tự động) hoàn thành** — chuẩn bị Giai đoạn
6 (hoàn thiện + kiểm thử trước lễ hội, mốc 21/08/2026).

## Tóm tắt tiến độ
- Bộ khung tài liệu, 21 địa điểm (10 Ngủ + 11 Ăn), web hiển thị + bộ lọc (loại hình/khu
  vực/giá) + trạng thái còn chỗ (3 mức, suy luận theo lịch lễ hội), banner + bài viết Lễ
  hội Thành Tuyên 2026, trang quản trị `/admin` chạy trên Upstash Redis.
- **Pipeline "AI quét dữ liệu hằng ngày"** (`lib/ingestion/`): chuẩn hoá → so khớp/dedupe →
  ghi hàng chờ duyệt riêng, không đụng `places:live`. `/admin` có mục "Hàng chờ duyệt tự
  động — AI quét" để duyệt/từ chối (địa điểm mới, có thay đổi, nghi trùng lặp, lâu chưa xác
  nhận, độ tin cậy thấp).
- **Lịch chạy hằng ngày (8h sáng, claude.ai routine "CDP - Quét dữ liệu Ăn/Ngủ Tuyên Quang
  hằng ngày"):** tự tìm kiếm web thật, trả kết quả qua báo cáo chat — **bán tự động**, xem
  quy trình bên dưới.
- Link thật: 👉 https://web-five-xi-28.vercel.app (trang duyệt ở `/admin`)
- Code: 👉 github.com/thangdzz/cdp-chamdiaphuong (Public)

## Quy trình hằng ngày (bán tự động) — anh cần làm gì
1. Mỗi sáng ~8h, routine tự chạy, tìm kiếm web, trả về 1 báo cáo (JSON + tóm tắt).
2. Anh mở https://claude.ai/code/routines xem kết quả, **copy nguyên đoạn báo cáo dán vào
   chat với em**.
3. Em chạy `scripts/run-daily-ingest.mjs` với dữ liệu đó, đưa vào hàng chờ duyệt.
4. Anh vào `/admin` mục "Hàng chờ duyệt tự động" để duyệt/từ chối như bình thường.

(Không tự động 100% được — xem lý do ở DECISIONS.md mục "2026-07-15 — AI quét dữ liệu hằng
ngày: chuyển sang bán tự động".)

## Cập nhật gần nhất

### 2026-07-15 — Sửa lỗi định dạng giá tiền
- Bỏ ô "Giá (hiển thị)" gõ tay trong `/admin` (dễ lệch định dạng) — giờ chỉ nhập giá thấp/
  cao/đơn vị, hệ thống tự tính chữ hiển thị (`lib/priceFormat.js`). Đã backfill dữ liệu cũ,
  test và triển khai xong.

### 2026-07-15 — Xây pipeline AI quét dữ liệu hằng ngày + đặt lịch chạy thật
- Xây `lib/ingestion/` (normalize, match/dedupe, review queue, source_runs, place
  snapshots) + mục "Hàng chờ duyệt tự động" trong `/admin`. Test kỹ bằng dữ liệu mẫu (4
  tình huống: chỗ mới, có đổi giá, nghi trùng lặp, thiếu dữ liệu) — phân loại đúng, chạy
  lại không tạo trùng.
- Sự cố phát hiện & đã sửa: nút Duyệt/Từ chối dùng chung 1 hàm phân biệt bằng `name`/
  `value` trên nút — **không hoạt động với Server Action của Next.js** (cả 2 nút bị hiểu
  nhầm là 1 loại). Sửa: tách 2 hàm riêng (`approveReviewItem`/`rejectReviewItem`).
- Đưa code lên GitHub thật lần đầu (`github.com/thangdzz/cdp-chamdiaphuong`, Public — cần
  Public vì vướng quyền GitHub App lúc thiết lập, xem DECISIONS.md).
- Đặt lịch cho 1 phiên AI (claude.ai routine) tự tìm kiếm web mỗi ngày 8h sáng. Thử "hoàn
  toàn tự động" (routine tự ghi vào Redis, rồi thử vòng qua GitHub) nhưng gặp 3 giới hạn hạ
  tầng/gói dịch vụ liên tiếp — **chuyển sang bán tự động**: routine chỉ tìm + báo cáo qua
  chat, anh dán vào chat để em xử lý vào hàng chờ duyệt (~30 giây). Chi tiết đầy đủ ở
  DECISIONS.md.
- Bước tiếp theo hợp lý nhất: Chờ báo cáo đầu tiên từ routine (đã trigger test, đang chờ
  kết quả) để xác nhận quy trình bán tự động chạy trơn tru. Sau đó quay lại Giai đoạn 6.

## Câu hỏi/vướng mắc đang mở
- 21 địa điểm: vài ô giá/SĐT/địa chỉ còn để trống — anh có thể tự điền qua `/admin`.
- Mật khẩu `/admin` hiện khá đơn giản (anh tự chọn) — nên đổi khi làm Giai đoạn 5b (bảo mật
  đầy đủ).
- Lọc theo giờ mở cửa/tiện ích: chờ có dữ liệu thật cho các địa điểm.
- Repo GitHub đang Public (không có bí mật gì trong đó) — có thể đổi lại Private sau nếu
  tìm được cách cấp quyền đúng, hoặc nếu nâng cấp gói Claude Team/Enterprise.
- `githubScanSource.js` + `vercel.json` (Vercel Cron) hiện không có tác dụng thật (routine
  không ghi file lên GitHub nữa) — giữ lại vô hại, dùng ngay được nếu sau này gỡ được giới
  hạn ghi GitHub hoặc chuyển sang Google Places API.
