# CDP vNext — Kế hoạch UX/UI: Bản đồ gấp sống + Cơ bản

**Ngày:** 11/11/2026  
**Trạng thái:** PRODUCT APPROVED → SCOPE (chưa FREEZE, chưa BUILD)  
**Website:** https://chamdiaphuong.io.vn/

## 1. Quyết định đã duyệt

- Concept thị giác: **Bản đồ gấp sống (Living Atlas)** — giấy gấp, địa hình nhiều lớp, cảnh địa phương thu nhỏ.
- Có thêm chế độ **Cơ bản**: giao diện mới, gọn, đẹp và ít hiệu ứng; không đơn thuần quay về UI cũ.
- Một ứng dụng, một bộ dữ liệu và logic; hai cách trình bày. Người dùng có thể đổi bất cứ lúc nào.
- Thông điệp thương hiệu: **“Gom chỗ hay. Chia sẻ dễ dàng.”**
- Tiêu đề trang chủ (phương án B): **“Hôm nay bạn muốn ghé đâu?”**
- Giữ bốn lối vào **Ăn · Chơi · Ngủ · Đi lại** ngay dưới tìm kiếm, không dùng chúng làm thông điệp chính.
- Khối cá nhân hóa theo trạng thái có Sổ, Lộ trình; không dựng Sổ hay nội dung giả cho người mới.
- Core flow bảo toàn: **Trang chủ → Tìm chỗ → Chi tiết → Lưu vào Sổ**; các hành động Chia sẻ, Chỉ đường, Ghi chú, Lộ trình, đóng góp dữ liệu vẫn hoạt động.

## 2. Mục tiêu sản phẩm

1. Người mới hiểu CDP để làm gì và tìm được địa điểm nhanh.
2. Người quay lại có thể mở Sổ/Lộ trình gần đây hoặc chọn ngẫu nhiên từ Sổ đã lưu.
3. Giao diện có nhận diện khác biệt nhưng không cản thao tác, đọc thông tin hay hiệu năng.
4. Người dùng thích dùng chế độ nào đều hoàn thành được cùng một tác vụ, trên cùng một URL và dữ liệu.

**Chỉ số theo dõi:** tỷ lệ quay lại 7/30 ngày; tỷ lệ tìm→chi tiết; chi tiết→lưu; mở lại Sổ; chọn ngẫu nhiên→mở địa điểm; tỷ lệ hoàn thành Lộ trình; lỗi và hiệu năng di động. Chỉ đặt mục tiêu phần trăm sau khi có đường cơ sở.

## 3. Cấu trúc chức năng và màn hình

### A. Trang chủ
- Header: logo, nhãn phụ “Gom chỗ hay. Chia sẻ dễ dàng.”, nút **Giao diện: Bản đồ gấp / Cơ bản**, lối vào Sổ/Menu.
- Hero: **“Hôm nay bạn muốn ghé đâu?”**; mô tả ngắn “Tìm một nơi để ghé, hoặc chọn từ Sổ của bạn.”
- Ô tìm kiếm được nhìn thấy ngay và nhận focus tức thì.
- Bốn lối vào Ăn, Chơi, Ngủ, Đi lại.
- **Người mới/chưa có Sổ:** khuyến khích tìm và lưu chỗ đầu tiên; không giả dữ liệu.
- **Có Sổ:** hiển thị Sổ gần đây; mở Sổ và chọn ngẫu nhiên. Nếu nhiều Sổ, chọn đúng Sổ trước khi bốc thăm.
- **Có Lộ trình đang sử dụng:** một thẻ “Tiếp tục Lộ trình”.
- Nội dung thời vụ chỉ hiển thị khi còn hiệu lực; sự kiện đã qua chuyển lưu trữ.
- Bản đồ gấp: địa hình giấy nhiều lớp là cảnh minh họa sau hero, không làm mất ô tìm kiếm khỏi vùng đầu trang.
- Cơ bản: cùng nội dung, không có cảnh minh họa lớn; thẻ tối giản, dễ đọc.

### B. Tìm chỗ
- Tìm theo tên/địa chỉ và lọc Ăn/Chơi/Ngủ/Đi lại, khu vực và tiêu chí có dữ liệu.
- Ảnh thật nếu có; trạng thái thiếu ảnh rõ ràng. Không dùng tranh minh họa như ảnh bằng chứng của cơ sở.
- Thẻ rõ tên, nhóm, vị trí ngắn, giá nếu có, lần xác nhận khi có.
- Lưu nhanh khi phù hợp; vẫn xem chi tiết/Chỉ đường.
- Giữ từ khóa, bộ lọc và vị trí cuộn khi xem chi tiết rồi quay lại.
- Bản đồ gấp: thẻ giấy nâng/trải mở; Cơ bản: chuyển trang thông thường.

### C. Chi tiết địa điểm
- Thứ tự ưu tiên: ảnh → tên/nhóm/vị trí → thông tin thực dụng → Lưu vào Sổ / Chỉ đường / Chia sẻ → Ghi chú/Lộ trình → góp ý, xác nhận, sửa dữ liệu.
- Dữ liệu không chắc chắn phải có nhãn phù hợp; giữ các cảnh báo hiện có.
- Lưu: chọn Sổ, phản hồi thành công/thất bại, có hoàn tác nếu hỗ trợ; không được báo thành công trước khi ghi dữ liệu.
- Bản đồ gấp: thẻ trải thành trang, dấu giấy gập khi lưu; Cơ bản: ít chuyển động, nội dung và hành động tương đương.

### D. Sổ
- Danh sách Sổ; số lượng địa điểm, tên, ảnh đại diện tùy chọn; mở, đổi tên, quản lý theo khả năng sẵn có.
- Chọn ngẫu nhiên **chỉ trong Sổ được chọn**, trong các địa điểm hợp lệ; công khai cách chọn (đồng xác suất nếu không có tiêu chí khác), cho phép chọn lại, mở chi tiết, chỉ đường.
- Sổ rỗng: gợi ý tìm và lưu địa điểm, không hiển thị nút bốc thăm hoạt động giả.
- Bản đồ gấp: Sổ như xấp giấy có mép gập; chọn ngẫu nhiên như rút một thẻ. Cơ bản: danh sách thẻ gọn.

### E. Lộ trình
- Danh sách Lộ trình, các điểm theo thứ tự, giờ dự kiến nếu có; thêm/xóa/đổi thứ tự theo khả năng hiện có.
- Đường nối trang trí **không giả làm tuyến đường ngoài đời**. Chỉ đường thực tế qua nguồn bản đồ thích hợp.
- Bản đồ gấp: một dải giấy nối các điểm; Cơ bản: danh sách có số thứ tự và thông tin rõ.
- Kéo thả, nếu dùng, phải có lựa chọn thay thế bằng nút đổi thứ tự.

### F. Ghi chú và nội dung phụ
- Không bỏ Ghi chú, đóng góp thông tin, trang chia sẻ, giới thiệu và chính sách dữ liệu.
- Ghi chú hiện nêu lưu trên thiết bị: giữ cảnh báo và không hứa đồng bộ tài khoản nếu chưa xây dựng.
- Hai theme áp dụng thống nhất cho trạng thái rỗng, tải, lỗi, ngoại tuyến và nội dung chia sẻ.

## 4. Kiến trúc hai chế độ

- Dùng **cùng route, dữ liệu, hành động, component chức năng**; thay lớp theme, hình nền, bố cục chi tiết và hiệu ứng.
- Nút chuyển giao diện hiện diện nhất quán trong header/menu; có tên và trạng thái rõ.
- Chuyển ngay trên màn hình hiện tại, không xóa tìm kiếm/Sổ/Ghi chú/Lộ trình; giữ URL và tham số.
- Ghi nhớ lựa chọn bằng cấu hình trên thiết bị, có fallback khi cấu hình không đọc được.
- **Đề xuất cần xác nhận ở FREEZE:** khách truy cập mới mặc định Bản đồ gấp; người bật chế độ giảm chuyển động vẫn dùng được bản này nhưng giảm hiệu ứng, không bị tự ép sang Cơ bản.
- Đổi sang Cơ bản **khác** việc rollback phiên bản production khi có lỗi phát hành.
- Không xây hai codebase hoặc hai hệ thống quản trị địa điểm.

## 5. Design system và chuyển động

- Tông màu: xanh rừng #183B32; xanh lá #83A58D; cam đất #BD704E; kem giấy #F8F5ED; nền/thẻ trắng ngà.
- Chữ: ưu tiên font hỗ trợ tiếng Việt hoàn chỉnh; thử Be Vietnam Pro ở nội dung và font serif ở tiêu đề lớn, sau đó kiểm thử thực tế.
- Ảnh: tỷ lệ nhất quán, tối ưu dung lượng, dự trữ kích thước khung để tránh xô lệch.
- Ngôn ngữ chuyển động: **MỞ** (thẻ→chi tiết), **GẤP** (lưu→Sổ), **NỐI** (thêm điểm→Lộ trình).
- Hoạt ảnh khoảng 180–420 ms tùy mức; bấm nút phản hồi ngay. Có hỗ trợ `prefers-reduced-motion`; không chạy hoạt ảnh gây chờ khi nhập/chọn.
- Không xây bản đồ 3D phức tạp trong đợt đầu. Minh họa địa hình là mỹ thuật, không thay bản đồ tọa độ thực.

## 6. Scope theo mức ưu tiên

### P0 — nằm trong bản phát hành giao diện
1. Theme Bản đồ gấp và Cơ bản, nút chuyển và lưu lựa chọn.
2. Trang chủ B, tìm kiếm, bốn nhóm và các trạng thái cá nhân có/không có dữ liệu.
3. Tìm chỗ, Chi tiết, Sổ và Lộ trình có cùng luồng chức năng như trước.
4. Thiết kế trạng thái rỗng/tải/lỗi, ảnh dự phòng, hiển thị di động và máy tính.
5. Các chuyển động nhận diện lõi mở/gấp/nối và chế độ giảm chuyển động.
6. Phân tích sự kiện ẩn danh cần cho đánh giá trước/sau, chú ý quyền riêng tư.

### P1 — ưu tiên gắn với việc quay lại
1. **Chọn ngẫu nhiên từ một Sổ** đã có địa điểm; có thao tác chọn lại và mở điểm đến.
2. Mở nhanh Sổ gần đây, tiếp tục Lộ trình gần đây.
3. Tối ưu ảnh thẻ tìm kiếm và font tiếng Việt; dọn phần hiển thị PlaceExplorer liên quan.
4. Tối ưu nội dung theo mùa còn hiệu lực.

### Ngoài scope đợt này
- Đăng nhập bắt buộc, đồng bộ dữ liệu đa thiết bị, gợi ý bằng AI, cơ chế game/phần thưởng, mô phỏng 3D nặng, tính năng bản đồ/định tuyến tự phát triển, tái kiến trúc admin editor.
- Những nhu cầu trên đưa vào backlog riêng nếu sau này được duyệt.

## 7. Giai đoạn triển khai và cửa kiểm duyệt

| Giai đoạn | Công việc | Điều kiện chuyển bước |
|---|---|---|
| PM REVIEW | Chốt Home B + Living Atlas + Basic | **Đã duyệt** |
| SCOPE | Khóa danh sách màn hình/tính năng, trạng thái dữ liệu, thiết bị hỗ trợ và P0/P1 | PM duyệt scope, không phát sinh ngoài scope |
| DESIGN | Wireframe, mockup 2 theme, nguyên mẫu Home–Chi tiết–Sổ, thiết kế chuyển động | Duyệt bố cục + điều hướng + 2 theme |
| FREEZE | Khóa design system, giao thức chuyển theme, tiêu chí nghiệm thu, task kỹ thuật | Không tự ý đổi hành vi lõi |
| BUILD | Làm component chung trước; theme Cơ bản và Bản đồ gấp; tích hợp trên nhánh riêng | Luồng chính chạy, dữ liệu không đổi |
| TEST | Chức năng, hồi quy, khả năng truy cập, hiệu năng, máy yếu, dữ liệu không đầy đủ | Vượt toàn bộ tiêu chí bên dưới |
| RELEASE | Bật theo đợt, có phương án rollback, theo dõi số liệu trước/sau | Không có lỗi mất dữ liệu hoặc chặn luồng chính |
| OBSERVE | Theo dõi dùng lại và phản hồi; đưa cải tiến vào backlog | Review theo dữ liệu, không mở scope tùy hứng |

**Trình tự build khuyến nghị:** nền tảng theme + mode switch → Home B + nav → Tìm chỗ → Chi tiết + lưu → Sổ → Lộ trình → chọn ngẫu nhiên → tối ưu chuyển động và hiệu năng. Các hạng mục có thể lập trình song song sau khi chuẩn component và giao thức trạng thái đã ổn định.

## 8. Tiêu chí nghiệm thu tối thiểu

- [ ] Người mới nhìn thấy “Hôm nay bạn muốn ghé đâu?”, ô tìm kiếm, bốn nhóm mà không cần học cách dùng.
- [ ] Khẩu hiệu “Gom chỗ hay. Chia sẻ dễ dàng.” còn hiện diện nhưng không cạnh tranh với hành động chính.
- [ ] Hai giao diện cùng thực hiện được Tìm → Xem → Lưu → Mở Sổ → Thêm Lộ trình.
- [ ] Đang xem địa điểm hoặc đang lọc tìm kiếm mà chuyển mode thì nội dung/thao tác không mất.
- [ ] Chọn lại mode sau khi tải lại cùng thiết bị; dữ liệu Sổ/Ghi chú/Lộ trình không bị đổi hoặc xóa.
- [ ] Không có Sổ: CTA phù hợp; có Sổ rỗng: không thể bốc thăm giả; có Sổ: bốc thăm trong đúng danh sách.
- [ ] Điện thoại nhỏ, máy tính, bàn phím, màn hình cảm ứng và chế độ giảm chuyển động đều dùng được.
- [ ] Ảnh thiếu, giá thiếu, vị trí chưa xác nhận, mất mạng và tải lỗi có trạng thái rõ.
- [ ] Không làm mất khả năng chia sẻ URL, dữ liệu địa điểm cũ và các tác vụ đóng góp.
- [ ] Mục tiêu Core Web Vitals ở phân vị 75: LCP ≤ 2,5 giây; INP ≤ 200 ms; CLS ≤ 0,1; kiểm chứng khi có đủ dữ liệu thực tế.
- [ ] Có phương án rollback riêng cho production, không dựa vào nút “Cơ bản” như một cơ chế sửa lỗi.

## 9. Rủi ro và quyết định còn mở

1. Thế giới giấy nhiều lớp làm chậm trang chủ trên thiết bị yếu → minh họa tĩnh và tải lười là fallback.
2. Người dùng tưởng bản đồ minh họa là bản đồ địa lý → không dùng cảnh giấy làm dẫn đường thực.
3. Thiếu ảnh đẹp → giao diện dự phòng thống nhất và nhãn rõ.
4. Chọn ngẫu nhiên từ Sổ chưa có trong core hiện tại → ghi là hạng mục chức năng P1 và kiểm thử riêng.
5. Dữ liệu cá nhân lưu trên thiết bị → không hứa đồng bộ và không làm thay đổi nơi lưu khi đổi theme.
6. Chưa có số liệu trước/sau → cấu hình đo lường ở bước SCOPE/TEST trước khi kỳ vọng tăng giữ chân.
7. Mặc định khách mới ở giao diện nào → đề xuất Bản đồ gấp, xác nhận trước FREEZE.

## 10. Tài liệu nguồn đã đối chiếu ngày 11/11/2026

- https://chamdiaphuong.io.vn/ (thông điệp, tìm kiếm, bốn nhóm, giới thiệu tính năng)
- https://chamdiaphuong.io.vn/tim (danh sách, bộ lọc, trạng thái cập nhật)
- https://chamdiaphuong.io.vn/dia-diem/pending-d6afbf4b-f88d-4c2c-8967-f28a44bc4d8a (chi tiết, xác nhận, lưu, chia sẻ, lộ trình)
- https://chamdiaphuong.io.vn/so (khu vực Sổ)
- https://chamdiaphuong.io.vn/lo-trinh (khu vực Lộ trình)
- https://chamdiaphuong.io.vn/ghi-chu (cảnh báo dữ liệu lưu trên thiết bị)
- https://developers.google.com/search/docs/appearance/core-web-vitals (chỉ số hiệu năng tham chiếu)

**Ghi chú:** Đây là kế hoạch thiết kế/triển khai, không phải mã nguồn đã cập nhật hoặc thông báo production đã thay đổi.
