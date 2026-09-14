# NOTE 08 — Giới thiệu CDP, minh bạch dữ liệu và onboarding người dùng mới

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: tạo trang `CDP là gì?`, thông báo minh bạch về bản chất dữ liệu và điểm vào rõ ràng cho người dùng lần đầu.
> Đọc cùng:
> - `10-NOTE-01-Product-UX.md`
> - `NOTEBOOK-DESIGN.md`
> - `ARCHITECTURE.md`
> - `DECISIONS.md`
> - `STATUS.md`

## 1. Mục tiêu

CDP cần giải thích rõ:
1. CDP là gì.
2. Dữ liệu đến từ đâu.
3. Vì sao thông tin có thể có độ trễ.
4. Sổ/Lộ trình thuộc về người dùng, còn danh bạ công khai do CDP quản lý.
5. Người dùng mới có thể hiểu sản phẩm mà không cần đọc tài liệu dài.

Không biến giao diện thành một website đầy cảnh báo hoặc miễn trừ trách nhiệm.

## 2. Nguyên tắc nội dung

Không viết các câu kiểu:
> “Mọi thông tin chỉ để tham khảo.”

hoặc:
> “CDP không chịu trách nhiệm cho mọi sai lệch.”

ở mọi nơi trên website.

Thay vào đó, mô tả đúng:
- nguồn dữ liệu;
- trạng thái cập nhật;
- mức xác nhận;
- khả năng thông tin ngoài thực tế thay đổi trước khi CDP kịp cập nhật.

Mục tiêu:
> **Minh bạch, không hù dọa.**

## 3. Nội dung ngắn về dữ liệu

### Bản khuyến nghị dùng chung

> **Thông tin trên Chạm Địa Phương được tổng hợp từ dữ liệu công khai, CDP và đóng góp của người dùng. Một số thông tin như giờ mở cửa, giá, số điện thoại hoặc tình trạng hoạt động có thể thay đổi trước khi CDP kịp cập nhật. Hãy xem thời điểm cập nhật và mức xác nhận của từng thông tin khi sử dụng.**

### Bản ngắn trong UI

> **Thông tin địa điểm có thể thay đổi theo thời gian. Xem ngày cập nhật và xác nhận cộng đồng khi có.**

### Bản mềm hơn

> **CDP là dữ liệu sống — thông tin được cập nhật dần từ CDP và cộng đồng, nên một số thay đổi ngoài thực tế có thể xuất hiện chậm hơn.**

## 4. Không dùng câu “Dữ liệu của CDP là do người dùng lưu lại...” làm mô tả duy nhất

Vì CDP còn có:
- dữ liệu công khai;
- dữ liệu do admin/CDP nhập;
- dữ liệu hệ thống thu thập;
- dữ liệu người dùng xác nhận;
- mẹo chữ đã qua admin duyệt.

Không mô tả toàn bộ CDP như dữ liệu chỉ do user tự ghi.

## 5. Nơi hiển thị thông báo dữ liệu

Dùng 4 tầng.

### A. Homepage — người dùng lần đầu

Hiện onboarding card nhẹ:

> **Lần đầu dùng Chạm Địa Phương?**  
> CDP giúp bạn gom chỗ ăn, chơi, ngủ, đi lại thành một Sổ để tự dùng hoặc gửi cho người khác.  
> **CDP hoạt động thế nào →**

Có nút đóng.

Sau khi user đóng:
- lưu trạng thái local;
- không hiện lại thường xuyên.

Không dùng modal bắt buộc.

### B. Trang địa điểm

Không hiện đoạn cảnh báo dài.

Chỉ hiện ngắn:
- ngày cập nhật nếu có;
- số xác nhận nếu có;
- trạng thái đáng chú ý nếu có.

Ví dụ:
> Cập nhật 2 ngày trước · 4 người xác nhận

Nếu chưa có dữ liệu tốt:
- không spam `Chưa rõ / Chưa đánh giá` ở summary.

### C. Trang Sổ/Lộ trình

Có thể đặt dòng nhỏ cuối phần nội dung:

> **Thông tin địa điểm có thể thay đổi theo thời gian.**

Link:
> `Dữ liệu CDP được cập nhật thế nào?`

### D. Footer toàn site

Có link:
- `CDP là gì?`
- `Dữ liệu & cách cập nhật`

Có thể cùng trỏ vào `/gioi-thieu` với anchor khác nhau.

## 6. Trang mới: `/gioi-thieu`

Tên hiển thị:

> **CDP là gì?**

Không dùng `About` trong UI chính.

## 7. Hero trang giới thiệu

### Heading

> **Chạm Địa Phương là gì?**

### Slogan

> **Gom chỗ hay. Chia sẻ dễ dàng.**

### Subheadline

> **Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.**

### Intro

> Chạm Địa Phương giúp bạn tìm những chỗ đang có ở địa phương, gom chúng thành một Sổ hoặc Lộ trình rồi gửi cho bạn bè bằng một link. Không cần cài ứng dụng và người nhận không cần đăng nhập chỉ để xem.

## 8. Vì sao CDP tồn tại?

> Khi cần chọn chỗ ăn, đi chơi hoặc lên lịch cho một nhóm bạn, thông tin thường nằm rải rác ở nhiều nơi. Người địa phương lại biết nhiều chi tiết thực tế mà danh bạ thông thường không thể hiện rõ: chỗ gửi xe, lối vào, giờ đông, cách đặt xe hay những thay đổi chỉ mới xảy ra.
>
> CDP gom những dữ liệu đó thành một cấu trúc dễ dùng và dễ chia sẻ.

## 9. CDP hoạt động như thế nào?

### 1. CDP gợi ý địa điểm

> Danh bạ giúp bạn bắt đầu nhanh, thay vì phải nhập lại mọi nơi từ đầu.

### 2. Người dùng cập nhật dữ liệu sống

> Các thông tin chọn sẵn có thể được cộng đồng xác nhận. Mẹo dạng chữ phải qua admin duyệt trước khi công khai.

### 3. Bạn tạo Sổ hoặc Lộ trình

> Gom các địa điểm, thêm ghi chú riêng nếu muốn rồi gửi một link cho người khác. Người nhận có thể lưu thành Sổ của họ và chỉnh tiếp.

## 10. CDP không phải gì?

> CDP không phải trang review, không có chấm sao, bình luận hay diễn đàn. Nội dung công khai tập trung vào thông tin có cấu trúc, độ mới và các mẹo thực tế đã qua kiểm soát.

Không mở rộng social layer.

## 11. Dữ liệu CDP đến từ đâu?

Nêu rõ các lớp:
- dữ liệu công khai;
- dữ liệu do CDP/admin nhập;
- dữ liệu người dùng xác nhận;
- dữ liệu người dùng đề xuất;
- mẹo chữ đã qua admin duyệt.

Không khẳng định mọi dữ liệu có cùng mức tin cậy.

## 12. Độ mới và độ trễ

Dùng đoạn chính:

> **Thông tin trên Chạm Địa Phương được tổng hợp từ dữ liệu công khai, CDP và đóng góp của người dùng. Một số thông tin như giờ mở cửa, giá, số điện thoại hoặc tình trạng hoạt động có thể thay đổi trước khi CDP kịp cập nhật. Hãy xem thời điểm cập nhật và mức xác nhận của từng thông tin khi sử dụng.**

Giải thích thêm:

> Một địa điểm mới mở hoặc vừa đóng cửa có thể cần thời gian để được người dùng hoặc CDP xác nhận. CDP ưu tiên hiển thị trạng thái cập nhật và tín hiệu xác nhận thay vì giả định dữ liệu luôn đúng.

## 13. Sổ/Lộ trình và danh bạ

Chốt nguyên tắc:

> **Sổ và Lộ trình thuộc về người tạo; danh bạ công khai thuộc về CDP.**

User có thể:
- lưu địa điểm CDP;
- thêm ghi chú riêng;
- thêm điểm riêng;
- đề xuất địa điểm mới.

Nhưng:
- địa điểm mới chưa duyệt không tự động trở thành place public;
- mẹo chữ không tự public;
- dữ liệu public phải đi theo cơ chế xác nhận/duyệt hiện có.

## 14. CTA cuối trang

Có 2 CTA:

> **Tạo một Sổ địa phương**

và:

> **Khám phá địa điểm**

Không cần CTA đăng ký nếu product hiện chưa bắt buộc login để xem/share.

## 15. Onboarding card trên Homepage

Khuyến nghị component:

```text
FirstVisitIntroCard
```

Nội dung:

```text
Lần đầu dùng Chạm Địa Phương?

CDP giúp bạn gom chỗ ăn, chơi, ngủ, đi lại thành một Sổ
để tự dùng hoặc gửi cho người khác.

[ CDP hoạt động thế nào → ]   [ × ]
```

Behavior:
- chỉ hiện với user chưa dismiss;
- lưu bằng localStorage hoặc cơ chế client nhẹ;
- không block thao tác;
- responsive tốt trên mobile;
- không hiện lại mỗi page load sau khi đã đóng.

## 16. Link cố định

Header hoặc menu mobile:
- cân nhắc `CDP là gì?`

Footer:
- bắt buộc có `CDP là gì?`

Nếu header đã chật:
- ưu tiên footer + onboarding card.

Không làm header nặng thêm chỉ để nhét một link.

## 17. SEO/meta cho `/gioi-thieu`

Title gợi ý:

> **Chạm Địa Phương là gì? | CDP**

Description:

> **Chạm Địa Phương giúp bạn gom địa điểm ăn, chơi, ngủ, đi lại thành Sổ hoặc Lộ trình để lưu và chia sẻ dễ dàng.**

Không nhồi keyword.

## 18. Accessibility / UX

- onboarding card không trap focus;
- nút đóng có aria-label;
- link `CDP hoạt động thế nào` là link thật;
- không dùng modal bắt user đọc;
- không dùng màu cảnh báo cho copy dữ liệu chung;
- trên mobile không chiếm quá nhiều chiều cao màn hình.

## 19. Không làm trong NOTE 08

Không thêm:
- Terms of Service đầy đủ;
- Privacy Policy mới nếu chưa có requirement;
- modal pháp lý bắt buộc;
- disclaimer ở mọi card;
- popup mỗi lần user vào;
- review/rating/social.

## 20. Tiêu chí hoàn thành

- Có page `/gioi-thieu`.
- Có copy giải thích CDP rõ ràng.
- Có section về nguồn dữ liệu và độ trễ.
- Có section `CDP không phải gì?`.
- Có onboarding card cho first visit.
- Có link cố định tới `CDP là gì?`.
- Không làm UI trở nên nặng nề vì disclaimer.
- Không mâu thuẫn với policy public/private hiện có.
- Không khẳng định dữ liệu luôn chính xác.
