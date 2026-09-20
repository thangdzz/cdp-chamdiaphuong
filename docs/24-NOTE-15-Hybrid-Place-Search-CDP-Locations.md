# 24-NOTE-15 — Hybrid Place Search + CDP Location Layer

> Dùng cho CDP — Chạm Địa Phương.
> Mục tiêu: biến các vị trí do Admin/User ghim và xác nhận thành dữ liệu địa điểm riêng của CDP, có thể tìm kiếm lại, hiển thị trên bản đồ CDP và dùng để chỉ đường chính xác, kể cả khi Google Maps không có hoặc tìm sai.

## 1. Bối cảnh

Case thực tế:

```text
User nhập: 1 ngõ 63 Lê Duẩn
Google tìm: Ngõ 9 Lê Duẩn, Minh Xuân, Tuyên Quang
→ sai

User kéo ghim tới:
21.82796, 105.20024
→ đúng
→ chỉ đường bằng tọa độ chạy đúng
```

Kết luận:

> Google Places chỉ là một nguồn tìm kiếm.
> CDP phải có lớp dữ liệu vị trí riêng của mình.

Nếu Google không có nhưng người địa phương ghim đúng, CDP phải:
- lưu điểm đó;
- hiển thị lại trên map CDP;
- tìm lại bằng search CDP;
- cho cộng đồng xác nhận;
- dùng để chỉ đường;
- ưu tiên hơn Google nếu dữ liệu CDP đáng tin hơn.

---

## 2. Hybrid Place Search

Search địa điểm chạy song song:

```text
User search
   ↓
CDP database + Google Places
   ↓
Merge + rank
   ↓
Kết quả chung
```

Ví dụ:

```text
Tìm: 1 ngõ 63 Lê Duẩn

1. 1 ngõ 63 Lê Duẩn
   CDP · 4 người xác nhận

2. Ngõ 9 Lê Duẩn
   Google
```

Nếu CDP có kết quả khớp mạnh và đã `community_verified` hoặc `admin_verified` thì ưu tiên trước Google.

---

## 3. Nguồn và trạng thái vị trí

Nguồn:

```text
google_place
user_pin
admin_pin
legacy_text
```

Trạng thái:

```text
unverified
community_verified
admin_verified
```

Thứ tự trust:

```text
admin_verified
→ community_verified
→ unverified
```

Không coi Google mặc định đúng hơn tọa độ CDP đã được xác nhận.

---

## 4. Khi Google tìm sai

Không ghi:

```text
Tìm thấy: Ngõ 9 Lê Duẩn...
```

Đổi thành:

```text
Google tìm thấy:
Ngõ 9 Lê Duẩn, Minh Xuân, Tuyên Quang

Không đúng?
Kéo ghim tới vị trí thực tế.
```

Sau khi user kéo:

```text
Vị trí bạn chọn
21.82796, 105.20024

[ Xác nhận vị trí ]
```

Tên do user nhập vẫn được giữ nếu Google trả sai.

---

## 5. Lưu điểm Google không có

Cho phép:

```text
googlePlaceId = null
latitude = ...
longitude = ...
name = tên user/admin nhập
source = user_pin | admin_pin
```

Điểm vẫn là một địa điểm hợp lệ của CDP.

Không bắt buộc mọi địa điểm CDP phải có Google Place ID.

---

## 6. Hiển thị trên map CDP

CDP phải render marker từ database riêng.

Có thể phân biệt:

```text
Google-backed place
CDP-only place
micro-location
temporary/event place
```

Nhãn nhẹ:

```text
CDP · 4 người xác nhận
```

Không biến thành rating/review.

---

## 7. Search dữ liệu CDP

Index tối thiểu:

```text
name
aliases
address
ward
province
tags
latitude
longitude
googlePlaceId
locationStatus
```

Nên hỗ trợ `searchAliases[]`.

Ví dụ:

```text
1 ngõ 63 Lê Duẩn
đỉnh dốc bà The
nhà bà The
```

Search CDP cần tìm được theo các tên địa phương này.

---

## 8. Community Location Consensus

Một user ghim:

```text
unverified
```

User khác có thể:

```text
[ Vị trí này đúng ]
[ Sửa vị trí ]
```

Nếu nhiều user xác nhận gần cùng tọa độ:

```text
community_verified
```

Nếu lệch nhau rõ:

```text
locationConflict = true
```

→ đưa Admin review.

Admin xác nhận:

```text
admin_verified
```

---

## 9. Ghim trong lộ trình cá nhân

Nếu user ghim một địa điểm ngay trong lộ trình:

```text
→ lộ trình của chính họ dùng ngay tọa độ vừa ghim
→ đồng thời gửi 1 location vote cho place gốc
```

Không bắt user chờ đủ 2 phiếu mới được dùng tọa độ cho chính lộ trình của họ.

Place gốc vẫn `unverified` cho tới khi đủ consensus.

Nếu Admin ghim thì có thể chốt `admin_verified` ngay.

---

## 10. Routing

Ưu tiên:

```text
1. admin/community verified lat/lng
2. Google Place ID nếu place Google đúng
3. text search chỉ dùng để tìm/xác minh
```

Không để Google geocode lại text nếu CDP đã có tọa độ đúng.

Nguyên tắc:

```text
CDP xác định điểm
Google tính đường
```

---

## 11. Micro-location

Một địa điểm có thể có nhiều điểm thực tế:

```text
Nhà hàng A
├─ Cửa chính
├─ Bãi gửi xe
├─ Lối vào ô tô
├─ Điểm giao hàng
└─ Điểm đón khách
```

Model gợi ý:

```text
place
└─ locationPoints[]
```

Mỗi point:

```text
id
label
type
lat
lng
status
source
confirmedCount
```

Types:

```text
main
entrance
parking
pickup
dropoff
ticket
viewpoint
delivery
other
```

---

## 12. Chỉ đường tới nhiều điểm của cùng một place

Nếu có nhiều location point:

```text
Bạn muốn tới đâu?

[ Cửa chính ]
[ Bãi gửi xe ]
[ Điểm đón khách ]
```

Không mặc định luôn dẫn tới tâm của place.

---

## 13. Temporary / Event Location

Hỗ trợ vị trí chỉ tồn tại theo thời gian:

```text
bãi gửi xe lễ hội
điểm cấm đường
điểm đón shuttle
chợ tạm
sân khấu tạm
điểm xem mô hình
```

Model:

```text
temporary = true
validFrom
validUntil
```

Hết hạn:
- không ưu tiên search;
- không dùng route mặc định;
- không xóa lịch sử.

---

## 14. Rank kết quả Search

Gợi ý:

```text
1. CDP admin_verified + exact match
2. CDP community_verified + strong match
3. Google exact match
4. CDP unverified candidate
5. Google fuzzy result
```

Nếu search hiện tại đã có scoring thì tận dụng, không hard-code máy móc.

---

## 15. Không copy Google thành dữ liệu CDP một cách mù quáng

Google Places dùng để:

```text
find candidate
get placeId
get coordinates
help verification
```

CDP-only data phải đến từ:

```text
user/admin pin
community consensus
CDP metadata
```

---

## 16. Admin UX

Admin cần có:

```text
Tìm bằng Google
Tìm trong CDP
Xem pin hiện tại
Kéo pin
Xác nhận
Xem location votes
Xem conflict
```

Với điểm Google không có:

```text
[ Lưu thành địa điểm CDP ]
```

---

## 17. User UX

Kết quả search phân biệt nguồn:

```text
CDP
Google
```

Ví dụ:

```text
CDP · 4 người xác nhận
CDP · Chưa xác nhận đủ
Google
```

---

## 18. Duplicate handling

Nếu CDP point sau này phát hiện Google đã có đúng place:

```text
merge CDP place + Google Place ID
```

Không tạo duplicate.

Nếu Google sai tọa độ nhưng CDP đúng:

```text
giữ tọa độ CDP
không overwrite bằng Google
```

---

## 19. Audit vị trí

Không xóa sạch lịch sử khi đổi pin.

Lưu tối thiểu:

```text
oldCoordinates
newCoordinates
source
actor
time
reason/conflict
```

---

## 20. Điểm khác biệt sản phẩm

Không làm CDP thành một Google Maps khác.

Google mạnh ở:

```text
POI phổ biến
dữ liệu rộng
navigation
```

CDP mạnh ở:

```text
tên địa phương
địa điểm nhỏ
điểm Google chưa có
cổng/lối vào/bãi xe/điểm đón
vị trí tạm theo sự kiện
dữ liệu được người địa phương xác nhận
```

CDP dùng Google khi Google làm tốt, bổ sung phần Google thiếu.

---

## 21. Scope triển khai

### P0

```text
- lưu CDP-only pin
- render trên map CDP
- search lại được điểm CDP
- merge kết quả CDP + Google
- community/admin verification
- route bằng tọa độ CDP
```

### P1

```text
- aliases
- micro-location
- locationPoints[]
```

### P2

```text
- temporary/event locations
- advanced ranking
- location history UI
```

Không cần làm toàn bộ P1/P2 nếu codebase hiện tại chưa phù hợp.

---

## 22. Acceptance Criteria

### Search
- [ ] Search query chạy trên dữ liệu CDP.
- [ ] Search vẫn gọi Google Places.
- [ ] Kết quả được merge.
- [ ] CDP verified result có thể đứng trước Google khi match tốt.
- [ ] Hiển thị nguồn rõ.

### Pin
- [ ] Google sai vẫn kéo pin được.
- [ ] Pin được lưu DB.
- [ ] Reload vẫn giữ.
- [ ] Không cần Google Place ID.

### Map
- [ ] CDP-only place render được trên map CDP.
- [ ] Click marker mở đúng place.

### Consensus
- [ ] User location vote hoạt động.
- [ ] Đủ phiếu → `community_verified`.
- [ ] Conflict → Admin review.
- [ ] Admin → `admin_verified`.

### Route
- [ ] Route dùng tọa độ CDP khi đã xác nhận.
- [ ] Không quay lại text query gây sai.
- [ ] Lộ trình cá nhân dùng ngay pin do chính user vừa chọn.

### Duplicate
- [ ] Có cơ chế tránh/merge duplicate giữa CDP và Google.

---

## 23. Prompt giao Claude

Hãy đọc NOTE này cùng các NOTE và `ARCHITECTURE.md` hiện có, sau đó triển khai theo kiến trúc CDP hiện tại. Không dựng hệ thống song song nếu đã có search, coordinates, consensus, audit hoặc place model có thể mở rộng.

Ưu tiên P0:

1. CDP lưu được địa điểm chỉ có `lat/lng` mà Google không có.
2. Địa điểm đó render được trên map CDP.
3. Search trở thành hybrid search: CDP database + Google Places → merge + rank.
4. Phân biệt rõ nguồn `CDP` / `Google`.
5. CDP verified result được ưu tiên khi query match tốt.
6. User/Admin kéo pin và xác nhận được.
7. User pin → location vote.
8. Community consensus → `community_verified`.
9. Admin pin/confirm → `admin_verified`.
10. Route dùng verified coordinates / Place ID; không quay lại text query nếu CDP đã có vị trí.
11. Khi user ghim trong lộ trình cá nhân:
    - dùng ngay tọa độ đó cho lộ trình của họ;
    - đồng thời gửi 1 phiếu cho place gốc;
    - không tự nâng place gốc thành `community_verified`.
12. Google tìm sai phải hiển thị wording rõ là **“Google tìm thấy”**, không tạo cảm giác CDP đã xác nhận.
13. Không phá pickup service, custom stop, proposal, route hiện tại và dữ liệu legacy.

Sau P0, nếu kiến trúc phù hợp thì chuẩn bị model cho:

```text
aliases[]
locationPoints[]
micro-location
temporary/event location
validFrom
validUntil
```

Trước khi code, kiểm tra tối thiểu:

```text
place schema/model
search hiện tại
Google Places integration
coordinates.js
mapsUrl.js
route builder
location consensus
admin place editor
user place/proposal flow
map components
audit/history
Redis/DB storage
```

Sau khi code:

- chạy lint;
- chạy typecheck;
- chạy test;
- chạy build;
- sửa lỗi phát sinh;
- báo file đã sửa;
- migration cần chạy;
- env cần thêm;
- Google API cần bật;
- phần nào P0 hoàn thành;
- phần nào để P1/P2;
- edge case còn lại.

Không chỉ viết kế hoạch. Hãy thực hiện code.
