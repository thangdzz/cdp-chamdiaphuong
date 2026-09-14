# 13-NOTE-04 — MVP1 Săn Đèn Thành Tuyên 2026 — Spec để Claude code

**Ngày:** 14/09/2026  
**Trạng thái:** Sẵn sàng triển khai thử  
**Mục tiêu:** Làm MVP game đầu tiên trên Chạm địa phương (CDP), ưu tiên đẹp, dễ hiểu, dùng được trên mobile và sinh dữ liệu thật.

---

# 1. Concept

Tên trải nghiệm:

## **Săn đèn Thành Tuyên 2026**

Đây không phải minigame tách rời.

Game phủ lên dữ liệu thật của Lễ hội Thành Tuyên:

**xem → tò mò → đi tìm → báo vừa thấy → bộ sưu tập tăng → bản đồ cộng đồng cập nhật → xuất hiện mục tiêu tiếp theo**

Không dùng coin hay phần thưởng vật chất.

Động lực chính:

- tò mò;
- sưu tầm;
- hoàn thành;
- phát hiện đầu tiên;
- nhìn thấy tiến độ cá nhân;
- đóng góp cho bản đồ cộng đồng.

---

# 2. Nguyên tắc MVP1

MVP1 phải chạy được kể cả khi:

- chưa có đủ tên tất cả mô hình;
- chưa có ảnh thật;
- chưa có đầy đủ dữ liệu phường/tổ;
- chưa có nhiều user.

Không chờ data hoàn hảo mới chạy.

### Ảnh

- **Không bắt buộc user upload ảnh.**
- User có thể hoàn thành một sighting chỉ bằng chọn mô hình + vị trí + thời gian.
- Sau khi submit thành công, gợi ý nhẹ:
  **“Thêm ảnh để giúp cộng đồng nhận diện và xác minh?”**
- Nếu chưa có ảnh mô hình, dùng:
  - emoji;
  - icon vector;
  - silhouette/con vật;
  - placeholder đẹp theo category.

Ví dụ:

`🐉 🐟 🦁 🐸 🐢 🐇`

Ảnh thật có thể thay dần icon sau này.

---

# 3. Entry point trên web

Trong trang:

`/le-hoi-thanh-tuyen`

thêm một hero/block game ở vị trí dễ thấy.

Ví dụ:

> **Săn đèn Thành Tuyên**
>
> Tối nay bạn gặp được bao nhiêu mô hình?
>
> **Bạn đã gặp 7 / 20**
>
> [ Xem bản đồ tối nay ]
>
> [ 🏮 Tôi vừa thấy một mô hình ]

Không bắt user phải đọc hướng dẫn dài.

---

# 4. Navigation MVP1

Mobile-first.

Game có 4 tab:

1. **Bản đồ tối nay**
2. **Bộ sưu tập**
3. **Nhiệm vụ**
4. **Lịch sử**

MVP bắt buộc code tốt 3 phần đầu tiên:

- Bản đồ tối nay
- Bộ sưu tập
- Report sighting

Nhiệm vụ và lịch sử có thể đơn giản hơn trong lần đầu.

---

# 5. Màn Home / Summary

Hiển thị:

## Bộ sưu tập của bạn

`7 / 20`

Progress bar.

Bên dưới:

> **Cộng đồng đã ghi nhận 63 mô hình**

Không hard-code con số tổng nếu dữ liệu chưa chắc chắn.

Nếu chưa biết tổng chính xác:

> **Bạn đã gặp 7 mô hình**

và:

> **Cộng đồng đã ghi nhận 63 mô hình khác nhau**

---

# 6. Màn “Bản đồ tối nay”

Dùng bản đồ thật theo hướng:

## MapLibre + OpenStreetMap

Không ưu tiên Google Maps cho MVP game layer vì về sau cần:

- custom marker;
- icon mô hình;
- Fog of War;
- vùng sáng/tối;
- heatmap;
- territory;
- animation;
- layer dữ liệu riêng.

### Marker

Mỗi marker đại diện sighting gần đây.

Marker có thể dùng emoji/icon:

`🐉`

Khi tap marker:

> **Rồng vàng**
>
> Vừa được nhìn thấy tại đây  
> **4 phút trước**
>
> 12 người đã báo gần khu vực này
>
> [ Tôi cũng vừa thấy ]

### Không được viết

> “Rồng đang ở đây”

Vì mô hình di chuyển.

Phải viết:

> **“Được nhìn thấy ở đây X phút trước.”**

### Mức tin cậy

Có thể hiển thị:

- `1 báo cáo`
- `3 người xác nhận`
- `Tin cậy cao`

Chưa cần thuật toán phức tạp.

MVP có thể tính đơn giản bằng số sighting gần nhau trong thời gian ngắn.

---

# 7. CTA chính

CTA quan trọng nhất phải luôn dễ bấm trên mobile:

## **🏮 Bạn vừa thấy mô hình nào?**

Nên fixed/sticky ở đáy màn hình.

Bấm vào → mở bottom sheet.

---

# 8. Workflow report sighting

## Step 1 — Chọn mô hình

Bottom sheet:

> **Bạn vừa thấy mô hình nào?**

Search box.

Danh sách:

- 🐉 Rồng vàng
- 🐟 Cá chép trông trăng
- 🦁 Sư tử
- ❓ Không biết tên

**“Không biết tên” phải luôn có.**

---

## Step 2 — Vị trí

Ưu tiên lấy browser geolocation nếu user đồng ý.

Nếu không cấp quyền:

- cho user chọn vị trí trên map;
- hoặc dùng vị trí gần đúng do user tap.

Không chặn submit chỉ vì không có GPS chính xác.

---

## Step 3 — Ảnh tùy chọn

Hiển thị:

> **Thêm ảnh?**
>
> Giúp nhận diện mô hình và xác minh vị trí nhanh hơn.

Buttons:

- `Chụp ảnh`
- `Chọn từ máy`
- `Bỏ qua`

**Không ép upload ảnh.**

---

## Step 4 — Submit

Submit tối thiểu:

```text
model_id hoặc unknown_model
user_id
timestamp
latitude
longitude
location_accuracy nếu có
photo_url nếu có
```

Có thể thêm:

```text
source = user_sighting
event_id = thanh-tuyen-2026
```

---

# 9. Success state

Sau submit phải tạo cảm giác game.

Không chỉ hiện toast “Đã lưu”.

Nên có animation ngắn 600–1200 ms.

Ví dụ:

- icon mô hình bật lên;
- vòng sáng lan ra;
- progress bar tăng;
- số `7 / 20` animate thành `8 / 20`;
- confetti nhỏ, tiết chế;
- một âm thanh “chime” ngắn.

Copy:

> **Đã Chạm!**
>
> Bạn vừa thêm Rồng vàng vào bộ sưu tập.

Nếu user đã từng gặp:

> **Đã ghi nhận vị trí mới**
>
> Cảm ơn bạn đã cập nhật bản đồ tối nay.

Nếu là người đầu tiên:

> **Bạn là người đầu tiên ghi nhận mô hình này trên CDP.**

---

# 10. Animation

Game nên có cảm giác sống nhưng không nặng.

Ưu tiên CSS animation / lightweight JS.

### Các animation nên có

#### Progress

Khi collection tăng:

`7 / 20 → 8 / 20`

Progress bar animate mượt.

#### Marker

Marker mới xuất hiện:

- scale từ `0.7 → 1`;
- nhẹ bounce;
- vòng pulse 1–2 lần.

#### Collection card

Khi mở model mới:

- icon từ grayscale → full color;
- card sáng nhẹ;
- trạng thái chuyển `Chưa gặp → Đã Chạm`.

#### Bottom sheet

Slide-up tự nhiên.

#### Success

Có thể dùng:

- radial glow;
- vài particle/confetti nhỏ;
- không phủ kín màn hình.

### Performance

Animation phải:

- dùng transform/opacity;
- tránh gây lag;
- tôn trọng `prefers-reduced-motion`.

Nếu user bật reduced motion thì giảm hoặc tắt animation mạnh.

---

# 11. Âm thanh

Có thể thêm sound nhỏ để tăng cảm giác game.

## Nguyên tắc

**Không autoplay âm thanh khi user vừa mở trang.**

Chỉ phát sound sau hành động chủ động:

- submit sighting;
- mở collection mới;
- hoàn thành một milestone.

### Sound MVP

Có thể dùng 2–3 sound rất ngắn:

1. `tap-soft`
2. `discovery-chime`
3. `collection-complete`

Thời lượng khoảng:

`100–800 ms`

Không dùng nhạc nền liên tục trong MVP.

### Setting

Có icon:

`🔊 / 🔇`

Mặc định có thể bật sound nhưng chỉ phát sau tương tác, hoặc nhớ preference của user.

Nếu browser/device không cho phát thì game vẫn chạy bình thường.

---

# 12. Bộ sưu tập

Màn Collection:

## Bộ sưu tập Thành Tuyên 2026

Cards:

### Đã gặp

- full color;
- icon hoặc ảnh;
- `✓ Đã Chạm`.

### Chưa gặp

- muted / grayscale;
- có thể chỉ hiện silhouette.

### Unknown / Mystery

Nếu chưa đủ data:

> **Mô hình chưa biết**
>
> Gợi ý: Minh Xuân · chủ đề cổ tích

Không cần phải nhập đủ toàn bộ danh sách trước.

Collection được mở rộng khi cộng đồng ghi nhận model mới.

---

# 13. Model card

Mỗi mô hình có:

```text
id
name
slug
icon
photo
category
ward
neighborhood
description
story
event_year
verification_status
first_seen_at
first_seen_by
```

Không phải field nào cũng bắt buộc MVP.

### Fallback

Nếu thiếu:

- name → “Mô hình chưa xác định”
- photo → icon
- ward → không hiện
- story → không hiện

UI không được vỡ vì thiếu field.

---

# 14. Nhiệm vụ

MVP có thể hiển thị 3 loại quest tự sinh đơn giản.

### Thiếu ảnh

> 📷 **Mô hình này chưa có ảnh rõ**

### Cần xác minh

> 📍 **Có nhiều báo cáo khác nhau về vị trí**

### Chưa xác định

> ❓ **Có ảnh nhưng chưa biết tên mô hình**

Chưa cần reward.

Click quest → mở object/report liên quan.

---

# 15. Dữ liệu đầu vào

Tên mô hình hiện không nhất thiết có một danh sách chính thức đầy đủ tập trung.

Vì vậy data có thể đến từ:

- nguồn chính thức;
- báo chí;
- page/phường;
- admin nhập;
- user report;
- user gửi ảnh;
- đối chiếu sau.

Cần hỗ trợ model trạng thái:

```text
unverified
community_verified
admin_verified
official_verified
```

Không cần triển khai toàn bộ trust engine trong MVP.

---

# 16. Unknown model workflow

Đây là phần quan trọng để game chạy dù data chưa đủ.

User chọn:

> ❓ Không biết tên

Hệ thống tạo sighting:

```text
model_id = null
unknown_model_id = generated_id
```

Có thể có ảnh hoặc không.

Sau này admin/community match:

```text
unknown_model_id
→ model_id = existing_model
```

Mọi sighting cũ phải được nhập lại vào model đúng.

Nếu chưa match được, unknown vẫn xuất hiện trong community feed.

---

# 17. First discovery

Nếu một model lần đầu xuất hiện trên CDP:

lưu:

```text
first_seen_by
first_seen_at
first_sighting_id
```

UI:

> **Ghi nhận đầu tiên bởi @username**

Chưa cần leaderboard.

---

# 18. Phân biệt các progress

Một hành động sighting có thể cập nhật nhiều progress.

Ví dụ user báo Rồng vàng lần đầu:

```text
personal_collection +1
community_sighting +1
model_sighting_count +1
area_activity +1
first_discovery nếu chưa có
```

Nếu user đã từng gặp:

```text
personal_collection không tăng
community_sighting +1
model_sighting_count +1
latest_location cập nhật
```

Không double-count collection.

---

# 19. Data model gợi ý

## Event

```text
id
slug
name
year
start_at
end_at
status
```

## Model

```text
id
event_id
name
slug
icon
photo_url
category
ward
neighborhood
verification_status
first_seen_by
first_seen_at
created_at
updated_at
```

## Sighting

```text
id
event_id
model_id nullable
user_id
latitude
longitude
accuracy
photo_url nullable
created_at
verification_score
```

## UserCollection

Có thể không cần table riêng nếu query từ unique sightings.

Nếu performance cần:

```text
user_id
event_id
model_id
first_seen_at
last_seen_at
sighting_count
```

---

# 20. Privacy

Không public chính xác location history của user.

Public data là:

> model được nhìn thấy tại vị trí X vào thời gian Y

Không public:

> user A đang ở X

Profile user không cần show timeline GPS chi tiết.

Ảnh upload cần stripping EXIF location nếu hệ thống không muốn lộ metadata gốc.

---

# 21. Anti-spam MVP

Chưa cần hệ thống phức tạp.

Tối thiểu:

- login để submit;
- rate limit;
- không cho spam cùng model/cùng vị trí liên tục;
- flag report;
- lưu source/user/time;
- admin có thể merge/delete sighting xấu.

Không chặn quá mạnh giai đoạn đầu.

---

# 22. UI / visual direction

Phong cách:

- mobile-first;
- sạch;
- card bo mềm;
- nền sáng hơi ấm;
- màu Trung thu dùng tiết chế;
- icon lớn, dễ nhìn ngoài đường;
- typography rõ;
- button cao, dễ bấm một tay;
- map chiếm diện tích đủ lớn.

Không làm theo phong cách game fantasy nặng.

CDP vẫn phải trông như một sản phẩm địa phương hữu ích, chỉ có game layer phủ lên.

---

# 23. Empty states

Nếu chưa có sighting:

> **Tối nay chưa ai báo vị trí mô hình.**
>
> Nếu bạn gặp một mô hình ngoài đường, hãy là người đầu tiên ghi nhận.

Nếu user chưa gặp model nào:

> **Bộ sưu tập của bạn đang trống.**
>
> Ra ngoài và Chạm mô hình đầu tiên.

Nếu chưa có ảnh:

> dùng icon.

Không hiển thị broken image.

---

# 24. Desktop

Desktop vẫn dùng được nhưng không phải priority.

Có thể:

- map bên trái;
- collection/recent sightings bên phải.

Mobile mới là trải nghiệm chính.

---

# 25. MVP acceptance criteria

Claude có thể coi MVP đạt khi:

1. User mở được block game trên trang Thành Tuyên.
2. Có summary progress.
3. Có collection list.
4. Có bản đồ MapLibre/OpenStreetMap.
5. Có marker sightings.
6. User bấm `Bạn vừa thấy mô hình nào?`.
7. Chọn model hoặc unknown.
8. Lấy/chọn vị trí.
9. Ảnh là optional.
10. Submit thành công.
11. Collection cập nhật đúng, không double-count.
12. Marker/feed cập nhật.
13. Có success animation.
14. Có sound effect sau tương tác.
15. Có mute toggle.
16. UI responsive mobile.
17. Thiếu ảnh/tên/data không làm vỡ game.

---

# 26. Thứ tự code đề xuất

## Phase 1

- data model;
- seed event;
- seed một số models;
- collection query;
- sighting API.

## Phase 2

- game summary;
- collection UI;
- report bottom sheet.

## Phase 3

- MapLibre map;
- recent sightings;
- custom marker/icon.

## Phase 4

- animation;
- sound;
- success states;
- polish mobile.

## Phase 5

- unknown workflow;
- optional image upload;
- admin matching/merge cơ bản.

---

# 27. Không làm trong MVP1

Tạm chưa làm:

- leaderboard lớn;
- coin;
- shop;
- reward vật chất;
- full trust graph;
- invite reputation;
- badge system phức tạp;
- AR;
- route recommendation phức tạp;
- realtime websocket bắt buộc;
- AI image recognition bắt buộc;
- Fog of War hoàn chỉnh.

Các phần này để sau khi có usage thật.

---

# 28. Nguyên tắc cuối

MVP1 phải chứng minh được vòng sau:

> **User ra ngoài → thấy mô hình → Chạm → CDP có thêm dữ liệu → user thấy progress tăng → bản đồ cộng đồng tốt hơn → user có lý do tiếp tục tìm.**

Nếu vòng này chạy được, game layer có nền để phát triển tiếp sang:

- địa điểm thường ngày;
- lễ hội khác;
- chợ phiên;
- mùa hoa;
- ảnh địa phương;
- collection theo category;
- quest xác minh dữ liệu;
- game theo khu vực.

**Không code riêng một trò Trung thu khó tái sử dụng. Hãy code các primitive có thể dùng lại: Event, Object/Model, Sighting, Collection, Progress, Quest và Map Layer.**
