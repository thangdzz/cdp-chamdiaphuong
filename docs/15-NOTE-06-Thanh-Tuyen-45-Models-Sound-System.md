# 15-NOTE-06 — Thành Tuyên 2026: Sound System + Chuẩn hóa 45 mô hình

**Ngày:** 15/09/2026  
**Phạm vi:** MVP1 — Săn đèn Thành Tuyên 2026  
**Trạng thái:** Duyệt triển khai

## 1. Chuẩn hóa số lượng mô hình

Game phải chuẩn bị cho:

- **40 mô hình chính thức**
- **5 mô hình bổ sung**
- **Tổng cộng: 45 mô hình**

Hiện mới xác định được tên khoảng **34 mô hình**, vì vậy:

```text
total_slots = 45
known_models = 34
unknown_slots = 11
```

UI dùng tổng **45**, không dùng 34.

Ví dụ:

> **Bạn đã gặp 8 / 45**

11 slot chưa rõ tên vẫn tồn tại dưới dạng:

```text
Mô hình chưa xác định #35
...
Mô hình chưa xác định #45
```

Khi xác định được tên thật thì cập nhật ngay trên slot cũ, giữ nguyên sighting/progress đã có.

---

## 2. Hướng sound đã duyệt

Không dùng một tiếng “ting” chung cho mọi mô hình.

Nguyên tắc:

> **Âm thanh thật / creature sound làm lõi → layer thêm hiệu ứng để ra cảm giác game.**

Ví dụ:

- **Rồng:** roar/growl + wing whoosh + low rumble
- **Voi:** elephant trumpet thật + low rumble
- **Hổ:** roar/growl
- **Ngựa:** neigh/whinny + hoof
- **Cóc:** croak thật
- **Chim/Phượng/Chim Lạc:** bird cry + wing flap; Phượng có thể thêm fire whoosh
- **Cá:** water splash + bubble
- **Rùa:** shell/stone movement + water
- **Nghê:** lion/tiger growl + bell/metal accent nhẹ
- **Thỏ:** hop/rustle + squeak nhẹ, không cố làm tiếng giả quá mức

Sound unlock nên dài khoảng **0,7–1,5 giây**, một số model đặc biệt tối đa khoảng **2 giây**.

---

## 3. Sound identity cho mô hình lịch sử / truyền thuyết

- **Hai Bà Trưng cưỡi voi:** elephant trumpet + war drum
- **Thánh Gióng:** horse neigh + hoof + metal accent
- **Đinh Bộ Lĩnh:** small war drum + flag/cloth movement
- **Trần Quốc Toản:** drum hit + sword/metal accent
- **Sự tích Hồ Gươm:** water splash + mystical low tone
- **Cóc kiện trời:** frog croak + thunder accent
- **Sơn Tinh - Thủy Tinh:** thunder + water surge + low impact
- **Thạch Sanh chém chằn tinh:** monster growl + sword impact
- **Lạc Long Quân - Âu Cơ:** wind + water + ceremonial chime
- **Chú Cuội:** night ambience + bamboo/wood chime

---

## 4. Sound identity cho mô hình văn hóa / hiện đại

- **Trống đồng Đông Sơn:** bronze drum hit
- **Đám cưới chuột:** squeak nhỏ + folk percussion
- **Cây đa, cổng làng:** village ambience + wooden/bamboo percussion
- **Ông Tiến sĩ Giấy AI:** paper flick + digital blip
- **Kết nối không gian - VNPT:** rocket whoosh + synth accent
- **Cánh sóng vươn xa - Viettel:** radio/signal pulse + digital sweep
- **Tam nông phát triển - Agribank:** engine/field ambience + mechanical accent
- **Vững bước tiên phong - BIDV:** metal/glass shimmer + cinematic pulse
- **Hào khí đất Việt - Xuân Trường:** dragon-like low roar + ceremonial accent

---

## 5. Nguồn âm thanh

Có thể tham khảo cách game thương mại xây sound identity nhưng **không lấy/rip file âm thanh từ game**.

Nguồn ưu tiên:

- Pixabay Sound Effects
- Freesound
- thư viện royalty-free / public-domain / license rõ

Mỗi file nên lưu:

```text
source_url
license
author
original_filename
downloaded_at
```

---

## 6. Config theo model

Không hard-code trong component.

Ví dụ:

```json
{
  "name": "Hình tượng Voi chiến",
  "icon": "elephant",
  "tags": ["animal", "history"],
  "sound_family": "animal",
  "sound_key": "elephant-trumpet-01",
  "sound_layers": ["elephant-trumpet", "low-rumble"]
}
```

Nếu chưa có sound riêng thì dùng fallback theo `sound_family`.

---

## 7. Flow khi mở model

```text
user ghi nhận model mới
→ icon animate
→ sound model phát
→ tên model hiện
→ progress tăng
```

Ví dụ:

> 🐘  
> **Đã Chạm: Hình tượng Voi chiến**  
> **9 / 45**

Lần gặp lại không phát full unlock sound; chỉ dùng confirmation sound ngắn hơn.

---

## 8. Milestone sound

Các mốc:

```text
5 / 45
10 / 45
20 / 45
30 / 45
40 / 45
45 / 45
```

- model unlock: sound riêng của model
- collection con hoàn thành: success chime
- milestone lớn: celebration sound
- **45/45:** festival drum + crowd cheer nhẹ + completion chime

Không dùng nhạc nền dài.

---

## 9. Unknown model

11 slot chưa xác định không dùng sound creature cụ thể.

Dùng:

```text
mystery sound = short whoosh + soft magical/question tone
```

Khi được định danh:

```text
placeholder
→ tên thật
→ icon thật/gần nghĩa
→ tags
→ sound identity
```

Sighting cũ vẫn giữ nguyên.

---

## 10. Icon

Tổng game phải chuẩn bị đủ **45 slot icon**.

- Model phổ biến: icon trực tiếp theo hình tượng.
- Model khó mô tả: tạo icon gần nghĩa nhất với từ khóa.
- Unknown: icon mystery đẹp, không dùng broken image.

Icon có 3 trạng thái:

```text
chưa gặp = grayscale / silhouette
đã gặp = full color
vừa mở = scale + glow + sound
```

---

## 11. Preview để duyệt sound

Nên có dev/admin preview:

```text
/game/sound-preview
```

hoặc trong:

```text
/admin/game
```

Mỗi model hiển thị:

```text
Icon
Tên
Sound family
Play
Duration
```

Admin có thể:

- Play sound
- đổi `sound_key`
- đổi `sound_family`
- đổi icon

Mục đích là duyệt nhanh toàn bộ 45 model trước deploy.

---

## 12. Chuẩn hóa volume

Các sound phải được normalize để:

- Rồng không quá to
- Voi không làm giật mình
- Thỏ không quá nhỏ
- sound digital không át creature

Có thể dùng:

```text
normalization
compression nhẹ
limiter
fade-in/fade-out ngắn
```

---

## 13. Mute và performance

Giữ:

```text
🔊 / 🔇
```

- Không autoplay khi user mở web.
- Chỉ phát sau interaction.
- Khi mute, animation/gameplay vẫn chạy.
- Không preload toàn bộ sound nặng.
- Ưu tiên file nhẹ cho mobile.

---

## 14. Acceptance criteria

1. Tổng collection là **45**.
2. Hỗ trợ **34 tên đã biết + 11 unknown slot**.
3. Unknown đổi thành model thật mà không mất dữ liệu.
4. Rồng có roar/growl.
5. Voi có trumpet thật.
6. Hổ/ngựa/cóc/chim có sound phù hợp thực tế.
7. Model lịch sử/truyền thuyết có sound identity riêng.
8. Sound lần đầu khác sound gặp lại.
9. Có mute.
10. Không autoplay.
11. Sound ngắn, volume cân bằng.
12. Có preview để duyệt sound.
13. Không dùng audio rip từ game thương mại.
14. Mapping sound nằm ở config/data, không hard-code UI.

## 15. Mục tiêu

Trải nghiệm phải có cảm giác:

> **icon xuất hiện → nghe đúng “nhân vật” → biết ngay mình vừa mở cái gì**

Sound là một phần nhận diện của model, ngang với icon và tên.
