# PM FINAL REVIEW — DESIGN CDP vNext: Bản đồ gấp + Cơ bản

**Ngày:** 12/11/2026  
**Người nhận:** Claude / đội triển khai CDP  
**Trạng thái quyết định:** **DESIGN APPROVED — CHO PHÉP CHUYỂN SANG FREEZE TÀI LIỆU**  
**Chưa phải:** FREEZE đã hoàn tất; chưa cho phép BUILD, TEST hoặc RELEASE.  
**Ưu tiên:** Văn bản này thay thế PM REVIEW DESIGN v2 trước đây ở những nội dung được chốt bên dưới. Các quyết định trước không bị đề cập vẫn giữ hiệu lực.

## 1. Cơ sở review và kết luận

PM đã kiểm tra bản HTML `CDP Bản đồ gấp + Cơ bản-v2.html` do chủ dự án gửi. Gói có **9 bảng**:

0. Hệ thống thiết kế CDP v2.
1. Bộ minh họa theo nhóm.
2. Điều hướng chính.
3. Trang chủ B.
4. Tìm chỗ.
5. Chi tiết địa điểm.
6. Sổ.
7. Lộ trình.
8. Chuyển động MỞ / GẤP / NỐI.

Đối chiếu với báo cáo DESIGN của Claude và PM REVIEW v2 ngày 12/11. Đánh giá qua ảnh dựng từ HTML tĩnh cùng phần cấu trúc/mẫu dữ liệu trong bản đóng gói; **không phải kiểm thử hành vi trang web production, không thay thế việc kiểm thử hoạt ảnh hoặc dữ liệu thật sau BUILD**. Một số phần lặp dữ liệu trong bản đóng gói phụ thuộc bộ dựng động, nên không coi ảnh tĩnh là xác nhận mọi trạng thái đang chạy.

**KẾT LUẬN: Duyệt DESIGN theo hướng đề xuất.** Cơ bản đủ sạch, dễ thao tác; Bản đồ gấp nay có nếp giấy ba tấm, lớp địa hình tiết chế, khung ảnh dán giấy, bìa Sổ và Lộ trình dạng dải giấy. Nội dung Home B được giữ; hành động chức năng vẫn thống nhất giữa hai chế độ. Không mở thêm vòng vẽ lại concept lớn trước FREEZE. Nếu sau BUILD hiệu ứng thực tế chưa ổn, sửa trong TEST, không đẩy hiệu ứng nặng vào production.

**Hai mức duyệt tách biệt:**
- **Duyệt hướng và quy chuẩn thiết kế:** Có.
- **Xác nhận hiệu năng, hiển thị SVG cuối, chuyển động thật và luồng dữ liệu phục hồi:** Chưa; nghiệm thu sau BUILD/TEST.

## 2. Chốt đủ 5 điểm còn mở trong SCOPE §6

### 2.1. Thanh điều hướng đáy 4 mục — DUYỆT

Áp dụng trên mobile: **Trang chủ · Tìm chỗ · Sổ · Lộ trình**. Giữ thứ tự và nhãn nhất quán ở hai giao diện, vùng chạm từ 44px. Ở màn Chi tiết, thanh hành động **Lưu vào Sổ / Chỉ đường** thay thanh điều hướng đáy; không hiển thị chồng hai thanh. Khi bàn phím thật sự mở, thanh đáy không che ô nhập/kết quả. Tính vùng an toàn của thiết bị, đặc biệt iOS và các trình duyệt trong ứng dụng; phải có đường Quay lại rõ ràng ở màn Chi tiết. Trên desktop dùng điều hướng sidebar/header như mockup, không cần thanh đáy.

### 2.2. Gợi ý một lần về nút Giao diện — DUYỆT CÓ GIỚI HẠN

Nút **Giao diện** giữ trong Menu mobile và cuối sidebar desktop. Khi **đợt B** phát hành, người dùng có thể thấy **một lời gợi ý ngắn, không chặn thao tác** về vị trí đổi Bản đồ gấp ↔ Cơ bản (ví dụ một dấu chú thích gắn với biểu tượng Menu hoặc nội dung khi mở Menu lần đầu). Hiển thị tối đa một lần mỗi thiết bị/định danh lưu được, cho phép bỏ qua; không dùng hộp thoại bắt buộc, không hiện lại sau mỗi lần mở trang và không ép người dùng chuyển chế độ. Người dùng cũ giữ tùy chọn đã lưu; người mới mặc định Bản đồ gấp khi đủ điều kiện hiệu năng như PM đã duyệt. Đợt A **không có** công tắc.

### 2.3. Lối vào “Dùng trên máy khác?” ở Sổ trong đợt A — CHƯA DUYỆT THÊM

**Không mở lối vào mới ngay trong đợt A.** Giữ nguyên cơ chế khôi phục thủ công bằng **mã 6 số** và đường truy cập hiện có; không xóa hoặc làm hỏng luồng cũ khi đổi giao diện. Lý do: Claude vừa xác minh (a) lần lưu đầu không đưa mã khôi phục cho khách thấy và (b) khôi phục trên máy đã có Sổ có thể thay hồ sơ đang sử dụng khiến các Sổ tại máy đó không còn hiện. Nút mới dễ khiến người dùng hiểu nhầm là đồng bộ/ghép dữ liệu an toàn.

Hai lỗi/rủi ro trên phải có mục riêng trong BACKLOG và được PM xếp ưu tiên để sửa sớm. **Trước khi mở lối vào mới** cần có cách lấy/lưu mã rõ ràng, cảnh báo trước khi thay hồ sơ, xác nhận của khách và kiểm thử trường hợp thiết bị đích đã có Sổ. Tuyệt đối không gọi mã 6 số là đồng bộ tài khoản. Không tự mở Scope tài khoản/sync trong UX/UI vNext.

### 2.4. Trang chủ Bản đồ gấp cho người quay lại — DUYỆT

**Có.** Với người có Sổ gần đây, thu gọn/bỏ minh họa địa hình lớn để **Sổ gần đây xuất hiện sớm trong màn đầu**; vẫn giữ nền giấy, góc gấp hoặc hoa văn nhẹ làm dấu hiệu nhận diện. Với người mới, dùng cảnh địa hình ba lớp đã thiết kế ở **sau ô tìm + bốn nhóm**. Không che ô tìm, không tự bật bàn phím. Chỉ hiển thị Lộ trình gần đây khi có dữ liệu phù hợp; không tự ghi “chưa hoàn thành” khi hệ thống không có trạng thái đó.

### 2.5. Giới hạn tiêu đề Trang chủ trong Admin — DUYỆT 60 KÝ TỰ

**Có, giới hạn 60 ký tự hiển thị khi Admin nhập/sửa tiêu đề Home**, kèm bộ đếm và thông báo rõ nếu quá giới hạn. Đưa vào phạm vi chỉnh sửa nhỏ của đợt A; không tái cấu trúc khu vực Admin. Không tự cắt im lặng tiêu đề đã lưu từ trước; nếu đã có bản dài, vẫn phải hiển thị an toàn và yêu cầu Admin rút ngắn khi sửa. Tiêu đề mặc định: **“Hôm nay bạn muốn ghé đâu?”**. Phải kiểm tra 320/360/390px và không để tiêu đề đẩy ô tìm/bốn nhóm khỏi vùng sử dụng đầu trang. Admin vẫn có quyền thay tiêu đề trong giới hạn đã chốt.

## 3. Các quyết định DESIGN tiếp tục giữ nguyên

1. **Thông điệp trang chủ B:** Khẩu hiệu **“Gom chỗ hay. Chia sẻ dễ dàng.”**, H1 mặc định **“Hôm nay bạn muốn ghé đâu?”**. Bốn nhóm **Ăn, Chơi, Ngủ, Đi lại** vẫn hiển thị ngay dưới ô tìm.
2. **Hai chế độ một hệ:** Cơ bản làm mới, Bản đồ gấp có phong cách giấy; chung cấu trúc dữ liệu và các hành động, không tạo website riêng. Chuyển chế độ giữ trạng thái thao tác và được nhớ trên thiết bị.
3. **Minh họa thiếu ảnh:** Dùng **năm SVG theo nhóm Ăn, Chơi, Ngủ, Đi lại và dự phòng**. Ưu tiên ảnh thật của đúng địa điểm khi có, loại ảnh chỉ chụp menu khỏi ảnh đại diện; không tạo ảnh giả địa điểm thật. Hai chế độ dùng chung hình gốc nhưng khung khác nhau. Trang Chi tiết hiện nhãn **“Hình minh họa · Chưa có ảnh thực tế”**; Tìm chỗ dùng hình nhỏ và giải thích ở đầu danh sách. Ảnh tìm kiếm là P0; tăng ảnh thật là backlog nội dung riêng.
4. **Thông tin lưu/đồng bộ — QUY TẮC XUYÊN SESSION:** Không có tài khoản, Sổ/Lộ trình được truy cập bằng định danh ẩn danh gắn với thiết bị hiện tại; dữ liệu có thể nằm trên server nhưng **không tự đồng bộ đa thiết bị**. Khôi phục thủ công bằng mã 6 số là chức năng riêng, không phải đồng bộ tự động và **không tự gộp Sổ của hai máy**. Chỉ sau khi có hệ thống tài khoản **và cơ chế đồng bộ được triển khai** mới có đồng bộ đa thiết bị. Ghi chú riêng lưu trên thiết bị theo code hiện có. Quyết định này đã được ghi vào DECISIONS, ARCHITECTURE, HANDOFF, STATUS, CLAUDE.md theo báo cáo của Claude; tiếp tục giữ nhất quán. Không hỏi PM lại chỉ vì mở session mới. `PRODUCT.md` chỉ cập nhật theo thẩm quyền/duyệt của chủ dự án; nếu cần, nộp đoạn chỉnh chính xác thay vì tự sửa trái quy trình.
5. **Màu và chữ:** Logo `#C8553D` giữ nguyên, màu hành động chính `#B04A33`; không tạo hai màu CTA. Font tiếng Việt theo bộ DESIGN, kiểm thử dấu/hiệu năng.
6. **Chọn ngẫu nhiên:** Chọn đều giữa các địa điểm hợp lệ trong một Sổ đã chọn; không tự loại địa điểm chưa xác nhận; chỉ loại đã gỡ/hết hạn theo dữ liệu, giữ cảnh báo tin cậy. Chọn ngẫu nhiên thuộc đợt B. Trạng thái rỗng nói rõ lý do.
7. **MỞ / GẤP / NỐI:** Chỉ có phản hồi lưu thành công sau khi server trả thành công; có Hoàn tác; hỗ trợ giảm chuyển động. Dải nối Lộ trình là **thứ tự điểm dừng**, không tự nhận là tuyến đường địa lý thật.
8. **Phát hành hai đợt:** Đợt A **Cơ bản mới**; đợt B **Bản đồ gấp + công tắc + Sổ gần đây/Lộ trình gần đây/chọn ngẫu nhiên**. Mỗi đợt có checklist kiểm thử và rollback độc lập.
9. **Đo lường:** Có thể gắn `theme=basic|atlas` vào sự kiện hiện có với thay đổi giới hạn, không đưa dữ liệu riêng tư vào log. Lưu lượng hiện rất thấp, không suy diễn hiệu quả thống kê trước/sau.

## 4. Ghi chú từ review 9 bảng mockup v2

- **Hệ thiết kế:** hệ màu và nếp giấy ba lớp đạt mục tiêu concept; không tăng độ nặng chỉ vì muốn thêm chiều sâu.
- **Bộ minh họa:** hướng năm hình SVG nhẹ phù hợp dữ liệu hiện có (đa số nơi thiếu ảnh). Cần kiểm tra 5 file SVG gốc trong repo ở các cỡ thực tế, cùng trạng thái lỗi ảnh, alt và nhãn minh họa trước khi nghiệm thu BUILD.
- **Điều hướng:** đã có phương án 320px, 360px, bàn phím, Chi tiết và desktop. Quy tắc thay thanh đáy bằng thanh hành động của Chi tiết phải có test riêng.
- **Home B:** luồng nhìn rõ: khẩu hiệu → H1 → ô tìm → nhóm → Sổ/Lộ trình hoặc hướng dẫn người mới. Thu gọn địa hình cho khách quay lại là đúng ưu tiên sử dụng.
- **Tìm chỗ:** mockup dùng 20 dòng mẫu (2 có ảnh, 18 dùng minh họa), có trạng thái thiếu giá, không kết quả, tải và mất mạng. Trong BUILD phải đối chiếu API/ảnh và thử danh sách dài trên thiết bị thật; không suy từ mockup là đã xử lý API xong.
- **Chi tiết:** rõ nhãn ảnh thật/minh họa, CTA, trạng thái đang lưu, lỗi, thành công, Hoàn tác. Kiểm tra không chồng thanh đáy và không báo đã lưu khi server chưa xác nhận.
- **Sổ:** hai chế độ có tính liên tục, có chọn ngẫu nhiên và các trường hợp rỗng/mất mạng. Phần câu chữ mã khôi phục tuyệt đối không hứa tự đồng bộ.
- **Lộ trình:** nút ↑/↓ để xếp lại điểm, phù hợp điện thoại; dải giấy chỉ thể hiện thứ tự. Google Maps vẫn phụ trách đi thực tế.
- **Chuyển động:** bảng MỞ/GẤP/NỐI là đặc tả hướng thiết kế, chưa phải hiệu ứng đã được test. Nếu thiết bị không hỗ trợ kỹ thuật chuyển trang thì mở nội dung bình thường.

## 5. Việc Claude phải làm trong FREEZE (chỉ tài liệu)

1. Cập nhật `docs/SCOPE-UXUI-ban-do-gap.md`: chuyển năm điểm mở trong §6 thành **năm quyết định đã chốt ở §2**, cập nhật danh sách quyết định đã khóa; tách rõ backlog khôi phục mã 6 số.
2. Chốt `docs/DESIGN-de-xuat-2-che-do.md` theo bản v2 và năm quyết định. Sau khi đối chiếu không xung đột với quy định cũ, chuẩn bị **thay** `docs/DESIGN.md` theo quy trình repo, đồng thời lưu bản cũ vào archive theo quy ước dự án. Ghi phiên bản và ngày hiệu lực.
3. Kiểm tra `docs/DECISIONS.md`, `docs/ARCHITECTURE.md`, `docs/HANDOFF.md`, `docs/STATUS.md`, `CLAUDE.md` thống nhất quy tắc Sổ/khôi phục. Nếu `PRODUCT.md` có thẩm quyền duyệt riêng, chuẩn bị bản chỉnh để chủ dự án phê duyệt; không tự sửa vượt thẩm quyền.
4. Xác định năm SVG đề xuất là tài sản thiết kế đã duyệt về hướng; lưu đường dẫn, mục đích, tên file, alt, nhãn, cỡ trình bày. Không đưa vào production trước BUILD.
5. Tạo checklist nghiệm thu riêng **đợt A** và **đợt B**, trong đó có các ca: 320px/360px/390px, iOS Safari, Chrome Android, trình duyệt trong Zalo/Facebook, mất mạng, lỗi server, chưa có ảnh, trạng thái lưu/Hoàn tác, giữ bộ lọc khi quay lại, lưu/xếp Lộ trình, giảm chuyển động, và rollback.
6. Ghi **FREEZE record**: ngày/commit, tài liệu nguồn chính, phạm vi A/B, ngoại lệ chưa xử lý, những mục backlog không thuộc lần release. Báo cáo trạng thái rõ ràng trước khi đề xuất BUILD.

**Không tự BUILD, sửa code sản phẩm, commit thay đổi production, triển khai hoặc release khi chưa có bước phê duyệt tiếp theo theo flow dự án.** Nếu chỉ sửa tài liệu, tuân thủ cơ chế commit tài liệu của dự án và nêu rõ file nào đã thay đổi.

## 6. Các rủi ro vẫn tồn tại sau FREEZE (không đồng nghĩa DESIGN chưa duyệt)

- **Khôi phục mã 6 số:** chưa hiển thị ngay ở lần lưu đầu; thay hồ sơ trên máy đích có thể làm Sổ hiện tại không còn hiện. Đây là issue chức năng có thể gây mất khả năng truy cập, không đưa thêm CTA khuyến khích trước khi sửa.
- **Ảnh thật chỉ chiếm tỷ lệ nhỏ:** minh họa thay thế phải rõ bản chất; không làm ảnh giả chiếm chỗ quá lớn.
- **Hiệu ứng và tốc độ chưa được đo thực tế:** kiểm thử sau BUILD; giao diện Cơ bản luôn là lựa chọn thay thế khi đợt B được phát hành.
- **Thay màu hard-code trên nhiều file:** làm có kiểm soát; ngoài phạm vi `/admin` trừ thay đổi tiêu đề Home được PM cho phép ở §2.5.

## 7. Chốt luồng tiếp theo

**PM FINAL DESIGN APPROVED → FREEZE tài liệu → PM xác nhận FREEZE record → BUILD A → TEST A → RELEASE A → BUILD B → TEST B → RELEASE B.**

Khi Claude gửi lại FREEZE record, PM chỉ kiểm tra tính nhất quán, phạm vi và rủi ro; **không lặp vòng hỏi năm quyết định trên** trừ khi có xung đột mới được chứng minh bằng code/dữ liệu.
