# SPEC — Trang duyệt `/admin`, bước 1: tìm kiếm và lọc

> Rà soát khả năng dùng của `/admin` khi dữ liệu đã lên 109 chỗ và còn tăng.
> **Phạm vi đóng khung ở bước 1.** Bước 2 (gom 8 mục thành 3 nhóm tab) để sau, xem §8.
>
> Code làm bên Antigravity, trình kế hoạch trước.

---

## 1. Vấn đề thật — nặng hơn "thiếu ô tìm kiếm"

Mục "Đang công khai" ở `app/admin/page.js` dòng **538–558** đang làm thế này:

```jsx
{live.map((place) => (
  <PlaceForm key={place.id} place={place}>
    <button formAction={updateLive}>Lưu</button>
    <button formAction={deleteLive}>Xoá</button>
  </PlaceForm>
))}
```

Nghĩa là **mỗi chỗ render một form sửa đầy đủ (~10 ô), tất cả mở sẵn cùng lúc**. Với 109 chỗ
là **109 biểu mẫu** xếp dọc — không phải danh sách để đọc lướt.

Ba hệ quả:

1. **Không tìm được gì.** Muốn sửa "Phở Vinh" phải cuộn qua hàng trăm ô nhập, hoặc Ctrl+F.
2. **Trang nặng.** 109 form × ~10 ô = hơn 1.000 ô nhập trong một trang. Ở mức 300 chỗ sẽ
   chậm thấy rõ.
3. **Dễ sửa nhầm.** Mọi ô đều đang mở và gõ được — chạm nhầm một ô rồi bấm Lưu ở chỗ khác là
   sửa nhầm mà không biết.

Thêm nữa, mục này nằm **dưới cùng** trang, sau 7 mục khác. Mỗi lần muốn sửa một chỗ đều phải
cuộn qua toàn bộ.

---

## 2. Làm gì, trong một câu

Mục "Đang công khai" đổi từ **109 form mở sẵn** thành **danh sách gọn có tìm kiếm và lọc**,
bấm mới mở form sửa.

---

## 3. Giao diện mới

```
Đang công khai (109)

[ Tìm theo tên, địa chỉ, khu vực...                                    ]

[ Tất cả 109 ] [ Ăn 47 ] [ Chơi 22 ] [ Ngủ 31 ] [ Đi lại 9 ]

┌──────────────────────────────┬──────────────────────────────┐
│ Phở Vinh Tuyên Quang         │ Bún Gạo Cô Hạnh              │
│ Ăn · Tân Quang        [Sửa]  │ Ăn · Minh Xuân        [Sửa]  │
├──────────────────────────────┼──────────────────────────────┤
│ Khách sạn Mường Thanh        │ Công viên hồ Tân Quang       │
│ Ngủ · Minh Xuân       [Sửa]  │ Chơi · Phan Thiết     [Sửa]  │
└──────────────────────────────┴──────────────────────────────┘
```

Bấm **[Sửa]** → form mở ra **chiếm trọn chiều rộng** ngay tại vị trí đó, đẩy phần dưới xuống.
Bấm Lưu hoặc Huỷ thì thu lại.

### Quy tắc

| # | Quy tắc |
|---|---|
| 1 | **Chỉ một form được mở tại một thời điểm.** Mở chỗ khác thì chỗ đang mở tự thu lại |
| 2 | Form sửa **luôn full chiều rộng**, không nhét vào cột — form có ~10 ô, nửa màn hình là chật |
| 3 | Danh sách gấp: **2 cột trên máy tính, 1 cột trên điện thoại** |
| 4 | Mỗi dòng gọn: tên (đậm) · loại · khu vực · nút Sửa |
| 5 | Tab lọc kèm **số đếm từng loại** |
| 6 | Lọc và tìm kiếm **cộng dồn** — chọn tab "Ăn" rồi gõ "phở" thì ra quán phở trong nhóm Ăn |
| 7 | Không khớp gì → một dòng gọn "Không tìm thấy chỗ nào" + nút xoá bộ lọc |

---

## 4. Ô tìm kiếm

Tìm trên **tên + địa chỉ + phường + khu vực**, cộng dồn.

**Không cần gõ dấu.** Dùng lại `stripDiacritics` đã có sẵn trong
`lib/ingestion/normalize.js` — gõ "pho vinh" ra "Phở Vinh".

⚠️ **Không dùng `findSimilarPlaces` trong `lib/placeSearch.js`.** Hàm đó là dò gần đúng có
xếp hạng, viết cho công cụ gộp trùng lặp (khách gõ tên tự do). Ở đây admin **đã biết mình
tìm gì**, nên cần khớp chuỗi con đơn giản và đoán trước được. Dò gần đúng sẽ gây khó hiểu —
gõ đúng tên mà chỗ mình cần lại xếp thứ ba.

Lọc **ngay trong trình duyệt**, không gọi lại máy chủ mỗi lần gõ. 109 chỗ đã tải sẵn rồi.

---

## 5. ⚠️ Chỗ kỹ thuật dễ hỏng

`app/admin/page.js` là **Server Component** — nó dùng `cookies()` để kiểm tra đăng nhập và
`await` để đọc Redis. **Tuyệt đối không thêm `"use client"` lên đầu file này**, sẽ hỏng toàn
bộ phần xác thực.

**Cách làm đúng:** tách riêng phần danh sách thành Client Component mới
`app/admin/LivePlacesManager.js`, nhận `live` qua props từ Server Component. Giống hệt cách
`app/page.js` (server) truyền dữ liệu cho `app/PlaceExplorer.js` (client) ở trang chủ.

**Server Action vẫn dùng được trong Client Component** — `updateLive`/`deleteLive` truyền
xuống qua props hoặc import thẳng đều chạy. Nhưng phải kiểm tra thật: bấm Lưu, bấm Xoá, và
xác nhận `revalidatePath` vẫn làm mới danh sách.

---

## 6. Không đụng vào

- Bảy mục còn lại của `/admin` (hàng chờ AI, góp ý khách, chờ duyệt thủ công, dán báo cáo
  routine, thống kê sổ, thêm chỗ mới, ghi chú chờ duyệt) — **giữ nguyên**
- Nội dung và hành vi của `PlaceForm` — chỉ đổi **lúc nào nó hiện**, không đổi bên trong
- `updateLive` / `deleteLive` / mọi Server Action
- Công cụ gộp trùng lặp `MergeDuplicatePanel.js`
- Mọi thứ phía khách xem web

---

## 7. Xong thì bấm thử được gì

1. Vào `/admin`, mục "Đang công khai" hiện **danh sách gọn 2 cột**, không còn form mở sẵn
2. Gõ "pho vinh" (không dấu) → ra "Phở Vinh Tuyên Quang"
3. Gõ tên phường → ra các chỗ ở phường đó
4. Bấm tab "Ăn" → chỉ còn nhóm Ăn, số đếm trên tab khớp với số dòng hiện ra
5. Chọn tab "Ăn" rồi gõ "phở" → lọc cộng dồn, đúng quán phở trong nhóm Ăn
6. Gõ chuỗi vô nghĩa → hiện "Không tìm thấy chỗ nào" + nút xoá bộ lọc
7. Bấm [Sửa] → form mở **full chiều rộng**, không bị bó trong cột
8. Bấm [Sửa] ở chỗ khác → form cũ tự thu lại, chỉ một form mở
9. Sửa tên một chỗ rồi bấm Lưu → **lên web thật**, danh sách làm mới đúng
10. Bấm Xoá một chỗ → xoá đúng chỗ đó
11. Thu nhỏ cửa sổ xuống cỡ điện thoại → còn 1 cột, vẫn bấm được
12. Đăng xuất rồi vào lại `/admin` → **vẫn hỏi mật khẩu** (không hỏng phần xác thực)

Bước 12 quan trọng nhất — đây là chỗ dễ hỏng nhất khi tách Client Component.

---

## 8. Ngoài phạm vi bước 1

**Bước 2 (làm sau, nếu dùng vài hôm vẫn thấy rối):** gom 8 mục của `/admin` thành 3 nhóm có
tab ở cấp trang:

- **Cần xử lý** — hàng chờ AI · góp ý khách · ghi chú chờ duyệt · chờ duyệt thủ công
- **Dữ liệu** — đang công khai · thêm chỗ mới
- **Công cụ** — dán báo cáo routine · thống kê sổ

Đúng hơn về lâu dài nhưng động vào nhiều hơn. Làm bước 1 trước, dùng thật vài hôm rồi quyết.

**Cũng ngoài phạm vi:**

- Sắp xếp danh sách (theo tên, ngày cập nhật, độ tin cậy)
- Chọn nhiều chỗ để xoá/sửa hàng loạt
- Phân trang (109 chỗ chưa cần; cân nhắc lại khi vượt ~500)
- Sửa nhanh ngay trên dòng, không cần mở form
- Xuất danh sách ra file
