# SPEC A4 — Trang chủ B + giới hạn tiêu đề Admin 60 ký tự (BUILD A, bước 4)

| | |
|---|---|
| Trạng thái | **KẾ HOẠCH — chờ PM duyệt.** Chưa sửa code A4, chưa deploy |
| Ngày | 2026-11-13 |
| Nguồn chuẩn | [DESIGN.md](DESIGN.md) v2.0 §3, §7 (Trang chủ) · [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) §2 (Trang chủ, Admin), §4 (Trang chủ, Admin tiêu đề) · [PM-FINAL-REVIEW-DESIGN…](PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md) §3.1 · mockup “Trang chủ B”, bảng 1 “Đợt A · Cơ bản · người mới” (tham khảo; DESIGN thắng khi khác) · [PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md](PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md) §3 |
| Gốc code | `main` sau A3 (`daa4eb8`) |

**“Trang chủ B”** là phương án bố cục Trang chủ đã duyệt (phương án B, H1 “Hôm nay bạn muốn ghé đâu?”). Đây **không**
phải đợt B. A4 chỉ làm **chế độ Cơ bản** của Trang chủ B, đúng phạm vi đợt A.

## 1. Mục tiêu và giới hạn

**Trang chủ** theo DESIGN §7, từ trên xuống:
1. Khẩu hiệu “Gom chỗ hay. Chia sẻ dễ dàng.”
2. H1 do Admin sửa, tối đa 60 ký tự, mặc định “Hôm nay bạn muốn ghé đâu?”.
3. Câu dẫn.
4. Ô tìm, **không tự focus**.
5. 4 nhóm Ăn · Chơi · Ngủ · Đi lại, kèm số chỗ.
6. Khối người mới “Bắt đầu Sổ đầu tiên”.
7. Nội dung theo mùa, **chỉ khi còn hiệu lực**.

**Admin:** **chỉ** giới hạn 60 ký tự + bộ đếm cho tiêu đề Trang chủ. Phần Admin khác không đổi.

**Không làm trong A4:**

| Việc | Thuộc |
|---|---|
| Thẻ ảnh `/tim` | A5 |
| Chi tiết | A6 |
| Sổ | A7 |
| Lộ trình | A8 |
| Màn phụ, footer 13px | A9 |
| Sổ gần đây, Lộ trình gần đây, Chọn ngẫu nhiên, lớp địa hình, công tắc giao diện | Đợt B |
| Thêm analytics mới | — |

Ngoài ra A4 **không đổi**: API, Server Action đang có, cấu trúc Redis, dữ liệu, PRODUCT.md, `/admin` ngoài ô tiêu đề Trang chủ, game. Không deploy.

## 2. Hiện trạng (đọc code 13/11)

| Phần | Hiện tại | DESIGN / mockup B |
|---|---|---|
| Thứ tự | H1 → khẩu hiệu → câu dẫn → ô tìm → 4 nhóm → **“CDP giúp bạn” (3 hành động)** → thẻ Lễ hội | Khẩu hiệu → H1 → câu dẫn → ô tìm → 4 nhóm → khối người mới → theo mùa (chỉ khi còn hiệu lực) |
| H1 | Lấy `pageTitle` của mục `explore` trong cấu hình điều hướng; mặc định “Khám phá Tuyên Quang”; Admin sửa tới 120 ký tự | Mặc định “Hôm nay bạn muốn ghé đâu?”, tối đa 60 |
| Câu dẫn | “Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.” | Mockup: “Tìm một nơi để ghé, hoặc chọn từ Sổ của bạn.” → **Q1** |
| Ô tìm | Không tự focus ✓; placeholder “Tìm quán, chỗ ngủ, địa chỉ...”; viền `zinc-200`, nút `#c8553d` | Placeholder mockup “Tên quán, chỗ ngủ, địa chỉ…”; viền `--line-strong`, nút `--action` |
| 4 nhóm | Ô chữ + số chỗ, không biểu tượng | Có biểu tượng (bát, cờ, giường, xe) + số chỗ |
| Người mới | Không có. `FirstVisitIntroCard.js` có trong code nhưng **không trang nào dùng** | Thẻ “Bắt đầu Sổ đầu tiên”: 3 bước + “Không cần đăng nhập. Sổ gắn với thiết bị này.” |
| Theo mùa | Lễ hội đã hết (27/9) nhưng vẫn hiện thẻ nhỏ “đã diễn ra” | Chỉ hiện khi còn hiệu lực. Lễ hội lưu trữ đã có trong Menu (A2) |
| Màu | `zinc-*`, `#c8553d` viết cứng | Token Cơ bản (A1) |
| Admin `/admin/navigation` | Ô “Tiêu đề trang” có `maxLength=120`, nên **dán câu dài bị trình duyệt cắt im lặng**. Không có bộ đếm. Lỗi thì quay lại trang báo “không hợp lệ” chung chung | Bộ đếm, chặn lưu khi quá 60, thông báo rõ, **không cắt im lặng** |

**Dữ liệu** — **[Fact]** (kiểm chỉ đọc 12/11): production **chưa lưu** cấu hình điều hướng. Vì vậy H1 đang là mặc định
trong code, và đổi mặc định sẽ **đổi ngay H1 trên production khi release**.

## 3. Thiết kế chi tiết

### 3.1 Trang chủ (`app/page.js`, `app/HomeLinks.js`)
- **Khẩu hiệu** (`<p>`, 15px, đậm vừa, `--ink-2`) đặt **trên** H1.
- **H1:** 26px (30px từ 1024px), đậm 600, `--ink`, `text-wrap: balance`, **không cắt**. Tiêu đề dài thì xuống dòng.
- **Câu dẫn:** theo Q1. 15px, `--ink-2`.
- **Ô tìm:**
  - Giữ hành vi hiện có: gửi tới `/tim?q=…`, sự kiện `search_use`.
  - Không `autoFocus` (test kiểm `document.activeElement` là `body` sau khi tải).
  - Viền `--line-strong`, nền `--surface`, chữ gợi ý `--ink-2`, nút “Tìm” `--action`. Cao ≥ 48px, chữ ô nhập 16px.
- **4 nhóm:**
  - Lưới 2×2 trên mobile, 4 cột từ 640px. Mỗi ô ≥ 64px, có biểu tượng nét (theo mockup), tên nhóm và “{n} chỗ”.
  - Số chỗ đếm như hiện nay.
  - Nền `--surface`, viền `--line`.
  - Vẫn gửi sự kiện `category_pick`.
- **Bỏ khối “CDP giúp bạn”** (3 hành động) và liên kết “CDP hoạt động thế nào →” trong khối đó → **Q2**. Ý “Tìm → Lưu → Lộ trình” chuyển vào 3 bước của thẻ người mới.
- **Theo mùa:** chỉ hiện thẻ Lễ hội khi lịch còn mốc sắp tới / đang diễn ra, dùng đúng hàm `groupEvents` hiện có. Hết mùa thì **không hiện gì**; trang lưu trữ vẫn mở từ Menu “Lễ hội (lưu trữ)”.
- `HomeGameEntry` (game, đã tự ẩn khi hết mùa) và `LegacyHashRedirect` giữ nguyên, không đụng.

### 3.2 Thẻ “Bắt đầu Sổ đầu tiên” (mới, `app/HomeFirstNotebook.js`)

Câu chữ theo mockup bảng 1:
> **Bắt đầu Sổ đầu tiên**
> 1. Tìm hoặc chọn một nhóm ở trên
> 2. Mở chỗ bạn thích, bấm **Lưu vào Sổ**
> 3. Ghép các chỗ đã lưu thành Lộ trình
>
> Không cần đăng nhập. Sổ gắn với thiết bị này.

Câu cuối khớp quy tắc cố định về Sổ/thiết bị (DECISIONS 2026-11-12). Không hứa đồng bộ, không thêm lối vào khôi phục.

**Ai là “người mới”** (**Q3**): thiết bị **chưa có Sổ nào**.
- Không có mã ẩn danh trong máy (`cdp_contributor`) → người mới. **Không gọi mạng.**
- Có mã → gọi hàm đọc **đang có** `getMyNotebooks(anonId)` (trang Sổ dùng hàm này). Không thêm API mới. Kết quả 0 Sổ → người mới. Có Sổ → ẩn thẻ.
- Đang chờ hoặc lỗi mạng → **ẩn**. Không nói sai với người đã có Sổ.
- Người đã có Sổ: đợt A **không** có khối thay thế (Sổ gần đây là đợt B). Họ dùng thanh đáy “Sổ”.

**Chống nhảy bố cục:** thẻ hiện sau khi trang chạy JS và nằm cuối nội dung, chỉ đẩy footer. Em sẽ đo CLS.
- Mục tiêu ≤ 0,1, kỳ vọng 0 ở màn đầu.
- Nếu vượt: đổi sang hiện sẵn từ máy chủ (vì 95% khách là người mới) và ẩn với người đã có Sổ. Em sẽ báo PM trước khi đổi.

### 3.3 Tiêu đề Trang chủ trong Admin (60 ký tự)
- **Một nguồn đếm** `lib/homeTitle.js` (hàm thuần, có test):
  - `HOME_TITLE_MAX = 60`.
  - Đếm **sau khi chuẩn hóa NFC, theo ký tự** (không theo byte), nên chữ Việt gõ kiểu tổ hợp (NFD) không bị đếm gấp đôi.
  - `validateHomeTitle(text)` → `{ ok, length, max, message }`.
- **Form Admin:** chỉ ô “Tiêu đề trang” của mục Trang chủ (`explore`) đổi sang component nhỏ `HomeTitleField`:
  - **Bỏ `maxLength`**, để dán câu dài không bị cắt im lặng.
  - Bộ đếm “24/60”. Vượt thì đổi màu cảnh báo + “Quá 7 ký tự — rút gọn để lưu được.” (`aria-live`).
  - Nút “Lưu menu & tên trang” **tạm khóa** cho tới khi hết vượt.
  - Chữ khách đã gõ **giữ nguyên**, không tự cắt.
  - Các ô khác giữ nguyên như hiện nay.
- **Máy chủ kiểm lại** (phòng khi trình duyệt tắt JS): `saveNavigation` gọi `validateHomeTitle`. Quá 60 thì **không lưu** và quay lại với thông báo riêng: “Tiêu đề trang chủ đang có N ký tự, tối đa 60. Cấu hình cũ chưa bị thay đổi.”
  - Ở đường này (đã tắt JS) chữ vừa gõ không giữ được; ghi rõ trong báo cáo.
  - Tiêu đề lưu dạng NFC.
- **Mặc định mới:** `explore.pageTitle` = “Hôm nay bạn muốn ghé đâu?” (24 ký tự). Nhãn menu “Trang chủ” không đổi.
- **Tiêu đề cũ dài hơn 60** (dữ liệu đã lưu trước đây; production hiện không có):
  - Lúc **đọc** vẫn chấp nhận tới 120 như cũ. Trang chủ hiện **đủ**, xuống dòng, không cắt, không lỗi trang.
  - Form Admin hiện bộ đếm đỏ, buộc rút gọn mới lưu được.
  - Không tự sửa dữ liệu.
- Các trang khác (`notes`, `notebooks`, `routes`, `about`, `search`): giữ giới hạn 120 như cũ.

## 4. File dự kiến sửa

| File | Việc | Commit |
|---|---|---|
| `web/lib/homeTitle.js` **(mới)** | Đếm/kiểm 60 ký tự (NFC) | A4-a |
| `web/tests/homeTitle.test.js` **(mới)** | Test: 60/61 ký tự, NFC vs NFD, khoảng trắng thừa, chuỗi rỗng. A4-b thêm test theo mùa (`groupEvents` với thời điểm giả lập) | A4-a, A4-b |
| `web/lib/navigation.js` | Mặc định “Hôm nay bạn muốn ghé đâu?”; kiểm 60 khi **lưu** (đọc vẫn ≤ 120) | A4-a |
| `web/app/admin/navigation/HomeTitleField.js` **(mới)** | Ô tiêu đề Trang chủ có bộ đếm, khóa nút Lưu khi vượt | A4-a |
| `web/app/admin/navigation/page.js` | Dùng `HomeTitleField` cho mục `explore` + thông báo lỗi riêng | A4-a |
| `web/app/admin/navigation/actions.js` | Kiểm lại 60 ký tự ở máy chủ trước khi lưu | A4-a |
| `web/app/page.js` | Thứ tự mới, khẩu hiệu, H1, câu dẫn, bỏ “CDP giúp bạn”, theo mùa chỉ khi còn hiệu lực, token | A4-b |
| `web/app/HomeLinks.js` | Ô tìm + 4 nhóm: token, biểu tượng, placeholder | A4-b |
| `web/app/HomeFirstNotebook.js` **(mới)** | Thẻ “Bắt đầu Sổ đầu tiên” + quy tắc người mới | A4-c |

**Không sửa:**
- `FirstVisitIntroCard.js` (code chết; đề xuất dọn ở BACKLOG);
- `AppShell`, `SiteHeader`, `BottomNav`;
- `notebookActions.js` (chỉ gọi hàm đọc đang có);
- `_game`, các màn A5–A9, PRODUCT.md.

Nếu cần file khác, em dừng và báo PM.

## 5. Thứ tự commit

Mỗi commit chạy lint + `npm test` + build rồi push. Push không deploy.

1. **A4-a — Admin 60 ký tự + mặc định H1.** Phần độc lập, test thuần trước.
2. **A4-b — Trang chủ B.** Thứ tự, câu chữ, ô tìm, 4 nhóm, theo mùa, token.
3. **A4-c — Thẻ người mới.**

Xong cả ba thì gửi **REPORT A4**. Chưa làm A5.

## 6. Kiểm thử

**Môi trường** như A1–A3:
- bản build thật, Redis token chỉ đọc;
- trình duyệt chặn mọi lượt ghi;
- không ghi dữ liệu thật;
- không chụp hay công bố Sổ/Lộ trình của người dùng.

Riêng lượt đọc `getMyNotebooks` (chỉ đọc) được cho qua để thử thẻ người mới; token chỉ đọc vẫn chặn mọi lệnh ghi phía máy chủ.

**Trang chủ** (Chromium + WebKit; 320×568, 360×640, 390×664 là vùng nhìn Safari còn lại, 390×844, 1280×800):
- Đúng thứ tự 7 phần. Ô tìm không tự focus. Bấm Tab vào ô tìm có viền focus.
- **Vùng đầu (Q4):** với H1 mặc định, H1 60 ký tự và H1 2–3 dòng, **ô tìm + đủ 4 nhóm nằm trọn trên thanh đáy** ở 320×568, 360×640, 390×664.
  - Cách thử: thay chữ H1 ngay trong trình duyệt bằng chuỗi 60 ký tự tiếng Việt rộng nhất (nhiều chữ hoa có dấu), đo vị trí.
  - Thử thêm tiêu đề cũ 120 ký tự: hiện đủ, không cắt, không cuộn ngang. Chỉ ghi nhận vị trí ô tìm.
- Tên “Chạm Địa Phương” vẫn đủ (bộ kiểm A2-0).
- 0 cuộn ngang. 4 ô nhóm vùng chạm ≥ 44px. Tương phản các cặp màu mới đo bằng số.
- Theo mùa: lễ hội đã hết → không có thẻ (kiểm trên trang thật). Trường hợp còn hiệu lực kiểm bằng test thuần:
  - gọi `groupEvents(lịch lễ hội, thời điểm giả lập trước 20/9)` → có mốc sắp tới → điều kiện hiện thẻ đúng;
  - thời điểm sau 27/9 → không có mốc → ẩn.

  Không thêm cơ chế giả lập giờ vào code, vì `readNow()` hiện chỉ trả `Date.now()`.
- Luồng: ô tìm “Phở” → `/tim?q=Phở`; bấm “Ăn” → `/tim?loai=an`. Sự kiện analytics gửi đúng (bị chặn ghi, chỉ kiểm có gọi).
- CLS mạng chậm, 3 lần lấy trung vị: không tệ hơn A3 (0), mục tiêu ≤ 0,1 kể cả khi thẻ người mới hiện.

**Thẻ người mới:**
- Máy mới (không mã) → **hiện**, không gọi mạng.
- Có mã nhưng 0 Sổ (mã thử không tồn tại) → **hiện**.
- Có mã và có Sổ → **ẩn**. Dùng mã ẩn danh của một Sổ có sẵn, chỉ ở trình duyệt thử trên máy, không chụp, không ghi mã vào báo cáo.
- Lỗi mạng → **ẩn**.

**Admin** (`/admin/navigation`, phiên thử riêng, chặn POST thật):
- Bộ đếm đúng với chữ có dấu NFC và NFD.
- Gõ 61 ký tự → đỏ + thông báo + nút Lưu khóa.
- **Dán 80 ký tự → giữ đủ 80** (không cắt).
- Xóa về ≤ 60 → mở khóa.
- Các ô khác giữ nguyên (so ảnh trước/sau). Thông báo lỗi máy chủ kiểm bằng test thuần của `validateHomeTitle` và một lần gửi form với JS tắt (lượt lưu bị chặn ở trình duyệt / token chỉ đọc).

**Hồi quy A1–A3:**
- 16 trang × 4 cỡ + WebKit, so ảnh với A3: chỉ Trang chủ và `/admin/navigation` được đổi.
- Thanh đáy, bàn phím, tên thương hiệu.
- Lint, test cũ + mới, build.

## 7. Điều kiện nghiệm thu A4

- [ ] Trang chủ đúng thứ tự DESIGN §7. H1 mặc định “Hôm nay bạn muốn ghé đâu?”. Ô tìm không tự focus.
- [ ] H1 60 ký tự: ô tìm + 4 nhóm nằm trong vùng đầu ở 320/360/390 (theo kích cỡ chốt ở Q4). Tiêu đề cũ dài hơn 60 hiện an toàn, không cắt, không cuộn ngang.
- [ ] Thẻ người mới hiện/ẩn đúng 4 trường hợp; câu chữ đúng quy tắc Sổ/thiết bị.
- [ ] Theo mùa chỉ hiện khi còn hiệu lực.
- [ ] Admin: bộ đếm; chặn lưu khi quá 60; thông báo rõ; không cắt im lặng; phần Admin khác không đổi; máy chủ kiểm lại.
- [ ] Token màu cho Trang chủ, đo tương phản. Tên “Chạm Địa Phương” đủ. Không cuộn ngang. CLS ≤ 0,1.
- [ ] Không đổi API/dữ liệu. Lint, test, build đạt. Không deploy.

## 8. Rủi ro

| Rủi ro | Mức | Cách giảm |
|---|---|---|
| Đổi H1 mặc định đổi chữ trên production ngay khi release | Thấp (đã duyệt ở DESIGN) | Ghi rõ trong hồ sơ release. Admin đổi lại được (≤ 60) |
| Thẻ người mới làm nhảy bố cục | Vừa | Đo CLS. Phương án dự phòng §3.2 |
| Thêm một lượt đọc Redis mỗi lần khách quen mở Trang chủ | Thấp | Chỉ khi máy có mã ẩn danh; dùng hàm đọc sẵn có; lượng truy cập hiện rất thấp |
| Bỏ “CDP giúp bạn” làm mất lối giải thích | Thấp | Thẻ người mới có 3 bước; Menu có “CDP là gì?”; Q2 |
| Tiêu đề cũ > 60 làm ô tìm tụt khỏi vùng đầu | Thấp (production chưa có) | Hiện đủ; Admin buộc rút gọn khi sửa |

## 9. Quay lại (rollback)

- Production không đổi (không deploy). Mỗi commit A4 revert độc lập trên `main`.
- **Dữ liệu không quay theo code** ([VAN-HANH-RELEASE-ROLLBACK.md](VAN-HANH-RELEASE-ROLLBACK.md) §0):
  - Nếu Admin lưu tiêu đề mới trong thời gian A4 chạy, bản lưu đó **vẫn còn** sau khi revert.
  - Mã cũ đọc được, vì giới hạn đọc vẫn 120.
  - Mặc định H1 quay về “Khám phá Tuyên Quang” chỉ khi chưa có bản lưu nào.
- Sửa gấp production: nhánh/worktree từ tag `prod-2026-09-30`. **Không deploy `main`.**

## 10. Câu hỏi cần PM chốt

**Q1 — Câu dẫn dưới H1.**
- **A (đề xuất):** giữ câu đang dùng “Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.” Câu này đúng với mọi khách và khớp 4 nhóm ngay bên dưới.
- **B:** câu mockup “Tìm một nơi để ghé, hoặc chọn từ Sổ của bạn.” Câu này nhắc “Sổ của bạn” trong khi người mới chưa có Sổ, và đợt A chưa có khối Sổ gần đây.

**Q2 — Bỏ khối “CDP giúp bạn” (3 hành động, PO duyệt 29/9)?**
- **A (đề xuất):** bỏ, đúng DESIGN §7 và mockup B. Nội dung 3 bước chuyển vào thẻ người mới; lối “CDP là gì?” có trong Menu.
- **B:** giữ dưới 4 nhóm. Lệch DESIGN, đẩy nội dung dài thêm.

**Q3 — Định nghĩa “người mới” cho thẻ “Bắt đầu Sổ đầu tiên”.**
- **A (đề xuất):** thiết bị chưa có Sổ nào (không có mã ẩn danh, hoặc có mã nhưng 0 Sổ). Người đã có Sổ không thấy thẻ.
- **B:** chỉ dựa vào “chưa có mã ẩn danh”, không gọi mạng. Nhanh hơn, nhưng người đã gửi góp ý mà chưa có Sổ sẽ không thấy thẻ.

**Q4 — Kích cỡ màn hình dùng để kiểm “vùng đầu”** (SCOPE chỉ nêu bề ngang 320/360/390).
- **A (đề xuất):** 320×568, 360×640, 390×664 (vùng nhìn còn lại khi Safari hiện thanh địa chỉ). Trừ header và thanh đáy. Có thêm 390×844 làm mốc mockup.
- **B:** chỉ 390×844 như mockup.
