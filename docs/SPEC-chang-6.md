# SPEC — Chặng 6: Ghi chú riêng

> Đọc kèm [NOTEBOOK-DESIGN.md §8](NOTEBOOK-DESIGN.md). Code làm bên Antigravity, trình kế
> hoạch trước.

---

## 1. Làm gì, trong một câu

Khách tự ghi chú cho mình xem, **không ai khác thấy**, lưu ngay trên máy họ, không cần đăng
ký gì.

**Vì sao cần:** đây mới là thứ biến web từ "trang tra cứu" thành **"cuốn sổ của tôi"**.

---

## 2. Điểm khác biệt lớn nhất: không có gì trên máy chủ

Ghi chú riêng lưu **hoàn toàn trong bộ nhớ trình duyệt** (`localStorage`) trên máy khách.

Nghĩa là:

| | |
|---|---|
| Cần đăng ký | Không |
| Ghi và xem | Ngay lập tức, kể cả mạng yếu |
| **Admin có đọc được không** | **Không — hoàn toàn riêng tư** |
| Đổi sang điện thoại khác | **Mất** |
| Xoá dữ liệu duyệt web | **Mất** |
| Mở trên máy tính | **Không thấy** ghi chú đã ghi trên điện thoại |

Ba dòng cuối là lý do có **Chặng 7** (đăng nhập số điện thoại). Chặng 6 **cố ý chấp nhận
rủi ro mất** để không cản người mới.

**Điểm cộng ít ai để ý:** giai đoạn này dự án **không hề nắm giữ ghi chú riêng tư của ai**.
Lời hứa "ghi chú riêng là của riêng bạn" không phải cam kết suông mà là sự thật kỹ thuật —
và giảm hẳn rủi ro pháp lý về dữ liệu cá nhân.

---

## 3. Khách nhìn thấy gì

### 3.1 Ô ghi chú trên thẻ

Trong phần bung, **trên cùng** (trước cả thông tin công khai — đây là thứ của riêng họ):

```
📝 Ghi chú riêng của bạn
┌────────────────────────────────────┐
│ Bà chủ dễ tính, xin thêm nước dùng │
│ được. Đi với mẹ thì hợp.           │
└────────────────────────────────────┘
Chỉ mình bạn thấy · Lưu trên máy này
                    [Xoá]  [Chia sẻ cho mọi người]
```

Chưa có ghi chú → chỉ hiện một dòng mờ **"+ Ghi chú riêng"**, bấm mới mở ô nhập.

Tự lưu sau khi ngừng gõ ~1 giây. Không có nút "Lưu".

**Giới hạn 500 ký tự**, nhiều dòng được. Rộng hơn ghi chú công khai (120) vì không ai khác
đọc, không cần lọc gì.

### 3.2 Không lọc, không duyệt

Không chặn link, không chặn số điện thoại, không AI đọc, không admin duyệt. **Chỉ mình chủ
nhân thấy.**

Chỉ có **một dòng nhắc nhẹ** ngay dưới ô nhập, hiện lần đầu:

> *Ghi chú riêng lưu trên máy này. Không nên ghi thông tin nhạy cảm (mật khẩu, số tài khoản,
> giấy tờ).*

### 3.3 Trang "Ghi chú của tôi" — `/ghi-chu`

Liệt kê mọi ghi chú riêng, kèm tên chỗ, bấm vào nhảy tới chỗ đó. Có ô tìm kiếm.

Đây là chỗ khách **nhìn thấy cuốn sổ của mình đã dày lên** — quan trọng về mặt cảm giác, và
là chỗ đặt lời mời ở §5.

### 3.4 Nút "Chia sẻ cho mọi người"

Bấm → hiện ô xác nhận, cho sửa lại nội dung (rút xuống **120 ký tự**), rồi gửi vào hàng chờ
ghi chú công khai của **Chặng 5** — qua đủ 5 lớp lọc, admin duyệt, được +5 điểm.

Ghi chú riêng **vẫn giữ nguyên** sau khi chia sẻ.

> **Đây là cầu nối quan trọng.** Ghi chú riêng là thứ người ta viết thật lòng, cho chính
> mình, không diễn — nguồn ghi chú công khai chất lượng cao nhất, và nó **tự chảy sang** mà
> không cần đi xin ai viết.

Nếu Chặng 5 chưa làm thì ẩn nút này.

---

## 4. Lưu gì, ở đâu

**Không có key Redis nào.** Toàn bộ trong `localStorage`:

```js
// khoá: "cdp_personal_notes"
{
  "live-<uuid>": { text: "Bà chủ dễ tính...", updatedAt: "2026-10-01T..." },
  "live-<uuid>": { text: "Phòng 302 view đẹp", updatedAt: "2026-10-03T..." }
}
```

**Chặng 5 và 6 không dùng chung chỗ lưu nào** — một cái trên máy chủ, một cái trên máy khách.

### Chỗ dễ sai

**Bộ nhớ trình duyệt có hạn (~5MB).** 500 ký tự × 1000 ghi chú ≈ 500KB — an toàn. Nhưng vẫn
nên bắt lỗi khi ghi thất bại và báo *"Không lưu được ghi chú, bộ nhớ trình duyệt đã đầy"*
thay vì im lặng mất dữ liệu.

**Chỗ bị xoá khỏi `places:live`:** ghi chú riêng vẫn giữ, hiện ở `/ghi-chu` kèm chữ *"Chỗ này
không còn trong danh bạ"*. **Không bao giờ tự xoá ghi chú của người ta.**

**Chế độ ẩn danh:** `localStorage` mất khi đóng cửa sổ — không xử lý được, nhưng nên nhận ra
và báo trước *"Trình duyệt đang ở chế độ ẩn danh, ghi chú sẽ mất khi đóng"*.

---

## 5. Mời để lại số điện thoại — chuẩn bị cho Chặng 7

Khi khách có **ghi chú thứ 3**, hiện một dòng mời ở `/ghi-chu`:

> *Bạn đang có 3 ghi chú. Lưu lại để không mất khi đổi điện thoại?* **[Để sau] [Lưu lại]**

**Chặng 6 chỉ hiện lời mời, chưa làm chức năng.** Bấm "Lưu lại" → báo *"Sắp có"*. Việc thật
là Chặng 7.

**Vì sao mời đúng lúc này:** cùng một việc "xin số điện thoại", hỏi lúc chưa có gì là
**phiền**, hỏi lúc đã có 3 ghi chú là **giúp**. Phải đợi họ **có thứ để mất** rồi mới hỏi.

Bấm "Để sau" → không hỏi lại trong 14 ngày.

---

## 6. Quy tắc nghiệp vụ

| # | Quy tắc |
|---|---|
| 1 | Ghi chú riêng **không bao giờ** gửi lên máy chủ ở Chặng 6 |
| 2 | Không lọc, không duyệt, không giới hạn nội dung (trừ 500 ký tự) |
| 3 | **Không có điểm thưởng** — viết cho mình thì không thưởng được, và thưởng sẽ đẻ ra ghi chú rác |
| 4 | Không tự xoá ghi chú vì bất kỳ lý do gì |
| 5 | Chia sẻ công khai là **hành động chủ động**, không bao giờ tự động |
| 6 | Lời mời số điện thoại chỉ hiện từ ghi chú thứ 3 |

---

## 7. File dự kiến

**Mới:** `lib/personalNotes.js` (đọc/ghi localStorage — chạy phía trình duyệt, **không phải
Server Action**) · `app/PersonalNote.js` · `app/ghi-chu/page.js`

**Sửa:** `app/PlaceExplorer.js` (chèn ô ghi chú vào đầu phần bung)

**Không đụng:** mọi thứ phía máy chủ

---

## 8. Xong thì bấm thử được gì

1. Ghi chú riêng ở 3 chỗ → tải lại trang vẫn còn
2. Đóng trình duyệt mở lại → vẫn còn
3. Mở cùng chỗ đó ở **cửa sổ ẩn danh** → **không thấy** ghi chú (đúng: riêng tư)
4. Vào `/ghi-chu` → thấy cả 3, bấm vào nhảy đúng chỗ
5. Đến ghi chú thứ 3 → hiện lời mời số điện thoại; bấm "Để sau" thì 14 ngày không hỏi lại
6. Bấm "Chia sẻ cho mọi người" → vào hàng chờ Chặng 5, ghi chú riêng vẫn còn
7. Xoá một chỗ khỏi `places:live` → ghi chú vẫn ở `/ghi-chu`, có ghi chú "không còn trong
   danh bạ"
8. Xoá dữ liệu duyệt web → mất hết (đúng thiết kế, và là lý do có Chặng 7)

---

## 9. Ngoài phạm vi Chặng 6

- Đồng bộ giữa nhiều máy → **Chặng 7**
- Ghi chú riêng cho cả một cuốn sổ (Chặng 4), không chỉ cho từng chỗ
- Gắn thẻ/phân loại ghi chú
- Nhắc nhở theo ghi chú
- Ảnh trong ghi chú riêng
