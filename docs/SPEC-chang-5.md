# SPEC — Chặng 5: Ghi chú công khai bằng chữ

> Đọc kèm [NOTEBOOK-DESIGN.md §7](NOTEBOOK-DESIGN.md) (5 lớp chặn) và
> [SPEC-chang-2.md](SPEC-chang-2.md) (cấu trúc hỏi–đáp dùng lại ở đây).
> Code làm bên Antigravity, trình kế hoạch trước.

---

## 1. Làm gì, trong một câu

Khách gõ được **mẹo ngắn** về một địa điểm; gõ xong chưa hiện ngay — máy lọc trước, admin
duyệt rồi mới lên.

**Vì sao cần:** có những thứ không thể làm thành nút bấm ("gửi xe ở ngõ cạnh số 12", "tối
20/09 chặn đường Nguyễn Tất Thành từ 18h"). Nhưng đây cũng là chỗ dễ bị phá nhất — nên là
loại nội dung duy nhất **luôn phải qua duyệt**.

---

## 2. Hai loại ghi chú chữ

### 2.1 Mẹo riêng (tự do)

Câu hỏi cố định: **"Bạn có mẹo gì cho chỗ này không?"** · tối đa **120 ký tự**.

Tuỳ chọn **"Chỉ đúng trong dịp lễ hội"** → tự ẩn sau ngày kết thúc lễ hội (mặc định
25/09/2026, để trong hằng số sửa được). Loại thông tin có hạn sử dụng là thứ Google Maps vĩnh
viễn không chứa được — và nó **tự dọn rác**, không cần ai đi xoá.

### 2.2 Nên gọi món gì (chỉ với `type === "an"`)

Ô gõ **40 ký tự**, chỉ tên món. Đây là câu áp dụng cơ chế **"gõ hôm nay → thành lựa chọn
ngày mai"** ([NOTEBOOK-DESIGN §4](NOTEBOOK-DESIGN.md) cách 2):

- Người đầu tiên: ô gõ trống
- Từ người thứ hai: hiện các món đã được duyệt dưới dạng **nút bấm** + ô gõ để thêm món mới

```
Người khác gọi:  [phở bò tái] [bún chả] [+ món khác]
```

Bấm nút món có sẵn = **một phiếu bấm chọn**, đi theo luật đồng thuận của Chặng 2, **không
cần duyệt**. Chỉ món gõ mới mới cần duyệt.

**Đây là điểm quan trọng:** ô gõ tự thu hẹp dần theo thời gian. Sau 5–10 lượt, câu này gần
như không còn ai phải gõ nữa — và khối lượng duyệt của admin cũng giảm theo.

---

## 3. Năm lớp chặn

| Lớp | Cơ chế | Chặn được gì |
|---|---|---|
| **0** | Cấu trúc: phần lớn thông tin đã là bấm chọn (Chặng 2–3) | Không có chỗ để viết bậy |
| **1** | Giới hạn 40–120 ký tự · 1 dòng · **chặn link và số điện thoại** | Quảng cáo trá hình — dạng phá hoại phổ biến nhất |
| **2** | Lọc máy: từ khoá bậy · chuỗi vô nghĩa (`asdfgh`) · lặp ký tự · toàn chữ hoa | Rác rõ ràng — **loại thẳng, không vào hàng chờ** |
| **3** | AI đọc 1 lượt, hỏi đúng 1 việc | Nội dung lạc đề |
| **4** | Admin duyệt trong `/admin` | Số ít còn lại, mỗi cái nhìn 2 giây |
| **5** | Sau khi hiện: nút "ghi chú này không đúng", **2 người báo là tự ẩn** | Cái lọt lưới |

### Chi tiết lớp 1

Chặn bằng biểu thức: chuỗi có `http`, `www.`, `.com`/`.vn`, hoặc **từ 9 chữ số liên tiếp trở
lên** (số điện thoại VN). Báo lỗi rõ: *"Ghi chú không được chứa link hay số điện thoại"*.

### Chi tiết lớp 3 — câu hỏi cho AI

Nhờ cấu trúc hỏi–đáp, câu hỏi cho AI rất hẹp nên gần như không sai:

```
Câu hỏi: "{câu hỏi hệ thống đặt}"
Câu trả lời của người dùng: "{nội dung}"

Câu trả lời này có đang trả lời đúng câu hỏi trên không, và có phải nội dung
lành mạnh về một địa điểm ở Tuyên Quang không?
Trả lời đúng 1 từ: OK hoặc LOAI
```

Kết quả `LOAI` → không vào hàng chờ, báo người gửi *"Ghi chú chưa phù hợp, thử viết lại"*.

Nếu gọi AI lỗi/hết hạn mức → **cho qua vào hàng chờ** (admin vẫn duyệt ở lớp 4). Không được
để lỗi AI chặn người dùng thật.

### Chi tiết lớp 5

Nút nhỏ *"Ghi chú này không đúng"* cạnh mỗi ghi chú đã hiện. **Không tranh luận, không hiện
ai báo, không có nút phản đối.** 2 người báo → tự ẩn + quay lại hàng chờ trong `/admin`.

---

## 4. Khách nhìn thấy gì

### 4.1 Chỗ gõ

Trong phần bung của thẻ, dưới khối câu hỏi bấm chọn:

```
Bạn có mẹo gì cho chỗ này không?
┌────────────────────────────────────┐
│                                    │
└────────────────────────────────────┘
0/120                    ☐ Chỉ đúng dịp lễ hội
                                    [ Gửi ]
```

Gửi xong: `✓ Cảm ơn bạn — ghi chú sẽ hiện sau khi kiểm tra. +5 điểm đang chờ.`

**Phải báo rõ là chưa hiện ngay.** Không nói thì người ta tưởng lỗi và gửi lại.

### 4.2 Hiển thị ghi chú đã duyệt

Dưới khối thông tin bấm chọn, **dạng thuộc tính, không phải bài đăng**:

```
💡  Mẹo      Gửi xe ở ngõ cạnh số 12, đi bộ 20m
💡  Mẹo      Cuối tuần nên gọi trước                    (ẩn nút báo sai)
🍜  Nên gọi  phở bò tái · bún chả
```

**Không hiện:** tên người viết · thời gian viết · nút thích · nút trả lời · thứ tự theo dòng
thời gian. Đây là cách chặn diễn đàn **bằng cấu trúc** ([PRD §6](PRD.md)).

Tối đa hiện **3 mẹo** mỗi chỗ, ưu tiên mẹo mới được duyệt gần nhất.

---

## 5. Lưu gì, ở đâu

**`place_notes:published`** — **hash**, field = `placeId`, value = JSON mảng ghi chú đã duyệt.

```js
[
  { id: "n-<uuid>", text: "Gửi xe ở ngõ cạnh số 12", festivalOnly: false,
    approvedAt: "2026-09-01T...", reports: 0 }
]
```

Trang chủ đọc **1 lệnh `HGETALL`**. (Tổng chi phí trang chủ sau Chặng 5: **4 lệnh** —
`places:live` + `place_checkins:latest` + `place_answers:consensus` + `place_notes:published`.
Không tăng theo số địa điểm.)

**`place_notes:queue`** — mảng ghi chú chờ duyệt.

```js
{ id, placeId, questionId, text, festivalOnly, contributorId, at, aiVerdict }
```

**`note_reports:{noteId}`** — đếm số người báo sai. `INCR` + `EXPIRE` 90 ngày. Đạt 2 → ẩn.

---

## 6. Duyệt trong `/admin`

Thêm mục **"Ghi chú chờ duyệt"**, mỗi mục hiện: tên chỗ · câu hỏi · nội dung · kết quả AI ·
2 nút **Duyệt** / **Bỏ**.

Duyệt → đẩy vào `place_notes:published` + cộng **+5 điểm**.
Bỏ → xoá, không cộng, không báo người gửi.

Thêm mục **"Ghi chú bị báo sai"** cho những cái đã tự ẩn ở lớp 5.

> ⚠️ Dùng đúng cách đọc-sửa-ghi đang có cho hàng chờ (admin duyệt từng cái một nên an toàn).
> Nhưng `place_notes:published` là hash → dùng `HSET` theo field, đừng ghi đè cả hash.

---

## 7. Quy tắc nghiệp vụ

| # | Quy tắc |
|---|---|
| 1 | Ghi chú chữ **luôn phải duyệt**. Không có ngoại lệ |
| 2 | Điểm **+5**, cộng **sau khi duyệt** |
| 3 | Một người tối đa **3 ghi chú chờ duyệt** cùng lúc (chặn gửi hàng loạt) |
| 4 | Chặn gửi trùng y hệt nội dung cho cùng một chỗ — dùng lại cách của `lib/suggestions.js` |
| 5 | Ghi chú "chỉ đúng dịp lễ hội" tự ẩn sau ngày kết thúc, **không xoá** (admin xem lại được) |
| 6 | 2 người báo sai → tự ẩn + về hàng chờ |
| 7 | Trần 30 điểm/ngày dùng chung (xem [SPEC-chang-2 §4.2](SPEC-chang-2.md)) |

---

## 8. File dự kiến

**Mới:** `lib/notes.js` · `lib/noteFilters.js` (lớp 1–2) · `lib/noteAiCheck.js` (lớp 3) ·
`app/noteActions.js` · `app/NoteInput.js` · `app/admin/noteActions.js`

**Sửa:** `app/page.js` (+1 lệnh đọc) · `app/PlaceExplorer.js` · `app/admin/page.js` ·
`lib/questions.js` (thêm câu "nên gọi món gì" dạng lai bấm-chọn + gõ)

---

## 9. Xong thì bấm thử được gì

1. Gõ một mẹo → báo "sẽ hiện sau khi kiểm tra", **chưa hiện trên thẻ**
2. Duyệt trong `/admin` → hiện lên thẻ, người gửi được +5
3. Gõ mẹo có số điện thoại → **bị chặn ngay**, báo lỗi rõ
4. Gõ mẹo có link → bị chặn
5. Gõ `asdfgh` → bị chặn, **không vào hàng chờ**
6. Gõ nội dung lạc đề → AI loại, không vào hàng chờ
7. Tích "chỉ đúng dịp lễ hội", chỉnh ngày máy sang sau 25/09 → ghi chú tự ẩn
8. Bấm "ghi chú này không đúng" từ 2 trình duyệt → tự ẩn, về hàng chờ
9. Chỗ "Ăn": người đầu gõ tên món, người thứ hai thấy **nút bấm** món đó
10. Gửi 4 ghi chú liên tiếp → cái thứ 4 bị chặn

---

## 10. Ngoài phạm vi Chặng 5

- Sửa ghi chú đã duyệt (chỉ có bỏ và viết lại)
- Trả lời/bình luận (**không bao giờ làm**)
- Hiện tên người viết (**không bao giờ làm**)
- Dịch ghi chú sang tiếng Anh
- Ghi chú kèm ảnh (ảnh đã có luồng riêng từ 18/07)
