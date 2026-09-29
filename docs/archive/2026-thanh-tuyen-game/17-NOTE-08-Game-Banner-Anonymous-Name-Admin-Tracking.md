# 17-NOTE-08 — Game Banner, Anonymous Display Name & Admin Tracking

**Ngày:** 15/09/2026  
**Phạm vi:** CDP + Săn đèn Thành Tuyên 2026  
**Trạng thái:** Đề xuất triển khai tiếp sau MVP1

## 1. Banner game riêng dưới phần Lễ hội Thành Tuyên 2026

Trang `/le-hoi-thanh-tuyen` vẫn giữ nguyên nội dung game hiện tại bên trong trang.

Ngoài ra thêm **một banner game riêng, hấp dẫn**, đặt ngay dưới phần chính của Lễ hội Thành Tuyên 2026.

Mục tiêu:
- kéo user vào game nhanh;
- làm rõ đây là một trải nghiệm riêng;
- tăng lượt vào `/cham/thanh-tuyen-2026`.

Nội dung gợi ý:

> **Săn đèn Thành Tuyên 2026**  
> Tối nay bạn tìm được bao nhiêu mô hình?

Có thể hiển thị động:
- `Cộng đồng đã ghi nhận X / 45 mô hình`
- `Y lượt nhìn thấy tối nay`
- `Mô hình được thấy nhiều nhất: ...`

CTA:

> **🏮 Vào chơi ngay**

Visual:
- dùng 3–5 icon collectible đẹp nhất;
- glow / animation nhẹ;
- background Trung thu tiết chế;
- mobile-first;
- cảm giác như “cổng vào game”, không phải banner quảng cáo tĩnh.

---

## 2. Anonymous Display Name

CDP hiện không bắt đăng ký tài khoản.

Mỗi anonymous profile nên có:

```text
anonymous_id
display_name
created_at
```

### Tên ngẫu nhiên lần đầu

Hệ thống tự sinh tên vui theo không khí Trung thu / lễ hội / khám phá.

**Không được trùng tên mô hình đèn.**

Ví dụ:
- Kẻ Săn Trăng
- Người Đi Đêm
- Chú Bé Cầm Đèn
- Cô Gái Ngắm Trăng
- Người Canh Phố
- Kẻ Lang Thang Thành Tuyên
- Thợ Săn Ánh Sáng
- Người Gác Trăng
- Kẻ Đuổi Theo Đèn
- Người Đi Qua Ngã Tám
- Đứa Hay Đi Lang Thang
- Người Săn Tiếng Trống

Tên nên:
- dễ nhớ;
- vui;
- không quá trẻ con;
- hơi “ngầu”;
- không trùng model.

Có thể sinh theo template:

```text
[prefix] + [role / action / object]
```

Ví dụ:

```text
Kẻ + Săn Trăng
Người + Canh Phố
Thợ + Săn Ánh Sáng
```

---

## 3. Cho user đổi tên hiển thị

User đổi `display_name` bất kỳ lúc nào.

Copy gợi ý:

> **Tên này chưa đủ ngầu? Đổi tên cho oách xà lách 😎**

Hoặc:

> **Đặt một cái tên thật ngầu để hiện trên CDP**

Rules:
- 3–30 ký tự;
- chặn profanity / spam cơ bản;
- không impersonate admin/CDP;
- không cần unique tuyệt đối;
- đổi tên không làm mất lịch sử.

Nếu sau này user đăng ký:
- giữ display_name;
- merge anonymous history vào account.

---

## 4. Hiển thị tên trên game

Tên anonymous có thể hiện tại:
- first discovery;
- lịch sử cá nhân;
- contribution feed;
- admin tracking;
- sau này là profile nhẹ.

Ví dụ:

> **Ghi nhận đầu tiên bởi Kẻ Săn Trăng**

Hoặc:

> **Người Đi Đêm vừa báo thấy Hổ vàng 3 phút trước**

Không public vị trí user; chỉ public event/model/location object.

---

## 5. Admin tracking theo Anonymous Display Name

Admin cần theo dõi anonymous user theo:

```text
anonymous_id
display_name
first_seen_at
last_seen_at
session_count
page_views
game_opens
sighting_count
unique_models_seen
photos_uploaded
name_changed_count
```

Có thể thêm:

```text
last_activity
device/browser coarse info
source/referrer nếu có
```

Admin search theo:
- display_name;
- anonymous_id.

Ví dụ:

> **Kẻ Săn Trăng**
> - 8 sessions
> - 17 sightings
> - 9 unique models
> - 3 ảnh
> - hoạt động gần nhất: 4 phút trước

---

## 6. Admin hiện quá dài — cần chia menu

Không tiếp tục nhồi mọi thứ vào `/admin/game`.

Tách admin thành navigation rõ ràng.

### Dashboard
`/admin`

Tổng quan:
- visitors hôm nay;
- anonymous users;
- returning users;
- game opens;
- sightings;
- unique models seen;
- photos submitted;
- conversion vào game.

### Game
`/admin/game`

Chỉ quản lý:
- event config;
- collection;
- milestones;
- game live/pre-game.

### Models
`/admin/game/models`

- 45 model slots;
- tên;
- icon;
- tags;
- sound;
- photo;
- verification.

### Sightings
`/admin/game/sightings`

- danh sách sightings;
- unknown sightings;
- spam;
- merge;
- delete/hide.

### Media
`/admin/game/media`

- ảnh chờ duyệt;
- ảnh đã duyệt;
- reject;
- assign model.

### Users
`/admin/users`

- anonymous users;
- display names;
- activity;
- contributions;
- later registered users.

### Analytics
`/admin/analytics`

- traffic;
- funnels;
- returning users;
- game usage;
- top content.

### Assets
`/admin/game/assets`

- icon preview;
- sound preview.

---

## 7. Dashboard tracking truy cập

Dashboard phải đọc được trong khoảng 10 giây.

### Cards chính — hôm nay

- Visitors
- Sessions
- Returning visitors
- Game opens
- Sightings
- Unique contributors

### Game funnel

```text
Visit lễ hội
→ mở game
→ chọn model
→ submit sighting
→ quay lại lần 2
```

Ví dụ:

```text
1,240 visit
620 mở game (50%)
240 bắt đầu report (39%)
178 submit (74%)
61 quay lại (34%)
```

---

## 8. Tracking anonymous user

Nếu chưa có tracking riêng, tạo first-party anonymous tracking nhẹ.

Ví dụ:

```text
anonymous_id = random UUID
```

Track event tối thiểu:

```text
page_view
game_open
model_open
sighting_start
sighting_submit
photo_upload
display_name_change
collection_unlock
sound_play
```

Sau này nếu user đăng ký:

```text
anonymous_id
→ merge vào user_id
```

Không làm mất lịch sử cũ.

---

## 9. Dashboard theo thời gian

Filter:
- hôm nay;
- 7 ngày;
- 30 ngày;
- event period.

Graph cơ bản:
- visitors theo giờ/ngày;
- game opens;
- sightings;
- returning users.

Không cần BI dashboard phức tạp ở giai đoạn này.

---

## 10. Flow tổng

```text
user vào lễ hội
→ thấy banner game
→ bấm vào chơi
→ được gán display_name ngẫu nhiên
→ chơi / report
→ admin thấy anonymous user trong tracking
→ user quay lại vẫn giữ tên
→ user có thể đổi tên
→ sau này đăng ký thì merge lịch sử
```

Đây là bước đầu để CDP có identity layer mà vẫn không bắt user đăng ký sớm.

---

## 11. Acceptance criteria

1. Có banner game riêng dưới phần Thành Tuyên 2026.
2. Banner có visual game, progress động và CTA rõ.
3. Anonymous user lần đầu được gán display_name ngẫu nhiên.
4. Tên không trùng model.
5. User đổi display_name được.
6. Có copy khuyến khích đổi tên theo kiểu vui/ngầu.
7. Tên hiển thị trong contribution/first discovery phù hợp.
8. Admin search được anonymous user theo display_name.
9. Admin tracking được sessions/activity/contributions cơ bản.
10. Admin được tách menu hợp lý.
11. Có Dashboard tổng quan.
12. Có traffic/game funnel.
13. Có returning visitor tracking.
14. Sau này merge anonymous → account mà không mất lịch sử.

## 12. Mục tiêu

Không ép đăng ký nhưng user vẫn có:

> **một “nhân vật” của riêng mình trên CDP.**

Và admin vẫn biết:

> **ai đang dùng, dùng bao nhiêu lần, làm gì, quay lại hay không**

ở mức anonymous/pseudonymous, không cần biết danh tính thật.

Banner kéo user vào game.  
Display name giữ cảm giác cá nhân.  
Tracking giúp CDP biết thứ gì thực sự đang hoạt động.
