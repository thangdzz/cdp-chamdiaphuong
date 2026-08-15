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

## 2026-07-18 — KPI số lượng dữ liệu: chuyển từ "anh+em quét" sang "khách tự đóng góp"

**Quyết định:** Không còn coi mốc số lượng địa điểm (Giai đoạn 6) là gấp — thay vào đó ưu
tiên làm tốt tính năng "Báo sai/Bổ sung ảnh" để khách tự hoàn thiện dữ liệu dần theo thời
gian.
**Vì sao:** Anh chủ động đổi hướng: việc quét thủ công (anh dán báo cáo, em xử lý) có trần
tốc độ nhất định; để cộng đồng tự sửa/bổ sung mở rộng dữ liệu nhanh và bền hơn về lâu dài,
đúng lúc tính năng "đề xuất sửa" cũng đang được xây.

## 2026-07-18 — Thiết kế "Báo sai/Bổ sung ảnh" + thưởng điểm/huy hiệu

**Quyết định:** Không bắt tài khoản/đăng nhập — định danh bằng 1 hồ sơ ẩn danh lưu trên
trình duyệt (localStorage) + biệt danh tự đặt, kèm **1 mã khôi phục 6 số** để lấy lại đúng
hồ sơ (điểm, huy hiệu) khi đổi máy/trình duyệt.
**Vì sao:** Bắt đăng nhập sẽ cản người mới góp ý (đi ngược mục tiêu "vào nhanh, giúp nhanh"
của dự án). Rủi ro lớn nhất của cách ẩn danh là mất tiến trình khi đổi máy — mã khôi phục
giải quyết đúng rủi ro này mà không cần mật khẩu/email. Vì mọi góp ý vẫn phải qua anh (và
em kiểm sơ bộ) duyệt mới có hiệu lực, nên dù danh tính lỏng lẻo, dữ liệu web vẫn an toàn —
rủi ro chỉ nằm ở trải nghiệm công bằng của người góp ý, chấp nhận được vì không có thưởng
bằng tiền.

**Quyết định:** 10 lĩnh vực người góp ý có thể chọn (Thổ địa Tuyên Quang, Nhiếp ảnh, Mê ẩm
thực, Mê xê dịch, Học sinh - Sinh viên, Xe ôm - Tài xế công nghệ, Gia đình - Nội trợ, Người
yêu Thành Tuyên, Công nghệ - Sáng tạo, Kinh doanh địa phương), mỗi lĩnh vực 5 bậc danh hiệu
riêng (chi tiết ở `web/lib/badges.js`) theo cùng 1 thang điểm (0/5/20/50/100).
**Vì sao:** Chọn lĩnh vực gắn với sở thích/vai trò thật của người dân Tuyên Quang (không chỉ
nhóm "công nghệ" chung chung) — biến việc góp ý thành thể hiện bản sắc cá nhân thay vì chỉ
"giúp app miễn phí", dễ khiến người dùng quay lại đóng góp tiếp.

**Quyết định:** Khi hiện "người khác cùng lĩnh vực", chỉ hiện 1-2 người ngay trên + ngay
dưới vị trí hiện tại — không hiện toàn bộ bảng xếp hạng.
**Vì sao:** Hiện hết sẽ khiến người mới luôn thấy mình đứng chót (nản), người giỏi thấy danh
sách dài không có động lực xem. Chỉ hiện "gần bạn" luôn tạo cảm giác "còn chút nữa là vượt
được" — đúng tinh thần khơi gợi cảm xúc đóng góp mà anh muốn, không làm nản người mới.

**Quyết định:** Điểm thưởng: báo sai được duyệt đúng +5, ảnh được duyệt +10. Ảnh do AI tự
quét gần như không khả thi (WebSearch không tải được file ảnh Google Maps, dễ vướng bản
quyền) — ảnh thật chủ yếu trông cậy vào khách tự gửi qua tính năng này.

**Quyết định (2026-07-18, sau khi test thật):** Khi 1 lĩnh vực chưa đủ 3 người dùng thật,
chèn tạm 2 hồ sơ "hạt giống" ẩn danh (không lưu Redis, chỉ chèn lúc tính bảng "gần bạn") để
người góp ý đầu tiên không thấy trống trơn/cô đơn.
**Vì sao:** Anh yêu cầu trực tiếp sau khi tự test thấy bảng trống vì mới chỉ có 1 mình anh
trong lĩnh vực Nhiếp ảnh. Đây là giải pháp **tạm thời** — cần xoá `SEED_ENTRIES` trong
`lib/contributors.js` khi 1 lĩnh vực đã có từ 5 người dùng thật trở lên.
**Cũng sửa cùng lúc:** thêm chú thích "đang chờ duyệt" cạnh điểm hiển thị ngay sau khi gửi
góp ý — 0 điểm lúc đó là đúng thiết kế (điểm chỉ cộng sau khi anh duyệt), nhưng dễ gây hiểu
lầm là lỗi nếu không giải thích rõ trên giao diện.

## 2026-07-18 — Chặn góp ý trùng ăn điểm + hết bậc thì đếm dồn thay vì tạo bậc 6

**Quyết định:** Không cho tính điểm khi 1 người gửi **đúng y hệt** 1 nội dung sửa (cùng
field, cùng giá trị) hoặc **đúng y hệt** 1 file ảnh (so mã băm nội dung, không phải tên
file) cho cùng 1 chỗ lần nữa. Vẫn cho góp ý thêm về cùng 1 chỗ nếu nội dung thực sự khác.
**Vì sao:** Anh yêu cầu trực tiếp — tránh 1 người copy-paste lại đúng góp ý cũ nhiều lần để
ăn điểm khống. Đồng thời phát hiện lỗi thật: phía trình duyệt trước đó **không đọc kết quả
server trả về**, nên dù server từ chối (góp ý trùng, thiếu dữ liệu...) giao diện vẫn hiện
"Cảm ơn" như đã thành công — đã sửa để hiện đúng lỗi.

**Quyết định:** Khi đã đạt bậc 5 (Huyền thoại — mốc cao nhất), góp ý thêm không tạo "bậc 6"
nào cả — vẫn giữ nguyên icon + tên bậc 5, chỉ thêm 1 số nhỏ góc phải trên biểu tượng đếm số
lần góp ý thêm SAU KHI đã đạt bậc 5 (1, 2, 3...).
**Vì sao:** Anh yêu cầu — hệ điểm chỉ có 5 bậc cố định, cần cách ghi nhận đóng góp tiếp tục
của người đã đạt đỉnh mà không phải bịa thêm bậc mới.

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

## 2026-08-04 — Tự động hoá hoàn toàn quy trình quét dữ liệu hằng ngày

**Quyết định:** Routine quét dữ liệu hằng ngày giờ tự ghi kết quả thẳng lên web qua GitHub
Contents API + 1 GitHub Action mới, thay vì chỉ in báo cáo để anh copy-paste tay (kể cả vào
chat hay vào `/admin`). Cơ chế: routine `curl PUT` (dùng 1 Personal Access Token
fine-grained, chỉ áp dụng đúng repo `cdp-chamdiaphuong`, chỉ quyền Contents: Read/write, hạn
90 ngày) ghi kết quả vào `data/pending-scan.json` trên GitHub → thay đổi file này tự kích
hoạt GitHub Action (`.github/workflows/ingest-from-scan.yml`, chạy trên hạ tầng GitHub) →
Action gọi vào `/api/ingest/submit` có sẵn từ trước → web tự lọc trùng/mâu thuẫn y hệt mọi
nguồn khác → Action tự dọn `pending-scan.json` về rỗng sau khi gửi thành công.

**Vì sao đổi được, dù trước đây (2026-07-15, 2026-07-17) đã xác nhận `git push`/gọi API
riêng đều bị chặn:** Đây là cơ chế KHÁC — gọi thẳng REST API của GitHub
(`api.github.com/repos/.../contents/...`) bằng Personal Access Token, không phải lệnh
`git push` (thứ bị chặn vì thiếu quyền cài GitHub App — gói Claude hiện tại không hỗ trợ).
Domain `api.github.com` và `raw.githubusercontent.com` KHÔNG nằm trong danh sách domain bị
chặn của môi trường routine (chỉ có domain riêng của web, `web-five-xi-28.vercel.app`, vẫn
bị chặn như cũ) — đã kiểm tra thật bằng 1 routine đọc thử trước khi tin và trước khi động
vào routine thật, không dựa vào suy đoán. Anh cũng cung cấp thêm bằng chứng: 1 routine khác
của anh (dự án `painpoint-research`, không liên quan tới CDP) đã dùng đúng cơ chế này ổn
định từ 2026-06-16 tới nay.

**Đánh đổi đã chấp nhận:** Token (Personal Access Token) phải nằm dạng chữ thường ngay trong
nội dung routine — nền tảng hiện tại không có chỗ lưu "bí mật" riêng cho routine. Giảm rủi ro
bằng cách giới hạn phạm vi hẹp nhất có thể (đúng 1 repo, đúng 1 quyền, hạn dùng ngắn) thay vì
dùng lại 1 token cũ đã có sẵn (phạm vi rộng hơn — áp dụng cho mọi repo public của tài khoản).

**Không đổi:** Lịch chạy (8h sáng), phạm vi tìm kiếm (TP Tuyên Quang cũ), cơ chế lọc trùng/
mâu thuẫn phía web (dùng chung `ingestBatch`, không viết logic mới). 2 chỗ dán tay cũ (chat,
`/admin`) vẫn giữ nguyên, dùng khi cần xử lý thủ công ngoài lịch. Việc làm mới
`known-places-snapshot.json` vẫn cần em làm thủ công như trước (không đổi) — chỉ ảnh hưởng
hiệu quả tìm kiếm, không ảnh hưởng việc chống đăng trùng.

## 2026-08-11 — Đổi hướng lớn: CDP là "cuốn sổ địa phương", không còn là công cụ tra cứu

> Thiết kế đầy đủ ở [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md). Dưới đây chỉ ghi các quyết
> định và lý do.

**Quyết định:** CDP chuyển từ "công cụ quyết định nhanh lúc đông khách" sang **cuốn sổ địa
chỉ ăn / ngủ / chơi / đi lại**. CDP đăng địa điểm mẫu trước; người dùng vào bổ sung, sửa,
ghi chú; sau này doanh nghiệp vào nhận (claim) địa điểm của mình. Miễn phí giai đoạn đầu,
mô hình kiếm tiền bàn sau.
**Vì sao:** Anh chủ động đổi hướng — đánh dài hơi, không đóng khung vào một mùa lễ hội.

**Quyết định:** **Lễ hội Thành Tuyên không còn là đích, chỉ là điểm khởi đầu thuận lợi.**
Mốc 21/08/2026 trong PRD không còn là hạn chót cứng.
**Vì sao:** Lễ hội là thời điểm duy nhất trong năm có lượng người quan tâm tập trung — dùng
để lấy nhóm người dùng đầu tiên, không phải để chốt sản phẩm.

**Quyết định:** Nội dung chia làm 3 loại với 3 mức kiểm soát khác nhau: (a) **thông tin
chọn sẵn** — không duyệt, hiện theo đồng thuận số đông; (b) **note công khai dạng chữ** —
phải duyệt trước khi hiện; (c) **note cá nhân** — không kiểm duyệt gì, chỉ mình chủ nhân
thấy.
**Vì sao (b) đi ngược nguyên tắc auto-publish chốt 17/07:** dữ liệu AI quét sai là sai **vô
tình** (sai địa chỉ/giá — khách bực mình, sửa được). Note do người gõ có thể sai **cố ý**:
đối thủ bôi nhọ, quảng cáo trá hình gài số điện thoại, mâu thuẫn cá nhân. Loại rủi ro này
có người bị thiệt hại thật, và người đó sẽ tìm anh chứ không tìm người viết. Đây là hai
loại rủi ro khác hẳn bản chất nên xử lý khác nhau — không phải đảo ngược nguyên tắc
auto-publish cho dữ liệu địa điểm (nguyên tắc đó giữ nguyên).

**Quyết định:** **Không bao giờ** làm đánh giá sao, bình luận công khai, hay diễn đàn. Chặn
bằng **cấu trúc** chứ không bằng nội quy: không nút thích, không trả lời, không hiện tên
người viết, không dòng thời gian. Note hiện ra như một **thuộc tính của địa điểm** ("Gửi
xe: ngõ cạnh số 12"), không phải như một bài đăng.
**Vì sao:** Nội quy không chặn được tranh cãi; cấu trúc thì chặn được — không có chỗ nào
để tranh cãi bám vào.

**Quyết định:** Nguyên tắc nhập liệu là **"chọn là mặc định, gõ là ngoại lệ"**. Câu hỏi do
hệ thống đặt (người dùng không được đặt câu hỏi), người dùng chỉ chọn đáp án. Mỗi lần chỉ
hỏi 1 câu, luôn có nút "Không rõ".
**Vì sao:** Mỗi ô gõ chữ là một cơ hội để có rác. Ngoài ra, lựa chọn có sẵn **không cần
duyệt** (người dùng chỉ bỏ phiếu, không tạo nội dung) — nên càng đẩy nhiều thứ về dạng
chọn, khối lượng việc duyệt của anh càng tiến về 0 dù người dùng tăng lên.

**Quyết định:** Dữ liệu chọn sẵn hiện theo **đồng thuận**: 1 phiếu → hiện mờ; 2 phiếu trùng
→ hiện bình thường; lệch nhau → lấy số đông, ngang nhau → không hiện. **Phiếu cũ nhẹ dần
theo thời gian** (quá 6 tháng tính một nửa, quá 12 tháng gần như không tính).
**Vì sao:** Vế cuối là cơ chế **tự dọn rác** — quán đổi chỗ gửi xe, đổi giờ mở thì phiếu
mới tự lấn phiếu cũ, không cần ai đi xoá. Dữ liệu tự già đi và tự được thay.

**Quyết định:** Đổi cách tính điểm. Bấm chọn chỉ được **+1 khi phiếu trùng với đồng thuận**
(không được điểm ngay mỗi lượt bấm); người đầu tiên trả lời một câu được +2 thêm; xác nhận
"vẫn mở" +1; note chữ được duyệt +5; ảnh +10; **báo đóng cửa xác nhận đúng +15** (cao
nhất). Không bao giờ trừ điểm. Trần 30 điểm/ngày.
**Vì sao:** Cơ chế cũ (+5/+10 mỗi lượt được duyệt) nếu áp cho thao tác bấm 1 chạm thì đang
**trực tiếp trả tiền cho hành vi bấm bừa** — càng bấm nhanh càng nhiều điểm. Trả cho phiếu
trùng đồng thuận thì cách duy nhất ăn điểm là trả lời đúng. Báo đóng cửa trả cao nhất vì
đó là dữ liệu quý nhất của cả sản phẩm (đúng cái Google Maps không có) và khó nhất — phải
đến tận nơi mới biết. Không trừ điểm vì trừ điểm khiến người ta sợ trả lời khi không chắc,
mà dữ liệu ít còn tệ hơn dữ liệu lệch.

**Quyết định:** Note cá nhân đi 3 bước: (1) lần đầu lưu thẳng vào bộ nhớ trình duyệt trên
máy khách, **không hỏi đăng ký gì**; (2) khi khách có note thứ 3 mới mời để lại **số điện
thoại** để cất lên máy chủ; (3) đổi máy thì đăng nhập bằng số cũ.
**Vì sao:** Bắt đăng ký ngay thì nhiều người bỏ đi; không bắt thì họ mất note rồi bỏ app.
Cùng một việc "xin số điện thoại", hỏi lúc chưa có gì là **phiền**, hỏi lúc đã có 3 note là
**giúp**. Dùng số điện thoại thay vì mã khôi phục 6 số (cơ chế hiện tại) vì không ai giữ
nổi tờ giấy ghi mã 6 số sau 3 tháng, còn số điện thoại thì ai cũng nhớ — mã 6 số đủ cho
điểm/huy hiệu (mất thì tiếc), không đủ cho note cá nhân (mất thì bỏ app).

**Quyết định:** Doanh nghiệp nhận địa điểm (claim) — **chưa làm bây giờ**. Khi làm phải có
xác minh (OTP về đúng số điện thoại công khai của chỗ đó), không cho claim ẩn danh.
**Vì sao:** Chủ quán chỉ bỏ công claim khi thấy có khách vào xem — claim là **hệ quả của
traffic, không phải nguyên nhân**. Không xác minh thì ai cũng claim được quán không phải
của mình để sửa sai thông tin đối thủ hoặc gắn số điện thoại của mình vào.

**Nhận định nền (không phải quyết định, nhưng là lý do đằng sau nhiều quyết định trên):**
Thứ CDP thắng được Google Maps **không phải** "sổ lưu cho mình" — Google đã có Lists + ghi
chú riêng, CDP không có cửa. Mà là 3 thứ: **thông tin còn sống** (Google giữ quán đã đóng
cửa vẫn hiện đang mở), **kho mẹo địa phương** (chỗ gửi xe, lối vào, đường bị chặn tối lễ
hội), và **gửi được cho người khác** (link một cuốn sổ có ghi chú, thay vì 5 link Google
Maps rời rạc). Sổ có giá trị vì **gửi được**, không phải vì **lưu được** — đây cũng là lời
giải cho câu hỏi "ai viết note đầu tiên": người địa phương viết để gửi cho người quen sắp
đến, chứ không phải viết để tự xem lại.
