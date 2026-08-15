# PRD — chamdiaphuong (Chạm Địa Phương)

> Tài liệu mô tả sản phẩm. Cập nhật khi có thay đổi quan trọng về phạm vi — nhớ ghi lý do
> vào [DECISIONS.md](DECISIONS.md).

> ⚠️ **Đọc cùng [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md)** — hướng đi hiện tại (chốt
> 2026-08-11) là **"cuốn sổ địa phương"**, rộng hơn PRD gốc. File này đã được cập nhật theo
> hướng mới ở §1, §3, §4, §6; các phần còn lại vẫn đúng.

## 1. Vấn đề đang giải quyết
Khách du lịch và người dân Tuyên Quang khó biết nhanh: chỗ nào đáng đi, giá tầm nào, có hợp
nhu cầu không, **thông tin còn đúng hay đã cũ**. Thông tin hiện nằm rải rác nhiều nơi
(Google Maps, Facebook...), không ai gom lại và không ai kiểm chứng.

Ba thứ CDP làm được mà Google Maps không làm (xem
[NOTEBOOK-DESIGN §2](NOTEBOOK-DESIGN.md)):

1. **Thông tin còn sống** — Google giữ quán đã đóng cửa lâu rồi vẫn hiện đang mở.
2. **Kho mẹo địa phương** — chỗ gửi xe, lối vào khó tìm, đường bị chặn tối lễ hội.
3. **Gửi được cho người khác** — một link tới cuốn sổ có ghi chú, thay vì 5 link Google Maps
   rời rạc.

## 2. Người dùng

- **Ưu tiên chính:** Khách du lịch ngoại tỉnh, đặc biệt vào dịp lễ hội lớn (Trung Thu Tuyên
  Quang) — chưa quen địa bàn, cần quyết định nhanh.
- **Ngày thường:** Phục vụ ngang nhau cho khách du lịch và người dân địa phương.
- **Người đóng góp dữ liệu:** chủ yếu là **người địa phương** — viết ghi chú để gửi cho
  người quen sắp đến, không phải để tự xem lại. Đây là lời giải cho câu hỏi "ai viết ghi chú
  đầu tiên".

## 3. Phạm vi

Chỉ trong khu vực **TP Tuyên Quang (địa danh cũ, trước sáp nhập)**. **Đủ bốn nhóm: Ăn ·
Chơi · Ngủ · Đi lại.**

> **Cập nhật 2026-08-11:** trước đây v1 chỉ làm Ăn + Ngủ. Hướng "cuốn sổ địa phương" hứa đủ
> bốn nhóm, nên Chơi + Đi lại đã vào phạm vi — làm ở **Chặng 3** ([ROADMAP.md](ROADMAP.md)).

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
| 6 | Quy trình duyệt | **Dữ liệu địa điểm** do AI quét: tự động công khai luôn (kể cả tin cậy thấp, hiển thị rõ độ tin cậy); chỉ giữ chờ duyệt khi nghi trùng lặp/mâu thuẫn, hoặc khi gỡ 1 chỗ khỏi công khai (2026-07-17). **Ghi chú công khai dạng chữ do khách gõ: luôn phải duyệt trước khi hiện** (2026-08-11 — sai cố ý khác sai vô tình). **Thông tin bấm chọn: không duyệt**, hiện theo đồng thuận. Xem DECISIONS.md |
| 7 | Miễn phí hoàn toàn | Không thu phí quán/khách sạn hay khách xem ở giai đoạn đầu |
| 8 | Banner "Lễ hội Thành Tuyên 2026" ở đầu trang chủ, dẫn tới bài viết chi tiết | Nội dung tổng hợp từ văn bản chính thức (Kế hoạch 246/KH-UBND) — thời gian, địa điểm, lưu ý cho khách. Anh đã duyệt nội dung + cung cấp ảnh cover thật |
| 9 | **Xác nhận "hôm nay vẫn mở"** (Chặng 1) | Một chạm, không cần đăng nhập, không cần duyệt. Đánh đúng điểm yếu số 1 của Google Maps |
| 10 | **Câu hỏi bấm chọn + đồng thuận** (Chặng 2) | Hệ thống đặt câu hỏi, khách chỉ bấm chọn. "Chọn là mặc định, gõ là ngoại lệ" — xem NOTEBOOK-DESIGN §4–6 |
| 11 | **Sổ chia sẻ được** (Chặng 4) | Chọn vài chỗ → ra 1 link → gửi Zalo. Người nhận mở xem ngay, không cài, không đăng nhập. Đây là vòng lan truyền chính |
| 12 | **Ghi chú công khai + ghi chú riêng** (Chặng 5–6) | Ghi chú chữ công khai qua 5 lớp lọc rồi mới hiện; ghi chú riêng chỉ chủ nhân thấy, lưu trên máy khách trước |

### 3.2 Để sau

| Tính năng | Vì sao để sau |
|---|---|
| Tìm kiếm hiểu ý định (ngôn ngữ tự nhiên, ví dụ: "quán cafe gần Quảng trường Nguyễn Tất Thành, có wifi, mở sau 22h") | Cần dữ liệu có cấu trúc tốt hơn + logic AI phức tạp hơn — làm sau khi có nền dữ liệu ổn |
| Trong "Chơi" — liệt kê điểm cho thuê chỗ ngồi xem rước đèn Trung Thu (kèm đồ uống) | Đây là dịch vụ do chủ mô hình đèn tự kinh doanh, CDP chỉ hiển thị thông tin (không đặt chỗ/thu tiền qua CDP) |
| Chủ quán/khách sạn tự cập nhật trạng thái còn chỗ | Gắn với Chặng 8 (chủ quán nhận địa điểm) — cần có traffic thật trước |
| Mô hình thu phí (gói nổi bật, quảng cáo...) | Ưu tiên có người dùng thật và dữ liệu tốt trước, tính tiền sau |
| Mở rộng ngoài khu vực TP Tuyên Quang (cũ) | Sau khi chạy ổn ở phạm vi nhỏ |
| Cơ chế thưởng cho người ngoài gửi **địa điểm mới** | Khác với thưởng cho góp ý/bấm chọn (đã có). Chỉ tính thưởng cho dữ liệu **đã được duyệt và đạt chất lượng**, tránh bị lợi dụng gửi bừa |

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

> **Cập nhật 2026-08-11 — lễ hội không còn là hạn chót.** Trước đây mục tiêu là "có bản dùng
> thử được **trước 21/08/2026**". Nay dự án đánh dài hơi: **lễ hội chỉ là điểm khởi đầu
> thuận lợi**, không phải đích. Các mốc ngày ở trên vẫn dùng để bật/tắt ưu tiên hiển thị
> "Ngủ" (mục 4b) — chỉ bỏ vai trò "hạn chót".
>
> Mốc duy nhất còn đáng nhắm: **Chặng 4 (sổ chia sẻ được) xong trước ~15/09**, để kịp lúc
> người ta hỏi nhau về lễ hội. **Tuần 19–25/09 không code** — dùng để đo số liệu thật. Xem
> [ROADMAP.md](ROADMAP.md).

## 5. Nguyên tắc dữ liệu
- Không tự động đăng thông tin chưa kiểm chứng cho điểm quan trọng.
- Khi không chắc (dữ liệu yếu, cũ, hoặc mâu thuẫn giữa các nguồn) → nói rõ "chưa đủ dữ
  liệu" thay vì đoán.
- Có thể sai ở diện rộng, nhưng ưu tiên **an toàn hơn là nhanh**: thà nói "không chắc" còn
  hơn nói sai khiến khách đến nơi rồi thất vọng.

## 6. Ngoài phạm vi

**Không bao giờ làm:**
- **Đánh giá sao, bình luận công khai, diễn đàn.** Chặn bằng **cấu trúc** chứ không bằng nội
  quy: không nút thích, không trả lời, không hiện tên người viết, không dòng thời gian. Ghi
  chú hiện ra như **thuộc tính của địa điểm** ("Gửi xe: ngõ cạnh số 12"), không phải như một
  bài đăng. (Chốt 2026-08-11)

**Chưa làm bây giờ:**
- Đặt phòng/đặt bàn trực tuyến (booking), thanh toán trong app.
- Ứng dụng di động riêng (native app), Zalo Mini App, chatbot.

**Đã chuyển vào phạm vi (2026-08-11):**
- ~~Tài khoản người dùng, đăng nhập~~ → **có làm**, nhưng muộn và tối giản: đăng nhập bằng
  **số điện thoại**, và **chỉ khi khách đã có từ 3 ghi chú riêng trở lên** (Chặng 7). Hỏi
  sớm hơn là làm thừa và làm khách bỏ đi. Xem [NOTEBOOK-DESIGN §8](NOTEBOOK-DESIGN.md).

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
