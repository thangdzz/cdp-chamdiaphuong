# PM NGHIỆM THU BUILD A2 — CDP UX/UI vNext

- **Ngày:** 2026-11-12
- **Đầu vào:** `docs/REPORT-A2-khung-dieu-huong-2026-11-12.md` và PDF `CDP A2 trước và sau` do Claude gửi.
- **Kết luận:** **BUILD A2 ACCEPTED — CHO PHÉP LẬP PLAN A3.** Chưa cho phép BUILD A3, DEPLOY hay RELEASE.
- **Căn cứ:** Nghiệm thu dựa trên báo cáo và ảnh chụp do Claude cung cấp; PM chưa tự kiểm chứng code, remote Git, bản deploy Vercel hoặc thiết bị di động thật.

## 1. Phạm vi nghiệm thu

Chấp nhận các phần A2 đã hoàn thành theo phạm vi duyệt:

1. **A2-0 — tên thương hiệu và header:** “Chạm Địa Phương” hiển thị đầy đủ ở 320/360/390px, kể cả khi tăng chữ 200%. Khi chật, xuống dòng theo cụm từ, nút Menu có thể xuống hàng; không dùng dấu `…` để rút gọn tên. Chấp nhận giải pháp giữ kích thước logo/chữ và thu khoảng cách.
2. **Trang `/tim`:** hàng tìm bám ngay dưới header thông qua chiều cao đo thật `--cdp-header-h`, không dùng số cố định và không bị header che.
3. **Khung màu:** header, Menu, sidebar, footer phía khách theo token màu đã duyệt; màu Admin giữ nguyên.
4. **Điều hướng đáy:** bốn mục cố định **Trang chủ · Tìm chỗ · Sổ · Lộ trình**, có trạng thái đang mở, vùng chạm phù hợp, không chồng thanh hành động ở Chi tiết/sửa, không che nội dung cuối trang.
5. **Menu:** ba mục phụ Ghi chú của tôi · CDP là gì? · Lễ hội (lưu trữ); đóng bằng Esc, chạm ra ngoài, chọn mục hoặc Back; trả focus về nút Menu.
6. **Sidebar desktop:** phân nhóm lõi/phụ; thu gọn chỉ còn biểu tượng theo chủ đích người dùng; tên logo đầy đủ cho trình đọc màn hình.

Theo báo cáo, `lint`, `build`, **76/76 tests** đạt; không có lỗi chồng chữ/header trong 218 trạng thái kiểm tra; không có cuộn ngang; luồng chính qua thanh đáy đạt ở Chromium và WebKit. PDF trước/sau thể hiện thay đổi tên thương hiệu, `/tim`, thanh đáy, Menu và sidebar. A2 chưa deploy.

## 2. Các quyết định PM về điểm còn mở

| Nội dung | Quyết định |
|---|---|
| iPhone/Android thật, Zalo/Facebook, bàn phím, thanh Safari, vùng an toàn | **Bắt buộc ở TEST A trước RELEASE A.** Chưa chặn lập PLAN A3. Nếu có điều kiện, thực hiện kiểm thử nhanh trên máy thật sớm để phát hiện lỗi cấu trúc; không yêu cầu deploy production. |
| Các lớp cố định khi xoay ngang iPhone còn vướng tai thỏ | Đưa vào checklist **A6/A8** theo đúng màn liên quan; kiểm lại ở TEST A. Không coi việc “ít người dùng xoay ngang” là lý do bỏ lỗi. |
| Biểu tượng Trang chủ (ngôi nhà thay la bàn) | **Duyệt biểu tượng ngôi nhà.** Tìm chỗ dùng kính lúp; Lễ hội dùng biểu tượng lịch. Không cần đổi lại. |
| Footer chữ 12px, thấp hơn DESIGN ≥13px | **Xử lý ở A9**, trên footer phía khách, trước TEST A/RELEASE A. Không mở thêm commit A2 riêng chỉ để sửa cỡ chữ. |
| Dấu tiếng Việt lộ dưới ô cắt hai dòng | Sửa tại **A5–A7**, nghiệm thu lại trước RELEASE A. |
| 73 vị trí chữ xám nhạt và nút màu cũ | Sửa theo từng màn **A4–A9**, không đổi toàn cục thiếu kiểm soát; kiểm độ tương phản ở TEST A. |
| Admin xuống dòng/rút gọn thêm sau đổi font | Chấp nhận tạm ở A2; rà lại tại TEST A để phát hiện vấn đề ảnh hưởng tác vụ. |
| Một lỗi tải trước hiếm gặp ở WebKit | Theo dõi; nếu tái hiện trong TEST A thì xử lý trước release tùy mức ảnh hưởng. |

## 3. Các cổng kiểm soát còn hiệu lực

- **Không deploy `main`** khi đang làm đợt A; production chưa được đối chiếu trực tiếp trên Vercel. Trước RELEASE A cần xác minh deployment thực tế và phiên đăng nhập Vercel.
- Bảo vệ dữ liệu người dùng khi test: token chỉ đọc, chặn ghi và không công bố ảnh Sổ/Lộ trình thật.
- Không tự thay đổi logic API, dữ liệu, cơ chế Sổ/tài khoản/đồng bộ, hoặc mở rộng sang đợt B.
- Chỉ báo lỗi A2 đã hết trong phạm vi đã đo; không suy diễn rằng mọi thiết bị và trình duyệt thực tế đã đạt.
- Giữ tên **“Chạm Địa Phương” đầy đủ** như một điều kiện lâu dài cho mọi bước UX/UI sau.

## 4. Bước kế tiếp: PLAN A3

Claude được phép **lập kế hoạch A3**, chưa được sửa code A3. Phạm vi A3 trong FREEZE: bộ minh họa theo nhóm và cách chọn ảnh địa điểm cho thẻ tìm kiếm.

PLAN A3 phải nêu:

1. Danh sách file dự kiến sửa, nguồn ảnh hiện có và bộ minh họa SVG (Ăn, Chơi, Ngủ, Đi lại, Khác).
2. Quy tắc ưu tiên **ảnh thật phù hợp → minh họa đúng nhóm**. Không dùng ảnh menu như ảnh đại diện địa điểm. Không trình bày minh họa như ảnh chụp thật.
3. Dữ liệu ảnh từ API tới thẻ tìm kiếm: các trường bổ sung, xử lý thiếu/lỗi ảnh, có cần thay đổi máy chủ không, ảnh hưởng tới tốc độ và bộ nhớ đệm.
4. Thẻ không ảnh vẫn gọn và đọc rõ; mẫu kiểm thử theo tỷ lệ dữ liệu thật hiện có (đa số chưa có ảnh).
5. Kiểm thử chức năng, nhãn/alt ảnh, ảnh tải lỗi, kết quả tìm kiếm, hiệu năng, quyền dùng ảnh và khả năng rollback.
6. Các phần còn mở cần PM quyết định trước BUILD A3.

## 5. Yêu cầu bàn giao

- Cập nhật `STATUS.md`, `TASKS.md`, `HANDOFF.md` và mục theo dõi lỗi còn lại; ghi nhận **A2 ACCEPTED**.
- Gửi **PLAN A3** cho PM duyệt, kèm bảng file, cách thử và phạm vi rủi ro.
- **Chưa BUILD A3, chưa DEPLOY, chưa RELEASE.**

**Trạng thái:** A1 ACCEPTED → **A2 ACCEPTED** → **A3 PLANNING**.
