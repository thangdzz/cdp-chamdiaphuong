# NOTE 07 — Route Place Picker, điểm đề xuất và Safari zoom

> Dùng cho CDP — Chạm Địa Phương.  
> Phạm vi: hoàn thiện UX tạo/sửa Lộ trình, bộ chọn nhiều địa điểm dùng chung, điểm user đề xuất và lỗi Safari tự zoom khi nhập liệu.  
> Đọc cùng `12-NOTE-03-Notebook-Route-Content.md`, `13-NOTE-04-Transport-Multiselect-Route.md`, `15-NOTE-06-Transport-Families-Pickup-Service.md`, `ARCHITECTURE.md`, `STATUS.md`, `TASKS.md`.

## 1. Trước khi code: đối chiếu việc đang làm dở

Claude phải kiểm tra code hiện tại trước khi triển khai NOTE 07. Không giả định NOTE 12/13/15 đã xong toàn bộ.

Báo nhanh trước khi sửa:
- multi-select hiện đã có gì;
- `Tạo lộ trình từ đây` đang chạy tới đâu;
- `Sửa lộ trình` đang có action nào;
- custom stop đang lưu theo schema nào;
- `mode=list|route` đã dùng tới đâu;
- có code/branch dở nào đụng cùng component hoặc data model không.

Nguyên tắc: không rewrite phần đang chạy ổn, không tạo component trùng nếu đã có phần tương đương.

## 2. Việc 1 — Safari tự zoom khi nhập liệu

Trên Safari/iPhone, focus vào input/search/note/rename route làm trang tự zoom và blur không luôn trả về tỉ lệ cũ.

Kiểm tra và sửa global:
- `input`
- `textarea`
- `select`
- search field
- input trong modal/bottom sheet
- rename route
- custom stop
- form đề xuất địa điểm

Trên mobile dùng `font-size >= 16px`.

Không dùng `maximum-scale=1` hoặc `user-scalable=no` để khóa zoom.

Test focus/blur nhiều input liên tiếp trên Safari iPhone/simulator.

## 3. PlacePicker dùng chung

Tạo hoặc tái sử dụng một component/logic chung:

> **PlacePicker**

Dùng ở:
1. `Tạo lộ trình từ đây`
2. `Chọn nhiều → Tạo lộ trình`
3. `Sửa lộ trình → Thêm địa điểm`
4. Sau này có thể tái sử dụng cho thêm nhiều điểm vào Sổ

Không tạo picker khác nhau cho từng màn.

## 4. `Tạo lộ trình từ đây`

Ví dụ đang xem `Xe ghép Anh Huy`.

Bấm:

> **Tạo lộ trình từ đây**

PlacePicker mở với:
- current place selected sẵn;
- search box;
- filter `Ăn / Chơi / Ngủ / Đi lại`;
- danh sách kết quả;
- multi-select;
- selected count.

Ví dụ:

```text
Tạo lộ trình

[ 🔎 Tìm địa điểm... ]

Đã chọn
✓ Xe ghép Anh Huy

□ Khách sạn A
□ Nhà hàng B
□ Cafe C
□ Quảng trường D

4 điểm đã chọn

[ Xem danh sách ] [ Tạo lộ trình ]
```

Không bắt user quay lại Homepage để thêm từng điểm.

## 5. `Sửa lộ trình`

Phải có:

> **+ Thêm địa điểm**

Bấm vào mở đúng PlacePicker.

Multi-select nhiều điểm rồi mới:

> **Thêm N điểm**

Không đóng picker sau mỗi lần chọn.

## 6. Search trong PlacePicker có 3 loại kết quả

### A. `cdp_place`

Địa điểm đã có trong CDP.

Ưu tiên cao nhất.

### B. `proposed_place`

Nếu không tìm thấy:

> **Không thấy chỗ bạn cần?**  
> `+ Đề xuất địa điểm mới`

User nhập tối thiểu:
- tên;
- loại;
- khu vực/địa chỉ;
- thông tin thêm nếu biết.

Sau khi gửi:
- thêm ngay vào đúng Lộ trình;
- đồng thời vào hàng chờ admin;
- chưa public vào danh bạ CDP.

### C. `custom_stop`

Giữ chức năng:

> **Thêm điểm tự đặt tên**

Ví dụ:
- Nhà Tuấn
- Điểm hẹn đầu ngõ
- Chỗ đón em

Không gửi admin duyệt, không trở thành place CDP.

## 7. Route item model

Lộ trình hỗ trợ:

```text
routeItem.type =
  "cdp_place"
  | "proposed_place"
  | "custom_stop"
```

- `cdp_place`: tham chiếu `placeId`
- `proposed_place`: tham chiếu `proposalId` hoặc snapshot cần thiết
- `custom_stop`: label/dữ liệu tối thiểu riêng của user

Không ép `custom_stop` vào `places:live`.

## 8. Nguyên tắc cốt lõi

> **Lộ trình thuộc về người tạo; danh bạ thuộc về CDP.**

User được dựng route bằng:
- địa điểm CDP;
- địa điểm họ đề xuất;
- điểm riêng.

CDP chỉ kiểm soát thứ gì được public vào danh bạ.

## 9. Hiển thị `proposed_place`

Trong route của người tạo và người nhận share:

> **Người tạo đề xuất · CDP chưa xác minh**

Không dùng cảnh báo đỏ nặng nề.

Có thể dùng:
- badge nhỏ;
- border nét đứt;
- icon riêng;
- nền trung tính.

Người nhận phải thấy rõ điểm này không phải place chính thức của CDP.

## 10. Khi admin duyệt

Nếu proposal được duyệt:

```text
proposed_place → cdp_place
```

Route đang tham chiếu proposal phải tự resolve sang place chính thức nếu kiến trúc cho phép.

Ưu tiên mapping:

```text
proposalId -> livePlaceId
```

Badge chưa xác minh biến mất.

User không phải sửa route thủ công.

## 11. Khi admin từ chối

Không xóa stop khỏi route.

Chuyển:

```text
proposed_place → custom_stop
```

Giữ tên/snapshot/ghi chú cần thiết.

Admin từ chối đưa vào danh bạ không đồng nghĩa stop đó vô nghĩa với route cá nhân.

## 12. Màn Sửa lộ trình

Ví dụ:

```text
Gửi em Tuấn

[ + Thêm địa điểm ]

≡ Xe ghép Anh Huy
≡ Nhà hàng A
≡ Quán B
  Người tạo đề xuất · CDP chưa xác minh
≡ Nhà Tuấn
  Điểm riêng

[ Lưu thay đổi ]
```

Cho:
- reorder;
- xóa;
- search thêm;
- thêm proposal;
- thêm custom stop.

## 13. Search UX

- debounce nhẹ;
- tìm theo tên trước;
- filter `Ăn / Chơi / Ngủ / Đi lại`;
- giữ selection khi đổi query/filter;
- selected count luôn rõ.

Nếu không có kết quả:
- `Đề xuất địa điểm mới`
- `Thêm điểm tự đặt tên`

Hai action này phải khác nghĩa.

## 14. Backward compatibility

Route/notebook cũ có thể chỉ có:

```text
placeId
nameSnapshot
note
```

Normalize mặc định:

```text
if (!item.type && item.placeId) type = "cdp_place"
```

Ưu tiên tránh migration toàn Redis nếu không cần.

## 15. Thứ tự triển khai

### P0
1. Audit flow route hiện tại.
2. Sửa Safari zoom global.
3. Tạo/tái sử dụng PlacePicker.
4. `Tạo lộ trình từ đây` mở PlacePicker với current place selected.
5. `Sửa lộ trình` dùng cùng PlacePicker.
6. Multi-select giữ selection qua search/filter.

### P1
7. `proposed_place`.
8. Form đề xuất địa điểm mới.
9. Queue admin.
10. Proposal hiện ngay trong route trước khi duyệt.
11. Share route vẫn hiện proposal + badge.
12. Admin duyệt → `cdp_place`.
13. Admin từ chối → `custom_stop`.

### P2
14. Map route.
15. Khoảng cách/thời gian.
16. Route optimization.

## 16. Không làm trong NOTE 07

Không thêm:
- chat;
- comment;
- review;
- booking;
- thanh toán;
- auto-public proposed place;
- public custom stop;
- route optimization ở P0/P1.

## 17. Tiêu chí hoàn thành

- Safari không giữ zoom sau nhập liệu.
- Tạo route từ một place có search + multi-select.
- Sửa route dùng cùng PlacePicker.
- Không có logic picker trùng.
- Hỗ trợ `cdp_place`, `proposed_place`, `custom_stop`.
- Proposal chưa duyệt vẫn hiện trong route/share route.
- Người nhận biết rõ trạng thái chưa xác minh.
- Duyệt proposal không bắt user sửa route thủ công.
- Từ chối proposal không làm route mất stop.
- Không phá route cũ.
