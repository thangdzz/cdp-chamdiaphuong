# NOTE 05 — Dynamic UX cho Đi lại: câu hỏi và CTA theo subtype

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: sửa UX cho nhóm `Đi lại`, đặc biệt `Xe ghép` / `Xe khách`, để câu hỏi và CTA đúng ngữ cảnh dịch vụ.  
> Đọc cùng:
> - `10-NOTE-01-Product-UX.md`
> - `11-NOTE-02-Share-Place.md`
> - `12-NOTE-03-Notebook-Route-Content.md`
> - `13-NOTE-04-Transport-Multiselect-Route.md`

## 1. Vấn đề

CDP đã có nhóm `Đi lại` và subtype như `Xe ghép`, nhưng giao diện vẫn dùng bộ câu hỏi và CTA của địa điểm vật lý/quán ăn.

Ví dụ không phù hợp:
- `Gửi xe`
- `Lối vào`
- `Chỉ đường`

Với `Xe ghép` / `Xe khách`, user quan tâm hơn tới:
- đón ở đâu;
- trả ở đâu;
- giờ chạy;
- loại xe;
- cách đặt xe;
- hành lý;
- thanh toán;
- tiện ích xe;
- cách liên hệ.

## 2. Nguyên tắc

> `primaryCategory` quyết định bộ field lớn.  
> `transportSubtype` quyết định câu hỏi và CTA cụ thể.

Không dùng một question set chung cho toàn bộ `Đi lại`.

Khuyến nghị kiến trúc:

```text
questionSetBySubtype
primaryActionBySubtype
fieldSetBySubtype
```

## 3. Mapping subtype ban đầu

Giữ `primaryCategory = "dilai"`.

Dùng:

```text
transportSubtype
```

Gợi ý:
- `xe-ghep`
- `xe-khach`
- `taxi`
- `xe-buyt`
- `thue-xe`
- `diem-don-tra`
- `bai-xe`

Bản đầu ưu tiên:
- `xe-ghep`
- `xe-khach`

## 4. Question set cho `xe-ghep`

### Điểm đón

> **Đón khách thế nào?**

- Đón tận nơi
- Điểm cố định
- Cả hai
- Không rõ

Nếu chọn `Điểm cố định` hoặc `Cả hai`:
- mới mở ô gõ ngắn: `Điểm đón ở đâu?`

### Điểm trả

> **Trả khách thế nào?**

- Trả tận nơi
- Điểm cố định
- Cả hai
- Không rõ

Nếu cần:
- mới mở ô gõ vị trí.

### Giờ chạy

> **Xe thường chạy khi nào?**

- Theo chuyến cố định
- Có xe cả ngày
- Chủ yếu buổi sáng
- Chủ yếu buổi chiều
- Chủ yếu buổi tối
- Cần hỏi trước
- Không rõ

### Đặt xe

> **Cần đặt xe trước không?**

- Nên đặt trước
- Có thể gọi sát giờ
- Tuỳ chuyến
- Không rõ

### Loại xe

> **Thường dùng loại xe nào?**

- 4 chỗ
- 7 chỗ
- 9–16 chỗ
- Nhiều loại xe
- Không rõ

### Hành lý

> **Hành lý thế nào?**

- Hành lý thông thường
- Nhận đồ cồng kềnh
- Cần hỏi trước
- Không rõ

### Thanh toán

- Tiền mặt
- Chuyển khoản
- Quét QR
- Thẻ
- Không rõ

### Tiện ích xe

Có thể dùng:
- Điều hoà
- Đón tận nơi
- Trả tận nơi
- Ghế trẻ em
- Chở thú cưng
- Không rõ

Chỉ đưa lựa chọn có ý nghĩa với subtype.

## 5. Question set cho `xe-khach`

Ưu tiên:
- Tuyến chính
- Bến/điểm đón
- Bến/điểm trả
- Khung giờ/chuyến
- Giá tham khảo
- Cần đặt vé trước không
- Hành lý
- Thanh toán
- Điều hoà
- Ghế ngồi/giường nằm nếu có
- Không rõ

Không dùng `Gửi xe` / `Lối vào`, trừ khi địa điểm đó thực sự là một bến/điểm đón vật lý.

## 6. CTA theo subtype

### `xe-ghep`

CTA chính:

> **Liên hệ đặt xe**

Không dùng `Chỉ đường`.

### `xe-khach`

CTA chính:

> **Xem thông tin đặt xe**

hoặc:

> **Liên hệ nhà xe**

### `taxi`

CTA chính:

> **Gọi xe**

nhưng chỉ khi số đủ tin cậy.

Nếu chưa đủ:
> **Xem thông tin liên hệ**

### `xe-buyt`

CTA chính:

> **Xem tuyến**

### `diem-don-tra`

CTA chính:

> **Chỉ đường**

### `bai-xe`

CTA chính:

> **Chỉ đường**

## 7. Số điện thoại trong CTA

Vì CDP coi số điện thoại là dữ liệu tham khảo:

Khi bấm `Liên hệ đặt xe`:

> **Số tham khảo:** 09xx xxx xxx  
> `3 người đã xác nhận`

Actions:
- `Gọi`
- `Tìm số trên Google`
- `Xác nhận số đúng`
- `Báo số sai`

Nếu chưa đủ tin cậy:
- không để `Gọi` là CTA chính quá nổi;
- ưu tiên `Xem thông tin liên hệ`.

## 8. Cấu trúc card `Xe ghép`

```text
Xe ghép Anh Huy
Xe ghép · 7 chỗ
Tuyên Quang ↔ Hà Nội

300k/người

🚐 Đón: Tận nơi
📍 Trả: Tận nơi
🕐 Chạy: Cần hỏi trước

[ Liên hệ đặt xe ] [ + Vào sổ ]
[ Chia sẻ ]        [ Bổ sung ]
```

Sau đó mới tới block đóng góp:

> **Bạn biết thêm về dịch vụ này?**

- Điểm đón
- Điểm trả
- Giờ chạy
- Loại xe
- Đặt xe
- Thanh toán
- Hành lý
- Tiện ích
- Khác

## 9. UX block đóng góp

Không dùng câu chung:

> `Bạn biết gì thêm về chỗ này?`

với dịch vụ đi xe.

Đổi thành:

> **Bạn biết thêm về dịch vụ này?**

hoặc với `xe-khach`:

> **Bạn biết thêm về tuyến/nhà xe này?**

## 10. Rule “bấm là mặc định, gõ là ngoại lệ”

### Có lựa chọn phù hợp
Bấm → ghi phiếu ngay.

### Cần làm rõ
Mới mở text input.

Ví dụ:
- `Điểm cố định` → hỏi vị trí.
- `Khác` → cho gõ.

Không bắt user gõ lại nội dung vừa bấm.

## 11. Dynamic label theo subtype

Có thể dùng:

```text
placeNounBySubtype
```

Ví dụ:
- `xe-ghep` → `dịch vụ`
- `xe-khach` → `nhà xe / tuyến`
- `bai-xe` → `địa điểm`
- `diem-don-tra` → `điểm`

Dùng để sinh copy tự nhiên:
- `Bạn biết thêm về dịch vụ này?`
- `Bạn biết thêm về tuyến này?`
- `Bạn biết thêm về địa điểm này?`

## 12. Không làm

Không thêm:
- review;
- rating;
- comment;
- chat với nhà xe;
- booking engine;
- thanh toán;
- tự động mua vé;
- route optimization phức tạp.

## 13. Thứ tự triển khai

### P0

1. Tạo `questionSetBySubtype`.
2. Tạo `primaryActionBySubtype`.
3. Sửa `xe-ghep`.
4. Sửa `xe-khach`.
5. Sửa copy block đóng góp.
6. Đảm bảo lựa chọn có sẵn là one-tap.

### P1

7. Mở rộng cho taxi.
8. Mở rộng cho xe buýt.
9. Mở rộng cho thuê xe.
10. Mở rộng cho điểm đón/trả.

## 14. Tiêu chí hoàn thành

- `Xe ghép` không còn câu hỏi `Gửi xe / Lối vào`.
- CTA chính không còn là `Chỉ đường`.
- Câu hỏi đúng ngữ cảnh dịch vụ.
- Có `Điểm đón / Điểm trả / Giờ chạy / Loại xe / Đặt xe / Hành lý`.
- Bấm lựa chọn có sẵn là ghi ngay.
- Chỉ gõ khi cần làm rõ hoặc chọn `Khác`.
- Số điện thoại vẫn theo cơ chế trust hiện có.
- Kiến trúc đủ sạch để thêm subtype mới sau này.
