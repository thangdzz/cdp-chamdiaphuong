# 14-NOTE-05 — MVP1 Game Polish: Pre-Game, Collection, Icon & Sound

**Ngày:** 15/09/2026  
**Phạm vi:** Săn đèn Thành Tuyên 2026  
**Mục tiêu:** Bổ sung trải nghiệm game trước thời điểm rước đèn, mở rộng collection và tăng cảm giác “game” bằng icon + sound.

---

# 1. Pre-game trước thời điểm rước đèn

## Thời gian áp dụng

Theo kế hoạch hiện tại:

- Từ bây giờ đến hết **thứ Năm 17/09/2026**: chưa có rước đèn.
- Từ **tối thứ Sáu 18/09/2026**: bắt đầu có đèn rước.

Game vẫn cho user vào chơi trước ngày 18/9, nhưng **không ghi nhận sighting thật** trong thời gian chưa được rước.

Mục đích:

- tạo tò mò;
- cho user thử game;
- tạo cảm giác vui;
- không làm bẩn dữ liệu map bằng sighting giả trước thời gian diễn ra.

---

# 2. Hành vi khi user báo “vừa thấy mô hình” trước 18/9

Trong khoảng thời gian khóa sighting:

User vẫn được bấm CTA:

> 🏮 **Bạn vừa thấy mô hình nào?**

User vẫn chọn mô hình như bình thường.

Nhưng khi bấm submit, hệ thống **không lưu sighting thật**.

Thay vào đó hiển thị popup theo số lần user thử.

## Lần 1

> **Bạn điêu thật, hôm nay làm gì có mô hình nào rước mà bạn bảo nhìn thấy 🤣**

## Lần 2

> **Thật không bạn để tôi còn đi đồn? 🤔**

## Lần 3

> **Tôi xin lỗi bạn, thứ 6 tôi mới làm việc cơ 😆**

Sau lần 3:

- có thể lặp lại câu số 3;
- hoặc random 1 trong 3 câu;
- không cần phát triển thêm trong MVP.

---

# 3. Cách đếm số lần thử

Ưu tiên lưu theo anonymous profile hiện có.

Ví dụ:

```text
pre_game_attempt_count
```

Flow:

```text
0 -> lần thử đầu -> popup 1
1 -> lần thử hai -> popup 2
2 -> lần thử ba -> popup 3
>=3 -> popup 3 hoặc random
```

Nếu anonymous profile chưa hỗ trợ field riêng, có thể lưu tạm client-side theo session/local state cho MVP.

Không tạo sighting record thật.

Không tăng:

- collection;
- community count;
- marker;
- model count;
- first discovery.

---

# 4. Sau 18/9

Từ thời điểm mở game thật:

CTA hoạt động bình thường.

Flow trở lại:

```text
chọn mô hình
-> vị trí
-> ảnh optional
-> submit sighting
-> cập nhật map
-> collection tăng
-> animation + sound
```

Pre-game lock tự tắt theo thời gian cấu hình.

Không hard-code logic sâu trong UI.

Nên có config:

```text
event.game_live_at = 2026-09-18T19:00:00+07:00
```

Trước `game_live_at`:

```text
mode = pre_game
```

Sau `game_live_at`:

```text
mode = live
```

---

# 5. Collection mở rộng

Không chỉ có:

> **Đã gặp 8 / tổng**

Mỗi user có nhiều lớp collection.

## 5.1. Bộ chính

> **Thành Tuyên 2026**

Ví dụ:

```text
8 / 34
```

Nếu chưa xác định tổng chính xác thì hiển thị:

> **Bạn đã gặp 8 mô hình**

---

# 6. Collection theo nhóm

Dùng tag để sinh collection.

Không hard-code collection theo từng mô hình.

Mỗi model có thể có nhiều tag.

Ví dụ:

```text
animal
dragon
history
folklore
legend
technology
sponsor
traditional
mid_autumn
```

Từ tag có thể sinh các bộ như:

### Linh vật / con vật

Ví dụ:

- Rồng
- Phượng
- Rùa
- Ngựa
- Thỏ
- Cá
- Hổ
- Nghê
- Cóc

### Truyền thuyết / cổ tích

Ví dụ:

- Sự tích Hồ Gươm
- Cóc kiện trời
- Sự tích quả dưa hấu
- Sơn Tinh - Thủy Tinh
- Lạc Long Quân - Âu Cơ
- Chú Cuội
- Thạch Sanh

### Lịch sử

Ví dụ:

- Đinh Bộ Lĩnh
- Hai Bà Trưng
- Thánh Gióng
- Trần Quốc Toản

### Văn hóa Việt

Ví dụ:

- Trống đồng Đông Sơn
- Chim Lạc
- Đám cưới chuột
- Cây đa / cổng làng

### Công nghệ / hiện đại

Ví dụ:

- Ông Tiến sĩ Giấy AI
- Cánh sóng vươn xa
- Kết nối không gian

### Nhóm tài trợ / doanh nghiệp

Ví dụ:

- Agribank
- Viettel
- VNPT
- BIDV
- Xuân Trường

---

# 7. Collection ẩn

Không hiển thị toàn bộ collection ngay từ đầu.

Một số collection chỉ mở khi user vô tình đạt điều kiện.

Ví dụ:

User gặp đủ 3 model có tag `dragon`.

Hiện:

> ✨ **Bạn vừa mở bộ sưu tập mới: Long hội**

Sau đó mới hiển thị progress:

```text
3 / ?
```

Tạo cảm giác:

- bất ngờ;
- phát hiện;
- tò mò xem còn bộ nào khác.

---

# 8. Milestone

Bộ chính có milestone:

```text
5 mô hình
10 mô hình
20 mô hình
30 mô hình
hoàn thành toàn bộ
```

Mỗi milestone có:

- animation riêng;
- sound riêng;
- message ngắn.

Ví dụ:

> **10 mô hình rồi!**
>
> Bạn đang đi nhanh hơn mình nghĩ đấy 😄

Không cần coin hay quà.

---

# 9. Độ hiếm theo sighting

Không tự gán rarity cố định.

Tính từ dữ liệu thật theo từng tối.

Ví dụ:

### Thường gặp

Nhiều sighting.

### Ít gặp

Ít sighting.

### Hiếm tối nay

Rất ít sighting.

### Chưa ai tìm thấy

0 sighting.

Có thể hiển thị:

```text
Thỏ Ngọc
Bạn gặp: 2 lần
Cộng đồng: 41 lượt
```

Một model xuất hiện nhiều lần vẫn là **1 model trong collection**, nhưng số sighting được giữ riêng.

---

# 10. Thống kê cuối đêm

Dữ liệu sighting tự sinh content.

Ví dụ:

## Mô hình được nhìn thấy nhiều nhất

> 🥇 Thỏ Ngọc — 28 lượt

## Khó gặp nhất tối nay

> 👀 Nghê thần — 3 lượt

## Đi nhiều nơi nhất

> 🗺️ Rồng vàng — được báo tại 7 khu vực

## User gặp nhiều nhất

> Bạn gặp Rồng vàng 4 lần tối nay

Không cần làm leaderboard user trong MVP.

---

# 11. Combo collection

Có thể cấu hình một số combo.

Ví dụ:

### Sử Việt

- Đinh Bộ Lĩnh
- Hai Bà Trưng
- Thánh Gióng
- Trần Quốc Toản

Hoàn thành:

> **Sử Việt 4/4**

### Long hội

Các model có tag dragon.

### Chuyện xưa kể lại

Các model truyền thuyết / cổ tích.

Combo hoàn thành có:

- animation mạnh hơn bình thường;
- sound đặc biệt;
- không cần reward vật chất.

---

# 12. Icon cho từng mô hình

Bộ icon hiện tại đang đẹp, tiếp tục giữ phong cách đó.

## Nguyên tắc

Mỗi model nên có một icon nhận diện riêng.

Nếu model phổ biến:

- dùng hình mô tả trực tiếp.

Ví dụ:

```text
Rồng -> dragon icon
Voi -> elephant icon
Thỏ -> rabbit icon
Cá -> fish icon
Hổ -> tiger icon
Rùa -> turtle icon
```

Nếu model khó mô tả hoặc không có icon phổ biến:

**hãy mạnh dạn tạo icon gần nhất với từ khóa / hình tượng của mô hình.**

Ví dụ:

### Ông Tiến sĩ Giấy AI

Có thể tạo icon:

```text
ông tiến sĩ giấy + kính / chip / sparkle AI
```

### Cây đa, cổng làng Đường Lâm

```text
cây đa + cổng làng
```

### Trống đồng Đông Sơn

```text
mặt trống đồng
```

### Kết nối không gian - VNPT

```text
rocket / satellite
```

### Tam nông phát triển

```text
thuyền + nông sản / máy nông nghiệp
```

### Hào khí đất Việt

```text
rồng + hoa sen
```

Không cần quá chính xác theo mô hình thật nếu chưa có ảnh.

Mục tiêu icon là:

- đẹp;
- dễ nhớ;
- phân biệt nhanh trên map;
- có cảm giác collectible.

---

# 13. Trạng thái icon

Icon có ít nhất 3 trạng thái.

## Chưa gặp

- grayscale;
- opacity thấp;
- silhouette hoặc icon mờ.

## Đã gặp

- full color;
- glow nhẹ;
- có dấu ✓.

## Vừa mở

Animation:

```text
scale 0.7 -> 1.08 -> 1
opacity 0 -> 1
glow pulse
```

---

# 14. Sound cho từng model / nhóm model

Khi user mở khóa model mới:

icon + sound xuất hiện cùng nhau.

Sound ngắn, vui, không gây khó chịu.

Không autoplay khi vừa mở web.

Chỉ phát sau user interaction.

---

# 15. Sound theo nhóm

Không nhất thiết mỗi model phải có file sound hoàn toàn riêng.

Có thể dùng sound family.

## Animal

Ví dụ:

- thỏ: pop / soft hop
- voi: trumpet nhẹ
- hổ: roar rất ngắn
- chim/phượng: wing / shimmer
- cá: water sparkle
- rùa: soft bell
- rồng: deep chime / whoosh

## History

- drum hit;
- short heroic chime.

## Folklore

- magical sparkle;
- wooden chime.

## Technology

- digital blip;
- synth sparkle.

## Traditional / cultural

- bell;
- small drum;
- bamboo / wooden percussion.

---

# 16. Sound unlock

Khi model mới được thêm vào collection:

```text
icon appears
-> short model/category sound
-> progress animates
-> success message
```

Ví dụ:

> 🐘
>
> **Đã Chạm: Hình tượng Voi chiến**
>
> Bộ sưu tập: 9 / 34

Sound:

```text
short elephant-style trumpet + chime
```

Âm thanh nên dưới 1 giây hoặc khoảng 1–1.5 giây tối đa.

---

# 17. Sound completion

Khi hoàn thành collection nhỏ:

dùng sound khác với unlock bình thường.

Ví dụ:

```text
2–3 note success chime
```

Khi hoàn thành milestone lớn:

```text
slightly longer celebration sound
```

Không dùng nhạc nền dài trong MVP.

---

# 18. Mute

Giữ nút:

```text
🔊 / 🔇
```

Preference được nhớ nếu hệ thống hiện tại hỗ trợ.

Nếu không nhớ được thì default mỗi session.

Game vẫn hoạt động đầy đủ khi mute.

---

# 19. Animation + sound phải đi cùng UX

Không dùng hiệu ứng chỉ để trang trí.

Chỉ trigger khi:

- mở model mới;
- hoàn thành collection;
- milestone;
- first discovery;
- game chuyển sang live;
- success state.

Không phát sound mỗi khi scroll hoặc mở popup thông thường.

---

# 20. Game trước 18/9 vẫn phải vui

Trong pre-game:

User vẫn xem được:

- collection;
- icon;
- tên model;
- collection ẩn nếu đã được seed;
- map ở trạng thái chưa live;
- countdown nếu muốn.

Có thể hiển thị:

> **Game chính thức bắt đầu tối 18/9**

CTA vẫn bấm được để kích hoạt 3 popup troll.

Không lưu sighting thật.

---

# 21. Sau 18/9

Khi game live:

- bỏ popup troll;
- CTA submit thật;
- bật marker;
- bật rarity;
- bật thống kê sighting;
- bật collection unlock;
- bật first discovery;
- bật sound/icon unlock.

Không cần redeploy nếu `game_live_at` được cấu hình trong data/config.

---

# 22. Implementation note cho Claude

Ưu tiên làm theo hướng reusable.

Không viết:

```text
if model == rabbit
...
if model == elephant
...
```

Nên có config:

```text
model.icon
model.tags
model.sound_family
model.sound_key
model.collection_groups
```

Ví dụ:

```json
{
  "name": "Hình tượng Voi chiến",
  "icon": "elephant",
  "tags": ["animal", "history"],
  "sound_family": "animal",
  "sound_key": "elephant-short"
}
```

Collection sinh từ:

```text
tag rules
```

Sound sinh từ:

```text
sound_family / sound_key
```

Icon sinh từ:

```text
icon key
```

---

# 23. Acceptance criteria bổ sung

MVP update đạt khi:

1. Trước 18/9, submit sighting không tạo dữ liệu thật.
2. Lần thử 1/2/3 hiện đúng 3 câu popup.
3. Sau `game_live_at`, sighting hoạt động bình thường.
4. Một model có thể có nhiều sighting nhưng collection chỉ tính 1.
5. User thấy được số lần mình gặp model.
6. Có collection theo tag.
7. Có ít nhất một hidden collection.
8. Có milestone.
9. Có rarity dựa trên sighting.
10. Có icon riêng hoặc icon gần nghĩa cho toàn bộ model hiện có.
11. Unlock model có animation.
12. Unlock model có sound phù hợp.
13. Sound có mute.
14. Game vẫn chạy tốt khi không có ảnh thật.
15. Tất cả logic đủ reusable cho event khác sau này.

---

# 24. Mục tiêu cuối

Trải nghiệm phải tạo cảm giác:

> **“Tôi đang săn những thứ thật ngoài đời, nhưng bộ sưu tập và phản hồi lại có cảm giác như game.”**

Dữ liệu thật là lõi.

Icon, animation và sound làm cho việc ghi nhận dữ liệu trở nên vui hơn.

Collection và rarity làm user muốn đi tiếp.

Pre-game troll giúp game có cá tính ngay cả trước khi lễ hội bắt đầu.
