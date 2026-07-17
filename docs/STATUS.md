# STATUS — Tình trạng hiện tại

> Cập nhật file này **cuối mỗi phiên làm việc**. Mục tiêu: ai đọc file này cũng biết ngay
> đang ở đâu, không cần đọc lại toàn bộ lịch sử chat. Chi tiết từng giai đoạn xem
> [ROADMAP.md](ROADMAP.md); lý do các quyết định xem [DECISIONS.md](DECISIONS.md).

## Đang ở giai đoạn nào
**Giai đoạn 5a + AI quét dữ liệu hằng ngày (bán tự động, auto-publish) + card 2 lớp mới —
hoàn thành.** Chuẩn bị Giai đoạn 6 (dữ liệu thật + kiểm thử, mốc 21/08/2026), và phần 3
"đề xuất sửa + thưởng điểm" sẽ bàn thiết kế riêng.

## Tóm tắt tiến độ
- 25 địa điểm, web hiển thị + bộ lọc (loại hình/khu vực/giá).
- **Card 2 lớp** (Ăn & Ngủ): thẻ gọn (tên/loại/địa chỉ/giá/nhãn trạng thái mềm) → bấm
  "Xem thêm" bung tại chỗ (địa chỉ đầy đủ, khu vực, độ tin cậy, nguồn đối chiếu, cập nhật
  gần nhất, ghi chú, cụm ảnh) → bấm ảnh mở gallery toàn màn hình (vuốt ngang đổi ảnh, vuốt
  lên/xuống đóng). "Báo sai" mới là giao diện, chưa nối chức năng.
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
3. Em xử lý — **đa số chỗ tự lên web luôn, không cần anh làm gì thêm.**
4. Anh chỉ cần vào `/admin` mục "Hàng chờ duyệt tự động" khi có **nghi trùng lặp** — xác
   nhận đúng/sai để hệ thống xử lý tiếp.

## Cập nhật gần nhất

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
