# DECISIONS — Nhật ký quyết định quan trọng

> Mỗi khi đổi hướng, đổi công nghệ, hoặc đổi phạm vi — ghi lại ở đây kèm lý do, để sau này
> không quên vì sao đã chọn vậy.

## 2026-07-14 — Các quyết định nền tảng ban đầu

**Quyết định:** Hình thức sản phẩm bản đầu là web app mobile-first (không phải Zalo Mini
App hay chatbot).
**Vì sao:** Dễ làm nhất, không cần đăng ký/duyệt với bên thứ ba, khách bấm link hoặc quét
QR là dùng được ngay.

**Quyết định:** Trạng thái "còn chỗ" chỉ hiển thị dạng ước lượng theo khung giờ; khi dữ
liệu yếu/cũ/mâu thuẫn thì hiển thị "Chưa đủ dữ liệu" thay vì đoán.
**Vì sao:** An toàn hơn là nhanh — thà nói không chắc còn hơn khiến khách đến nơi rồi thất
vọng vì thông tin sai.

**Quyết định:** Tìm kiếm hiểu ý định bằng ngôn ngữ tự nhiên (kiểu "quán cafe gần Quảng
trường Nguyễn Tất Thành, có wifi, mở sau 22h") **không** làm ở bản đầu, dùng bộ lọc đơn
giản trước.
**Vì sao:** Tính năng này cần dữ liệu có cấu trúc tốt hơn và logic AI phức tạp hơn — làm
ngay từ đầu sẽ khó kịp mốc thời gian mong muốn và khó cho một người làm một mình.

**Quyết định:** Miễn phí hoàn toàn ở bản đầu, chưa thu phí quán ăn/khách sạn hay khách
xem.
**Vì sao:** Ưu tiên có người dùng thật và dữ liệu tốt trước, tính chuyện tiền bạc sau.

**Quyết định:** Phạm vi dự án là **vùng địa lý** của TP Tuyên Quang cũ (trước sáp nhập đơn
vị hành chính), không phải theo tên hành chính mới. Địa chỉ hiển thị tạm thời cứ theo
Google Maps, chưa chuẩn hóa theo tên hành chính mới.
**Vì sao:** Tuyên Quang đã sáp nhập đơn vị hành chính nên tên gọi chính thức thay đổi, nhưng
việc chuẩn hóa địa chỉ chưa cần gấp — ưu tiên khách tìm kiếm khớp với Google Maps trước,
việc đặt tên hành chính chính xác tính sau.

**Quyết định:** Dữ liệu nền lấy từ Google Maps + Facebook là chính; chỉ gọi điện/thủ công
cho điểm quan trọng hoặc khi dữ liệu mâu thuẫn. Mọi điểm quan trọng phải qua anh + 1-2
người anh tin tưởng duyệt trước khi đăng công khai.
**Vì sao:** Cân bằng giữa tốc độ (không thể tự khảo sát hết) và độ tin cậy (không đăng bừa
thông tin sai).

## 2026-07-14 (sau) — Chia Giai đoạn 5 thành 5a (tối giản) và 5b (bảo mật đầy đủ)

**Quyết định:** Làm trước bản trang duyệt tối giản (5a): 1 mật khẩu chung, chưa có tài
khoản riêng từng người/2FA/chống bot. Bảo mật đầy đủ theo PRD §7 (5b) để sau.
**Vì sao:** Anh chỉ ra đúng: cần có "đích" (trang duyệt) sẵn sàng trước khi làm AI quét dữ
liệu hằng ngày — nhưng bản đầy đủ (PRD §7) tốn nhiều thời gian hơn cần thiết ở quy mô hiện
tại (anh + 1-2 người, chưa có nhiều người dùng/dữ liệu nhạy cảm), có thể ảnh hưởng mốc
21/08/2026. Làm gọn trước, nâng cấp bảo mật khi thực sự cần.

## 2026-07-14 — Chốt cách tính "còn chỗ" và mốc ngày lễ hội

**Quyết định:** Trạng thái còn chỗ chỉ có **3 mức**, không dùng phần trăm: "Có khả năng còn
chỗ" / "Khả năng hết chỗ cao" / "Chưa đủ dữ liệu".
**Vì sao:** Đơn giản, dễ hiểu cho khách không rành công nghệ; phần trăm tạo cảm giác chính
xác giả tạo trong khi dữ liệu nền còn thô.

**Quyết định:** Ngày cụ thể bật ưu tiên hiển thị "Ngủ" cho Trung Thu Tuyên Quang 2026:
28/08/2026 (người dân địa phương), 04/09/2026 (khách du lịch), cao điểm 25/09/2026 (15/8
âm lịch).
**Vì sao:** Anh xác nhận đây là các mốc thực tế theo thói quen rước đèn của từng nhóm —
dùng để lập trình logic bật/tắt ưu tiên hiển thị đúng lúc mà không cần biết khách là ai.

> **Cập nhật 2026-07-14 (sau):** Đã sửa lại thành 21/08/2026 và 05/09/2026 — xem quyết
> định bên dưới.

## 2026-07-14 (sau) — Sửa mốc ngày theo văn bản chính thức + thêm bài viết lễ hội

**Quyết định:** Sửa mốc ngày ưu tiên hiển thị "Ngủ" từ 28/08 → **21/08/2026** (người dân)
và từ 04/09 → **05/09/2026** (khách du lịch). Cách hiển thị/logic ưu tiên giữ nguyên như
đã chốt trước đó, chỉ đổi số ngày.
**Vì sao:** Anh tìm được văn bản chính thức "Kế hoạch tổ chức Lễ hội Thành Tuyên năm 2026"
(số 246/KH-UBND, UBND tỉnh Tuyên Quang) ghi rõ lịch diễu diễu mô hình đèn theo 2 giai đoạn
— chính xác hơn số ước lượng miệng ban đầu.

**Quyết định:** Thêm 1 khối "điểm nhấn" ở đầu trang chủ (ảnh cover + tiêu đề ngắn), bấm vào
dẫn tới trang chi tiết bài viết về Lễ hội Thành Tuyên 2026 — nội dung tổng hợp từ văn bản
chính thức trên.
**Vì sao:** Giúp khách hiểu bối cảnh lễ hội (thời gian, địa điểm, hoạt động chính) ngay khi
vào web, tăng độ tin cậy vì dùng nguồn chính thống. Ảnh cover: anh sẽ cung cấp ảnh thật của
lễ hội các năm trước, lưu vào `planning/sources/`.

## 2026-07-15 — Giá hiển thị luôn tự tính, bỏ ô gõ tay

**Quyết định:** Bỏ ô "Giá (hiển thị)" gõ tay tự do trong `/admin`. Chỉ nhập giá thấp nhất,
giá cao nhất, và đơn vị (đêm/bát/ly...) — hệ thống tự tính ra chữ hiển thị đúng định dạng
"35.000 đ/...".
**Vì sao:** Anh tự thêm 1 địa điểm qua `/admin` và gõ giá "35000" (không định dạng), khác
với các chỗ em nhập tay có định dạng đẹp trước đó — gây hiển thị không nhất quán. Ô gõ tay
tự do luôn có rủi ro này; tự tính từ số liệu gốc đảm bảo luôn đúng định dạng, không cần nhớ
gõ dấu chấm/đơn vị mỗi lần.

## 2026-07-15 — AI quét dữ liệu hằng ngày: chuyển sang "bán tự động" thay vì hoàn toàn tự động

**Quyết định:** Lịch chạy AI hằng ngày (claude.ai routine) chỉ **tìm kiếm web + báo cáo**
(JSON + tóm tắt), KHÔNG tự ghi vào đâu cả. Anh copy báo cáo dán vào chat, em xử lý vào
hàng chờ duyệt (`scripts/run-daily-ingest.mjs`) trong ~30 giây.
**Vì sao:** Thử "hoàn toàn tự động" gặp 3 giới hạn liên tiếp, không phải lỗi cấu hình có
thể sửa:
1. Môi trường cloud của routine bị chặn gọi thẳng tới Upstash (chính sách mạng).
2. Thử vòng qua bằng cách commit lên GitHub rồi để Vercel đọc — routine không có quyền
   ghi (push/API đều bị từ chối).
3. Cách cấp quyền ghi đúng cách (GitHub App tổ chức) **cần gói Claude Team/Enterprise
   trả phí**, không phải gói hiện tại.
Bán tự động vẫn tiết kiệm phần lớn công sức tìm kiếm — chỉ tốn 1 bước dán tay mỗi ngày —
và không cần nâng cấp gói trả phí chỉ để tự động hoá hoàn toàn bước ghi dữ liệu.

**Đã giữ lại (không xoá) hạ tầng cho tương lai:** `lib/ingestion/sources/githubScanSource.js`
và `vercel.json` (Vercel Cron `/api/cron/daily-ingest`, 1:30 UTC hằng ngày) — hiện không có
tác dụng thật (không có file nào để đọc) nhưng vô hại, sẵn sàng dùng lại ngay nếu sau này
nâng cấp gói hoặc tìm được cách khác để routine tự ghi lên GitHub.

### 2026-07-17 — Thử thêm 1 cách (gọi thẳng API của chính dự án) — vẫn không được

**Đã thử:** Thêm route `/api/ingest/submit` (có `CRON_SECRET` bảo vệ) để routine gọi thẳng
bằng `curl` thay vì ghi Redis/GitHub trực tiếp — vì Vercel (nơi web chạy) gọi Upstash bình
thường, chỉ cần routine gọi TỚI được route này là đủ. Route đã build + test đúng bằng curl
thủ công (ngoài môi trường routine).
**Kết quả:** Vẫn thất bại — `curl: (56) CONNECT tunnel failed, response 403`. Log proxy của
môi trường routine ghi rõ chặn ngay ở bước tạo kết nối HTTPS (CONNECT), trước khi request
thật sự chạy tới domain của mình.
**Kết luận quan trọng:** Đây xác nhận môi trường cloud của routine chặn gọi ra ngoài tới
**bất kỳ domain nào** (trừ GitHub) — không phải chặn riêng Upstash hay riêng dự án mình.
Không còn cách kỹ thuật nào khác để thử (đã thử đủ 3 hướng: ghi thẳng Redis, ghi qua
GitHub, gọi API riêng — cả 3 cùng chặn ở tầng mạng). Đã bỏ bước gọi curl khỏi lệnh routine,
quay về đúng bản bán tự động gọn (chỉ tìm kiếm + báo cáo qua chat).
**Vì sao dừng thử thêm:** 3/3 hướng khác nhau đều chặn cùng 1 lý do hạ tầng — tiếp tục thử
thêm domain/cách gọi khác sẽ chỉ lặp lại cùng kết quả. Chỉ còn 2 lối ra thật sự (đã ghi ở
ROADMAP "Sau bản đầu"): nâng cấp gói Claude Team/Enterprise, hoặc dùng Google Places API
trả phí gọi từ Vercel Cron có sẵn.

## 2026-07-17 — Đảo ngược nguyên tắc "luôn phải duyệt trước khi đăng"

**Quyết định:** Dữ liệu do AI quét hằng ngày giờ **tự động công khai luôn** (chỗ mới, có
thay đổi, kể cả độ tin cậy thấp) — **chỉ giữ lại chờ duyệt khi hệ thống phát hiện nghi
trùng lặp hoặc mâu thuẫn dữ liệu** giữa các nguồn. Việc gỡ 1 chỗ khỏi công khai (nghi đã
đóng cửa — `stale_place`) vẫn luôn cần người duyệt xác nhận, không tự động xoá.
**Vì sao:** Anh chủ động yêu cầu đổi hướng để tăng tốc độ phủ dữ liệu, chấp nhận đánh đổi
rủi ro hiển thị dữ liệu thiếu/sai đôi khi xảy ra — bù lại bằng cách hiển thị công khai "độ
tin cậy" ngay trên card cho khách tự đánh giá (đã làm cùng lúc với card 2 lớp), thay vì
giấu sự không chắc chắn. Đây là đảo ngược so với nguyên tắc gốc của dự án (CLAUDE.md quy
tắc 6: "không tự ý đăng công khai") — ghi lại rõ ở đây để không quên đã đổi hướng và vì sao.

**Quyết định:** Thêm tính năng "đề xuất sửa" (khách góp ý sửa thông tin sai) + thưởng điểm/
huy hiệu cho người góp ý đúng — **đã bàn hướng nhưng CHƯA CODE**, vì còn 1 vấn đề thiết kế
chưa giải: web chưa có tài khoản đăng nhập, cần cách nhận diện "cùng 1 user" qua nhiều lần
góp ý để cộng điểm đúng người, trước khi bắt tay code.
**Vì sao để sau:** Đây là tính năng mới hoàn toàn (không phải chỉnh sửa cái có sẵn), độ
phức tạp cao hơn 2 việc trên — anh đồng ý tách riêng, không làm gộp trong 1 lần.

## 2026-07-17 — Card địa điểm: 2 lớp (gọn + bung tại chỗ) + gallery ảnh toàn màn hình

**Quyết định:** Thay card cũ (hiển thị hết thông tin cùng lúc) bằng card 2 lớp: gọn để
quyết nhanh, bấm "Xem thêm" bung thêm chi tiết + cụm ảnh ngay trong card (không tách trang
riêng). Bấm vào ảnh mở gallery toàn màn hình kiểu vuốt (swipe) — không dùng thư viện ngoài,
tự viết bằng touch event của trình duyệt.
**Vì sao:** Đúng 6 mẫu anh gửi. Không tách trang riêng vì làm chậm thao tác hơn (thêm 1
bước bấm + tải trang) — đi ngược đúng mục tiêu "quyết nhanh" của V1.
**Trường còn thiếu dữ liệu nguồn** (món chính, phù hợp, ghi chú, ảnh, SĐT): hiển thị ẩn gọn
khi không có, không bịa — sẽ có dữ liệu dần khi routine AI hoặc anh bổ sung qua `/admin`.

## 2026-07-18 — Sửa 3 lỗi pipeline lộ ra từ báo cáo quét thật đầu tiên

**Quyết định:** Thêm `data/known-places-snapshot.json` (xuất từ `places:live`, chỉ có
tên + loại hình) để routine đọc trước mỗi lần quét, tránh tìm lại chỗ đã có.
**Vì sao:** Routine không đọc được Redis (giới hạn hạ tầng đã ghi 2026-07-15), nhưng đọc
được file trong repo — đây là cách duy nhất cho nó biết "cái gì đã có rồi" mà không cần
routine có quyền ghi gì cả. Đánh đổi: file này phải xuất lại + push thủ công sau mỗi lần xử
lý báo cáo (chưa tự động hoá bước này) — chấp nhận được vì đã nằm trong quy trình bán tự
động sẵn có.

**Quyết định:** Khi 1 chỗ đang **chờ duyệt** (chưa lên web) nhận được 2 nguồn cho địa chỉ/
SĐT khác nhau, **không tự ý ghi đè** — giữ giá trị cũ, gắn cờ mâu thuẫn để hiển thị trong
`/admin` cho anh chọn.
**Vì sao:** Phát hiện qua ca thật (Feline Café: 1 nguồn ghi "04 Đinh Tiên Hoàng", nguồn khác
ghi "126 Bình Thuận" — đúng là 126 Bình Thuận theo Google Maps anh xác nhận). Trước đây hệ
thống lấy tin đến sau, đúng sai phụ thuộc hoàn toàn vào thứ tự xử lý — không an toàn. Loại
`conflict_detected` đã có sẵn trong schema từ đầu nhưng chưa từng được dùng tới; giờ dùng
đúng mục đích ban đầu của nó.

**Quyết định:** Khi anh xác nhận "không trùng" cho 1 cặp chỗ nghi giống nhau (qua `/admin`),
hệ thống **nhớ vĩnh viễn** cặp đó là 2 chỗ khác nhau — lần quét sau không hỏi lại nữa, kể cả
khi dữ liệu quét được trông giống hệt lần trước.
**Vì sao:** Phát hiện qua ca Mộc Restaurant / Nhà hàng Dũng Cá — 2 chỗ này anh đã xác nhận
khác nhau ở phiên trước, nhưng batch hôm nay lại quét ra dữ liệu (nhầm) khiến hệ thống ghi
đè đúng dữ liệu Mộc Restaurant (SĐT, không có thật) lên bản ghi Dũng Cá, xoá mất phần anh đã
tự sửa đúng trước đó. Tra lại Google Maps + Facebook xác nhận: Dũng Cá thật ra ở Tổ 4,
Phường Tân Quang (ven sông Lô), không phải 124 Trần Hưng Đạo (đó là địa chỉ của Mộc) — đã
sửa lại đúng dữ liệu 2 chỗ. Nguyên tắc chung khi nguồn quét đá nhau: **ưu tiên thông tin
theo Google Maps** — cũng đã dặn lại routine.
