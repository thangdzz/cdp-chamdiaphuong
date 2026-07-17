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

### 2026-07-15 (tối) — Nhận mẫu UI card 2 lớp mới, CHƯA CODE
Anh gửi 6 ảnh mẫu (ASCII mockup) cho giao diện card địa điểm mới, áp dụng cho cả Ăn và
Ngủ. Cấu trúc 3 lớp:
1. **Card gọn** (quyết nhanh): tên, loại, địa chỉ ngắn, giá, nhãn trạng thái mềm ("Có tín
   hiệu còn chỗ/phòng" hoặc "Chưa đủ dữ liệu"), nút [Chỉ đường] [Xem thêm].
2. **Bung tại chỗ** (bấm "Xem thêm", KHÔNG qua trang riêng): địa chỉ đầy đủ, khu vực, loại
   hình/món chính, phù hợp (riêng Ăn), cập nhật gần nhất, độ tin cậy (dạng chữ), nguồn đối
   chiếu (số), ghi chú, cụm 3 ảnh nhỏ + "Xem thêm N ảnh"; đổi nút thành [Gọi ngay] [Chỉ
   đường] [Báo sai].
3. **Gallery toàn màn hình** (bấm vào cụm ảnh): đếm ảnh (vd "1/8"), ảnh lớn, vuốt ngang đổi
   ảnh, dải thumbnail dưới, đóng bằng vuốt lên/xuống, mượt, ưu tiên mobile.

**Việc cần làm rõ trước khi code** (đã note với anh, chưa hỏi kỹ):
- Nhiều trường **chưa có trong dữ liệu hiện tại**: món chính, phù hợp, ghi chú, ảnh, số
  điện thoại (để [Gọi ngay]), độ tin cậy dạng chữ, số nguồn đối chiếu, mốc "cập nhật gần
  nhất". Cần bổ sung schema + dữ liệu mẫu trước khi code thật, hoặc code UI trước với
  placeholder rồi nối dữ liệu sau — cần hỏi anh hướng nào.
- Nhãn trạng thái mềm: mẫu chỉ cho thấy 1 trạng thái tích cực ("Có tín hiệu còn chỗ/phòng")
  — chưa rõ có giữ mức thứ 3 ("Khả năng hết chỗ cao" đang có) hay rút còn 2 mức.
- "Báo sai" là tính năng phản hồi MỚI từ khách — chưa có trong phạm vi V1 trước đây, cần
  xác nhận có làm thật (ghi vào đâu) hay chỉ là placeholder UI.

**Chưa code gì** — anh dặn đợi tin nhắn "code" mới bắt đầu.

### 2026-07-15 (chiều) — Sửa lỗi hàng chờ duyệt tự động
- Cho phép sửa trực tiếp thông tin (tên, loại, địa chỉ, khu vực, giá, đơn vị) ngay trong
  từng thẻ ở "Hàng chờ duyệt tự động", bấm Duyệt là áp dụng luôn — không cần duyệt xong rồi
  xuống mục "Đang công khai" sửa lại. Tách `lib/placeForm.js` dùng chung.
- Sự cố phát hiện & đã sửa: bấm "Không trùng, bỏ qua" (cho mục nghi trùng lặp) trước đây
  làm dữ liệu "biến mất" khỏi giao diện (chỉ đổi status ẩn đi, không mất thật trong Redis).
  Đã sửa: bấm nút này giờ chuyển thành "Địa điểm mới", giữ nguyên trong hàng chờ để sửa/
  duyệt tiếp. Đã khôi phục 1 mục bị ảnh hưởng trước đó (Mộc Restaurant).

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
- **Card 2 lớp mới (Ăn/Ngủ) — đang chờ anh nhắn "code"**: cần chốt trước — nguồn dữ liệu
  cho các trường mới (món chính, ghi chú, ảnh, SĐT, độ tin cậy chữ, nguồn đối chiếu, cập
  nhật gần nhất), số mức nhãn trạng thái (2 hay 3), và "Báo sai" có làm thật không.
- 21 địa điểm: vài ô giá/SĐT/địa chỉ còn để trống — anh có thể tự điền qua `/admin`.
- Mật khẩu `/admin` hiện khá đơn giản (anh tự chọn) — nên đổi khi làm Giai đoạn 5b (bảo mật
  đầy đủ).
- Lọc theo giờ mở cửa/tiện ích: chờ có dữ liệu thật cho các địa điểm.
- Repo GitHub đang Public (không có bí mật gì trong đó) — có thể đổi lại Private sau nếu
  tìm được cách cấp quyền đúng, hoặc nếu nâng cấp gói Claude Team/Enterprise.
- `githubScanSource.js` + `vercel.json` (Vercel Cron) hiện không có tác dụng thật (routine
  không ghi file lên GitHub nữa) — giữ lại vô hại, dùng ngay được nếu sau này gỡ được giới
  hạn ghi GitHub hoặc chuyển sang Google Places API.
