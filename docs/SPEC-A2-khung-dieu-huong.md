# SPEC A2 — Khung trang + thanh đáy + Menu (gồm A2-0: tên thương hiệu)

| | |
|---|---|
| Trạng thái | **ĐÃ DUYỆT (kèm điều kiện) 12/11** — [PM-DUYET-PLAN-A2-CDP-2026-11-12.md](PM-DUYET-PLAN-A2-CDP-2026-11-12.md). Q1–Q5 đều chọn **A**, chốt ở §14. Đang BUILD. Không deploy |
| Ngày | 2026-11-12 |
| Nguồn chuẩn | [DESIGN.md](DESIGN.md) v2.0 §3, §6, §10–§11 · [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) §2, §4 (Điều hướng), §6 (bước 2) · [PM-NGHIEM-THU-A1-VA-YEU-CAU-A2-0-CDP-2026-11-12.md](PM-NGHIEM-THU-A1-VA-YEU-CAU-A2-0-CDP-2026-11-12.md) §2 |
| Gốc code | `main` @ `20d91ed` (sau A1). Production vẫn là `e3b38a4` (tag `prod-2026-09-30`) |

## 1. Mục tiêu và giới hạn

A2 dựng **khung chung** cho mọi trang khách:
- header mobile (logo + tên + Menu);
- thanh đáy 4 mục;
- Menu;
- sidebar desktop;
- footer.

Việc đầu tiên là **A2-0**: tên “Chạm Địa Phương” luôn hiện đủ, kể cả ở 320px.

**Không làm trong A2:**

| Việc | Để tới bước |
|---|---|
| Thanh hành động của Chi tiết chỗ (đang có sẵn, không đụng) | A6 |
| Thanh hành động của Sổ | A7 |
| Thanh hành động của Lộ trình | A8 |
| Đưa “← Quay lại” lên header. Nút Quay lại hiện nằm trong thân từng trang, giữ nguyên | A6–A8 |
| Đổi màu bên trong nội dung từng màn | A4–A9 |
| Công tắc giao diện, khối “Giao diện” trong Menu, gợi ý 1 lần | Đợt B |

Ngoài ra A2 **không đổi**:
- API, Server Action, dữ liệu Redis, Sổ, Lộ trình, khôi phục mã 6 số, analytics;
- `/admin` (riêng ảnh hưởng gián tiếp ở Q1 được nêu rõ);
- PRODUCT.md;
- game.

Không deploy, không release.

## 2. Hiện trạng (đo trên bản build thật, token Redis chỉ đọc, chặn mọi lượt ghi, 12/11)

**Header mobile** nằm ở `web/app/SiteHeader.js` và chỉ hiện dưới 1024px.

Ở 320px, phần trong lề còn **288px**, nhưng bốn thành phần cộng lại cần **293,9px**:

| Phần | Rộng |
|---|---|
| Logo (cao 26px) | 60,2px |
| Khoảng cách logo ↔ tên | 10px |
| Tên, chữ 14px đậm, đủ một dòng | 125,6px |
| Khoảng cách tên ↔ nút | 12px |
| Nút “Menu” | 85,7px |
| **Tổng cần** | **293,9px** |

Thiếu khoảng **6px**. Vì tên đang có lớp `truncate` nên trình duyệt cắt thành “Chạm Địa Phư…”. Đo trên Chromium và WebKit cho kết quả giống nhau. Từ 360px trở lên tên vừa đủ.

**Các điểm khác:**
- **Chiều cao header thực tế là 65px, không phải 57px như code ghi.** Hàng tìm kiếm bám dính ở `/tim` (`SearchResults.js`, `top-[57px]`) vì thế đang bị header che khoảng 8px khi cuộn. Lỗi này có trên production từ trước A1.
- **Menu mobile** hiện liệt kê cả 5 mục trong cấu hình điều hướng: Khám phá, Ghi chú của tôi, Sổ của tôi, Lộ trình của tôi, CDP là gì?. Chưa có thanh đáy.
- **Cấu hình điều hướng** (`web/lib/navigation.js`):
  - Có 5 mục, **chưa có mục “Tìm chỗ” (`/tim`)**.
  - Admin chỉ sửa được nhãn, tiêu đề trang, bật/tắt và thứ tự.
  - Production **chưa lưu cấu hình nào**. Em đọc bằng token chỉ đọc, khóa `site_config:navigation` trả `null`, nên site đang dùng nhãn mặc định trong code.
  - Riêng biến `CDP_SITE_CONTENT_NAMESPACE` trên Vercel chưa đối chiếu được, vì CLI đang hết phiên đăng nhập.
- **Thanh bám đáy đang có sẵn:**
  - Chi tiết chỗ có thanh “Lưu vào Sổ + Chỉ đường” (`PlaceDetail.js`, cố định đáy).
  - Hai trang sửa `/so/[slug]/sua` và `/lo-trinh/[slug]/sua` có thanh “Lưu thay đổi” bám đáy.
- **Vùng an toàn iOS:** `layout.js` chưa khai `viewport-fit=cover`. Theo đặc tả WebKit, khi đó `env(safe-area-inset-bottom)` luôn bằng 0. Thực tế thanh đáy có bị vạch Home của iPhone đè hay không thì **chưa kiểm trên máy thật** (giả định, cần kiểm).
- **“Góp một chỗ mới”** (DESIGN §6 xếp vào Menu) **chưa có lối vào riêng.** Form đề xuất chỗ mới hiện chỉ dùng bên trong Lộ trình và trong luồng báo chỗ đã đóng cửa, và mỗi luồng gửi qua Server Action riêng.
- **Sidebar desktop:** tên đủ ở 248px nhưng vẫn mang lớp `truncate`. Khi khách thu gọn sidebar còn 72px, chỉ hiện logo.

## 3. A2-0 — Tên “Chạm Địa Phương” luôn hiện đủ (làm đầu tiên, commit riêng)

**Cách xử lý**, theo đúng thứ tự ưu tiên PM nêu:

1. **Bỏ hẳn `truncate` ở tên**, ở cả header mobile lẫn sidebar desktop. Không dùng `ellipsis` hay `line-clamp`, không thay bằng “CDP” hay tên rút gọn.
2. **Chia lại khoảng trống**, giữ nguyên cỡ logo và cỡ chữ:

   | Phần | Trước | Sau |
   |---|---|---|
   | Khoảng cách logo ↔ tên | 10px | 8px |
   | Khoảng cách tên ↔ nút | 12px | 8px |
   | Đệm ngang nút Menu | 12px | 10px |

   Nút Menu vẫn cao 44px, rộng khoảng 80px, vẫn có chữ “Menu” và biểu tượng. Logo vẫn cao 26px. Tên vẫn 14px đậm (16px từ 640px trở lên như hiện nay).

   Tổng cần ở 320px: 60,2 + 8 + 125,6 + 8 + ~80 ≈ **282px ≤ 288px**. Tên nằm **một dòng**, còn dư khoảng 6px.
3. **Lưới an toàn khi thiếu chỗ** (phóng to chữ, máy hiển thị font rộng hơn):
   - Tên **xuống hai dòng theo từ**, ví dụ “Chạm Địa / Phương”. Dùng `text-wrap: balance` và dòng sát (`leading-tight`).
   - Hai dòng cao khoảng 34px, vẫn lọt trong header 65px, nên header không cao thêm.
   - Chỉ khi một từ đơn lẻ rộng hơn chỗ trống (phóng chữ rất lớn) mới cho ngắt giữa từ, để **không mất chữ nào**.
4. **Logo và nút Menu không bao giờ bị co hay đẩy ra ngoài.** Cả hai có `shrink-0`; chỉ phần tên được co và xuống dòng. Không phần tử nào che tên.
5. **Sửa luôn độ lệch của hàng bám dính ở `/tim`:**
   - Header tự đo chiều cao thật của mình và ghi vào biến CSS `--cdp-header-h`.
   - `SearchResults.js` đổi đúng 1 dòng: `top-[57px]` → `top-[var(--cdp-header-h,65px)]`.
   - Khi phóng chữ lớn làm header cao lên, hàng tìm kiếm vẫn bám ngay dưới, không bị che.
6. **Trình đọc màn hình:**
   - Ảnh logo đổi sang `alt=""`, vì tên đã hiện ngay cạnh. Trình đọc không còn đọc “CDP Chạm Địa Phương”.
   - Khi sidebar thu gọn chỉ còn logo, liên kết có `aria-label="Chạm Địa Phương — Trang chủ"` (xem Q5).

**Tiêu chí FAIL** (theo PM):
- Bất kỳ trạng thái header khách nào còn “Chạm Địa Phư…” hoặc dấu ba chấm thay cho tên;
- hoặc logo hay nút Menu bị che, bị đẩy ra ngoài;
- hoặc có cuộn ngang.

## 4. Thanh điều hướng đáy (mobile, dưới 1024px)

- **Component mới** `web/app/BottomNav.js`, gắn trong `AppShell.js`. Không có ở `/admin`.
- **4 mục, thứ tự cố định:** Trang chủ (`/`) · Tìm chỗ (`/tim`) · Sổ (`/so`) · Lộ trình (`/lo-trinh`).
  - Nhãn lấy từ cấu hình điều hướng Admin (DESIGN §6). Cách thêm mục “Tìm chỗ” ở **Q1**.
  - Thứ tự 4 mục lõi không theo ô “thứ tự” của Admin. Ô đó chỉ còn xếp các mục phụ trong Menu và sidebar.
  - Mục bị Admin tắt thì ẩn ở cả thanh đáy, Menu và sidebar, các mục còn lại chia đều bề ngang.
- **Kích thước:**
  - Mỗi mục chia đều bề ngang, ở 320px là 80px mỗi mục.
  - Cả mục là vùng chạm, cao 56px (≥ 44px).
  - Biểu tượng 20px. Nhãn 13px, đúng mức tối thiểu của DESIGN.
  - Đo ở 13px đậm vừa: “Trang chủ” 64,4px · “Tìm chỗ” 51,7px · “Sổ” 17,1px · “Lộ trình” 50,4px. Đều lọt trong 80px.
  - Nhãn dài do Admin đặt thì **xuống tối đa 2 dòng, không cắt “…”**.
- **Mục đang mở:** chữ đậm, gạch chân 2px màu hành động `--action`, có `aria-current="page"` cho trình đọc màn hình.
  - Trang chủ chỉ sáng khi đang ở `/`.
  - Sổ sáng ở `/so` và mọi trang con. Lộ trình cũng vậy.
  - Mục còn lại chữ `--ink-2` (đạt 6,5:1 trên nền).
- **Màu:** nền `--surface`, viền trên `--line`. Thanh nằm dưới lớp Menu (z-40) và dưới các bảng chọn, form nổi (z-50/60), nên mở bảng chọn Sổ hay form thì bảng che thanh, không ngược lại.
- **Hiện / ẩn theo trang.** Quy tắc nằm ở một hàm thuần duy nhất `web/lib/shellRoutes.js`, có test riêng. Các bước sau chỉ cần thêm đường dẫn vào đó.

  | Trang | Thanh đáy | Lý do |
  |---|---|---|
  | `/`, `/tim`, `/so`, `/lo-trinh`, `/ghi-chu`, `/gioi-thieu`, `/le-hoi-thanh-tuyen`, trang sự kiện lễ hội | Hiện | Trang cấp đầu và màn phụ |
  | `/dia-diem/[id]` | **Ẩn** | Đã có thanh “Lưu vào Sổ + Chỉ đường”; không chồng 2 thanh |
  | `/so/[slug]/sua`, `/lo-trinh/[slug]/sua` | **Ẩn** | Đã có thanh “Lưu thay đổi” |
  | `/so/[slug]`, `/lo-trinh/[slug]`, `/lo-trinh/xem/[token]` | Xem **Q2** | Sẽ có thanh hành động ở A7/A8 |

- **Ẩn khi bàn phím bật:**
  - Khi khách chạm vào ô gõ chữ (ô nhập, ô văn bản, ô chỉnh sửa), thanh trượt xuống và tạm bị vô hiệu.
  - Rời ô thì thanh hiện lại, có độ trễ ngắn để không nhấp nháy khi chuyển giữa hai ô.
  - Em chọn cách dựa vào ô đang được chạm thay vì đo khung nhìn, vì cách đo khung nhìn chạy không đều trong trình duyệt của Zalo và Facebook.
- **Không che nội dung:** cột nội dung có thêm khoảng trống đáy bằng chiều cao thanh cộng vùng an toàn, chỉ trên những trang có thanh. Footer và nội dung cuối trang luôn nằm trên thanh.
- **Vùng an toàn iOS:** đệm đáy bằng `env(safe-area-inset-bottom)`. Có cần bật `viewport-fit=cover` không: xem **Q3**.

## 5. Header + Menu (mobile)

- **Header:** như A2-0, đổi màu sang token:
  - nền `--bg` mờ 95%, viền `--line`, chữ `--ink`;
  - nút Menu nền `--surface-2`.
- **Nội dung Menu** theo DESIGN §6, bỏ 4 mục đã lên thanh đáy:
  1. Ghi chú của tôi (`/ghi-chu`, nhãn từ cấu hình).
  2. Góp một chỗ mới: xem **Q4**.
  3. Giới thiệu & chính sách dữ liệu (`/gioi-thieu`). Nhãn lấy từ cấu hình, hiện là “CDP là gì?”; Admin đổi được bất cứ lúc nào.
  4. Lễ hội (lưu trữ): liên kết cố định tới `/le-hoi-thanh-tuyen`, không nằm trong cấu hình điều hướng.
- **Cách mở / đóng:**
  - Giữ kiểu thả xuống ngay dưới header như hiện nay.
  - Thêm: phím Esc đóng Menu và trả focus về nút Menu.
  - Menu tự đóng khi chuyển trang.
  - Mỗi dòng cao ≥ 44px.
  - Mục đang mở dùng màu mới `bg-action/10` + `text-action-hover`, theo bảng ánh xạ SPEC-A1 §4.
- **Khối “Giao diện”** (đợt B) **không làm.**

## 6. Sidebar desktop (≥ 1024px) + footer

- **Sidebar:**
  - 4 mục lõi trên cùng, đúng thứ tự thanh đáy.
  - Đường kẻ mảnh, rồi các mục phụ: Ghi chú của tôi · Giới thiệu · Lễ hội (lưu trữ).
  - “Góp một chỗ mới” theo Q4.
  - Đổi màu sang token. Tên không còn `truncate` (A2-0).
  - Chế độ thu gọn 72px giữ như cũ, xem Q5.
  - Không có thanh đáy trên desktop.
- **Footer** (`SiteFooter.js`): chỉ đổi màu sang token (`--line`, `--bg`, `--ink-2`), nội dung giữ nguyên.

## 7. File dự kiến sửa

| File | Việc | Commit |
|---|---|---|
| `web/app/SiteHeader.js` | A2-0 (tên, khoảng cách, đo chiều cao) · token · Menu mới | A2-0, A2-a, A2-c |
| `web/app/tim/SearchResults.js` | **Chỉ 1 dòng:** `top-[57px]` → biến chiều cao header | A2-0 |
| `web/app/AppShell.js` | Tên sidebar bỏ `truncate` · gắn thanh đáy + khoảng trống đáy · sidebar 4 mục lõi + mục phụ · token | A2-0, A2-a, A2-b, A2-c |
| `web/app/SiteFooter.js` | Token màu | A2-a |
| `web/app/BottomNav.js` **(mới)** | Thanh đáy, ẩn khi bàn phím bật | A2-b |
| `web/lib/shellRoutes.js` **(mới)** | Hàm thuần: trang nào có thanh đáy, mục nào đang mở | A2-b |
| `web/tests/shellRoutes.test.js` **(mới)** | Test cho hàm trên | A2-b |
| `web/app/NavigationIcon.js` | Thêm biểu tượng kính lúp (Tìm chỗ) và lễ hội | A2-b, A2-c |
| `web/lib/navigation.js` | Thêm mục `search` → `/tim`, nhãn mặc định ngắn (**chỉ khi PM chọn Q1-A**) | A2-b |
| `web/app/layout.js` | `viewport-fit=cover` (**chỉ khi PM chọn Q3-A**) | A2-b |

**Không sửa:**
- `PlaceDetail.js` và mọi file `page.js` của từng màn;
- `BackButton.js`;
- mọi `*Actions.js`, `app/api/`, `app/admin/`;
- dữ liệu;
- PRODUCT.md.

`/admin/navigation` không sửa code, nhưng nếu chọn Q1-A thì form Admin **tự hiện thêm một dòng “Tìm chỗ”**, vì form vẽ theo danh sách mục.

Nếu lúc làm thấy cần thêm file ngoài bảng này, em dừng và báo PM trước.

## 8. Thứ tự làm và commit

Mỗi bước một commit. Sau mỗi commit chạy lint + `npm test` + build, rồi push. Push không deploy.

1. **A2-0:** tên thương hiệu. Kèm ảnh header 320px trước/sau.
2. **A2-a:** khung đổi màu sang token (header, sidebar, footer). Bố cục không đổi.
3. **A2-b:** thanh đáy, gồm quy tắc hiện/ẩn + test, biểu tượng, Q1 và Q3 nếu được duyệt.
4. **A2-c:** nội dung Menu mới + sidebar nhóm lõi/phụ.

Xong cả bốn bước thì em gửi **REPORT A2**.

## 9. Kiểm thử

**Môi trường:** giống A1.
- Chạy `next build` + `next start` trên máy, Redis bằng token chỉ đọc.
- Bỏ trống token Blob, cron và mật khẩu admin; phiên admin dùng khóa thử riêng.
- Trình duyệt chặn mọi request không phải GET và `/api/track`.
- Không ghi dữ liệu thật.

**A2-0 — tên thương hiệu**, chạy trên Chromium và WebKit:
- **Cỡ:** 320 / 360 / 390 / 1280px.
- **Trang:** mọi trang khách, gồm Trang chủ, Tìm chỗ, 3 trang Chi tiết, `/so`, 1 Sổ, `/lo-trinh`, 1 Lộ trình, 1 Lộ trình chia sẻ, `/ghi-chu`, `/gioi-thieu`, lễ hội.
- **Trạng thái:** Menu đóng và Menu mở.

Mỗi lần chạy, máy tự kiểm:
- chữ hiển thị đúng “Chạm Địa Phương”;
- không có `text-overflow: ellipsis`;
- chữ không bị tràn khỏi ô;
- logo, tên, nút Menu nằm trọn trong màn hình và không chồng lên nhau;
- trang không cuộn ngang;
- nút Menu cao ≥ 44px.

**Phóng to chữ** (giả lập cỡ chữ trình duyệt 125% / 150% / 200% ở 320px):
- tên vẫn đủ, được xuống dòng;
- logo và nút Menu vẫn thấy và bấm được;
- không cuộn ngang;
- hàng bám dính `/tim` không bị header che.

Ảnh header 320px trước/sau đưa vào REPORT A2.

**Thanh đáy:**
- hiện / ẩn đúng bảng §4 trên mọi trang khách;
- 4 mục, mỗi mục 80px ở 320px, vùng chạm ≥ 44px;
- mục đang mở đúng theo từng đường dẫn, có `aria-current`;
- chạm ô tìm ở `/tim` và ô ghi chú → thanh ẩn; rời ô → thanh hiện lại;
- nội dung cuối trang và footer không bị che;
- mở bảng chọn Sổ / form nổi → bảng che thanh;
- không cuộn ngang;
- Tab bàn phím đi qua được, có viền focus.

**Menu:**
- đúng mục; mở, đóng, Esc;
- tự đóng khi chuyển trang;
- liên kết chạy đúng;
- dòng ≥ 44px.

**Sidebar ≥ 1024px:** 4 mục lõi trên, mục phụ dưới; thu gọn / mở rộng như cũ; không có thanh đáy.

**`/admin`:** không có thanh đáy; so ảnh trước/sau gần như không đổi. Nếu chọn Q1-A thì có thêm một dòng “Tìm chỗ” ở `/admin/navigation`.

**Luồng chính** như A1: Trang chủ → Tìm → Chi tiết → Lưu (bị chặn) → Quay lại → Sổ → Lộ trình, lần này đi bằng thanh đáy.

**Kỹ thuật:**
- lint, `npm test` (70 test cũ + test mới cho `shellRoutes`), build;
- so sánh lỗi JS trước/sau;
- CLS 3 trang không tệ hơn A1.

**iPhone thật** (nhờ anh làm, khoảng 10 phút, không cần deploy):
- Em chạy bản build trên máy Mac với token chỉ đọc. Anh mở bằng iPhone cùng mạng Wi‑Fi.
- Kiểm: vùng an toàn đáy (vạch Home), bàn phím bật thì thanh ẩn, tên đủ ở header.
- Nếu tiện, mở thử link đó trong Zalo.
- Mọi lượt ghi đều thất bại an toàn vì token chỉ đọc.

## 10. Điều kiện nghiệm thu A2

- [ ] **A2-0:** 0 trạng thái header khách nào có “…” hay tên bị cắt, ở 320/360/390/1280px, cả Chromium và WebKit. Logo và Menu luôn thấy, bấm được.
- [ ] Phóng chữ tới 200%: tên vẫn đủ (được xuống dòng), không cuộn ngang.
- [ ] Ảnh header 320px trước/sau có trong REPORT A2.
- [ ] Thanh đáy: 4 mục đúng thứ tự, đúng nhãn; mục đang mở rõ; chạm ≥ 44px; chữ ≥ 13px.
- [ ] Không chồng 2 thanh ở Chi tiết chỗ và 2 trang sửa.
- [ ] Bàn phím bật thì thanh ẩn, không che ô nhập hay kết quả.
- [ ] Vùng an toàn iOS đạt trên iPhone thật (theo Q3).
- [ ] Menu đúng DESIGN §6 (trừ phần đợt B và mục chờ Q4). Sidebar desktop 4 mục lõi trên cùng.
- [ ] 0 trang cuộn ngang ở mọi cỡ. `/admin` không có thanh đáy.
- [ ] Không đổi API, dữ liệu, Sổ, Lộ trình, link cũ. Lint sạch, test đạt, build đạt. Không deploy.

## 11. Rủi ro

| Rủi ro | Mức | Cách giảm |
|---|---|---|
| Thanh đáy che nút hoặc nội dung cuối trang ở màn chưa làm lại | Vừa | Khoảng trống đáy tự động; quét mọi trang ở 3 cỡ mobile |
| Ẩn thanh khi bàn phím bật đoán sai trong trình duyệt Zalo/Facebook | Vừa | Dựa vào ô đang chạm (chắc hơn đo khung nhìn); kiểm thêm trên máy thật |
| `viewport-fit=cover` làm nội dung lấn vào tai thỏ khi xoay ngang iPhone | Vừa | Q3: chỉ bật kèm đệm 2 bên bằng `env(safe-area-inset-*)`; kiểm xoay ngang |
| Thêm mục “Tìm chỗ” vào cấu hình làm hỏng cấu hình Admin đã lưu | Thấp | Production chưa lưu cấu hình nào (đã đọc kiểm). Nếu có, code tự rơi về mặc định chứ không lỗi trang |
| Header đo chiều cao chạy sau lần vẽ đầu | Thấp | Giá trị mặc định 65px khớp chiều cao thật, nên không nhảy |

## 12. Quay lại (rollback)

- Production không đổi (không deploy).
- Quay lại `main`: `git revert` từng commit A2, theo thứ tự ngược. Các commit tách riêng nên có thể chỉ bỏ thanh đáy mà giữ A2-0.
- Riêng Q1-A: nếu trong lúc đó Admin đã lưu cấu hình có 6 mục mà sau này revert về 5 mục, code tự bỏ bản lưu và dùng mặc định. Trang không lỗi, chỉ mất nhãn tự đặt.
- Sửa gấp production: nhánh từ tag `prod-2026-09-30`, sau khi đối chiếu Vercel. **Không deploy `main`.**

## 13. Câu hỏi cần PM chốt

**Q1 — Mục “Tìm chỗ” và nhãn thanh đáy.** DESIGN muốn nhãn lấy từ cấu hình Admin, nhưng cấu hình chưa có `/tim`. Nhãn mặc định hiện dài: “Lộ trình của tôi” rộng 98px, không vừa 80px.

- **A (đề xuất):**
  - Thêm mục `search` → `/tim` vào cấu hình (`lib/navigation.js`).
  - Đổi nhãn mặc định ngắn: Khám phá → **Trang chủ**, Sổ của tôi → **Sổ**, Lộ trình của tôi → **Lộ trình**, thêm **Tìm chỗ**.
  - Tiêu đề trang (H1) giữ nguyên.
  - Hệ quả: sidebar desktop cũng dùng nhãn ngắn, và `/admin/navigation` tự có thêm 1 dòng.
- **B:** Thanh đáy dùng 4 nhãn viết cố định trong code, cấu hình không đổi. Không đụng Admin, nhưng lệch DESIGN §6 (Admin không đổi được nhãn thanh đáy).

**Q2 — Thanh đáy ở Sổ chi tiết, Lộ trình chi tiết, Lộ trình chia sẻ** trong lúc chưa có thanh hành động (A7/A8).

- **A (đề xuất):** Tạm **hiện** thanh đáy. Tới A7/A8 thanh hành động thay vào, chỉ cần sửa 1 dòng trong `shellRoutes.js`. Giữ được đường đi cho khách, không có trang cụt.
- **B:** Ẩn ngay từ A2, khách dùng Quay lại + Menu.

**Q3 — Vùng an toàn iOS.**

- **A (đề xuất):**
  - Bật `viewport-fit=cover` trong `layout.js`.
  - Thanh đáy đệm theo vạch Home. Header và nội dung đệm 2 bên khi xoay ngang.
  - Kiểm trên iPhone thật qua Wi‑Fi như §9.
- **B:** Chưa bật trong A2, để TEST A. Rủi ro: vạch Home đè lên thanh đáy, trong khi checklist đợt A đòi đạt vùng an toàn.

**Q4 — “Góp một chỗ mới” trong Menu.** Hiện chưa có luồng góp chỗ mới đứng riêng. Muốn có thì phải thêm Server Action mới, tức là đụng API và dữ liệu, vượt phạm vi A2.

- **A (đề xuất):** A2 **chưa đặt mục này**. Menu có 3 mục. Em ghi việc “luồng Góp một chỗ mới” vào INBOX để PM xếp bước.
- **B:** Đặt mục trỏ tới trang Giới thiệu, phần dữ liệu. Không khuyên, vì khách bấm “Góp” lại chỉ đọc được giới thiệu.

**Q5 — Sidebar desktop thu gọn (72px) chỉ còn logo.** Chế độ này do khách tự bấm thu gọn. Tên bị **ẩn hẳn chứ không bị rút gọn**.

- **A (đề xuất):** Giữ như cũ, thêm tên đầy đủ cho trình đọc màn hình và chú thích khi rê chuột.
- **B:** Bỏ chế độ thu gọn.

## 14. Quyết định PM (12/11) — cả 5 câu chọn A

Nguồn: [PM-DUYET-PLAN-A2-CDP-2026-11-12.md](PM-DUYET-PLAN-A2-CDP-2026-11-12.md).

| | Quyết định | Điều kiện kèm theo |
|---|---|---|
| Q1 | Thêm `search` → `/tim` vào cấu hình; nhãn mặc định Trang chủ · Tìm chỗ · Sổ · Lộ trình | Giữ key và đường dẫn cũ. **Kiểm lại production chưa lưu cấu hình ngay trước khi đổi mặc định.** Dòng mới ở `/admin/navigation` phải kiểm thử; không thiết kế lại Admin |
| Q2 | Sổ chi tiết, Lộ trình chi tiết, Lộ trình chia sẻ **vẫn có thanh đáy** trong A2 | Tới A7/A8 có thanh hành động thì chỉ còn một thanh. Chi tiết chỗ và 2 trang sửa ẩn thanh đáy |
| Q3 | Bật `viewport-fit=cover` + đệm vùng vạch Home | Không chỉ bật meta: dùng `env(safe-area-inset-*)`; kiểm khoảng trống nội dung, bàn phím, thanh trình duyệt, màn thấp. **iPhone thật là cổng trước RELEASE A**, không chặn BUILD A2 |
| Q4 | Chưa đặt “Góp một chỗ mới” trong Menu | Đã ghi [INBOX](INBOX.md) §9. Không tạo API hay luồng mới |
| Q5 | Sidebar thu gọn chỉ còn logo khi khách tự thu gọn | Mở rộng phải hiện nguyên văn “Chạm Địa Phương”. Logo khi thu gọn có tên truy cập được (`aria-label`/`title`) và dùng được bằng bàn phím |

**Điều kiện thêm cho BUILD:**
- **A2-0:** tên đủ ở 320px và khi phóng chữ 125/150/200%. Không thu nhỏ logo hay cỡ chữ để lách. Cần thì xuống 2 dòng
  theo từ, header **cao theo nội dung**. `/tim`: **không thay 57 bằng 65** mà dùng chiều cao header đo thật (biến
  dùng chung). Ảnh trước/sau ở 320/360/390, Chromium + WebKit, `/tim` khi cuộn. **A2-0 chưa đạt thì chưa làm thanh đáy.**
- **Thanh đáy:** không dùng bề rộng cố định (chia đều, tính cả vùng an toàn ngang). Khoảng trống cuối trang không để
  thanh che nội dung, nút, ô nhập hay phần tử đang focus. Mục đang mở phân biệt bằng chữ đậm + gạch chân, không chỉ
  bằng màu.
- **Bàn phím:** không đoán chỉ bằng ngưỡng `innerHeight`. Kiểm chuyển focus giữa các ô và quay lại từ trang khác. Dùng
  `visualViewport` thì phải có đường dự phòng.
- **Menu:** Ghi chú của tôi · Giới thiệu · Lễ hội (lưu trữ); các mục đang có không bị mất (4 mục lõi chuyển sang thanh
  đáy). Esc, đóng khi đổi trang, trả focus hợp lý, **nền trang không cuộn ngoài ý muốn khi Menu mở**.
- File: đúng §7, riêng `SearchResults.js` được phép trong A2-0. Cần file khác thì báo PM trước.
