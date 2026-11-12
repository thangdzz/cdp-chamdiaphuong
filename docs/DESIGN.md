# DESIGN — Quy ước giao diện CDP · v2.0 (Bản đồ gấp + Cơ bản)

**Phiên bản 2.0 · hiệu lực 2026-11-12 (FREEZE).** Đọc trước khi dựng bất kỳ UI nào.

> Duyệt: [PM-FINAL-REVIEW-DESIGN…](PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md). Phạm vi: [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md).
> Mockup 9 bảng (tham khảo hình, **file này thắng** khi khác nhau): https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo
> Bản cũ v1 (tới 11/11/2026): [archive/2026-11-uxui-freeze/DESIGN-v1-truoc-2026-11-12.md](archive/2026-11-uxui-freeze/DESIGN-v1-truoc-2026-11-12.md).
> **Comment trong code ghi “DESIGN.md §…” viết trước 12/11/2026 là trỏ tới bản v1 đó.**
>
> Ghi chú áp dụng: đợt A chỉ phát hành chế độ **Cơ bản**; mọi thứ ghi “Bản đồ gấp” thuộc đợt B.

---

## 1. Ý tưởng

**Bản đồ gấp sống:** một tờ bản đồ giấy địa phương mở ra trên tay: 3 tấm gấp, lớp địa hình chồng nhau, đường đồng
mức, góc lật, ảnh dán băng dính, Sổ có bìa như bản đồ gấp. Cử chỉ: **MỞ**, **GẤP**, **NỐI**.

**Cơ bản:** cùng nội dung, thứ tự, hành động. Nền phẳng, thẻ trắng, ít chuyển động. Dùng chung bộ minh họa.

Hai chế độ dùng chung dữ liệu, route, handler; khác nhau ở **bố cục, chất liệu, chuyển động** của lớp trình bày.
Component có trạng thái (ô tìm, bộ lọc, form, luồng Lưu/Hoàn tác, Chọn ngẫu nhiên) chỉ có **một** bản.

## 2. Token màu

| Token | Cơ bản | Bản đồ gấp | Dùng cho |
|---|---|---|---|
| `--bg` | `#F6F5F1` | `#F8F5ED` | Nền trang |
| `--surface` | `#FFFFFF` | `#FFFDF7` | Thẻ, sheet |
| `--surface-2` | `#EFEEE9` | `#F0EADB` | Nền phụ |
| `--line` | `#E3E1DA` | `#E2D9C6` | Viền |
| `--ink` | `#183B32` | `#183B32` | Chữ chính, nền đậm |
| `--ink-2` | `#4F5B55` | `#56625C` | Chữ phụ |
| `--action` | `#B04A33` | `#B04A33` | **Màu hành động duy nhất** (nút chính, link) |
| `--action-hover` | `#963E2A` | `#963E2A` | Đang nhấn |
| `--ok` / `--warn` | `#2F6B4F` / `#8A5A10` | như vậy | Còn mở / chưa chắc chắn |
| `--sage` `--earth` `--fold` | không dùng | `#83A58D` `#BD704E` `#D8CBB0` | **Chỉ trang trí** |

- Logo giữ `#C8553D`; không dùng làm nền nút (chữ trắng chỉ đạt 4,4:1). Không có màu CTA thứ hai.
- Tương phản tính toán: nút 5,4:1 · đang nhấn 7,0:1 · focus ring 4,9:1 · chữ phụ trên kem 5,8:1 · chưa chắc
  chắn 5,4:1. **Đo lại trên máy thật ở TEST.**
- Chỉ giao diện sáng (`color-scheme: light`).
- **Ngoại lệ giữ màu cố định** (không đổi sang token): logo · màu trạng thái và báo lỗi · màu trong hình minh họa
  · lớp game `_game` · `/admin`.

## 3. Chữ

- **Be Vietnam Pro** (bộ `vietnamese`) cho toàn bộ nội dung cả 2 chế độ. **Literata** chỉ cho tiêu đề lớn ở Bản đồ
  gấp (H1, tên chỗ, tên Sổ/Lộ trình). Nạp đúng các độ đậm dùng tới; kiểm dấu tiếng Việt + tốc độ ở TEST.
- H1 26 / 30px · tên chỗ 24 / 27px · nội dung 15px · phụ 13–13,5px · **tối thiểu 13px** · ô nhập 16px trên màn cảm ứng.

## 4. Hình khối và chiều sâu

| | Cơ bản | Bản đồ gấp |
|---|---|---|
| Bo góc thẻ / nút | 12px / 10px | 6px / 8px |
| Bóng | 1px rất nhẹ | 2 mức: bóng giấy, bóng sâu |
| Nền | Phẳng | 3 tấm gấp dọc (mỗi tấm tối dần về phải, vệt sáng ở nếp) |
| Thẻ | Phẳng | Góc gập 18px |

Yếu tố riêng của Bản đồ gấp: **tờ bản đồ** (khối giấy nổi + góc dưới phải lật) ở đầu trang chủ và chi tiết ·
**lớp địa hình** 3 lớp đồi SVG chồng, có đường đồng mức + nhãn “Minh họa”, cao 128px · **ảnh dán** (viền giấy 5px,
2 băng dính, nghiêng −1,2°) · **bìa Sổ** (gáy xanh rừng 12px, đường đồng mức, nhãn giấy, xấp giấy) · **dải giấy**
Lộ trình. Không dùng tranh làm bản đồ thật; không đặt điểm địa điểm lên tranh. Không 3D. Không tăng độ nặng chỉ
để thêm chiều sâu.

## 5. Ảnh và bộ minh họa

**Thứ tự chọn ảnh đại diện:** ảnh thường của đúng chỗ (ưu tiên ảnh đánh dấu bìa) → không có / lỗi tải → minh họa
theo nhóm. **Ảnh menu không bao giờ làm ảnh đại diện.** Không tạo ảnh giả cho địa điểm thật.

**Bộ minh họa (tài sản đã duyệt hướng, chưa vào production trước BUILD A):** nguồn `docs/design/minh-hoa/`, khi
BUILD chép sang `web/public/minh-hoa/` (giữ tên file).

| File | Nhóm (`type`) | Nội dung | Alt | Cỡ file |
|---|---|---|---|---|
| `an.svg` | Ăn (`an`) | Mái che chợ, bát nóng, đũa | “Hình minh họa nhóm Ăn, chưa có ảnh thực tế” | 2,2 KB |
| `choi.svg` | Chơi (`choi`) | Đồi, hồ, cánh diều | “Hình minh họa nhóm Chơi, chưa có ảnh thực tế” | 2,1 KB |
| `ngu.svg` | Ngủ (`ngu`) | Mái nhà, cửa sổ sáng, trăng | “Hình minh họa nhóm Ngủ, chưa có ảnh thực tế” | 2,0 KB |
| `dilai.svg` | Đi lại (`dilai`) | Đường uốn, xe khách, biển chỉ không chữ | “Hình minh họa nhóm Đi lại, chưa có ảnh thực tế” | 2,1 KB |
| `khac.svg` | Chỗ quen gọi (`moc`), nhóm lạ, dự phòng | La bàn trên giấy gấp | “Hình minh họa, chưa có ảnh thực tế” | 1,5 KB |

- SVG vẽ tay, khung 3:2 (240×160), không chữ, không bảng hiệu, không công trình/địa danh thật; chỉ dùng màu dự án.
  Cả bộ ≈ 10 KB (nén ≈ 3,7 KB). Không cần WebP/AVIF.
- **Cỡ trình bày (khung cố định, cắt giữa):** thẻ Tìm chỗ 72×72 · ảnh nhỏ Sổ 48–56px · ảnh nhỏ điểm Lộ trình 44px ·
  Chi tiết rộng đủ × cao 150px (ảnh thật 200px).
- Cơ bản: hình phẳng, bo 10px. Bản đồ gấp: viền giấy, băng dính, nghiêng.
- **Nhãn:** Chi tiết: “Hình minh họa · Chưa có ảnh thực tế” (thẻ nhỏ góc dưới trái ảnh) + link “Gửi ảnh thật của chỗ
  này” nếu luồng gửi ảnh đang có. Tìm chỗ: dấu ✎ 20px ở góc ảnh + một dòng chú giải đầu danh sách “✎ = hình minh
  họa, chưa có ảnh thực tế”. Ảnh thật lỗi tải: “Ảnh chưa tải được · đang hiện minh họa”, không thử tải lại liên tục.
- Phải kiểm 5 file ở các cỡ thật, trạng thái lỗi ảnh, alt và nhãn trước nghiệm thu BUILD A.

## 6. Điều hướng

- **Mobile:** header (logo + tên + Menu) + **thanh đáy 4 mục cố định thứ tự:** Trang chủ · Tìm chỗ · Sổ · Lộ trình.
  Nhãn lấy từ cấu hình điều hướng Admin như hiện nay. Mục đang mở: chữ đậm + gạch chân màu hành động. Chạm ≥ 44px.
  Tính vùng an toàn (iOS, trình duyệt trong Zalo/Facebook). 320px: mỗi mục 80px.
- **Màn chi tiết** (chỗ, Sổ, Lộ trình): **thanh hành động thay thanh đáy** + “← Quay lại” trong header. Không chồng 2 thanh.
- **Bàn phím bật:** ẩn thanh đáy / thanh hành động; không che ô nhập hay kết quả.
- **Menu:** Ghi chú của tôi · Góp một chỗ mới · Giới thiệu & chính sách dữ liệu · Lễ hội (lưu trữ) · (đợt B) khối
  **Giao diện**: 2 nút “Bản đồ gấp / Cơ bản” + câu “Đổi ngay trên trang đang xem. Sổ, Ghi chú, Lộ trình và chữ đang
  gõ giữ nguyên. Máy này nhớ lựa chọn.”
- **Desktop (≥ 1024px):** sidebar hiện có; 4 mục lõi trên cùng; khối Giao diện cuối sidebar (đợt B). Không có thanh đáy.
- **Gợi ý 1 lần (đợt B):** chú thích nhỏ gắn biểu tượng Menu (hoặc khi mở Menu lần đầu) chỉ chỗ đổi giao diện.
  Không chặn thao tác, bỏ qua được, tối đa 1 lần mỗi thiết bị, không hiện lại, không ép đổi.

## 7. Bố cục 5 màn

**Trang chủ:** khẩu hiệu “Gom chỗ hay. Chia sẻ dễ dàng.” → H1 (Admin sửa, tối đa 60 ký tự, mặc định “Hôm nay bạn
muốn ghé đâu?”) → câu dẫn → ô tìm (**không autofocus**) → 4 nhóm Ăn · Chơi · Ngủ · Đi lại (kèm số chỗ) → [người mới]
“Bắt đầu Sổ đầu tiên” / [đợt B, có dữ liệu] Sổ gần đây (≤ 2) + Lộ trình gần đây (14 ngày, không có thì ẩn) → nội dung
theo mùa chỉ khi còn hiệu lực. Bản đồ gấp: phần đầu nằm trên tờ bản đồ; **người mới** có lớp địa hình ở mép dưới tờ
(sau ô tìm + 4 nhóm); **người quay lại** bỏ lớp địa hình, giữ nền giấy + góc gập. Tiêu đề dài 2 dòng vẫn giữ ô tìm +
4 nhóm trong vùng đầu ở 320/360/390px.

**Tìm chỗ:** ô tìm → chip nhóm → chip Khu vực / Giá → “N chỗ · đang xem 1–20” → chú giải ✎ → thẻ ~92px (ảnh 72px ·
tên · nhóm · khu hoặc “chưa rõ khu vực” · giá hoặc “Chưa có giá” · “chưa xác nhận” khi đúng · nút Chỉ đường 44px) →
“Xem thêm 20 chỗ”. Bấm tên/ảnh → Chi tiết. Không có “lưu nhanh”.

**Chi tiết:** ảnh/minh họa + nhãn → “Gửi ảnh” → tên · nhóm · khu · độ tin cậy → giá / địa chỉ / SĐT → **Lưu vào Sổ +
Chỉ đường** (≈ 460px từ đỉnh trên 390×844) → Chia sẻ · Thêm vào Lộ trình · Ghi chú riêng → Cần biết → “Bạn biết gì
thêm” → Sửa giúp · Nguồn. Thanh hành động bám đáy. Vị trí chưa xác nhận: nút “Tìm trên Maps”. Chỗ quen gọi: không
khối giá. Bản đồ gấp: thông tin trên tờ bản đồ có nếp ngang trước hàng nút. Giữ 2 vùng “Thông tin” + “Cần biết”.

**Sổ:** tiêu đề → “Sổ của bạn gắn với thiết bị này. Chưa có đồng bộ tự động giữa các thiết bị.” → danh sách (tên, số
chỗ, sửa lần cuối, ảnh nhỏ) → Mở / Chia sẻ (+ “Chọn ngẫu nhiên” ở đợt B). **Không** đặt lối vào “Dùng trên máy khác?”;
khôi phục bằng mã 6 số giữ đường vào hiện có. Bản đồ gấp: bìa bản đồ gấp; Sổ trống không có xấp giấy, không có nút.

**Lộ trình:** danh sách (tên, số điểm, phương tiện, sửa lần cuối) + “Tạo Lộ trình / Tạo từ một Sổ” → chi tiết: điểm
đánh số, giờ dự kiến, nút ↑ ↓ (44px, có thông báo cho trình đọc màn hình), “+ Thêm điểm”, cảnh báo vị trí đoán →
thanh “Mở trên Google Maps / Chia sẻ”. Bản đồ gấp: điểm dán trên dải giấy dọc kèm ảnh/minh họa 44px; dải giấy chỉ là
**thứ tự**, không phải đường đi.

## 8. Thành phần chung

Nút chính (một mỗi vùng) · nút viền · nút ↑ ↓ · chip lọc · thẻ kết quả · thẻ/bìa Sổ · thẻ Lộ trình · sheet chọn Sổ
(chỉ 1 Sổ thì bỏ qua) · sheet **Chọn ngẫu nhiên** (“N chỗ hợp lệ, mỗi chỗ cơ hội như nhau”, lý do chỗ bị loại, Xem chi
tiết / Chỉ đường / Chọn lại; Bản đồ gấp có lời phụ “như rút một thẻ”) · toast có Hoàn tác (6 giây, `role=status`) ·
thông báo lỗi (`role=alert`, có Thử lại) · thông báo mất mạng (nền xanh rừng, không hứa tự gửi lại) · khung xương
đang tải (giữ kích thước, không nhảy bố cục).

## 9. Chuyển động

| Tên | Bản đồ gấp | Cơ bản | Giảm chuyển động |
|---|---|---|---|
| Chạm | ≤ 100ms, `scale(0.97)` | như vậy | như vậy |
| **MỞ** thẻ → chi tiết | Nâng → trải 120ms → trang 320ms (View Transitions) | Trượt 28px 260ms | Mở ngay |
| **GẤP** lưu → Sổ | “Đang lưu…” ngay → **sau khi server OK** gập góc 240ms → toast | Đổi nút + toast 200ms | Như Cơ bản |
| **NỐI** thêm điểm | Dải giấy kéo dài + đóng dấu số 300ms | Dòng mới mờ vào 200ms | Không hiệu ứng |
| Đổi giao diện | Tức thì | — | — |

Chỉ `transform` / `opacity`, 180–420ms; không chạy khi gõ/chọn; trình duyệt không hỗ trợ → mở bình thường.
**Nghiệm thu sau BUILD trên máy thật**; hiệu ứng chưa ổn thì sửa ở TEST, không đưa hiệu ứng nặng lên production.
Ngoại lệ game giữ như bản v1 (lớp `cdp-game-`, chỉ trong trang game).

## 10. Trạng thái bắt buộc (cả 2 chế độ)

Rỗng (chưa có Sổ / Sổ trống / Lộ trình trống / không kết quả) · đang tải · lỗi máy chủ · mất mạng · thiếu ảnh · ảnh
lỗi · thiếu giá · chưa xác nhận · vị trí chưa xác nhận · chưa rõ khu vực · Sổ không còn chỗ hợp lệ khi chọn ngẫu nhiên.

## 11. Giữ từ v1

Chạm ≥ 44px · chữ ≥ 13px · ô nhập 16px trên cảm ứng · ảnh có khung cố định · một nút chính mỗi vùng · nhãn trạng thái
không tô nền · Chi tiết 2 vùng · ngoại lệ chuyển động của game.
