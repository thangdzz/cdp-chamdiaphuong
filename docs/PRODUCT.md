# Chạm Địa Phương — PRODUCT.md

Status: **APPROVED** (Product Owner duyệt 2026-09-29) — **nguồn chuẩn cao nhất của dự án**  
Product: Chạm Địa Phương  
Website: chamdiaphuong.io.vn

> Tài liệu nào khác (kể cả quyết định cũ trong [DECISIONS.md](DECISIONS.md)) nói ngược với
> file này thì **file này thắng**. Phạm vi đang build: [SCOPE-vNext.md](SCOPE-vNext.md).
>
> **Ghi chú diễn giải (Product Owner, 2026-09-29):** ở §3.2, "chủ tài khoản" nghĩa là
> **người tạo dữ liệu riêng tư**. Hệ thống hiện **chưa có tài khoản**, vẫn nhận diện người dùng
> bằng mã ẩn danh lưu trên máy (localStorage).

---

## 1. WHY — Vì sao Chạm Địa Phương tồn tại?

Khi cần thông tin thực tế tại một địa phương, người dùng thường phải tự tìm và ghép dữ liệu từ nhiều nguồn.

Facebook có nhiều thông tin địa phương nhưng:

- tìm kiếm khó;
- bài viết dễ trôi;
- dữ liệu có thể đã cũ;
- bài quảng cáo, review và thông tin thực tế lẫn với nhau.

Google Maps có nhiều địa điểm nhưng dữ liệu không phải lúc nào cũng phản ánh tình trạng hiện tại:

- địa điểm đã đóng vẫn có thể xuất hiện;
- quán mới có thể nằm tại vị trí của quán cũ nhưng dữ liệu cũ vẫn tồn tại;
- thiếu nhiều thông tin chỉ người địa phương mới biết.

Khi đến một nơi không quen, vấn đề còn lớn hơn.

Ví dụ một nhóm quyết định đi Tam Đảo vào ngày hôm sau nhưng phải tự tìm:

- nên đi đâu;
- ăn ở đâu;
- địa điểm nào phù hợp với độ tuổi và khả năng di chuyển của từng người;
- ăn xong nên đi đâu;
- một ngày nên sắp xếp lịch trình thế nào.

Tại các lễ hội như Trung thu Tuyên Quang, khách còn cần những thông tin rất cụ thể:

- giờ nào có rước đèn;
- gửi xe ở đâu;
- thuê chỗ ngồi trên mô hình thế nào;
- còn phòng nghỉ hay không;
- chỗ nghỉ nào thuận tiện đi lễ hội;
- nên đi bộ hay dùng phương tiện;
- tối muộn còn chỗ ăn không;
- lịch trình 2–3 ngày nên sắp xếp thế nào.

**Chạm Địa Phương tồn tại để gom, tổ chức và duy trì thông tin địa phương theo cách giúp người dùng ra quyết định thực tế, thay vì phải tự tìm và ghép dữ liệu rời rạc từ nhiều nguồn.**

---

## 2. WHO — Chạm Địa Phương phục vụ ai?

### Người địa phương

Đây là nhóm tạo nền móng dữ liệu cho CDP.

Người địa phương:

- biết tình trạng thực tế của địa điểm;
- biết những địa điểm và tên gọi quen mà dữ liệu phổ thông không có;
- biết các kinh nghiệm truyền miệng;
- có thể lưu, chia sẻ và cập nhật thông tin cho nhau.

### Khách đến địa phương

Khách sử dụng dữ liệu đó để:

- tìm nơi ăn, ngủ, chơi;
- tìm dịch vụ và phương tiện;
- hiểu khu vực trước khi đến;
- tạo lịch trình;
- chọn địa điểm phù hợp với nhóm;
- di chuyển thuận tiện hơn.

### Ưu tiên

CDP ưu tiên tạo giá trị đủ tốt để **người địa phương sử dụng thường xuyên**.

Khi người địa phương sử dụng, lưu và cập nhật dữ liệu, khách đến địa phương sẽ có một nền dữ liệu thực tế để sử dụng.

---

## 3. WHAT — Chạm Địa Phương giúp người dùng làm gì?

### 3.1. Sổ địa điểm

Người dùng có thể nhanh chóng lưu và chia sẻ một tập hợp địa điểm theo cấu trúc rõ ràng.

Sổ có thể chứa:

- ăn;
- ngủ;
- chơi;
- dịch vụ;
- di chuyển;
- các địa điểm khác theo nhu cầu của người dùng.

---

### 3.2. Địa điểm do người dùng tạo

Không phải mọi địa điểm hữu dụng đều tồn tại trên Google Maps.

CDP cho phép người dùng lưu:

- điểm hẹn;
- chỗ gửi xe;
- lối vào;
- vị trí xem lễ hội;
- điểm đón;
- địa danh người địa phương thường gọi;
- vị trí cụ thể khác.

Một địa điểm có thể:

- chia sẻ cho người khác;
- hoặc để riêng tư, chỉ chủ tài khoản biết.

---

### 3.3. Lộ trình

Người dùng có thể kết hợp nhiều địa điểm thành một lộ trình.

Một lộ trình giúp cá nhân hoặc nhóm biết:

- đi đâu;
- theo thứ tự nào;
- ăn ở đâu;
- nghỉ ở đâu;
- chơi ở đâu;
- di chuyển giữa các điểm thế nào.

Lộ trình có thể được chia sẻ để cả nhóm sử dụng chung.

---

### 3.4. Bản đồ địa phương

CDP sử dụng bản đồ như một lớp hiển thị dữ liệu địa phương.

Người dùng có thể:

- xem địa điểm;
- xem các điểm trong một sổ;
- xem lộ trình;
- xem vị trí do cộng đồng tạo;
- xem vị trí riêng được chia sẻ;
- chỉ đường đến những điểm không có sẵn trên Google Maps.

Việc chia sẻ vị trí không phụ thuộc vào việc hai người phải kết bạn với nhau.

---

### 3.5. Thông tin phục vụ nhu cầu thực tế

Thông tin của một địa điểm không chỉ dừng ở tên, địa chỉ và số điện thoại.

CDP hướng tới việc tổ chức dữ liệu theo đúng nhu cầu mà người dùng đang giải quyết.

Ví dụ:

- địa điểm còn hoạt động không;
- phù hợp với nhóm người nào;
- đi lại có khó không;
- đỗ xe ở đâu;
- thời điểm nào nên đến;
- thông tin có còn đúng không;
- các kinh nghiệm mà người địa phương thường truyền miệng.

---

## 4. VALUE — Vì sao người dùng chọn CDP?

CDP không cạnh tranh với Google Maps bằng số lượng địa điểm và không cạnh tranh với Facebook/TikTok bằng số lượng nội dung.

Giá trị của CDP nằm ở:

**Thông tin địa phương được gom đúng theo nhu cầu, có cấu trúc, không bị trôi và có thể được người địa phương cập nhật theo thực tế.**

Các nguyên tắc chính:

- dữ liệu phục vụ một nhu cầu cụ thể;
- thông tin có thể được cập nhật lại;
- kiến thức địa phương được lưu lại thay vì chỉ tồn tại dưới dạng truyền miệng;
- có thể lưu những địa điểm không có trên bản đồ phổ thông;
- nhiều địa điểm có thể được ghép thành sổ và lộ trình;
- chia sẻ dễ dàng;
- các chức năng cơ bản không bắt buộc đăng nhập.

---

## 5. WHAT NOT — CDP hiện không cố trở thành gì?

Chạm Địa Phương hiện tại không cố trở thành:

- **Mạng xã hội địa phương** nơi người dùng chủ yếu đăng bài, follow nhau, chat hoặc xây dựng feed nội dung.
- **Nền tảng review đại trà** tập trung vào chấm sao, bình luận dài và xếp hạng địa điểm như Google Maps hoặc các app review.
- **Sàn booking hoặc thương mại điện tử hoàn chỉnh** cho khách sạn, nhà hàng, vé, hàng hóa và thanh toán.
- **Trang tin địa phương** lấy việc sản xuất và phân phối tin tức làm sản phẩm chính.
- **Sản phẩm chỉ phục vụ khách du lịch.** Giá trị sử dụng cho người địa phương vẫn là nền móng.

Các ý tưởng ngoài các ranh giới trên không mặc định bị loại bỏ.

Nếu có giá trị, chúng được đưa vào Inbox hoặc Backlog và review ở phase phù hợp.

---

## 6. SUCCESS — Khi nào CDP đang đi đúng hướng?

CDP đi đúng hướng khi xuất hiện vòng lặp:

**Người dùng tìm thấy thông tin hữu dụng  
→ dùng CDP để giải quyết nhu cầu thật  
→ quay lại sử dụng  
→ lưu hoặc cập nhật dữ liệu  
→ dữ liệu trở nên hữu dụng hơn cho người tiếp theo.**

Các tín hiệu cần theo dõi:

- người dùng tìm được thông tin hữu dụng;
- có người quay lại sử dụng;
- có người lưu địa điểm;
- có người tạo hoặc sử dụng sổ địa điểm;
- có người chia sẻ sổ hoặc lộ trình;
- có người cập nhật dữ liệu;
- dữ liệu do một người tạo tiếp tục được người khác sử dụng.

Lượng truy cập chỉ là một chỉ số phụ. Giá trị cốt lõi nằm ở việc **dữ liệu thực sự được sử dụng và tiếp tục được cải thiện bởi cộng đồng**.

---

## 7. PRODUCT PRINCIPLE — Nguyên tắc để ra quyết định

Khi cân nhắc một feature mới, hỏi:

> Feature này có giúp người dùng tìm, lưu, sử dụng, chia sẻ hoặc cập nhật thông tin địa phương tốt hơn không?

Nếu **có** → tiếp tục review.

Nếu **không rõ** → đưa vào Inbox.

Nếu **không** → không đưa vào Scope hiện tại.
