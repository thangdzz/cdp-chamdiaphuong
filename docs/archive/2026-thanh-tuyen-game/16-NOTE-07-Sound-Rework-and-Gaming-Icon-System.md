# 16-NOTE-07 — Sound Rework + Gaming-style Icon System

**Ngày:** 15/09/2026  
**Phạm vi:** MVP1 — Săn đèn Thành Tuyên 2026  
**Mục tiêu:** Chỉnh lại sound theo đúng cảm giác creature/game hơn, đồng thời nâng cấp bộ icon theo hướng sưu tập kiểu game.

## 1. Cơ sở tham khảo gaming

Điều chỉnh này đi theo 2 nguyên tắc thường thấy trong game:

1. **Sound của creature phải truyền được character, kích thước và mức đe dọa.** Không chỉ “có tiếng” là đủ. Con mạnh hơn phải nghe lớn hơn, nặng hơn, đáng sợ hơn.
2. **Icon collectible phải nhận diện nhanh chỉ bằng một biểu tượng duy nhất.** Người chơi nhìn lướt là biết mình vừa mở cái gì, và muốn sưu tập tiếp.

Hướng sound đúng là lấy **âm thanh thật làm lõi** rồi layer thêm texture, impact và low-end để tạo cảm giác game.

## 2. Chỉnh sound theo phản hồi mới

### 2.1. Hổ vàng hạ sơn

Yêu cầu:
- gầm dũng mãnh hơn;
- nghe oai phong, đáng sợ;
- cảm giác “chúa sơn lâm”.

Hướng sound:
- base: tiger/lion roar thật, ưu tiên roar dài hơi hơn;
- layer 1: growl ngực trầm;
- layer 2: sub/low boom ngắn để tăng uy lực;
- layer 3: tail accent rất ngắn, như âm vang sau cú gầm.

### 2.2. Mãng long tụ hội

Yêu cầu:
- đáng sợ hơn;
- to hơn, nặng hơn **Rồng vàng khổng lồ**;
- phải nghe như “rồng lớn / boss-tier”.

Hướng sound:
- base: monster/dragon roar trầm, dài hơn Rồng vàng;
- layer 1: deep chest rumble;
- layer 2: multiple-roar texture rất nhẹ để gợi cảm giác “tụ hội”;
- layer 3: wing/wind whoosh hoặc air displacement.

### 2.3. Những model cùng họ phải khác nhau

#### Họ Rồng / Long

- **Rồng vàng khổng lồ:** uy nghi, sáng hơn, showpiece hơn.
- **Mãng long tụ hội:** hung dữ, thấp hơn, nặng hơn, boss hơn.
- **Long cuốn thủy:** rồng nước, có water surge / splash.
- **Hào khí đất Việt - Xuân Trường:** dragon-like nhưng có sắc thái nghi lễ, biểu tượng.

#### Họ Hổ / linh thú gần hổ

- **Hổ vàng hạ sơn:** predator roar mạnh.
- **Nghê thần chầu ngọc:** growl ngắn + bell/metal/linh thú accent, không roar như hổ.

#### Họ Cá

- **Cá chép vượt vũ môn:** upward rush, splash mạnh, shimmer.
- **Cửu ngư quần hội:** nhiều ripple/splash nhỏ hơn, cảm giác hội tụ đông.

## 3. Quy tắc phân hóa sound

Phân hóa bằng 5 trục:

1. **Pitch**: con lớn hơn / dữ hơn → thấp hơn.
2. **Weight**: model hoành tráng hơn → low-end nặng hơn.
3. **Tempo / tail**: linh hoạt → đuôi âm nhanh; oai vệ → đuôi âm rộng hơn.
4. **Element**: nước, lửa, công nghệ, nghi lễ… phải có texture riêng.
5. **Role**: boss / showpiece / folklore / sponsor khác nhau về mood.

Không chỉ đổi mỗi volume.

## 4. Icon system mới — theo hướng collectible gaming

### 4.1. Mục tiêu

Bộ icon hiện tại cần nâng cấp thành **bộ huy hiệu sưu tập** của CDP.

Yêu cầu:
- nhìn là nhớ;
- một model = một biểu tượng rõ ràng;
- cảm giác collectible/game mạnh hơn;
- dùng được cả khi không có ảnh thật;
- dùng được như “badge” đè lên ảnh thật sau này.

### 4.2. Chỉ dùng 1 biểu tượng chính

**Không dùng 2 biểu tượng trong cùng một icon như hiện tại.**

Mỗi model chỉ có:
- **1 icon hero** rõ ràng;
- nền, viền, shape, glow là phần phụ trợ;
- không nhét thêm icon thứ hai làm rối.

### 4.3. Phong cách tạo hình

Hướng hình ảnh:
- mạnh mẽ hơn;
- đậm chất game/mobile game collectible;
- silhouette rõ;
- chi tiết vừa phải;
- dễ đọc ở kích thước nhỏ;
- nhìn đẹp cả khi ở 32px–48px.

Nên có:
- shape riêng theo category;
- viền kim loại / men / phù hiệu;
- nền gradient hoặc texture nhẹ;
- highlight/glow tiết chế;
- bóng đổ gọn.

### 4.4. Cấu trúc icon

Mỗi icon có 4 lớp:

1. **Base shape**
2. **Category frame**
3. **Hero symbol**
4. **State overlay**

## 5. Các cách hiển thị model

### Mode A — Icon only
Dùng trong collection grid, popup unlock, quest, milestone, marker nhỏ.

### Mode B — Photo only
Dùng khi xem gallery / ảnh lớn.

### Mode C — Photo + icon overlay
Đây là mode nên ưu tiên khi đã có ảnh thật.

- Ảnh mô hình thật là nền lớn.
- Icon CDP gắn đè ở **góc trên bên trái**.

Quy cách overlay:
- icon size nhỏ nhưng đủ rõ;
- có nền/capsule/badge để không chìm vào ảnh;
- bo tròn;
- có viền trắng mỏng hoặc nền tối nhẹ.

## 6. State của icon

### Chưa gặp
- grayscale hoặc muted;
- silhouette vẫn đọc được.

### Đã gặp
- full color;
- viền sáng;
- có dấu ✓ hoặc badge nhỏ.

### Vừa mở
- glow mạnh hơn bình thường;
- pulse;
- icon pop-out;
- kết hợp sound.

### Unknown
- icon mystery riêng: đèn lồng + dấu hỏi hoặc phù hiệu bí ẩn;
- vẫn phải đẹp.

## 7. Map marker

Map marker nên chuyển sang:
- marker tròn / badge marker;
- bên trong là **hero symbol** của model;
- màu nền theo category;
- nếu nhiều sighting thì có count badge nhỏ: `×2`, `×4`.

Ví dụ:
- Mãng long tụ hội: marker đầu rồng khác hẳn Long cuốn thủy.
- Hổ vàng hạ sơn: marker đầu hổ / móng hổ mạnh mẽ hơn.

## 8. Hệ icon phải tái sử dụng lâu dài

Thiết kế như **CDP Collectible Icon System** để sau này dùng cho:
- lễ hội khác;
- địa điểm;
- mùa hoa;
- chợ phiên;
- bộ ảnh địa phương;
- collection theo category.

## 9. Gợi ý category frame

- **Creature / Animal:** frame mạnh, sắc nét.
- **History / Heroic:** frame kiểu huy hiệu / chiến kỳ / trống đồng.
- **Folklore / Legend:** frame mềm hơn, có mystical accent.
- **Culture / Traditional:** frame gợi chất thủ công, lễ hội, dân gian.
- **Technology / Sponsor:** frame sạch hơn, sắc cạnh hơn, digital hơn.

## 10. Gợi ý cụ thể một số icon

- **Hổ vàng hạ sơn:** 1 đầu hổ gầm nghiêng 3/4 hoặc đang lao xuống.
- **Mãng long tụ hội:** 1 đầu rồng dữ, sừng lớn, khí áp mạnh.
- **Rồng vàng khổng lồ:** 1 đầu rồng uy nghi, sáng hơn, ít hung dữ hơn Mãng long.
- **Long cuốn thủy:** 1 đầu rồng hoặc thân rồng xoắn trong xoáy nước.
- **Nghê thần chầu ngọc:** 1 đầu nghê/cả thân nghê cách điệu với viên ngọc là chi tiết phụ.
- **Trống đồng Đông Sơn:** 1 mặt trống đồng nhìn chính diện.
- **Ông Tiến sĩ Giấy AI:** 1 icon tiến sĩ giấy, thêm chip/spark nhỏ trong cùng biểu tượng.
- **Kết nối không gian - VNPT:** 1 tên lửa / tàu vũ trụ / vệ tinh.

## 11. Sound + icon phải khớp nhau

Khi user mở model mới:

icon bật lên  
→ sound đúng character phát ra  
→ tên model hiện  
→ progress tăng

Nếu icon và sound không cùng character thì cảm giác collectible bị yếu.

## 12. Preview để duyệt

Nên có màn preview trong admin hoặc dev:

### Sound Preview
- play sound từng model
- so sánh Hổ vàng vs Nghê vs Rồng vàng vs Mãng long

### Icon Preview
- grid 45 icon
- xem ở 32px / 48px / 64px
- xem các state:
  - unknown
  - locked
  - unlocked
  - just unlocked
- xem mode:
  - icon only
  - photo + icon overlay

## 13. Acceptance criteria

1. **Hổ vàng hạ sơn** có roar mạnh hơn rõ rệt, đáng sợ hơn.
2. **Mãng long tụ hội** nghe lớn hơn, boss hơn **Rồng vàng khổng lồ**.
3. Các model cùng loài/chủ đề không nghe na ná nhau.
4. Mỗi model có **1 hero icon** rõ ràng, không còn icon đôi.
5. Bộ icon mang chất collectible gaming mạnh hơn.
6. Icon dùng được cả khi không có ảnh thật.
7. Khi có ảnh thật, icon được overlay nhỏ ở góc trên trái.
8. Có đủ mode icon-only và photo+icon-overlay.
9. Map marker dùng hệ icon mới, không chỉ dựa vào emoji thô.
10. Sound và icon đồng bộ về character.
11. Preview đủ để duyệt trước deploy.

## 14. Mục tiêu cuối

Người dùng phải có cảm giác:

> **Mình không chỉ đang xem danh sách mô hình, mà đang sưu tập một bộ huy hiệu game có cá tính riêng.**

Và khi mở model:

> **icon đúng chất + sound đúng nhân vật = cảm giác mở khóa thật sự.**
