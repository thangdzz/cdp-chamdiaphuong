# REPORT A4 — Trang chủ B + tiêu đề Admin 60 ký tự (13/11/2026)

> Viết cho PM để nghiệm thu A4. Kế hoạch: [SPEC-A4-trang-chu.md](SPEC-A4-trang-chu.md). Duyệt:
> [PM-DUYET-PLAN-A4-VA-ROLLBACK-CDP-2026-11-13.md](PM-DUYET-PLAN-A4-VA-ROLLBACK-CDP-2026-11-13.md).
> Ảnh trước/sau + tọa độ: https://claude.ai/artifact/15jnW8veCXVEFpR4f7JWe3
>
> **Chưa deploy, chưa release, không rollback. Chưa làm A5.** Tag `prod-2026-09-30` → `e3b38a4` không đổi.

## 1. Commit (đều đã push lên `main`, mỗi commit đã lint + test + build)

| Commit | Nội dung | File |
|---|---|---|
| `6fc8361` | Tài liệu: ghi duyệt PLAN A4, xác nhận ảnh của chủ dự án, mức xác minh rollback (trước khi code) | docs |
| `69992c8` **A4-a** | Admin: tiêu đề Trang chủ tối đa 60 ký tự, bộ đếm NFC, máy chủ kiểm lại; mặc định “Hôm nay bạn muốn ghé đâu?” | `lib/homeTitle.js` (mới), `tests/homeTitle.test.js` (mới), `lib/navigation.js`, `app/admin/navigation/HomeTitleField.js` (mới), `app/admin/navigation/page.js`, `app/admin/navigation/actions.js` |
| `7ef5a7a` **A4-b** | Trang chủ B Cơ bản: thứ tự mới, 4 nhóm có biểu tượng, bỏ “CDP giúp bạn”, theo mùa chỉ khi còn hiệu lực, token màu | `app/page.js`, `app/HomeLinks.js`, `tests/homeTitle.test.js` |
| `15f0afa` **A4-c** | Thẻ “Bắt đầu Sổ đầu tiên” | `app/HomeFirstNotebook.js` (mới), `app/page.js` |

Đúng 9 file trong SPEC §4, không file nào ngoài danh sách. Không đổi API, Redis, Blob, dữ liệu, PRODUCT.md, màn A5–A9.

## 2. Đã làm gì

**A4-a — Admin.**
- `lib/homeTitle.js` là **một nguồn đếm** cho cả bộ đếm trên trình duyệt và lượt lưu ở máy chủ. Hàm đếm theo ký tự sau khi chuẩn hóa NFC, bỏ khoảng trắng thừa và ký tự điều khiển giống hệt lúc lưu.
- Tiêu đề mặc định đếm ra **25/60**. Con số lấy từ code và có test, không viết cứng.
- Ô “Tiêu đề trang” của Trang chủ:
  - bỏ `maxLength`, nên dán câu dài không bị cắt;
  - có bộ đếm “n/60”;
  - khi quá 60 hoặc để trống: báo đỏ (`aria-live`), đánh dấu ô không hợp lệ, khóa nút Lưu.
- Máy chủ kiểm lại khi lưu. Quá 60 thì không lưu, quay lại với câu “Tiêu đề trang chủ đang có N ký tự, tối đa 60. Cấu hình cũ chưa bị thay đổi.”
- Tiêu đề Trang chủ được lưu dạng NFC. Lúc đọc vẫn nhận tới 120 ký tự, nên bản lưu cũ dài hơn vẫn hiện đủ. Các trang khác giữ giới hạn 120.

**A4-b — Trang chủ.**
- Thứ tự: khẩu hiệu → H1 (26px; 30px từ 1024px) → câu dẫn giữ nguyên (Q1) → ô tìm → 4 nhóm.
- Ô tìm:
  - viền `line-strong`, nút `action`;
  - gợi ý “Tên quán, chỗ ngủ, địa chỉ…”;
  - không tự focus.
- 4 nhóm: biểu tượng nét theo mockup (bát, cờ, giường, xe), lưới 2×2 trên điện thoại và 4 cột từ 640px. Ô cao ≥ 64px. Khi phóng chữ lớn, chữ xuống dưới biểu tượng thay vì tràn ngang.
- Bỏ khối “CDP giúp bạn” (Q2).
- Thẻ lễ hội chỉ hiện khi lịch còn mốc sắp tới hoặc đang diễn ra. Hết mùa thì không còn thẻ nhỏ “đã diễn ra”, và trang lưu trữ vẫn mở từ Menu.
- Ảnh lễ hội bỏ thuộc tính `priority` (Next 16 đã ngừng hỗ trợ). Thẻ này nằm dưới màn đầu, nên không cần tải trước.

**A4-c — Thẻ người mới.**
- Câu chữ theo mockup bảng 1. Câu cuối: “Không cần đăng nhập. Sổ gắn với thiết bị này.”
- Hiện hay ẩn (Q3):
  - máy chưa có mã ẩn danh → hiện, không gọi mạng;
  - có mã → dùng hàm đọc sẵn có `getMyNotebooks`, 0 Sổ → hiện;
  - có Sổ → ẩn;
  - đang tải hoặc lỗi → ẩn.
- Không thêm API. Không ghi mã ẩn danh ra log.
- **Chống nhảy bố cục:** máy chủ dựng sẵn khung thẻ ở trạng thái vô hình (`visibility: hidden`, `aria-hidden`), nên đang tải vẫn là “ẩn” đúng Q3. Khi biết là người mới thì chỉ đổi sang hiện, bố cục đứng yên. Có Sổ hoặc lỗi thì gỡ khung. Xem §5.
- JS Trang chủ tăng 0,6 KB (222,4 → 223,0 KB). Form góp ý không bị kéo theo.

## 3. Kiểm thử

**Môi trường:**
- bản build thật trên máy (`next start`);
- Redis token chỉ đọc;
- trình duyệt chặn mọi lượt ghi và `/api/track`.

Riêng lượt **đọc** `getMyNotebooks` được cho qua khi thử thẻ người mới. Mã ẩn danh của một Sổ có sẵn chỉ dùng trong trình duyệt thử, không in ra và không chụp.

| Phần | Kết quả |
|---|---|
| Lint, `npm test` (95 test; 8 mới: 60/61, NFC/NFD, dán 80, khoảng trắng, rỗng, câu lỗi máy chủ, theo mùa), build — sau **mỗi** commit | Đạt |
| Admin (1280 + 390px): 25/60 · NFD 25/60 · 60 lưu được · 61 báo + khóa + `aria-invalid` · dán 80 giữ đủ 80 · Enter/bấm Lưu khi vượt không gửi · chữ còn nguyên · xóa về ≤ 60 mở lại · rỗng khóa · các ô khác vẫn `maxLength` 120 · **tắt JS gửi 61 → máy chủ từ chối, tiêu đề cũ giữ nguyên** · tham số giả không hiện câu lạ | **33/33 Chromium · 33/33 WebKit** |
| Thẻ người mới: máy mới (0 lượt gọi) · có mã 0 Sổ · có Sổ → ẩn · lỗi mạng → ẩn · đang tải 3 giây → ẩn rồi hiện · đúng câu chữ · nằm sau 4 nhóm · ô tìm không tự focus · Tab tới có viền focus · “Phở” → `/tim?q=Phở` đúng 1 `search_use` · “Ăn” → `/tim?loai=an` đúng 1 `category_pick` | **13/13 Chromium · 13/13 WebKit** |
| Theo mùa: trước 20/9 và đang diễn ra → hiện; sau 27/9 và hôm nay → ẩn (test thuần với lịch thật); trang thật hôm nay không có thẻ | Đạt |
| Trang chủ ở 320×568, 360×640, 390×664, 390×844, 1280×800 × tiêu đề mặc định / 60 ký tự rộng nhất / 120 ký tự cũ × Chromium + WebKit; phóng chữ 125/150/200% ở 320×568 và 390×664 | 0 cuộn ngang, tên thương hiệu đủ, H1 không bị cắt (§4) |
| Hồi quy: 16 trang × 4 cỡ (Chromium) + 7 trang WebKit, so ảnh với bản trước A4 | **Chỉ `/` và `/admin/navigation` đổi.** 14 trang còn lại lệch 0%, số lỗi trên trang giữ nguyên |
| Tên thương hiệu (bộ A2-0), thanh đáy (che/hở ở 100–200%), Menu + sidebar, luồng chính bằng thanh đáy | Đạt; luồng chính 11/11 mỗi trình duyệt |
| Tương phản màu mới | Chữ: H1 11,3:1 · chữ phụ trên nền 6,5:1 · gợi ý ô tìm 7,1:1 · nút Tìm 5,4:1 (đang nhấn 7,0:1). Viền ô tìm 3,65:1 (trên thẻ) / 3,35:1 (trên nền). Viền focus 5,0:1 |

## 4. Vùng đầu màn hình (Q4, tiêu chí PM chỉnh)

Tọa độ tính bằng px từ đỉnh trang. Chromium và WebKit lệch nhau không quá 1px.

| Cỡ màn | Tiêu đề | H1 | Ô tìm | Hết 4 nhóm | Thanh đáy |
|---|---|---|---|---|---|
| 320×568 | mặc định (2 dòng) | 116–181 | 257–307 | **463** | 511 |
| 320×568 | 60 ký tự rộng nhất (4 dòng) | 116–246 | 322–372 | 528 | 511 |
| 320×568 | cũ 120 ký tự (6 dòng) | 116–311 | 387–437 | 593 | 511 |
| 360×640 | mặc định | 116–181 | 257–307 | 463 | 583 |
| 390×664 | mặc định (1 dòng) | 116–148 | 225–275 | **431** | 607 |
| 390×664 | 60 ký tự | 116–246 | 322–372 | 528 | 607 |
| 390×844 | mặc định | 116–148 | 225–275 | 431 | 787 |
| 1280×800 | mặc định | 59–96 | 148–198 | 276 | — |

- **Tiêu đề mặc định:** H1, ô tìm và đủ 4 nhóm nằm trên thanh đáy ở mọi cỡ, kể cả 320×568.
- **Tiêu đề dài ở 320×568:** phải cuộn dọc mới thấy hàng nhóm thứ hai, như PM đã chấp nhận. H1 giữ 26px, không cắt; đủ 4 nhóm; không cuộn ngang. Riêng 390×664 thì tiêu đề 60 ký tự vẫn vừa.
- **Phóng chữ 200%:** ô tìm bắt đầu ở 799px (320) và 750px (390), tức phải cuộn. Mọi thứ vẫn đọc và bấm được, không cuộn ngang.

## 5. Bất thường và điểm cần PM quyết

1. **CLS khung trang A2 (có sẵn, ngoài danh sách file A4 — chưa sửa).**
   - Trang chủ mới ngắn hơn 309px, nên ở 390×844 footer lọt vào màn đầu.
   - Khi khung trang đo xong thanh đáy, footer trượt lên khoảng 52px. Nguyên nhân là `transition-[padding] duration-200` trong `AppShell.js`, cộng với phần đệm bắt đầu từ 0.
   - CLS 0,007 (trước A4: 0). `/so`, `/lo-trinh`, `/ghi-chu` (A4 không đụng) đo ra đúng 0,007 cùng nguồn.
   - Vẫn ≤ 0,1, nhưng là tăng so với 0 ở Trang chủ. Đề xuất sửa trong `AppShell.js`: bỏ hiệu ứng đệm trên điện thoại, hoặc đặt đệm mặc định bằng chiều cao thanh đáy. Đã ghi vào TASKS, chờ PM xếp bước.
2. **CLS của thẻ người mới (A4-c), đã chọn cách giữ chỗ.**

   | | Người mới | Người đã có Sổ |
   |---|---|---|
   | Giữ chỗ vô hình (đang dùng) | **0** | 0,067 ở 320×568 |
   | Chèn thẻ sau khi biết (cách cũ của SPEC) | 0,067 ở 320×568 | 0 |

   Cả hai cách đều ≤ 0,1. Mình chọn giữ chỗ vì phần lớn khách là người mới. SPEC §3.2 chỉ dặn báo PM nếu CLS vượt 0,1; ở đây không vượt, nhưng vẫn ghi lại để PM biết đây là khác biệt so với SPEC (“hiện sau khi trang chạy JS”). Khi tắt JS, khung giữ chỗ để lại một khoảng trống dưới 4 nhóm: 177px (244px ở 320px).
3. **Lỗi “Failed to fetch” / “Load failed” khi chạy luồng chính** (5 lượt mỗi trình duyệt).
   - Đều do script thử chặn lượt gọi máy chủ trên `/dia-diem`, `/so`, `/lo-trinh`, `/so/[slug]`.
   - Không có lỗi nào trên Trang chủ.
   - Số lỗi trên từng trang trước/sau A4 bằng nhau.
   - Không phải lỗi của bản build. Vẫn nằm trong mục TEST A.
4. **Khoảng trắng cuối tiêu đề không được đếm.** Bộ đếm có thể nhảy từ 60 về 59 khi xóa tới một dấu cách, vì dấu cách cuối bị bỏ lúc lưu. Con số Admin thấy luôn khớp chuỗi sẽ được lưu.
5. **Đổi tiêu đề mặc định sẽ đổi H1 trên production ngay khi release**, vì production chưa lưu cấu hình điều hướng (kiểm 12/11). Cần ghi vào hồ sơ RELEASE A.
6. Chưa kiểm trên điện thoại thật (cổng TEST A như các bước trước).

## 6. Quay lại (revert)

- Production không đổi, vì chưa deploy.
- Mỗi commit revert độc lập trên `main`, theo thứ tự ngược lại: `git revert 15f0afa 7ef5a7a 69992c8`. Không dùng `reset --hard` hay force-push.
- **Dữ liệu không quay theo code** ([VAN-HANH-RELEASE-ROLLBACK.md](VAN-HANH-RELEASE-ROLLBACK.md) §0):
  - Nếu Admin đã lưu tiêu đề mới thì bản lưu vẫn còn sau khi revert.
  - Mã cũ đọc được bản lưu này, vì giới hạn đọc vẫn là 120.
  - Mặc định “Khám phá Tuyên Quang” chỉ quay lại khi chưa có bản lưu nào.
- Sửa gấp production: dùng nhánh hoặc worktree từ tag `prod-2026-09-30`. Không deploy `main`.
