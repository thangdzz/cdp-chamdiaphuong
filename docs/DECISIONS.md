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

## 2026-08-17 — Loại địa điểm lên 4 nhóm (Chặng 3) + sửa danh sách phường theo sáp nhập

**Quyết định:** Thêm 2 loại địa điểm mới **Chơi** và **Đi lại** (`lib/placeTypes.js` là
nguồn duy nhất, 6 nơi khác đọc từ đây). Giá trị loại lạ giờ **ném lỗi rõ ràng**
(`InvalidPlaceTypeError`) thay vì âm thầm quy về `"ngu"` như code cũ.
**Vì sao:** Đúng lời hứa "cuốn sổ ăn, chơi, ngủ, đi lại" (NOTEBOOK-DESIGN.md). Kiểu code cũ
"nếu không phải Ăn thì là Ngủ" là lỗi âm thầm nguy hiểm — dữ liệu Chơi/Đi lại có thể bị đẩy
nhầm vào Ngủ mà không ai biết.

**Quyết định:** `ingestBatch.js` bắt riêng lỗi loại-địa-điểm-sai, **bỏ qua đúng 1 bản ghi
hỏng** thay vì làm hỏng cả lô quét.
**Vì sao:** Routine hằng ngày gửi ~9 chỗ/lần trong 1 lô; nếu ném lỗi thẳng mà không xử lý,
1 bản ghi AI quét sai loại (ví dụ hallucinate "cafe" thay vì "an") sẽ chặn đứng toàn bộ 9
chỗ hôm đó lên web, kể cả những chỗ đúng.

**Quyết định:** Sửa `AREA_PRESETS` (dò tên phường trong địa chỉ) — bỏ `"Hà Giang 1"`, thêm
đủ 10 phường TP Tuyên Quang (cũ) trước sáp nhập 1/7/2025 + `"Bình Thuận"` (tên phường mới
sau gộp, không trùng tên cũ nào). Danh sách đầy đủ: An Tường, Đội Cấn, Hưng Thành, Minh
Xuân, Mỹ Lâm, Nông Tiến, Phan Thiết, Tân Hà, Tân Quang, Ỷ La, Bình Thuận.
**Vì sao:** Tra cứu xác nhận `"Hà Giang 1"` (và `"Hà Giang 2"`) là 2 phường mới của **TP Hà
Giang cũ**, không phải TP Tuyên Quang — lạc vào danh sách dù cùng tỉnh mới sau sáp nhập. 10
phường cũ của TP Tuyên Quang đã gộp lại thành 5 phường mới (Minh Xuân/An Tường/Nông
Tiến/Mỹ Lâm giữ tên, riêng Đội Cấn đổi tên thành Bình Thuận). Giữ cả tên cũ lẫn tên mới vì
`AREA_PRESETS` chỉ dùng để dò khớp chuỗi con trong địa chỉ thô — địa chỉ thật (Google Maps,
biển hiệu) có thể chưa cập nhật kịp tên phường mới.

**Đánh đổi đã chấp nhận:** Chưa mở rộng theo tên **xã** (5 xã ngoại thành cũ của TP Tuyên
Quang, hay các xã mới sau sáp nhập) — `AREA_PRESETS` từ trước tới nay chỉ dò theo phường,
giữ nguyên phạm vi đó.

**Không đổi:** Nguyên tắc dùng vùng địa lý TP Tuyên Quang (cũ) + địa chỉ kiểu Google Maps
(quyết định 2026-07-14) — chỉ mở rộng đúng đắn hơn trong phạm vi đó, không đổi phạm vi.

## 2026-08-21 — Công cụ gộp trùng lặp: nguồn AI quét (`mode="reviewItem"`) ưu tiên dữ liệu chỗ đã công khai (B), không phải bản mới quét (A)

**Bối cảnh:** sửa lỗi L3 (`app/admin/MergeDuplicatePanel.js` — xem STATUS.md) phát hiện
`initFields()` luôn ưu tiên A bất kể đang giữ bên nào. Với `mode="suggestion"` (khách tự báo
trùng), đây rõ ràng là **lỗi** — giao diện có nút chọn "Giữ bản ghi của: Chỗ A/B" nhưng ô
điền sẵn không theo lựa chọn đó. Với `mode="reviewItem"` (AI quét tự phát hiện nghi trùng),
**không có lựa chọn nào bị vi phạm** — luồng này luôn giữ B cố định (không có nút chọn), và
việc ưu tiên A (bản mới quét) chỉ là hành vi mặc định từ trước tới giờ, không phải lỗi theo
đúng nghĩa "làm sai điều đã hứa với admin".

**Quyết định:** Đổi `mode="reviewItem"` sang ưu tiên **B** (dữ liệu chỗ đã công khai) khi
điền sẵn form so sánh — thiếu ô nào mới lấy từ A (bản mới quét). Admin vẫn sửa tay hoặc bấm
nút "A: ..."/"B: ..." để lấy giá trị bên kia cho từng ô như cũ.

**Vì sao:** (1) Nhất quán với nguyên tắc chung vừa áp cho `mode="suggestion"` — "ưu tiên bên
đang được giữ, thiếu mới lấy bên kia" — dễ hiểu, dễ nhớ, không phải nhớ 2 quy tắc khác nhau
cho 2 luồng. (2) Dữ liệu B đã qua ít nhất 1 lần xử lý/tồn tại công khai, còn A là bản quét
mới — mặc định tin B hơn an toàn hơn, tránh 1 lần quét chất lượng thấp âm thầm ghi đè dữ liệu
đang đúng mà admin không để ý (rà dữ liệu sau khi sửa tìm được 2 ca nghi ngờ đúng kiểu này —
xem STATUS.md).

**Đánh đổi:** khi bản quét mới (A) thực ra chính xác hơn B (vd B nhập tay từ lâu, có lỗi;
A vừa quét được thông tin cập nhật hơn), admin phải tự bấm nút "A: ..." cho từng ô muốn lấy,
thay vì được điền sẵn. Chấp nhận được — admin luôn thấy cả 2 cột A/B để so sánh, không mất
thông tin nào, chỉ đổi giá trị mặc định điền sẵn.

## 2026-08-23 — `/admin` mục "Đang công khai": danh sách tìm kiếm/lọc thay vì mở sẵn mọi form

**Bối cảnh:** mục "Đang công khai" mở sẵn **122 form sửa cùng lúc** (mỗi chỗ 1 form), trang
nặng và không tìm nổi chỗ cần sửa.

**Quyết định:** Đổi thành danh sách gọn + ô tìm kiếm (không cần gõ dấu) + tab lọc theo loại
(Ăn/Chơi/Ngủ/Đi lại, có số đếm); bấm "Sửa" mới mở form, **chỉ 1 form mở tại 1 thời điểm**.
**Vì sao:** Số địa điểm chỉ tăng theo thời gian (39 → 122 trong 1 tháng), cách cũ càng ngày
càng không dùng được. Tìm kiếm không dấu vì admin gõ nhanh trên điện thoại.

**Ghi chú kỹ thuật:** phải tách `Field`/`PlaceForm` ra file riêng (`PlaceFormFields.js`) vì
`page.js` là Server Component có `next/headers` — Client Component không import trực tiếp từ
đó được.

## 2026-08-24 — Món đặc trưng: chia nhỏ, làm 2 nguồn trước, hoãn nguồn "khách gõ"

**Quyết định:** Trong 3 nguồn của [SPEC-chang-5.md §2.2](SPEC-chang-5.md), lượt này chỉ làm
**nguồn 1** (hiện món AI quét sẵn, dạng nhãn tĩnh) và **nguồn 2** (ảnh menu). Hoãn **nguồn 3**
(ô gõ món cho khách + bấm chọn theo luật đồng thuận Chặng 2) sang lượt sau, bàn thiết kế
riêng.
**Vì sao:** Nguồn 3 cần một **tầng dữ liệu mới**: danh sách lựa chọn **động theo từng chỗ**,
khác hẳn `lib/questions.js` (danh sách câu hỏi/đáp án cố định viết cứng trong code). Gộp vào
cùng lượt sẽ thành thay đổi lớn, khó kiểm soát — trái nguyên tắc "làm từng việc nhỏ".

**Quyết định:** Ảnh menu lưu ở mảng **riêng** `place.menuPhotos`, mỗi phần tử là object
`{url, addedAt}`; **không** đụng `place.photos` (giữ nguyên mảng chuỗi URL như cũ).
**Vì sao:** Cần mang theo ngày khách gửi để hiện tuổi ảnh (xem quyết định ngay dưới). Đổi cấu
trúc `photos` đang chạy sẽ có rủi ro vỡ những chỗ khác đang đọc nó, trong khi thêm mảng song
song thì không ảnh hưởng gì.

**Quyết định:** Hiện **tuổi ảnh menu** ngay cạnh khối ảnh ("Ảnh menu · khách gửi 3 tháng
trước").
**Vì sao:** [SPEC-chang-5.md §2.3](SPEC-chang-5.md) đã chốt **không ghi giá từng món** vì giá
là thứ cũ nhanh nhất — nhưng ảnh menu lại chụp **nguyên bảng giá**, mà ảnh 6 tháng trước trông
y hệt ảnh hôm qua. Không sửa được chuyện ảnh cũ, nhưng phải nói thật tuổi của nó.

**Quyết định:** Công cụ gộp trùng lặp phải xử lý `menuPhotos` y như `photos` (gộp 2 bên, admin
bỏ tick ảnh không giữ).
**Vì sao:** Nếu bỏ sót, gộp 2 chỗ sẽ làm **mất im lặng** toàn bộ ảnh menu của bên bị xoá —
không ai biết để phàn nàn.

## 2026-08-24 — Quy tắc kiểm thử: KHÔNG dùng dữ liệu thật đang công khai để test hành động không hoàn tác được

**Bối cảnh:** khi test công cụ gộp trùng lặp, đã lấy **2 chỗ thật đang công khai** (`an-02`
"Dê Phố (Tân Hòa)" và `an-03` "Nhà hàng Dũng Cá" — 2 quán hoàn toàn khác nhau) để giả lập
tình huống "nghi trùng", rồi **bấm nút Gộp thật** → xoá mất `an-03` khỏi web, kèm check-in và
dữ liệu đồng thuận gắn với nó. Khôi phục được nhờ `data/known-places-snapshot.json` đã commit
sẵn trong repo, nhưng chỉ khôi phục được tên/loại/địa chỉ.

**Quyết định:** Từ nay, mọi kiểm thử chạm tới hành động **ghi/xoá không hoàn tác dễ** (gộp,
xoá chỗ, duyệt góp ý) phải tạo **dữ liệu test riêng** (id/tên rõ ràng là test, vd
`test-merge-a`/`test-merge-b`) rồi xoá hẳn sau khi xong — không mượn dữ liệu thật, kể cả khi
"chắc chỗ đó không ai để ý".
**Vì sao:** Dữ liệu thật đã công khai là thứ khách đang nhìn thấy; một lần bấm nhầm là mất
luôn cả lịch sử check-in/đồng thuận gắn với id đó, không có bản sao lưu đầy đủ nào để phục
hồi (snapshot chỉ có tên/loại/địa chỉ).

**Đánh đổi:** tốn thêm vài phút tạo/dọn dữ liệu test mỗi lần. Chấp nhận — rẻ hơn nhiều so với
hỏng dữ liệu thật.

## 2026-08-24 — Zoom ảnh: tự xử lý cử chỉ chạm, zoom quanh tâm ảnh

**Bối cảnh:** khối xem ảnh toàn màn hình (`PhotoGallery`) **chưa hề có code zoom**; chụm 2
ngón bị trình duyệt hiểu thành zoom **cả trang** (kéo giãn luôn nút đóng, thanh ảnh nhỏ...).
Đặc biệt cản trở với ảnh menu vừa làm — khách cần zoom để đọc giá.

**Quyết định:** Đặt `touch-action: none` **chỉ trên vùng ảnh chính**, không đặt lên cả lớp
phủ — để thanh ảnh nhỏ phía dưới vẫn vuốt ngang bằng cử chỉ mặc định của trình duyệt.
**Vì sao:** Chặn trình duyệt tự zoom đúng chỗ cần chặn, không phá những chỗ đang chạy tốt.

**Quyết định:** Pinch **zoom quanh tâm ảnh**, không đuổi theo đúng điểm 2 ngón đang chụm
(kiểu Google Photos). Giới hạn 1x–4x, double-tap đổi nhanh 1x⇄2.5x.
**Vì sao:** Zoom bám đúng điểm chụm cần tính toán tọa độ phức tạp hơn nhiều; zoom quanh tâm
cộng với kéo xem đã đủ giải quyết nhu cầu thật (đọc rõ ảnh menu/chi tiết ảnh).

**Quyết định:** Quyết định "đây là chạm hay kéo" dựa vào **quãng đường di chuyển thực tế lúc
buông tay**, không dựa vào mức zoom lúc bắt đầu chạm.
**Vì sao:** Cách đầu (dựa vào mức zoom) tạo lỗi thật: khi đang zoom, **mọi** cú chạm 1 ngón
đều bị hiểu ngay là "bắt đầu kéo", nên double-tap để zoom ra lại **không bao giờ được kiểm
tra tới** — người dùng kẹt ở mức zoom, không thoát ra được bằng cử chỉ quen thuộc.

## 2026-09-03 — Ngừng theo dõi git cho `.claude/settings*` (đã lộ secret)

**Quyết định:** Thêm `.claude/settings.json` và `.claude/settings.local.json` vào
`.gitignore`, gỡ `settings.json` khỏi git (`git rm --cached`), **giữ nguyên file trên máy**.
**Vì sao:** 2 file này từng chứa secret bị lộ trên repo Public (`ADMIN_PASSWORD`,
`CRON_SECRET` — **đã đổi giá trị mới**). Đây là bước dọn để không lặp lại: file cấu hình cục
bộ của Claude Code tự tích luỹ lệnh đã cho phép, dễ vô tình kèm secret.

**Chưa làm:** **lịch sử git cũ vẫn còn nội dung 2 file** (kể cả CRON_SECRET cũ). Xoá khỏi
lịch sử phải viết lại toàn bộ lịch sử repo — chưa làm, và không cần gấp vì secret đã đổi.

## 2026-09-08 — Tên miền riêng chamdiaphuong.io.vn

**Quyết định:** `https://chamdiaphuong.io.vn` là **địa chỉ chính thức** của web; giữ
`web-five-xi-28.vercel.app` chạy song song, **không gỡ**.
**Vì sao:** Tên miền cũ khó nhớ, khó đọc cho người Tuyên Quang khi chia sẻ miệng. Giữ địa chỉ
cũ vì GitHub Action quét dữ liệu hằng ngày đang gọi API qua địa chỉ đó
(`.github/workflows/ingest-from-scan.yml`) — gỡ là gãy luồng quét.

**Quyết định:** Trỏ DNS bằng **2 bản ghi A** (`@` và `www` → `76.76.21.21`) ở VinaHost, thay
vì đổi nameserver sang Vercel.
**Vì sao:** Chỉ thêm 2 dòng, giữ nguyên phần DNS còn lại ở VinaHost — ít rủi ro hơn chuyển
toàn bộ quyền quản lý DNS, và dễ hoàn tác nếu cần.

**Quyết định:** `www.chamdiaphuong.io.vn` **chuyển hướng 308** (vĩnh viễn) về tên miền gốc.
**Vì sao:** Trước đó `www` phục vụ nội dung độc lập — Google có thể coi là 2 trang trùng nội
dung, chia nhỏ điểm tìm kiếm. Vercel CLI không có lệnh này, phải gọi thẳng REST API
`PATCH /v9/projects/{projectId}/domains/{domain}` (chi tiết ở STATUS.md 2026-09-08).

## 2026-09-08 — Copy đầu trang: câu do anh tự viết, không dùng phương án nào trong NOTE-01

**Bối cảnh:** [10-NOTE-01-Product-UX.md](10-NOTE-01-Product-UX.md) §2.1 đưa 5 phương án
headline (A–E, khuyến nghị A) để thay dòng cũ *"Chỗ ăn, chỗ ngủ đáng tin ở TP Tuyên Quang —
bản thử nghiệm"*.

**Quyết định:** Dùng câu **anh tự viết**, không lấy phương án nào trong 5 cái:
> **Gom chỗ hay. Chia sẻ dễ dàng.**
> Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.

**Vì sao:** Ngắn và cân đối hơn các phương án trong NOTE — headline nói **hành động** (gom /
chia sẻ) thay vì liệt kê nhu cầu, dòng phụ mới liệt kê 4 nhóm. Vẫn giữ được chữ "sổ địa
phương" để người mới hiểu sản phẩm là gì, đúng mục tiêu của NOTE §2.1.

**Cũng bỏ luôn chữ "bản thử nghiệm"** ở đầu trang — web đã có tên miền riêng và dữ liệu thật,
tự gọi mình là bản thử nghiệm làm giảm niềm tin không cần thiết.

## 2026-09-08 — Banner lễ hội dẫn theo nhu cầu, chưa dẫn vào sổ mẫu

**Quyết định:** Đổi chữ trên banner lễ hội từ *"19 – 25/9/2026 · Xem chi tiết lễ hội →"* sang
*"Đi Thành Tuyên 20/9? · Chỗ gửi xe, ăn tối, cafe nghỉ chân và chỗ ngủ quanh khu lễ hội →"*
(NOTE-01 §4.2), nhưng **vẫn dẫn vào trang `/le-hoi-thanh-tuyen`** chứ chưa dẫn vào sổ mẫu.
**Vì sao:** NOTE muốn CTA "Xem sổ Thành Tuyên 20/9", nhưng **sổ mẫu chưa tồn tại** (việc 4
của P0, chưa làm). Đổi chữ trước vẫn có giá trị ngay (nói đúng thứ khách cần), đổi đích sau
khi có sổ chỉ là sửa 1 dòng link.

**Đánh đổi:** trong lúc chờ sổ mẫu, chữ banner hứa nhiều hơn thứ trang đích đang có (trang lễ
hội có lịch sự kiện + vài lưu ý, chưa gom sẵn danh sách chỗ gửi xe/ăn tối). Chấp nhận trong
ngắn hạn vì lễ hội chỉ còn 11 ngày; nếu sổ mẫu không kịp thì nên đổi lại chữ cho khớp.

## 2026-09-08 — Xác nhận số điện thoại: giữ nút Gọi, nói thật độ tin cậy bằng nhãn

**Bối cảnh:** NOTE-01 §6.1 đề xuất **không** để nút Gọi nổi bật, chỉ hiện nút Gọi rõ khi số
đạt ngưỡng tin cậy (≥2 xác nhận độc lập, không có báo sai mới hơn). Lý do NOTE đưa ra hợp lý:
click-to-call tạo cảm giác CDP xác nhận số đó, mà sai số làm mất niềm tin nhanh hơn thiếu số.

**Quyết định (khác NOTE):** **Vẫn giữ nút Gọi ở cả 3 trạng thái**, kèm nhãn nói rõ số đã được
ai xác nhận chưa. Khi chưa ai xác nhận (hoặc đang có báo sai) thì hiện thêm nút **"Tìm số trên
Google"** để khách tự kiểm chứng.
**Vì sao:** số liệu thật lúc quyết định — **85 chỗ có số, 0 chỗ được xác nhận**. Áp ngưỡng
ngay sẽ làm **toàn bộ 85 nút gọi biến mất trong cùng một ngày**, trong khi chưa ai kịp xác
nhận cái nào. Mất tính năng đang dùng được là thiệt hại thấy ngay, còn lợi ích về niềm tin thì
chỉ đến dần. Nói thật bằng chữ ("Chưa ai xác nhận số này") đạt đúng mục tiêu của NOTE §9
("thông tin nào chưa chắc thì nói rõ chưa chắc") mà không phải gỡ tính năng.

**Đơn giản hoá so với NOTE §6.5:** không dùng trọng số giảm dần theo thời gian như
`voteWeight()` ở `lib/answers.js`, chỉ **bỏ hẳn phiếu quá 12 tháng** rồi đếm số người.
**Vì sao:** nhãn hiển thị là số người nguyên ("3 người đã xác nhận") — trọng số phân số không
thể hiện ra được, chỉ làm logic khó hiểu mà không đổi thứ khách nhìn thấy.

**Không đổi:** không ghi đè trường `phone` từ dữ liệu xác nhận (đúng NOTE §6.4) — báo sai chỉ
hiện cảnh báo, việc sửa số vẫn đi qua luồng góp ý + admin duyệt đã có.

## 2026-09-08 — Dọn dữ liệu test: chỉ xoá theo ID chính xác, không theo tiêu chí chung

**Bối cảnh:** sau khi test tính năng xác nhận số điện thoại, lệnh dọn cuối cùng xoá hồ sơ theo
tiêu chí **chung chung**: `nickname === "Người ẩn danh"` và điểm ≤ 1. Nhưng đó **chính là hình
dạng hồ sơ của khách thật** vừa check-in lần đầu (hệ thống tự tạo hồ sơ im lặng, không hỏi
biệt danh — SPEC-chang-1.md §2.3, và +1 điểm cho lượt check-in). Kết quả: xoá 3 hồ sơ, **2
trong đó không xác định được là test hay khách thật**, không khôi phục được.

**Quyết định:** Khi dọn dữ liệu test, **chỉ được xoá theo đúng ID đã biết** (anonId/placeId cụ
thể ghi lại lúc tạo), **cấm** xoá theo tiêu chí suy đoán kiểu "tên mặc định", "điểm thấp",
"tạo gần đây". Nếu không nhớ chính xác ID đã tạo thì để lại, báo cho anh — dữ liệu thừa vô hại
hơn nhiều so với xoá nhầm dữ liệu thật.

**Vì sao:** dữ liệu do luồng tự động sinh ra (hồ sơ ẩn danh) **trông giống hệt** dữ liệu test,
không có cờ nào phân biệt. Đây là lần thứ hai cùng một kiểu sai trong 2 tuần — lần trước là
gộp nhầm 2 quán thật khi test công cụ gộp (xem mục 2026-08-24). Quy tắc cũ chỉ nói "tạo dữ
liệu test riêng", lần này bổ sung vế còn thiếu: **cách XOÁ cũng phải chính xác như cách tạo**.

**Đánh đổi:** có thể còn sót vài bản ghi test trong dữ liệu thật. Chấp nhận — chúng vô hại
(hồ sơ 1 điểm không ảnh hưởng gì tới thứ khách nhìn thấy), còn xoá nhầm thì không lấy lại được.

## 2026-09-08 — Báo đóng cửa: lối vào riêng + trả đúng 15 điểm

**Bối cảnh:** anh bấm thử và không tìm thấy chỗ báo quán đã đóng cửa. Kiểm chứng: chức năng có
nhưng là 1 ô tích nằm **cuối** form "Thêm thông tin", phải cuộn qua 6 ô nhập mới thấy; menu
"Bổ sung" không có lựa chọn nào về đóng cửa. Kiểm tra tiếp thì điểm cũng sai: code cộng
`POINTS.correction` = 5đ, trong khi [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md) dòng 265 chốt
**+15** và dòng 271 gọi đây là *"dữ liệu quý nhất của cả sản phẩm"*.

**Quyết định:** Thêm lựa chọn **"Báo chỗ này đã đóng cửa"** ngay ở menu Bổ sung, dẫn vào màn
xác nhận **không có ô nào bắt buộc** (1 nút xác nhận + ô ghi chú tuỳ chọn). Thêm
`POINTS.closed = 15`, áp riêng cho góp ý có cờ `closed`.
**Vì sao:** đây là **lý do tồn tại số 1** của CDP so với Google Maps (NOTEBOOK-DESIGN dòng 31:
*"Google giữ thông tin chết — quán đóng cửa lâu rồi vẫn hiện đang mở"*). Bắt khách đi qua form
"Thêm thông tin" rồi cuộn hết 6 ô mới báo được là mâu thuẫn trực tiếp với định vị sản phẩm.

**Giữ lại ô tích cũ** trong form "Thêm thông tin" — ai đang điền dở mới nhớ ra vẫn báo được
ngay tại chỗ, không phải quay ra làm lại.

**Đánh đổi:** menu Bổ sung dài thêm 1 dòng (4 lựa chọn thay vì 3). Chấp nhận — đổi lại hành
động giá trị nhất có lối đi thẳng.

## 2026-09-09 — Mẹo địa phương gắn ngữ cảnh, hiển thị như field

**Quyết định:** Thêm trường `context` cho mẹo địa phương (7 lựa chọn: Gửi xe · Lối vào · Thời
điểm · Di chuyển · Thanh toán · Tiện ích · Khác), **chọn trước khi gõ**, và hiển thị mẹo đã
duyệt dưới dạng **field** (`**Gửi xe** — Tối lễ hội nên gửi phía sau chợ`) thay vì một dòng
chữ có icon 💡.
**Vì sao:** đúng NOTE-03 §1.B — mẹo phải giúp người sau làm được **một việc cụ thể**. Gắn ngữ
cảnh khiến người viết tự nghĩ theo hướng đó, và khiến người đọc quét nhanh được đúng thứ họ
cần. Quan trọng hơn: hiển thị dạng field **chặn bằng cấu trúc** việc mẹo trôi dần thành bình
luận/review — đúng nguyên tắc gốc của dự án (chặn bằng cấu trúc, không bằng nội quy).

**Không migration:** note cũ đọc ra `context = null` và hiện y như trước (có icon 💡). Không
động vào dữ liệu đã duyệt.

## 2026-09-09 — Nhóm chính của Sổ: bỏ nhãn khi sổ trộn quá nhiều loại

**Quyết định:** Metadata của Sổ (cả trên trang lẫn trong preview chia sẻ) hiện
`N địa điểm · Nhóm chính`, trong đó nhóm chính là loại xuất hiện nhiều nhất — nhưng **chỉ gán
nhãn khi loại đó chiếm ≥ 50%** số địa điểm; dưới ngưỡng thì chỉ hiện `N địa điểm`.
**Vì sao:** NOTE-03 §5 muốn preview cho thấy sổ là "tập hợp có chủ đích". Một sổ 2 Ăn + 2 Ngủ
+ 1 Chơi mà gán đại nhãn "Ăn" là **nói sai về nội dung sổ** — thà không nói còn hơn nói sai,
đúng nguyên tắc "thông tin nào chưa chắc thì nói rõ chưa chắc" (NOTE-01 §9).

## 2026-09-09 — Ảnh bìa: `coverPhoto` do admin chọn được ưu tiên hơn `photos[0]`

**Quyết định:** Thêm trường `coverPhoto` cho địa điểm, admin chọn trong form sửa ở `/admin`.
Mọi nơi hiển thị ảnh đại diện đi qua `placeCover()` trong `lib/cover.js`, ưu tiên `coverPhoto`
trước rồi mới tới `photos[0]`.
**Vì sao:** `photos[0]` chỉ có nghĩa là "ảnh khách gửi lên sớm nhất" — không có gì đảm bảo nó
đại diện tốt cho chỗ đó. Ảnh này là thứ khách thấy đầu tiên trên thẻ, trên trang địa điểm, và
trong preview khi chia sẻ ra Zalo/Facebook, nên đáng để admin có quyền chọn.

**Bỏ chọn = để web tự lấy ảnh đầu**, KHÔNG phải xoá ảnh — ảnh vẫn nằm nguyên trong `photos`.

**Cũng gom luôn `notebookCover()` vào cùng file:** trước đây mỗi chỗ tự chọn ảnh theo cách
riêng (thẻ lấy `photos[0]`, OG sổ lấy "ảnh đầu tiên tìm thấy", collage lấy kiểu khác) nên ảnh
trong preview có thể **khác** ảnh khách đang nhìn thấy — cùng một thứ mà 3 nơi hiểu 3 kiểu.

## 2026-09-09 — Trang Sổ chưa có ảnh thì bỏ hẳn khối ảnh, không dùng ảnh mặc định

**Quyết định:** Ảnh mặc định (`FALLBACK_COVER`) **chỉ dùng cho preview khi share** — nơi bắt
buộc phải có ảnh, không có thì Zalo/Facebook hiện ô trống xấu. Còn trên trang Sổ, sổ chưa có
ảnh nào thì **bỏ hẳn khối ảnh**.
**Vì sao:** trưng ảnh lễ hội lên đầu một cuốn sổ toàn quán cafe là **nói sai về nội dung sổ** —
cùng lý do với việc bỏ nhãn loại khi sổ trộn nhiều nhóm (quyết định cùng ngày).


## 2026-09-09 — Ngưỡng "menu đã cũ" đặt ở 3 tháng

**Quyết định:** Ảnh menu quá **3 tháng** thì hiện thêm dòng mời *"Menu này đã N tháng. Bạn có
ảnh mới hơn?"* (`STALE_MENU_MONTHS` trong `app/PlaceExplorer.js`).
**Vì sao:** đây là CTA theo ngữ cảnh mà NOTE-01 §7.4 yêu cầu — nói rõ khách đang giúp việc gì,
thay cho lời mời chung chung. Chọn 3 tháng vì đó là quãng đủ dài để quán kịp đổi giá nhưng
chưa dài tới mức bảng giá thành vô dụng. Dưới ngưỡng thì **ẩn hẳn**, không nói gì — nhắc quá
sớm sẽ thành nhiễu và làm khách nghi ngờ cả những menu còn tốt.

**Bẫy đã gặp khi làm:** viết `{staleMenuMonths && (...)}` thì khi giá trị bằng `0`, React in
thẳng chữ **"0"** ra màn hình (số 0 là giá trị "giả" trong JavaScript nhưng vẫn là thứ vẽ
được). Đã đổi sang so sánh `!== null`. Phát hiện được vì lúc kiểm thử có hạ tạm ngưỡng xuống 0
để xem dòng mời vẽ ra sao — cách thử này an toàn hơn hẳn việc tạo dữ liệu giả trong Redis.

## 2026-09-09 — Ảnh nhỏ trên thẻ Sổ cố ý KHÔNG bấm được

**Quyết định:** Ảnh nhận diện ở thẻ trong Sổ là ảnh tĩnh, không mở gallery khi bấm.
**Vì sao:** ảnh bìa có thể là **ảnh menu** (xem thứ tự ưu tiên ở `lib/cover.js`), trong khi
gallery của thẻ chạy trên mảng `photos`. Bấm vào ảnh menu mà mở ra một ảnh khác hẳn thì tệ hơn
là không bấm được. Muốn xem ảnh thì bung thẻ ra đã có khối "Ảnh địa điểm" đầy đủ.

## 2026-09-09 — Xe ghép: admin điền 2 thứ, khách bấm chọn 5 thứ

**Quyết định:** Thêm `transportSubtype` cho nhóm Đi lại (7 loại). Với xe ghép, chia đôi việc
điền dữ liệu:
- **Admin điền trong `/admin`:** Loại xe (`vehicleSeats`), Tuyến chính (`mainRoute`).
- **Khách bấm chọn (đồng thuận, không qua duyệt):** Hình thức, Điểm đón, Điểm trả, Đặt trước,
  Hành lý.

**Vì sao:** đúng cách NOTE-04 §5 tách 2 cơ chế. Loại xe và tuyến là thông tin **cố định của
nhà xe** — quét được, hiếm khi đổi, và khách vãng lai cũng không rõ bằng chính nhà xe. Còn
điểm đón/hành lý/đặt trước là thứ **đi rồi mới biết thật**, để khách bấm thì dữ liệu tự sống.
Đưa hết cho admin sẽ thành gánh nặng gọi hỏi từng nhà xe; đưa hết cho khách thì chỗ mới thêm
sẽ trống trơn.

**Cũng sửa:** xe ghép thôi bị hỏi "Gửi xe ở đâu?", "Lối vào thế nào?", "Giờ nào đông?" — đó là
field của quán ăn, ép dùng chung là sai (NOTE-04 §2). Và mọi chỗ Đi lại đã chọn loại thì thôi
hỏi "Đây là chỗ gì?" vì admin đã trả lời rồi, mà bộ đáp án cũ còn thiếu hẳn "Xe ghép".

**Đánh đổi đã nhận:** 3 ô riêng của Đi lại trong `/admin` chỉ hiện khi chỗ đó **đang** là Đi
lại. Đổi loại hình sang Đi lại thì phải Lưu rồi mở lại mới thấy. Đổi loại là việc hiếm, không
đáng bắt cả form phải chạy JavaScript chỉ vì nó.

## 2026-09-09 — Mẹo: bấm chọn trước, gõ là ngoại lệ

**Quyết định:** Trong khối "Bạn biết gì thêm về chỗ này?", chọn ngữ cảnh xong thì hiện bộ đáp
án bấm chọn của câu hỏi tương ứng, KHÔNG mở ô gõ. Ô gõ chỉ mở 3 trường hợp: đáp án cần làm rõ
("Bãi gần, mất phí" → "Bãi nào?"), khách bấm "Không có ý nào đúng — để tôi tự viết", hoặc ngữ
cảnh không có câu hỏi nào (Di chuyển, Khác).
**Vì sao:** trước đây hệ thống có 2 cơ chế chạy song song mà không biết nhau — chip "Gửi xe"
dẫn khách đi gõ tay, trong khi ở cuối chính thẻ đó đã có câu "Gửi xe ở đâu?" với đúng các đáp
án ấy. Khách phải gõ lại thứ chỉ cần bấm, lại còn phải chờ duyệt mới hiện (NOTE-04 §3).

**Kèm 2 thay đổi để không sinh lỗi mới:**
1. Bộ nút đáp án tách ra `app/QuestionOptions.js` dùng chung, thay vì chép thành 2 bản dễ trôi
   lệch nhau về sau.
2. Câu nào khối Mẹo đang bày sẵn thì khối hỏi cuối thẻ bỏ qua đúng câu đó — nếu không, "Gửi
   xe" (vừa là chip đầu tiên, vừa là câu hỏi đầu tiên) sẽ hiện **2 lần trên cùng một màn hình**.

**Đánh đổi:** giờ phải chọn ngữ cảnh rồi ô gõ mới hiện, tốn thêm 1 chạm cho người chỉ muốn gõ.
Chấp nhận: đó chính là thứ làm cả thay đổi này có tác dụng, và mọi mẹo mới từ nay đều có ngữ
cảnh nên hiện được dạng field.

## 2026-09-09 — Đi lại: câu hỏi và CTA đổi theo `transportSubtype`

**Quyết định:** `primaryCategory` quyết định bộ field lớn, `transportSubtype` quyết định câu
hỏi và CTA cụ thể (NOTE-05 §2). Ba khoá khai báo trong `lib/questions.js` (`subtypes`,
`skipSubtypes`, `supersededBySubtype`) cộng thêm `supersededByField`, và `primaryAction()`
trong `lib/transport.js`.
**Vì sao:** một bộ câu hỏi chung cho cả nhóm Đi lại làm nhà xe ghép bị hỏi "Gửi xe ở đâu?",
"Lối vào thế nào?" — field của quán ăn. Và "Chỉ đường" tới địa chỉ nhà xe là nút vô nghĩa:
đó là nơi họ đăng ký, không phải nơi khách cần tới.

**Ba lựa chọn có cân nhắc:**

1. **"Loại xe" vừa là ô admin vừa là câu hỏi.** NOTE-04 anh đã chốt admin điền `vehicleSeats`,
   nhưng NOTE-05 §14 lại đòi có câu hỏi "Loại xe". Giải: thêm `supersededByField` — câu hỏi tồn
   tại cho chỗ admin chưa điền, và **im lặng** ngay khi admin đã điền. Hỏi khách thứ đang hiện
   ngay dòng đầu thẻ là đúng kiểu thừa mà NOTE-05 muốn dẹp.

2. **KHÔNG đưa "Không rõ" vào options** dù NOTE-05 §4 có liệt kê. Nút "Không rõ" sẵn có ở khối
   hỏi cuối thẻ **bỏ qua** câu hỏi chứ không ghi phiếu. Biến nó thành một đáp án thật sẽ tạo ra
   đồng thuận kiểu "nhiều người đồng ý rằng không ai biết" — vô nghĩa và còn lấn át đáp án thật.

3. **Bỏ "Đón tận nơi / Trả tận nơi" khỏi nhóm Tiện ích xe** dù NOTE-05 §4 có liệt kê — 2 thứ đó
   đã là câu hỏi riêng, để lại là hỏi 2 lần cùng một chuyện (§4 dòng cuối: "chỉ đưa lựa chọn có
   ý nghĩa với subtype").

**Chỗ chưa có số điện thoại:** CTA "Liên hệ đặt xe" sẽ dẫn vào khối trống, nên đổi thành **"Tìm
số nhà xe"** mở thẳng Google. Thà đưa khách tới chỗ tìm được số còn hơn một nút bấm vào chẳng
có gì. "Xe ghép Anh Huy" đang đúng trường hợp này.

**Bẫy đã gặp:** id `booking` bị trùng giữa câu "Đặt phòng qua đâu?" (nhóm Ngủ) và câu đặt xe
mới thêm. `getQuestion(id)` lấy câu ĐẦU TIÊN khớp id, nên phiếu đặt xe gửi lên sẽ bị kiểm tra
theo bộ đáp án của Ngủ rồi bị từ chối im lặng. Đã đổi thành `ride_booking`.
**Quy tắc từ nay:** id câu hỏi phải duy nhất trong toàn `lib/questions.js`, kể cả khác `scope`.

## 2026-09-10 — Đi lại: 4 family, family là lớp nền và subtype chỉ override

**Quyết định:** Gom nhóm Đi lại thành 4 family (`pickup-service`, `scheduled-route`,
`transport-place`, `self-drive`) theo NOTE-06 §1. Câu hỏi, chip góp ý và CTA đều khai theo
family trước, subtype nào cần khác thì override — trong `lib/questions.js` là 2 khoá mới
`families` / `skipFamilies`, trong `lib/transport.js` là `FAMILY_ACTIONS` / `SUBTYPE_ACTIONS`
và `FAMILY_NOUNS` / `SUBTYPE_NOUNS`.
**Vì sao:** đã có 3 loại dịch vụ đón khách dùng chung gần hết bộ câu hỏi. Khai riêng cho từng
subtype là chép 3 lần, sửa 1 chỗ quên 2 chỗ. Thêm loại mới giờ chỉ là thêm 1 dòng vào
`TRANSPORT_SUBTYPES`, không phải sửa if/else ở nơi khác (§14).

**KHÔNG lưu `transportFamily` vào từng địa điểm** dù NOTE-06 §2 có đề xuất. Mỗi subtype thuộc
đúng 1 family, nên lưu cả 2 là tạo sẵn khả năng lệch nhau — dự án này đã 2 lần bị dữ liệu ghi
đè âm thầm vì kiểu lưu trùng. Family suy ra từ subtype bằng `transportFamilyOf()`; muốn lưu
thật thì chỉ cần sửa đúng hàm đó. Ô chọn trong `/admin` vẫn nhóm theo family bằng `<optgroup>`
nên anh vẫn thấy rõ 4 nhóm, mà chỉ phải chọn 1 ô.

**Taxi giữ "Xem thông tin gọi xe", không đổi thành "Gọi/Đặt taxi" khi số đủ tin cậy** như
§6 đề xuất. Mức tin cậy nằm ở `place_phone_confirmations`, mỗi chỗ một lệnh Redis riêng — đọc
cho cả trang chủ là vỡ quy tắc "3 lệnh/lượt xem trang chủ" ở ARCHITECTURE; còn đọc phía khách
thì nhãn nút sẽ nhảy chữ sau khi trang đã hiện. "Xem thông tin gọi xe" luôn đúng, và bấm vào
là thấy ngay nhãn đã có mấy người xác nhận.

## 2026-09-10 — Loại xe: nhiều giá trị, xác nhận độc lập từng loại

**Quyết định:** `vehicleSeats` (ô chữ tự do "7 chỗ") → `vehicleTypes` (mảng id: `["4","7"]`).
Admin tích nhiều ô; khách bấm chọn nhiều đáp án. Đồng thuận đếm **riêng từng loại**, loại nào
đủ 2 phiếu là hiện, không có loại nào "thắng" rồi ẩn loại khác (NOTE-06 §8).
**Vì sao:** một nhà xe chạy đồng thời 4 chỗ và 7 chỗ là chuyện thường. Ô chữ tự do thì máy
không đọc được để lọc, còn câu hỏi 1-đáp-án thì ép nói dối.

`computeConsensus` cho câu nhiều lựa chọn nay trả thêm `counts` — số người xác nhận từng giá
trị. Chỉ câu "Loại xe" bật `showCounts` để hiện ra ("4 chỗ (3) · 7 chỗ (5)"); các câu nhiều lựa
chọn khác không bật vì "Tiền mặt (3) · Chuyển khoản (2)" chỉ làm thẻ rối chứ không giúp quyết
định gì.

**Chuyển dữ liệu — KHÔNG chạy script:**
- `vehicleTypesOf()` đọc được cả 2: có `vehicleTypes` thì dùng, không thì dò số trong ô chữ cũ
  ("7 chỗ" → `["7"]`). Chỗ cũ hiện đúng ngay, không cần ai đụng vào.
- Lưu một chỗ Đi lại trong `/admin` là dọn luôn ô chữ cũ của nó (`vehicleSeats: null`) — chuyển
  dần theo lúc anh sửa, không có lúc nào tồn tại 2 nguồn cùng nói về một thứ.
- Giá trị subtype cũ `thue-xe` vẫn hợp lệ (xếp vào family `self-drive`) nhưng **ẩn khỏi ô chọn**
  — chỗ nào còn giá trị đó thì chọn lại "Thuê ô tô tự lái" hoặc "Thuê xe máy".

## 2026-09-10 — Lộ trình: cùng model với Sổ, chỉ thêm `mode`

**Quyết định:** Sổ thường và Lộ trình dùng CHUNG một model, khác nhau đúng một trường
`notebook.mode` (`"list" | "route"`) — không tạo entity Route riêng (NOTE-03 §2, NOTE-04 §15).
Bật "Lộ trình" chỉ đổi cách hiển thị: đánh số các điểm theo thứ tự đang sắp, mô tả thành
"N điểm · Ăn + Chơi". Tắt đi là về đúng như cũ, danh sách chỗ không bị đụng tới.
**Vì sao:** thứ tự đã có sẵn (nút ↑↓ trong trang Sửa từ Chặng 4), nên "lộ trình" thực chất chỉ
là *nói ra* rằng thứ tự đó có nghĩa. Tách entity riêng sẽ phải nhân đôi toàn bộ phần sửa, chia
sẻ, sao chép — trong khi chẳng thêm được khả năng nào.

**Sổ cũ không có trường này** → `notebookModeOf()` trả "list", đúng hành vi trước giờ. Không
cần migration. Giá trị lạ cũng về "list" chứ không làm vỡ trang.

**KHÔNG hiện khoảng cách / thời gian giữa các điểm** ("650 m · 9 phút đi bộ" như ví dụ NOTE-03
§4). Chưa có nguồn dữ liệu nào cho thứ đó — §4 và §14 đều cấm bịa. Chỉ đánh số.

**Làm nửa đầu RA trước, nửa đầu VÀO sau** (anh chốt 2026-09-10). Nửa đầu vào là "chọn nhiều
chỗ cùng lúc → Tạo lộ trình" (NOTE-04 §6–§9): nhanh hơn khi gom 5–6 chỗ, nhưng nếu chưa có
đánh số thì bấm "Tạo lộ trình" vẫn chỉ đẻ ra một danh sách không thứ tự. Thứ tự mới là thứ làm
cái link gửi đi có giá trị.

## 2026-09-10 — Làm sớm Tự lái + Điểm giao thông, dù NOTE-06 xếp vào "chưa làm"

**Quyết định:** Hoàn thiện luôn câu hỏi + chip cho `self-drive` (thuê ô tô/xe máy tự lái) và
`transport-place` (bến xe · điểm đón/trả · bãi xe), dù NOTE-06 §12 xếp cả hai vào "chưa hoàn
thiện ở chặng này".
**Vì sao:** để lại thì 6/15 chỗ Đi lại vẫn dùng bộ câu hỏi của quán ăn. Cụ thể là hỏi
"Gửi xe ở đâu?" ngay tại một **bãi gửi xe** — vòng tròn — mà bộ đáp án lại toàn chữ của quán
("Bãi riêng của quán", "Vỉa hè cạnh quán"). Anh phát hiện đúng chỗ này. Đã có sẵn cách khai
báo theo family nên mỗi nhóm chỉ tốn thêm 3 câu hỏi khai báo, không phải dựng gì mới.

Câu "Gửi xe ở đâu?" nay bỏ cho **cả 3 nhóm** không phải chỗ ăn/ngủ/chơi: dịch vụ đón khách
(không có chỗ để gửi), cửa hàng thuê xe (khách đi RA bằng xe), bãi/bến xe (chính nó là chỗ gửi
xe — thay bằng "Gửi xe mất bao nhiêu?").

**Cũng điền loại hình cho 14 chỗ Đi lại còn lại.** Đây mới là nguyên nhân chính khiến anh không
thấy gì đổi: code đúng từ hôm qua, nhưng 14/15 chỗ chưa chọn loại hình nên hệ thống không có
căn cứ nào để đổi câu hỏi hay CTA. Phân loại suy từ tên, chắc chắn với 13 chỗ; riêng "Danh Khoa
- Cho thuê xe tự lái" em đoán là **thuê ô tô** (chữ "xe tự lái" ở Tuyên Quang thường là ô tô) —
nếu là xe máy thì anh đổi lại trong `/admin`.

**Bài học ghi lại:** code đúng mà dữ liệu trống thì người dùng thấy y như chưa làm gì. Từ nay
thêm trường mới nào mà giao diện phụ thuộc vào nó, phải điền dữ liệu cho các chỗ hiện có ngay
trong cùng lượt, hoặc nói rõ "chưa thấy đổi cho tới khi điền" chứ không chỉ ghi "việc của anh".

## 2026-09-10 — Đảo quyết định: Lộ trình TÁCH khỏi Sổ thành thực thể riêng

**Quyết định:** Theo `CDP_P1-P8_PostDong_LoTrinh_Prompt.md` §P4, Lộ trình (Route) trở thành
thực thể độc lập, KHÔNG còn là `notebook.mode = "route"`.

**Điều này đảo ngược 2 quyết định trước:**
- NOTE-03 §2 và NOTE-04 §15: *"Không tạo hai hệ thống tách biệt Sổ và Lộ trình. Dùng một
  model: `notebook.mode`"*
- Chính code em làm 2026-09-10 (công tắc "Sổ thường / Lộ trình" trong trang Sửa sổ)

**Vì sao đảo:** khi lộ trình có thêm **giờ dự kiến từng điểm**, **phương tiện**, **thời lượng**,
**ghi chú theo chặng**, thì nó khác Sổ về CẤU TRÚC chứ không còn là cách hiển thị. Nhồi mấy
trường đó vào item của Sổ sẽ để lại một đống trường rỗng cho mọi cuốn sổ thường.

**Đánh đổi anh đã nhận khi chọn:** tốn 1–2 phiên, và bài Lễ hội Thành Tuyên (P1: timeline động)
sẽ **không kịp sửa trước 19/9** — đúng tuần đông khách nhất. Công tắc "Sổ thường / Lộ trình"
vừa làm sẽ bị bỏ.

**Việc phải làm khi tách:**
1. `lib/routes.js` mới: `route:{slug}` + stop có `plannedAt`, `durationMinutes`, `transportMode`, `note`
2. Bỏ `notebook.mode` và công tắc trong trang Sửa sổ (chưa ai dùng — chưa có sổ nào bật)
3. Trang xem/sửa lộ trình riêng, tách khỏi `/so/{slug}`
4. Chia sẻ bằng **bản chụp** (`route_share:{token}`) — P6; kéo theo P5 miễn phí
5. Nút "Mở toàn bộ lộ trình trên Google Maps" (ghép waypoint từ tên + địa chỉ)

**Chưa làm được:** khoảng cách/thời gian từng chặng (P7). **0/210 địa điểm có toạ độ** —
`mapsUrl()` hiện chỉ ghép tên + địa chỉ thành câu tìm kiếm. Cần geocode trước, và nên geocode
theo nhu cầu (chỉ chỗ nào vào lộ trình) thay vì cả 210 chỗ.

## 2026-09-10 — Chặng A: 4 lựa chọn khi tách Lộ trình

**1. Giờ dự kiến lưu "HH:MM", KHÔNG kèm ngày.** Một lộ trình "Ăn tối → gửi xe → Đêm hội" dùng
lại được cho bất kỳ ngày nào. Ngày cụ thể (nếu cần) là việc của Post gắn lộ trình đó — chưa
làm. Thêm ngày sau này không phá dữ liệu cũ.

**2. Điểm dừng có thể KHÔNG phải địa điểm của CDP.** `customTitle` thay cho `placeId` —
"Khách sạn của tôi", "Nhà bạn Nam". Chính ví dụ của §P4 bắt đầu bằng "Khách sạn", mà khách sạn
đó thường không có trong danh bạ. Thiếu cái này thì lộ trình thật không dựng được.

**3. Điểm nhận diện bằng VỊ TRÍ trong mảng, không phải `placeId`.** Một lộ trình được phép đi
qua cùng một chỗ 2 lần (ăn sáng rồi tối quay lại), và điểm tự đặt tên thì không có `placeId`.

**4. Chia sẻ = tạo BẢN CHỤP mới, không phải link tới bản gốc** (§P6). Đánh đổi: chủ sửa lộ
trình xong phải bấm "Chia sẻ" lần nữa mới có link mới. **Đã nói rõ câu này ngay dưới link** —
im lặng thì chủ tưởng link cũ tự cập nhật theo.

**Chưa làm được — thiếu dữ liệu gốc:** khoảng cách và thời gian từng chặng (§P7 "1,8 km ·
khoảng 6 phút"). **0/210 địa điểm có toạ độ.** Nút "Mở toàn bộ lộ trình trên Google Maps" thì
chạy được vì Google tự tra từ tên + địa chỉ.

**Điểm cần để ý:** đầu trang chưa có link tới "Lộ trình của tôi" — 2 nút hiện có đã chật màn
hình điện thoại. Tạm dùng link chéo ở trang `/so`. Nếu anh thấy khó tìm thì phải rút gọn nhãn
3 nút ("Ghi chú · Sổ · Lộ trình").

## 2026-09-11 — NOTE 07: 4 lựa chọn

**1. Safari zoom sửa bằng `@media (pointer: coarse)`, không phải `max-width`.** Điều kiện thật
là *màn hình cảm ứng*, không phải *màn hình hẹp* — iPad cũng zoom, còn màn hình máy tính hẹp
thì không. Máy tính giữ cỡ chữ 14px cho gọn. **Cố ý không dùng `user-scalable=no`**: chặn zoom
là tước luôn khả năng phóng to của người mắt kém.

**2. PlacePicker tải cả danh bạ MỘT LẦN rồi lọc trên máy khách**, thay vì gọi máy chủ theo
từng ký tự. 210 chỗ × 6 trường ≈ 20KB, đúng 1 lệnh Redis, và gõ tới đâu ra kết quả tới đó
không cần chờ mạng. Danh bạ lên vài nghìn chỗ thì mới phải đổi sang tìm phía máy chủ.

**3. Trạng thái đề xuất tra lúc ĐỌC, không ghi lại vào route** (§10, §11). `route.stops` chỉ
giữ `proposalId`; duyệt hay từ chối chỉ đổi một dòng trong `place_proposals:index`. Nhờ vậy
duyệt 1 đề xuất là mọi lộ trình đang trỏ tới nó tự đổi theo — không phải quét toàn bộ lộ trình
của mọi người để sửa. Cũng là lý do **không cần migration** cho route cũ.
Đánh đổi: trang lộ trình có điểm đề xuất tốn thêm 1 lệnh Redis. Chỉ tốn khi thật sự có điểm
đề xuất — lộ trình thường vẫn đúng 1 lệnh như trước.

**4. Ở màn "Tạo lộ trình từ đây", điểm riêng được GIỮ TẠM trong bộ chọn** rồi ghi một lượt khi
bấm nút cuối — lúc đó chưa có lộ trình nào để gắn vào. Riêng **đề xuất địa điểm thì chưa cho
làm ở màn này**, vì đề xuất phải gắn với một lộ trình có thật; giao diện **nói thẳng** "Tạo lộ
trình xong, bấm + Thêm địa điểm là đề xuất được" thay vì giấu nút đi — giấu thì khách tưởng
CDP không cho đề xuất.

**Bẫy đã gặp:** `getPlaceTypeLabel` dùng trong thẻ đề xuất ở `/admin` mà quên import. Build và
lint đều SẠCH vì thẻ đó chỉ vẽ khi hàng chờ có mục — lỗi sẽ nổ đúng lúc anh có đề xuất đầu
tiên. Từ nay thêm component nào chỉ hiện theo điều kiện, phải dò lại mọi tên nó dùng.

## 2026-09-11 (chiều) — 3 quyết định từ lần anh tự dựng lộ trình

**1. Một chỗ được phép nằm nhiều lần trong cùng một lộ trình.** Trước đây `addPlacesToRoute`
và `addStopToRoute` bỏ qua chỗ đã có — im lặng, nên bấm xong tưởng nút hỏng. Nhưng "trưa về
khách sạn nghỉ, tối lại về ngủ" là chặng thật của chuyến đi. Bỏ chặn, và thay bằng **báo
trước** trong bộ chọn ("Đã có trong lộ trình · thêm lần nữa") để phân biệt với bấm nhầm.
Chỗ này an toàn sẵn: điểm dừng vốn nhận diện bằng VỊ TRÍ trong mảng, không bằng placeId, nên
xoá/đảo thứ tự không phải sửa gì thêm.

**2. Điểm riêng vào Google Maps bằng ĐỊA CHỈ, không bằng tên tự đặt.** Tên kiểu "Xuất phát tại
nhà", "Nhà Tuấn" là đặt cho mình đọc — gửi sang Google thì càng tra càng sai. Nên điểm riêng
có thêm ô địa chỉ (không bắt buộc), và:
- có địa chỉ → vào link bằng địa chỉ
- không có → **không vào link**, thà thiếu một chặng còn hơn dẫn người ta tới chỗ khác; trang
  lộ trình nói rõ đang thiếu mấy điểm như vậy

Kèm theo: mọi chuỗi gửi Google đều tự gắn "Tuyên Quang" nếu chưa có. "Winmart Hàng Bún" hay
"12 Trần Phú" gửi trần là Google đoán sang tỉnh khác.

**3. Thời lượng: lưu bằng phút, hiển thị bằng tiếng.** Một con số phút dễ cộng dồn cho timeline
sau này, nên không đổi cách lưu. Chỗ đổi là lúc viết ra: "Ở đây khoảng 4 tiếng". Và **hai loại
thời gian phải có hai câu khác hẳn nhau** — "Ở đây khoảng ..." (dừng lại) vs "Di chuyển khoảng
..." (đi đường). Câu cũ "Khoảng 240 phút" không nói nó là loại nào.
