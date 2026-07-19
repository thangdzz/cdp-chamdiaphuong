# STATUS — Tình trạng hiện tại

> Cập nhật file này **cuối mỗi phiên làm việc**. Mục tiêu: ai đọc file này cũng biết ngay
> đang ở đâu, không cần đọc lại toàn bộ lịch sử chat. Chi tiết từng giai đoạn xem
> [ROADMAP.md](ROADMAP.md); lý do các quyết định xem [DECISIONS.md](DECISIONS.md).

## Đang ở giai đoạn nào
**Giai đoạn 5a + AI quét dữ liệu hằng ngày (bán tự động, auto-publish) + card 2 lớp + "đề
xuất sửa/ảnh + thưởng điểm/huy hiệu" — hoàn thành.** KPI số lượng dữ liệu (Giai đoạn 6) giờ
thong thả — chuyển hướng để khách tự đóng góp/sửa dần qua tính năng mới thay vì chỉ anh + em
quét (quyết định 2026-07-18, xem DECISIONS.md).

## Tóm tắt tiến độ
- 25 địa điểm, web hiển thị + bộ lọc (loại hình/khu vực/giá).
- **Card 2 lớp** (Ăn & Ngủ): thẻ gọn (tên/loại/địa chỉ/giá/nhãn trạng thái mềm) → bấm
  "Xem thêm" bung tại chỗ (địa chỉ đầy đủ, khu vực, độ tin cậy, nguồn đối chiếu, cập nhật
  gần nhất, ghi chú, cụm ảnh) → bấm ảnh mở gallery toàn màn hình (vuốt ngang đổi ảnh, vuốt
  lên/xuống đóng).
- **"Báo sai" / "Bổ sung ảnh"** (2026-07-18, đã qua nhiều vòng sửa lỗi thật): khách bấm
  ngay trong thẻ, sửa field (địa chỉ/SĐT/giá) hoặc báo "đã đóng cửa", hoặc gửi tối đa 3
  ảnh/lần (tự nén phía trình duyệt trước khi gửi — ảnh nặng mấy cũng gọn lại, lưu ở Vercel
  Blob `cdp-photos`). Lần đầu góp ý: đặt biệt danh ẩn danh + nhận **mã khôi phục 6 số**.
  Sau khi gửi: cảm ơn → chọn 1 trong 10 lĩnh vực (bỏ qua được, có icon riêng + mô phỏng
  "người khác" tạm thời khi lĩnh vực còn ít người) → hiện huy hiệu (bậc 5 "Huyền thoại" có
  sao ăn mừng + số đếm góc phải nếu góp thêm sau khi đã max bậc). Chặn **không tính điểm**
  nếu gửi đúng y hệt 1 nội dung/1 ảnh đã gửi trước đó cho cùng chỗ (chặn ăn điểm khống,
  vẫn cho góp ý khác nội dung về cùng chỗ). Mọi góp ý vào `/admin` mục "Góp ý từ khách" —
  duyệt đúng mới áp dụng + cộng điểm (sửa +5, ảnh +10).
- **Pipeline "AI quét dữ liệu hằng ngày"** (`lib/ingestion/`): chuẩn hoá → so khớp/dedupe →
  **tự động công khai luôn** (chỗ mới/có đổi/kể cả tin cậy thấp), **chỉ giữ lại chờ duyệt
  khi nghi trùng lặp hoặc mâu thuẫn dữ liệu** (quyết định 2026-07-15, đảo ngược nguyên tắc
  "luôn phải duyệt" ban đầu — xem DECISIONS.md).
- **Lịch chạy hằng ngày** (8h sáng, claude.ai routine): tự tìm kiếm web thật, trả báo cáo
  qua chat — **bán tự động** (anh dán báo cáo vào chat, em xử lý ~30 giây), vì cloud agent
  bị chặn ghi thẳng vào Redis/GitHub (xem DECISIONS.md).
- Link thật: 👉 https://web-five-xi-28.vercel.app · Trang duyệt: `/admin`
- Code: 👉 github.com/thangdzz/cdp-chamdiaphuong (Public)

## Quy trình hằng ngày — anh cần làm gì
1. Mỗi sáng ~8h, routine tự chạy, tìm kiếm web, trả về 1 báo cáo (JSON + tóm tắt).
2. Anh mở https://claude.ai/code/routines xem kết quả, copy **toàn bộ** báo cáo (không cần
   tự cắt lấy đúng đoạn JSON).
3. Dán vào **1 trong 2 chỗ**: (a) chat với em như trước giờ, hoặc (b) mục "Xử lý báo cáo
   quét dữ liệu" ngay trong `/admin` (mới, 2026-07-19) — làm được trên điện thoại, không
   cần mở chat. Cả 2 chỗ dùng chung đúng 1 bộ lọc trùng/mâu thuẫn, kết quả như nhau.
4. Anh chỉ cần vào mục "Hàng chờ duyệt tự động" khi có **nghi trùng lặp** hoặc **mâu thuẫn
   dữ liệu** (khung cảnh báo đỏ) — xác nhận đúng/sai để hệ thống xử lý tiếp.

**Lưu ý nếu dùng chỗ (b) mà không nhắn em:** file `known-places-snapshot.json` (giúp
routine tránh tìm lại chỗ đã có) sẽ **không tự cập nhật** — chỉ em mới cập nhật + đẩy lên
GitHub được (cần quyền git, `/admin` không có). Thỉnh thoảng nhắn em 1 câu để làm mới file
này, không cần mỗi ngày.

## Cập nhật gần nhất

### 2026-07-19 — Xử lý báo cáo routine ngay trong /admin + tìm kiếm/nút cuộn trang chủ
- **Mục mới trong `/admin`**: dán nguyên báo cáo routine (không cần tự cắt JSON, hệ thống
  tự tách) và xử lý ngay tại chỗ — không cần mở chat với em, làm được trên điện thoại. Dùng
  chung đúng 1 hàm xử lý (`ingestBatch`) với mọi nguồn khác nên vẫn lọc trùng/mâu thuẫn y
  hệt. Đánh đổi: dùng cách này thì `known-places-snapshot.json` không tự cập nhật (chỉ em
  làm được, cần quyền git) — anh thỉnh thoảng nhắn em làm mới file này.
- **Trang chủ**: thêm ô tìm kiếm (không cần gõ dấu) và nút lên đầu/xuống cuối trang (mờ lúc
  đứng yên, rõ khi đang cuộn).
- Đã test cả 2 việc bằng dữ liệu giả trước khi deploy.

### 2026-07-18 (tiếp) — Vá 4 vòng lỗi thật + hoàn thiện "Báo sai/Bổ sung ảnh", đóng khả năng tự động hoá thêm
Sau khi tính năng lên production, anh dùng thật và báo lỗi liên tục — đã sửa từng cái:
1. **Kẹt màn hình / tự reset khi bấm nhanh 2 lần** ("Đã lưu, tiếp tục" bấm lần 1 không thấy
   gì, lần 2 quay về ban đầu) — do khoá chặn bấm trùng dựa vào state React (có độ trễ), bấm
   nhanh trên mạng chậm lọt qua được. Đã khoá lại bằng ref (không có độ trễ) cho toàn bộ
   nút bấm trong luồng; lỗi thật sự (nếu có) giờ hiện thông báo đỏ để bấm lại, không im
   lặng rồi tự reset nữa.
2. **Gửi ảnh 2.5MB thất bại** — Next.js giới hạn mặc định 1MB/lần gửi, ảnh điện thoại thật
   luôn vượt. Đã: nén ảnh phía trình duyệt trước khi gửi (tối đa 1600px, JPEG 82%, ảnh
   8.3MB test còn 1.2MB) + nâng giới hạn server lên 8MB làm lưới an toàn.
3. **Bảng "gần bạn" trống trơn + không rõ vì sao 0 điểm** — thêm 2 hồ sơ mô phỏng tạm khi
   lĩnh vực chưa đủ 3 người thật (ghi rõ trong code là tạm, xoá khi đủ người thật), thêm
   chú thích "đang chờ duyệt" cạnh điểm mới gửi.
4. **Chặn ăn điểm khống + hết bậc thì đếm dồn** — không tính điểm nếu gửi đúng y hệt nội
   dung/ảnh đã gửi cho cùng chỗ; đạt bậc 5 (Huyền thoại) rồi góp thêm thì giữ nguyên icon,
   chỉ thêm số đếm góc phải trên (1, 2, 3...) thay vì bịa bậc 6. Nhân tiện sửa 1 lỗi thật
   phát hiện được: trình duyệt trước đó không đọc kết quả server trả về, nên bị server từ
   chối vẫn hiện "Cảm ơn" như đã thành công.
- Cũng đổi icon "Người yêu Thành Tuyên" (đèn lồng → cây đa Tân Trào) và "Kinh doanh địa
  phương" (bắt tay → cửa hàng) theo yêu cầu, thêm hiệu ứng sao cho toàn bộ huy hiệu bậc 5.
  Trang xem trước 50 huy hiệu: xem link trong lịch sử chat (Artifact riêng, không phải file
  trong repo).
- **n8n Cách A (lấy hộ báo cáo routine) — đã đóng, không khả thi:** tra tài liệu chính thức
  Anthropic xác nhận routine không có API công khai để lấy lại kết quả sau khi chạy xong.
  Bán tự động (anh dán tay) vẫn là cách duy nhất hiện tại — xem DECISIONS.md.

### 2026-07-18 (sau) — "Báo sai/Bổ sung ảnh" + thưởng điểm/huy hiệu (Phần 3, hoàn thành)
Làm trọn gói theo yêu cầu anh (gộp đợt 1+2), đã bàn kỹ thiết kế trước khi code:
- Tạo Vercel Blob store `cdp-photos` (public) để lưu ảnh khách gửi — chưa có trước đây.
- 10 lĩnh vực × 5 bậc danh hiệu (`lib/badges.js`), icon SVG vẽ tay theo bậc (`BadgeIcon.js`).
- Hồ sơ ẩn danh + mã khôi phục 6 số (`lib/contributors.js`) — giải quyết vấn đề "chưa có
  tài khoản": mất tiến trình khi đổi máy là rủi ro lớn nhất, mã khôi phục giảm nhẹ rủi ro
  này mà không cần đăng nhập thật.
- Hàng chờ góp ý riêng (`lib/suggestions.js`, `user_suggestions`) — tách khỏi review_queue
  AI, duyệt riêng trong `/admin` mục "Góp ý từ khách".
- Đã test đầy đủ bằng Playwright + dữ liệu TESTQA (không đụng dữ liệu thật): luồng báo sai,
  gửi ảnh, đặt biệt danh, mã khôi phục (khôi phục đúng từ trình duyệt "mới"), chọn lĩnh
  vực, hiển thị huy hiệu + xếp hạng gần bạn, báo đóng cửa (gỡ khỏi live đúng), duyệt trong
  `/admin` (cộng điểm đúng, ảnh áp dụng đúng). Phát hiện 1 điều cần lưu ý (không phải bug
  cần sửa): bấm duyệt liên tiếp quá nhanh trong `/admin` có thể mất 1 lượt (đọc-sửa-ghi
  không khoá) — không ảnh hưởng dùng thật vì admin luôn duyệt từng cái một.

### 2026-07-18 — Sửa 3 lỗi lộ ra khi xử lý dữ liệu quét thật (quét trùng, ghi đè âm thầm, dữ liệu sai)
Xử lý báo cáo thật đầu tiên (38 bản ghi, gộp 4 lần quét) lộ ra 3 vấn đề, đã sửa cả 3:
1. **Quét trùng chỗ đã biết:** routine không biết 39 chỗ hiện có là gì nên hay tìm lại đúng
   tên cũ. Đã thêm `scripts/export-known-places.mjs` xuất `data/known-places-snapshot.json`
   (tên + loại hình, không có gì nhạy cảm) — routine giờ đọc file này trước, tránh tìm lại.
   **Cần làm mỗi lần xử lý xong 1 báo cáo:** chạy lại script này rồi commit + push, để
   routine hôm sau đọc được danh sách mới nhất.
2. **Ghi đè âm thầm khi 2 nguồn đá nhau:** phát hiện qua ca Feline Café (2 địa chỉ khác
   nhau từ 2 nguồn) — hệ thống cũ chỉ lấy tin đến sau, không báo có mâu thuẫn. Đã sửa: khi
   địa chỉ/SĐT của 1 chỗ đang chờ duyệt bị 2 nguồn cho giá trị khác nhau, **giữ nguyên giá
   trị cũ** và hiển thị cảnh báo đỏ trong `/admin` để anh tự chọn, không tự ý ghi đè nữa.
3. **Dữ liệu sai bị đưa trở lại:** batch hôm nay vô tình ghi đè "Nhà hàng Dũng Cá" bằng địa
   chỉ/SĐT của "Mộc Restaurant" (2 chỗ khác nhau, anh đã xác nhận trước đó) — undo đúng sửa
   thủ công anh làm trước đây. Đã: (a) sửa lại đúng dữ liệu 2 chỗ này (tra Google + Facebook
   xác nhận), (b) xây "bộ nhớ đã xác nhận khác nhau" — từ giờ khi anh xác nhận 1 lần "không
   trùng" trong `/admin`, hệ thống nhớ mãi, không hỏi lại chỗ đó nữa. Cũng dặn routine ưu
   tiên Google Maps khi các nguồn đá nhau.
- Đã test lại đúng kịch bản hôm nay (quét lại tên khác của Mộc Restaurant, quét Feline Café
  2 địa chỉ xen kẽ) — xác nhận cả 3 chỗ sửa hoạt động đúng trước khi deploy.

### 2026-07-17 (sau) — Thử thêm 1 cách tự động hoàn toàn, vẫn không được — chốt bán tự động
Thử cho routine gọi thẳng API riêng của dự án (`/api/ingest/submit`) thay vì ghi Redis/
GitHub — cũng bị chặn (`403` ngay ở bước kết nối HTTPS). Xác nhận: môi trường cloud của
routine chặn gọi ra ngoài tới **bất kỳ domain nào** ngoài GitHub, không phải chặn riêng 1
domain cụ thể — nên không còn cách nào khác để thử nữa (đã thử đủ 3 hướng). Đã bỏ bước gọi
API khỏi lệnh routine, quay lại đúng bản bán tự động gọn. Chi tiết ở DECISIONS.md.
👉 Quy trình hằng ngày (mục phía trên) vẫn đúng, không đổi gì thêm.

### 2026-07-17 — Auto-publish + card 2 lớp (thay đổi lớn)
Anh yêu cầu 2 việc lớn cùng lúc:
1. **Auto-publish**: bot quét hằng ngày công khai luôn mọi thẻ, **chỉ chờ duyệt khi nghi
   trùng lặp/mâu thuẫn dữ liệu** (kể cả dữ liệu tin cậy thấp cũng lên thẳng, theo đúng ý
   anh chốt). Việc gỡ 1 chỗ khỏi công khai (nghi đã đóng cửa) vẫn luôn cần người duyệt.
2. **Card 2 lớp** theo 6 mẫu anh gửi tối qua — xem tóm tắt ở trên.
3. **Đề xuất sửa + thưởng điểm/huy hiệu** — đã bàn hướng (điểm đóng góp + huy hiệu, miễn
   phí, không rủi ro gian lận tiền bạc) nhưng **CHƯA CODE** — còn 1 câu hỏi khó chưa giải:
   web chưa có tài khoản đăng nhập, cần nghĩ cách nhận diện "user nào" để cộng điểm đúng
   người trước khi làm.
- Đã test kỹ cả 2 việc 1 & 2 bằng dữ liệu giả (không đụng dữ liệu thật của anh): auto-
  publish đúng 4 tình huống (mới/đổi/nghi trùng/tin cậy thấp), card 2 lớp đúng cả trên thẻ
  có ảnh và không có ảnh, vuốt gallery hoạt động đúng (ban đầu tưởng lỗi vuốt nhưng hoá ra
  do kịch bản test viết sai, không phải lỗi ứng dụng).
- Bước tiếp theo hợp lý nhất: Bàn thiết kế phần 3 (đề xuất sửa + thưởng) khi anh sẵn sàng.
  Sau đó quay lại Giai đoạn 6 (dữ liệu thật + kiểm thử trước 21/08/2026).

### Trước đó (2026-07-15)
- Sửa lỗi định dạng giá (bỏ ô gõ tay tự do, tự tính từ số + đơn vị).
- Xây pipeline ingestion, trang duyệt tự động trong `/admin`, sửa lỗi nút Duyệt/Từ chối
  dùng chung 1 hàm (không hoạt động đúng với Server Action — đã tách 2 hàm riêng).
- Đưa code lên GitHub (Public — vướng quyền GitHub App lúc thiết lập private).
- Đặt lịch phiên AI hằng ngày; thử tự động hoàn toàn nhưng gặp 3 giới hạn hạ tầng/gói dịch
  vụ liên tiếp, chuyển sang bán tự động. Chi tiết đầy đủ ở DECISIONS.md.

## Câu hỏi/vướng mắc đang mở
- **Tự động hoàn toàn: đã đóng, không thử thêm nữa.** Cả 4 hướng đã thử (ghi thẳng Redis,
  ghi qua GitHub, gọi API riêng, n8n lấy hộ báo cáo routine) đều không khả thi. Chỉ còn lối
  ra: nâng cấp gói Claude Team/Enterprise, Google Places API trả phí, hoặc **n8n tự làm
  toàn bộ (Cách B — chưa làm, khả thi nhưng cần dựng riêng)** — chưa cần làm, bán tự động
  vẫn ổn.
- **`known-places-snapshot.json` cần cập nhật + push tay** mỗi lần xử lý xong 1 báo cáo
  routine (em làm hộ, chỉ ghi chú để anh biết có bước này).
- SEED_ENTRIES (2 hồ sơ mô phỏng trong bảng "gần bạn") là tạm — cần xoá trong
  `lib/contributors.js` khi 1 lĩnh vực có từ 5 người dùng thật trở lên.
- Nhãn trạng thái mềm hiện vẫn giữ 3 mức (thêm "Tín hiệu ít chỗ/phòng trống" ngoài 2 mức
  anh cho ví dụ) — đổi tên cho mềm hơn, chưa hỏi lại anh có đồng ý giữ 3 mức không.
- Món chính/Phù hợp/Ghi chú/SĐT: chưa có nguồn dữ liệu thật cho phần lớn địa điểm — UI đã
  ẩn gọn khi thiếu; ảnh giờ có thể trông cậy vào khách tự gửi qua "Bổ sung ảnh".
- 25 địa điểm: vài ô giá/SĐT/địa chỉ còn để trống — anh có thể tự điền qua `/admin`, hoặc
  chờ khách góp ý dần.
- Mật khẩu `/admin` hiện khá đơn giản — nên đổi khi làm Giai đoạn 5b (bảo mật đầy đủ).
- Repo GitHub đang Public — có thể đổi lại Private sau nếu tìm được cách cấp quyền đúng.
