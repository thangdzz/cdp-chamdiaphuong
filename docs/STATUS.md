# STATUS — Tình trạng hiện tại

> Cập nhật file này **cuối mỗi phiên làm việc**. Mục tiêu: ai đọc file này cũng biết ngay
> đang ở đâu, không cần đọc lại toàn bộ lịch sử chat. Chi tiết từng giai đoạn xem
> [ROADMAP.md](ROADMAP.md); lý do các quyết định xem [DECISIONS.md](DECISIONS.md).

## Đang ở giai đoạn nào
**Giai đoạn 5a + AI quét dữ liệu hằng ngày (bán tự động, auto-publish) + card 2 lớp + "đề
xuất sửa/ảnh + thưởng điểm/huy hiệu" — hoàn thành.** KPI số lượng dữ liệu (Giai đoạn 6) giờ
thong thả — chuyển hướng để khách tự đóng góp/sửa dần qua tính năng mới thay vì chỉ anh + em
quét (quyết định 2026-07-18, xem DECISIONS.md).

## Tóm tắt tiến độ
- 25 địa điểm, web hiển thị + bộ lọc (loại hình/khu vực/giá).
- **Card 2 lớp** (Ăn & Ngủ): thẻ gọn (tên/loại/địa chỉ/giá/nhãn trạng thái mềm) → bấm
  "Xem thêm" bung tại chỗ (địa chỉ đầy đủ, khu vực, độ tin cậy, nguồn đối chiếu, cập nhật
  gần nhất, ghi chú, cụm ảnh) → bấm ảnh mở gallery toàn màn hình (vuốt ngang đổi ảnh, vuốt
  lên/xuống đóng).
- **"Báo sai" / "Bổ sung ảnh"** (mới, 2026-07-18): khách bấm ngay trong thẻ, sửa field
  (địa chỉ/SĐT/giá) hoặc báo "đã đóng cửa", hoặc gửi tối đa 3 ảnh/lần (lưu ở Vercel Blob,
  gói mới tạo `cdp-photos`). Lần đầu góp ý: đặt biệt danh ẩn danh (không cần tài khoản) +
  nhận **mã khôi phục 6 số** để giữ điểm khi đổi máy/trình duyệt. Sau khi gửi: cảm ơn →
  chọn 1 trong 10 lĩnh vực quan tâm (bỏ qua được) → hiện huy hiệu hiện tại (SVG, đèn lồng
  cách điệu) + vài người trên/dưới cùng lĩnh vực. Mọi góp ý vào hàng chờ `/admin` mục
  "Góp ý từ khách" — duyệt đúng mới áp dụng + cộng điểm (sửa +5, ảnh +10).
- **Pipeline "AI quét dữ liệu hằng ngày"** (`lib/ingestion/`): chuẩn hoá → so khớp/dedupe →
  **tự động công khai luôn** (chỗ mới/có đổi/kể cả tin cậy thấp), **chỉ giữ lại chờ duyệt
  khi nghi trùng lặp hoặc mâu thuẫn dữ liệu** (quyết định 2026-07-15, đảo ngược nguyên tắc
  "luôn phải duyệt" ban đầu — xem DECISIONS.md).
- **Lịch chạy hằng ngày** (8h sáng, claude.ai routine): tự tìm kiếm web thật, trả báo cáo
  qua chat — **bán tự động** (anh dán báo cáo vào chat, em xử lý ~30 giây), vì cloud agent
  bị chặn ghi thẳng vào Redis/GitHub (xem DECISIONS.md).
- Link thật: 👉 https://web-five-xi-28.vercel.app · Trang duyệt: `/admin`
- Code: 👉 github.com/thangdzz/cdp-chamdiaphuong (Public)

## Quy trình hằng ngày — anh cần làm gì
1. Mỗi sáng ~8h, routine tự chạy, tìm kiếm web, trả về 1 báo cáo (JSON + tóm tắt).
2. Anh mở https://claude.ai/code/routines xem kết quả, copy báo cáo dán vào chat với em.
3. Em xử lý — **đa số chỗ tự lên web luôn, không cần anh làm gì thêm** (em cũng cập nhật
   lại "danh sách chỗ đã biết" cho routine ngày mai, không cần anh làm gì).
4. Anh chỉ cần vào `/admin` mục "Hàng chờ duyệt tự động" khi có **nghi trùng lặp** hoặc
   **mâu thuẫn dữ liệu** (khung cảnh báo đỏ) — xác nhận đúng/sai để hệ thống xử lý tiếp.

## Cập nhật gần nhất

### 2026-07-18 (sau) — "Báo sai/Bổ sung ảnh" + thưởng điểm/huy hiệu (Phần 3, hoàn thành)
Làm trọn gói theo yêu cầu anh (gộp đợt 1+2), đã bàn kỹ thiết kế trước khi code:
- Tạo Vercel Blob store `cdp-photos` (public) để lưu ảnh khách gửi — chưa có trước đây.
- 10 lĩnh vực × 5 bậc danh hiệu (`lib/badges.js`), icon SVG vẽ tay theo bậc (`BadgeIcon.js`).
- Hồ sơ ẩn danh + mã khôi phục 6 số (`lib/contributors.js`) — giải quyết vấn đề "chưa có
  tài khoản": mất tiến trình khi đổi máy là rủi ro lớn nhất, mã khôi phục giảm nhẹ rủi ro
  này mà không cần đăng nhập thật.
- Hàng chờ góp ý riêng (`lib/suggestions.js`, `user_suggestions`) — tách khỏi review_queue
  AI, duyệt riêng trong `/admin` mục "Góp ý từ khách".
- Đã test đầy đủ bằng Playwright + dữ liệu TESTQA (không đụng dữ liệu thật): luồng báo sai,
  gửi ảnh, đặt biệt danh, mã khôi phục (khôi phục đúng từ trình duyệt "mới"), chọn lĩnh
  vực, hiển thị huy hiệu + xếp hạng gần bạn, báo đóng cửa (gỡ khỏi live đúng), duyệt trong
  `/admin` (cộng điểm đúng, ảnh áp dụng đúng). Phát hiện 1 điều cần lưu ý (không phải bug
  cần sửa): bấm duyệt liên tiếp quá nhanh trong `/admin` có thể mất 1 lượt (đọc-sửa-ghi
  không khoá) — không ảnh hưởng dùng thật vì admin luôn duyệt từng cái một.

### 2026-07-18 — Sửa 3 lỗi lộ ra khi xử lý dữ liệu quét thật (quét trùng, ghi đè âm thầm, dữ liệu sai)
Xử lý báo cáo thật đầu tiên (38 bản ghi, gộp 4 lần quét) lộ ra 3 vấn đề, đã sửa cả 3:
1. **Quét trùng chỗ đã biết:** routine không biết 39 chỗ hiện có là gì nên hay tìm lại đúng
   tên cũ. Đã thêm `scripts/export-known-places.mjs` xuất `data/known-places-snapshot.json`
   (tên + loại hình, không có gì nhạy cảm) — routine giờ đọc file này trước, tránh tìm lại.
   **Cần làm mỗi lần xử lý xong 1 báo cáo:** chạy lại script này rồi commit + push, để
   routine hôm sau đọc được danh sách mới nhất.
2. **Ghi đè âm thầm khi 2 nguồn đá nhau:** phát hiện qua ca Feline Café (2 địa chỉ khác
   nhau từ 2 nguồn) — hệ thống cũ chỉ lấy tin đến sau, không báo có mâu thuẫn. Đã sửa: khi
   địa chỉ/SĐT của 1 chỗ đang chờ duyệt bị 2 nguồn cho giá trị khác nhau, **giữ nguyên giá
   trị cũ** và hiển thị cảnh báo đỏ trong `/admin` để anh tự chọn, không tự ý ghi đè nữa.
3. **Dữ liệu sai bị đưa trở lại:** batch hôm nay vô tình ghi đè "Nhà hàng Dũng Cá" bằng địa
   chỉ/SĐT của "Mộc Restaurant" (2 chỗ khác nhau, anh đã xác nhận trước đó) — undo đúng sửa
   thủ công anh làm trước đây. Đã: (a) sửa lại đúng dữ liệu 2 chỗ này (tra Google + Facebook
   xác nhận), (b) xây "bộ nhớ đã xác nhận khác nhau" — từ giờ khi anh xác nhận 1 lần "không
   trùng" trong `/admin`, hệ thống nhớ mãi, không hỏi lại chỗ đó nữa. Cũng dặn routine ưu
   tiên Google Maps khi các nguồn đá nhau.
- Đã test lại đúng kịch bản hôm nay (quét lại tên khác của Mộc Restaurant, quét Feline Café
  2 địa chỉ xen kẽ) — xác nhận cả 3 chỗ sửa hoạt động đúng trước khi deploy.

### 2026-07-17 (sau) — Thử thêm 1 cách tự động hoàn toàn, vẫn không được — chốt bán tự động
Thử cho routine gọi thẳng API riêng của dự án (`/api/ingest/submit`) thay vì ghi Redis/
GitHub — cũng bị chặn (`403` ngay ở bước kết nối HTTPS). Xác nhận: môi trường cloud của
routine chặn gọi ra ngoài tới **bất kỳ domain nào** ngoài GitHub, không phải chặn riêng 1
domain cụ thể — nên không còn cách nào khác để thử nữa (đã thử đủ 3 hướng). Đã bỏ bước gọi
API khỏi lệnh routine, quay lại đúng bản bán tự động gọn. Chi tiết ở DECISIONS.md.
👉 Quy trình hằng ngày (mục phía trên) vẫn đúng, không đổi gì thêm.

### 2026-07-17 — Auto-publish + card 2 lớp (thay đổi lớn)
Anh yêu cầu 2 việc lớn cùng lúc:
1. **Auto-publish**: bot quét hằng ngày công khai luôn mọi thẻ, **chỉ chờ duyệt khi nghi
   trùng lặp/mâu thuẫn dữ liệu** (kể cả dữ liệu tin cậy thấp cũng lên thẳng, theo đúng ý
   anh chốt). Việc gỡ 1 chỗ khỏi công khai (nghi đã đóng cửa) vẫn luôn cần người duyệt.
2. **Card 2 lớp** theo 6 mẫu anh gửi tối qua — xem tóm tắt ở trên.
3. **Đề xuất sửa + thưởng điểm/huy hiệu** — đã bàn hướng (điểm đóng góp + huy hiệu, miễn
   phí, không rủi ro gian lận tiền bạc) nhưng **CHƯA CODE** — còn 1 câu hỏi khó chưa giải:
   web chưa có tài khoản đăng nhập, cần nghĩ cách nhận diện "user nào" để cộng điểm đúng
   người trước khi làm.
- Đã test kỹ cả 2 việc 1 & 2 bằng dữ liệu giả (không đụng dữ liệu thật của anh): auto-
  publish đúng 4 tình huống (mới/đổi/nghi trùng/tin cậy thấp), card 2 lớp đúng cả trên thẻ
  có ảnh và không có ảnh, vuốt gallery hoạt động đúng (ban đầu tưởng lỗi vuốt nhưng hoá ra
  do kịch bản test viết sai, không phải lỗi ứng dụng).
- Bước tiếp theo hợp lý nhất: Bàn thiết kế phần 3 (đề xuất sửa + thưởng) khi anh sẵn sàng.
  Sau đó quay lại Giai đoạn 6 (dữ liệu thật + kiểm thử trước 21/08/2026).

### Trước đó (2026-07-15)
- Sửa lỗi định dạng giá (bỏ ô gõ tay tự do, tự tính từ số + đơn vị).
- Xây pipeline ingestion, trang duyệt tự động trong `/admin`, sửa lỗi nút Duyệt/Từ chối
  dùng chung 1 hàm (không hoạt động đúng với Server Action — đã tách 2 hàm riêng).
- Đưa code lên GitHub (Public — vướng quyền GitHub App lúc thiết lập private).
- Đặt lịch phiên AI hằng ngày; thử tự động hoàn toàn nhưng gặp 3 giới hạn hạ tầng/gói dịch
  vụ liên tiếp, chuyển sang bán tự động. Chi tiết đầy đủ ở DECISIONS.md.

## Câu hỏi/vướng mắc đang mở
- **Tự động hoàn toàn: đã đóng, không thử thêm nữa.** Cả 3 hướng (ghi thẳng Redis, ghi qua
  GitHub, gọi API riêng) đều bị chặn cùng lý do hạ tầng. Chỉ còn lối ra: nâng cấp gói Claude
  Team/Enterprise, hoặc Google Places API trả phí — chưa cần làm, bán tự động vẫn ổn.
- **Đề xuất sửa + thưởng điểm**: cần thiết kế cách nhận diện user (chưa có tài khoản) trước
  khi code — việc tiếp theo khi anh sẵn sàng bàn.
- Nhãn trạng thái mềm hiện vẫn giữ 3 mức (thêm "Tín hiệu ít chỗ/phòng trống" ngoài 2 mức
  anh cho ví dụ) — đổi tên cho mềm hơn, chưa hỏi lại anh có đồng ý giữ 3 mức không.
- Món chính/Phù hợp/Ghi chú/Ảnh/SĐT: chưa có nguồn dữ liệu thật cho phần lớn địa điểm —
  UI đã ẩn gọn khi thiếu, nhưng cần nghĩ cách thu thập các trường này (routine AI thêm câu
  hỏi tìm kiếm? hay anh tự nhập qua `/admin`?).
- 25 địa điểm: vài ô giá/SĐT/địa chỉ còn để trống — anh có thể tự điền qua `/admin`.
- Mật khẩu `/admin` hiện khá đơn giản — nên đổi khi làm Giai đoạn 5b (bảo mật đầy đủ).
- Repo GitHub đang Public — có thể đổi lại Private sau nếu tìm được cách cấp quyền đúng.
