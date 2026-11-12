# REPORT A3 — Bộ minh họa + chọn ảnh + dữ liệu ảnh thẻ (chờ PM nghiệm thu)

| | |
|---|---|
| Ngày | 2026-11-12 |
| Kế hoạch / quyết định | [SPEC-A3-anh-minh-hoa.md](SPEC-A3-anh-minh-hoa.md) (§13: Q1–Q4) · [PM-DUYET-PLAN-A3-CDP-2026-11-12.md](PM-DUYET-PLAN-A3-CDP-2026-11-12.md) |
| Trạng thái | **BUILD A3 xong, đã push. CHƯA DEPLOY, CHƯA RELEASE.** Chưa làm A4 |
| Ảnh kiểm thử | https://claude.ai/artifact/KaoM2j3fDJLntc64FMdCut (riêng tư, chủ dự án chia sẻ cho PM) |
| Danh sách ảnh legacy | [KIEM-KE-anh-legacy-2026-11-12.md](KIEM-KE-anh-legacy-2026-11-12.md) (nội bộ) |

## 1. Commit

| Commit | Nội dung | File |
|---|---|---|
| `642970e` | Tài liệu: Q1–Q4 vào SPEC §13, DECISIONS, TASKS, BACKLOG §6 | docs |
| **`81ca254`** A3-a | 5 SVG minh họa vào `web/public/minh-hoa/` | 5 SVG |
| **`2f8f425`** A3-b | `placeCoverMedia()` không bao giờ chọn ảnh menu · `lib/placeImage.js` · test | `lib/media.js`, `lib/placeImage.js`, `tests/placeImage.test.js` |
| **`5e7b5fe`** A3-c | `photo` trong dữ liệu thẻ `/tim` · test | `lib/searchResults.js`, `tests/searchResults.test.js` |
| **`29b413d`** A3-d | Component `PlaceThumb` dùng chung (chưa gắn vào màn nào) | `app/PlaceThumb.js` |

Tổng diff `642970e..29b413d`: 5 SVG + 6 file code/test, đúng danh sách PM duyệt.
- `lib/media.js`: đổi 2 dòng + chú thích.
- Không đụng: `next.config.mjs`, các màn A4–A8, API, `*Actions.js`, `/admin`, dữ liệu, PRODUCT.md.
- Trang thử `app/a3-thumb-harness/` chỉ chạy trên máy, đã xóa trước commit A3-d; `git status` sạch.

## 2. Kết quả từng phần

### A3-a — Minh họa
- **Mã băm:** SHA-256 của cả 5 file **khớp** bản duyệt trong `docs/design/minh-hoa/`.
- **Phục vụ:** `/minh-hoa/{an,choi,ngu,dilai,khac}.svg` trả 200, đúng kiểu `image/svg+xml`, 1,4–2,0 KB/file. Máy chủ gửi kèm `Cache-Control: public, max-age=0`, nghĩa là trình duyệt hỏi lại máy chủ mỗi lần; file đã có thì chỉ nhận trả lời ngắn.
- **Nội dung:** không có `<script>`, liên kết hay `<text>`. Khung `0 0 240 160`.
- **Hiển thị:** đúng ở 72, 56, 48, 44px và khung rộng × 150px, trên Chromium và WebKit (25/25 ảnh).
- **Nhận xét cho A6:** khung rộng × 150px (tỷ lệ khoảng 2,4:1) cắt mất phần trên/dưới của hình 3:2. Hình **Đi lại mất bánh xe**, **Chơi mất mặt hồ**. Khung vuông thì đủ hình. A6 cần chọn cách đặt hình (vị trí cắt, hoặc khung 3:2). A3 không tự sửa.

### A3-b — Một quy tắc chọn ảnh (Q1) — kiểm trên toàn bộ dữ liệu, chỉ đọc

Dữ liệu đọc lúc 2026-11-12 15:59 UTC.

| Kiểm | Kết quả |
|---|---|
| Số chỗ | **344** (`places:live`) |
| Có ảnh thật | **16** (Ăn 11 · Chơi 2 · Ngủ 3 · Đi lại 0 · Chỗ quen gọi 0) |
| Minh họa | **328** (Ăn 181 · Chơi 54 · Ngủ 68 · Đi lại 23 · Chỗ quen gọi 2 → `khac.svg`) |
| Ảnh được chọn là ảnh menu | **0** |
| Chỗ chỉ có ảnh menu | 1, ảnh menu **vẫn còn** cho khối thực đơn |
| **Chỗ có ảnh đại diện khác giữa hàm cũ và mới** | **1**, đúng dự kiến: `pending-72c2da63…` (Ăn), ảnh menu → minh họa |

**Bốn nơi dùng ảnh đại diện, trước → sau** (chỗ chỉ có ảnh menu; trên bản build thật):

| Nơi | Trước | Sau |
|---|---|---|
| Dải ảnh trang Chi tiết | Ảnh menu đứng đầu, to như ảnh của quán | Không còn ảnh trong dải. Ảnh menu **vẫn hiện 1 lần** ở “Cần biết → Ảnh menu” |
| Thẻ địa điểm trong Sổ (2/19 Sổ có chỗ này) | Ảnh menu làm ảnh nhỏ | Không ảnh (như các chỗ chưa có ảnh) |
| Bìa ghép Sổ | Ảnh menu | Ảnh mặc định |
| Ảnh xem trước khi chia sẻ | Trang chỗ và 2 trang Sổ: ảnh menu | Ảnh mặc định hiện có (`le-hoi-thanh-tuyen-2026.jpg`) |
| Chỗ có ảnh thật khác (`ngu-01`) | 2 ảnh trong dải, ảnh xem trước là ảnh quán | **Giữ nguyên** |

Kiểm 2 Sổ bằng máy (đếm ảnh, đọc thẻ ảnh xem trước). Không chụp ảnh, không ghi tên Sổ.

Test mới (7): ưu tiên bìa; bỏ ảnh menu (kể cả ảnh menu bị gắn vai trò bìa); chỉ có menu → `null`; dữ liệu kiểu cũ
(`photos`/`coverPhoto`/`menuPhotos`); dữ liệu hỏng; bìa Sổ bỏ qua chỗ chỉ có menu; 5 nhóm + nhóm lạ → đúng file + alt
DESIGN; câu chữ nhãn.

### A3-c — Dữ liệu ảnh thẻ `/tim`

| Đo | Trước | Sau | Tăng |
|---|---|---|---|
| HTML `/tim`, nén gzip | 38,95 KB | 39,92 KB | **+0,97 KB** |
| Dữ liệu React `/tim` (khi chuyển trang trong app), nén gzip | 32,19 KB | 33,01 KB | **+0,82 KB** |
| Nén brotli (HTML / dữ liệu React) | 31,08 / 26,18 KB | 31,77 / 26,85 KB | +0,69 / +0,67 KB |

- Thấp hơn nhiều so với mức 5 KB, nên **giữ `photo: null`**, không cần bỏ khóa.
- 16 thẻ có `photo`, 326 thẻ `null` (342 chỗ duyệt được).
- **Không lộ** người gửi, nguồn, vai trò hay dung lượng: có test, và đã kiểm trên dữ liệu thật gửi xuống trình duyệt.
- `/tim` vẫn chạy như cũ: Ăn 20 thẻ → “Xem thêm” 40 thẻ; lọc giá đúng; 0 lỗi JS mới. Thẻ vẫn chưa hiện ảnh (0 ảnh), đúng phạm vi A3.
- Test mới (4): có ảnh / ảnh bìa; thiếu kích thước → `null`; chỉ menu / không ảnh → `null`; chỉ có 3 trường `url/width/height`.

### A3-d — `PlaceThumb` (Q2, Q3)

Kiểm trên trang thử chạy trên máy với 20 thẻ theo tỷ lệ thật:
- 17 minh họa đủ 4 nhóm, Chỗ quen gọi, nhóm lạ, tên dài nhất;
- 1 ảnh thật có kích thước;
- 1 ảnh thật không ghi kích thước;
- 1 ảnh hỏng (đường dẫn Blob không tồn tại, giống ảnh bị xóa);
- 3 ảnh kiểu Chi tiết.

Chạy ở 320/360/390px trên Chromium và WebKit.

| Kiểm | Kết quả |
|---|---|
| Trạng thái 20 thẻ | Mọi cỡ, cả hai trình duyệt: **17 minh họa · 2 ảnh thật · 1 ảnh lỗi → minh họa**. 0 sai |
| Alt | Ảnh thật trong thẻ: `alt=""` (Q3). Minh họa: “Hình minh họa nhóm …, chưa có ảnh thực tế” đúng nhóm; nhóm lạ / Chỗ quen gọi: “Hình minh họa, chưa có ảnh thực tế”. Kiểu Chi tiết: “Ảnh {tên}” |
| Dấu ✎ / nhãn | ✎ chỉ trên minh họa và ảnh lỗi, không trên ảnh thật. Nhãn Chi tiết: “Hình minh họa · Chưa có ảnh thực tế” / “Ảnh chưa tải được · đang hiện minh họa” |
| Khung | Luôn 72×72 (kiểu Chi tiết: cao 150px), kể cả ảnh không ghi kích thước. **CLS = 0** |
| Ảnh 72px qua bộ tối ưu | **AVIF bản 96px, 1,8–3,1 KB/ảnh** (mức cho phép ≤ 20 KB; ảnh gốc 108–403 KB) |
| Ảnh lỗi | Chuyển sang minh họa, **không tải lại**: số lượt tải ảnh hỏng đứng yên khi chờ thêm |
| Đổi ảnh / đổi địa điểm | A + ảnh hỏng → minh họa · A + ảnh tốt → **ảnh hiện** (đặt lại trạng thái lỗi) · B + ảnh hỏng → thử **đúng 1 lần** → minh họa · C + ảnh tốt → ảnh hiện |
| Quay lại ảnh đã lỗi | **Minh họa hiện ngay, 0 lượt tải lại.** Ban đầu component chỉ nhớ lần lỗi gần nhất nên quay lại sẽ thử lại; đã sửa thành nhớ mọi cặp địa điểm + ảnh đã lỗi, trước khi commit |
| Tải lười | Dùng `loading="lazy"` của trình duyệt. WebKit chỉ tải khi ảnh gần màn hình. Chromium tải sớm hơn với ảnh cách màn hình khoảng 1.250–2.500px, đây là ngưỡng có sẵn của Chromium |
| Cuộn ngang, lỗi JS | 0 · 0 |

## 3. Kiểm thử hồi quy A1/A2 (bản build cuối, không còn trang thử)

| Kiểm | Kết quả |
|---|---|
| `npm run lint` · `npm test` · `npm run build` | Sạch · **87/87** (76 cũ + 11 mới) · đạt. Chạy sau từng commit |
| 16 trang × 4 cỡ Chromium + 7 trang WebKit, so với A2 | 71/71 trả 200; **khác 0% điểm ảnh** mọi trang; chiều cao không đổi; lỗi JS không đổi; 0 cuộn ngang |
| CLS (mạng chậm, trung vị 3 lần) | `/` 0 · `/dia-diem/an-01` 0 · `/dia-diem/ngu-01` 0 (không đổi) |
| Tên “Chạm Địa Phương” | **218/218** trạng thái đạt (320–1280px, phóng chữ tới 200%, Menu mở, Chromium + WebKit) |
| Thanh đáy, bàn phím, Admin điều hướng | Xem mục 3.1 |
| Luồng chính qua thanh đáy (390px) | Chromium **11/11** · WebKit **11/11** |

### 3.1 Thanh đáy
Bộ kiểm A2, chạy lại trên bản A3. Kết quả **giống A2**:
- **112/112** lượt kiểm trang: thanh đáy hiện/ẩn đúng trang, đúng mục đang mở, mỗi mục ¼ bề ngang, vùng chạm ≥ 44px.
- Footer không bị che: cách thanh ít nhất 19,6px.
- Tab qua 28 phần tử (Chromium): 0 phần tử bị che.
- Bàn phím, cả hai trình duyệt: gõ chữ thì thanh ẩn; chuyển ô không nhấp nháy; rời ô thì hiện lại; bàn phím đóng mà ô vẫn được chọn thì hiện lại; mở chi tiết rồi Back vẫn đúng.
- `/admin/navigation`: 6 mục, không có thanh đáy, không cuộn ngang.
- Thẻ viewport có `viewport-fit=cover`.
- Lỗi JS: 69, bằng đúng lần chạy A2, đều do chặn lượt ghi.

**Ghi chú WebKit.** Một lần chạy luồng chính trên WebKit có 11 lỗi JS: 5 lỗi do em chặn lượt ghi, như A2, và 6 lỗi
“Fetch API cannot load …?_rsc=…”. 6 lỗi sau là lượt **tải trước** các liên kết trên Trang chủ bị huỷ, vì script chuyển
trang ngay khi Trang chủ chưa tải xong. Cho script chờ Trang chủ tải xong thì về đúng 5 lỗi, 2 lần liên tiếp. Không liên
quan A3. Đây là cùng mục “lỗi tải trước WebKit” đã có trong danh sách TEST A.

## 4. Quyền dùng ảnh (Q4) — chưa kết luận

Chi tiết: [KIEM-KE-anh-legacy-2026-11-12.md](KIEM-KE-anh-legacy-2026-11-12.md) (nội bộ, không ghi định danh người gửi).

- **25 ảnh legacy** ở 12 chỗ: 23 ảnh thường, 2 ảnh menu. **11/16 chỗ có ảnh đang dùng ảnh legacy làm ảnh đại diện.**
- **Nguồn truy được** — **[Fact]**:
  - Cả 25 nằm trong thư mục Blob `place-photos/`. Thư mục này do luồng “Bổ sung ảnh” của khách tạo (18/7–14/9).
  - **25/25** có bản ghi góp ý ảnh đã duyệt trong hàng góp ý.
- **Căn cứ quyền** — **[Fact]**: form lúc đó và form hiện tại **không có** câu báo ảnh sẽ công khai, cũng không có xác nhận quyền. Theo điều kiện PM, Admin đã duyệt không phải bằng chứng.
- **Tình trạng: cả 25 “chưa xác minh”.** Ở bề mặt mới (A5–A8) dùng minh họa cho tới khi xác minh. Vị trí hiện có (Chi tiết) giữ nguyên.

**Cần PM chốt trước A5:**
- 21 ảnh khách gửi sau 14/9 có cùng tình trạng: có mã người gửi ẩn danh, không có câu đồng ý.
- Chỉ **3 ảnh do Admin tải lên** là có người xác nhận được nguồn.

Nếu áp cổng chặt, thẻ tìm ở A5 có thể gần như toàn minh họa cho tới khi A6 thêm câu đồng ý và có ảnh mới.

## 5. Lỗi / rủi ro còn lại

1. **Quyền ảnh** (mục 4): cần tiêu chí xác minh trước A5.
2. **Minh họa ở khung rộng × 150px bị cắt** (Đi lại, Chơi): xử lý khi dựng Chi tiết ở A6.
3. Chromium tải ảnh lười sớm hơn WebKit (ngưỡng có sẵn của trình duyệt). Ảnh 72px chỉ 2–3 KB nên ảnh hưởng không đáng kể.
4. File minh họa trong `public/` dùng `max-age=0`: trình duyệt hỏi lại máy chủ mỗi lần xem. Mỗi file chỉ khoảng 2 KB và lượt hỏi lại rất nhẹ, nên em không đổi cấu hình (ngoài phạm vi file). Có thể xem lại ở TEST A nếu muốn đo kỹ.
5. Hạn mức tối ưu ảnh của gói Vercel chưa đọc được (CLI hết phiên). Kiểm trước RELEASE A.
6. `placeNavigationMedia()` (ảnh chỉ đường) vẫn có thể rơi về ảnh đầu tiên, kể cả ảnh menu. Hàm này không phải ảnh đại diện và chưa có màn nào dùng làm đại diện. Ghi lại để xem khi tới màn dùng nó.

## 6. Quay lại (rollback)

- Production không đổi (không deploy).
- Revert độc lập từng commit:
  - `29b413d`: component chưa dùng;
  - `5e7b5fe`: trường dữ liệu chưa màn nào đọc;
  - `2f8f425`: trả lại cách chọn ảnh cũ, lỗi ảnh menu quay lại;
  - `81ca254`: bỏ 5 file SVG.
- Không đụng dữ liệu, không có gì cần khôi phục. Sửa gấp production: nhánh từ tag `prod-2026-09-30`. **Không deploy `main`.**

## 7. Bước tiếp theo

PM nghiệm thu A3 và chốt tiêu chí xác minh quyền ảnh (mục 4). Sau đó em trình kế hoạch A4 (Trang chủ + giới hạn tiêu đề
Admin). Chưa làm A4.
