# CDP — Google Places + Location Verification + Community Consensus

## Mục tiêu

Sửa tận gốc lỗi:
- địa chỉ nhập trên CDP mở sang Google Maps bị sai điểm;
- Google tự đoán sai địa chỉ;
- route nhiều điểm có thể dẫn sai;
- admin không thể biết chắc mọi vị trí;
- user có thể biết vị trí đúng nhưng hiện chưa có cơ chế xác nhận tọa độ rõ ràng.

Nguyên tắc mới:

> **CDP phải xác định đúng điểm địa lý trước. Google Maps chỉ chịu trách nhiệm dẫn đường giữa các điểm đã được CDP xác định.**

Không dùng `tên + phường + tỉnh` làm định danh chính cho chức năng **Chỉ đường** nữa.

---

# 1. Google Places dùng để làm gì

Khi Admin hoặc user nhập tên địa điểm, CDP gọi Google Places để:
- tìm nhanh địa điểm;
- hiện các kết quả phù hợp;
- lấy Google Place ID;
- lấy lat/lng;
- lấy địa chỉ chuẩn để đối chiếu.

Sau đó vẫn phải có bước:

```text
Xem pin trên bản đồ
→ nếu sai thì kéo pin
→ xác nhận vị trí
```

Google Places giúp tìm nhanh và có điểm khởi đầu tốt.

CDP mới là nơi quyết định tọa độ nào được dùng để chỉ đường.

---

# 2. Data model vị trí

Mỗi địa điểm nên có tối thiểu:

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

  locationStatus:
    | "unverified"
    | "community_verified"
    | "admin_verified";

  locationVerifiedAt: string | null;
  locationConflict?: boolean;
};
```

Nếu schema hiện tại đang dùng `coordinates`, có thể giữ cấu trúc cũ.

Nhưng logic cuối cùng phải có đủ:

```text
lat
lng
googlePlaceId
locationSource
locationStatus
```

---

# 3. Không dùng address làm định danh vị trí

`address` chỉ dùng để:
- hiển thị;
- search;
- giúp user nhận diện;
- mô tả vị trí.

Không dùng `address` như dữ liệu cuối cùng để Google tự đoán đường.

---

# 4. Flow Admin thêm/sửa địa điểm

Admin nhập tên hoặc địa chỉ.

CDP:

```text
Google Places
→ trả candidate
```

Admin chọn candidate.

Hiện map:

```text
Pin hiện tại
[ Xác nhận vị trí ]
```

Admin có thể kéo pin nếu Google đặt sai.

Khi Admin xác nhận:

```text
latitude
longitude
googlePlaceId nếu có
locationSource = "admin_pin" hoặc "google_place"
locationStatus = "admin_verified"
locationVerifiedAt = now
```

`admin_verified` là mức trust cao nhất.

---

# 5. Flow user thêm địa điểm mới

User cũng phải có trải nghiệm gần giống Admin.

Flow:

```text
Nhập tên
→ Google Places tìm nhanh
→ user chọn candidate
→ xem pin
→ kéo pin nếu cần
→ gửi địa điểm
```

Lưu:

```text
latitude
longitude
googlePlaceId nếu có
locationSource = "user_pin" hoặc "google_place"
locationStatus = "unverified"
```

Một user gửi vị trí:
- không tự chuyển thành `admin_verified`;
- không coi ngay là vị trí chuẩn tuyệt đối.

---

# 6. Community Location Consensus

CDP đã có cơ chế đồng thuận cho dữ liệu chọn sẵn.

Không tạo một hệ thống trust hoàn toàn riêng nếu có thể tái sử dụng logic hiện tại.

Với location:

```text
1 user = 1 phiếu vị trí
```

User khác khi mở địa điểm có thể thấy:

```text
[ Vị trí này đúng ]
[ Sửa vị trí ]
```

Nếu bấm **Vị trí này đúng**:
- ghi một phiếu xác nhận cho tọa độ hiện tại.

Nếu bấm **Sửa vị trí**:
- mở map;
- user kéo pin tới vị trí đúng;
- gửi một phiếu tọa độ mới;
- không overwrite trực tiếp tọa độ production.

---

# 7. Rule đồng thuận tọa độ

Tọa độ không cần giống tuyệt đối.

Có thể coi các phiếu thuộc cùng một cluster nếu nằm trong bán kính:

```text
30–50 m
```

Nên cấu hình:

```text
LOCATION_CONSENSUS_RADIUS_METERS = 40
```

Nếu có đủ từ:

```text
2 user độc lập trở lên
```

xác nhận cùng cluster:

```text
locationStatus = "community_verified"
```

Nếu các phiếu chia thành nhiều cluster cách nhau rõ:

```text
locationConflict = true
```

Không tự chọn bừa.

Đưa địa điểm đó vào Admin review.

---

# 8. Thứ tự trust

Ưu tiên:

```text
admin_verified
→ community_verified
→ unverified
```

Admin luôn có quyền chốt lại.

Nếu Admin xác nhận một tọa độ:

```text
locationStatus = admin_verified
```

Các phiếu cộng đồng cũ có thể giữ làm lịch sử nhưng không được override Admin ngay.

---

# 9. Chỉ đường

Nút `Chỉ đường` chỉ dùng target đã xác định.

Ưu tiên:

```text
1. googlePlaceId nếu phù hợp
2. verified lat/lng
3. nếu chưa verified thì không coi text là route chính xác
```

Không fallback im lặng về:

```text
Tên + phường + tỉnh
```

cho route chính.

---

# 10. Tìm trên Google Maps

Tách riêng chức năng:

```text
Tìm trên Google Maps
```

Chức năng này có thể dùng:

```text
name + ward + province
```

Mục đích:
- tìm candidate;
- hỗ trợ verify;
- xử lý legacy data.

Không coi kết quả text search là tọa độ chuẩn nếu chưa xác nhận.

---

# 11. Refactor mapsUrl.js

Hiện tại code đang dùng `mapsQuery` hỗn hợp.

Cần tách rõ:

```js
placeRouteTarget(place)
```

và:

```js
placeSearchQuery(place)
```

Ví dụ logic:

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

  if (
    coords &&
    ["community_verified", "admin_verified"].includes(place.locationStatus)
  ) {
    return {
      type: "coordinates",
      lat: coords.lat,
      lng: coords.lng,
    };
  }

  return null;
}
```

`placeSearchQuery()` chỉ phục vụ `Tìm trên Google Maps`.

---

# 12. Route stop model

Không để stop chỉ có:

```text
mapsQuery
```

Nên resolve thành:

```ts
type RouteStopLocation = {
  label: string;
  googlePlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  locationStatus:
    | "unverified"
    | "community_verified"
    | "admin_verified";
  searchQuery?: string | null;
};
```

Route chính chỉ dùng:
- Place ID;
- hoặc verified lat/lng.

---

# 13. Nếu route có điểm chưa verified

Không được silently drop.

Hiện:

```text
Không thể mở đầy đủ lộ trình.

Điểm "XYZ" chưa có vị trí được xác nhận.
```

Actions:

```text
[ Xác nhận vị trí ]
[ Bỏ điểm khỏi lộ trình ]
```

---

# 14. Điểm Google không có

Google Places không phải nguồn duy nhất.

Ví dụ:
- cây đa;
- bãi tắm;
- điểm ngắm cảnh;
- cổng phụ;
- điểm đón xe;
- nhà dân;
- địa điểm nhỏ chưa có trên Google.

Flow:

```text
Không tìm thấy trên Google?
→ Ghim vị trí trên bản đồ
```

Lưu:

```text
googlePlaceId = null
lat
lng
locationSource = user_pin / admin_pin
```

Sau khi đủ trust:

```text
community_verified
hoặc
admin_verified
```

Google Maps vẫn chỉ đường bằng tọa độ.

---

# 15. Admin UI

Admin cần thấy:

```text
Tên địa điểm
Địa chỉ
Google Place ID
Pin đang dùng
locationStatus
Số người xác nhận
Có conflict hay không
Các cluster tọa độ nếu có
```

Actions:

```text
[ Xác nhận vị trí này ]
[ Chọn vị trí khác ]
[ Xem đề xuất vị trí ]
[ Mở Google Maps ]
```

Nếu conflict:

```text
⚠ Có nhiều vị trí khác nhau được user đề xuất
```

Admin chọn một tọa độ.

Sau đó:

```text
admin_verified
```

---

# 16. User UI

Ở trang địa điểm có thể hiển thị nhẹ:

```text
📍 Vị trí đã được cộng đồng xác nhận
```

hoặc:

```text
📍 Vị trí do CDP xác nhận
```

Nếu chưa verify:

```text
Vị trí này chưa được xác nhận
[ Xác nhận vị trí ]
```

---

# 17. Điểm thưởng / chống spam

Tận dụng trust system hiện tại.

Không cộng điểm chỉ vì user bấm xác nhận.

Nên chỉ cộng khi:

```text
phiếu của user trùng với consensus cuối cùng
```

Không cho một user gửi nhiều phiếu location cho cùng một place để farm.

Một user:

```text
1 active location vote / place
```

Nếu user sửa phiếu:

```text
replace vote cũ
```

không cộng thêm lượt.

---

# 18. Dữ liệu cũ

Không migrate phá dữ liệu.

Legacy place chưa có tọa độ chuẩn:

```text
locationSource = legacy_text
locationStatus = unverified
```

Vẫn hiển thị nội dung.

Nhưng không coi text address là verified route.

Admin có thể xử lý dần.

---

# 19. Tool Admin migrate dữ liệu cũ

Tạo danh sách:

```text
Địa điểm chưa xác nhận vị trí
```

Mỗi item:

```text
Tên
Địa chỉ hiện tại

[ Tìm bằng Google Places ]
[ Ghim trên bản đồ ]
[ Bỏ qua ]
```

Sau khi xác nhận:

```text
Place ID nếu có
lat/lng
admin_verified
```

---

# 20. Google API

Giai đoạn này dùng Google Places cho:
- autocomplete;
- text search;
- chọn candidate;
- lấy Place ID;
- lấy tọa độ.

Không cần Google Routes API ngay.

Google Maps vẫn xử lý navigation.

---

# 21. Chi phí

Thiết kế để API chủ yếu chạy lúc:

```text
CREATE
EDIT
VERIFY
```

Không gọi Places/Geocoding lại mỗi khi user:
- mở card;
- mở trang;
- reload;
- mở lộ trình;
- share.

Sau khi có dữ liệu:

```text
CDP DB
→ Place ID / lat,lng
→ Google Maps
```

Nếu chưa vượt free usage của SKU tương ứng thì phí phần API đó vẫn bằng 0.

Tuy nhiên vẫn phải:
- đặt quota;
- bật billing alert;
- restrict API key.

---

# 22. API key

Không dùng một key cho tất cả.

Ví dụ:

```text
GOOGLE_MAPS_BROWSER_KEY
GOOGLE_MAPS_SERVER_KEY
```

Browser key:

```text
restrict domain:
chamdiaphuong.io.vn
www.chamdiaphuong.io.vn
```

Server key:
- không expose frontend;
- restrict API.

---

# 23. Waypoint / mobile

Code hiện có:

```js
MAX_WAYPOINTS = 9
```

Cần kiểm tra lại flow thực tế trên mobile.

Không mặc định 9 waypoint luôn hoạt động giống desktop.

Nếu route dài:

```text
chia thành nhiều chặng
```

Ví dụ:

```text
Chặng 1
A → B → C → D

Chặng 2
D → E → F → G
```

Không silently drop điểm.

---

# 24. Acceptance criteria

## Admin
- [ ] Tìm place bằng Google Places.
- [ ] Chọn candidate.
- [ ] Xem pin.
- [ ] Kéo pin.
- [ ] Xác nhận.
- [ ] Sau reload giữ đúng location.
- [ ] Chỉ đường mở đúng.

## User
- [ ] User thêm place bằng Google Places.
- [ ] User có thể chỉnh pin.
- [ ] Phiếu user không tự thành `admin_verified`.
- [ ] User khác có thể xác nhận vị trí.
- [ ] User khác có thể đề xuất pin khác.

## Consensus
- [ ] Phiếu gần nhau được cluster.
- [ ] Đủ consensus → `community_verified`.
- [ ] Conflict → không tự chọn.
- [ ] Admin có thể chốt conflict.
- [ ] Một user chỉ có một active vote/place.

## Routing
- [ ] Không dùng text query cho route chính nếu đã có location.
- [ ] Place ID / verified coords được ưu tiên.
- [ ] Điểm unverified được báo rõ.
- [ ] Không silently drop waypoint.
- [ ] Mobile route dài được xử lý.

## Legacy
- [ ] Data cũ không mất.
- [ ] Data cũ được đánh dấu unverified.
- [ ] Có admin flow verify dần.

---

# 25. Không làm trong đợt này

Chưa cần:
- tự vẽ route trên CDP;
- traffic real-time;
- tối ưu thứ tự điểm;
- Google Routes Pro;
- route optimization;
- rating/review;
- hệ thống trust mới tách biệt hoàn toàn.

---

# 26. Kết quả cuối cùng

```text
Google Places
→ tìm nhanh địa điểm

User/Admin
→ xác nhận hoặc chỉnh pin

CDP
→ lưu Place ID + tọa độ

Nhiều user
→ tạo location consensus

Admin
→ có quyền chốt cuối

Google Maps
→ chỉ nhận đúng điểm đã xác định
→ dẫn đường
```

Mục tiêu:

> Không còn phụ thuộc vào việc Google tự đoán địa điểm từ chuỗi chữ.

---

# PROMPT DUY NHẤT CHO CLAUDE

Hãy đọc toàn bộ file spec này và triển khai vào codebase CDP hiện tại.

Trước khi sửa, hãy kiểm tra các phần liên quan đến:

- place create/edit;
- admin place editor;
- user suggestion / user-created place;
- community consensus hiện có;
- answers / voting / trust logic;
- coordinates.js;
- mapsUrl.js;
- route builder;
- custom stop;
- proposal;
- pickup service;
- database/schema;
- Redis/Upstash structures nếu có liên quan.

Yêu cầu:

1. Tận dụng tối đa kiến trúc hiện có, không dựng hệ thống song song nếu logic consensus hiện tại có thể mở rộng.
2. Google Places dùng để tìm nhanh candidate và lấy Place ID / lat/lng.
3. Admin và user đều có bước xem/chỉnh pin.
4. User vote location không tự thành verified tuyệt đối.
5. Thêm community location consensus.
6. Admin verification luôn có trust cao nhất.
7. Routing chỉ dùng Place ID hoặc tọa độ đã xác nhận.
8. Không dùng text address làm route chính xác.
9. Không phá pickup service.
10. Không phá dữ liệu legacy.
11. Migration phải nullable / backward-compatible.
12. Không silently drop waypoint.
13. Kiểm tra mobile waypoint behavior.
14. Thêm quota-safe behavior cho Google Places.
15. Restrict API key đúng browser/server.
16. Không triển khai Routes API nếu chưa thực sự cần.

Sau khi code xong:
- chạy lint;
- chạy typecheck nếu có;
- chạy test;
- chạy build;
- sửa lỗi phát sinh.

Cuối cùng báo lại ngắn gọn:
- file nào sửa;
- schema nào đổi;
- migration nào cần chạy;
- env nào cần thêm;
- Google API nào phải enable;
- quota/key restriction nào phải cấu hình;
- logic consensus location hoạt động ra sao;
- case nào còn chưa xử lý hoặc cần quyết định thêm.

Không chỉ viết kế hoạch. Hãy thực hiện code.
