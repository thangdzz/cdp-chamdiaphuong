# SPEC A1 — Màu theo vai trò + Font (BUILD A, bước 1)

| | |
|---|---|
| Trạng thái | **KẾ HOẠCH — chờ PM duyệt.** Chưa sửa code, chưa build |
| Ngày | 2026-11-12 |
| Nguồn chuẩn | [DESIGN.md](DESIGN.md) v2.0 §2–§4 · [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) §2, §6 (bước 1) · [PM xác nhận FREEZE](PM-XAC-NHAN-FREEZE-UXUI-CDP-2026-11-12.md) §4 |
| Gốc code | `main` = code production `e3b38a4` (khác duy nhất `web/data/known-places-snapshot.json`, file của routine) |

## 1. Mục tiêu và giới hạn

**A1 chỉ đặt nền:** khai báo bộ màu theo vai trò của chế độ Cơ bản, nối vào Tailwind, đổi font sang Be Vietnam
Pro. **A1 không tô lại từng màn.** Các màu viết cứng trong từng màn đổi sang token ở đúng bước của màn đó (A2–A9),
theo bảng ánh xạ ở §4 của file này.

Không làm trong A1:
- Không đổi hành vi tìm kiếm, Sổ, Lộ trình, lưu, khôi phục mã 6 số, API, Redis, analytics.
- Không đổi bố cục, cỡ chữ, bo góc của màn nào.
- Không đổi `/admin` (trừ font, xem quyết định Q1), lớp game `_game`, logo, hình minh họa.
- Không nạp Literata (chỉ dùng cho Bản đồ gấp, đợt B). Không có `data-theme` và công tắc (đợt B).
- Không deploy.

## 2. Kiểm kê hiện trạng (đếm tự động, chỉ đọc, 12/11)

| Vùng | Lớp màu Tailwind (`zinc-…`, `white`…) | Mã màu viết cứng | File | A1 làm gì |
|---|---|---|---|---|
| Trang cho khách (`app/` trừ admin, game) | 838 | 62 | 53 | Không sửa từng chỗ; đổi theo màn ở A2–A9 |
| `/admin` | 736 | 19 | 22 | Không sửa (ngoại lệ DESIGN §2) |
| Game / lễ hội / huy hiệu | 229 | 175 | 20 | Không sửa (ngoại lệ) |

**Chi tiết trang cho khách** (cơ sở cho bảng ánh xạ §4):
- Chữ: `text-zinc-500` 150 · `text-zinc-900` 101 · `text-zinc-700` 80 · **`text-zinc-400` 73** · `text-zinc-600` 39 · `text-zinc-800` 11.
  `zinc-400` trên nền trắng chỉ đạt **2,6:1**, dưới chuẩn. Lỗi này đang có trên production và sẽ được sửa khi từng màn đổi sang token.
- Nền / viền: `bg-white` 87 · `bg-zinc-100` 32 · `bg-zinc-900` 22 · `bg-zinc-50` 20 · `border-zinc-200` 57 · `border-zinc-300` 47.
- Trạng thái: `text-red-*` 33 · `text-emerald-700` 18 · `text-amber-*` 13 · `bg-amber-50` 5.
- Màu thương hiệu viết cứng (62 chỗ, 28 file): `#c8553d` 49 (30 làm nền nút chữ trắng, chỉ đạt **4,35:1**) ·
  `#ad4832` 7 · `#a83f2b` 4. **Không chỗ nào là logo**: logo là ảnh `public/cdp-logo.png` nên tự giữ `#C8553D`.
- Font: `layout.js` nạp Geist + Geist Mono, chỉ bộ chữ `latin`. **Geist không có bộ chữ tiếng Việt**, nên chữ có dấu
  đang rơi về font hệ thống, trộn hai kiểu chữ. Lớp `font-mono` không được dùng ở đâu.
- Độ đậm đang dùng: `font-medium` 388 · `font-bold` 29 · `font-semibold` 20 · `font-normal` 11. Tức là cần 400, 500, 600 và 700.
- Nền trang thực tế là **trắng**. Lớp `bg-zinc-50` trên `<body>` không có tác dụng vì quy tắc `body {}` trong
  `globals.css` thắng lớp Tailwind.
- Không có dark mode: `color-scheme: light` (sửa 20/8 vì máy bật dark mode làm chữ khó đọc).
- Kiểu focus: phía khách hầu như không có, dùng viền focus mặc định của trình duyệt.

## 3. Giải pháp kỹ thuật

### 3.1 Bộ token (DESIGN §2, chế độ Cơ bản) — `web/app/globals.css`

| Biến CSS | Giá trị | Lớp Tailwind | Vai trò | Tương phản (tính toán) |
|---|---|---|---|---|
| `--bg` | `#F6F5F1` | `bg-page` | Nền trang | — |
| `--surface` | `#FFFFFF` | `bg-surface` | Thẻ, sheet | — |
| `--surface-2` | `#EFEEE9` | `bg-surface-2` | Nền phụ | — |
| `--line` | `#E3E1DA` | `border-line` | Viền thẻ, đường chia | (trang trí) |
| `--ink` | `#183B32` | `text-ink`, `bg-ink` | Chữ chính, nền đậm | 11,3 trên nền · 12,3 trên thẻ |
| `--ink-2` | `#4F5B55` | `text-ink-2` | Chữ phụ | 6,5 trên nền · 7,1 trên thẻ · 6,1 trên nền phụ |
| `--action` | `#B04A33` | `bg-action`, `text-action` | **Màu hành động duy nhất** | chữ trắng trên nút 5,4 · chữ link 5,0 trên nền / 5,4 trên thẻ |
| `--action-hover` | `#963E2A` | `bg-action-hover` | Đang nhấn | chữ trắng 7,0 |
| `--ok` | `#2F6B4F` | `text-ok` | Còn mở, đã xác nhận | 5,8 trên nền · 6,3 trên thẻ |
| `--warn` | `#8A5A10` | `text-warn` | Chưa chắc chắn | 5,4 trên nền · 5,9 trên thẻ |
| `--focus` | `= --action` | — | Viền focus 2px, cách 2px | 5,0 so với nền |
| `--radius-card` / `--radius-control` | `12px` / `10px` | `rounded-card` / `rounded-control` | DESIGN §4 | — |
| `--shadow-card` | `0 1px 2px rgb(24 59 50 / .06)` | `shadow-card` | Bóng 1px rất nhẹ | — |

- Khai báo biến ở `:root`. Nối vào Tailwind bằng `@theme inline`: lớp sinh ra gọi thẳng `var(--…)`, nên đợt B chỉ cần
  ghi đè biến cho Bản đồ gấp, không phải sửa lớp. Đợt A **không** thêm `data-theme`.
- Bo góc và bóng chỉ được **khai báo** ở A1, chưa áp vào màn nào.
- Giữ nguyên `--background` / `--foreground` và `color-scheme: light`, vì `/admin` đang dựa vào chúng.
- **Chỉ áp cho trang của khách:** thêm lớp `cdp-site` vào khung trang khách trong `AppShell.js` (một class, không đổi
  cấu trúc). CSS:
  - `body:has(.cdp-site)` và `.cdp-site`: nền `--bg`, chữ mặc định `--ink`. Khi vuốt quá đầu/cuối trang trên iOS
    cũng thấy cùng màu nền.
  - `.cdp-site :focus-visible`: viền 2px màu `--focus`, cách 2px. Chỉ hiện khi dùng bàn phím, không hiện khi chạm.
  - `/admin` dùng nhánh khung riêng, không có `cdp-site`, nên nền, chữ và focus giữ nguyên.
- Các chỗ đã ghi màu riêng (838 lớp `zinc`…) **giữ nguyên trong A1**. Sau A1, màn chưa làm vẫn có màu chữ, nút như
  cũ, chỉ nền trang và font đổi.

### 3.2 Font — `web/app/layout.js` + `globals.css`

- Thay `Geist`, `Geist_Mono` bằng `Be_Vietnam_Pro` từ `next/font/google`: bộ chữ `latin` + `vietnamese`, độ đậm
  `400 / 500 / 600 / 700` (đúng 4 độ đậm đang dùng), `display: "swap"`, biến `--font-be-vietnam-pro`. Không nạp 100–300
  hay 800–900, không nạp chữ nghiêng (code không dùng `italic`).
- Be Vietnam Pro không có bản “variable” trên Google Fonts. Mỗi độ đậm là một file, tổng 8 file nhỏ (4 độ đậm × 2 bộ chữ).
- `next/font` **tự lưu font cùng web** lúc build. Khi khách xem, máy không gọi tới Google Fonts, nên không có thêm
  một máy chủ ngoài có thể chậm hoặc bị chặn.
- **Khi font chậm hoặc lỗi:** `swap` hiện ngay chữ bằng font hệ thống, tải xong mới đổi. `next/font` tự tạo font dự
  phòng đã chỉnh cỡ cho khớp số đo Be Vietnam Pro, để chữ không nhảy khi đổi. Chuỗi dự phòng: `system-ui`,
  `-apple-system`, `"Segoe UI"`, `Roboto`, `Arial`, `sans-serif`. Các font này đều có đủ dấu tiếng Việt.
- `--font-sans` của Tailwind trỏ sang Be Vietnam Pro. `--font-mono` trỏ sang font mono của hệ thống (không còn tải Geist Mono).
- Áp cho toàn site, kể cả `/admin` (**quyết định Q1**).

### 3.3 Không chọn
- **Đổi bảng `zinc` của Tailwind thành token một lượt:** đổi được 838 chỗ cùng lúc, nhưng `zinc-400` vừa làm chữ vừa
  làm viền, nên một ánh xạ chung sẽ sai. Cách này cũng làm “zinc” mang nghĩa khác tên gọi, người sau khó đọc. Làm
  trái yêu cầu PM “không thay hàng loạt khi chưa phân loại”.
- **Đổi luôn 62 mã màu thương hiệu trong A1:** chạm 28 file của mọi màn, mà các màn đó sẽ được làm lại ở A2–A9. Để
  mỗi màn tự đổi ở bước của nó, diff mỗi bước gọn và dễ quay lại riêng.

## 4. Bảng ánh xạ màu cũ → token (dùng ở A2–A9, không áp ở A1)

| Đang dùng | Vai trò | Đổi thành |
|---|---|---|
| nền trang (`body`, `bg-zinc-50` cấp trang) | Nền trang | `bg-page` (có sẵn từ A1) |
| `bg-white` ở thẻ, sheet, thanh | Bề mặt | `bg-surface` |
| `bg-zinc-50`, `bg-zinc-100` trong thẻ | Nền phụ | `bg-surface-2` |
| `border-zinc-100/200/300`, `ring-zinc-200`, `decoration-zinc-300` | Viền | `border-line` (ô nhập: xem Q2) |
| `text-zinc-900`, `text-zinc-800` | Chữ chính | `text-ink` |
| `text-zinc-700/600/500` | Chữ phụ | `text-ink-2` |
| `text-zinc-400/300` làm **chữ** | Chữ mờ (2,6:1) | `text-ink-2` (sửa luôn tương phản) |
| `zinc-400` làm **viền / icon trang trí** | Trang trí | `border-line` / giữ theo ngữ cảnh |
| `bg-[#c8553d]` + `text-white` | Nút chính | `bg-action` + `active:bg-action-hover` |
| `text-[#c8553d]`, `decoration-[#c8553d]` | Link, chữ hành động | `text-action` / `decoration-action` |
| `active:bg-[#ad4832]` | Đang nhấn | `active:bg-action-hover` |
| `bg-[#c8553d]/10` + `text-[#a83f2b]` | Mục điều hướng đang mở | `bg-action/10` + `text-action-hover`. Lưu ý: `text-action` trên nền `action/10` đặt trên nền kem chỉ đạt 4,3:1 |
| `bg-zinc-900` + `text-white` | Nút đậm | Phân loại theo màn: nút chính → `bg-action`; chip/khối đậm → `bg-ink` |
| `text-emerald-700` | Còn mở, đã xác nhận | `text-ok` |
| `text-amber-700/800/900` | Chưa chắc chắn | `text-warn` |
| `bg-amber-50`, `ring-amber-200` (khung thông báo) | Trạng thái | **Giữ** (ngoại lệ DESIGN §2) |
| `text-red-*`, `bg-red-50`, `border-red-200` | Báo lỗi | **Giữ** (ngoại lệ) |
| Nháy nền khi nhảy tới chỗ (`rgba(200,85,61,.22)`) | Trang trí, tông logo | Giữ |
| Logo PNG, minh họa, `_game`, `/admin` | Ngoại lệ | **Giữ** |

Cách làm ở mỗi bước màn: đổi theo bảng này **chỉ trong file của màn đó**, chụp ảnh trước/sau, ghi số chỗ đã đổi
vào báo cáo bước.

## 5. File dự kiến sửa

| File | Thay đổi | Commit |
|---|---|---|
| `web/app/globals.css` | Thêm token `:root`, `@theme inline`, quy tắc `.cdp-site` (nền, chữ, focus); đổi `--font-sans`/`--font-mono`; đổi `font-family` của `body` | A1a, A1b |
| `web/app/AppShell.js` | Thêm class `cdp-site` vào khung trang khách (1 dòng) | A1a |
| `web/app/layout.js` | Đổi Geist → Be Vietnam Pro | A1b |
| `docs/` (STATUS, TASKS, HANDOFF, DECISIONS nếu cần) | Ghi kết quả | sau A1 |

Không file nào trong `lib/`, `app/api/`, các file `*Actions.js`, `app/admin/`, `app/_game/`. Tổng diff code dự kiến
**khoảng 60–80 dòng** trong 3 file.

## 6. Thứ tự commit

0. `git fetch` + fast-forward `origin/main`; kiểm không xung đột với commit routine (routine chỉ chạm `data/` và
   `web/data/`). Nếu Q3 được duyệt: gắn tag mốc production.
1. **A1a — `Add role-based color tokens for the Basic theme`**: token + `cdp-site` (nền trang, chữ mặc định, focus).
2. **A1b — `Switch the site font to Be Vietnam Pro`**: font.
3. Kiểm thử (§7) → báo cáo A1 cho PM, kèm ảnh trước/sau → PM nghiệm thu A1 rồi mới sang A2.

Mỗi commit push riêng (push không deploy).

## 7. Cách kiểm thử

Tất cả chạy trên máy, bằng bản build thật (`next build` + `next start`). Kiểm bằng trình duyệt tự động (Playwright đã có
sẵn trong dự án, script để ngoài repo). **Chặn mọi lượt ghi:** `/api/track` và mọi Server Action.

1. `npm run lint` sạch · `npm test` đạt đủ như trước · `npm run build` đạt.
2. **Ảnh trước / sau** (bản hiện tại so với bản A1) ở **320 / 360 / 390 px** và **1280 px**, trên các trang: `/`,
   `/tim?loai=an`, `/dia-diem/[id]` (một chỗ có ảnh, một chỗ không), `/so` + một Sổ, `/lo-trinh` + một Lộ trình,
   `/ghi-chu`, `/gioi-thieu`, một trang lễ hội, `/admin` (trang đăng nhập).
3. **Nền và chữ:** đọc màu tính toán. Trang khách nền `#F6F5F1`, `/admin` nền trắng như cũ.
4. **Font:** trang dùng đúng Be Vietnam Pro, đủ 4 độ đậm. Không có yêu cầu nào tới `fonts.googleapis.com` /
   `fonts.gstatic.com`. Đo tổng dung lượng font tải ở Trang chủ, trước và sau.
5. **Dấu tiếng Việt:** một trang thử tạm (không commit) có chuỗi đủ dấu: “Ắ Ằ Ẳ Ẵ Ặ ắ ằ ẳ ẵ ặ Ố Ồ Ổ Ỗ Ộ ữ ự ỳ ỵ ỷ ỹ đ Đ ₫”,
   một bản Unicode tổ hợp (NFD), ở 4 độ đậm. Thêm tên địa điểm thật dài trong ô bị cắt chữ (`truncate`, `line-clamp`):
   dấu chồng trên chữ hoa không bị cắt mất.
6. **Nhảy bố cục khi font tải:** đo CLS (chỉ số nhảy bố cục) ở `/` và `/dia-diem/[id]` khi mạng bị giả lập chậm, trước và sau.
7. **Tràn ngang:** ở 320px không trang nào cuộn ngang. Nút, mục điều hướng, chip không vỡ dòng xấu, vì Be Vietnam Pro
   rộng hơn Geist.
8. **Focus:** bấm Tab trên trang khách thấy viền 2px màu hành động, rõ trên nền kem và nền trắng; `/admin` như cũ.
9. **Dark mode:** giả lập máy bật chế độ tối → trang vẫn sáng, chữ đọc được (không hỏng điều đã sửa 20/8).
10. **Chức năng không đổi:** đi luồng Trang chủ → Tìm → Chi tiết → mở chọn Sổ (không gửi) → Sổ → Lộ trình; các trang
    chính trả 200, không lỗi JS.

## 8. Điều kiện nghiệm thu A1

- [ ] Diff chỉ trong 3 file ở §5. Không có file logic, API, admin, game.
- [ ] Lint, test, build đạt.
- [ ] Token đúng giá trị DESIGN §2 (Cơ bản). Mọi cặp chữ/nền trong bảng §3.1 đạt ≥ 4,5:1 (tính toán; đo trên máy thật ở TEST A).
- [ ] Trang khách nền `#F6F5F1`; `/admin` không đổi màu.
- [ ] Be Vietnam Pro hiển thị đủ dấu ở 4 độ đậm, cả chuỗi NFD; không ô vuông, không dấu bị cắt.
- [ ] Không gọi Google Fonts lúc chạy. Dung lượng font ghi vào báo cáo; nếu Trang chủ tải **> 150 KB** font, đề xuất
      bỏ tải trước (preload) độ đậm 600/700.
- [ ] CLS do font **không cao hơn** bản hiện tại và ≤ 0,1.
- [ ] 320 / 360 / 390 / 1280 px: không cuộn ngang; ảnh trước/sau không có vỡ bố cục. Chỗ chữ dài hơn nhưng vẫn đúng thì
      ghi lại cho bước màn tương ứng.
- [ ] Focus thấy rõ trên trang khách.
- [ ] Máy bật dark mode: trang vẫn sáng.
- [ ] Luồng chính chạy như cũ, không lỗi JS.

## 9. Rủi ro

| Rủi ro | Mức | Xử lý |
|---|---|---|
| Be Vietnam Pro rộng và cao hơn Geist → xuống dòng nhiều hơn, dấu chữ hoa bị cắt trong ô `truncate` / chiều cao cố định | TB | Kiểm ở §7.5, §7.7. Lỗi làm không đọc được thì sửa tối thiểu ngay trong A1 (chiều cao dòng) và liệt kê; lỗi chỉ thẩm mỹ ghi cho bước màn |
| `next build` phải tải font từ Google; mạng lỗi lúc build thì build hỏng | Thấp | Build lại. Lặp lại nhiều lần thì chuyển sang `next/font/local` với file font nằm trong repo (báo PM trước) |
| Tải 8 file font thay vì 2 | Thấp | Chỉ 4 độ đậm, 2 bộ chữ; đo ở §7.4, ngưỡng 150 KB |
| Sau A1, `main` có font và nền mới nhưng màu các màn còn cũ (giao diện lẫn) | Thấp | Không deploy tới RELEASE A. Cần sửa gấp production thì làm từ mốc `e3b38a4` (Q3), không deploy `main` |
| `:has()` không có trên trình duyệt rất cũ (iOS < 15.4) | Thấp | Khung `.cdp-site` vẫn tô nền; chỉ vùng vuốt quá đầu trang còn trắng |
| Trang game / lễ hội (trong khung khách) đổi nền kem + font mới | Thấp | Game đã kết thúc 27/9; màu riêng của game giữ nguyên; xem ảnh ở §7.2 |
| `/admin` đổi font | Thấp | Q1. Chỉ font, không đổi màu / bố cục |

## 10. Cần PM quyết định trước khi code

- **Q1 — Font cho `/admin`.** Khuyến nghị: **dùng Be Vietnam Pro cho cả `/admin`**. Font nạp ở gốc web, nên giữ
  Geist riêng cho admin thì phải nạp 2 bộ font. Geist cũng không có dấu tiếng Việt. Admin chỉ đổi font, màu và bố
  cục giữ nguyên. Phương án khác: giữ Geist cho admin, tốn thêm code và dung lượng.
- **Q2 — Viền ô nhập.** DESIGN §2 chỉ có `--line` (1,3:1 trên nền trắng). Viền ô nhập hiện nay (`zinc-300`) cũng
  chỉ 1,5:1, dưới mức 3:1 nên có cho viền thành phần nhập liệu. Khuyến nghị: **bổ sung token `--line-strong`
  `#858D88`** (3,4:1 trên nền trắng, 3,1:1 trên nền kem), chỉ dùng cho viền ô nhập, ô tìm, chip lọc. Đây là sửa nhỏ
  DESIGN §2, cần PM duyệt. Nếu duyệt, A1 khai báo luôn token này; áp vào ô nhập ở A4/A5. Nếu không duyệt, ô nhập
  dùng `--line` như hiện trạng.
- **Q3 — Mốc sửa gấp production.** Khuyến nghị: **gắn tag Git `prod-2026-09-30` vào `e3b38a4`** trước khi code A1.
  Từ A1 tới RELEASE A, `main` chứa giao diện dở, không deploy được. Có tag thì sửa gấp làm từ mốc đó, không lẫn
  với A. Chỉ thêm nhãn, không đổi lịch sử.

## 11. Quay lại nếu lỗi

- A1a, A1b là 2 commit riêng: `git revert <mã>` từng cái rồi push. Không đụng dữ liệu, nên quay lại không mất gì.
- Production không đổi trong A1 (không deploy). Điểm kiểm soát: báo cáo A1 (diff, kết quả test, ảnh trước/sau) để
  PM nghiệm thu trước khi sang A2.
