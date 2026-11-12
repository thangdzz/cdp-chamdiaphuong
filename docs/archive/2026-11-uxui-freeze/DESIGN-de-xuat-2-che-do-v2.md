# ĐỀ XUẤT — DESIGN.md cho hai giao diện (Bản đồ gấp + Cơ bản) · v2

Status: **ĐỀ XUẤT v2, chờ PM duyệt lần cuối** (12/11/2026). [DESIGN.md](DESIGN.md) hiện tại **vẫn hiệu lực** tới
FREEZE; sau FREEZE nội dung này thay DESIGN.md (bản cũ vào `archive/`) và thêm 1 dòng vào `~/.claude/design-history.md`.

> Mockup 9 bảng: https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo · Scope: [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md)
> Bộ minh họa đề xuất: `docs/design/minh-hoa-de-xuat/` (chưa nhập production).

---

## 1. Ý tưởng

**Bản đồ gấp sống:** một tờ bản đồ giấy địa phương mở ra trên tay: 3 tấm gấp, lớp địa hình chồng nhau, đường đồng
mức, góc lật, ảnh dán băng dính, Sổ có bìa như bản đồ gấp. Cử chỉ: **MỞ**, **GẤP**, **NỐI**.

**Cơ bản:** cùng nội dung, thứ tự, hành động. Nền phẳng, thẻ trắng, ít chuyển động. Dùng chung bộ minh họa.

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

Logo giữ `#C8553D` (không dùng cho nút: chữ trắng chỉ đạt 4,4:1). Tương phản tính toán: nút 5,4:1 · đang nhấn
7,0:1 · focus ring 4,9:1 · chữ phụ trên kem 5,8:1 · chưa chắc chắn 5,4:1. **Đo lại trên máy thật sau BUILD.**

Ngoại lệ được giữ màu cố định: logo, màu trạng thái, màu trong hình minh họa, lớp game, `/admin`.

## 3. Chữ

Be Vietnam Pro (bộ `vietnamese`) cho toàn bộ nội dung; Literata chỉ cho tiêu đề lớn ở Bản đồ gấp (H1, tên chỗ, tên
Sổ/Lộ trình). H1 26 / 30px · tên chỗ 24 / 27px · nội dung 15px · phụ 13–13,5px · tối thiểu 13px · ô nhập 16px trên cảm ứng.

## 4. Chiều sâu Bản đồ gấp

| Yếu tố | Cách làm | Ở đâu |
|---|---|---|
| 3 tấm gấp | Nền chia 3 cột, mỗi cột tối dần về phải, vệt sáng ở nếp | Nền trang, sheet, thanh đáy |
| Tờ bản đồ | Khối giấy nổi (bóng 2 mức) + góc dưới phải lật lộ mặt sau | Đầu trang chủ, đầu trang chi tiết |
| Lớp địa hình | 3 lớp đồi SVG chồng, mỗi lớp bóng riêng, có đường đồng mức + nhãn “Minh họa”; cao 128px | Mép dưới tờ bản đồ trang chủ (người mới) |
| Ảnh dán | Viền giấy 5px, 2 băng dính, nghiêng −1,2°, bóng sâu | Ảnh/minh họa ở Chi tiết, Tìm chỗ |
| Bìa Sổ | Gáy xanh rừng 12px, đường đồng mức, nhãn giấy, xấp giấy phía sau | Sổ, Sổ gần đây |
| Dải giấy | Dải đứt nét dọc/ngang nối số thứ tự | Lộ trình |

Không dùng tranh làm bản đồ thật; không đặt điểm địa điểm lên tranh. Không 3D. Máy yếu: hình tĩnh, không thị sai.

## 5. Ảnh và hình minh họa

- Thứ tự chọn: ảnh thường của chỗ (ưu tiên ảnh bìa) → không có / lỗi tải → **minh họa theo nhóm**. Ảnh menu
  không bao giờ làm ảnh đại diện.
- Bộ 5 SVG vẽ tay (`an`, `choi`, `ngu`, `dilai`, `khac`), khung 3:2, ≈ 2 KB mỗi hình (nén < 1 KB), không chữ,
  không bảng hiệu, không công trình hay địa danh thật. `khac` dùng cho Chỗ quen gọi và nhóm lạ.
- Khung cố định: thẻ tìm 72×72 · ảnh nhỏ Sổ 48–56px · Chi tiết rộng đủ, cao 150px (ảnh thật 200px). Cắt giữa.
- Cơ bản: hình phẳng, bo 10px. Bản đồ gấp: viền giấy, băng dính, nghiêng.
- **Nhãn:** Chi tiết: “Hình minh họa · Chưa có ảnh thực tế” + “Gửi ảnh thật của chỗ này”. Thẻ tìm: dấu ✎ 20px
  ở góc + 1 dòng chú giải đầu danh sách; alt “Hình minh họa nhóm …, chưa có ảnh thực tế”. Ảnh lỗi: “Ảnh chưa tải
  được · đang hiện minh họa”.

## 6. Điều hướng (đề xuất, chờ PM)

- **Mobile:** header (logo + tên + Menu) + **thanh đáy 4 mục**: Trang chủ · Tìm chỗ · Sổ · Lộ trình. Mục đang mở:
  chữ đậm + gạch chân màu hành động. 320px: mỗi mục 80px, vẫn đủ nhãn.
- Màn chi tiết (chỗ, Sổ, Lộ trình): **thanh hành động thay thanh đáy** + “← Quay lại”. Không chồng 2 thanh.
- Bàn phím bật: ẩn thanh đáy / thanh hành động.
- **Menu:** Ghi chú của tôi · Góp một chỗ mới · Giới thiệu & chính sách dữ liệu · Lễ hội (lưu trữ) · khối
  **Giao diện** (đợt B, chọn 2 nút “Bản đồ gấp / Cơ bản” + câu giải thích).
- **Desktop:** sidebar hiện có; 4 mục lõi trên cùng, khối Giao diện ở đáy sidebar. Không có thanh đáy.

## 7. Bố cục 5 màn

**Trang chủ:** khẩu hiệu → H1 → câu dẫn → ô tìm (không autofocus) → 4 nhóm → [người mới] “Bắt đầu Sổ đầu tiên” /
[có dữ liệu, đợt B] Sổ gần đây (≤ 2) + Lộ trình gần đây (14 ngày). Bản đồ gấp: tất cả nằm trên một tờ bản đồ; người
mới có thêm lớp địa hình ở mép dưới; người quay lại bỏ lớp địa hình.

**Tìm chỗ:** ô tìm → chip nhóm → chip Khu vực / Giá → “N chỗ · đang xem 1–20” → chú giải ✎ → thẻ ~92px (ảnh 72px ·
tên · nhóm · khu · giá hoặc “Chưa có giá” · “chưa xác nhận” · nút Chỉ đường 44px) → “Xem thêm 20 chỗ”.

**Chi tiết:** ảnh/minh họa + nhãn → “Gửi ảnh” → tên · nhóm · khu · độ tin cậy → giá / địa chỉ / SĐT → **Lưu vào Sổ +
Chỉ đường** (≈ 460px từ đỉnh) → Chia sẻ · Thêm vào Lộ trình · Ghi chú riêng → Cần biết → đóng góp → Sửa giúp ·
Nguồn. Thanh hành động bám đáy. Bản đồ gấp: phần thông tin nằm trên tờ bản đồ có nếp ngang trước hàng nút.

**Sổ:** tiêu đề → “Sổ của bạn gắn với thiết bị này. Chưa có đồng bộ tự động giữa các thiết bị. Dùng trên máy
khác?” → danh sách (tên, số chỗ, sửa lần cuối, ảnh nhỏ) → Mở / Chia sẻ (+ Chọn ngẫu nhiên ở đợt B). Bản đồ gấp:
bìa bản đồ gấp, Sổ trống không có xấp giấy và không có nút.

**Lộ trình:** danh sách (tên, số điểm, phương tiện, sửa lần cuối) + “Tạo Lộ trình / Tạo từ một Sổ” → chi tiết:
điểm đánh số, giờ dự kiến, nút ↑ ↓ (44px), “+ Thêm điểm”, cảnh báo vị trí đoán → thanh “Mở trên Google Maps /
Chia sẻ”. Bản đồ gấp: điểm dán trên dải giấy dọc, có ảnh/minh họa nhỏ.

## 8. Thành phần chung

Nút chính (một mỗi vùng) · nút viền · nút ↑ ↓ · chip lọc · thẻ kết quả · thẻ Sổ / bìa Sổ · thẻ Lộ trình · sheet chọn
Sổ · sheet Chọn ngẫu nhiên (nói rõ “N chỗ hợp lệ, mỗi chỗ cơ hội như nhau”, “Chọn lại”) · toast có Hoàn tác (6 giây,
`role=status`) · thông báo lỗi · thông báo mất mạng (nền xanh rừng) · khung xương đang tải · trợ giúp “Dùng trên
máy khác?”.

## 9. Chuyển động

| Tên | Bản đồ gấp | Cơ bản | Giảm chuyển động |
|---|---|---|---|
| Chạm | ≤ 100ms, `scale(0.97)` | như vậy | như vậy |
| **MỞ** thẻ → chi tiết | Nâng → trải 120ms → trang 320ms (View Transitions) | Trượt 28px 260ms | Mở ngay |
| **GẤP** lưu → Sổ | “Đang lưu…” ngay → sau khi server OK gập góc 240ms → toast | Đổi nút + toast 200ms | Như Cơ bản |
| **NỐI** thêm điểm | Dải giấy kéo dài + đóng dấu số 300ms | Dòng mới mờ vào 200ms | Không hiệu ứng |
| Đổi giao diện | Tức thì | | |

Chỉ `transform`/`opacity`; không chạy khi gõ/chọn. **Nghiệm thu sau BUILD** trên máy thật.

## 10. Giữ nguyên từ DESIGN.md cũ

Chạm ≥ 44px · chữ ≥ 13px · ô nhập 16px · khung ảnh cố định · một nút chính mỗi vùng · nhãn trạng thái không tô nền ·
Chi tiết 2 vùng “Thông tin” + “Cần biết” · ngoại lệ chuyển động game.

## 11. Thay so với DESIGN.md cũ

| Cũ | Mới |
|---|---|
| §4 một màu nhấn `#c8553d` cho logo/nút/link | Màu hành động `#B04A33`; logo `#C8553D`; màu trang trí riêng cho Bản đồ gấp |
| §5 một bán kính | Theo chế độ: 12px / 6px |
| §7 chỉ 4 chỗ chuyển động | + MỞ / GẤP / NỐI có kiểm soát |
| §9 thiếu ảnh = để trống / biểu tượng | Hình minh họa theo nhóm + nhãn minh bạch |
| Font Geist | Be Vietnam Pro + Literata |
| Header + Menu là điều hướng duy nhất trên mobile | Thanh đáy 4 mục + Menu (chờ PM) |
