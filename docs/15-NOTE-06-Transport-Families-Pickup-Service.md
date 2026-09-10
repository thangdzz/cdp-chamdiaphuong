# NOTE 06 — Taxonomy nhóm Đi lại và ưu tiên Dịch vụ đón khách

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: chuẩn hóa nhóm cha của `Đi lại`, gom subtype theo hành vi người dùng, và ưu tiên triển khai `Dịch vụ đón khách` trước.  
> Đọc cùng:
> - `13-NOTE-04-Transport-Multiselect-Route.md`
> - `14-NOTE-05-Transport-Dynamic-UX.md`
> - `12-NOTE-03-Notebook-Route-Content.md`

## 1. Quyết định taxonomy cho `Đi lại`

Chia thành 4 nhóm cha:

```text
Đi lại
│
├── Dịch vụ đón khách
│   ├── Xe ghép
│   ├── Taxi
│   └── Thuê xe có lái
│
├── Theo tuyến
│   ├── Xe khách
│   └── Xe buýt
│
├── Điểm giao thông
│   ├── Bến xe
│   ├── Điểm đón/trả
│   └── Bãi xe
│
└── Tự lái
    ├── Thuê ô tô
    └── Thuê xe máy
```

Mục tiêu:
- field đúng ngữ cảnh;
- câu hỏi đúng ngữ cảnh;
- CTA đúng ngữ cảnh;
- code không phát triển thành nhiều nhánh `if/else` rời rạc.

## 2. Data model đề xuất

Giữ:

```text
primaryCategory = "dilai"
```

Thêm:

```text
transportFamily
transportSubtype
```

Ví dụ:

```text
transportFamily = "pickup-service"
transportSubtype = "xe-ghep"
```

`transportFamily` quyết định field/question/CTA nền.  
`transportSubtype` chỉ override phần khác biệt.

## 3. Ưu tiên hiện tại

Chỉ tập trung hoàn thiện:

> **Dịch vụ đón khách**

Gồm:
- Xe ghép
- Taxi
- Thuê xe có lái

Các family khác chỉ định nghĩa taxonomy trước, chưa hoàn thiện logic.

## 4. Field chung cho Dịch vụ đón khách

- Tên đơn vị/dịch vụ
- Khu vực phục vụ
- Tuyến chính nếu có
- Loại xe
- Giá tham khảo
- Cách đặt
- Thời gian hoạt động
- Có cần đặt trước không
- Điểm đón
- Điểm trả
- Hành lý
- Thanh toán
- Tiện ích xe
- Số điện thoại tham khảo
- Trạng thái xác nhận số
- Thời điểm cập nhật

Không hiện field rỗng.

## 5. Xe ghép

Field ưu tiên:
- Tuyến chính
- Loại xe
- Giá/người
- Ghép khách / bao xe
- Đón tận nơi / điểm cố định
- Trả tận nơi / điểm cố định
- Khung giờ
- Đặt trước
- Hành lý

CTA:

> **Liên hệ đặt xe**

Không dùng `Chỉ đường`.

## 6. Taxi

Không copy nguyên bộ field Xe ghép.

Field ưu tiên:
- Khu vực phục vụ
- Loại xe
- Cách gọi: tổng đài / điện thoại / app
- Thời gian hoạt động: 24/7 / theo giờ
- Giá: theo đồng hồ / giá tham khảo nếu có nguồn
- Thanh toán
- Tiện ích
- Số liên hệ + mức xác nhận

Không cần:
- tuyến cố định;
- điểm đón cố định;
- điểm trả cố định.

CTA:

Nếu số đủ tin cậy:

> **Gọi/Đặt taxi**

Nếu chưa đủ:

> **Xem thông tin gọi xe**

### Phạm vi dữ liệu taxi ban đầu

Chỉ nhập đơn vị:
- có thương hiệu/tổng đài rõ;
- có số công khai;
- xác minh được đang hoạt động;
- có khu vực phục vụ rõ.

Không nhập hàng loạt lái xe cá nhân ở giai đoạn này.

## 7. Thuê xe có lái

Field ưu tiên:
- Khu vực phục vụ
- Loại xe
- Giá theo chuyến/ngày/km nếu có
- Có tài xế
- Có nhận đi tỉnh không
- Đặt trước
- Thời gian hoạt động
- Thanh toán
- Liên hệ

CTA:

> **Liên hệ thuê xe**

Không dùng `Chỉ đường` làm CTA chính.

## 8. Loại xe là multi-value

Một đơn vị có thể đồng thời chạy:
- 4 chỗ
- 7 chỗ
- 15 chỗ

Không dùng logic một đáp án thắng.

Khuyến nghị:

```text
vehicleTypes = ["4-seat", "7-seat", "15-seat"]
```

Nếu admin có dữ liệu:
> Thường có xe 4–7 chỗ

hoặc:
> 4 chỗ · 7 chỗ · 15 chỗ

Xác nhận cộng đồng theo từng giá trị:

```text
4 chỗ → 3 xác nhận
7 chỗ → 5 xác nhận
15 chỗ → 2 xác nhận
```

Không để một loại xe “thắng” rồi ẩn loại khác.

Nếu admin đã điền:
- câu hỏi user có thể ẩn bằng `supersededByField`.

## 9. Question set theo family

Tạo:

```text
questionSetByTransportFamily
```

Cho `pickup-service`:
- Khu vực/tuyến
- Loại xe
- Đón khách
- Trả khách
- Giờ hoạt động
- Đặt trước
- Thanh toán
- Hành lý
- Tiện ích
- Khác

Subtype override:

### Xe ghép
- có tuyến chính;
- điểm đón;
- điểm trả.

### Taxi
- bỏ tuyến cố định;
- bỏ điểm trả cố định;
- thêm cách gọi;
- thêm 24/7 hay không.

### Thuê xe có lái
- thêm đi tỉnh;
- cách tính giá theo chuyến/ngày/km.

## 10. CTA theo family/subtype

Tạo:

```text
primaryActionByTransportFamily
primaryActionBySubtype
```

Mặc định `pickup-service`:

> **Xem thông tin liên hệ**

Override:
- `xe-ghep` → `Liên hệ đặt xe`
- `taxi` → `Gọi/Đặt taxi` hoặc `Xem thông tin gọi xe`
- `thue-xe-co-lai` → `Liên hệ thuê xe`

Không dùng `Chỉ đường` cho dịch vụ không có điểm vật lý mà khách phải tới.

## 11. Các family còn lại — chỉ định nghĩa trước

### `scheduled-route`
- Xe khách
- Xe buýt

Sau này:
- tuyến;
- chiều đi;
- điểm dừng;
- lịch chạy;
- giá/vé.

### `transport-place`
- Bến xe
- Điểm đón/trả
- Bãi xe

CTA:
> **Chỉ đường**

### `self-drive`
- Thuê ô tô
- Thuê xe máy

Sau này:
- loại xe;
- giá/ngày;
- cọc;
- giấy tờ;
- giao nhận xe;
- khu vực phục vụ.

## 12. Không làm ở chặng này

Chưa hoàn thiện:
- Xe buýt
- Bến xe
- Bãi xe
- Thuê ô tô tự lái
- Thuê xe máy
- route optimization
- booking
- thanh toán
- claim

## 13. Thứ tự triển khai

### P0

1. Thêm `transportFamily`.
2. Map subtype hiện có vào family.
3. Refactor question/CTA theo family trước, subtype override sau.
4. Hoàn thiện `Xe ghép`.
5. Hoàn thiện `Taxi`.
6. Hoàn thiện `Thuê xe có lái`.
7. Chuyển `vehicleTypes` sang multi-value nếu schema hiện tại chưa phù hợp.
8. Giữ backward compatibility dữ liệu cũ.

### P1 — để sau

9. `Theo tuyến`
10. `Điểm giao thông`
11. `Tự lái`

## 14. Nguyên tắc triển khai

- Không rewrite toàn bộ nhóm `Đi lại`.
- Tận dụng `transportSubtype` đã có.
- Family là lớp cấu hình, không phải thêm UI rườm rà.
- Không hỏi lại dữ liệu admin đã điền.
- Không dùng consensus một đáp án cho field đa giá trị.
- Không nhập tràn lan taxi/lái xe cá nhân chưa xác minh.

## 15. Tiêu chí hoàn thành P0

- `Đi lại` có 4 family rõ ràng trong model.
- Code câu hỏi/CTA dùng family + subtype.
- Xe ghép đúng ngữ cảnh.
- Taxi đúng ngữ cảnh.
- Thuê xe có lái có field/CTA phù hợp.
- Loại xe hỗ trợ nhiều giá trị đồng thời.
- Không phá dữ liệu cũ.
- Các family còn lại có taxonomy nhưng chưa bị ép triển khai sớm.
