# PM REVIEW — Duyệt PLAN A3: Ảnh minh họa và ảnh địa điểm

**Dự án:** CDP — Chạm Địa Phương  
**Ngày:** 12/11/2026  
**Trạng thái:** **PLAN A3 APPROVED WITH CONDITIONS → BUILD A3 AUTHORIZED**  
**Nguồn:** `docs/SPEC-A3-anh-minh-hoa.md` (kế hoạch Claude gửi 12/11/2026), `docs/DESIGN.md` v2.0, `docs/SCOPE-UXUI-ban-do-gap.md` (FROZEN).  
**Giới hạn:** Không deploy, không release, không BUILD A4/A5; không thay đổi API/Redis hay nội dung ảnh thật.

## 1. Quyết định PM cho Q1–Q4

### Q1 — Ảnh menu làm ảnh đại diện: **DUYỆT A**

- Sửa tại `web/lib/media.js` để `placeCoverMedia()` **không chọn ảnh có vai trò menu** làm ảnh đại diện, kể cả khi đó là ảnh duy nhất của địa điểm.
- Thứ tự chọn: ảnh bìa hợp lệ (không phải menu) → ảnh thường hợp lệ đầu tiên → `null` để thành phần hiển thị chọn minh họa theo nhóm.
- Kiểm trực tiếp cả bốn ngữ cảnh: dải ảnh Chi tiết, thẻ trong Sổ, bìa ghép Sổ và ảnh xem trước khi chia sẻ. Khi `null`, ảnh chia sẻ chuyển về ảnh mặc định hiện có. **Ảnh menu vẫn hiển thị tại khu vực thực đơn** nếu có.
- Đối chiếu kết quả cũ/mới trên dữ liệu chỉ đọc; dự kiến chỉ **1 địa điểm** thay đổi theo kiểm kê 12/11. Nếu số địa điểm khác dự kiến, báo PM trước khi tiếp tục.

### Q2 — `PlaceThumb` dùng chung: **DUYỆT A**

- Xây `web/app/PlaceThumb.js` từ A3 để A5–A8 tái sử dụng, không tạo bốn cách xử lý ảnh lỗi.
- Ảnh thật dùng khung cố định, cắt giữa hợp lý; tải lỗi thì thay bằng SVG theo nhóm; không lặp tải vô hạn.
- **Khi `photo.url` hoặc địa điểm thay đổi, đặt lại trạng thái lỗi** cho ảnh mới. Với cùng một URL lỗi chỉ chuyển sang minh họa một lần.
- Không tự chèn component này vào các màn đang chạy trong A3; thử trên trang tạm tại máy, sau đó xóa trước commit.

### Q3 — `alt` ở thẻ nhỏ: **DUYỆT A VỚI QUY TẮC NGỮ CẢNH**

- Ảnh thật trong thẻ **khi tên địa điểm nằm ngay cạnh và cùng liên kết**: `alt=""` để không đọc lặp tên.
- Hình minh họa: dùng `alt` trong DESIGN §5 để diễn đạt đây là **minh họa, chưa có ảnh thực tế**. Có dấu/nhãn trực quan theo DESIGN ở A5/A6.
- Nếu sau này ảnh là liên kết riêng hoặc mang thông tin không thể hiện bằng chữ gần đó, `alt` phải mô tả chức năng/thông tin tương ứng, không áp quy tắc rỗng máy móc.
- Ở Chi tiết, ảnh thật dùng mô tả phù hợp; phương án mặc định `Ảnh {tên địa điểm}` nếu không có mô tả cụ thể hơn.

### Q4 — Quyền sử dụng ảnh: **DUYỆT A CÓ CỔNG KIỂM TRA TRƯỚC A5**

- A3 được phép xây hàm và luồng dữ liệu theo toàn bộ ảnh **hiện đang công khai trên CDP**. Đây là cho phép làm kỹ thuật, **không phải kết luận tất cả ảnh đã có quyền sử dụng hợp lệ**.
- Giữ nguyên dữ liệu và vị trí hiển thị hiện hữu; A3 không xóa ảnh hay thay đổi trạng thái công khai.
- Lập **danh sách kiểm tra 25 ảnh legacy** thiếu người tải lên: ID ảnh, ID địa điểm, nguồn đã biết, tình trạng xác minh, hướng xử lý. Không công bố tên/định danh người tải lên trong báo cáo công khai.
- Trước khi hiện ảnh trên bề mặt **mới** (thẻ Tìm chỗ A5 và các vị trí A6–A8), xác minh căn cứ sử dụng. Không coi việc ảnh đã có trên Blob hoặc đã được Admin duyệt là bằng chứng sở hữu/quyền cấp phép.
- Ảnh chưa xác minh: **dùng minh họa thay thế ở bề mặt mới**, không chặn việc hoàn thành A3.
- Đưa vào A6 việc bổ sung thông báo và xác nhận của người gửi trong form ảnh: “Ảnh bạn gửi có thể hiển thị công khai trên Chạm Địa Phương sau khi được duyệt, gồm trang địa điểm và các phần tìm kiếm, Sổ/Lộ trình có dùng ảnh địa điểm”; bổ sung xác nhận người gửi có quyền chia sẻ/cho phép dùng ảnh. Claude rà lại câu chữ với PRODUCT trước khi chốt form.
- Không yêu cầu chủ dự án xác nhận một sự kiện lịch sử không có bằng chứng. Nếu không thể xác minh 25 ảnh cũ, giữ trạng thái **chưa xác minh**.

## 2. Phạm vi BUILD A3 được duyệt

Thực hiện đúng bốn commit theo SPEC:

1. **A3-a:** Chép nguyên 5 SVG đã duyệt vào `web/public/minh-hoa/` và đối chiếu mã băm với tài liệu gốc.
2. **A3-b:** Viết `web/lib/placeImage.js` và kiểm thử, đồng thời sửa `placeCoverMedia()` loại ảnh menu theo Q1. Không sửa dữ liệu ảnh.
3. **A3-c:** Bổ sung `photo: {url,width,height} | null` vào kết quả `toResultItem()` dùng cho `/tim`, không thêm API hay lần đọc Redis. Đo tăng dung lượng thực tế; nếu trên 5 KB sau nén, áp phương án bỏ khóa `photo` khi null như SPEC và ghi rõ thay đổi.
4. **A3-d:** Tạo `PlaceThumb` theo Q2, kiểm trên trang tạm rồi xóa trang thử.

**File code/test được phép:** `web/lib/placeImage.js`, `web/lib/media.js`, `web/lib/searchResults.js`, `web/app/PlaceThumb.js`, `web/tests/placeImage.test.js`, `web/tests/searchResults.test.js`, cùng 5 SVG. Chỉ thêm/cập nhật tài liệu dự án để ghi kết quả. Nếu cần file code ngoài danh sách, dừng và báo PM.

**Không làm:** thay giao diện Trang chủ/Tìm chỗ/Chi tiết/Sổ/Lộ trình; thêm ảnh giả giống ảnh chụp; thêm API; đổi cấu trúc Redis; đụng Admin; làm Bản đồ gấp (đợt B); sửa `PRODUCT.md`; deploy hoặc release.

## 3. Tiêu chí nghiệm thu A3

- [ ] 5 SVG đúng bản duyệt, chạy 200, dùng đúng nhóm Ăn/Chơi/Ngủ/Đi lại/Chỗ quen gọi hoặc nhóm lạ; không chứa script, chữ hoặc liên kết ngoài.
- [ ] Ảnh bìa hợp lệ được ưu tiên; **ảnh menu không bao giờ làm ảnh đại diện**. Đối chiếu toàn bộ dữ liệu hiện hành chỉ đọc và ghi số lượng thực tế tại lúc test (mốc SPEC: 344 địa điểm, 16 có ảnh, 1 chỉ có menu).
- [ ] Kiểm bốn ngữ cảnh ảnh đại diện; riêng ảnh menu vẫn được giữ trong mục thực đơn.
- [ ] `toResultItem()` có trường ảnh cho địa điểm có ảnh thật, đúng URL và kích thước nếu có; không gửi dữ liệu người tải/nguồn/metadata nội bộ. Dung lượng tăng sau nén không quá 5 KB, hoặc trình PM giải pháp khác.
- [ ] `PlaceThumb` có ảnh thật, không ảnh, nhóm lạ, ảnh lỗi, ảnh đổi URL, ảnh thiếu kích thước; một URL lỗi không tải lại liên tục.
- [ ] Ảnh thu nhỏ giữ tỷ lệ khung, không gây cuộn ngang hoặc nhảy bố cục; xác minh đầu ra ảnh 72 px theo bộ kiểm trong SPEC.
- [ ] Ảnh minh họa có nhãn/dấu phù hợp khi được tích hợp vào từng màn ở A5/A6; không trình bày minh họa như ảnh thật.
- [ ] Lint, test, build đạt; không hỏng lại tên đầy đủ “Chạm Địa Phương”, thanh điều hướng, Menu hoặc các luồng A1/A2.
- [ ] Test bằng quyền chỉ đọc, chặn ghi dữ liệu thật; không lộ ảnh Sổ/Lộ trình riêng tư trong ảnh báo cáo.
- [ ] Các commit tách riêng, có thể revert. Không deploy.
- [ ] Báo cáo có danh sách kiểm kê quyền sử dụng ảnh legacy riêng, không khẳng định nguồn nếu không có bằng chứng; có đề mục cần kiểm tra ở A5 và A6.

## 4. Rủi ro và điểm theo dõi

- **Ảnh không phù hợp vai trò:** ngoài menu, ảnh lối vào/bãi đỗ/chỉ đường có thể chưa đại diện tốt cho địa điểm. A3 giữ phân loại như SPEC; lưu nhận xét và đề xuất nếu test phát hiện trường hợp thực tế gây hiểu nhầm, không tự mở rộng logic sang các vai trò khác.
- **Số liệu thay đổi do routine:** các mốc 344/16 chỉ là ảnh chụp tại 12/11; luôn báo số thực đo, không sửa test để ép khớp con số cũ.
- **Quyền ảnh:** chỉ phần kỹ thuật của A3 được duyệt; việc hiện ảnh lên bề mặt mới có cổng nguồn/quyền trước A5.
- **Vercel image optimization:** kiểm dung lượng ảnh tối ưu khi build/test; kiểm hạn mức gói trước RELEASE A.
- **A5/A6:** khi tích hợp thẻ ảnh phải có nhãn minh họa, thông báo tải lỗi phù hợp; ở A6 xử lý minh bạch việc gửi ảnh.

## 5. Quy trình tiếp theo

**A2 ACCEPTED → A3 PLAN APPROVED WITH CONDITIONS → BUILD A3 AUTHORIZED → REPORT A3 → PM ACCEPTANCE → PLAN A4.**

Không có quyền triển khai A4 hoặc deploy `main` sau khi xong A3.

### Prompt chuyển Claude

Đọc `docs/PM-DUYET-PLAN-A3-CDP-2026-11-12.md` và `docs/SPEC-A3-anh-minh-hoa.md`.

PM duyệt PLAN A3 có điều kiện, cho phép BUILD A3 đúng bốn commit. Chốt Q1=A, Q2=A, Q3=A theo ngữ cảnh và Q4=A có cổng xác minh quyền ảnh trước A5. Sửa ảnh menu tại nguồn chọn ảnh; thử bốn ngữ cảnh. `PlaceThumb` phải đặt lại lỗi khi đổi URL. Kiểm thử trên toàn bộ địa điểm theo dữ liệu chỉ đọc, đo payload `/tim` và ảnh 72 px, kiểm không hồi quy A1/A2. Ghi danh sách ảnh legacy chưa xác minh vào hồ sơ nội bộ; không kết luận nguồn ảnh khi thiếu bằng chứng. Cập nhật SPEC/DECISIONS/TASKS/BACKLOG tương ứng. Commit và push từng phần theo quy trình. Không đổi màn hình, không sửa PRODUCT.md, không deploy, không làm A4. Gửi REPORT A3 và bằng chứng test để PM nghiệm thu.
