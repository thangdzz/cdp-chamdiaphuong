# NOTE 03 — Sổ, Lộ trình, nội dung và mô hình địa điểm

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi file này: **Sổ**, **Lộ trình**, ba tầng nội dung, share Sổ, map, `primaryCategory + tags`, field động.  
> Không lặp lại phần Homepage/phone/ảnh tổng quát của `10-NOTE-01-Product-UX.md` và không lặp phần share một địa điểm của `11-NOTE-02-Share-Place.md`.

---

## 1. Ba tầng nội dung

### A. Dữ liệu chọn sẵn

Ví dụ:

- hôm nay vẫn mở;
- gửi xe;
- lối vào;
- giờ đông;
- tiện ích;
- xác nhận số điện thoại;
- phương thức thanh toán.

Cách nhập:
- chỉ bấm lựa chọn admin thiết kế sẵn;
- hoặc bấm xác nhận.

Kiểm soát:
- không qua admin;
- public theo đồng thuận;
- có `Không rõ`;
- phiếu cũ giảm trọng số;
- dữ liệu yếu phải hiện là chưa chắc.

Nguyên tắc:

> Chọn là mặc định. Gõ là ngoại lệ.

### B. Mẹo địa phương

User được gõ chữ ngắn, nhưng:

> **bắt buộc admin duyệt trước khi public.**

Mẹo phải giúp người sau làm một việc cụ thể.

Ví dụ hợp lệ:

- `Tối lễ hội nên gửi xe phía sau chợ.`
- `Lối vào nằm cạnh cửa hàng X, biển khá nhỏ.`

Không duyệt:

- review;
- khen/chê;
- đánh giá dịch vụ;
- quảng cáo;
- link/số điện thoại;
- cảm nhận chủ quan.

#### Tối ưu

Trước khi gõ, cho chọn context:

- Gửi xe
- Lối vào
- Thời điểm
- Di chuyển
- Thanh toán
- Tiện ích
- Khác

Sau duyệt, hiển thị như field:

> **Gửi xe**  
> Tối lễ hội nên gửi xe phía sau chợ.

Không hiển thị như comment.

### C. Ghi chú trong Sổ

Tên UI:

> **Ghi chú trong sổ**

Bản chất:
- thuộc một item trong một Sổ cụ thể;
- không public lên card địa điểm;
- không dùng để tính đồng thuận;
- không cần admin duyệt.

Ví dụ:

- `Tối thứ Bảy thử chỗ này trước.`
- `Nếu đông thì sang điểm số 3.`

Khi Sổ chưa share:
- chỉ chủ Sổ thấy.

Khi chủ Sổ share link:
- người có link có thể thấy note trong đúng Sổ đó;
- note không chảy ngược về địa điểm.

---

## 2. Sổ là entity chính

Không tạo hai hệ thống tách biệt `Sổ` và `Lộ trình`.

Dùng một model:

```text
notebook.mode = "list" | "route"
```

### `list`
Tập hợp địa điểm, không bắt buộc thứ tự.

### `route`
Sổ có thứ tự di chuyển.

---

## 3. Sổ thường

Ví dụ:

- 5 quán ăn sáng ở Tuyên Quang
- Cafe ngồi lâu
- Chỗ ngủ khu trung tâm
- Đi cùng trẻ nhỏ

### Header

- cover hoặc collage;
- tên Sổ;
- số địa điểm;
- nhóm chính.

Ví dụ:

> **5 quán ăn sáng ở Tuyên Quang**  
> 5 địa điểm · Ăn

### Map

- hiển thị toàn bộ pin;
- không đánh số nếu `mode=list`.

### Danh sách

Card compact:

- thumbnail;
- tên;
- loại;
- khu vực;
- giá nếu có;
- trạng thái dữ liệu đáng chú ý;
- ghi chú trong Sổ nếu có.

Không render full card Homepage ngay.

---

## 4. Sổ có lộ trình

Ví dụ:

> **Một chiều quanh trung tâm Thành Tuyên**  
> 5 điểm · khoảng 4 giờ · khoảng 7 km

### Map

- pin đánh số `1 → 2 → 3`;
- nếu có dữ liệu route thì nối tuyến;
- mobile không để map che list.

### Danh sách

```text
① Thành cổ Tuyên Quang
Di tích · 30–60 phút

↓ 650 m · 9 phút đi bộ

② Quảng trường Nguyễn Tất Thành
Tham quan · 30 phút
```

Nếu chưa có dữ liệu khoảng cách/thời gian:
- chỉ đánh số;
- không tự bịa.

---

## 5. Share một Sổ

Preview phải cho người nhận hiểu đây là một tập hợp có chủ đích.

### Sổ thường

> **5 quán cafe ngồi lâu ở Tuyên Quang**  
> 5 địa điểm · Cafe  
> Chạm Địa Phương

Ảnh:
- cover riêng;
- nếu không có, collage 3 ảnh đầu;
- fallback mặc định sau cùng.

### Sổ có lộ trình

> **Một ngày ở Tuyên Quang**  
> 7 điểm · Ăn + Chơi  
> Chạm Địa Phương

Nếu có dữ liệu thật:

> 7 điểm · khoảng 6 giờ · khoảng 12 km

Không nhồi text vào OG preview.

---

## 6. Trang xem Sổ

Thứ tự đề xuất:

1. SiteHeader
2. cover/collage
3. tên Sổ
4. metadata
5. CTA `Chia sẻ` + `Lưu thành sổ của tôi`
6. map
7. danh sách card compact
8. ghi chú trong Sổ

Card Sổ không copy nguyên full card Homepage.

---

## 7. Trang sửa Sổ

Code hiện đã có:

- đổi tên;
- reorder;
- note;
- bỏ địa điểm;
- copy link.

### P0

- đổi label `Ghi chú riêng cho chỗ này` → `Ghi chú trong sổ`;
- thêm chú thích:
  > Chỉ gắn với sổ này, không hiện trên trang địa điểm.

### P1

- thêm `mode: list | route`;
- cover Sổ;
- preview trước khi share;
- drag & drop nếu mobile UX tốt.

---

## 8. Copy Sổ

Giữ hành vi hiện tại:

- người nhận bấm `Lưu thành sổ của tôi`;
- tạo bản copy độc lập;
- giữ `copiedFrom`;
- chủ mới sửa title/order/note;
- sổ gốc không đổi.

Nếu note được copy cùng item thì giữ hành vi hiện tại.

---

## 9. Địa điểm đa tính chất

Không ép một địa điểm chỉ có một nghĩa.

Dùng:

```text
primaryCategory
tags[]
```

Ví dụ:

```text
primaryCategory: "choi"

tags:
- "di-tich"
- "lich-su"
- "kien-truc"
```

### `primaryCategory`

Dùng cho:

- tab chính;
- filter cấp 1;
- điều hướng;
- bộ field chính.

Giữ 4 nhóm:

- Ăn
- Chơi
- Ngủ
- Đi lại

### `tags`

Dùng mô tả chi tiết:

- Di tích
- Bảo tàng
- Văn hoá
- Lịch sử
- Kiến trúc
- Công viên
- Thiên nhiên
- Check-in
- Trẻ em
- Thể thao

Không dùng tag kiểu review:
- Rất đẹp
- Đáng đi
- Hot
- Tuyệt vời

---

## 10. Field chung và field động

### Field chung

- tên;
- ảnh;
- địa chỉ;
- vị trí;
- giờ hoạt động;
- trạng thái còn hoạt động;
- phone tham khảo;
- trạng thái xác nhận phone;
- mẹo địa phương;
- độ mới dữ liệu;
- chỉ đường;
- thêm vào Sổ.

### Field theo `primaryCategory`

Ví dụ `Chơi`:

- loại trải nghiệm;
- phí vào cửa;
- thời lượng tham quan;
- giờ phù hợp;
- trong nhà / ngoài trời;
- gửi xe;
- phù hợp trẻ nhỏ;
- khả năng tiếp cận nếu có dữ liệu.

### Field theo tag

Ví dụ `di-tich`:

- loại di tích;
- thời kỳ / niên đại;
- xếp hạng di tích nếu có;
- thời lượng tham quan;
- phí tham quan;
- quy định;
- thuyết minh/hướng dẫn;
- nguồn chính thức.

Không hiển thị field rỗng.

---

## 11. Card địa điểm dạng Di tích

Ví dụ:

> **Thành cổ Tuyên Quang**  
> `Chơi` `Di tích lịch sử` `Kiến trúc`

Hiển thị nhanh:

- khu vực;
- phí;
- thời lượng;
- trạng thái mở;
- ảnh mới nhất.

Khi bung:

### Thông tin
- Loại
- Niên đại
- Xếp hạng
- Giờ mở cửa
- Phí
- Nguồn

### Thông tin thực tế
- Gửi xe
- Lối vào
- Thời điểm đông
- Tiện ích
- Dữ liệu đồng thuận

### Mẹo địa phương
Chỉ nội dung đã admin duyệt.

Không review chủ quan.

---

## 12. Trust UI

Ưu tiên câu cụ thể:

- `Vừa được xác nhận còn mở hôm nay`
- `3 người xác nhận số điện thoại này`
- `Menu chụp 2 tuần trước`
- `1 người cho biết có bãi gửi xe`
- `Chưa đủ dữ liệu`
- `Có báo cáo thông tin chưa đúng`

Không dùng phần trăm nếu user không hiểu phần trăm đó đến từ đâu.

---

## 13. Ảnh trong Sổ

### Sổ thường
- cover/collage đầu trang;
- thumbnail từng card.

### Lộ trình
- cover;
- map;
- thumbnail từng stop.

Không biến Sổ thành feed ảnh.

---

## 14. Không làm

Không thêm:

- review;
- rating;
- comment;
- reply;
- social profile;
- follower;
- public activity feed;
- AI tự viết review;
- route engine phức tạp;
- booking;
- thanh toán.

---

## 15. Thứ tự triển khai

### P0
1. Chuẩn hoá `Mẹo địa phương` và `Ghi chú trong sổ`.
2. Không để note trong Sổ bị hiểu là dữ liệu public địa điểm.
3. Tối ưu Mẹo địa phương: context → gõ → admin duyệt → hiển thị như field.
4. Cải thiện trang xem Sổ: cover, metadata, card gọn, CTA share/copy.
5. Share preview riêng cho Sổ.

### P1
6. Thêm `mode: list | route`.
7. Route mode đánh số stop.
8. Map cho Sổ.
9. Thêm `primaryCategory + tags`.
10. Dynamic fields cho `Chơi`, bắt đầu với `Di tích`.

### P2
11. Khoảng cách/thời gian giữa stop.
12. Drag & drop reorder.
13. Cover editor.
14. Field nâng cao theo subtype.

---

## 16. Quy tắc cho Claude Code

Trước khi sửa, đọc:

- `CLAUDE.md`
- `10-NOTE-01-Product-UX.md`
- `11-NOTE-02-Share-Place.md`
- `NOTEBOOK-DESIGN.md`
- `PRD.md`
- `DECISIONS.md`
- `ARCHITECTURE.md`
- `SPEC-chang-4.md`
- `SPEC-giao-dien.md`
- file này

Nguyên tắc:

- nâng cấp incremental;
- không rewrite hệ Sổ;
- migration tương thích Sổ cũ;
- không auto-public chữ tự do;
- không biến note thành review;
- không bịa route/khoảng cách;
- cập nhật docs liên quan sau thay đổi lớn.

---

## 17. Tiêu chí hoàn thành

- phân biệt rõ `Mẹo địa phương` và `Ghi chú trong sổ`;
- chữ tự do public luôn qua admin;
- bấm chọn public theo đồng thuận;
- Sổ thường và Lộ trình dùng cùng model;
- share Sổ có preview đúng;
- card trong Sổ compact;
- địa điểm hỗ trợ `primaryCategory + tags`;
- `Di tích` có field phù hợp;
- không phát sinh review/comment/social layer.
