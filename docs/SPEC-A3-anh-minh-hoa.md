# SPEC A3 — Bộ minh họa + chọn ảnh thật/minh họa + dữ liệu ảnh thẻ tìm (BUILD A, bước 3)

| | |
|---|---|
| Trạng thái | **ĐÃ DUYỆT (kèm điều kiện) 12/11** — [PM-DUYET-PLAN-A3-CDP-2026-11-12.md](PM-DUYET-PLAN-A3-CDP-2026-11-12.md). Q1–Q4 chọn **A**, chốt ở §13. **ĐÃ BUILD 12/11 — chờ nghiệm thu** ([REPORT-A3](REPORT-A3-anh-minh-hoa-2026-11-12.md)). Không deploy |
| Ngày | 2026-11-12 |
| Nguồn chuẩn | [DESIGN.md](DESIGN.md) v2.0 §5 · [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) §1 (dòng 5, 6, 14), §2 (Minh họa, Server), §4 (Ảnh), §6 bước 3 · [PM-NGHIEM-THU-A2-CDP-2026-11-12.md](PM-NGHIEM-THU-A2-CDP-2026-11-12.md) §4 · [KIEM-KE-anh-so-lieu-nen-2026-11-11.md](KIEM-KE-anh-so-lieu-nen-2026-11-11.md) |
| Gốc code | `main` @ `691fd55` (sau A2) |

## 1. Mục tiêu và giới hạn

A3 làm **phần nền về ảnh** để các màn A5–A8 dùng chung một cách duy nhất:
1. Đưa **5 SVG minh họa** đã duyệt vào web.
2. Viết **một quy tắc chọn ảnh**: ảnh thật phù hợp → minh họa đúng nhóm. Kèm alt và nhãn đúng DESIGN §5.
3. Thêm **trường ảnh đại diện** vào dữ liệu thẻ tìm (`lib/searchResults.js`).
4. (Nếu PM chọn Q2-A) **Một component ảnh nhỏ dùng chung**, tự đổi sang minh họa khi ảnh thật lỗi.

**A3 chưa đổi giao diện của màn nào.** Thẻ `/tim` hiện ảnh ở **A5**, Chi tiết ở **A6**, Sổ ở **A7**, Lộ trình ở **A8**.
Ngoại lệ duy nhất là Q1, nếu PM chọn sửa tận gốc lỗi ảnh menu (xem §4).

**Không làm trong A3:**
- Không đổi cấu trúc Redis, không ghi dữ liệu.
- Không thêm hay sửa ảnh của địa điểm thật, không tạo ảnh giả hay ảnh AI.
- Không đổi luồng gửi ảnh, không đổi API hay Server Action.
- Không đổi ảnh xem trước khi chia sẻ link (ngoài scope cả 2 đợt), trừ hệ quả gián tiếp của Q1.
- Không làm lớp Bản đồ gấp (viền giấy, băng dính — đợt B).
- Không deploy.

## 2. Hiện trạng (kiểm chỉ đọc bằng token Redis chỉ-đọc, 12/11; khớp kiểm kê 11/11)

**Ảnh địa điểm** — **[Fact]** 344 chỗ, 342 thuộc 4 nhóm:

| Nhóm | Số chỗ | Có ảnh thường | Tỷ lệ | Có ảnh đánh dấu bìa | Chỉ có ảnh menu |
|---|---:|---:|---:|---:|---:|
| Ăn | 192 | 11 | 5,7% | 4 | 1 |
| Chơi | 56 | 2 | 3,6% | 0 | 0 |
| Ngủ | 71 | 3 | 4,2% | 0 | 0 |
| Đi lại | 23 | 0 | 0% | 0 | 0 |
| Chỗ quen gọi | 2 | 0 | 0% | 0 | 0 |
| **Cộng** | **344** | **16** | **4,7%** | 4 | 1 |

- 49 ảnh, **toàn bộ trên Vercel Blob của dự án**: `*.public.blob.vercel-storage.com`, đã khai báo trong
  `next.config.mjs`. Không có ảnh từ Google hay nguồn ngoài.
- Vai trò ảnh: thường 37 · menu 6 · lối vào 5 · bìa 4 · bãi đỗ 1 · chỉ đường 1. Không ảnh nào vừa là menu vừa là bìa.
- 20/43 ảnh thường có ghi kích thước. Ảnh gốc 108–403 KB (trung vị 213 KB) với 20 ảnh biết dung lượng.
- **Nguồn ảnh:**
  - 21 ảnh khách gửi. Ảnh khách gửi vào hàng chờ, Admin duyệt rồi mới lên web.
  - 3 ảnh Admin tải.
  - 25 ảnh “legacy”: từ trước khi có trường nguồn, không ghi người tải.
  - Google Places chỉ dùng để tìm tên/địa chỉ, **không lấy ảnh**.

**Lỗi đang có trên production** — **[Fact]**: `placeCoverMedia()` (`lib/media.js`) lấy ảnh có vai trò `cover`, nếu
không có thì lấy **ảnh đầu tiên bất kỳ, kể cả ảnh menu**. Có **1 chỗ chỉ có ảnh menu**
(`pending-72c2da63…`), và với chỗ này ảnh menu đang hiện ở 4 nơi:

| Nơi | File | Hiện tại |
|---|---|---|
| Dải ảnh trang Chi tiết | `PlaceDetail.js` | Ảnh menu đứng đầu dải ảnh, như ảnh của chỗ |
| Thẻ địa điểm trong Sổ | `NotebookPlaceCard.js` | Ảnh menu làm ảnh nhỏ |
| Bìa ghép của Sổ | `lib/cover.js` → `notebookCover` | Ảnh menu có thể vào ảnh ghép |
| Ảnh xem trước khi chia sẻ link chỗ | `app/dia-diem/[id]/page.js` → `placeCover` | Ảnh menu làm ảnh xem trước |

DESIGN §5: “Ảnh menu không bao giờ làm ảnh đại diện.”

**Dữ liệu thẻ tìm** — **[Fact]**:
- `toResultItem()` chưa có trường ảnh.
- Trang `/tim` gửi **toàn bộ khoảng 340 chỗ** xuống trình duyệt (lọc tại chỗ), mỗi chỗ khoảng 15 trường.
- `PlaceResultCard.js` chưa hiện ảnh. Việc hiện ảnh là A5.

**Bộ minh họa** — **[Fact]**:
- 5 file trong `docs/design/minh-hoa/`, mỗi file 1,4–2,0 KB, tổng 9,3 KB, nén còn 3,7 KB.
- Đều khung `viewBox 0 0 240 160`.
- **Không có** `<script>`, liên kết, `<text>` hay ảnh nhúng. Chỉ dùng màu dự án.

**Next.js 16** (đọc tài liệu trong `node_modules/next/dist/docs`) — **[Fact]**:
- `next/image` tự bỏ qua bước tối ưu với ảnh có đuôi `.svg`, nên **không cần** `dangerouslyAllowSVG`.
- Chất lượng mặc định chỉ cho phép `75`.
- Bộ cỡ ảnh nhỏ mặc định: `[32, 48, 64, 96, 128, 256, 384]`.
- Ảnh đã tối ưu được lưu đệm tối thiểu 4 giờ.
- `onError` chỉ dùng được trong client component.

**→ A3 không cần sửa `next.config.mjs`.**

## 3. Quy tắc chọn ảnh (một nguồn duy nhất)

```
ảnh đại diện(place) =
  1. ảnh KHÔNG phải menu, có vai trò "bìa"            (Admin/CDP chọn)
  2. nếu không: ảnh KHÔNG phải menu đầu tiên theo thứ tự
  3. nếu không có (chỉ có menu, hoặc chưa có ảnh nào): null → minh họa theo nhóm
khi hiển thị: ảnh thật tải lỗi → minh họa theo nhóm, không thử tải lại liên tục
```

**Minh họa theo nhóm**, đúng bảng DESIGN §5, kể cả alt:

| `type` | File | Alt |
|---|---|---|
| `an` | `/minh-hoa/an.svg` | “Hình minh họa nhóm Ăn, chưa có ảnh thực tế” |
| `choi` | `/minh-hoa/choi.svg` | “Hình minh họa nhóm Chơi, chưa có ảnh thực tế” |
| `ngu` | `/minh-hoa/ngu.svg` | “Hình minh họa nhóm Ngủ, chưa có ảnh thực tế” |
| `dilai` | `/minh-hoa/dilai.svg` | “Hình minh họa nhóm Đi lại, chưa có ảnh thực tế” |
| `moc`, nhóm lạ, thiếu nhóm | `/minh-hoa/khac.svg` | “Hình minh họa, chưa có ảnh thực tế” |

**Nhãn, theo DESIGN §5.** A3 chỉ khai báo hằng số; từng màn gắn nhãn vào ở bước của màn đó:
- Thẻ tìm: dấu ✎ ở góc ảnh + chú giải một lần đầu danh sách “✎ = hình minh họa, chưa có ảnh thực tế” (A5).
- Chi tiết: “Hình minh họa · Chưa có ảnh thực tế”. Khi ảnh thật lỗi: “Ảnh chưa tải được · đang hiện minh họa” (A6).

**Minh họa không bao giờ được trình bày như ảnh chụp thật:**
- luôn có alt “Hình minh họa …”;
- có dấu ✎ hoặc nhãn;
- không đặt tên chỗ đè lên hình;
- dùng khung có nền phẳng riêng.

**Vai trò khác** (lối vào, bãi đỗ, chỉ đường, bên trong) vẫn tính là “ảnh thường” như hiện nay. Dữ liệu 12/11 không
có chỗ nào mà ảnh được chọn là bãi đỗ hay chỉ đường. Nếu sau này PM muốn đẩy ảnh bãi đỗ xuống cuối, chỉ cần đổi một chỗ
trong hàm.

## 4. Câu hỏi Q1: sửa tận gốc hay chỉ dùng hàm mới

Cách sửa tận gốc chỉ là đổi `placeCoverMedia()` để **bỏ ảnh menu trước khi chọn**: khoảng 2 dòng, cùng file. Mọi nơi
gọi hàm này đều đã xử lý trường hợp `null`:

| Nơi gọi | Khi `null` |
|---|---|
| `PlaceDetail.js` | Dải ảnh chỉ còn ảnh thường. Ảnh menu vẫn ở khối menu riêng |
| `NotebookPlaceCard.js` | Không hiện ảnh nhỏ (như 328 chỗ khác) |
| `notebookCover` | Bỏ qua chỗ đó |
| Ảnh xem trước chia sẻ link | Rơi về `FALLBACK_COVER` như chỗ chưa có ảnh |

Ảnh hưởng hôm nay: **đúng 1 chỗ**.

## 5. Dữ liệu ảnh từ máy chủ tới thẻ tìm

- `toResultItem()` thêm **một trường**: `photo: { url, width, height } | null`.
  - `width`/`height` là `null` khi ảnh không ghi kích thước (23/43 ảnh). Thẻ dùng **khung cố định 72×72, cắt giữa**,
    nên không cần kích thước để giữ bố cục.
  - Không gửi vai trò, người tải, nguồn hay dung lượng xuống trình duyệt.
- **Không cần thay đổi máy chủ nào khác:** không thêm API, không thêm lần đọc Redis, ảnh lấy từ `places:live` đã đọc
  sẵn. Không đổi cấu trúc dữ liệu.
- Không gửi minh họa trong dữ liệu. Thẻ tự chọn theo `type`, tránh lặp chuỗi `/minh-hoa/an.svg` 326 lần.
- **Tốc độ:**
  - **[Ước tính]** Dữ liệu `/tim` tăng khoảng 2–3 KB cho 16 chỗ có ảnh, cộng khoảng 4 KB chữ `"photo":null` cho phần còn lại. Nén còn dưới 2 KB.
  - Em sẽ **đo thật** kích thước trang `/tim` trước/sau trong BUILD. Nếu tăng quá 5 KB sau nén, em bỏ khóa `photo` khi `null`.
- **Ảnh thẻ khi hiển thị (A5)**, theo DESIGN §5 và kiểm kê:
  - `next/image` với `sizes="72px"`, chất lượng 75. Trình duyệt nhận bản 96/128/256px dạng AVIF/WebP, ước tính 5–15 KB thay vì 108–403 KB gốc.
  - Tải lười, trừ 1–2 thẻ đầu.
  - Khung cố định, không nhảy bố cục.
  - Minh họa SVG khoảng 2 KB, cùng 5 file dùng lại, trình duyệt lưu đệm.
- **Lưu đệm:** ảnh tối ưu được Vercel giữ tối thiểu 4 giờ (mặc định Next 16). File trong `public/` dùng chế độ đệm mặc định của Vercel. Đủ dùng ở lượng truy cập hiện nay (37 phiên / 42 ngày); không đổi cấu hình.
- **[Giả định, cần kiểm trước RELEASE A]** Hạn mức tối ưu ảnh của gói Vercel đang dùng đủ cho 16 ảnh × vài cỡ. Cần `vercel login` để đọc hạn mức thật.

## 6. Component ảnh nhỏ dùng chung (`PlaceThumb`) — xem Q2

Một client component để A5–A8 dùng chung, không màn nào tự viết lại:
- **Nhận vào:** `photo` (hoặc `null`), `type`, cỡ khung, có hiện dấu ✎ hay không, có hiện nhãn lỗi hay không.
- **Có ảnh thật** → `next/image`, khung cố định, `object-cover`, `sizes` đúng khung, tải lười mặc định.
- **Không có ảnh** → minh họa đúng nhóm + alt DESIGN + (tùy chọn) dấu ✎.
- **Ảnh thật lỗi** (`onError`) → chuyển **một lần** sang minh họa, không thử lại. Có thêm trạng thái “đang hiện minh họa vì lỗi” để Chi tiết (A6) hiện nhãn “Ảnh chưa tải được · đang hiện minh họa”.
- **Màu nền khung và dấu ✎ dùng token Cơ bản:** nền `--surface-2`, dấu ✎ chữ `--ink` trên nền `--surface`. Bo góc 10px như DESIGN §5.
- **Alt ảnh thật:** theo Q3.

Ở A3 component này **chưa được màn nào dùng**. Em kiểm nó bằng một trang thử chạy trên máy (không commit) với 20 mẫu
theo đúng tỷ lệ dữ liệu thật (xem §8).

## 7. File dự kiến sửa

| File | Việc | Commit |
|---|---|---|
| `web/public/minh-hoa/an.svg`, `choi.svg`, `ngu.svg`, `dilai.svg`, `khac.svg` **(mới)** | Chép nguyên từ `docs/design/minh-hoa/`, giữ tên file | A3-a |
| `web/lib/placeImage.js` **(mới)** | Hàm thuần: `placePhoto(place)` → `{url,width,height}` hoặc `null`; `placeIllustration(type)` → `{src, alt}`; hằng số nhãn DESIGN §5 | A3-b |
| `web/lib/media.js` | `placeCoverMedia()` bỏ ảnh menu (**chỉ khi PM chọn Q1-A**) | A3-b |
| `web/tests/placeImage.test.js` **(mới)** | Test quy tắc chọn ảnh, minh họa, alt (cả dữ liệu cũ `photos`/`coverPhoto`/`menuPhotos`) | A3-b |
| `web/lib/searchResults.js` | Thêm `photo` vào `toResultItem()` | A3-c |
| `web/tests/searchResults.test.js` **(mới)** | Test `photo`: có ảnh, chỉ menu, không ảnh, ảnh thiếu kích thước | A3-c |
| `web/app/PlaceThumb.js` **(mới)** | Component ảnh nhỏ dùng chung (**chỉ khi PM chọn Q2-A**) | A3-d |

**Không sửa:**
- `next.config.mjs`;
- `PlaceResultCard.js` (A5), `PlaceDetail.js` (A6), `NotebookPlaceCard.js` (A7), file Lộ trình (A8);
- `lib/cover.js` (dùng lại, không đổi);
- API, `*Actions.js`, `/admin`, dữ liệu, PRODUCT.md.

Nếu lúc làm cần thêm file ngoài bảng này, em dừng và báo PM.

## 8. Thứ tự commit và kiểm thử

Mỗi commit chạy lint + `npm test` + build rồi push. Push không deploy.

1. **A3-a — minh họa vào web.**
   - Kiểm 5 file mở được qua `/minh-hoa/*.svg` (200, `image/svg+xml`), dung lượng đúng.
   - Hiển thị đúng ở các cỡ thật 72×72, 48–56px, 44px và rộng × 150px, trên Chromium và WebKit. Có ảnh chụp.
2. **A3-b — quy tắc chọn ảnh** (+ Q1).
   - Test thuần: ưu tiên bìa; bỏ menu; chỉ menu → `null`; không ảnh → `null`; dữ liệu cũ (`photos`, `coverPhoto`, `menuPhotos`) đọc đúng; 5 nhóm + nhóm lạ → đúng file và alt.
   - **Chạy hàm trên toàn bộ 344 chỗ thật (chỉ đọc):** đúng 16 chỗ có ảnh, 0 chỗ ra ảnh menu, 328 chỗ ra minh họa, phân bố theo nhóm khớp bảng §2.
   - Nếu chọn Q1-A: kiểm 4 nơi ở §4 với chỗ chỉ có ảnh menu: Chi tiết không còn ảnh menu trong dải ảnh nhưng vẫn có ở khối menu; Sổ không lỗi; ảnh xem trước rơi về ảnh mặc định. Các chỗ khác giữ nguyên (so ảnh trước/sau).
3. **A3-c — dữ liệu thẻ tìm.**
   - Test thuần cho `photo`.
   - Đo kích thước trang `/tim` (HTML + dữ liệu React) trước/sau, có và không nén.
   - `/tim` vẫn 200, lọc/tìm/“Xem thêm” như cũ, không lỗi JS mới.
4. **A3-d — `PlaceThumb`** (nếu Q2-A).
   - Trang thử trên máy (**không commit**) với 20 thẻ mẫu theo tỷ lệ thật: 1 ảnh thật có kích thước, 1 ảnh thật thiếu kích thước, 1 ảnh thật bị chặn tải (giả lập lỗi), 17 minh họa đủ 4 nhóm + `khac` + tên rất dài.
   - Kiểm trên 320/360/390px, Chromium + WebKit:
     - đúng ảnh / minh họa, alt đúng;
     - ảnh lỗi chuyển sang minh họa đúng **1 lần**, không gọi lại ảnh lỗi;
     - khung không nhảy (CLS 0);
     - ảnh thật tải lười: chỉ tải khi gần màn hình;
     - dung lượng thật của ảnh 72px qua bộ tối ưu.
   - Trang thử bị xóa trước khi commit. Kiểm `git status` sạch.

Cuối A3 em chạy lại bộ kiểm A1/A2 (16 trang × 4 cỡ, WebKit, thanh đáy, tên thương hiệu) để chắc không lùi. Gửi
**REPORT A3** kèm ảnh.

**Môi trường thử:** giống A1/A2. Bản build thật, token Redis chỉ đọc, chặn mọi lượt ghi, không ghi dữ liệu thật,
không công bố ảnh Sổ/Lộ trình của người dùng thật.

## 9. Điều kiện nghiệm thu A3

- [ ] 5 SVG có trong `web/public/minh-hoa/`, đúng tên, đúng nội dung đã duyệt (so mã băm với `docs/design/minh-hoa/`).
- [ ] Một hàm chọn ảnh duy nhất. **0/344 chỗ thật ra ảnh menu.** Chỗ không ảnh, chỉ có menu, hay nhóm lạ đều ra đúng minh họa + alt DESIGN.
- [ ] `photo` có trong dữ liệu `/tim`, đúng 16 chỗ có ảnh. Kích thước trang tăng ≤ 5 KB sau nén, hoặc đã báo PM.
- [ ] (Q2-A) Ảnh lỗi → minh họa, không lặp tải. Khung cố định, CLS 0. Ảnh 72px qua bộ tối ưu ≤ 20 KB.
- [ ] (Q1-A) Chỗ chỉ có ảnh menu không còn ảnh menu làm ảnh đại diện ở 4 nơi; 343 chỗ còn lại không đổi.
- [ ] Không màn nào đổi giao diện ngoài Q1-A. Không cuộn ngang, không lỗi JS mới, tên “Chạm Địa Phương” vẫn đủ.
- [ ] Lint sạch, test cũ + mới đạt, build đạt. Không deploy.

## 10. Rủi ro

| Rủi ro | Mức | Cách giảm |
|---|---|---|
| Sửa `placeCoverMedia` (Q1-A) làm đổi ảnh ở chỗ khác ngoài dự kiến | Thấp | Chạy hàm cũ và mới trên 344 chỗ thật, liệt kê mọi chỗ khác kết quả; dự kiến đúng 1 |
| Dữ liệu `/tim` nặng thêm | Thấp | Đo thật; bỏ khóa `null` nếu cần |
| Ảnh Blob bị xóa → ảnh vỡ | Thấp | Component chuyển sang minh họa; không thử lại |
| Hạn mức tối ưu ảnh Vercel | Thấp ở lượng hiện nay | Kiểm hạn mức thật trước RELEASE A (`vercel login`) |
| Minh họa bị hiểu là ảnh thật | Vừa nếu thiếu nhãn | Alt + ✎ + nhãn bắt buộc; nghiệm thu ở A5/A6 |
| Ảnh khách gửi lên thẻ tìm (hiện nhiều nơi hơn) | Thấp | Ảnh đã qua Admin duyệt và đang công khai ở trang Chi tiết; Q4 |

## 11. Quay lại (rollback)

- Production không đổi.
- Mỗi commit A3 revert độc lập:
  - A3-a chỉ thêm file;
  - A3-c chỉ thêm một trường mà chưa màn nào đọc;
  - A3-d là component chưa được dùng;
  - A3-b (Q1-A) revert là trả lại cách chọn ảnh cũ.
- Không đụng dữ liệu, nên không có gì phải khôi phục. Sửa gấp production: nhánh từ tag `prod-2026-09-30`.

## 12. Câu hỏi cần PM chốt trước BUILD A3

**Q1 — Lỗi ảnh menu làm ảnh đại diện (đang có trên production, 1 chỗ, 4 nơi).**
- **A (đề xuất):** sửa tận gốc trong A3. `placeCoverMedia()` bỏ ảnh menu, khoảng 2 dòng trong `lib/media.js`. Một quy tắc cho mọi nơi, đúng DESIGN §5 ngay. Có ảnh hưởng gián tiếp tới ảnh xem trước khi chia sẻ link: chỗ đó rơi về ảnh mặc định thay vì ảnh menu.
- **B:** A3 chỉ dùng hàm mới cho thẻ tìm. Chi tiết, Sổ sửa ở A6/A7. Ảnh xem trước giữ lỗi (ngoài scope).

**Q2 — Component `PlaceThumb` dùng chung làm ở A3 hay A5?**
- **A (đề xuất):** làm ở A3, kiểm riêng bằng trang thử không commit. A5–A8 chỉ việc dùng, xử lý lỗi ảnh nằm ở một chỗ.
- **B:** để A5 làm cùng thẻ tìm. A3 chỉ có SVG + hàm + dữ liệu.

**Q3 — Alt của ảnh thật ở thẻ nhỏ** (tên chỗ đã nằm ngay cạnh ảnh, trong cùng liên kết):
- **A (đề xuất):** alt rỗng, ảnh coi là trang trí, trình đọc màn hình không đọc lặp tên. Minh họa vẫn giữ alt DESIGN, vì alt đó báo “chưa có ảnh thực tế”. Ở trang Chi tiết, ảnh thật vẫn có alt “Ảnh {tên chỗ}”.
- **B:** mọi ảnh thật có alt “Ảnh {tên chỗ}”, kể cả ở thẻ.

**Q4 — Quyền dùng ảnh khi ảnh hiện thêm ở thẻ tìm, Sổ, Lộ trình.**
- **[Fact]** Ảnh khách gửi đã qua Admin duyệt và đang công khai ở Chi tiết. Form gửi ảnh chưa có câu nói ảnh sẽ hiện công khai trên CDP. 25 ảnh “legacy” không ghi người tải.
- **A (đề xuất):** A3 dùng như hiện nay, vì cùng mức công khai với trang Chi tiết. Ghi vào BACKLOG: thêm một câu vào form gửi ảnh, kiểu “Ảnh bạn gửi sẽ hiện công khai trên Chạm Địa Phương sau khi được duyệt”, làm khi dựng lại Chi tiết ở A6. Nếu PM cần, chủ dự án xác nhận 25 ảnh legacy là do CDP/Admin đưa lên.
- **B:** chỉ hiện ảnh `source = admin` ở thẻ tìm cho tới khi có câu đồng ý. Thẻ tìm sẽ gần như toàn minh họa: 3 ảnh admin, legacy chưa rõ.

## 13. Quyết định PM (12/11) — Q1–Q4 chọn A

Nguồn: [PM-DUYET-PLAN-A3-CDP-2026-11-12.md](PM-DUYET-PLAN-A3-CDP-2026-11-12.md).

| | Quyết định | Điều kiện kèm theo |
|---|---|---|
| Q1 | Sửa tận gốc `placeCoverMedia()`: không bao giờ chọn ảnh menu, kể cả khi là ảnh duy nhất | Thứ tự: bìa hợp lệ → ảnh thường đầu tiên → `null`. Kiểm 4 nơi (dải ảnh Chi tiết, thẻ Sổ, bìa ghép Sổ, ảnh xem trước chia sẻ); ảnh menu **vẫn hiện ở khối thực đơn**. Đối chiếu cũ/mới trên dữ liệu chỉ đọc; **nếu khác 1 chỗ → báo PM trước khi đi tiếp** |
| Q2 | Làm `PlaceThumb` ngay A3 | **Đổi `photo.url` hoặc đổi địa điểm → đặt lại trạng thái lỗi.** Cùng một URL lỗi chỉ chuyển minh họa một lần. Không gắn vào màn nào trong A3; thử bằng trang tạm, xóa trước commit |
| Q3 | Thẻ nhỏ: ảnh thật `alt=""` **khi tên nằm ngay cạnh, cùng liên kết**; minh họa giữ alt DESIGN | Ảnh là liên kết riêng hoặc mang thông tin không có ở chữ gần đó → alt mô tả chức năng/thông tin. Chi tiết: mô tả phù hợp, mặc định “Ảnh {tên địa điểm}” |
| Q4 | Làm kỹ thuật với ảnh đang công khai; **cổng xác minh nguồn/quyền trước A5** | Đây không phải kết luận ảnh đã có quyền. Danh sách 25 ảnh legacy (ID ảnh, ID chỗ, nguồn đã biết, tình trạng, hướng xử lý) — không ghi định danh người tải. Ảnh chưa xác minh → minh họa ở bề mặt mới (A5–A8). A6: câu thông báo + xác nhận quyền trong form gửi ảnh ([BACKLOG](BACKLOG.md) §6) |

**Điều kiện BUILD thêm:**
- Đúng 4 commit A3-a → A3-d; file code/test chỉ trong danh sách §7. Cần file khác → dừng, báo PM.
- Báo **số thực đo** tại lúc test (mốc 12/11: 344 chỗ, 16 có ảnh, 1 chỉ có menu); không sửa test để ép khớp số cũ.
- Dung lượng `/tim` tăng > 5 KB sau nén → bỏ khóa `photo` khi `null`, ghi rõ.
- Vai trò ảnh khác menu (lối vào, bãi đỗ, chỉ đường) giữ như SPEC; chỉ ghi nhận xét nếu gặp trường hợp gây hiểu nhầm.
