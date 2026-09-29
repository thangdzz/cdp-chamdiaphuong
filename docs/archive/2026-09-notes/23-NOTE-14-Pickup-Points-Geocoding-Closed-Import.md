# NOTE 14 — Pickup Points, tọa độ và chặn import địa điểm đã đóng

> Phạm vi: tách dịch vụ vận chuyển khỏi điểm địa lý dùng để dẫn đường, bổ sung điểm đón/trả cho nhóm Dịch vụ đón khách, lưu tọa độ phù hợp cho route/map, và chặn import từ Google khi nguồn báo đóng vĩnh viễn.
>
> Đọc trước:
> - `22-NOTE-13-Closed-Place-Crawl-Guard-Shared-Route-Copy.md`
> - `HANDOFF.md`
> - `TASKS.md`
> - `DECISIONS.md`
>
> Chỉ mở spec cũ khác khi có dependency thật.

## 1. Mục tiêu

Giải quyết ba vấn đề:
1. Google Maps có thể báo `Bị đóng vĩnh viễn` nhưng flow import vẫn có thể thêm vào CDP.
2. Nhiều place chưa có `lat/lng`, làm route/map/duplicate detection kém chính xác.
3. Dịch vụ như `Xe ghép Anh Huy` đang bị dùng như một địa điểm vật lý trong Google Maps route, trong khi điểm cần dẫn thực tế phải là điểm đón khách.

## 2. Nguyên tắc

> **Service không phải geographic stop.**

Ví dụ:

```text
Service: Xe ghép Anh Huy
Tuyến: Hà Nội ↔ Tuyên Quang
Pickup point: 31 Hàng Bún, Hà Nội
```

Khi mở route trên Google Maps phải dùng `31 Hàng Bún, Hà Nội`, không dùng địa chỉ chung của service.

# A. Google import / closed status

## 3. Chặn import nếu nguồn báo đóng vĩnh viễn

Nếu nguồn import trả trạng thái tương đương:

```text
CLOSED_PERMANENTLY
```

hoặc text rõ `Bị đóng vĩnh viễn`, không được add/public bình thường.

Flow:

```text
Google/import
→ đọc trạng thái nguồn
→ đối chiếu history CDP
→ nếu closed
→ block normal add/public
```

UI:

> Google Maps đang đánh dấu địa điểm này đã đóng vĩnh viễn.

Actions:
- `Không thêm`
- `Đề xuất địa điểm mới tại đây`
- `Gửi xác minh mở lại`

## 4. Không bypass NOTE-13

Nếu CDP đã biết place này `closed`, dù nguồn mới không báo closed:

```text
match closed place
→ không auto-public
→ verify queue
```

Admin phân biệt:
- mở lại business cũ;
- business mới thay thế.

Không mutate record cũ thành business mới.

# B. Tọa độ

## 5. `lat/lng` dùng để làm gì?

Tọa độ không phải nguyên nhân trực tiếp của lỗi closed-place, nhưng cần cho:
- mở đúng pin;
- route nhiều stop;
- khoảng cách;
- map route;
- duplicate detection;
- replacement detection cùng vị trí;
- nearby;
- geocoding/ngược geocoding.

## 6. Không bắt admin nhập tọa độ tay

Ưu tiên lấy tọa độ khi:
- import từ Google;
- user/admin chọn kết quả địa chỉ;
- chọn pin;
- geocode từ address;
- source trả coordinates.

Schema gợi ý:

```js
location: {
  addressLine,
  wardOrDistrict,
  province,
  lat,
  lng,
  source
}
```

Không bắt buộc migrate toàn bộ dữ liệu cũ ngay.

## 7. Backfill

P0:
- place/import mới có tọa độ nếu nguồn có;
- place được edit sau này cập nhật dần;
- route-critical places ưu tiên.

P1:
- backfill batch cho place cũ.

# C. Dịch vụ đón khách

## 8. Áp dụng cho `pickup-service`

Ít nhất:
- Xe ghép
- Taxi
- Limousine
- Shuttle
- Xe sân bay
- Thuê xe có lái

Field nền:

```text
serviceArea
pickupMode
pickupPoints[]
dropoffMode
dropoffPoints[]
```

## 9. `pickupMode`

Ví dụ:

```text
fixed_points
door_to_door
both
contact_first
```

Hiển thị:
- Điểm đón cố định
- Đón tận nơi
- Cả hai
- Liên hệ trước

## 10. `pickupPoints[]`

Một dịch vụ có thể có nhiều điểm đón.

```js
{
  id,
  name,
  addressLine,
  wardOrDistrict,
  province,
  lat,
  lng,
  note,
  order,
  active
}
```

Ví dụ:

```text
31 Hàng Bún
Ba Đình
Hà Nội
```

Không chỉ lưu `31 Hàng Bún`, vì Google có thể suy luận sai tỉnh theo context của service.

## 11. Admin form

Trong edit `pickup-service` thêm block:

> **Điểm đón khách**

Cho phép:
- thêm nhiều điểm;
- tên điểm;
- địa chỉ;
- tỉnh/thành;
- quận/huyện nếu có;
- reorder;
- xóa;
- active/inactive;
- lấy tọa độ tự động nếu có thể.

Có thể tái sử dụng cho `Điểm trả khách`.

# D. Route UX

## 12. Không dùng địa chỉ service làm route stop

Service có thể có office/registered address, nhưng route không được tự dùng các địa chỉ đó làm stop.

Route stop phải resolve từ:
1. pickup point user chọn;
2. custom pickup address user nhập;
3. fallback rõ ràng có xác nhận.

## 13. Khi thêm xe ghép vào route

Nếu service có nhiều điểm đón, hỏi:

> **Bạn sẽ đón xe ở đâu?**

Ví dụ:
- `31 Hàng Bún, Hà Nội`
- `Bến xe Mỹ Đình, Hà Nội`
- `Đón tận nơi`
- `Điểm khác`

## 14. Nếu chọn điểm cố định

Lưu snapshot:

```js
pickupSelection: {
  type: "pickup_point",
  pickupPointId,
  name,
  addressLine,
  province,
  lat,
  lng
}
```

Snapshot giúp route không gãy nếu service đổi config sau này.

## 15. Nếu chọn `Đón tận nơi`

Cho user nhập:
- Tên điểm
- Địa chỉ
- Tỉnh/thành

Ví dụ:

```text
Nhà tôi
15 phố X
Hà Nội
```

Đây là custom location của route, không public thành place CDP.

## 16. Google Maps route resolver

### `cdp_place`
Ưu tiên:
```text
lat,lng
```
fallback:
```text
full address
```

### `pickup-service`
Ưu tiên:
```text
selected pickup point lat,lng
```
fallback:
```text
selected pickup point full address
```

Không dùng service name/address nếu route item đã có pickup selection.

### `custom_stop`
Dùng lat/lng nếu có, nếu không dùng full address.

## 17. Route validation

Nếu route có `pickup-service` chưa chọn điểm đón:

> **Chọn điểm đón cho Xe ghép Anh Huy trước khi mở Google Maps.**

CTA:
> `Chọn điểm đón`

# E. Backward compatibility

## 18. Route item

Không rewrite route schema.

Bổ sung optional:

```js
pickupSelection
dropoffSelection
```

Route cũ vẫn đọc bình thường.

Service cũ chưa có pickupPoints:
- không tự dùng service address;
- hiện `Chưa có điểm đón`;
- owner route được nhập custom pickup;
- admin bổ sung pickup point sau.

## 19. Provider metadata

Nếu Google/source có:
- place status;
- lat/lng;
- normalized address;

thì lưu metadata phục vụ closed guard / duplicate match / geocoding.

Vendor-specific field nếu cần để trong:

```js
providerMeta.google
```

# F. P0 / P1

## 20. P0

1. Audit Google/import flow.
2. Source báo permanently closed → block normal add/public.
3. Closed-history guard từ NOTE-13 không bị bypass.
4. Lưu lat/lng cho place/import mới nếu source có.
5. Thêm `pickupMode`.
6. Thêm `pickupPoints[]`.
7. Admin edit được pickup points.
8. Route item có `pickupSelection`.
9. Khi thêm pickup-service vào route, bắt chọn điểm đón thực tế.
10. Google Maps route dùng pickup point thay vì service address.
11. Validate trước khi mở route nếu chưa có pickup selection.

## 21. P1

12. `dropoffPoints[]`.
13. Backfill lat/lng dần cho place cũ.
14. Map/pin selector.
15. Geocode address khi admin nhập.
16. Dùng lat/lng mạnh hơn cho duplicate/replacement detection.
17. Nhiều pickup point theo chiều tuyến nếu cần.

## 22. Không làm

Không:
- bắt admin nhập lat/lng bằng tay;
- auto-public permanently closed place;
- dùng service address làm pickup stop mặc định;
- biến custom pickup thành public place;
- rewrite Route thành entity khác;
- build map engine mới.

## 23. Tiêu chí hoàn thành

- Place Google báo permanently closed không được add/public bình thường.
- Closed lifecycle guard vẫn được tôn trọng.
- Place/import mới có lat/lng khi nguồn có.
- Pickup-service có thể có nhiều pickup points.
- Pickup point có địa chỉ + tỉnh/thành rõ.
- Route của xe ghép dùng đúng điểm đón.
- Google Maps không còn dẫn tới địa chỉ service sai ngữ cảnh.
- Route cũ vẫn hoạt động.

## 24. Bàn giao Codex ↔ Claude

Sau mỗi chặng đáng kể cập nhật:
- `/docs/HANDOFF.md`
- `/docs/TASKS.md`
- `/docs/DECISIONS.md`

Chỉ cập nhật `/AGENTS.md` hoặc `/CLAUDE.md` khi có rule/convention chung mới.

`HANDOFF.md` ghi:
- đã làm gì;
- file nào sửa;
- phần đang dở;
- cách test nhanh;
- bug/risk;
- bước tiếp theo.
