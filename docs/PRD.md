# PRD — chamdiaphuong (Chạm Địa Phương)

> Tài liệu mô tả sản phẩm. Cập nhật khi có thay đổi quan trọng về phạm vi — nhớ ghi lý do
> vào [DECISIONS.md](DECISIONS.md).

## 1. Vấn đề đang giải quyết
Khách du lịch và người dân Tuyên Quang khó biết nhanh: chỗ nào còn phòng/còn bàn, giá tầm
nào, có hợp nhu cầu không — đặc biệt lúc đông khách (lễ hội, cuối tuần). Thông tin hiện nằm
rải rác nhiều nơi (Google Maps, Facebook...), không ai gom lại và không ai kiểm chứng.

## 2. Người dùng

- **Ưu tiên chính:** Khách du lịch ngoại tỉnh, đặc biệt vào dịp lễ hội lớn (Trung Thu Tuyên
  Quang) — chưa quen địa bàn, cần quyết định nhanh.
- **Ngày thường:** Phục vụ ngang nhau cho khách du lịch và người dân địa phương.

## 3. Phạm vi bản đầu tiên (v1)

Chỉ trong khu vực **TP Tuyên Quang (địa danh cũ, trước sáp nhập)**. Chỉ hai nhóm: **Ăn**
và **Ngủ**. Chưa làm Chơi, Đi lại.

> Lưu ý: Tuyên Quang đã sáp nhập đơn vị hành chính, tên gọi chính thức hiện nay khác trước.
> Phạm vi dự án vẫn là **vùng địa lý** của TP Tuyên Quang cũ; tên hành chính mới cho địa chỉ
> sẽ chuẩn hóa sau — bản đầu cứ theo địa chỉ hiển thị trên Google Maps.

### 3.1 Phải có (must-have)

| # | Tính năng | Ghi chú |
|---|---|---|
| 1 | Web app, mobile-first | Bấm link hoặc quét QR là dùng được, không cần cài app |
| 2 | Thẻ thông tin địa điểm gồm: tên, giá (khoảng), địa chỉ + nút chỉ đường ra Google Maps | |
| 3 | Trạng thái còn chỗ — **chỉ 3 mức, không dùng phần trăm** | **① Có khả năng còn chỗ** · **② Khả năng hết chỗ cao** · **③ Chưa đủ dữ liệu** (dữ liệu yếu/cũ/mâu thuẫn → luôn về mức ③, không đoán bừa) |
| 4 | Bộ lọc tìm kiếm đơn giản | Theo khu vực, loại hình (ăn/ngủ), khoảng giá, giờ mở cửa, tiện ích cơ bản (VD: wifi) |
| 4b | Ưu tiên hiển thị "Ngủ" trước "Ăn" trong khoảng thời gian cao điểm lễ hội | Theo mốc thời gian cụ thể ở §4 (bật dần theo nhóm khách, không phải một mốc duy nhất). Ngày thường: hai mục ngang nhau. Không cần biết khách là ai — chỉ dựa theo thời gian, vì v1 chưa có tài khoản/đăng nhập |
| 5 | Dữ liệu nền lấy từ Google Maps + Facebook (công khai) | Gọi điện/thủ công chỉ cho điểm quan trọng hoặc khi dữ liệu mâu thuẫn |
| 6 | Quy trình duyệt | Dữ liệu AI quét được tự động công khai luôn (kể cả tin cậy thấp, hiển thị rõ độ tin cậy). Chỉ giữ lại cho anh + người tin tưởng duyệt khi nghi trùng lặp/mâu thuẫn dữ liệu, hoặc khi gỡ 1 chỗ khỏi công khai. Đổi hướng 2026-07-17, xem DECISIONS.md |
| 7 | Miễn phí hoàn toàn | Không thu phí quán/khách sạn hay khách xem ở bản đầu |
| 8 | Banner "Lễ hội Thành Tuyên 2026" ở đầu trang chủ, dẫn tới bài viết chi tiết | Nội dung tổng hợp từ văn bản chính thức (Kế hoạch 246/KH-UBND) — thời gian, địa điểm, lưu ý cho khách. Anh đã duyệt nội dung + cung cấp ảnh cover thật |

### 3.2 Để sau (không làm ở v1)

| Tính năng | Vì sao để sau |
|---|---|
| Tìm kiếm hiểu ý định (ngôn ngữ tự nhiên, ví dụ: "quán cafe gần Quảng trường Nguyễn Tất Thành, có wifi, mở sau 22h") | Cần dữ liệu có cấu trúc tốt hơn + logic AI phức tạp hơn — làm sau khi có nền dữ liệu ổn |
| Mở rộng sang **Chơi** và **Đi lại** | Bản đầu tập trung Ăn + Ngủ cho gọn |
| Trong "Chơi" — liệt kê điểm cho thuê chỗ ngồi xem rước đèn Trung Thu (kèm đồ uống) | Đây là dịch vụ do chủ mô hình đèn tự kinh doanh, CDP chỉ hiển thị thông tin (không đặt chỗ/thu tiền qua CDP) — thuộc nhóm "Chơi", để sau |
| Chủ quán/khách sạn tự cập nhật trạng thái còn chỗ | Cần họ hợp tác dùng, làm sau khi có lượng người dùng |
| Mô hình thu phí (gói nổi bật, quảng cáo...) | Ưu tiên có người dùng thật và dữ liệu tốt trước, tính tiền sau |
| Mở rộng ngoài khu vực TP Tuyên Quang (cũ) | Sau khi bản đầu chạy ổn ở phạm vi nhỏ |
| Cơ chế thưởng cho người ngoài gửi dữ liệu địa điểm | Chỉ tính thưởng cho dữ liệu **đã được duyệt và đạt chất lượng** — không phải cứ gửi là có thưởng. Cần quy trình duyệt (Giai đoạn 5) chạy ổn định trước, và cách đánh giá chất lượng rõ ràng để tránh bị lợi dụng gửi bừa |

## 4. Mốc thời gian tham chiếu (Lễ hội Thành Tuyên 2026)
> Nguồn: Kế hoạch số 246/KH-UBND ngày 27/6/2026 của UBND tỉnh Tuyên Quang (văn bản chính
> thức, lưu ở `planning/sources/trung-thu-tuyen-quang-2026/`). Thay cho số ước lượng trước
> đây (28/08, 04/09).

- **21/08/2026** — bật ưu tiên hiển thị "Ngủ" cho **người dân địa phương** (giai đoạn 1
  diễu diễu mô hình đèn chính thức bắt đầu, 21/08–04/09/2026).
- **05/09/2026** — bật ưu tiên hiển thị "Ngủ" cho **khách du lịch** (giai đoạn 2 diễu diễu,
  05/09–27/09/2026, khách đông hơn).
- **19/09 – 25/09/2026** — tuần lễ hội chính thức cao điểm nhất, gồm đêm hội lớn nhất
  "Đêm hội Thành Tuyên" ngày **20/09/2026** (10/8 âm lịch, khai mạc, truyền hình trực tiếp)
  và ngày rằm **25/09/2026** (15/8 âm lịch).
- Cách hiển thị ưu tiên cho khách (mục 4b) giữ nguyên như đã thống nhất — chỉ số ngày cụ
  thể được cập nhật chính xác hơn.
- Mục tiêu: có bản dùng thử được (bấm thử được) **trước ngày 21/08/2026**, sớm hơn cả hai
  mốc trên.

## 5. Nguyên tắc dữ liệu
- Không tự động đăng thông tin chưa kiểm chứng cho điểm quan trọng.
- Khi không chắc (dữ liệu yếu, cũ, hoặc mâu thuẫn giữa các nguồn) → nói rõ "chưa đủ dữ
  liệu" thay vì đoán.
- Có thể sai ở diện rộng, nhưng ưu tiên **an toàn hơn là nhanh**: thà nói "không chắc" còn
  hơn nói sai khiến khách đến nơi rồi thất vọng.

## 6. Ngoài phạm vi (explicitly out of scope cho v1)
- Đặt phòng/đặt bàn trực tuyến (booking), thanh toán trong app.
- Đánh giá/review công khai kiểu Google Maps.
- Tài khoản người dùng, đăng nhập.
- Ứng dụng di động riêng (native app), Zalo Mini App, chatbot.

## 7. Bảo mật cơ bản
Mức vừa đủ cho quy mô solo builder (chưa có tài khoản người dùng, chưa thanh toán) — không
làm phức tạp quá tay. Áp dụng khi làm đến Giai đoạn 5 (trang duyệt) và cho website nói
chung.

- **Khóa admin:** mỗi người duyệt một tài khoản riêng, mật khẩu đủ mạnh, không dùng chung
  tài khoản; nên bật xác thực 2 lớp (2FA) vì có 2-3 người cùng duyệt.
- **Phân quyền:** người duyệt chỉ xem/duyệt được dữ liệu địa điểm; quyền cao nhất (xoá,
  đổi cấu hình hệ thống) chỉ mình anh có.
- **Chống bot/đăng nhập bừa:** giới hạn số lần đăng nhập sai (khoá tạm sau nhiều lần sai);
  nếu sau này có form cho ai đó gửi địa điểm mới, thêm bước xác minh đơn giản (captcha)
  tránh bot gửi rác hàng loạt.
- **Bảo vệ dữ liệu nhạy cảm:** mật khẩu admin lưu ở dạng mã hoá (không lưu chữ thường),
  không để lộ trong code; số điện thoại quán/khách sạn thu thập chỉ dùng nội bộ để xác
  minh, không hiển thị công khai nếu không cần thiết.
