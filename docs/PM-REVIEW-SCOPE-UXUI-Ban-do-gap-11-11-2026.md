# PM REVIEW — SCOPE UX/UI Bản đồ gấp + Cơ bản

**Ngày:** 11/11/2026  
**Trạng thái:** SCOPE APPROVED WITH CHANGES — **CHƯA FREEZE, CHƯA BUILD**.  
**Nguồn cần đối chiếu:** `docs/SCOPE-UXUI-ban-do-gap.md`, `docs/CDP-ke-hoach-UXUI-Ban-do-gap-song-vNext.md`, `docs/PRODUCT.md`, `docs/ARCHITECTURE.md`, `docs/DESIGN.md`.

## 1. Quyết định PM trả lời §7 (11 câu)

1. **Phát hành:** Hai đợt. **A**: ra giao diện **Cơ bản mới** sau khi đã kiểm thử đầy đủ; chưa hiện nút chọn Bản đồ gấp nếu chưa dùng được. **B**: ra **Bản đồ gấp + nút chuyển 2 chế độ** cùng nhóm tính năng quay lại. Hai đợt có kiểm thử và rollback riêng. PRODUCT vẫn định hướng Bản đồ gấp là giao diện mặc định cuối cùng, không phải thay thế lâu dài bằng Cơ bản.
2. **Mặc định khách mới:** Khi phát hành B, ưu tiên Bản đồ gấp nếu đạt hiệu năng/khả năng tương thích đã chốt. Nếu không đạt thì chưa mở mặc định, giữ Cơ bản và xử lý trước. Không tự động thay giao diện đang chọn của khách cũ. Người dùng luôn có nút chuyển chế độ và hệ thống ghi nhớ lựa chọn.
3. **Ảnh thẻ tìm kiếm:** **P0** cho việc *hiển thị ảnh thật khi có ảnh phù hợp*, có trạng thái không ảnh đẹp và gọn. Trước khi chốt chi tiết kỹ thuật, chạy kiểm kê chỉ đọc: tổng số địa điểm, số có ảnh hợp lệ, tỷ lệ theo 4 nhóm, khả năng lấy ảnh từ API hiện tại và tác động hiệu năng. Không chèn ảnh AI như thể là ảnh thật. Nếu dữ liệu hoặc API không đủ, báo PM điều chỉnh phương án mà không âm thầm hạ P0.
4. **Tranh minh họa:** Kết hợp **SVG/CSS cho lớp địa hình/nếp gấp có thể co giãn** và **ảnh minh họa AI cho một số cảnh chính** rồi chọn lọc, tối ưu định dạng/kích thước. Không phụ thuộc 3D nặng hoặc đội họa sĩ ngoài; không dựng tranh thành bản đồ vị trí thật.
5. **Lộ trình gần đây:** Gợi lại lộ trình cập nhật trong **14 ngày**; hiển thị tên **“Lộ trình gần đây” / “Mở lại Lộ trình”**, không gọi “đang sử dụng” hay “chưa hoàn thành” khi hệ thống chưa có trạng thái đó. Không có mục phù hợp thì ẩn khối.
6. **Chọn ngẫu nhiên:** Lấy đều xác suất trong đúng **một Sổ người dùng đã chọn**, loại địa điểm bị xóa, mục tạm hết hạn, nơi có tín hiệu đóng cửa/nghi đóng cửa theo các trường dữ liệu hiện có. Những nơi độ tin cậy thấp vẫn có thể chọn nếu còn tồn tại, kèm nhãn cảnh báo. Sổ rỗng hoặc không còn mục hợp lệ: giải thích rõ, không bốc thăm. Không làm thay đổi thứ tự hoặc dữ liệu Sổ.
7. **Tiêu đề trang chủ:** Giữ quyền chỉnh sửa từ **Admin**, đặt **mặc định** là “Hôm nay bạn muốn ghé đâu?”. Khẩu hiệu thương hiệu “Gom chỗ hay. Chia sẻ dễ dàng.” tách khỏi tiêu đề và giữ thống nhất. Kiểm tra fallback khi Admin chưa cấu hình.
8. **Logo và màu:** **Giữ nguyên logo/màu logo hiện tại (#c8553d)** trong đợt này. Xanh rừng **#183B32** dùng chủ yếu cho chữ/nền đậm, không coi là một màu nhấn CTA thứ hai. Sử dụng một màu nhấn hành động thống nhất từ logo; các sắc cam đất/xanh nhạt khác chỉ làm nền/trang trí. Viết lại `DESIGN.md` cho hai chế độ trước FREEZE.
9. **Hoàn tác sau khi lưu:** **P0**, chỉ hiện sau khi server xác nhận lưu thành công. Hoàn tác đúng liên kết địa điểm–Sổ vừa tạo, báo rõ nếu hoàn tác thất bại. Nếu có nhiều Sổ, không xóa nhầm khỏi Sổ khác.
10. **Phân tích theo giao diện:** **Có**. Ghi `theme=atlas|basic` dưới dạng thuộc tính/nhóm phân tích cho các sự kiện liên quan đang có, cộng sự kiện `theme_switch` và các sự kiện Sổ/Lộ trình phù hợp. Không nhân đôi sự kiện thành tên riêng cho từng theme; không ghi câu tìm kiếm, mã cá nhân hay mã địa điểm. Chụp số liệu nền trước release; so sánh hai theme cần lưu ý thiên lệch do người dùng tự chọn.
11. **Thiết bị:** Kiểm thử chính trên iPhone Safari iOS 16+, Android Chrome, trình duyệt trong Zalo/Facebook, máy tính Chrome/Safari/Edge; chiều rộng **360 px trở lên** là chuẩn hỗ trợ. Có kiểm thử thêm **320 px** để tránh lỗi tràn; tính năng lõi vẫn phải dùng được trên trình duyệt không hỗ trợ hiệu ứng chuyển trang.

## 2. Chỉnh SCOPE trước DESIGN/FREEZE

- **Không đánh đồng 'chung component chức năng' với 'hai giao diện chỉ khác màu'.** Bản đồ gấp vẫn phải có bố cục, chất liệu và chuyển động riêng ở phần trình bày; cùng dữ liệu và handler chức năng, không nhân đôi business logic.
- **Nhóm quay lại phải có ở đợt B:** Sổ gần đây, Lộ trình gần đây và chọn ngẫu nhiên từ Sổ. Có thể đánh nhãn P1 trong backlog phát triển, nhưng **không được phát hành Bản đồ gấp hoàn chỉnh mà thiếu các điểm chạm này** nếu không trình lại PM.
- **Ảnh thẻ tìm kiếm P0 có thể kéo theo thay đổi dữ liệu trả về của phần tìm kiếm.** Bỏ khẳng định “thay đổi duy nhất phía server là `updatedAt` của Sổ” cho đến khi kiểm tra API ảnh. Vẫn không đổi cấu trúc Redis nếu không có đề xuất riêng được duyệt.
- **Không được hứa giữ vị trí cuộn tuyệt đối chỉ nhờ cùng component.** Thay bố cục giữa hai theme có thể làm dịch vị trí; viết kiểm thử cho tìm kiếm đang gõ, bộ lọc, form chưa gửi, vị trí cuộn và màn đang mở.
- **Sửa trình tự công việc:** PRODUCT APPROVED → SCOPE (được PM duyệt có điều kiện) → **DESIGN (wireframe, mockup, mẫu chuyển động, bộ quy tắc)** → **FREEZE** → BUILD → TEST → RELEASE. Không ghi “FREEZE rồi mới DESIGN”.
- **Không xóa mọi màu cứng một cách máy móc:** ưu tiên chuyển màu trình bày sang semantic tokens; màu trạng thái đặc thù, biểu tượng/logo và hình minh họa có thể giữ giá trị cố định khi có lý do, ghi ngoại lệ. Không áp theme cho `/admin`.
- **Dữ liệu:** Ghi chú lưu trên thiết bị, Sổ/Lộ trình nằm trên server gắn mã ẩn danh của thiết bị. Giữ nguyên `cdp_contributor`, `cdp_personal_notes`; không quảng bá đồng bộ thiết bị khi chưa có.
- **Ảnh Bản đồ gấp:** Không giả lập địa lý thật. Bố cục mobile ưu tiên khả năng dùng, ảnh và chuyển động không chặn ô tìm kiếm, nút Lưu và Chỉ đường.
- **Tránh nháy theme khi tải trang**, tương thích reduced motion và có fallback không hiệu ứng.

## 3. Việc Claude cần thực hiện tiếp (chưa BUILD)

1. Đọc, sửa `docs/SCOPE-UXUI-ban-do-gap.md` theo toàn bộ quyết định ở trên, làm rõ pha phát hành A và B, cùng tiêu chí nghiệm thu của mỗi pha.
2. **Kiểm kê ảnh chỉ đọc:** báo tỷ lệ có ảnh thật theo Ăn/Chơi/Ngủ/Đi lại; kiểm API hiện tại có cung cấp ảnh phù hợp cho thẻ tìm kiếm không; ước lượng tác động tải ảnh và phương án dự phòng.
3. Chụp **số liệu nền hiện có** (4 sự kiện và tỷ lệ người dùng quay lại theo khoảng thời gian hiện có); nếu quyền truy cập không đủ thì ghi rõ nguồn dữ liệu cần đọc, không tự tạo số.
4. Làm **DESIGN không sửa code**: wireframe và mockup 2 theme cho **Trang chủ B, Chi tiết địa điểm, Sổ**; thiết kế các trạng thái rỗng, có dữ liệu, thiếu ảnh, server lỗi; phác thảo chuyển động MỞ/GẤP/NỐI và nút chuyển chế độ. `DESIGN.md` nên được **đề xuất bản sửa** cho PM duyệt, chưa tự nhận là FREEZE.
5. Báo PM các rủi ro/tác động còn lại sau kiểm kê; yêu cầu PM duyệt bản DESIGN rồi mới FREEZE.

**Lệnh kiểm soát:** Không sửa code sản phẩm, không BUILD, không RELEASE, không commit ngoài phạm vi tài liệu được yêu cầu trong giai đoạn DESIGN. Nếu có điểm khác với PRODUCT.md, báo xung đột thay vì tự quyết.
