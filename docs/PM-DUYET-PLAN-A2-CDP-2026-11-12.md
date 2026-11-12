# PM REVIEW — DUYỆT PLAN A2: KHUNG TRANG, THANH ĐÁY VÀ MENU

**Dự án:** CDP — Chạm Địa Phương  
**Ngày:** 2026-11-12  
**Trạng thái:** **PLAN A2 APPROVED WITH CONDITIONS → BUILD A2 AUTHORIZED**  
**Phạm vi:** Đợt A, bước A2; không deploy, không release.  
**Nguồn review:** REPORT PLAN A2 do Claude gửi PM ngày 12/11/2026, tham chiếu `docs/SPEC-A2-khung-dieu-huong.md`; các quyết định PRODUCT/SCOPE/DESIGN đã FREEZE. PM chưa kiểm trực tiếp toàn bộ file SPEC hoặc code Git ở phiên này.

## 1. Quyết định Q1–Q5

| Mục | Quyết định PM | Giới hạn |
|---|---|---|
| **Q1 — Cấu hình 4 mục** | **DUYỆT A.** Thêm `Tìm chỗ` vào cấu hình điều hướng, nhãn mặc định `Trang chủ · Tìm chỗ · Sổ · Lộ trình`. | Giữ đường dẫn và định danh điều hướng hiện có, không vô tình ghi đè cấu hình Admin. Xác minh không có cấu hình production trước khi thực thi thay đổi mặc định. Trang Admin nếu tự thêm một dòng mới thì kiểm thử, không thiết kế lại Admin. |
| **Q2 — Sổ/Lộ trình chi tiết** | **DUYỆT A.** Trong A2, trang chi tiết Sổ/Lộ trình vẫn có thanh điều hướng đáy. | Khi A7/A8 có thanh hành động thực, chỉ hiển thị một thanh; không để hai thanh chồng nhau. Trang Chi tiết địa điểm và hai trang sửa có thanh hành động riêng thì ẩn thanh điều hướng đáy theo quy tắc đã duyệt. |
| **Q3 — iOS safe area** | **DUYỆT A CÓ ĐIỀU KIỆN.** Thêm `viewport-fit=cover` và khoảng an toàn cho vùng vạch Home. | Không chỉ bật meta rồi coi là xong: dùng `env(safe-area-inset-bottom)`, kiểm tra padding nội dung, bàn phím, thanh trình duyệt và chiều cao màn hình nhỏ. Có kiểm thử iPhone thật trước nghiệm thu phát hành A; không bắt chủ dự án phải kiểm thử ngay để cho phép BUILD. |
| **Q4 — Góp một chỗ mới** | **DUYỆT A.** Chưa đặt trong Menu ở A2. | Chuyển INBOX, không tạo API hoặc luồng đóng góp mới trong A2. |
| **Q5 — Sidebar thu gọn** | **DUYỆT A.** Cho phép chỉ hiển thị logo khi người dùng chủ động thu gọn trên desktop. | Khi mở rộng phải hiển thị nguyên văn `Chạm Địa Phương`; không có `…`. Logo ở chế độ thu gọn có tên truy cập được (`aria-label`/`title`) và điều khiển bằng bàn phím. |

## 2. A2-0 — Điều kiện bắt buộc, thực hiện đầu tiên

1. **Không bao giờ cắt tên thương hiệu thành `Chạm Địa Phư…`.** Header mobile hiển thị **`Chạm Địa Phương` nguyên vẹn**, từ 320 px và ở mức phóng chữ 125%, 150%, 200%. Không thu nhỏ logo hoặc cỡ chữ để lách lỗi. Khi cần, xuống 2 dòng theo từ; header tăng chiều cao theo nội dung.
2. Duyệt phương án thu khoảng cách: logo ↔ tên 10 → 8 px; tên ↔ Menu 12 → 8 px; đệm ngang Menu 12 → 10 px. Vùng chạm Menu giữ tối thiểu 44 px chiều cao. Đây là phương án ưu tiên, nhưng nếu kiểm thử cho thấy không đủ chỗ thì dùng xuống dòng, không cắt chữ.
3. **Sửa lỗi lệch header với ô tìm kiếm dính (`sticky`) tại `/tim`.** PM cho phép `SearchResults.js` nằm trong diff A2-0. **Không thay hằng số 57 bằng 65 px**: lấy chiều cao header thực tế hoặc dùng chung biến chiều cao được cập nhật theo bố cục, tránh tái phát ở mức phóng chữ và khi tên xuống dòng.
4. Tách commit A2-0 riêng và chụp ảnh trước/sau ở 320/360/390 px, kiểm tra Chromium và WebKit, đặc biệt `/tim` khi cuộn. Nếu A2-0 chưa đạt thì chưa chuyển sang phần thanh đáy.

## 3. Điều hướng đáy, Menu, sidebar

- Mobile: thanh điều hướng **4 mục đúng thứ tự**: Trang chủ · Tìm chỗ · Sổ · Lộ trình. Mục đang mở có trạng thái rõ bằng chữ đậm và gạch chân, không phụ thuộc riêng màu. Vùng chạm rộng và cao phù hợp màn 320 px; không dùng chiều rộng cố định khiến tràn khi màn hẹp hoặc có vùng an toàn ngang.
- Chừa khoảng trống ở cuối trang để thanh đáy không che nội dung, nút, liên kết, vùng nhập hoặc phần tử đang được focus. Với trang có thanh hành động chuyên biệt, chỉ hiển thị **một** thanh đáy.
- Bàn phím: ẩn thanh điều hướng khi đang nhập; hiện lại sau khi đóng bàn phím. Không suy luận bàn phím chỉ bằng một ngưỡng `window.innerHeight` dễ nhầm với thanh địa chỉ trình duyệt. Kiểm thử cả chuyển focus giữa các ô và trở lại từ trang khác. Nếu dùng `visualViewport`, có đường xử lý dự phòng.
- Menu: chỉ gồm Ghi chú của tôi · Giới thiệu · Lễ hội (lưu trữ) và những mục đã có ngoài phạm vi không bị mất. Hỗ trợ Esc, đóng khi chuyển route, trả focus hợp lý sau khi đóng; không làm nền trang cuộn ngoài ý muốn khi Menu đang mở.
- Sidebar desktop: 4 mục chính nhóm trên, mục phụ dưới; giữ khả năng thu gọn và phục hồi. Tên `Chạm Địa Phương` đầy đủ ở chế độ mở rộng.
- Không bổ sung công tắc hai giao diện: thuộc đợt B. Không bổ sung chức năng Sổ/Lộ trình của A7/A8.

## 4. Giới hạn code và commit

- Chỉ sửa các file đã liệt kê trong `SPEC-A2-khung-dieu-huong.md` §7; **cho phép riêng `SearchResults.js` trong A2-0** vì lỗi sticky hiện hữu. Nếu cần thêm file khác, báo PM trước khi sửa.
- 4 nhóm commit theo kế hoạch: **A2-0 → màu/khung → thanh đáy → Menu/sidebar**. Mỗi nhóm có thể được rà riêng; chạy lint, test, build sau mỗi commit và tổng kiểm thử cuối A2.
- Không sửa dữ liệu thực, API, logic lưu Sổ/Lộ trình, `PRODUCT.md`, Admin ngoài dòng cấu hình phát sinh do Q1; không BUILD A3–A9 hoặc đợt B.
- Có thể commit/push lên nhánh quy trình repo; **không deploy `main`** đang là bản giao diện làm dở. Giữ tag `prod-2026-09-30` cho việc xử lý production theo đúng quy trình, không ghi đè tag.

## 5. Nghiệm thu A2

1. Header ở 320/360/390/1280 px, phóng chữ 125/150/200%: tên thương hiệu đầy đủ khi header đang mở, logo và Menu không chồng lấn, không tạo cuộn ngang.
2. `/tim`: thanh tìm kiếm dính không bị header che ở trạng thái một dòng hoặc hai dòng, cả khi cuộn, xoay màn hình và phóng chữ.
3. Mobile: 4 mục điều hướng hoạt động, đúng mục đang chọn; liên kết sâu vào Chi tiết/Sổ/Lộ trình không làm mất đường về.
4. Không có hai thanh đáy chồng nhau. Nội dung cuối trang và focus không bị thanh điều hướng che.
5. Menu mở/đóng bằng chạm, bàn phím, Esc, đổi route; hành vi focus hợp lý; sidebar desktop hoạt động.
6. Vùng an toàn iOS, bật/tắt bàn phím, cuộn Safari WebKit; kiểm tra thêm Chrome Android và khi có điều kiện trên trình duyệt tích hợp Zalo/Facebook. Kiểm thử trên iPhone thật là **cổng nghiệm thu trước RELEASE A**, không phải yêu cầu chặn việc bắt đầu BUILD A2.
7. Lint, test, build đạt; không thêm lỗi JavaScript; dữ liệu thử không ghi vào production.
8. Chụp ảnh trước/sau, báo diff, commit, lỗi còn lại và cách quay về từng commit.

## 6. Báo cáo gửi PM sau BUILD A2

- Commit và danh sách file thay đổi; kết quả riêng của A2-0.
- Ảnh header 320 px trước/sau, và bằng chứng tên đầy đủ tại mức phóng chữ 200%.
- Ảnh/chứng cứ sticky tại `/tim`, thanh đáy 4 mục, Menu, desktop sidebar.
- Kết quả kiểm thử bàn phím và vùng an toàn iOS: phân biệt đã kiểm trên WebKit giả lập hay iPhone thật.
- Các lỗi còn lại, rủi ro, cách rollback. **Chưa thực hiện A3, chưa deploy hoặc release.**

**Quyết định PM:** Cho phép Claude BUILD A2 theo phạm vi trên, bắt đầu với A2-0, không cần xin duyệt lại nếu không phát sinh thay đổi phạm vi hoặc kỹ thuật lớn.
