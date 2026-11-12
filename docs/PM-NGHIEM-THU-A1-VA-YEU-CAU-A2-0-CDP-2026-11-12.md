# PM REVIEW — Nghiệm thu A1 và yêu cầu sửa tên thương hiệu ở A2

- **Ngày:** 2026-11-12
- **Dự án:** CDP — Chạm Địa Phương
- **Nguồn đối chiếu:** `docs/REPORT-A1-mau-va-font-2026-11-12.md`; file ảnh trước/sau `CDP A1 trước và sau.pdf`, đặc biệt trang 3.
- **Trạng thái:** **A1 ACCEPTED WITH CONDITION → A2 PLANNING**. Chưa cho BUILD A2, chưa DEPLOY/RELEASE.
- **Quyết định trực tiếp của chủ dự án:** **Tên “Chạm Địa Phương” không được rút gọn kiểu “…”**.

## 1. Nghiệm thu A1

PM nghiệm thu **phần nền màu và font** theo báo cáo đã gửi, với điều kiện lỗi cắt tên thương hiệu phải được sửa trong bước A2 trước khi đóng A2 và trước RELEASE A.

Kết quả được chấp nhận **theo báo cáo và ảnh kiểm thử**, chưa phải kiểm định độc lập repo/production:

- Code chỉ sửa 3 file A1 đã duyệt; commit A1a `2ee6f00`, A1b `7ca6816`.
- Lint sạch, build đạt, 70/70 test.
- Font Be Vietnam Pro có đủ tiếng Việt, NFC/NFD, độ đậm 400/500/600/700.
- Font Trang chủ ~92 KB, dưới ngưỡng 150 KB; không gọi Google Fonts khi khách truy cập.
- CLS mẫu không tăng, 0 trang cuộn ngang tại 320/360/390/1280 px.
- Trang khách nền kem, `/admin` giữ màu cũ; chưa deploy.

**Không kết luận** toàn site đã đạt chuẩn tương phản; các mã màu cũ và 73 vị trí chữ nhạt sẽ xử lý đúng bước A2–A9.

## 2. Yêu cầu bắt buộc A2-0: Tên thương hiệu không bị cắt

**Ưu tiên: bắt buộc trước khi nghiệm thu A2 và RELEASE A.** Đưa A2-0 thành tác vụ đầu tiên của `A2 — Khung trang + thanh đáy + Menu`.

- Sửa ở `SiteHeader.js` và các thành phần giao diện đầu trang liên quan, **sau khi PM duyệt PLAN A2**.
- Luôn hiển thị **đầy đủ, đúng dấu**: `Chạm Địa Phương`.
- **Cấm:** `text-overflow: ellipsis`, `truncate`, `line-clamp`, hoặc chủ động đổi thành `Chạm Địa Phư…`, `CDP` hay tên rút gọn chỉ để nhét vừa header.
- **Ưu tiên xử lý:** tối ưu phân bổ không gian giữa logo, tên và nút Menu; giảm khoảng cách hoặc kích thước logo/nút trong giới hạn dễ bấm; điều chỉnh kích thước chữ hợp lý. Nếu vẫn thiếu chỗ ở 320 px, **cho tên xuống hai dòng**. Không kéo nhỏ chữ đến mức khó đọc.
- Giữ logo và nút Menu nhìn thấy, bấm được. Không đẩy phần tử ra khỏi màn, không che tên, không tạo cuộn ngang.
- Kiểm trên 320, 360, 390, 1280 px ở Chromium và WebKit; kiểm thêm phóng to chữ nếu công cụ cho phép. Kèm ảnh header trước/sau kích thước 320 px trong REPORT A2.
- Với header ở tất cả màn khách (Trang chủ, Tìm chỗ, Chi tiết, Sổ, Lộ trình, màn phụ), phải hiển thị đầy đủ như nhau.

**Tiêu chí FAIL:** chỉ cần một trạng thái header dành cho khách vẫn hiển thị `Chạm Địa Phư…` hoặc dấu ba chấm thay cho tên thương hiệu là **A2 chưa đạt**.

## 3. Các phát hiện khác và quyết định xử lý

1. **Dấu của dòng thứ ba lộ dưới ô cắt 2 dòng:** ghi thành lỗi phải sửa ở các bước có thành phần đó (A5–A7 hoặc bước thực tế tương ứng); không đưa lên production nếu còn thấy lỗi.
2. **Admin xuống dòng khác, danh sách rút gọn nhiều hơn:** chấp nhận tạm trong A1 theo quyết định đổi font toàn site; không tự mở rộng phạm vi A2 sang thiết kế lại Admin. Khi kiểm thử cuối đợt A, xem xét nếu ảnh hưởng thao tác quản trị.
3. **Lưu/khôi phục và thao tác ghi dữ liệu:** A1 kiểm thử bằng môi trường chặn ghi. Kết quả này không thay thế kiểm thử thao tác ghi thật trên môi trường kiểm thử an toàn ở giai đoạn TEST A.
4. **Production:** theo báo cáo chưa deploy; PM chưa trực tiếp xác minh trên Vercel. Không deploy `main` đang thực hiện dở. Mốc `prod-2026-09-30` phải đối chiếu với deployment thực tế trước khi xử lý khẩn cấp hay RELEASE A.

## 4. Chỉ thị tiếp theo gửi Claude

1. Ghi quyết định A1 vào STATUS, TASKS, HANDOFF; đưa **A2-0 — Hiển thị đủ tên Chạm Địa Phương ở 320 px** lên đầu kế hoạch A2.
2. Soạn **PLAN A2**: khung trang, thanh điều hướng đáy 4 mục, Menu, cộng A2-0; nêu file dự kiến sửa, cách tương thích responsive, kiểm thử, rollback.
3. Gửi PM duyệt PLAN A2 **trước khi sửa code A2**.
4. Chưa BUILD A2, chưa DEPLOY/RELEASE, chưa tự sửa PRODUCT.md, không mở rộng chức năng ngoài SCOPE đã khóa.

## 5. Quyết định cuối

**A1: NGHIỆM THU CÓ ĐIỀU KIỆN (phần kỹ thuật đạt).**

**A2: CHỈ CHO LẬP KẾ HOẠCH.** Tên thương hiệu không bị cắt là điều kiện bắt buộc khi nghiệm thu A2. Chưa phát hành đợt A khi lỗi còn tồn tại.
