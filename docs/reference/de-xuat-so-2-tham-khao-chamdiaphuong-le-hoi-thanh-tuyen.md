# ĐỀ XUẤT SỐ 2
## Nghiên cứu hành vi tìm kiếm, hỏi đáp và lưu thông tin khi đến Lễ hội Thành Tuyên

**Dự án tham chiếu:** chamdiaphuong  
**Mục đích:** Cung cấp bối cảnh và gợi ý để Claude rà soát, đối chiếu và đề xuất cải tiến trên MVP chamdiaphuong hiện có  
**Phạm vi:** Hành vi của người dân và du khách khi tìm thông tin về Lễ hội Thành Tuyên, đặc biệt trong mùa Trung thu  
**Trạng thái:** Tài liệu tham khảo, không phải yêu cầu xây dựng MVP mới

---

## 1. Mục đích tài liệu

Tài liệu này được viết để Claude tham khảo khi tiếp tục phân tích và phát triển dự án chamdiaphuong.

Chamdia phương đã có MVP. Vì vậy, nội dung dưới đây **không đề xuất xây dựng một sản phẩm mới**, không thay thế đặc tả hiện tại và không mặc định rằng mọi ý tưởng đều phải được triển khai.

Mục tiêu chính là giúp Claude hiểu rõ hơn:

- Người Việt hiện tìm thông tin về Lễ hội Thành Tuyên như thế nào.
- Họ thường hỏi những câu hỏi gì trước, trong và sau chuyến đi.
- Họ lưu thông tin về địa điểm, lịch trình và kinh nghiệm ra sao.
- Những điểm nào trong hành vi đó có thể liên quan đến chamdiaphuong.
- MVP hiện tại nên được rà soát hoặc điều chỉnh ở đâu nếu dữ liệu thực tế cho thấy cần thiết.

Nguyên tắc làm việc:

> **Chỉ sử dụng tài liệu này làm đầu vào nghiên cứu và tham khảo. Không tự động biến toàn bộ nội dung thành yêu cầu tính năng mới.**

---

## 2. Bối cảnh hành vi người dùng

Khi chuẩn bị đến Lễ hội Thành Tuyên, người dùng Việt Nam thường không tìm tất cả thông tin ở một nơi. Họ kết hợp nhiều nguồn và nhiều cách hỏi khác nhau:

- Hỏi trong nhóm Facebook hoặc cộng đồng địa phương.
- Xem video TikTok, Facebook Reels và YouTube.
- Tìm lịch, tin tức và thông báo trên Google Search.
- Dùng Google Maps để xem địa điểm, đánh giá, hình ảnh và chỉ đường.
- Hỏi người quen qua Zalo hoặc Messenger.
- Gọi trực tiếp cho khách sạn, nhà hàng hoặc cơ sở dịch vụ.
- Chụp màn hình, lưu bài đăng, lưu video và gửi liên kết cho người đi cùng.
- Tự ghi chú lịch trình bằng ứng dụng ghi chú, tin nhắn hoặc bảng tính.

Các nguồn này bổ sung cho nhau nhưng tạo ra trải nghiệm rời rạc. Người dùng có thể phải tự ghép các mảnh thông tin để trả lời một câu hỏi hoàn chỉnh như:

> “Tối thứ Bảy tôi đi cùng trẻ nhỏ, muốn xem rước đèn, gửi ô tô gần trung tâm, ăn tối sau chương trình và tìm một nơi ngủ còn phòng.”

Đây là bối cảnh để Claude xem xét liệu MVP chamdiaphuong hiện tại đã hỗ trợ tốt các nhu cầu đó chưa.

---

## 3. Người dùng thường hỏi những gì?

### 3.1. Trước khi đi

Các câu hỏi thường gặp:

- Lễ hội diễn ra từ ngày nào đến ngày nào?
- Ngày nào có hoạt động chính?
- Đêm nào có rước hoặc diễu hành mô hình?
- Khu vực tổ chức nằm ở đâu?
- Nên đi ngày nào nếu muốn tránh quá đông?
- Đến Tuyên Quang bằng phương tiện nào?
- Có cần đặt phòng trước không?
- Khách sạn nào gần trung tâm?
- Ăn gì và ăn ở đâu?
- Có chỗ gửi ô tô không?
- Đi cùng trẻ nhỏ có phù hợp không?
- Có thể kết hợp tham quan địa điểm khác trong tỉnh không?

### 3.2. Trong lúc di chuyển

- Từ vị trí hiện tại đến lễ hội đi đường nào?
- Khu vực nào đang đông hoặc tắc?
- Đường nào bị hạn chế phương tiện?
- Bãi gửi xe gần nhất ở đâu?
- Từ bãi xe đi bộ bao lâu?
- Có thể đi ô tô vào trung tâm không?
- Khách sạn có nhận khách muộn không?

### 3.3. Khi đang ở lễ hội

- Đoàn rước đèn đang ở đâu?
- Đứng ở vị trí nào xem rõ?
- Khu vực nào phù hợp với trẻ em?
- Chỗ nào ít chen lấn hơn?
- Có nhà vệ sinh, chỗ nghỉ hoặc điểm uống nước gần đây không?
- Quán nào còn mở và còn nhận khách?
- Có thể chụp ảnh đẹp ở đâu?
- Nếu trẻ bị lạc thì liên hệ ai?
- Bãi xe còn chỗ không?

### 3.4. Sau chuyến đi

- Quán ăn nào đáng lưu lại?
- Khách sạn nào phù hợp cho gia đình?
- Nên đi ngày nào vào năm sau?
- Địa điểm nào muốn quay lại?
- Có thể gửi danh sách địa điểm cho bạn bè không?

---

## 4. Người dùng đang lưu thông tin bằng cách nào?

### Lưu bài đăng Facebook

Người dùng bấm lưu bài viết để giữ lại kinh nghiệm, lịch trình hoặc địa chỉ. Nhược điểm là bài viết dễ bị trôi, khó tìm lại và có thể không còn đúng với năm hiện tại.

### Lưu video TikTok

Video giúp hình dung tình hình thực tế, mức độ đông và không khí lễ hội. Tuy nhiên, người dùng có thể không nhớ địa điểm chính xác, ngày quay hoặc thông tin trong video còn phù hợp hay không.

### Lưu địa điểm trên Google Maps

Google Maps phù hợp để lưu ghim, xem chỉ đường, đánh giá và gọi điện. Tuy nhiên, người dùng thường phải tự bổ sung ngữ cảnh như “nên đi sau khi xem hội”, “phù hợp với trẻ nhỏ” hoặc “gần tuyến diễu hành”.

### Chụp màn hình

Đây là cách nhanh nhất để lưu lịch, số điện thoại, giá phòng hoặc thông tin trong bài đăng. Nhược điểm là dữ liệu không có cấu trúc, không tìm kiếm được và không tự cập nhật.

### Gửi liên kết qua Zalo hoặc Messenger

Phù hợp khi chia sẻ nhanh cho gia đình và bạn bè. Tuy nhiên, thông tin nằm rải rác trong nhiều cuộc trò chuyện và khó chuyển thành một kế hoạch chung.

### Ghi chú riêng

Một số người dùng ghi vào ứng dụng ghi chú, Notion, Google Keep hoặc Google Sheets. Cách này có thể tổ chức tốt hơn nhưng đòi hỏi người dùng nhập thủ công.

---

## 5. Những vấn đề cần đối chiếu với MVP hiện tại

Claude nên dùng các vấn đề dưới đây làm câu hỏi rà soát, không xem đây là yêu cầu bắt buộc phải thêm tính năng.

### 5.1. Tìm thông tin sự kiện

- MVP hiện tại có giúp người dùng tìm thông tin lễ hội nhanh không?
- Lịch hoạt động có được trình bày theo ngày và thời gian dễ hiểu không?
- Có phân biệt thông tin chính thức, thông tin tham khảo và thông tin người dùng đóng góp không?
- Có hiển thị ngày cập nhật hoặc thời điểm xác minh không?
- Khi lịch thay đổi, người dùng có nhận biết được thay đổi đó không?

### 5.2. Tìm địa điểm xung quanh lễ hội

- Người dùng có thể tìm chỗ ăn, chỗ ngủ và điểm dịch vụ gần khu vực lễ hội không?
- Kết quả có hiển thị khoảng cách và cách di chuyển không?
- Có thể lọc theo thời gian mở cửa, mức giá, gia đình, chỗ đỗ xe hoặc khoảng cách không?
- Các thông tin quan trọng có đủ đáng tin cậy cho mùa cao điểm không?

### 5.3. Tình trạng theo thời điểm

- MVP có thể thể hiện những thông tin nhanh thay đổi như còn mở, quá đông, hết chỗ hoặc đã đóng không?
- Người dùng có biết thông tin được xác minh lúc nào không?
- Có cách nào tiếp nhận báo cáo nhanh từ người dùng không?
- Quy trình kiểm duyệt và cập nhật hiện tại có phù hợp với các sự kiện đông người không?

### 5.4. Lưu và chia sẻ

- Người dùng có thể lưu một địa điểm vào sổ riêng không?
- Có thể thêm ghi chú cá nhân mà không ảnh hưởng dữ liệu chung không?
- Có thể gom nhiều địa điểm thành một danh sách theo chuyến đi không?
- Có thể chia sẻ danh sách cho người không đăng nhập không?
- Người nhận có thể mở bản đồ, xem chi tiết và sao chép địa điểm vào sổ riêng không?

### 5.5. Tình huống sử dụng

- MVP có hỗ trợ người chỉ có một buổi tối không?
- Có hỗ trợ gia đình có trẻ nhỏ không?
- Có hỗ trợ người đi ô tô không?
- Có hỗ trợ nhu cầu “ăn sau khi xem hội” không?
- Có thể ưu tiên địa điểm còn mở tại thời điểm tìm kiếm không?

---

## 6. Gợi ý cách diễn giải cho chamdiaphuong

Không nên định vị nội dung này như một ứng dụng lễ hội độc lập. Nên xem Lễ hội Thành Tuyên là một **tình huống sử dụng cụ thể** để kiểm tra năng lực hiện có của chamdiaphuong.

Các năng lực cần đối chiếu gồm:

- Khám phá địa điểm địa phương.
- Dữ liệu theo danh mục ăn, ngủ, chơi và di chuyển.
- Dữ liệu có nguồn và thời điểm cập nhật.
- Gợi ý theo bối cảnh.
- Lưu địa điểm cá nhân.
- Tạo bộ sưu tập.
- Chia sẻ địa điểm hoặc kế hoạch.
- Tiếp nhận phản hồi từ người dùng.

Lễ hội chỉ là bối cảnh giúp làm rõ nhu cầu. Nếu một vấn đề đã được MVP giải quyết tốt thì không cần tạo thêm luồng mới chỉ vì có lễ hội.

---

## 7. Gợi ý cho Claude khi phân tích MVP

Claude nên thực hiện theo thứ tự sau:

### Bước 1: Đọc lại tài liệu hiện có

- Đọc các file đặc tả, quyết định sản phẩm và mô hình dữ liệu của chamdiaphuong.
- Xác định các tính năng đã có.
- Không giả định hệ thống bắt đầu từ đầu.

### Bước 2: Đối chiếu từng nhu cầu

Lập bảng gồm các cột:

- Nhu cầu người dùng.
- Tính năng MVP hiện có liên quan.
- Mức độ đáp ứng: tốt, một phần, chưa có hoặc chưa rõ.
- Vấn đề trải nghiệm nếu có.
- Đề xuất xử lý.
- Mức độ ưu tiên.

### Bước 3: Phân biệt các loại đề xuất

Mỗi đề xuất cần được phân loại rõ:

- Có thể dùng ngay tính năng hiện tại.
- Cần điều chỉnh nội dung hoặc giao diện.
- Cần bổ sung dữ liệu.
- Cần bổ sung logic nhỏ.
- Cần nghiên cứu thêm.
- Chưa nên làm trong giai đoạn hiện tại.

### Bước 4: Ưu tiên vấn đề có giá trị thực tế

Ưu tiên những điểm giúp người dùng:

- Tìm nhanh hơn.
- Biết thông tin còn đúng hay không.
- Ra quyết định ăn, ngủ và di chuyển.
- Lưu lại thông tin để dùng sau.
- Chia sẻ cho người đi cùng.

Không ưu tiên những tính năng chỉ làm giao diện phức tạp hơn nhưng chưa chứng minh được nhu cầu.

### Bước 5: Đề xuất thay đổi tối thiểu

Nếu cần cải tiến, Claude nên ưu tiên:

- Tận dụng cấu trúc hiện có.
- Tái sử dụng component và dữ liệu hiện tại.
- Tránh tạo hệ thống riêng cho lễ hội nếu không cần thiết.
- Không làm lại kiến trúc chỉ vì một sự kiện theo mùa.
- Đưa ra phương án nhỏ nhất có thể kiểm chứng.

---

## 8. Bảng đối chiếu mẫu

| Nhu cầu thực tế | Cách người dùng đang làm | Khả năng cần đối chiếu trên MVP | Hướng xử lý tham khảo |
|---|---|---|---|
| Biết lịch hoạt động | Hỏi Facebook, tìm Google | Trang sự kiện hoặc nội dung hướng dẫn hiện có | Kiểm tra cách hiển thị ngày, nguồn và trạng thái cập nhật |
| Tìm chỗ ăn sau khi xem hội | Hỏi nhóm, xem Maps | Tìm kiếm địa điểm ăn | Bổ sung lọc theo giờ mở cửa và khoảng cách nếu dữ liệu hỗ trợ |
| Tìm khách sạn còn phù hợp | Gọi từng nơi, hỏi nhóm | Danh sách chỗ ngủ | Hiển thị giá tham khảo, khoảng cách và thời điểm xác minh |
| Tìm bãi gửi xe | Hỏi người dân hoặc xem video | Danh mục di chuyển/dịch vụ | Kiểm tra khả năng thể hiện điểm gửi xe theo khu vực |
| Lưu địa điểm | Chụp màn hình, lưu Maps | Sổ địa điểm cá nhân | Kiểm tra khả năng lưu, ghi chú và phân loại |
| Chia sẻ kế hoạch | Gửi nhiều link qua Zalo | Chia sẻ danh sách hoặc bộ sưu tập | Kiểm tra liên kết công khai và khả năng sao chép |
| Báo địa điểm đã đóng | Bình luận hoặc đăng bài | Cơ chế phản hồi dữ liệu | Đánh giá khả năng thêm báo cáo nhanh và quy trình duyệt |
| Biết thông tin còn mới không | Hỏi lại trong hội nhóm | Metadata nguồn và ngày cập nhật | Ưu tiên hiển thị thời điểm xác minh |

---

## 9. Dữ liệu cần đặc biệt chú ý trong mùa lễ hội

Đây là các trường dữ liệu có tính thời điểm cao. Claude nên kiểm tra xem chamdiaphuong hiện đã có, thiếu hoặc cần chuẩn hóa trường nào.

### Sự kiện

- Tên hoạt động.
- Ngày và giờ.
- Địa điểm.
- Trạng thái xác nhận.
- Nguồn chính thức.
- Thời điểm cập nhật.
- Ghi chú thay đổi.

### Địa điểm ăn

- Giờ mở cửa thực tế trong mùa lễ hội.
- Khung giờ đông.
- Có nhận nhóm đông không.
- Có đặt bàn không.
- Có mở sau chương trình buổi tối không.
- Khoảng cách đến khu vực lễ hội.

### Địa điểm ngủ

- Giá tham khảo trong mùa cao điểm.
- Khả năng còn phòng.
- Có nhận khách muộn không.
- Có chỗ đỗ ô tô không.
- Khoảng cách đến khu vực trung tâm.
- Ngày xác minh.

### Di chuyển

- Bãi gửi xe.
- Khu vực hạn chế phương tiện.
- Tuyến đi bộ.
- Điểm đón/trả khách.
- Tình trạng đông hoặc tắc.
- Ghi chú an toàn.

---

## 10. Những điều không nên mặc định triển khai

Tài liệu này không yêu cầu Claude tự động đề xuất hoặc xây dựng các nội dung sau:

- Một ứng dụng lễ hội riêng.
- Một hệ thống mạng xã hội mới.
- Tính năng đặt phòng hoặc đặt bàn hoàn chỉnh.
- Theo dõi vị trí đoàn diễu hành theo thời gian thực nếu chưa có nguồn dữ liệu đáng tin cậy.
- Hệ thống nhắn tin giữa người dùng.
- Hệ thống đánh giá phức tạp.
- Ứng dụng native mới.
- Một bộ dữ liệu hoàn toàn tách khỏi dữ liệu chamdiaphuong.
- Thay đổi kiến trúc hoặc cơ sở dữ liệu nếu chưa có lý do rõ ràng.

Nếu Claude cho rằng một nội dung cần bổ sung, phải giải thích:

1. Vấn đề người dùng cụ thể là gì.
2. MVP hiện tại chưa giải quyết được ở đâu.
3. Có thể xử lý bằng cách đơn giản hơn không.
4. Chi phí và tác động kỹ thuật là gì.
5. Mức độ ưu tiên ra sao.

---

## 11. Kết quả Claude cần trả lại

Sau khi tham khảo tài liệu này và đọc hệ thống chamdiaphuong hiện có, Claude nên trả lại một bản phân tích ngắn gồm:

### A. Những gì MVP đã đáp ứng tốt

Nêu rõ tính năng, dữ liệu hoặc luồng hiện có đã phù hợp với hành vi người dùng.

### B. Những khoảng trống thực tế

Chỉ ra các nhu cầu chưa được đáp ứng hoặc chưa rõ cách đáp ứng.

### C. Đề xuất cải tiến nhỏ

Nêu những thay đổi có thể thực hiện mà không làm mở rộng phạm vi quá mức.

### D. Đề xuất dữ liệu cần bổ sung

Chỉ ra trường dữ liệu, nguồn dữ liệu hoặc quy trình xác minh còn thiếu.

### E. Những việc chưa nên làm

Nêu các ý tưởng hấp dẫn nhưng chưa cần thiết hoặc chưa có đủ bằng chứng.

### F. Kế hoạch kiểm chứng

Đề xuất cách kiểm tra bằng dữ liệu, quan sát người dùng, phản hồi thực tế hoặc thử nghiệm trên một nhóm nhỏ.

---

## 12. Tiêu chí đánh giá đề xuất của Claude

Một đề xuất được xem là tốt khi:

- Bám vào MVP hiện tại.
- Không lặp lại các tính năng đã có mà không đưa ra lý do.
- Chỉ ra vấn đề người dùng cụ thể.
- Phân biệt rõ nhu cầu, giải pháp và giả định.
- Ưu tiên thông tin sống: giờ mở cửa, tình trạng, khoảng cách và khả năng phục vụ.
- Không biến một sự kiện theo mùa thành lý do để xây dựng quá nhiều tính năng.
- Có thể triển khai từng phần.
- Không tự động xuất bản dữ liệu chưa xác minh.
- Giữ nguyên nguyên tắc con người duyệt các thông tin quan trọng trước khi công khai.

---

## 13. Kết luận

Lễ hội Thành Tuyên là một tình huống thực tế có thể dùng để kiểm tra chamdiaphuong hiện đang hỗ trợ người dùng đến đâu trong việc:

- Tìm thông tin địa phương.
- Tìm chỗ ăn, chỗ ngủ và cách di chuyển.
- Đánh giá độ mới và độ tin cậy của dữ liệu.
- Lưu địa điểm cho riêng mình.
- Chia sẻ kế hoạch với người khác.

Giá trị của tài liệu này không nằm ở việc đề xuất thêm một sản phẩm mới, mà ở việc cung cấp cho Claude một bối cảnh sử dụng cụ thể để rà soát MVP hiện tại.

Định hướng cần giữ:

> **Không xây lại chamdiaphuong cho Lễ hội Thành Tuyên. Hãy dùng Lễ hội Thành Tuyên để kiểm tra, phát hiện và ưu tiên những cải tiến có giá trị cho chamdiaphuong.**

---

## Nguồn tham khảo

- Các thông tin công khai về Lễ hội Thành Tuyên và lịch hoạt động năm 2026.
- Cổng thông tin tỉnh Tuyên Quang và các cơ quan, đơn vị liên quan.
- Các bài viết báo chí, nội dung cộng đồng và video trải nghiệm về lễ hội.
- Các quan sát về hành vi người dùng khi hỏi, tìm, lưu và chia sẻ thông tin du lịch.

Các nguồn tham khảo chỉ dùng để hình thành bối cảnh nghiên cứu. Những thông tin sự kiện, giao thông, cơ sở lưu trú và tình trạng địa điểm cần được kiểm tra lại trước khi đưa vào dữ liệu chính thức của chamdiaphuong.
