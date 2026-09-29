# CDP — Chuẩn hóa địa điểm & Google Maps Routing

## Mục tiêu

Sửa tận gốc lỗi **địa chỉ / điểm dừng trên CDP mở sang Google Maps bị nhận sai địa điểm hoặc dẫn đường sai**.

Nguyên tắc mới:

> **CDP phải xác định chính xác điểm địa lý. Google Maps chỉ chịu trách nhiệm tính đường giữa các điểm đã được CDP xác định.**

Không tiếp tục phụ thuộc vào việc ghép chuỗi `tên + phường + tỉnh` rồi để Google tự đoán địa điểm trong luồng **Chỉ đường**.

---

# 1. Hiện trạng cần sửa

File hiện tại: `mapsUrl.js`

Các vấn đề đang có:

1. `mapsUrl(place)` đang tạo link tìm kiếm Google Maps bằng chuỗi text.
2. `stopMapsQuery(stop)` ưu tiên tọa độ nếu có, nhưng nếu không có lại fallback về tên / địa chỉ dạng text.
3. Với tên giống nhau, địa chỉ thiếu, địa giới hành chính thay đổi hoặc Google hiểu khác dữ liệu CDP, điểm có thể bị nhận sai.
4. Khi tạo lộ trình nhiều điểm, `routeMapsUrl()` đang truyền `mapsQuery` hỗn hợp:
   - tọa độ;
   - tên địa điểm;
   - địa chỉ;
   - tên + tỉnh.
5. `MAX_WAYPOINTS = 9` không phản ánh đầy đủ giới hạn khi link được mở trên mobile browser.

Kết luận:

**Text query chỉ được dùng để tìm kiếm/gợi ý địa điểm, không dùng làm định danh cuối cùng cho chức năng Chỉ đường.**

---

# 2. Data model mới cho địa điểm

Mỗi địa điểm CDP cần có dữ liệu vị trí chuẩn:

```ts
type PlaceLocation = {
  latitude: number | null;
  longitude: number | null;

  googlePlaceId: string | null;

  locationSource:
    | "google_place"
    | "user_pin"
    | "admin_pin"
    | "legacy_text"
    | null;

  locationVerified: boolean;

  locationVerifiedAt: string | null;
};
```

Nếu schema hiện tại có `coordinates`, có thể giữ cấu trúc cũ nhưng phải đảm bảo về logic có đủ:

```text
latitude
longitude
googlePlaceId
locationSource
locationVerified
```

Không dùng `address` như một định danh địa lý.

`address` chỉ phục vụ:

- hiển thị;
- search;
- mô tả;
- giúp user nhận diện kết quả Google.

---

# 3. Thứ tự ưu tiên định vị

Khi cần xác định một địa điểm cho Google Maps:

## Priority 1 — Google Place ID

Nếu có:

```text
googlePlaceId
```

thì đây là định danh ưu tiên cho các địa điểm tồn tại trên Google Maps.

## Priority 2 — Tọa độ đã xác nhận

Nếu không có Place ID nhưng có:

```text
latitude
longitude
locationVerified = true
```

thì dùng tọa độ.

Trường hợp này dành cho:

- điểm địa phương Google chưa có;
- điểm ngắm cảnh;
- bãi tắm;
- cây cổ thụ;
- nhà dân;
- điểm đón;
- điểm cộng đồng tự thêm;
- địa điểm không phải business chính thức trên Google.

## Priority 3 — Không đủ dữ liệu

Nếu không có cả:

```text
googlePlaceId
```

và:

```text
verified latitude/longitude
```

thì:

**KHÔNG được hiển thị nút “Chỉ đường” như thể điểm đã chính xác.**

Thay bằng:

```text
Xác nhận vị trí
```

hoặc:

```text
Tìm trên Google Maps
```

Text search chỉ là fallback để user tìm và xác nhận lại, không phải route chính thức.

---

# 4. Flow thêm địa điểm mới

## Case A — Google đã có địa điểm

User nhập:

```text
Tên địa điểm
Địa chỉ / khu vực
```

CDP gọi Google Places để đưa ra danh sách gợi ý.

Ví dụ:

```text
Nhà hàng A — P. Minh Xuân, Tuyên Quang
Nhà hàng A — Chiêm Hóa, Tuyên Quang
Nhà hàng A — Hà Giang
```

User chọn đúng địa điểm.

CDP lưu:

```text
googlePlaceId
latitude
longitude
formattedAddress
locationSource = "google_place"
locationVerified = true
locationVerifiedAt
```

Sau khi lưu:

**không geocode lại mỗi lần user xem hoặc mở route.**

---

# 5. Flow khi Google không có địa điểm

Nếu user không tìm thấy đúng địa điểm trên Google:

Hiện UI:

```text
Không tìm thấy địa điểm?
→ Ghim vị trí trên bản đồ
```

User đặt pin.

CDP lưu:

```text
googlePlaceId = null
latitude
longitude
locationSource = "user_pin"
locationVerified = true
locationVerifiedAt
```

Admin chỉnh lại thì:

```text
locationSource = "admin_pin"
```

Đây là dữ liệu địa lý của CDP.

Không ép mọi địa điểm phải có Google Place ID.

---

# 6. Phân biệt 2 hành động trong UI

Không gộp hai khái niệm:

## A. Chỉ đường

Chỉ hiện khi có:

```text
googlePlaceId
```

hoặc:

```text
locationVerified latitude/longitude
```

Đây là chức năng tin cậy.

## B. Tìm trên Google Maps

Cho phép dùng text query:

```text
Tên + khu vực + tỉnh
```

Chức năng này chỉ để:

- tìm địa điểm;
- xác minh;
- xử lý dữ liệu cũ;
- hỗ trợ admin/user sửa vị trí.

Không dùng kết quả text query làm route chính thức nếu chưa được xác nhận.

---

# 7. Refactor `mapsUrl.js`

Không để `cdpPlaceQuery()` là nguồn chính cho nút Chỉ đường.

Nên tạo helper rõ ràng hơn.

Ví dụ:

```js
export function placeRouteTarget(place) {
  if (!place) return null;

  if (place.googlePlaceId) {
    return {
      type: "place_id",
      placeId: place.googlePlaceId,
      lat: place.latitude ?? null,
      lng: place.longitude ?? null,
    };
  }

  const coords = coordinatesOf(place);

  if (coords && place.locationVerified) {
    return {
      type: "coordinates",
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  return null;
}
```

Text query tách riêng:

```js
export function placeSearchQuery(place) {
  // chỉ phục vụ "Tìm trên Google Maps"
}
```

Không dùng chung `placeSearchQuery()` cho nút Chỉ đường.

---

# 8. Tạo Google Maps URL cho một địa điểm

## Có Place ID

Khi Google Maps URL hỗ trợ Place ID, ưu tiên:

```text
destination_place_id
```

Có thể gửi thêm lat/lng hoặc query hiển thị nếu cần tương thích.

## Không có Place ID nhưng có tọa độ

Dùng:

```text
lat,lng
```

Ví dụ logic:

```js
destination = `${lat},${lng}`;
```

Không gửi địa chỉ text để Google tự geocode lại.

---

# 9. Data model mới cho route stop

Không để mỗi stop chỉ có:

```text
mapsQuery
```

Nên chuyển thành:

```ts
type RouteStopLocation = {
  label: string;

  googlePlaceId: string | null;

  latitude: number | null;
  longitude: number | null;

  locationVerified: boolean;

  searchQuery?: string | null;
};
```

Trong đó:

```text
searchQuery
```

chỉ phục vụ fallback/search UI.

Route thật chỉ dùng:

```text
googlePlaceId
```

hoặc:

```text
latitude + longitude
```

---

# 10. Build route Google Maps

Khi tạo route:

```text
origin
destination
waypoints
```

mỗi point phải được resolve theo thứ tự:

```text
Place ID
→ verified coordinates
→ invalid
```

Không dùng:

```text
Tên quán, phường, tỉnh
```

làm waypoint mặc định nữa.

Nếu một stop chưa xác minh vị trí:

```text
Không thể mở toàn bộ lộ trình
Điểm “XYZ” chưa có vị trí chính xác.
```

Cho user:

```text
Xác nhận vị trí
```

Không âm thầm bỏ stop.

---

# 11. Waypoint trên mobile

Code hiện tại:

```js
const MAX_WAYPOINTS = 9;
```

Cần xem lại.

Google Maps URLs hiện có khác biệt theo nền tảng:

- một số nền tảng hỗ trợ tối đa 9 waypoint;
- mobile browser có thể chỉ hỗ trợ tối đa 3 waypoint.

Không nên coi `9` là giới hạn dùng chung.

## Phương án CDP

Nếu route có ít điểm:

```text
origin + <= 3 middle points + destination
```

→ có thể mở trực tiếp trên mobile.

Nếu nhiều hơn:

### Phương án 1 — chia chặng

Ví dụ:

```text
Chặng 1: A → B → C → D → E
Chặng 2: E → F → G → H
```

UI:

```text
Mở chặng 1 trên Google Maps
Mở chặng 2 trên Google Maps
```

### Phương án 2 — dùng Google Routes API sau

Chỉ triển khai khi CDP muốn tự tính/vẽ route.

Hiện tại ưu tiên chia chặng để tránh phát sinh thêm complexity và API request.

---

# 12. Xử lý dữ liệu cũ

Không bắt migrate toàn database ngay một lần.

Thêm trạng thái:

```text
locationSource = "legacy_text"
locationVerified = false
```

Với địa điểm cũ chưa có lat/lng:

### Khi admin mở Edit

Hiện cảnh báo:

```text
Vị trí này chưa được xác nhận.
Hãy chọn địa điểm trên Google hoặc ghim đúng vị trí.
```

### Khi user mở địa điểm

Nếu chưa verify:

- vẫn xem nội dung bình thường;
- không coi text address là route chính xác;
- nút route có thể đổi thành:

```text
Xác nhận vị trí để chỉ đường
```

hoặc:

```text
Tìm trên Google Maps
```

---

# 13. Có thể migration bán tự động

Viết admin tool:

```text
Địa điểm chưa xác minh: 327
```

Mỗi item:

```text
Tên
Địa chỉ CDP

[Tra Google]
[Ghim bản đồ]
[Bỏ qua]
```

Google trả candidates.

Admin chọn đúng một lần.

Sau đó lưu:

```text
Place ID
lat/lng
verified
```

Không phải sửa thủ công từng chuỗi địa chỉ.

---

# 14. Google API — cách dùng để hạn chế chi phí

Mục tiêu:

> API chủ yếu chạy lúc CREATE / EDIT / VERIFY địa điểm.

Không gọi Places/Geocoding lại mỗi khi user:

- mở trang;
- xem địa điểm;
- mở route;
- reload;
- share link.

Sau khi location đã được lưu:

```text
CDP database
→ Place ID / lat,lng
→ Google Maps URL
```

Việc mở Maps URL không cần CDP gọi Geocoding/Routes API.

---

# 15. API được phép triển khai ngay

Có thể dùng Google Places API cho:

```text
autocomplete
text search
place selection
```

Mục tiêu là lấy:

```text
Place ID
coordinates
formatted address
```

sau khi user/admin chọn đúng candidate.

Chưa cần Google Routes API ở giai đoạn này.

Google Maps tiếp tục chịu trách nhiệm navigation.

---

# 16. Quản lý API key

Không dùng một key cho mọi dịch vụ.

Tách:

```text
GOOGLE_MAPS_BROWSER_KEY
GOOGLE_MAPS_SERVER_KEY
```

## Browser key

Restrict theo domain:

```text
https://chamdiaphuong.io.vn/*
https://www.chamdiaphuong.io.vn/*
```

Chỉ cho phép API thực sự dùng ở browser.

## Server key

Không gửi xuống frontend.

Chỉ server-side được gọi.

Giới hạn API theo đúng các service cần dùng.

---

# 17. Quota / chống bill bất ngờ

Trong Google Cloud:

- đặt quota theo API;
- bật billing alert;
- theo dõi request;
- không cho frontend tự spam Places request;
- debounce autocomplete;
- chỉ gọi khi đủ ký tự;
- cache/search-session hợp lý theo tài liệu Google.

Nếu chưa vượt free usage của SKU tương ứng thì chi phí API vẫn bằng 0.

Không dựa vào giả định này để bỏ quota.

---

# 18. Acceptance criteria

Hoàn thành khi đạt đủ:

### Địa điểm Google có sẵn

- [ ] User tìm được địa điểm qua Places.
- [ ] User chọn candidate.
- [ ] CDP lưu Place ID.
- [ ] CDP lưu lat/lng.
- [ ] Sau reload vẫn giữ đúng location.
- [ ] Bấm Chỉ đường mở đúng điểm.

### Địa điểm Google không có

- [ ] User có thể ghim vị trí.
- [ ] CDP lưu lat/lng.
- [ ] Không bắt buộc Place ID.
- [ ] Bấm Chỉ đường mở đúng pin.

### Dữ liệu cũ

- [ ] Place chưa verify được đánh dấu rõ.
- [ ] Không dùng text address như một vị trí “đã xác nhận”.
- [ ] Có flow admin xác minh nhanh.

### Route

- [ ] Origin dùng Place ID hoặc coords.
- [ ] Destination dùng Place ID hoặc coords.
- [ ] Waypoint dùng Place ID hoặc coords.
- [ ] Không silently drop điểm chưa xác minh.
- [ ] Route mobile nhiều stop được xử lý rõ.
- [ ] Không còn phụ thuộc vào `name + ward + province`.

---

# 19. Test cases bắt buộc

Test tối thiểu:

## Case 1

Hai địa điểm cùng tên nhưng khác huyện/tỉnh.

Kỳ vọng:

```text
Place ID / coordinates
```

phân biệt chính xác.

## Case 2

Địa chỉ:

```text
12 Trần Phú
```

Không được để Google tự đoán tỉnh.

## Case 3

Điểm không có trên Google.

User pin tay.

Mở route phải đúng pin.

## Case 4

Tên riêng:

```text
Nhà Tuấn
```

Có tọa độ → mở đúng tọa độ.

Không có tọa độ → không route bằng text.

## Case 5

Địa giới / tên phường thay đổi.

Route vẫn đúng vì tọa độ không đổi.

## Case 6

Route có một điểm legacy chưa verify.

Phải báo user/admin xác nhận điểm đó.

Không bỏ điểm trong im lặng.

## Case 7

Route nhiều waypoint trên mobile.

Không tạo link vượt quá giới hạn dự kiến rồi mặc định cho rằng Google sẽ xử lý đúng.

---

# 20. Không làm trong đợt này

Chưa cần:

- tự vẽ đường route trên CDP;
- traffic real-time;
- tự tối ưu thứ tự điểm;
- Google Routes Pro;
- route optimization;
- tự tính ETA trong CDP.

Giai đoạn này:

> **CDP quản lý điểm chính xác. Google Maps quản lý navigation.**

---

# 21. Yêu cầu khi sửa code

Claude cần:

1. Đọc toàn bộ flow hiện tại liên quan:
   - place create/edit;
   - route builder;
   - custom stop;
   - proposal;
   - pickup service;
   - `coordinates.js`;
   - `mapsUrl.js`;
   - schema/database tương ứng.

2. Không phá logic pickup service hiện có.

3. Giữ backward compatibility cho dữ liệu cũ nhưng đánh dấu chưa verify.

4. Không tạo migration phá dữ liệu.

5. Nếu cần migration database:
   - viết migration rõ;
   - nullable trước;
   - không ép data cũ có giá trị giả.

6. Sau khi sửa:
   - chạy lint;
   - typecheck nếu có;
   - test;
   - build.

7. Báo lại:
   - file nào đã sửa;
   - schema nào thay đổi;
   - env nào cần thêm;
   - API nào phải enable trên Google Cloud;
   - migration nào phải chạy;
   - giới hạn/case nào còn tồn tại.

---

# 22. Tài liệu Google tham chiếu

Google Maps URLs:

https://developers.google.com/maps/documentation/urls/get-started

Google Place IDs:

https://developers.google.com/maps/documentation/places/web-service/place-id

Google Places / pricing:

https://developers.google.com/maps/billing-and-pricing/pricing

Google Maps API security:

https://developers.google.com/maps/api-security-best-practices

---

# Kết quả mong muốn cuối cùng

Trước:

```text
CDP address text
→ Google tự đoán
→ có thể sai điểm
→ route sai
```

Sau:

```text
User/Admin xác nhận location một lần
→ CDP lưu Place ID / lat,lng
→ route luôn dùng định danh vị trí
→ Google Maps chỉ tính đường
```

Đây là hướng triển khai mặc định cho CDP.
