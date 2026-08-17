# STATUS — Tình trạng hiện tại

> Cập nhật file này **cuối mỗi phiên làm việc**. Mục tiêu: ai đọc file này cũng biết ngay
> đang ở đâu, không cần đọc lại toàn bộ lịch sử chat. Chi tiết từng giai đoạn xem
> [ROADMAP.md](ROADMAP.md); lý do các quyết định xem [DECISIONS.md](DECISIONS.md).

## Đang ở giai đoạn nào
Đang làm hướng mới "cuốn sổ địa phương" ([NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md)).
**Chặng 1, 2, 3 đã code xong.** Chặng 1–2 đã lên web thật (`vercel --prod`, xem nhắc nhở ở
mục "Quy trình hằng ngày" — push GitHub KHÔNG tự deploy). **Chặng 3 mới code xong, chưa
push/deploy** — xem chi tiết ở mục 2026-08-15 (mới nhất) bên dưới, kèm danh sách anh cần
bấm thử.

**Spec cho cả 8 chặng đã viết xong** — bảng tra ở đầu phần "HƯỚNG MỚI" trong
[ROADMAP.md](ROADMAP.md). Chặng 4–6 sẵn sàng code; **Chặng 7–8 là bản dự kiến**, phải đọc lại
và sửa trước khi code.

Bước tiếp theo: anh bấm thử Chặng 3 theo danh sách cuối tin nhắn/mục 2026-08-15 (mới nhất),
quyết có deploy lên web thật không, rồi quyết có làm Chặng 4 không.

Phần đã chạy được từ trước vẫn nguyên: Giai đoạn 5a + AI quét dữ liệu hằng ngày (tự động
hoàn toàn từ 2026-08-04, auto-publish) + card 2 lớp + "đề xuất sửa/ảnh + thưởng điểm/huy
hiệu". KPI số lượng dữ liệu (Giai đoạn 6) thong thả — khách tự đóng góp/sửa dần thay vì chỉ
anh + em quét (quyết định 2026-07-18).

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
- **Lịch chạy hằng ngày** (8h sáng, claude.ai routine): tự tìm kiếm web thật, tự ghi thẳng
  lên web qua GitHub Action — **tự động hoàn toàn từ 2026-08-04**, anh không cần copy-paste
  gì nữa, chỉ thỉnh thoảng vào `/admin` khi có mục chờ duyệt do nghi trùng/mâu thuẫn (xem
  DECISIONS.md).
- Link thật: 👉 https://web-five-xi-28.vercel.app · Trang duyệt: `/admin`
- Code: 👉 github.com/thangdzz/cdp-chamdiaphuong (Public)

## Quy trình hằng ngày — anh cần làm gì (từ 2026-08-04: gần như không cần làm gì)
1. Mỗi sáng ~8h, routine tự chạy, tự tìm kiếm web, **tự ghi thẳng lên web** — không còn phải
   copy-paste báo cáo vào chat hay vào `/admin` nữa (cả 2 chỗ dán tay cũ vẫn còn, vẫn dùng
   được nếu cần xử lý thủ công 1 báo cáo nào đó, nhưng không còn là bước bắt buộc).
2. Anh chỉ cần vào `/admin` mục "Hàng chờ duyệt tự động" khi có **nghi trùng lặp** hoặc
   **mâu thuẫn dữ liệu** (khung cảnh báo đỏ) — xác nhận đúng/sai để hệ thống xử lý tiếp.
   Routine cũng tự gửi thông báo đẩy (push notification) ngắn sau mỗi lần chạy, báo có chỗ
   mới hay không.

**Lưu ý còn lại (chưa tự động hoá — không ảnh hưởng việc đăng dữ liệu):** file
`known-places-snapshot.json` (giúp routine tránh tìm lại chỗ đã có, chỉ để đỡ tốn công tìm
kiếm, KHÔNG phải để chống đăng trùng — chống trùng đã nằm ở tầng ghi dữ liệu) vẫn cần em cập
nhật + đẩy lên GitHub thủ công, không tự làm mới theo thời gian thực. Thỉnh thoảng nhắn em 1
câu để làm mới file này, không cần mỗi ngày — không làm cũng không sao, chỉ là routine có
thể tốn thêm chút công tìm kiếm không cần thiết.

## Cập nhật gần nhất

### 2026-08-11 — Chốt hướng đi mới "cuốn sổ địa phương" (bàn thiết kế, chưa code)
Cả phiên là bàn hướng, không động vào code. Kết quả: tài liệu mới
[NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md) + 9 quyết định ghi vào DECISIONS.md.

**Tóm tắt những gì đã chốt:**
- CDP là **cuốn sổ địa chỉ ăn/ngủ/chơi/đi lại**, không còn là công cụ tra cứu mùa lễ hội.
  Lễ hội chỉ là điểm khởi đầu thuận lợi, **mốc 21/08 không còn là hạn chót cứng**.
- Nội dung chia 3 loại: **chọn sẵn** (không duyệt, hiện theo đồng thuận) · **note công khai
  dạng chữ** (phải duyệt) · **note cá nhân** (không kiểm duyệt, chỉ chủ nhân thấy).
- Nguyên tắc nhập liệu: **chọn là mặc định, gõ là ngoại lệ**. Câu hỏi do hệ thống đặt, mỗi
  lần hỏi 1 câu, luôn có nút "Không rõ".
- **Không bao giờ** làm đánh giá sao / bình luận / diễn đàn — chặn bằng cấu trúc chứ không
  bằng nội quy.
- Phiếu cũ nhẹ dần theo thời gian → **dữ liệu tự dọn rác**, không cần ai đi xoá.
- **Đổi cách tính điểm:** bấm chọn +1 chỉ khi trùng đồng thuận (không phải mỗi lượt bấm),
  báo đóng cửa +15 là cao nhất, không bao giờ trừ điểm.
- Note cá nhân đi 3 bước: lưu máy khách trước → có 3 note mới mời để lại số điện thoại →
  đổi máy đăng nhập lại.
- Doanh nghiệp claim: **chưa làm**, và khi làm phải có xác minh OTP.

**Cũng trong phiên này:** đã viết xong roadmap hướng mới — 8 chặng, ghi ở cuối
[ROADMAP.md](ROADMAP.md) (phần "HƯỚNG MỚI"). Giai đoạn 0–6 cũ giữ nguyên làm lịch sử.

**✅ Chặng 0 xong luôn trong phiên này** — đã cập nhật [PRD.md](PRD.md):
- §1: thêm 3 thứ CDP làm được mà Google Maps không làm
- §2: thêm nhóm "người đóng góp dữ liệu" (người địa phương viết để gửi cho người quen)
- §3: phạm vi từ 2 nhóm (Ăn+Ngủ) → **đủ 4 nhóm** (Ăn·Chơi·Ngủ·Đi lại)
- §3.1: thêm 4 tính năng phải có mới (mục 9–12), sửa mục 6 (quy trình duyệt 3 mức)
- §4: **bỏ vai trò hạn chót của 21/08**; mốc còn lại là Chặng 4 xong trước ~15/09
- §6: tách "không bao giờ làm" (đánh giá/bình luận/diễn đàn) và "chưa làm bây giờ"; đưa
  tài khoản người dùng vào phạm vi (Chặng 7, đăng nhập bằng số điện thoại)

**Cũng đã ghi vào [CLAUDE.md](../CLAUDE.md):** từ nay Cowork chỉ lo bàn hướng + tài liệu,
code làm bên Antigravity.

**Cũng trong phiên này — thêm 2 tài liệu để bàn giao sang Antigravity:**
- [ARCHITECTURE.md](ARCHITECTURE.md) — bản đồ hệ thống: 9 key Redis, bản đồ file, 3 luồng
  dữ liệu, và mục "những chỗ cần cẩn thận" (loại địa điểm viết cứng ở 6 file · nhãn "còn
  chỗ" không dựa trên dữ liệu thật · ghi Redis không có khoá · mảng phình vô hạn).
  Đã đối chiếu với code thật: 35/35 đường dẫn đúng, tên biến môi trường đúng.
- [SPEC-chang-1.md](SPEC-chang-1.md) — mô tả Chặng 1 đủ chi tiết để code: khách thấy gì,
  key `place_checkins` mới, 6 quy tắc nghiệp vụ, 6 bước bấm thử.

**Bước tiếp theo hợp lý nhất (lúc đó):** code Chặng 1 bên Antigravity — **đã làm xong, xem
mục 2026-08-15 bên trên trong "Đang ở giai đoạn nào" và chi tiết ngay dưới đây.**

### 2026-08-15 (mới nhất) — Code xong Chặng 3: thêm "Chơi" và "Đi lại"

Đọc `CLAUDE.md` → `ARCHITECTURE.md` → `SPEC-chang-3.md`. SPEC đã đủ chi tiết (liệt kê sẵn cả
6 file + số dòng cần sửa), nên làm luôn không cần vòng chốt câu hỏi mở như Chặng 1.

**Đã làm:**
- File mới: `lib/placeTypes.js` — nguồn duy nhất cho 4 loại (`an`/`choi`/`ngu`/`dilai`),
  `assertValidPlaceType()` **ném lỗi rõ ràng** thay vì âm thầm quy về `"ngu"` như code cũ
  (đúng cảnh báo nguy hiểm nhất trong SPEC §2).
- Sửa đúng 6 file SPEC liệt kê (`placeForm.js`, `normalize.js`, `schema.js`, `occupancy.js`
  gián tiếp qua cách gọi, `admin/page.js` × 3 form, `PlaceExplorer.js` × 3 chỗ) + 1 file phát
  sinh khi rà lại không có trong danh sách gốc: `TYPE_LABEL` trong `PlaceExplorer.js` (nếu bỏ
  sót, thẻ Chơi/Đi lại sẽ hiện nhãn loại rỗng).
- Thêm vào `lib/questions.js`: 4 câu cho Chơi, 4 câu cho Đi lại (dùng chung 4 câu cũ) — sửa
  luôn 1 chỗ đặt tên lệch giữa comment cũ (`"di-lai"` có gạch ngang) và giá trị thật dùng
  (`"dilai"` không gạch ngang) để khỏi nhầm sau này.
- Nhãn "còn chỗ" giờ **chỉ hiện cho Ăn/Ngủ** (SPEC §5) — Chơi/Đi lại không hiện nhãn này
  nhưng vẫn có nút "Hôm nay vẫn mở" (áp dụng cả 4 loại, không đổi).
- **1 lỗ hổng thật phát hiện khi tự kiểm thử:** nếu chỉ ném lỗi ở `normalize.js` mà không xử
  lý gì thêm, **1 bản ghi loại sai trong báo cáo routine sẽ làm hỏng cả lô quét hằng ngày**
  (routine gửi ~9 chỗ/lần, tất cả sẽ bị chặn vì 1 chỗ hỏng). Sửa: `ingestBatch.js` bắt riêng
  lỗi này, bỏ qua đúng bản ghi hỏng, các chỗ khác trong lô vẫn lên web bình thường (đếm ở
  `summary.skippedInvalidType`).
- Kiểm thử: script gọi thẳng `placeFromFormData` (từ chối type sai) + `ingestBatch` (lô 3 bản
  ghi, 1 sai loại → đúng 2 lên web, 1 bị bỏ qua, không hỏng lô) + Playwright cho giao diện
  thật (4 nút lọc đúng thứ tự Ăn·Chơi·Ngủ·Đi lại, chỗ Chơi test lọc đúng nhóm, không hiện
  nhãn còn chỗ, vẫn có nút checkin, câu hỏi hiện ra đúng bộ của Chơi không lẫn Ăn/Ngủ). Dữ
  liệu test (kể cả 1 chỗ giả thêm tạm vào `places:live` thật để test giao diện) đã dọn sạch
  ngay sau khi xong.
- `npm run build` qua trót lọt, lint sạch (trừ 1 lỗi có sẵn từ trước, không liên quan).

**Chưa làm — 2 việc trong SPEC §6, cần anh quyết trước khi làm tiếp:**
1. **Mở rộng routine quét hằng ngày sang Chơi/Đi lại** — routine hiện chỉ tìm Ăn/Ngủ, cần
   sửa lệnh (prompt) của routine trên claude.ai. Đây là việc động vào lịch chạy tự động đang
   sống, nên chưa tự làm — cần anh xác nhận trước.
2. **`AREA_PRESETS` trong `schema.js`** (SPEC §6.2) — mới có 5 phường, có `"Hà Giang 1"` lạc
   chỗ. Cần đúng tên phường thật của TP Tuyên Quang (cũ) để sửa đúng — em không có dữ liệu
   này, cần anh cung cấp hoặc xác nhận.

**Chưa deploy lên web thật** — code mới có ở máy + sắp push GitHub, **chưa chạy `vercel
--prod`**.

**Bước tiếp theo hợp lý nhất:** anh xem danh sách bấm thử bên dưới (tin nhắn cuối), quyết có
deploy không, rồi quyết 2 việc còn treo ở trên trước khi bàn Chặng 4.

### 2026-08-15 (giữa) — Code xong Chặng 2: câu hỏi bấm chọn + đồng thuận

Chặng nặng nhất tính đến giờ — 3 key Redis mới, tính đồng thuận có trọng số theo tuổi phiếu,
trả điểm hồi tố. Đọc `CLAUDE.md` → `ARCHITECTURE.md` → `SPEC-chang-2.md`, trình kế hoạch rồi
anh duyệt code luôn (không cần sửa gì so với SPEC).

**Đã làm:**
- File mới: `lib/questions.js` (11 câu hỏi), `lib/answers.js` (ghi phiếu, tính đồng thuận,
  trả điểm — file lõi), `lib/pointsCap.js` (trần chung 30 điểm/ngày), `app/answerActions.js`,
  `app/QuestionPrompt.js` (khối hỏi), `app/PlaceFacts.js` (khối hiện kết quả).
- Sửa: `app/page.js` (thêm 1 `HGETALL` đọc đồng thuận), `PlaceExplorer.js` (chèn 2 khối
  trên), `admin/actions.js` (xoá chỗ dọn thêm dữ liệu Chặng 2), **`checkinActions.js`**
  (thêm gate trần chung 30đ/ngày — SPEC yêu cầu áp trần này lên cả điểm Chặng 1, không chỉ
  Chặng 2, dù không nằm trong danh sách "file sửa" gốc của SPEC).
- **3 lỗi thật phát hiện được khi tự kiểm thử** (không phải chỉ đọc code):
  1. Người đầu tiên bấm được cộng điểm ngay — sai, phải đợi đủ 2 phiếu trùng mới cộng. Sửa:
     tách rõ "đồng thuận để hiển thị" (weak, có từ 1 phiếu) khỏi "đồng thuận để trả điểm"
     (bắt buộc ≥2 phiếu).
  2. Bấm lại đúng đáp án cũ (đổi ý nhưng chọn y hệt) vẫn được cộng điểm thêm — lỗ hổng có thể
     bị khai thác để cày điểm. Sửa: chỉ reset trạng thái "đã trả điểm" khi đáp án thực sự đổi.
  3. `submitAnswer` không kiểm tra khuôn dạng `answer` (mảng hay chuỗi, đúng lựa chọn hợp lệ
     không) — Server Action luôn gọi được trực tiếp bất kể giao diện, đây là lỗ hổng thật.
     Thêm bước kiểm tra đầu vào.
- Kiểm thử: gọi thẳng `lib/answers.js` qua script (đồng thuận, hoà phiếu, trần 5 câu/ngày,
  trần chung 30đ/ngày, câu nhiều đáp án) + Playwright thật cho giao diện (hỏi 1 câu, đổi câu
  sau khi trả lời, "Không rõ", chọn nhiều + "Xong"). Phát hiện 1 điều cần lưu ý (không phải
  lỗi ứng dụng): React StrictMode ở môi trường dev gọi effect trùng 2 lần, làm kịch bản test
  tự động bấm quá nhanh bị nhầm — không ảnh hưởng bản production thật (không có StrictMode).
- Dữ liệu test đã dọn sạch khỏi Redis thật (kể cả hồ sơ ẩn danh tạo ra trong lúc test).
- `npm run build` qua trót lọt, lint sạch (trừ 1 lỗi có sẵn từ trước, không liên quan).

**Chưa deploy lên web thật** — nhắc lại: trang này **không tự deploy khi push GitHub**, phải
chạy `vercel --prod` thủ công (phát hiện ở phiên Chặng 1). Sẽ deploy sau khi anh xác nhận
push code lên GitHub trước.

**Bước tiếp theo hợp lý nhất:** anh bấm thử trên máy/web thật, xem câu hỏi + kết quả hiện
đúng ý không, rồi quyết có làm Chặng 3 (Chơi + Đi lại) không.

### 2026-08-15 (sau) — Viết spec cho cả 7 chặng còn lại
Anh yêu cầu viết trước đủ spec để Claude code liền mạch, lỗi thì sửa sau (thay vì viết từng
chặng ngay trước khi code như dự định ban đầu).

- **Chặng 2** — câu hỏi bấm chọn: 11 nhóm câu hỏi, luật đồng thuận, trọng số phiếu nhẹ dần
  theo tuổi (tự dọn rác), cách trả điểm hồi tố khi đủ đồng thuận.
- **Chặng 3** — Chơi + Đi lại: liệt kê đủ 6 file kèm số dòng, cảnh báo 2 dòng "nếu không
  phải Ăn thì là Ngủ" sẽ âm thầm làm hỏng dữ liệu; đề xuất gom vào `lib/placeTypes.js`.
- **Chặng 4** — sổ chia sẻ: cấu trúc sổ, slug 8 ký tự không gây nhầm, "lưu sổ này" là mắt
  xích lan truyền, 3 con số cần đo trong tuần lễ hội, nhắc thẻ Open Graph để link dán Zalo
  hiện đẹp.
- **Chặng 5** — ghi chú công khai: 5 lớp lọc cụ thể, câu hỏi cho AI ở lớp 3, cơ chế "gõ hôm
  nay thành lựa chọn ngày mai" cho câu hỏi món ăn.
- **Chặng 6** — ghi chú riêng: chỉ localStorage, **không có key Redis nào**, nút "chia sẻ cho
  mọi người" làm cầu nối sang Chặng 5.
- **Chặng 7–8** — đánh dấu rõ là **bản dự kiến**. Chặng 7 còn một việc chưa quyết: **gửi OTP
  bằng kênh nào** (Zalo ZNS / SMS brandname / email) — chỗ duy nhất trong dự án phải trả tiền
  cho bên thứ ba, cần tra giá tại thời điểm làm.

Đã kiểm tra chéo: tên key Redis không trùng nhau, và **chi phí đọc trang chủ không tăng theo
số địa điểm** ở bất kỳ chặng nào (2 → 3 → 4 → 5 lệnh — bảng trong ROADMAP).

### 2026-08-15 — Code xong Chặng 1: nút "Tôi vừa đến, vẫn mở"

Trình kế hoạch 2 vòng trước khi code (đúng CLAUDE.md quy tắc 1) — anh sửa 1 chỗ quan trọng ở
vòng 2: bản nháp đầu định lưu mỗi lượt xác nhận theo **từng chỗ** (1 sorted set/chỗ), anh
chỉ ra điều đó khiến trang chủ phải gọi Redis N lần/lượt xem (N = số chỗ) — tốn hạn mức gói
Upstash free (500K lệnh/tháng) khi lên ~100 chỗ ở Chặng 3. Đổi sang **1 hash duy nhất**
(`place_checkins:latest`, field = mã chỗ) — đọc lần xác nhận gần nhất của **mọi** chỗ chỉ
tốn đúng 1 lệnh Redis, bất kể bao nhiêu chỗ. Chi tiết kỹ thuật + lý do đầy đủ đã ghi vào
[ARCHITECTURE.md](ARCHITECTURE.md) §2.

**Đã làm:**
- File mới: `lib/checkins.js` (3 lệnh Redis nguyên tử: khoá 24h, ghi/đọc hash, đếm điểm
  ngày — đúng thứ tự anh yêu cầu: khoá trước, tính điểm sau, dừng ngay nếu khoá thất bại),
  `app/checkinActions.js` (Server Action mỏng), `app/CheckinButton.js` (nút, tự đọc/tạo hồ
  sơ ẩn danh qua key `cdp_contributor` dùng chung với `ContributionPanel.js`).
- Sửa: `app/page.js` (đọc thêm `place_checkins:latest`, gắn vào từng chỗ), `PlaceExplorer.js`
  (dòng xác nhận mới xếp trên, nhãn "còn chỗ" cũ làm nhạt xuống dưới; dòng mới đổi **ngay**
  khi bấm, không chờ tải lại trang), `admin/actions.js` (xoá chỗ thì dọn luôn field tương
  ứng trong hash, theo ý anh).
- **Đã kiểm thử thật bằng Playwright** trên dev server (không phải chỉ đọc code): bấm nút →
  đổi trạng thái + dòng trên thẻ đổi ngay + hiện +1 điểm; tải lại trang vẫn giữ đúng trạng
  thái; người thứ hai (trình duyệt khác) bấm được, không bị chặn bởi người đầu; bấm chỗ thứ
  4 trong ngày vẫn ghi nhận nhưng không cộng điểm (đúng trần 3 điểm/ngày); chỗ chưa ai xác
  nhận không hiện dòng nào. Cũng soi thẳng Redis xác nhận: khoá 24h và bộ đếm điểm đều tự
  hết hạn đúng như thiết kế (không sống vĩnh viễn), hash chỉ có đúng 1 field/chỗ dù bấm
  bao nhiêu lần. Dữ liệu test đã dọn sạch khỏi Redis thật ngay sau khi kiểm chứng xong.
- `npm run build` qua trót lọt. 1 lỗi lint có sẵn từ trước (không liên quan Chặng 1, đã xác
  nhận bằng git stash) — không đụng vào, đúng nguyên tắc không sửa phần không liên quan.

**Chưa làm (đúng phạm vi Chặng 1, xem SPEC §7):** đếm/hiện số người đã xác nhận, nút "chỗ
này đóng rồi" (đã có sẵn trong luồng góp ý, không đụng), xếp hạng theo độ tươi của xác nhận,
thông báo cho admin khi lâu không ai xác nhận, và câu hỏi mở "có nên bỏ nhãn còn chỗ cũ sau
lễ hội 2026 không" (SPEC §5 — chỉ hỏi, chưa quyết).

**Bước tiếp theo hợp lý nhất:** anh bấm thử trên web thật (sau khi deploy), rồi báo lại có
đúng ý không trước khi bàn Chặng 2.

### 2026-08-04 — Tự động hoá hoàn toàn: routine tự đăng lên web, không cần copy-paste nữa
Đóng nốt việc còn dang dở lâu nay (từng tưởng không làm được — xem DECISIONS.md 2026-07-15,
2026-07-17, 2026-07-18). Anh gửi 1 giải pháp mới (routine tự ghi "trạng thái" qua GitHub
Contents API bằng Personal Access Token, khác cơ chế `git push` từng bị chặn) — kiểm tra
thật bằng 1 routine đọc thử trước khi tin, xác nhận `api.github.com` KHÔNG bị chặn mạng
(chỉ domain riêng của web, `web-five-xi-28.vercel.app`, vẫn bị chặn như cũ).

**Kiến trúc mới:**
1. Routine hằng ngày (không đổi lịch, vẫn 8h sáng) tự tìm chỗ mới như cũ, nhưng thay vì chỉ
   in báo cáo, giờ tự `curl PUT` ghi kết quả vào `data/pending-scan.json` trên GitHub (dùng
   1 Personal Access Token fine-grained, chỉ áp dụng đúng repo này, chỉ quyền ghi nội dung,
   hạn dùng 90 ngày).
2. File đó thay đổi → tự kích hoạt 1 GitHub Action mới (`.github/workflows/
   ingest-from-scan.yml`, chạy trên hạ tầng GitHub nên không bị chặn mạng) → tự gọi vào
   `/api/ingest/submit` (endpoint có sẵn từ trước) → web tự lọc trùng/mâu thuẫn y hệt mọi
   nguồn khác → tự dọn file về rỗng sau khi gửi xong.
- Test kỹ trước khi động vào routine thật: 1 bản ghi giả qua toàn bộ pipeline (xoá ngay sau
  khi xác nhận đúng), rồi mới cập nhật + trigger thử routine thật — kết quả: quét ra 9 chỗ,
  3 chỗ mới thật tự lên web, 1 chỗ nghi trùng tự vào hàng chờ duyệt, 5 chỗ hệ thống nhận ra
  đã có sẵn nên tự bỏ qua (không đăng trùng) — đúng thiết kế, không có lỗi.
- Routine giờ cũng tự gửi thông báo đẩy (push notification) sau mỗi lần chạy.
- 2 chỗ dán tay cũ (chat, `/admin` mục "Xử lý báo cáo") **vẫn còn**, không xoá — dùng khi cần
  xử lý thủ công 1 báo cáo nào đó ngoài lịch, nhưng không còn là bước bắt buộc hằng ngày.
- Việc `known-places-snapshot.json` cần làm mới thủ công **vẫn còn** (không đổi) — chỉ ảnh
  hưởng hiệu quả tìm kiếm của routine (đỡ tìm lại chỗ đã có), KHÔNG ảnh hưởng việc chống
  đăng trùng (việc đó nằm ở tầng ghi dữ liệu, luôn chạy đúng bất kể snapshot cũ hay mới).

### 2026-07-20 — Logo "CDP" + tiêu đề bấm về trang chủ
Bàn nhiều phương án qua Artifact trước (đèn lồng, ghim, mộc chữ, pixel...) — chốt bản đơn
giản: "CDP" đậm màu đỏ `#c8553d` + "Chạm Địa Phương", cùng font trang đang dùng thật
(Arial/Helvetica — phát hiện font Geist đã khai báo nhưng bị 1 dòng CSS cũ đè mất, chưa
sửa, không ảnh hưởng việc này). Cả cụm bấm vào dẫn về trang chủ. Hiện chỉ áp dụng ở trang
chủ (`app/page.js`) — nếu anh muốn logo này xuất hiện ở cả `/admin` và trang lễ hội, cần
chuyển lên layout chung, để hỏi riêng nếu anh cần.

### 2026-07-19 (sau, tiếp) — Tìm kiếm hiểu từ đồng nghĩa
Gõ "cafe", "coffee", "cà phê", hay "café" đều ra cùng 1 kết quả (tương tự "khách sạn"/
"hotel", "nhà nghỉ"/"motel", "nhà hàng"/"restaurant"...). Danh sách nhóm từ đồng nghĩa ở
`SEARCH_SYNONYM_GROUPS` trong `PlaceExplorer.js` — dễ thêm nhóm mới sau này. Đã test xác
nhận không bị lẫn chéo (tìm "hotel" không lòi ra quán cà phê).

### 2026-07-19 (sau) — Địa chỉ rút gọn, thêm trường "Khu vực" (khu dân cư), gộp nút bổ sung
- **Địa chỉ trên thẻ gọn**: chỉ còn số nhà + tên đường (VD "123 Đường Test Dài"), bỏ phần
  phường/TP — mục "Địa chỉ đầy đủ" lúc bung thẻ vẫn giữ nguyên chuỗi gốc để chỉ đường/đối
  chiếu. Cắt theo dấu phẩy, dừng khi gặp "Phường/TP/Tổ/Xã/Huyện...".
- **Trường mới `localArea`** (khu dân cư theo cách gọi người địa phương, VD "Khu 80 gian",
  "Khu cổng lấp"): hiện cùng tên phường ở dòng "Khu vực" ("Khu 80 gian, Minh Xuân"). Nhập
  được qua `/admin` (form sửa/thêm chỗ) và qua góp ý của khách — chưa có nguồn AI tự động
  điền (AI không biết tên gọi không chính thức), cần nhập tay dần.
- **Gộp nút "Báo sai" + "Bổ sung ảnh"** thành 1 nút **"Bổ sung thông tin"** — bấm vào hiện
  menu chọn "Thêm thông tin" (form sửa, có thêm ô Khu vực) hoặc "Thêm ảnh" (như cũ).
- Đã test đầy đủ bằng dữ liệu giả: địa chỉ rút gọn đúng, "Địa chỉ đầy đủ" không bị ảnh
  hưởng, menu hiện đúng 2 lựa chọn, gửi + duyệt "Khu vực" áp dụng đúng vào dữ liệu thật.

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
