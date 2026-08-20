# SPEC — Rà soát giao diện

> Không phải một chặng mới. Đây là **một lượt rà soát tổng thể** sau 6 chặng, làm trước khi
> tới Chặng 7. Code làm bên Antigravity, trình kế hoạch trước.
>
> **Phạm vi đóng khung ở 7 mục dưới đây. Hết là dừng.** "Tối ưu giao diện" không có điểm
> dừng tự nhiên — dễ ăn hết một tháng nếu không khoanh.

**Mục tiêu:** sang, hiện đại, đơn giản, nhìn lâu không chán. Cụ thể là bỏ bớt chứ không thêm
vào — không thêm màu, không thêm hiệu ứng, không thêm thông tin.

---

## 1. ⚠️ Lỗi phải sửa đầu tiên: web đang chạy bằng Arial

`app/layout.js` nạp font **Geist** và khai báo biến `--font-geist-sans` đàng hoàng. Nhưng
`app/globals.css` có:

```css
body { font-family: Arial, Helvetica, sans-serif; }
```

Dòng này **đè mất** font đã nạp. Toàn bộ web đang hiển thị bằng Arial.

Đã ghi trong [STATUS.md](STATUS.md) từ **2026-07-20** ("font Geist đã khai báo nhưng bị 1
dòng CSS cũ đè mất, chưa sửa") và vẫn chưa sửa.

**Sửa:** đổi thành `font-family: var(--font-geist-sans), system-ui, sans-serif;`

Đây là thay đổi **một dòng có tác động lớn nhất** trong cả spec này. Arial là tín hiệu "rẻ
tiền" mạnh nhất mà một trang web có thể phát ra.

---

## 2. Thang chữ — vấn đề lớn nhất về bố cục

Đếm thực tế trong `app/*.js`: **`text-sm` 71 lần · `text-xs` 52 lần** — tức 123/135 chỗ chữ
đều nhỏ như nhau. `text-base` chỉ 5 lần, `text-lg` 4 lần.

Hệ quả: không có thứ bậc, mắt không biết nhìn đâu trước, mọi thứ chen nhau.

**Thang mới — chỉ 5 bậc, dùng đúng 5 bậc này, không thêm:**

| Vai trò | Lớp | Ghi chú |
|---|---|---|
| Số nổi bật (giá) | `text-2xl font-medium tracking-tight` | To nhất trên thẻ |
| Tên địa điểm | `text-lg font-medium tracking-tight leading-snug` | |
| Nội dung chính | `text-sm` (14px) | Thông tin bấm chọn, mẹo |
| Phụ / metadata | `text-[13px] text-zinc-500` | Loại · khu vực · nguồn |
| Nhãn nhỏ nhất | `text-xs text-zinc-400` | Chỉ dùng cho chú thích thật sự phụ |

**Quy tắc:** trên một thẻ chỉ được có **một thứ to nhất**. Hiện tại tên và giá đang cùng cỡ
— phải chênh nhau rõ.

`font-weight` chỉ dùng **2 mức**: `font-normal` và `font-medium`. Không dùng `font-bold`,
`font-semibold` — chữ đậm quá làm giao diện nặng nề.

---

## 3. Bỏ viền, dùng khoảng trắng

Đếm thực tế: **`border-zinc-300` 25 lần · `border-zinc-200` 14 lần**, nhưng `shadow-sm` chỉ
**4 lần**.

Hộp lồng trong hộp là thứ khiến giao diện trông như tờ khai chứ không như sản phẩm.

**Quy tắc mới:**

- Thẻ địa điểm: **không viền**, dùng `bg-white shadow-sm rounded-xl`
- Các khối bên trong thẻ: **không viền, không nền riêng** — ngăn cách bằng khoảng cách
- Chỉ dùng đường kẻ khi thật sự cần tách nhóm: `border-t border-zinc-100` (mảnh, nhạt), tối
  đa **2 đường** trong một thẻ bung
- Ô nhập liệu vẫn giữ viền (người dùng cần thấy chỗ gõ)

**Khoảng cách — nhân đôi so với hiện tại:**

| Chỗ | Hiện tại | Đổi thành |
|---|---|---|
| Giữa các nhóm trong thẻ | `gap-2` (8px) | `gap-5` (20px) |
| Giữa các dòng cùng nhóm | `gap-1` (4px) | `gap-3` (12px) |
| Đệm trong thẻ | `p-3`/`p-4` | `px-[18px] py-5` |
| Giữa các thẻ | — | `gap-3` (12px) |

Cảm giác "sang" phần lớn đến từ khoảng trống. Nếu thấy hơi rộng quá thì thường là **đang
đúng**.

---

## 4. Màu — một màu nhấn duy nhất

Hiện có xanh lá, hổ phách, đỏ, đen (`bg-zinc-900` 15 lần), và cam CDP `#c8553d` cùng lúc.

**Quy tắc mới:**

| Màu | Chỉ dùng cho |
|---|---|
| **Cam CDP `#c8553d`** | Logo, nút chính, liên kết. **Không dùng cho nhãn trạng thái** |
| **Xanh lá** | Đúng một việc: "Còn mở · xác nhận N ngày trước" |
| **Xám** | Tất cả những thứ còn lại |

Bỏ nhãn hổ phách và đỏ khỏi thẻ. Thông tin "độ tin cậy 65%", "có thể đã cũ" chuyển thành chữ
xám nhạt, không tô nền.

**Nút:** một nút chính (nền cam hoặc `bg-zinc-900`), các nút còn lại thu về **biểu tượng
không viền**. Hiện đang có 4 nút chữ ngang hàng nhau nên không biết cái nào chính.

---

## 5. Bo góc — một bán kính

Hiện dùng lẫn 4 kiểu: `rounded-full` 39 · `rounded-lg` 15 · `rounded-xl` 5 · `rounded-2xl` 5.

**Quy tắc mới:** `rounded-xl` (12px) cho thẻ · `rounded-lg` (8px) cho nút và ô nhập ·
`rounded-full` **chỉ** cho ảnh đại diện và huy hiệu. Bỏ `rounded-2xl`.

---

## 6. Thứ tự các khối trong thẻ bung

Sau 6 chặng, phần bung đang chứa ~10 khối do 6 lần code khác nhau đẻ ra, chưa ai xếp lại.

**Thứ tự mới — theo mức độ khách cần:**

1. **Ghi chú riêng của bạn** (nếu có) — thứ của riêng họ, để trên cùng
2. **Giá** + **dòng "Còn mở"**
3. **Thông tin bấm chọn** (gửi xe · lối vào · giờ đông · thanh toán…)
4. **Mẹo công khai** (tối đa 3)
5. **Ảnh** (nếu có)
6. **Địa chỉ đầy đủ · nguồn · cập nhật lần cuối** — thu vào một dòng nhỏ, xám nhạt
7. **Hàng nút:** một nút chính "Chỉ đường" + biểu tượng cho các việc còn lại

**Câu hỏi bấm chọn** (khối hỏi khách) đặt **cuối cùng**, sau hàng nút — nó là việc đóng góp,
không phải việc tra cứu.

**Khối nào không có dữ liệu thì ẩn hẳn**, không hiện "chưa có thông tin". Web 25–100 chỗ mà
mỗi thẻ có 4 dòng "chưa có" thì trông chết chóc.

---

## 7. Chuyển động

Hiện chỉ có **một** hiệu ứng: `cdp-highlight-flash` — **1,1 giây × 2 lần = 2,2 giây** nhấp
nháy. Dài gấp khoảng bảy lần mức nên dùng.

**Nguyên tắc: 150–300ms, `ease-out`, và người dùng gần như không nhận ra nó đang diễn ra.**
Hiệu ứng tốt là hiệu ứng chỉ thấy thiếu khi bỏ đi.

**Chỉ có đúng ba chỗ chuyển động:**

| Chỗ | Thời gian | Kiểu |
|---|---|---|
| Thẻ bung ra / thu lại | 250ms `ease-out` | Trượt xuống + hiện dần |
| Nút bấm | 100ms | `scale(0.97)` lúc nhấn |
| Nội dung mới xuất hiện | 200ms | Mờ dần vào |

**Sửa `cdp-highlight-flash`:** rút còn **1 lần, 600ms**, và chỉ đổi nền — bỏ `box-shadow`
nhấp nháy.

**Bắt buộc thêm:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

Ngoài ba chỗ trên: **không có gì nhấp nháy, không có gì nảy, không có gì tự chạy.**

---

## 8. Điện thoại

Gần như 100% khách lễ hội dùng điện thoại. Kiểm tra trên **máy thật**, không phải chế độ giả
lập của trình duyệt:

- Mọi thứ bấm được phải cao tối thiểu **44px**
- Bàn phím bật lên **không được che ô đang gõ**
- Thẻ bung ra thì tự cuộn để thấy được phần vừa mở
- Chữ nhỏ nhất không dưới **13px** (hiện `text-xs` = 12px đang dùng 52 lần — rà lại, chỗ nào
  là nội dung thật thì nâng lên 13px)
- Ảnh phải có `width`/`height` để trang không nhảy khi ảnh tải xong

---

## 9. Trạng thái rỗng

Chỗ chưa có dữ liệu gì — hiện chưa ai thiết kế. Cần:

- **Thẻ chưa có thông tin bấm chọn nào:** không hiện khối đó, chỉ hiện câu hỏi mời đóng góp
- **Lọc ra 0 kết quả:** một dòng gọn "Không có chỗ nào khớp" + nút xoá bộ lọc
- **`/ghi-chu` chưa có ghi chú nào:** một câu mời, không phải bảng trống
- **`/so` chưa có sổ nào:** một câu mời

---

## 10. Xong thì bấm thử được gì

1. Mở web → chữ **không còn là Arial** (kiểm tra bằng công cụ kiểm tra phần tử)
2. Nhìn một thẻ → biết ngay đâu là tên, đâu là giá, không phải đọc dò
3. Đếm số viền trong một thẻ bung → **tối đa 2 đường kẻ**
4. Đếm số màu trên một thẻ → **tối đa 2** (cam hoặc xanh lá, cộng xám)
5. Bung thẻ → mượt, khoảng 250ms, không giật
6. Nhảy tới một chỗ từ `/ghi-chu` → nhấp nháy **1 lần**, nhanh
7. Bật "giảm chuyển động" trong máy → mọi hiệu ứng tắt
8. Mở trên điện thoại thật → gõ ghi chú, bàn phím không che ô
9. Lọc ra 0 kết quả → có trạng thái rỗng tử tế
10. Một chỗ chưa có dữ liệu gì → thẻ vẫn gọn gàng, không đầy chữ "chưa có"

---

## 11. Ngoài phạm vi

- Chế độ tối (đã cố ý bỏ — xem `globals.css`)
- Đổi logo, đổi tên thương hiệu
- Vẽ minh hoạ, biểu tượng riêng
- Đổi bố cục trang chủ (chỉ sửa thẻ và hệ thống nền tảng)
- Thêm bất kỳ thông tin mới nào lên thẻ
- Bản đồ

---

## 12. Nguyên tắc để nhớ

> Mỗi lần định thêm gì vào thẻ, hỏi trước: **bỏ được cái gì đi?**
>
> Sáu chặng vừa qua mỗi chặng thêm một khối. Lượt rà này là để lùi lại và bỏ bớt — không
> phải để thêm.
