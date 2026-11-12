# PM REVIEW — DESIGN vNext CDP: Bản đồ gấp + Cơ bản (v2)

**Ngày:** 12/11/2026  
**Trạng thái:** **DESIGN APPROVED WITH CHANGES — CHƯA FREEZE**  
**Mục đích:** Giao Claude cập nhật tài liệu và hoàn thiện thiết kế trước PM review cuối.  
**Thay thế:** `docs/PM-REVIEW-DESIGN-CDP-Ban-do-gap-2026-11-12.md` bản cũ. Không gửi đồng thời hai bản quyết định khác nhau.  
**Nguồn đã xem:** `CDP Bản đồ gấp + Cơ bản.html` do chủ dự án gửi, có 5 bảng tĩnh (0: Design system; 1: Trang chủ B; 2: Chi tiết; 3: Sổ; 4: Chuyển động/đổi chế độ/trạng thái). Đối chiếu `docs/SCOPE-UXUI-ban-do-gap.md`, `docs/DESIGN-de-xuat-2-che-do.md`, `docs/KIEM-KE-anh-so-lieu-nen-2026-11-11.md`. Đây là mockup, **không phải kiểm thử code hay hoạt ảnh thực tế**.

## 1. Kết luận thiết kế

**Duyệt hướng chung**: hai giao diện, một logic/dữ liệu; Home B; phát hành A (Cơ bản mới) trước, B (Bản đồ gấp + chuyển chế độ + nhóm quay lại) sau; ba động tác MỞ, GẤP, NỐI; giữ tính thực dụng. **Chưa FREEZE** vì phải chỉnh mockup theo quyết định mới của PRODUCT, hoàn thành `/tim` và Lộ trình cả hai chế độ, kiểm tra điều hướng và trạng thái dữ liệu.

### Nhận xét dựa trên đúng 5 bảng HTML

| Bảng | Đánh giá PM | Yêu cầu |
|---|---|---|
| 0 — Hệ thiết kế | Hệ màu, chữ, màu hành động hợp lý; giữ logo. | Giữ màu nút `#B04A33`, logo `#C8553D`; kiểm thử tương phản thực tế. Dùng ngôn ngữ ảnh minh họa chung. |
| 1 — Trang chủ | Bố cục B rõ; ô tìm + 4 nhóm dễ nhận ra; các Sổ/Lộ trình gần đây có ích. Nhưng bản Bản đồ gấp đang thiên về nền đồi phẳng, chưa thể hiện đủ **nếp gấp, lớp giấy, chiều sâu** như concept. | Tăng cảm giác giấy có lớp, đường đồng mức, một điểm nhấn dạng bản đồ gấp; tiết chế diện tích, không đẩy ô tìm hoặc lối vào Sổ xuống sâu. **Bỏ autofocus Home trên mobile**. |
| 2 — Chi tiết | Ưu tiên thông tin và nút Lưu/Chỉ đường tốt; trạng thái lưu thành công/Hoàn tác rõ. Trạng thái thiếu ảnh hiện chỉ là một hàng chữ/biểu tượng. | Thay bằng minh họa giấy theo **loại địa điểm**; phân biệt rõ ảnh thật và hình minh họa. Không làm vị trí các nút chính quá thấp. |
| 3 — Sổ | Bản Cơ bản dễ đọc; bản Bản đồ gấp đã có thẻ giấy/xấp giấy; trạng thái rút thẻ, trống, lỗi được suy nghĩ tương đối kỹ. | Đồng nhất tên hành động **“Chọn ngẫu nhiên”** giữa 2 giao diện (có thể mô tả “rút một thẻ” như ngôn ngữ phụ của Bản đồ gấp). Sửa câu chữ về đồng bộ như §3. |
| 4 — Chuyển động/chế độ | Quy tắc MỞ/GẤP/NỐI, không xác nhận lưu trước phản hồi server, giảm chuyển động là hợp lý. | Giữ để phát triển; chỉ nghiệm thu chuyển động sau BUILD. Kiểm tra vị trí nút đổi chế độ ở 320–360px và trạng thái khi đang nhập form. |

### Điểm mở thêm khi xem mockup

**Điều hướng chính trên điện thoại:** mockup mới thấy header/menu; cần trình bày rõ người dùng truy cập **Trang chủ / Tìm chỗ / Sổ / Lộ trình** thế nào mà không phải đi nhiều bước. Claude có thể đề xuất thanh điều hướng đáy 4 mục hoặc phương án tương đương; PM duyệt sau khi xem cả chế độ Cơ bản và Bản đồ gấp. Không để nút đổi chế độ cạnh tranh với điều hướng lõi.

**Hình ảnh Bản đồ gấp:** Bản đồ gấp không chỉ là Cơ bản đổi font/nền giấy. Cần khác biệt rõ bằng bố cục trang trí, nếp gấp, lớp địa hình, bìa Sổ và hiệu ứng; nhưng không tạo một bộ chức năng riêng, không làm chậm thao tác.

## 2. Quyết định PRODUCT mới — bắt buộc áp dụng

### 2.1. Ảnh mặc định là **minh họa bản đồ giấy theo nhóm**, KHÔNG còn chỉ là biểu tượng/tem trống

Kiểm kê: **16/342 địa điểm (4,7%)** có ảnh thật; khoảng 95% chưa có. Vì vậy ảnh minh họa không phải ngoại lệ mà là thành phần cốt lõi của trải nghiệm hình ảnh.

- **Có ảnh thật phù hợp**: ưu tiên ảnh thật của đúng địa điểm. Bỏ ảnh chỉ chụp menu khỏi ảnh đại diện.
- **Không có ảnh / ảnh lỗi**: hiển thị **minh họa theo nhóm**, cùng phong cách Bản đồ gấp, **không mô phỏng địa điểm cụ thể**. Bốn nhóm tối thiểu: **Ăn** (ẩm thực/quán), **Chơi** (cảnh/hoạt động), **Ngủ** (lưu trú/mái nhà), **Đi lại** (đường/phương tiện). Thêm mẫu dự phòng cho nhóm không xác định/chỗ đặc biệt nếu dữ liệu cần.
- Hai chế độ dùng **cùng một bộ hình gốc**: Cơ bản hiển thị gọn, phẳng, không hiệu ứng; Bản đồ gấp có khung giấy, nếp gấp, chuyển động có kiểm soát.
- Đặt nhãn phân biệt ở **trang Chi tiết**: **“Hình minh họa · Chưa có ảnh thực tế”**, kèm “Gửi ảnh” nếu hành động đó đang có. Không lặp dòng nhãn dài trên mọi thẻ tìm kiếm; có thể dùng biểu tượng/nhãn ngắn, với giải thích truy cập được.
- Không dùng AI tạo “ảnh thật giả” cho từng quán hoặc địa chỉ. Hình minh họa loại hình không được mang tên, địa chỉ, bảng hiệu, tọa độ hay công trình ngụ ý là nơi thật.
- Trên `/tim`: dùng hình minh họa **nhỏ, đồng kích cỡ** (đề xuất 64–88px), không dành khung ảnh lớn khiến danh sách 20 kết quả bị dài. Trang Chi tiết có thể dùng khung minh họa vừa phải, nhưng để các hành động chính hiện sớm.
- Nếu dùng AI tạo **tài sản minh họa theo nhóm**, phải kiểm tra và duyệt bộ ảnh trước khi đưa vào repo; SVG/CSS là lựa chọn ưu tiên cho hình đơn giản, nhẹ và dễ thay màu. Tối ưu WebP/AVIF nếu có ảnh bitmap. Khóa kích thước và có cách dự phòng khi tải lỗi.
- Claude nộp mockup **cả 4 nhóm không có ảnh** ở Trang chi tiết, và danh sách `/tim` mẫu **18 thẻ dùng minh họa + 2 thẻ có ảnh thật**, so sánh hai giao diện.
- **Ảnh trên thẻ tìm kiếm là P0**. Việc chủ động thu thập thêm ảnh thật là **BACKLOG nội dung riêng**, không chặn release giao diện.

### 2.2. Quy tắc Sổ / tài khoản / đồng bộ — quyết định sản phẩm xuyên session

**QUY TẮC SẢN PHẨM ĐÃ CHỐT:**

> **Không có tài khoản**: Sổ và Lộ trình gắn với thiết bị/định danh ẩn danh hiện tại; **không tự đồng bộ sang thiết bị khác**.  
> **Có tài khoản và cơ chế đồng bộ được triển khai**: người dùng mới có đồng bộ Sổ/Lộ trình giữa các thiết bị. **Tài khoản không bắt buộc** đối với người chỉ muốn tra cứu, lưu và sử dụng trên thiết bị hiện tại.

Phân biệt dứt khoát **nơi lưu dữ liệu** với **khả năng truy cập trên thiết bị khác**:

- Hiện tại Sổ/Lộ trình có thể lưu vật lý trên Redis/server, nhưng truy cập gắn với mã ẩn danh trên thiết bị; điều này **không có nghĩa tự đồng bộ đa thiết bị**.
- Ghi chú riêng hiện lưu trên thiết bị theo kiến trúc đang có.
- Nếu hệ thống hiện có **mã khôi phục thủ công**, Claude phải xác minh trong code và mô tả nó là **khôi phục**, không phải **đồng bộ tự động**. Dòng mockup “Đổi máy: dùng mã khôi phục” cần được viết lại chính xác hoặc đưa vào phần trợ giúp, không làm khách hiểu nhầm. Không xóa chức năng khôi phục hiện có khi làm lại UI.
- **Chưa có cơ chế account/sync trong Scope UX/UI này** thì không vẽ nút “Đăng nhập để đồng bộ” như một chức năng đã hoạt động. Không mở Scope account mới.
- Câu chữ tạm cho Sổ hiện tại: **“Sổ của bạn gắn với thiết bị này. Chưa có đồng bộ tự động giữa các thiết bị.”** Chú thích khôi phục thủ công chỉ hiện khi code xác nhận tính năng đó đang hoạt động.
- **Ghi cố định** quyết định này vào tài liệu nguồn chuẩn theo thứ tự ưu tiên của repo: rà soát `PRODUCT.md`, cập nhật `DECISIONS.md`, nêu cơ chế thật trong `ARCHITECTURE.md` khi thích hợp, và tóm tắt ở `STATUS.md` hoặc tài liệu handoff/session. Nếu sửa `PRODUCT.md` cần tuân thủ quyền duyệt PRODUCT; **chỉ đề xuất bản sửa nếu tài liệu đó phải được chủ dự án phê duyệt**. Không chỉ ghi trong một file PM REVIEW có thể bị bỏ qua ở session sau.
- Khi Claude mở session mới phải đọc tài liệu nguồn chuẩn trước khi suy luận chuyện lưu/đồng bộ. **Không tiếp tục hỏi lại PM về quy tắc này.** Chỉ nêu câu hỏi nếu code có mâu thuẫn thực tế cần xử lý.

## 3. Các quyết định PM cũ tiếp tục có hiệu lực

1. **Màu**: logo `#C8553D`, nút/liên kết hành động chính `#B04A33`, xanh rừng làm chữ/nền; không tạo 2 màu CTA cạnh tranh. Kiểm lại tương phản từng trạng thái, nền và disabled/focus.
2. **Dữ liệu đo theo giao diện**: cho phép chỉnh có giới hạn đoạn ghi analytics; gắn thuộc tính `theme=basic|atlas` vào sự kiện thay vì nhân đôi sự kiện. Không đưa vào event từ khóa, dữ liệu Ghi chú, tên/mã riêng của Sổ, hoặc thông tin nhận dạng. Kiểm tra tương thích số liệu cũ. Với chỉ 37 phiên trong 42 ngày, dùng số tuyệt đối và quan sát định tính, chưa kết luận hiệu quả A/B.
3. **Chọn ngẫu nhiên trong Sổ**: phân phối đều giữa các chỗ còn hợp lệ của **Sổ đã chọn**; loại chỗ đã gỡ hoặc hết hạn; không tự loại theo giả thuyết “nghi đóng cửa” chưa có trong dữ liệu; chỗ chưa xác nhận vẫn có thể rút với nhãn cảnh báo. Sổ không có chỗ hợp lệ phải nói lý do.
4. **Khẩu hiệu mobile**: “Gom chỗ hay. Chia sẻ dễ dàng.” trên H1 “Hôm nay bạn muốn ghé đâu?”. Tiêu đề Home tiếp tục cho Admin sửa, thử với câu dài.
5. **Không autofocus Home mobile**: không tự bật bàn phím khi người dùng vừa mở trang.
6. **Hoàn tác sau lưu**: P0; chỉ báo lưu thành công khi server trả OK. Không hứa tự gửi lại khi offline.
7. **Hai đợt phát hành**: A = Cơ bản mới (chưa có công tắc); B = Bản đồ gấp + công tắc + Sổ gần đây, Lộ trình gần đây, chọn ngẫu nhiên. Theme sau này mặc định Bản đồ gấp nếu đủ hiệu năng; vẫn nhớ lựa chọn khách cũ. Có rollback sản phẩm tách khỏi công tắc giao diện.
8. **Scope không mở rộng** sang đăng nhập/đồng bộ đa thiết bị, 3D nặng, game mới, bản đồ định tuyến mới hoặc tái cấu trúc Admin. Các chức năng cũ, link chia sẻ, Sổ/Lộ trình và quyền riêng tư phải giữ.

## 4. Mẫu mockup và kiểm thử trước FREEZE

Claude cập nhật DESIGN/SCOPE và giao lại:

- **Trang chủ B × 2 chế độ**: trạng thái người mới/đã có Sổ, có/không có Lộ trình gần đây, ô tìm không tự focus, câu dài do Admin chỉnh, có phương án điều hướng chính rõ.
- **Chi tiết × 2 chế độ**: 4 nhóm minh họa thiếu ảnh, có ảnh thật, ảnh lỗi, thiếu vị trí/giá, lưu/đang lưu/lỗi lưu/hoàn tác. Nhãn thật vs minh họa minh bạch.
- **Sổ × 2 chế độ**: danh sách nhiều Sổ, rỗng, chỗ không hợp lệ, chọn ngẫu nhiên, mất mạng; câu chữ lưu/đồng bộ thống nhất §2.2.
- **Tìm chỗ × 2 chế độ**: 20 thẻ mô phỏng gần thực tế (**18 thiếu ảnh được minh họa, 2 ảnh thật**), bộ lọc/giá/vị trí/trạng thái tin cậy, đủ thông tin và không làm danh sách phình cao.
- **Lộ trình × 2 chế độ**: danh sách, chi tiết/xếp điểm, thêm/xóa/đổi thứ tự, đi lại thật qua nền tảng bản đồ, giảm chuyển động.
- **Hệ thống điều hướng**: desktop và mobile ở 320/360px, chỉ rõ nút chuyển giao diện đợt B nằm ở đâu; không che thao tác khi bàn phím bật.
- **Tài sản minh họa**: bảng 4 nhóm (có thể có mẫu dự phòng), dung lượng dự kiến, quy ước nhãn, tình huống thiếu ảnh ở cả hai theme.
- **Bản thiết kế**: cập nhật `docs/DESIGN-de-xuat-2-che-do.md` và `docs/SCOPE-UXUI-ban-do-gap.md`, liệt kê quyết định đã khóa và vấn đề thực sự còn mở. Chuẩn bị thay `DESIGN.md` **sau FREEZE**, không thay trước.

**Chưa được sửa code sản phẩm, BUILD, RELEASE hay thay `DESIGN.md` đang có hiệu lực.** Tài liệu được phép chỉnh và chuẩn bị phương án hình minh họa; nếu có tài sản phát sinh phải quản lý rõ là **đề xuất**, chưa nhập production.

## 5. Điều kiện PM ký FREEZE

PM được xem đủ cả năm màn hình ở hai giao diện; các mẫu thiếu ảnh theo nhóm được duyệt; câu chữ anonymous/account/recovery chính xác; điều hướng trên màn nhỏ đã được xác nhận; tài liệu chuẩn không mâu thuẫn; có checklist kiểm thử riêng cho release A/B. Sau đó mới **DESIGN → FREEZE → BUILD A → TEST A → RELEASE A → BUILD B → TEST B → RELEASE B**.

**Kết luận:** **HƯỚNG ĐƯỢC DUYỆT, PHẢI CHỈNH THEO BẢN PM REVIEW V2, CHƯA FREEZE.**
