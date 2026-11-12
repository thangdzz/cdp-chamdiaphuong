# REPORT A1 — Màu theo vai trò + Font (chờ PM nghiệm thu)

| | |
|---|---|
| Ngày | 2026-11-12 |
| Kế hoạch / quyết định | [SPEC-A1-mau-va-font.md](SPEC-A1-mau-va-font.md) · [PM-DUYET-PLAN-BUILD-A1-CDP-2026-11-12.md](PM-DUYET-PLAN-BUILD-A1-CDP-2026-11-12.md) |
| Trạng thái | **PM NGHIỆM THU CÓ ĐIỀU KIỆN (12/11)** — [quyết định](PM-NGHIEM-THU-A1-VA-YEU-CAU-A2-0-CDP-2026-11-12.md): mục 3.1 thành A2-0 bắt buộc. CHƯA DEPLOY |
| Ảnh trước / sau | https://claude.ai/artifact/WW4nd64x7VzKz8RoXzV3MR (riêng tư, chủ dự án chia sẻ cho PM) |

## 1. Commit

| Commit | Nội dung |
|---|---|
| `d5d346d` | Tài liệu: ghi Q1–Q3 vào SPEC, DESIGN §2 (chú thích ¹, điều chỉnh nhỏ sau FREEZE), DECISIONS |
| tag `prod-2026-09-30` | Annotated tag → `e3b38a4`. Trước đó không có tag nào trên máy hay GitHub, không ghi đè |
| **`2ee6f00`** A1a | `Add role-based color tokens for the Basic theme` — `globals.css` + `AppShell.js` |
| **`7ca6816`** A1b | `Switch the site font to Be Vietnam Pro` — `layout.js` + `globals.css` |

Tổng diff code `d5d346d..7ca6816`: **3 file, +70 / −14 dòng**:
- `web/app/globals.css`: token `:root` gồm cả `--line-strong`, `@theme inline`, `body:has(.cdp-site)`, `@layer base`
  cho `.cdp-site` (nền, chữ, focus), font.
- `web/app/AppShell.js`: 1 class `cdp-site` + 1 dòng chú thích.
- `web/app/layout.js`: Geist / Geist Mono → `Be_Vietnam_Pro` (latin + vietnamese, 400/500/600/700, swap).

Không file nào trong `lib/`, `app/api/`, `*Actions.js`, `app/admin/`, `app/_game/`. Không sửa PRODUCT.md, dữ liệu, Sổ.

## 2. Kiểm thử

**Môi trường:** bản build thật (`next build` + `next start`) chạy trên máy.
- Kết nối Redis bằng **token chỉ đọc**. Bỏ trống token Blob, cron và mật khẩu admin.
- Phiên admin dùng **khóa thử riêng**, không phải khóa thật.
- Trình duyệt tự động chặn mọi request không phải GET và `/api/track`.
- Bằng chứng không ghi được dữ liệu: log máy chủ có 6 lần Redis từ chối lệnh ghi analytics (`NOPERM … evalsha`).
  Đó là lượt ghi phía máy chủ khi mở trang, đã bị token chỉ đọc chặn.

**Phạm vi chụp:**
- 16 trang × 4 cỡ (320 / 360 / 390 / 1280) trên Chromium.
- 7 trang ở 390px trên WebKit (lõi của Safari).
- Chụp cả trước (code `d5d346d`) và sau (`7ca6816`).
- Các trang: `/`, `/tim?loai=an`, 3 trang chi tiết (có ảnh, không ảnh, tên dài nhất), `/so`, 1 Sổ, `/lo-trinh`,
  1 Lộ trình, 1 Lộ trình chia sẻ, `/ghi-chu`, `/gioi-thieu`, lễ hội, `/admin` (đăng nhập + trang duyệt),
  `/admin/navigation`.

| Kiểm | Kết quả |
|---|---|
| `npm run lint` · `npm test` · `npm run build` | Sạch · **70/70** · đạt (chạy sau từng commit) |
| Trạng thái trang | 64/64 trang Chromium + 7/7 WebKit trả 200, trước và sau như nhau |
| Nền | Trang khách `rgb(246,245,241)` = `#F6F5F1`; `/admin` trắng như cũ |
| Font | `Be Vietnam Pro` đủ 4 độ đậm. **Không có request nào tới `fonts.googleapis.com` / `fonts.gstatic.com`** |
| Dung lượng font (đo thật) | Trước: 4 file · 75 KB. Sau: Trang chủ 11 file · 92 KB; các trang khác 85–99 KB. **Dưới mốc 150 KB**, chưa cần bỏ tải trước |
| CLS, mạng giả lập chậm (1,6 Mb/s, 150 ms), 3 lần, lấy trung vị | `/` 0 → 0 · `/dia-diem/an-01` 0 → 0 · `/dia-diem/ngu-01` 0,067 → **0**. Không tệ hơn, ≤ 0,1 |
| Cuộn ngang | **0** trang, ở mọi cỡ, trước và sau |
| Dấu tiếng Việt | Chuỗi đủ dấu (Ắ…Ặ, Ố…Ộ, ữ ự ỳ ỵ ỷ ỹ, đ Đ ₫) ở 4 độ đậm, dạng NFC và NFD, trên Chromium và WebKit. Hiển thị đúng, không ô vuông, NFC/NFD cao bằng nhau. Trước A1 chữ bị trộn font (“₫” lấy từ font khác) |
| Dấu chữ hoa trong ô `truncate` | “ỶỸẬẶ…” trong ô 1 dòng: **không bị cắt** khi nhìn ảnh phóng to (xem mục 3.2 về `line-clamp`) |
| Rà ô `overflow-hidden` / `truncate` / `line-clamp` | Tìm tự động mọi ô cắt chữ trên mỗi trang, tính trường hợp xấu nhất (chữ hoa dấu chồng). Trang khách: 1–6 ô/trang có thể sát mép trên tới ~2px (tiêu đề đầu trang, mục sidebar, địa chỉ 2 dòng). Admin: 2 loại dòng trong danh sách (~1,9px). Ảnh phóng to cho thấy dấu không bị mất. Đây là cảnh báo theo tính toán, không phải lỗi đã thấy |
| `outline-none` | Trang khách không có phần tử nào. Admin có 3 ô (dùng `focus:border`), vẫn như cũ vì admin không nằm trong `cdp-site` |
| Focus bằng Tab | 12 phần tử đầu mỗi trang đều có dấu focus thấy được, trước và sau. Sau A1: `outline 2px solid rgb(176,74,51)`, cách 2px |
| Chế độ tối | Giả lập máy bật dark mode: Chromium và WebKit vẫn nền kem, `color-scheme: light` |
| Luồng chính (390px) | Trang chủ → chạm “Ăn” → `/tim?loai=an` → tìm “Phở” → Xem chi tiết → bấm Lưu vào Sổ (lượt ghi bị chặn đúng) → Quay lại về `/tim?q=Phở` → `/so` → `/lo-trinh`: chạy đủ |
| Lỗi JS | Chỉ “Failed to fetch” do chặn POST (Server Action đọc Sổ/Lộ trình, lưu). Trước và sau **giống hệt** |
| Khác biệt điểm ảnh | Trang khách 21–83% (do nền kem + font). Admin 1–21% (chỉ font) |

**Chưa tuyên bố toàn site đạt tương phản.** 73 chỗ `text-zinc-400` (2,6:1) và các màu cũ của từng màn còn nằm
trong A2–A9. Nút vẫn là `#c8553d` cũ cho tới bước màn.

## 3. Lỗi / bất thường còn lại (chưa sửa, đều ngoài 3 file)

1. **320px: tên “Chạm Địa Phương” ở đầu trang bị rút gọn thành “Chạm Địa Phư…”.** Font mới rộng hơn; từ 360px trở
   lên vẫn đủ. Đầu trang ở `SiteHeader.js`, là file thứ tư và thuộc A2 (khung + thanh đáy + Menu). Mức: thẩm mỹ,
   logo vẫn còn. **Đề xuất xử lý ở A2.**
2. **Dấu của dòng bị ẩn lấp ló dưới ô `line-clamp`.** Khi dòng thứ 3 bị ẩn có dấu chồng cao, ~1–2px dấu lộ ra ở mép
   dưới ô 2 dòng. Gặp cả trên Chromium và WebKit; Geist không bị. Chỉ thấy khi dòng ẩn có dấu cao, không cản trở
   đọc. Sửa bằng chiều cao dòng trong file từng màn. **Đề xuất xử lý ở bước màn có ô đó** (Tìm chỗ A5, Chi tiết A6,
   Sổ A7).
3. **Admin xuống dòng khác.** Ở 390px hàng tab admin xuống dòng sau “Content Inbox” thay vì sau “Game”. Danh sách
   có thêm tên bị “…” (390px: 6 → 11; 320px: 39 → 47). Trang dài thêm ~100px. Nhãn và nút đủ, không cuộn ngang,
   màu không đổi. Mức: chấp nhận được theo Q1; không sửa (admin ngoài phạm vi).
4. Lần chạy chụp ảnh “sau” đầu tiên lỗi giữa chừng, lần hai chạy đủ. Log máy chủ có một lỗi hết thời gian kết nối
   Redis (mạng), không liên quan A1.
5. **Production chưa được kiểm trực tiếp trên Vercel.** CLI hết phiên đăng nhập. A1 không deploy nên không ảnh hưởng.

## 4. Quay lại (rollback)

- Production **không đổi** (không deploy). Quay lại chỉ là chuyện của `main`.
- `git revert 7ca6816` (bỏ font) và/hoặc `git revert 2ee6f00` (bỏ token), rồi push. Hai commit độc lập: bỏ font
  không ảnh hưởng token và ngược lại. Không đụng dữ liệu nên không mất gì.
- Cần sửa gấp production trước RELEASE A: tách nhánh từ tag `prod-2026-09-30`, sau khi đã đối chiếu deployment thật
  trên Vercel. **Không deploy `main`.**

## 5. Bước tiếp theo

PM nghiệm thu A1 và chọn cách xử lý điểm 3.1 và 3.2 (đề xuất: để A2 và các bước màn). Sau đó em trình kế hoạch ngắn
cho A2 (khung + thanh đáy + Menu) trước khi code.
