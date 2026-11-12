# REPORT A2 — Khung trang + thanh đáy + Menu (chờ PM nghiệm thu)

| | |
|---|---|
| Ngày | 2026-11-12 |
| Kế hoạch / quyết định | [SPEC-A2-khung-dieu-huong.md](SPEC-A2-khung-dieu-huong.md) (§14: Q1–Q5) · [PM-DUYET-PLAN-A2-CDP-2026-11-12.md](PM-DUYET-PLAN-A2-CDP-2026-11-12.md) |
| Trạng thái | **BUILD A2 xong, đã push. CHƯA DEPLOY, CHƯA RELEASE.** Chưa làm A3 |
| Ảnh trước / sau | https://claude.ai/artifact/KFGeAHdFkFcKYkcmyi33by (riêng tư, chủ dự án chia sẻ cho PM) |

## 1. Commit

| Commit | Nội dung | File |
|---|---|---|
| `9c35ef2` | Tài liệu: Q1–Q5 vào SPEC §14, DECISIONS; “Góp một chỗ mới” vào INBOX §9 | docs |
| **`6285ed5`** A2-0 | Tên thương hiệu đủ ở mọi cỡ và mức phóng chữ; `/tim` dùng chiều cao header đo thật | `SiteHeader.js`, `AppShell.js`, `tim/SearchResults.js` |
| **`4e546e8`** A2-a | Header, Menu, sidebar, footer đổi sang token màu (bố cục không đổi) | `SiteHeader.js`, `AppShell.js`, `SiteFooter.js` |
| **`6e43aa6`** A2-b | Thanh đáy 4 mục, mục `search` trong cấu hình, `viewport-fit=cover` | `BottomNav.js` (mới), `lib/shellRoutes.js` (mới), `tests/shellRoutes.test.js` (mới), `lib/navigation.js`, `NavigationIcon.js`, `SiteHeader.js`, `AppShell.js`, `layout.js` |
| **`7f56897`** A2-c | Menu 3 mục phụ, nổi đè trang; sidebar nhóm lõi/phụ | `SiteHeader.js`, `AppShell.js`, `lib/shellRoutes.js`, test |
| **`ed6e927`** | Footer ở `/admin` giữ màu cũ (token khai trên `:root` làm footer Admin đổi theo) | `SiteFooter.js`, `AppShell.js` |

Tổng diff code `9c35ef2..ed6e927`: **10 file, +609 / −124**. Tất cả nằm trong bảng file SPEC §7. Riêng `SearchResults.js` nằm
trong diff A2-0 đúng như PM cho phép, và chỉ đổi 1 dòng code cùng chú thích.

Không đụng: API, `*Actions.js`, `app/admin/`, `PlaceDetail.js`, các `page.js` của màn, dữ liệu Redis, PRODUCT.md, game.

## 2. A2-0 — kết quả riêng

**Cách làm.** Bỏ hẳn `truncate`, rồi chia lại khoảng trống:

| Khoảng trống | Trước | Sau |
|---|---|---|
| Logo ↔ tên | 10px | 8px |
| Tên ↔ nút | 12px | 8px |
| Đệm nút Menu | 12px | 10px |

Logo vẫn 26px, chữ vẫn 14px đậm, nút Menu vẫn cao 44px.

Header có 3 nấc, trình duyệt tự chọn:
1. Một hàng, tên một dòng.
2. Một hàng, tên 2 dòng **theo cụm** “Chạm Địa / Phương”.
3. Nút Menu xuống hàng dưới, tên vẫn đủ.

Tên tối đa 2 dòng, không bao giờ mỗi từ một dòng, không bao giờ ngắt giữa từ.

**Lỗi gốc tìm được khi làm.** Logo có `max-width: 100%` (mặc định của Tailwind). CSS coi ảnh như vậy là “co được về
0” khi tính bề rộng tối thiểu, nên ở 320px/150% và 390px/200% tên tràn xuống dưới nút Menu. Đã sửa bằng
`max-w-none`.

**`/tim`.** Header tự đo chiều cao thật và ghi vào biến `--cdp-header-h`. Hàng tìm dùng biến này thay cho số 57 cố
định. Header thật cao 65px, nên trước đây ô tìm bị che 8px.

**Số đo.** Mỗi lần chạy kiểm 218 trạng thái gồm:
- 13 trang khách × 320/360/390/1280px, trên Chromium và WebKit;
- Menu mở;
- phóng chữ 125/150/200% trên 4 trang.

Cỡ chữ được chèn vào HTML trước khi tải, giống cài đặt cỡ chữ của máy.

| Kiểm | Trước A2 | Sau A2 |
|---|---|---|
| Trạng thái có “…”, chữ tràn, phần tử chồng nhau hoặc cuộn ngang | **194/194 lỗi** | **0/218** |
| Ô bị cắt “…” trên trang khách ở 320px (bộ kiểm A1) | 1 trang/1 ô (tên) | **0** |
| Ô tìm `/tim` bị header che khi cuộn | 8px (chữ thường) → 72px (200%) | **0px ở mọi mức** |
| Nút Menu | 85,7 × 44px | 81,7 × 44px (≥ 44px) |

Số dòng của tên và chiều cao header (Chromium = WebKit):

| | Chữ thường | 125% | 150% | 200% |
|---|---|---|---|---|
| 320px | 1 dòng · 65px | 2 dòng · 81px | 1 dòng, Menu xuống hàng · 129px | 2 dòng, Menu xuống hàng · 207px |
| 360px | 1 · 65px | 2 · 81px | 2 · 97px | 2, Menu xuống hàng · 207px |
| 390px | 1 · 65px | 1 · 81px | 2 · 97px | 2, Menu xuống hàng · 207px |
| 1280px (sidebar) | 1 dòng | 2 dòng | 2 dòng | 2 dòng |

Ảnh header 320px trước/sau và bằng chứng ở mức 200% nằm trong trang ảnh.

## 3. Thanh đáy, Menu, sidebar

**Thanh đáy** (< 1024px):
- 4 mục Trang chủ · Tìm chỗ · Sổ · Lộ trình. Nhãn lấy từ cấu hình; production chưa lưu cấu hình nào (đã kiểm lại bằng token chỉ đọc trước khi đổi).
- Ở 320px mỗi mục rộng 80px, vùng chạm cao 56px, chữ 13px.
- Mục đang mở: chữ đậm, gạch chân màu cam, `aria-current`.
- **Ẩn** ở Chi tiết chỗ và 2 trang sửa (đã có thanh riêng), và ở `/admin`. **Hiện** ở Sổ/Lộ trình chi tiết và Lộ trình chia sẻ (Q2).

**Menu:**
- Gồm Ghi chú của tôi · CDP là gì? · Lễ hội (lưu trữ). Bốn mục lõi chuyển xuống thanh đáy, nên không mục nào bị mất.
- Menu nổi đè lên trang và có lớp mờ phía sau.

**Sidebar:** 4 mục lõi ở trên, đường kẻ, rồi mục phụ. Nhãn dài xuống dòng, không cắt.

| Kiểm | Kết quả |
|---|---|
| Hiện/ẩn và mục đang mở đúng từng trang (14 trang × 4 cỡ × 2 trình duyệt) | **112/112** đạt |
| Bề rộng mỗi mục = ¼ màn hình; vùng chạm ≥ 44px | Đạt |
| Footer / nội dung cuối trang bị thanh che | **Không**. Khoảng cách nhỏ nhất 19,6px |
| Phóng chữ 125/150/200% (320, 390px) | Nhãn xuống tối đa 2 dòng, thanh cao 71–114px, không tràn, không che footer, không cuộn ngang |
| Tab qua 28 phần tử ở `/gioi-thieu` (Chromium) | **0** phần tử bị thanh che (`scroll-padding-bottom`) |
| `/admin/navigation` | Có thêm dòng “Tìm chỗ” (`/tim`), không có thanh đáy, không cuộn ngang. Không bấm Lưu |
| Menu: đúng 3 mục, mỗi dòng cao 44px | Đạt (320, 390px, cả hai trình duyệt) |
| Menu: Esc / chạm ra ngoài | Đóng và trả focus về nút Menu |
| Menu: bấm mục / nút Back của trình duyệt | Đóng |
| Menu mở: trang nền | Không cuộn (`overflow: hidden`), vị trí cuộn giữ nguyên 400 → 400 |
| Sidebar thu gọn | Logo có `aria-label="Chạm Địa Phương — Trang chủ"` + `title`, Tab tới được (Chromium). Mở rộng lại: tên đủ |

**Luồng chính** đi bằng thanh đáy, ở 390px, trên cả Chromium và WebKit: **11/11** bước đạt.
- Đi qua: Trang chủ → Tìm chỗ → gõ “Phở” (thanh ẩn) → Chi tiết (không có thanh đáy) → Lưu (bị chặn đúng) → Back → Sổ → Lộ trình → Menu → Ghi chú.
- Mở thẳng link Sổ chi tiết rồi bấm Trang chủ trên thanh đáy: về được.
- Mở thẳng link Chi tiết chỗ rồi bấm logo: về được.

## 4. Bàn phím và vùng an toàn iOS

**Đã kiểm trên giả lập** (Chromium và WebKit của Playwright, màn cảm ứng 390px). **Chưa kiểm trên iPhone thật.**

| Tình huống | Kết quả (cả hai trình duyệt) |
|---|---|
| Chạm ô tìm `/tim` | Thanh trượt xuống, bị vô hiệu (`inert`) |
| Chuyển sang ô thứ hai | Thanh **không** nhấp nháy hiện lại (lấy mẫu mỗi 10ms) |
| Rời ô | Thanh hiện lại |
| Ô vẫn được chọn nhưng khung nhìn giãn lại (Android đóng bàn phím bằng nút Quay lại) | Thanh hiện lại (đường dự phòng `visualViewport`) |
| Chạm lại ô đó (khung nhìn co) | Thanh ẩn lại |
| Gõ ở `/tim` → mở chi tiết → Back | Thanh hiện bình thường |

**Cách nhận biết bàn phím:**
- Cách chính: ô gõ chữ đang được chọn trên màn cảm ứng.
- Không dùng ngưỡng `innerHeight`.
- `visualViewport` chỉ dùng để hiện lại thanh. Trình duyệt không có `visualViewport` thì vẫn chạy bằng cách chính.

**Vùng an toàn:**
- Thẻ viewport giờ là `width=device-width, initial-scale=1, viewport-fit=cover`.
- Thanh đáy đệm `env(safe-area-inset-bottom/left/right)`. Khung trang khách đệm 2 bên theo `env(safe-area-inset-left/right)`.
- Trên máy tính và giả lập các giá trị này bằng 0. Kết quả thật (vạch Home, thanh Safari co giãn, xoay ngang, màn thấp, trình duyệt Zalo/Facebook) **chỉ kiểm được trên máy thật.** Đây là cổng trước RELEASE A theo PM Q3.

## 5. Kiểm tổng (so với sau A1, cùng bộ kiểm A1)

| Kiểm | Kết quả |
|---|---|
| `npm run lint` · `npm test` · `npm run build` | Sạch · **76/76** (70 cũ + 6 mới) · đạt. Chạy sau từng commit |
| Trạng thái trang | 64/64 Chromium + 7/7 WebKit trả 200 |
| Cuộn ngang | 0 trang, mọi cỡ |
| Lỗi JS | Số lượng giống hệt sau A1 ở từng trang. Tất cả là “Failed to fetch” / “Load failed” (WebKit) do chặn POST |
| CLS, mạng giả lập chậm, trung vị 3 lần | `/` 0 · `/dia-diem/an-01` 0 · `/dia-diem/ngu-01` 0 (không đổi) |
| Focus thấy được (12 phần tử đầu mỗi trang) | Không trang nào kém hơn |
| Chế độ tối | Vẫn nền kem `#F6F5F1` |
| `/admin` | Khác 0% điểm ảnh so với sau A1, riêng `/admin/navigation` thêm 1 dòng |
| Chiều cao trang có thanh đáy | +57px (khoảng trống chừa cho thanh) |
| Ghi dữ liệu thật | Không. Log máy chủ có 11 lần Redis từ chối lệnh ghi analytics (`NOPERM`) |
| Tương phản các cặp màu khung mới | 6,05–12,28 : 1 (mục đang mở, nút Menu, chữ phụ, chú thích sidebar) |

## 6. Lỗi / rủi ro còn lại

1. **Chưa kiểm trên iPhone thật, Android thật, trình duyệt Zalo/Facebook.** Chưa kiểm vùng an toàn, bàn phím thật và thanh trình duyệt co giãn. Bắt buộc trước RELEASE A.
2. **Xoay ngang iPhone với `viewport-fit=cover`.** Khung khách đã đệm 2 bên. Tuy vậy các lớp cố định của màn khác đặt `inset-x-0` (thanh “Lưu vào Sổ” ở Chi tiết chỗ, bộ chọn địa điểm, form đề xuất) chưa đệm theo tai thỏ. Đây là file của A6/A8, chưa sửa; mức thấp vì ít người xoay ngang. Đề xuất xử lý khi làm A6–A8.
3. **WebKit trên giả lập không Tab qua liên kết** (giống Safari mặc định). Phần kiểm Tab chỉ có kết quả trên Chromium.
4. **Một lỗi lẻ trên WebKit** khi script chuyển trang lúc trang `/tim` đang tải trước trang Giới thiệu (“access control checks”). Chạy riêng không tái hiện được. Đây là lượt tải trước bị huỷ, không phải lỗi khách gặp.
5. **Biểu tượng “Trang chủ” đổi từ la bàn sang ngôi nhà** cho khớp nhãn mới (Q1). Thêm kính lúp (Tìm chỗ) và lịch (Lễ hội). Nếu PM muốn giữ la bàn thì đổi 1 chỗ trong `NavigationIcon.js`.
6. **Footer dùng chữ 12px** (`text-xs`), dưới mức tối thiểu 13px của DESIGN. A2 chỉ đổi màu footer theo SPEC, chưa đổi cỡ. Đề xuất A9 (màn phụ) hoặc PM cho sửa ngay (1 lớp).
7. **Từ A1, vẫn còn:**
   - vệt dấu dưới ô `line-clamp` (A5–A7);
   - 73 chỗ chữ xám nhạt trong nội dung màn (A4–A9);
   - Admin xuống dòng khác (xem lại ở TEST A).
8. Production chưa đối chiếu trên Vercel (CLI hết phiên đăng nhập).

## 7. Quay lại (rollback)

- Production **không đổi** (không deploy).
- Bỏ từng phần trên `main` bằng `git revert`, theo thứ tự ngược: `ed6e927` → `7f56897` (Menu/sidebar) → `6e43aa6` (thanh đáy) → `4e546e8` (màu khung) → `6285ed5` (A2-0).
  - Có thể chỉ bỏ thanh đáy mà giữ A2-0: revert `ed6e927`, `7f56897`, `6e43aa6`.
  - Bỏ A2-0 sẽ đưa lại lỗi “Chạm Địa Phư…”.
- Cấu hình điều hướng: production chưa lưu bản nào, nên revert `6e43aa6` chỉ đưa nhãn mặc định về như cũ. Nếu trong lúc đó Admin lưu cấu hình 6 mục rồi mới revert, code tự bỏ bản lưu và dùng mặc định. Trang không lỗi, chỉ mất nhãn tự đặt.
- Sửa gấp production: nhánh từ tag `prod-2026-09-30`. **Không deploy `main`.**

## 8. Bước tiếp theo

PM nghiệm thu A2 (gồm điều kiện A2-0). Kiểm iPhone thật được xếp vào TEST A, trước RELEASE A. Sau khi A2 được nghiệm
thu, em trình kế hoạch A3 (minh họa + hàm chọn ảnh + dữ liệu ảnh thẻ). Chưa làm A3.
