# SPEC — Chặng 4: Sổ chia sẻ được ⭐

> Chặng quan trọng nhất của cả hướng đi mới. Đọc kèm
> [NOTEBOOK-DESIGN.md §9](NOTEBOOK-DESIGN.md). Code làm bên Antigravity, trình kế hoạch trước.
>
> **Nhắm xong trước ~15/09/2026** — kịp lúc người ta hỏi nhau về lễ hội.

---

## 1. Làm gì, trong một câu

Khách chọn vài chỗ, ghi mỗi chỗ một dòng, bấm nút → được **một đường link**; gửi qua Zalo,
người nhận mở là xem được ngay, không cài gì, không đăng nhập.

## 2. Vì sao đây là chặng quan trọng nhất

Tháng 9 rất nhiều người Tuyên Quang sẽ bị bạn bè tỉnh khác nhắn *"tao về xem lễ hội, ăn ngủ
ở đâu?"*. Hiện họ trả lời bằng đoạn tin nhắn dài gõ tay, hoặc gửi 5 link Google Maps rời rạc.

Chặng này thay việc đó bằng một link. Ba hệ quả:

1. **Giải bài toán "ai viết ghi chú đầu tiên"** — người viết có lý do rõ ràng, đang có người
   hỏi thật, có thời hạn cụ thể
2. **Mỗi lần gửi link là web có thêm người biết** — không tốn tiền quảng cáo
3. Người nhận thấy hay → tự tạo sổ → gửi tiếp

**Nguyên tắc thiết kế xuyên suốt: giảm ma sát ở phía người NHẬN.** Người gửi đã có động lực
rồi; người nhận thì chưa. Bất kỳ bước nào bắt người nhận làm (cài app, đăng nhập, chờ tải)
đều giết vòng lan truyền.

---

## 3. Khách nhìn thấy gì

### 3.1 Thêm chỗ vào sổ

Trên mỗi thẻ, thêm nút **"+ Thêm vào sổ"** (biểu tượng dấu cộng, cạnh nút "Xem thêm").

Bấm → hiện danh sách sổ của người đó + ô "Tạo sổ mới". Chọn xong hiện `✓ Đã thêm`.

Chưa có sổ nào → bấm là tạo luôn sổ đầu tiên tên mặc định *"Sổ của tôi"*, không hỏi gì.

### 3.2 Trang sổ — `/so/{slug}`

```
Ăn ngủ ở Tuyên Quang dịp Trung Thu
8 chỗ · cập nhật 2 ngày trước

┌────────────────────────────────────┐
│ Phở Vinh Tuyên Quang          Ăn   │
│ 30k–50k · Phường Tân Quang         │
│ 💬 Sáng đi sớm, 7h là hết bàn      │  ← ghi chú của người tạo sổ
│ [Chỉ đường]                        │
└────────────────────────────────────┘
...

[ Lưu sổ này thành sổ của tôi ]
[ Tự tạo sổ của riêng bạn ]
```

**Bắt buộc:** trang này phải mở được **không cần đăng nhập, không cần localStorage**. Người
nhận link lần đầu chưa có gì trong máy.

### 3.3 Sửa sổ — `/so/{slug}/sua`

Chỉ chủ sổ (khớp `anonId` trong localStorage) mới vào được. Sửa tên sổ · sửa/xoá ghi chú
từng chỗ · đổi thứ tự · bỏ chỗ khỏi sổ · nút **"Sao chép link"**.

Người khác mở đường dẫn này → chuyển về trang xem.

> Ai xoá localStorage là **mất quyền sửa sổ vĩnh viễn** (sổ vẫn xem được). Chấp nhận ở Chặng
> 4; Chặng 7 (đăng nhập số điện thoại) sẽ giải quyết.

### 3.4 "Lưu sổ này thành sổ của tôi"

Bấm → **sao chép** nội dung sang một sổ mới thuộc về người bấm, slug mới. Sổ gốc không đổi.
Sổ mới ghi `copiedFrom: "{slug gốc}"`.

Đây là **mắt xích của vòng lan truyền** — người nhận trở thành người gửi.

### 3.5 Danh sách sổ của tôi — `/so`

Liệt kê sổ đã tạo/đã lưu. Không có sổ nào → hiện hướng dẫn ngắn cách tạo.

---

## 4. Lưu gì, ở đâu

### 4.1 Key Redis mới

**`notebook:{slug}`** — một key một sổ, giá trị là JSON.

```js
{
  slug: "tq-h7k2m9",
  title: "Ăn ngủ ở Tuyên Quang dịp Trung Thu",
  ownerAnonId: "c-<uuid>",
  items: [
    { placeId: "live-<uuid>", note: "Sáng đi sớm, 7h là hết bàn" },
    { placeId: "live-<uuid>", note: null }
  ],
  copiedFrom: null,
  createdAt: "2026-09-01T...",
  updatedAt: "2026-09-03T..."
}
```

Đọc 1 lệnh khi mở sổ. **Không nằm trên trang chủ nên không ảnh hưởng chi phí đọc mỗi lượt
xem.**

**`notebooks:by-owner:{anonId}`** — mảng slug của người đó. Đọc 1 lệnh cho trang `/so`.

### 4.2 Slug

8 ký tự, dùng bảng chữ **không gây nhầm lẫn** (bỏ `0 O 1 l I`): `23456789abcdefghjkmnpqrstuvwxyz`.
Kiểm tra trùng trước khi ghi (`SET NX`). Slug **không đoán được** — đây cũng là cơ chế bảo
mật duy nhất của sổ.

### 4.3 Chỗ trong sổ chỉ lưu `placeId`

**Không sao chép dữ liệu địa điểm vào sổ.** Lúc hiện trang sổ mới tra sang `places:live`.
Như vậy chỗ đổi giá/địa chỉ thì sổ tự cập nhật theo.

Chỗ đã bị xoá khỏi `places:live` → hiện mờ kèm chữ *"Chỗ này không còn trong danh bạ"*, giữ
lại tên và ghi chú của người tạo sổ. **Không tự xoá khỏi sổ** — ghi chú của người ta vẫn có
giá trị.

### 4.4 Ghi chú trong sổ

- Tối đa **140 ký tự**, một dòng
- **Chặn link và số điện thoại** (lớp 1 của [NOTEBOOK-DESIGN §7](NOTEBOOK-DESIGN.md))
- **Không duyệt** — đây là ghi chú của người tạo sổ trong sổ của họ, chỉ ai có link mới xem
  được. Khác hoàn toàn với ghi chú công khai (Chặng 5) hiện cho mọi khách

---

## 5. Quy tắc nghiệp vụ

| # | Quy tắc |
|---|---|
| 1 | Tạo sổ **không cần đăng nhập**. Chưa có hồ sơ thì tự tạo im lặng (giống Chặng 1 §2.3) |
| 2 | Xem sổ **không cần gì cả** — kể cả localStorage trống |
| 3 | Tối đa **10 sổ/người**, **30 chỗ/sổ** |
| 4 | Tên sổ tối đa 60 ký tự |
| 5 | Sổ **không hiện tên người tạo** — chỉ "Sổ của một người dùng CDP". Tránh biến thành mạng xã hội |
| 6 | Không có trang liệt kê sổ công khai, không xếp hạng sổ, **không đếm lượt xem hiển thị** |
| 7 | Không có điểm thưởng cho việc tạo sổ ở Chặng 4 — xem §6 |
| 8 | Sổ không có ngày hết hạn |

**Vì sao quy tắc 5–6:** sổ công khai + xếp hạng + tên người tạo = diễn đàn. Đó là thứ
[PRD §6](PRD.md) ghi **không bao giờ làm**. Sổ là thứ riêng tư gửi cho người quen, không phải
nội dung để thi thố.

---

## 6. Điểm thưởng — cố ý chưa làm

[NOTEBOOK-DESIGN §10](NOTEBOOK-DESIGN.md) không có mục nào cho việc tạo sổ. Chủ ý:

Thưởng điểm cho việc tạo sổ sẽ đẻ ra sổ rác — người ta tạo 10 sổ trống để ăn điểm. Mà giá
trị của sổ nằm ở chỗ **có người nhận thật**, thứ không đo được từ phía hệ thống.

Nếu sau lễ hội thấy cần khuyến khích, cân nhắc thưởng theo **sổ được người khác lưu lại**
(có tín hiệu giá trị thật) — nhưng cũng dễ bị lợi dụng, cần nghĩ kỹ. Chưa làm ở Chặng 4.

---

## 7. Đo lường — phần quan trọng nhất của chặng này

Tuần lễ hội 19–25/09 **không code, chỉ đo** ([ROADMAP.md](ROADMAP.md)). Ba con số quyết định
Chặng 5–8 có đáng làm không:

1. **Bao nhiêu sổ được tạo?**
2. **Bao nhiêu sổ có người mở?** (đếm nội bộ, không hiện ra giao diện)
3. **Bao nhiêu sổ được người khác "Lưu thành sổ của tôi"?** ← quan trọng nhất, đây là bằng
   chứng vòng lan truyền chạy được

Lưu vào `notebook:{slug}` hai trường `viewCount` và `copyCount` (chỉ để đọc trong `/admin`,
**không hiện cho khách**).

> Tăng `viewCount` bằng `HINCRBY`/`INCR` trên key riêng, đừng đọc-sửa-ghi cả JSON sổ mỗi
> lượt xem — vừa tốn lệnh vừa mất dữ liệu khi nhiều người mở cùng lúc. Gợi ý: một hash
> `notebook:stats` với field `{slug}:views` và `{slug}:copies`.

Thêm một mục gọn trong `/admin` hiện 3 con số này.

---

## 8. File dự kiến

**Mới:** `lib/notebooks.js` · `app/notebookActions.js` · `app/so/page.js` (danh sách) ·
`app/so/[slug]/page.js` (xem) · `app/so/[slug]/sua/page.js` (sửa) · `app/AddToNotebook.js`
(nút trên thẻ)

**Sửa:** `app/PlaceExplorer.js` (thêm nút) · `app/admin/page.js` (mục thống kê sổ)

**Không đụng:** `places:live` · `checkins.js` · `answers.js` · `occupancy.js`

---

## 9. Chỗ dễ sai

**Trang sổ phải chạy được khi localStorage trống.** Dễ quên vì lúc phát triển máy nào cũng
đã có hồ sơ sẵn. **Bắt buộc thử bằng cửa sổ ẩn danh.**

**Đừng để trang sổ đọc `places:live` nhiều lần.** Đọc một lần rồi tra trong bộ nhớ.

**Link phải xem được đẹp khi dán vào Zalo/Messenger** — thêm thẻ Open Graph (`og:title`,
`og:description`, `og:image`) cho `/so/{slug}`. Link dán ra mà không có ảnh, không có tiêu đề
thì ít người bấm. Đây là chi tiết nhỏ nhưng ảnh hưởng thẳng tới vòng lan truyền.

**Sổ trống thì đừng cho gửi link.** Nhắc "Thêm ít nhất 1 chỗ trước khi chia sẻ".

---

## 10. Xong thì bấm thử được gì

1. Bấm "+ Thêm vào sổ" trên 5 chỗ → tạo được sổ, đặt tên
2. Ghi chú một dòng cho từng chỗ
3. Bấm "Sao chép link" → được link ngắn dạng `/so/tq-h7k2m9`
4. **Mở link trong cửa sổ ẩn danh** → xem được đầy đủ, không đòi đăng nhập
5. Dán link vào Zalo → hiện tiêu đề sổ và ảnh, không phải link trơn
6. Từ cửa sổ ẩn danh bấm "Lưu sổ này" → thành sổ mới, sửa được, sổ gốc không đổi
7. Sửa giá một chỗ trong `/admin` → mở lại sổ thấy giá mới
8. Xoá một chỗ khỏi `places:live` → sổ hiện mờ chỗ đó, ghi chú vẫn còn
9. Vào `/admin` thấy: số sổ đã tạo, số lượt mở, số lượt được lưu lại

---

## 11. Ngoài phạm vi Chặng 4

- Sổ nhiều người cùng sửa
- Sổ công khai, xếp hạng, tìm kiếm sổ (**không bao giờ làm** — xem §5)
- Bình luận trong sổ (**không bao giờ làm**)
- In sổ ra PDF, xuất ảnh
- Sắp xếp chỗ trong sổ theo tuyến đường/bản đồ
- Điểm thưởng cho việc tạo sổ (xem §6)
