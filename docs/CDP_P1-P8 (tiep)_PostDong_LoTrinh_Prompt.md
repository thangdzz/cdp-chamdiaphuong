# CDP – Kế hoạch nâng cấp Post sự kiện và Lộ trình

## Mục tiêu

Dùng bài **Lễ hội Thành Tuyên 2026** làm case đầu tiên để nâng cấp CDP từ một website hiển thị thông tin địa phương thành một hệ thống giúp người dùng:

**đọc → chọn → lên kế hoạch → tạo lộ trình → lưu/chia sẻ → người khác dùng lại.**

Bài Thành Tuyên không nên là một trang đặc thù chỉ dùng cho Trung thu. Nó nên là mẫu đầu tiên của một loại **Post động theo thời gian và ngữ cảnh**, có thể tái sử dụng cho:

- sự kiện;
- cuối tuần đi chơi;
- nghỉ lễ;
- họp bạn bè;
- họp lớp;
- chuyến đi trong ngày;
- lịch gia đình;
- danh sách địa điểm theo chủ đề;
- các kế hoạch có hoặc không có timeline.

---

# P1–P8

## P1 — Sửa Post Thành Tuyên thành timeline động

Trang sự kiện nên chuyển từ dạng bài viết tĩnh sang dạng timeline có cấu trúc dữ liệu.

Mỗi mốc nên có tối thiểu:

- tiêu đề;
- thời gian bắt đầu;
- thời gian kết thúc;
- địa điểm;
- mô tả ngắn;
- nguồn;
- thời điểm nguồn cập nhật;
- trạng thái xác minh;
- loại sự kiện;
- URL nguồn nếu có.

Không nên nhúng toàn bộ ngày tháng trực tiếp trong prose/HTML.

Ví dụ dữ liệu:

```yaml
title: Thi mô hình đèn Trung thu phường An Tường
start_at: 2026-09-16T17:00:00+07:00
end_at: 2026-09-16T21:00:00+07:00
location: Quảng trường TP Tuyên Quang cũ
source:
  name: UBND phường An Tường
  url: ...
verification_status: confirmed
```

Frontend render timeline từ dữ liệu này.

---

## P2 — Đổi card ngoài trang chủ để khớp nội dung bên trong

Tiêu đề hiện tại:

> Đi Thành Tuyên 20/9? Chỗ gửi xe, ăn tối, cafe nghỉ chân và chỗ ngủ quanh khu lễ hội →

không khớp với nội dung bên trong nếu trang chủ yếu đang nói về lịch lễ hội.

Đề xuất:

### Phương án ưu tiên

**Đi Thành Tuyên tháng 9 này?**  
Xem lịch thi đèn các phường, Đêm hội 20/9 và các hoạt động quanh lễ hội →

Hoặc:

**Lễ hội Thành Tuyên 2026**  
Lịch mới nhất · Thi đèn các phường · Đêm hội 20/9 · Xem chi tiết →

Card trang chủ phải phản ánh đúng nội dung thật của Post.

---

## P3 — Sau timeline mới đến phần phục vụ người đi lễ hội

Sau timeline mới đến phần kết nối với dữ liệu địa điểm của CDP.

Không nên chỉ hiển thị danh sách do admin biên tập sẵn.

Các nhóm nội dung có thể gồm:

- chỗ gửi xe;
- ăn tối;
- cafe nghỉ chân;
- chỗ ngủ;
- điểm xem đẹp;
- điểm đón/trả khách;
- dịch vụ liên quan.

Nhưng UI phải ưu tiên việc **người dùng tự chọn địa điểm và thêm vào kế hoạch**.

Ví dụ:

| Giờ | Hoạt động | Hành động |
|---|---|---|
| 17:30 | Ăn tối | + Chọn chỗ ăn |
| 19:00 | Gửi xe | + Chọn chỗ gửi xe |
| 20:00 | Đêm hội Thành Tuyên | Đã thêm |
| 22:15 | Cafe nghỉ chân | + Chọn quán |
| Sau đó | Ngủ lại | + Chọn chỗ ngủ |

Mục tiêu là biến người đọc Post thành người tạo Lộ trình.

---

## P4 — Tách Lộ trình khỏi Sổ

Không nên coi Lộ trình chỉ là một trạng thái của Sổ.

Hai entity nên độc lập:

### Sổ

Là bộ sưu tập địa điểm.

Không nhất thiết có thứ tự.

Ví dụ:

- quán ăn muốn thử;
- quán cafe;
- địa điểm cuối tuần;
- khách sạn;
- danh sách của cá nhân hoặc nhóm.

### Lộ trình

Là danh sách địa điểm có:

- thứ tự;
- thời gian dự kiến;
- phương tiện;
- tuyến đường;
- điểm bắt đầu;
- điểm kết thúc;
- các điểm trung gian;
- ghi chú theo từng chặng;
- tổng quãng đường;
- tổng thời gian dự kiến.

Ví dụ:

**Khách sạn → Ăn tối → Bãi gửi xe → Quảng trường → Cafe**

Thứ tự là dữ liệu của Lộ trình, không chỉ là cách hiển thị.

---

## P5 — Chia sẻ Lộ trình độc lập với việc lưu

Người dùng phải có thể:

1. chia sẻ Lộ trình ngay;
2. lưu Lộ trình và đặt tên;
3. lưu các địa điểm vào một Sổ.

Ba hành động này độc lập.

Ví dụ UI:

**Lộ trình của bạn**  
5 điểm · 8,4 km · khoảng 27 phút

- Chia sẻ lộ trình
- Lưu lộ trình
- Lưu các địa điểm vào Sổ

Không bắt buộc phải tạo Sổ trước mới được chia sẻ.

---

## P6 — Link chia sẻ phải giữ snapshot

Khi User 1 chia sẻ một Lộ trình cho User 2, link chia sẻ không được phụ thuộc hoàn toàn vào bản gốc.

Khi bấm chia sẻ:

```text
route_123
→ tạo
share_ABC
```

`share_ABC` giữ snapshot tại thời điểm chia sẻ:

- tiêu đề;
- danh sách điểm;
- thứ tự;
- phương tiện;
- thời gian;
- ghi chú;
- metadata cơ bản.

Sau đó User 1 có thể:

- sửa Lộ trình;
- đổi tên;
- đưa địa điểm vào Sổ;
- chuyển Sổ về dạng bình thường;
- xóa một điểm;

nhưng link User 2 đã nhận vẫn còn nội dung đã chia sẻ.

Có thể triển khai theo snapshot hoặc versioning.

Giai đoạn hiện tại ưu tiên snapshot vì dễ hiểu, dễ debug và ít phụ thuộc trạng thái bản gốc.

---

## P7 — Thêm mô tả tuyến đường và tích hợp Google Maps

Một Lộ trình không nên chỉ là:

**A → B → C**

Nó nên hiển thị từng chặng:

**Khách sạn → Quán ăn**  
1,8 km · khoảng 6 phút

**Quán ăn → Bãi gửi xe**  
2,1 km · khoảng 7 phút

**Bãi gửi xe → Quảng trường**  
650 m · khoảng 9 phút đi bộ

Phía trên có:

**Tổng: 4,6 km · khoảng 22 phút**

### Giai đoạn 1

CDP quản lý danh sách điểm và thứ tự.

Có nút:

**Mở toàn bộ lộ trình trên Google Maps**

Ưu điểm:

- triển khai nhanh;
- không cần biến CDP thành ứng dụng dẫn đường;
- không cần xử lý quá nhiều dữ liệu bản đồ ngay từ đầu.

### Giai đoạn 2

Tích hợp Google Routes API để hiển thị ngay trong CDP:

- quãng đường;
- thời gian;
- từng chặng;
- polyline;
- chỉ dẫn điều hướng;
- phương tiện;
- waypoint.

---

## P8 — CDP lập kế hoạch, Google dẫn đường

Không nên biến CDP thành Google Maps thu nhỏ.

CDP nên tập trung vào:

**Tôi nên đi như thế nào?**

Ví dụ:

- 17:30 ăn tối;
- 18:30 gửi xe;
- 19:00 đi bộ vào khu quảng trường;
- 20:00 xem Đêm hội;
- 22:15 đi cafe;
- sau đó về khách sạn.

Google Maps xử lý:

- đường đi;
- rẽ trái/phải;
- tình trạng tuyến;
- điều hướng thực tế.

Định vị sản phẩm:

> **CDP lo kế hoạch. Google lo đường.**

---

# Kiến trúc Post động

## A — Dynamic Timeline

Timeline phải tự động đổi trạng thái theo thời gian.

Không cần admin sửa màu thủ công.

Mỗi event có:

```text
start_at
end_at
timezone
verification_status
```

Dùng múi giờ:

```text
Asia/Ho_Chi_Minh
```

### Logic trạng thái

| Trạng thái | Điều kiện | UI |
|---|---|---|
| Đã diễn ra | now > end_at | nền xám, chữ giảm độ đậm |
| Đang diễn ra | start_at <= now <= end_at | màu nhấn mạnh, badge Đang diễn ra |
| Sắp tới | now < start_at | nền sáng |
| Mới cập nhật | dữ liệu vừa thay đổi | badge Mới cập nhật |
| Chờ xác nhận | nguồn chưa rõ | badge Đang cập nhật |
| Đã hủy | nguồn xác nhận hủy | hiển thị rõ trạng thái |
| Đổi lịch | source update | giữ lịch cũ ở lịch sử, hiển thị lịch mới |

Khi một số lượng lớn mốc đã qua:

**✓ 4 hoạt động đã diễn ra — Xem lại**

Phần mặc định ưu tiên:

- đang diễn ra;
- sắp diễn ra;
- mốc chính.

---

# Bot / Content Monitor cập nhật dữ liệu

## Nguyên tắc

Không cho bot tự đăng thẳng lên production.

Luồng đề xuất:

```text
Nguồn
→ Monitor
→ Phát hiện bài mới/thay đổi
→ AI đọc và trích xuất
→ So sánh với dữ liệu CDP hiện tại
→ Tạo đề xuất thay đổi
→ Admin duyệt
→ Publish dữ liệu
```

Không dùng:

```text
Nguồn
→ AI
→ tự sửa production
```

---

## Source Registry

Tạo một danh sách nguồn đáng tin theo từng Post/chủ đề.

Ví dụ Thành Tuyên:

- UBND tỉnh Tuyên Quang;
- website các phường;
- Báo Tuyên Quang;
- cổng thông tin lễ hội;
- nguồn chính thức khác;
- nguồn cộng đồng chỉ dùng để tham khảo.

Mỗi source có:

```text
source_id
name
url
priority
trust_level
last_checked_at
last_changed_at
```

---

## Schedule

Content Monitor có thể chạy vài lần mỗi ngày.

Không báo nếu không có thay đổi.

Khi có thông tin mới:

```text
Có cập nhật Thành Tuyên

An Tường đổi lịch thi

Cũ:
12/9 — chưa xác nhận

Mới:
17:00 ngày 16/9

Nguồn:
UBND phường An Tường

[Xem nguồn] [Sửa] [Bỏ qua] [Duyệt cập nhật]
```

Admin bấm **Duyệt cập nhật** thì publish dữ liệu.

Không cần deploy code cho mỗi thay đổi nội dung.

---

## Bot cập nhật dữ liệu, không viết lại toàn bài

Các event lưu thành record riêng.

Ví dụ:

```text
event_id
post_id
title
start_at
end_at
location_id
location_text
description
source_url
source_name
verification_status
source_updated_at
last_reviewed_at
```

Khi lịch đổi, bot tạo diff:

```diff
- start_at: 2026-09-12
+ start_at: 2026-09-16T17:00:00+07:00
```

Admin duyệt diff.

Frontend tự cập nhật timeline.

---

# Interactive Plan sau Timeline

## Mục tiêu

Không để Post dừng ở việc “đọc xong rồi thoát”.

Sau timeline, người dùng được gợi ý tạo kế hoạch cá nhân.

Ví dụ:

### Đi Đêm hội Thành Tuyên 20/9

**Bạn định đi thế nào?**

```text
17:30  Ăn tối       + Chọn chỗ ăn
19:00  Gửi xe       + Chọn chỗ gửi xe
20:00  Đêm hội      Đã thêm
22:15  Cafe          + Chọn quán
Sau đó Ngủ lại      + Chọn chỗ ngủ
```

Khi user thêm địa điểm, CDP tự hình thành Lộ trình.

---

# Admin cũng dùng cùng luồng với User

Không xây riêng một công cụ “Admin tạo mẫu” nếu không cần.

Admin nên dùng cùng entity Lộ trình như user.

Ví dụ tài khoản CDP tạo:

**Lịch đi Thành Tuyên tối 20/9 của Chạm Địa Phương**

```text
Ăn tối
→ Gửi xe
→ Đêm hội
→ Cafe
```

Sau đó đánh dấu:

```text
featured_by_cdp = true
```

Post hiển thị:

### Gợi ý từ Chạm Địa Phương

**Ăn tối → gửi xe → xem Đêm hội → cafe**

**Dùng lộ trình này**

Khi user bấm:

```text
Dùng lộ trình này
```

hệ thống clone sang một bản Lộ trình mới thuộc tài khoản của user.

User có thể sửa mà không ảnh hưởng mẫu gốc.

---

# UGC — Nội dung do người dùng tạo

Người dùng bình thường cũng có thể tạo Lộ trình.

Nếu Lộ trình có chất lượng:

- admin có thể feature;
- hiển thị trong Post;
- gắn nhãn “Gợi ý từ cộng đồng”;
- người khác clone và dùng lại.

Luồng:

```text
User tạo
→ chia sẻ
→ cộng đồng dùng
→ admin feature
→ Post có thêm nội dung
```

Đây là một cách tạo UGC tự nhiên cho CDP.

---

# Post không phụ thuộc vào sự kiện

Post động phải dùng được cho nhiều ngữ cảnh.

Ví dụ:

| Post | Khung thời gian | Hành động |
|---|---|---|
| Thành Tuyên 2026 | lịch lễ hội | lập lịch đi hội |
| Cuối tuần này ở Tuyên Quang | thứ 7–CN | tạo ngày đi chơi |
| Nghỉ lễ 2/9 | vài ngày | tạo chuyến |
| Tối nay ăn gì | một buổi tối | ăn + cafe |
| Họp lớp 20 người | một tối | ăn + hát + cafe |
| Đưa trẻ đi chơi Chủ nhật | sáng–chiều | tạo lịch gia đình |
| Một ngày ở Na Hang | 08:00–20:00 | tạo lộ trình du lịch |
| 5 quán cafe làm việc | không cần timeline | lưu/chọn quán |

Timeline chỉ là một block.

Nó không phải bản chất bắt buộc của Post.

---

# Post Engine dạng block

Mỗi Post có thể cấu thành từ các block:

```text
Hero
Thông báo mới
Timeline
Map
Interactive Plan
Lộ trình mẫu
Địa điểm cộng đồng thêm
Gallery
Ghi chú
Nguồn
CTA
```

Mỗi Post bật/tắt block tùy nội dung.

Ví dụ Thành Tuyên:

```text
Hero
→ Thông báo mới
→ Timeline
→ Interactive Plan
→ Lộ trình mẫu
→ Map
→ Địa điểm
→ Nguồn
```

Ví dụ “Cuối tuần đi đâu”:

```text
Hero
→ Gợi ý
→ Interactive Plan
→ Lộ trình cộng đồng
```

Ví dụ “5 quán cafe làm việc”:

```text
Hero
→ Danh sách địa điểm
→ Thêm vào Sổ
→ Tạo Lộ trình
```

---

# Data Model gợi ý

## Post

```text
id
slug
title
subtitle
status
cover_image
start_at
end_at
timezone
post_type
created_by
published_at
updated_at
```

## PostBlock

```text
id
post_id
type
position
config_json
is_enabled
```

## Event

```text
id
post_id
title
start_at
end_at
timezone
location_id
location_text
description
event_type
verification_status
source_id
source_url
source_updated_at
updated_at
```

## Route

```text
id
user_id
title
description
status
transport_mode
is_public
is_featured
created_at
updated_at
```

## RouteStop

```text
id
route_id
position
place_id
custom_title
planned_at
duration_minutes
note
```

## SharedRouteSnapshot

```text
id
route_id
share_token
snapshot_json
created_by
created_at
expires_at nullable
```

## Source

```text
id
name
url
priority
trust_level
last_checked_at
last_changed_at
```

## SuggestedUpdate

```text
id
post_id
event_id
source_id
old_data_json
new_data_json
diff_json
status
created_at
reviewed_by
reviewed_at
```

Status:

```text
pending
approved
rejected
edited
```

---

# UX tổng thể của Post Thành Tuyên

## Phần 1 — Hero

**Lễ hội Thành Tuyên 2026**

19–25/9/2026  
Cập nhật gần nhất: 10/9

CTA:

**Xem sự kiện sắp diễn ra**

---

## Phần 2 — Sắp diễn ra gần nhất

Ví dụ:

**Tối mai · 11/9**

### Thi mô hình đèn Trung thu phường Nông Tiến

Nhà khách Minh Thanh, TDP 9

Chấm mô hình → văn nghệ → diễu đèn

---

## Phần 3 — Timeline

Các sự kiện tự đổi trạng thái màu.

Mốc chính như Đêm hội 20/9 có visual mạnh hơn.

Mốc đã qua thu gọn.

---

## Phần 4 — Tạo kế hoạch của bạn

Ví dụ:

**Đi Đêm hội 20/9**

```text
17:30  + Chọn chỗ ăn
19:00  + Chọn chỗ gửi xe
20:00  Đêm hội Thành Tuyên
22:15  + Chọn quán cafe
23:30  + Chọn chỗ ngủ
```

CTA:

**Tạo lộ trình**

---

## Phần 5 — Lộ trình mẫu

### Gợi ý từ Chạm Địa Phương

**Ăn tối → gửi xe → xem Đêm hội → cafe**

CTA:

**Dùng lộ trình này**

---

## Phần 6 — Gợi ý cộng đồng

Các route được admin feature.

Ví dụ:

- Đi cùng trẻ nhỏ;
- Đi nhóm bạn;
- Đi từ ngoài tỉnh;
- Không muốn lái xe vào trung tâm;
- Đi và về trong tối.

---

## Phần 7 — Google Maps

Hiển thị:

- khoảng cách;
- thời gian;
- từng chặng.

CTA:

**Mở trên Google Maps**

CDP không xử lý điều hướng turn-by-turn trong giai đoạn đầu.

---

# Vòng lặp sản phẩm

```text
Post
↓
Người dùng xem nội dung
↓
Chọn một sự kiện / nhu cầu
↓
Thêm địa điểm
↓
Tạo Lộ trình
↓
Lưu hoặc chia sẻ
↓
Người khác clone
↓
Tạo thêm tương tác với địa điểm
↓
CDP có thêm dữ liệu
↓
Post ngày càng có nhiều nội dung cộng đồng
```

Đây là vòng lặp nên hướng tới.

---

# Thứ tự triển khai đề xuất

## Phase 1

1. Chuyển Post Thành Tuyên sang dữ liệu Event.
2. Timeline tự đổi trạng thái màu.
3. Sửa title/card trang chủ.
4. Cập nhật các lịch mới và loại lịch cũ.
5. Thêm block Interactive Plan.
6. Cho user chọn địa điểm và tạo Lộ trình.
7. Tách entity Lộ trình khỏi Sổ.
8. Chia sẻ Lộ trình bằng snapshot.
9. Thêm nút mở trên Google Maps.

## Phase 2

1. Source Registry.
2. Content Monitor.
3. AI trích xuất update.
4. Admin review diff.
5. Publish dữ liệu sau một click.
6. Gợi ý Lộ trình mẫu của CDP.
7. Clone Lộ trình mẫu.
8. Feature Lộ trình cộng đồng.

## Phase 3

1. Google Routes API.
2. Hiển thị route trực tiếp trong CDP.
3. Tính quãng đường và thời gian.
4. Tối ưu waypoint nếu cần.
5. Tạo Post Engine dạng block cho mọi loại nội dung.
6. Mở rộng UGC.

---

# Prompt triển khai tổng hợp

Dùng prompt dưới đây khi giao cho AI/coder triển khai.

---

## PROMPT

Bạn đang làm việc trên dự án **CDP – chamdiaphuong.io.vn**.

Hãy nâng cấp hệ thống Post và Lộ trình theo định hướng dưới đây. Case đầu tiên để triển khai và kiểm thử là:

```text
https://chamdiaphuong.io.vn/le-hoi-thanh-tuyen
```

Mục tiêu không phải chỉ sửa một bài Trung thu. Hãy thiết kế sao cho kiến trúc có thể tái sử dụng cho các Post khác như:

- sự kiện;
- cuối tuần đi chơi;
- nghỉ lễ;
- họp bạn bè;
- chuyến đi trong ngày;
- lịch gia đình;
- danh sách địa điểm;
- kế hoạch có hoặc không có timeline.

### 1. Dynamic Timeline

Chuyển lịch trong Post từ prose tĩnh sang dữ liệu Event có cấu trúc.

Mỗi Event tối thiểu có:

```text
title
start_at
end_at
timezone
location
description
source
source_url
verification_status
source_updated_at
```

Dùng timezone:

```text
Asia/Ho_Chi_Minh
```

Frontend phải tự tính trạng thái:

```text
now > end_at
→ Đã diễn ra

start_at <= now <= end_at
→ Đang diễn ra

now < start_at
→ Sắp tới
```

UI:

- Đã diễn ra: nền xám, chữ giảm độ đậm.
- Đang diễn ra: màu nhấn, badge “Đang diễn ra”.
- Sắp tới: nền bình thường.
- Chưa xác nhận: badge “Đang cập nhật”.
- Vừa đổi dữ liệu: badge “Mới cập nhật”.
- Đổi lịch: hiển thị lịch mới và giữ history.
- Hủy: hiển thị rõ “Đã hủy”.

Không cần deploy code mỗi khi thời gian chuyển trạng thái.

Nếu có nhiều mốc đã qua, thu gọn:

```text
✓ X hoạt động đã diễn ra — Xem lại
```

### 2. Sửa card trang chủ

Card hiện tại có nội dung:

```text
Đi Thành Tuyên 20/9?
Chỗ gửi xe, ăn tối, cafe nghỉ chân và chỗ ngủ quanh khu lễ hội →
```

Nội dung này chưa khớp với trang bên trong.

Đổi theo hướng:

```text
Đi Thành Tuyên tháng 9 này?
Xem lịch thi đèn các phường, Đêm hội 20/9 và các hoạt động quanh lễ hội →
```

Hoặc phương án tương đương nhưng phải phản ánh đúng nội dung Post.

### 3. Interactive Plan sau Timeline

Sau Timeline không chỉ hiển thị danh sách địa điểm do admin biên tập.

Tạo block để user tự hoàn thiện kế hoạch:

```text
17:30  Ăn tối       + Chọn chỗ ăn
19:00  Gửi xe       + Chọn chỗ gửi xe
20:00  Đêm hội      Đã thêm
22:15  Cafe          + Chọn quán
Sau đó Ngủ lại      + Chọn chỗ ngủ
```

Khi user chọn địa điểm, dữ liệu này dần hình thành một Route.

Mục tiêu:

```text
Post → chọn → thêm địa điểm → tạo Route
```

### 4. Tách Route khỏi Sổ

Sổ và Route là hai entity độc lập.

Sổ:

- collection địa điểm;
- không bắt buộc thứ tự.

Route:

- danh sách điểm có thứ tự;
- planned_at;
- transport_mode;
- note;
- duration;
- distance;
- tuyến đường.

Không dùng một field trạng thái để biến Sổ thành Route.

### 5. Share Route độc lập

User có thể:

```text
Chia sẻ Route
Lưu Route
Lưu địa điểm vào Sổ
```

Ba hành động độc lập.

Không bắt buộc lưu Route trước khi share.

### 6. Shared Route Snapshot

Khi share Route:

```text
route_123
→ share_ABC
```

`share_ABC` phải chứa snapshot tại thời điểm share.

Nếu owner sửa hoặc xóa Route sau đó, người đã nhận link vẫn xem được snapshot cũ.

Không để share link phụ thuộc hoàn toàn vào state hiện tại của Route/Sổ.

### 7. Google Maps

Phase đầu:

- tạo Google Maps URL từ danh sách waypoint;
- có nút “Mở trên Google Maps”.

Trong CDP hiển thị từng chặng:

```text
A → B
1,8 km · khoảng 6 phút

B → C
2,1 km · khoảng 7 phút
```

và tổng:

```text
4,6 km · khoảng 22 phút
```

Phase sau mới tích hợp Routes API để lấy:

- distance;
- duration;
- legs;
- waypoint;
- polyline;
- navigation instructions.

Không xây turn-by-turn navigation trong CDP ở giai đoạn đầu.

Nguyên tắc:

```text
CDP lo kế hoạch.
Google lo đường.
```

### 8. Admin dùng cùng flow với User

Không tạo một hệ thống riêng biệt nếu không có lý do.

Admin có thể tạo Route bằng chính flow của user.

Ví dụ:

```text
Lịch đi Thành Tuyên tối 20/9 của Chạm Địa Phương
```

Sau đó đánh dấu:

```text
is_featured = true
featured_source = cdp
```

Post hiển thị:

```text
Gợi ý từ Chạm Địa Phương
Ăn tối → gửi xe → xem Đêm hội → cafe
[Dùng lộ trình này]
```

Khi user bấm “Dùng lộ trình này”:

- clone Route;
- gán ownership cho user;
- user sửa thoải mái;
- không ảnh hưởng Route mẫu.

### 9. UGC

Cho phép admin feature Route của user.

Hiển thị:

```text
Gợi ý từ cộng đồng
```

Không clone trực tiếp object gốc khi user khác muốn dùng.

Tạo bản copy.

### 10. Post Engine dạng block

Thiết kế Post thành các block có thể bật/tắt:

```text
Hero
LatestUpdate
Timeline
Map
InteractivePlan
FeaturedRoutes
CommunityRoutes
Places
Gallery
Notes
Sources
CTA
```

Không bắt buộc mọi Post có Timeline.

Ví dụ:

Thành Tuyên:

```text
Hero
LatestUpdate
Timeline
InteractivePlan
FeaturedRoutes
Map
Places
Sources
```

Cuối tuần đi đâu:

```text
Hero
Suggestions
InteractivePlan
CommunityRoutes
```

Danh sách cafe:

```text
Hero
Places
SaveToCollection
CreateRoute
```

### 11. Content Monitor

Tạo hệ thống theo dõi nguồn.

Luồng:

```text
Source
→ Monitor
→ Detect change
→ AI extract
→ Compare current CDP data
→ SuggestedUpdate
→ Admin review
→ Publish
```

Không tự publish.

Tạo Source Registry:

```text
id
name
url
priority
trust_level
last_checked_at
last_changed_at
```

Tạo SuggestedUpdate:

```text
id
post_id
event_id
source_id
old_data_json
new_data_json
diff_json
status
created_at
reviewed_at
```

Admin UI ví dụ:

```text
Có cập nhật Thành Tuyên

An Tường đổi lịch thi

Cũ:
12/9 — chưa xác nhận

Mới:
17:00 ngày 16/9

Nguồn:
UBND phường An Tường

[Xem nguồn] [Sửa] [Bỏ qua] [Duyệt cập nhật]
```

Khi admin bấm duyệt:

- update DB/CMS;
- publish dữ liệu;
- không rebuild/deploy code nếu kiến trúc hiện tại cho phép.

### 12. Data model

Đề xuất tối thiểu:

```text
Post
PostBlock
Event
Route
RouteStop
SharedRouteSnapshot
Source
SuggestedUpdate
```

Ưu tiên thiết kế migration ít phá vỡ hệ thống hiện tại.

### 13. Case Thành Tuyên

Dùng bài Thành Tuyên làm test đầu tiên.

Các mục cần đạt:

- timeline tự đổi trạng thái;
- lịch cũ có thể được thay bằng lịch mới;
- card trang chủ khớp nội dung;
- user có thể bắt đầu Route ngay từ Post;
- admin có thể tạo Route mẫu;
- Route có thể share độc lập;
- share dùng snapshot;
- có Google Maps URL;
- kiến trúc Post không phụ thuộc Trung thu.

### 14. Yêu cầu khi triển khai

Trước khi code:

1. audit codebase hiện tại;
2. xác định model Sổ, Post, địa điểm và share link đang dùng;
3. mô tả migration cần làm;
4. tránh duplicate entity;
5. ưu tiên tái sử dụng component hiện có;
6. giữ backward compatibility nếu khả thi;
7. phân biệt rõ data change và code deploy;
8. không hard-code logic riêng cho Trung thu.

Sau audit, hãy trả về:

```text
A. Current architecture
B. Problems found
C. Proposed schema
D. UX flow
E. Migration plan
F. Files/modules to modify
G. Implementation order
H. Risks
I. Code changes
J. Test cases
```

Test tối thiểu:

- Event tự đổi từ upcoming → live → past.
- Timezone Việt Nam hoạt động đúng.
- Event đổi lịch không mất history.
- Share Route vẫn xem được sau khi owner sửa Route.
- Clone Route không sửa bản gốc.
- Route mở đúng thứ tự waypoint trên Google Maps.
- Post không có Timeline vẫn render bình thường.
- Admin approve SuggestedUpdate thì Post cập nhật.
- Reject SuggestedUpdate không ảnh hưởng dữ liệu đang publish.
- Các Post cũ không bị vỡ.

Không xây giải pháp chỉ dùng được cho bài Thành Tuyên.

Mục tiêu cuối cùng là một **Post Engine + Route Engine** dùng chung cho toàn bộ CDP.

---

# BỔ SUNG 11/09/2026 — Timeline, Event Monitor và Content Inbox

Phần này bổ sung trực tiếp cho kế hoạch P1–P8 và Prompt triển khai ở trên.

## 1. Case lỗi thực tế: Nông Tiến tối 11/9 bị lọt khỏi timeline

Thông tin chính thức đã có về **Đêm hội Trung thu phường Nông Tiến — tối 11/9/2026**, tại Nhà khách Minh Thanh, TDP 9, có chấm mô hình đèn, văn nghệ, diễn diễu và chọn 5 mô hình tham dự Đêm hội Thành Tuyên.

Việc event này bị lọt khỏi timeline cho thấy quy trình hiện tại đang phụ thuộc vào từng lần tìm tin, chưa có dataset event trung tâm và chưa có cơ chế đối chiếu tin mới với timeline hiện tại.

Giải pháp chuẩn:

```text
Nguồn
→ Event Monitor
→ Event Candidate
→ Compare với Event DB
→ Suggested Update
→ Admin review
→ Publish
```

Không dựa vào việc tìm thủ công từng lần.

## 2. Tách hai loại trạng thái

### Trạng thái thời gian

```text
TODAY
LIVE
UPCOMING
PAST
```

Gợi ý UI:

- TODAY: ưu tiên lên đầu, badge “Hôm nay”.
- LIVE: màu nhấn, badge “Đang diễn ra”.
- UPCOMING: nền bình thường.
- PAST: nền xám, có thể thu gọn.

Nếu event chỉ có ngày hoặc mô tả kiểu “tối”, “sáng”, “chiều”, không được tự suy đoán giờ. Nên có `time_precision`:

```text
exact
morning
afternoon
evening
day
unknown
```

Ví dụ Nông Tiến:

```text
date: 2026-09-11
time_precision: evening
display_time: "Tối 11/9"
```

### Trạng thái xác minh

```text
CONFIRMED
TENTATIVE
UPDATING
CHANGED
CANCELLED
CONFLICT
```

- `CONFIRMED`: nguồn chính thức mới và rõ.
- `TENTATIVE`: chính nguồn dùng “dự kiến”, “kế hoạch”, “tạm thời”.
- `UPDATING`: biết event tồn tại nhưng chưa đủ ngày/giờ.
- `CHANGED`: nguồn mới sửa thông tin cũ.
- `CANCELLED`: có xác nhận hủy/hoãn.
- `CONFLICT`: có các nguồn đáng tin mâu thuẫn.

Không dùng một field status chung cho cả hai loại trạng thái.

## 3. Một ngày = một khung

Timeline không nên render mỗi activity thành một card độc lập nếu cùng ngày.

Ví dụ 20/9 nên là một `DateCard` duy nhất:

```text
20/9 · Chủ nhật
────────────────────────
Sáng
Hoạt động A
────────────────────────
20:00–23:00
Đêm hội Thành Tuyên
[ SỰ KIỆN CHÍNH ]
────────────────────────
Hoạt động khác trong ngày
...
```

Frontend tự group Event theo local date `Asia/Ho_Chi_Minh`.

Các event kéo dài nhiều ngày như `19–25/9` có thể render thành `RangeCard` riêng.

## 4. Quy tắc tag “Dự kiến”

Chỉ dùng `Dự kiến` khi chính nguồn nói “dự kiến”, “kế hoạch”, “tạm thời” hoặc tương đương.

Nếu biết có event nhưng chưa rõ ngày:

```text
Đang cập nhật lịch
```

Nếu nguồn mâu thuẫn:

```text
Đang xác minh ngày
```

Nếu lịch mới thay lịch cũ:

```text
Có thay đổi
```

Ví dụ Minh Xuân không nên giữ `Dự kiến · 12/9` nếu nguồn mới không còn xác nhận ngày này.

## 5. CDP Event Monitor

Tạo module/service riêng:

```text
CDP Event Monitor
```

Mục tiêu:

- theo dõi các nguồn;
- phát hiện event mới;
- phát hiện event bị sửa;
- phát hiện event hủy;
- phát hiện nguồn mâu thuẫn;
- phát hiện timeline đang thiếu;
- phát hiện thông tin đã cũ.

Luồng:

```text
Nguồn tự động
        ↓
Crawler / Search / Social Collectors
        ↓
Raw Inbox
        ↓
AI classify + extract
        ↓
Deduplicate
        ↓
Compare Event DB
        ↓
Suggested Update
        ↓
Admin Review
        ↓
Publish
```

Nguồn tự động và nguồn admin paste tay phải đi chung một pipeline.

## 6. Content Inbox trong Admin

Thêm menu:

```text
Content Inbox
```

Ô nhập chính:

```text
[ Dán URL hoặc nội dung mới... ] [ Phân tích ]
```

Hỗ trợ:

- một URL;
- nhiều URL;
- text thuần;
- đoạn copy từ Facebook;
- nội dung thông báo;
- bài báo;
- forum;
- website.

Sau khi paste, hệ thống tự:

1. nhận dạng URL/text;
2. lấy nội dung;
3. xác định nguồn;
4. xác định địa phương;
5. xác định chủ đề;
6. tìm Post liên quan;
7. extract Event;
8. so sánh Event hiện tại;
9. xác định loại thay đổi;
10. tạo SuggestedUpdate.

## 7. Preview AI sau khi paste

Ví dụ bài Nông Tiến:

```text
Đã nhận dạng

Loại: Sự kiện
Chủ đề: Trung thu / Lễ hội Thành Tuyên
Khu vực: Nông Tiến, Tuyên Quang
Post phù hợp: Lễ hội Thành Tuyên 2026

Phát hiện Event mới:
Đêm hội Trung thu phường Nông Tiến

Ngày: 11/9/2026
Giờ: Chưa nêu cụ thể
Địa điểm: Nhà khách Minh Thanh, TDP 9
Hoạt động:
- Chấm mô hình đèn
- Văn nghệ
- Diễn diễu

Thông tin khác:
Chọn 5 mô hình tham dự Đêm hội Thành Tuyên

Độ tin cậy: Cao
Nguồn: UBND phường Nông Tiến
```

CTA:

```text
[Bỏ qua] [Chỉnh sửa] [Thêm vào Draft] [Public]
```

## 8. Không auto-public ngay sau paste

Flow ưu tiên:

```text
Paste
→ AI xử lý
→ Preview
→ Admin bấm Public
```

Không dùng:

```text
Paste
→ tự public ngay
```

Một click preview giúp tránh các lỗi như bài cũ, repost, địa danh trùng tên hoặc nguồn chỉ ghi “dự kiến”.

## 9. Phân tầng nguồn

### Tier 1 — Official

- UBND tỉnh.
- UBND phường/xã.
- sở, ban, ngành.
- ban tổ chức.
- báo/cổng thông tin chính thức.

### Tier 2 — Press / trusted local source

- báo điện tử;
- fanpage đơn vị;
- trang du lịch địa phương;
- đơn vị tổ chức.

### Tier 3 — Social / community

- Facebook Group;
- fanpage tổ dân phố;
- TikTok;
- Threads;
- diễn đàn;
- bài cá nhân.

Tier 3 chủ yếu dùng để phát hiện sớm, không tự nâng event thành `CONFIRMED` nếu chưa có xác minh thêm.

## 10. Social collector và fallback manual paste

Không phụ thuộc hoàn toàn vào crawler HTML.

Thiết kế collector:

```text
Web Search Connector
RSS Connector
Website Crawler
Facebook/API hoặc public-page collector
YouTube Search
Social Search Provider
Manual Paste
```

Nếu social network chặn crawler/API:

```text
Copy link
→ Paste Content Inbox
→ AI xử lý
```

Manual paste là flow chính thức.

## 11. Schedule

Phase đầu chạy:

```text
08:00
16:00
```

mỗi ngày.

Không báo nếu không có thay đổi.

Sau này có thể dùng adaptive polling gần ngày event, nhưng chưa cần ở Phase đầu.

## 12. Các loại thay đổi phải phát hiện

```text
NEW_EVENT
EVENT_UPDATED
EVENT_CANCELLED
CONFLICTING_INFORMATION
```

Ngoài ra phải có:

```text
MISSING_EVENT_CHECK
STALE_INFORMATION_CHECK
```

## 13. Missing-event check

Mỗi lần monitor chạy, kiểm tra các Event Candidate trong 7 ngày tới.

Nếu candidate liên quan Post nhưng chưa có Event tương ứng:

```text
⚠ Timeline Thành Tuyên có thể đang thiếu hoạt động
```

Case regression bắt buộc:

```text
Nông Tiến — 11/9/2026
```

Nếu source đã được ingest nhưng timeline không có Event, hệ thống phải tạo cảnh báo.

## 14. Stale-information check

Cảnh báo khi:

- tentative date đã qua;
- source quá cũ;
- event sắp diễn ra nhưng chưa xác minh;
- Post vẫn giữ data cũ sau khi có nguồn mới.

Ví dụ:

```text
⚠ Thông tin có thể đã cũ

Minh Xuân
Dự kiến 12/9

Ngày hiện tại: 13/9
Chưa có nguồn xác nhận mới
```

CTA:

```text
[Tìm nguồn mới]
[Đổi thành Đang cập nhật]
[Bỏ qua]
```

## 15. Deduplication

Một event có thể xuất hiện ở nhiều nguồn.

Không tạo nhiều Event trùng.

Tạo `EventCandidate` và attach nhiều source.

Ví dụ:

```text
Đêm hội Trung thu Nông Tiến
3 nguồn liên quan
```

Signal để match:

- normalized title;
- local date;
- location;
- entity names;
- semantic similarity.

## 16. Confidence Score

Có thể dùng điểm hỗ trợ admin, ví dụ:

```text
Official government source: +50
Local newspaper: +30
Official social account: +30
Community source: +10
Exact date: +10
Exact venue: +10
Multiple independent sources: +20
Conflict with official source: -50
Old content: -30
```

Mức hiển thị:

```text
80–100 = High
50–79  = Medium
<50    = Low
```

Không dùng score để auto-public trong Phase đầu.

## 17. Content Inbox UI

Tabs:

```text
Mới
Cần duyệt
Mâu thuẫn
Đã đăng
Bỏ qua
```

Ví dụ card:

```text
NEW EVENT · Confidence 96

Đêm hội Trung thu phường Nông Tiến

11/9/2026 · Buổi tối
Nhà khách Minh Thanh, TDP 9

Chấm mô hình
→ Văn nghệ
→ Diễn diễu

Chọn 5 mô hình dự Đêm hội Thành Tuyên

Nguồn:
UBND phường Nông Tiến

Post đề xuất:
Lễ hội Thành Tuyên 2026

[Xem nguồn]
[Bỏ qua]
[Sửa]
[Public]
```

Ví dụ update:

```text
UPDATE DETECTED

An Tường

Cũ:
12/9 · Dự kiến

Mới:
16/9 · 17:00

[Xem diff]
[Public thay đổi]
```

## 18. Audit Log + Rollback

Mỗi lần Public phải lưu:

```text
published_by
published_at
source_id
suggested_update_id
old_data_json
new_data_json
admin_edits_json
```

Cho phép:

```text
Rollback
```

## 19. Kiến trúc module đề xuất

### Module A — Event Monitor

- schedule 2 lần/ngày;
- fetch/search;
- social/public collection;
- missing check;
- stale check;
- conflict detection.

### Module B — Content Inbox

- bot đẩy tin vào;
- admin paste tay;
- AI classify;
- AI extract;
- deduplicate;
- compare.

### Module C — Publish Review

- preview;
- edit;
- approve;
- publish;
- audit log;
- rollback.

## 20. Data Model bổ sung

### EventCandidate

```text
id
canonical_title
normalized_date
normalized_location
related_post_id
status
confidence_score
created_at
updated_at
```

### EventCandidateSource

```text
id
event_candidate_id
source_id
source_url
raw_title
raw_text
published_at
fetched_at
```

### RawInboxItem

```text
id
input_type
input_value
source_url
raw_content
detected_topic
detected_location
processing_status
created_by
created_at
```

### EventRevision

```text
id
event_id
old_data_json
new_data_json
change_type
source_id
approved_by
approved_at
created_at
```

### MonitorRun

```text
id
started_at
finished_at
status
sources_checked
items_found
new_candidates
updates_found
conflicts_found
```

---

# PROMPT BỔ SUNG — Event Monitor + Content Inbox + Timeline Grouping

Hãy nối các yêu cầu dưới đây vào prompt triển khai tổng hợp của dự án CDP.

## A. Timeline grouping

Timeline không được render mỗi Event thành một card độc lập nếu cùng ngày.

Frontend phải group Event theo local date trong timezone:

```text
Asia/Ho_Chi_Minh
```

Một ngày chỉ có một `DateCard`; bên trong có nhiều Event/Activity.

Event range như `19–25/9` có thể render thành `RangeCard`.

## B. Tách time status và verification status

Tạo ít nhất:

```text
time_status
verification_status
```

`time_status`:

```text
today
live
upcoming
past
```

`verification_status`:

```text
confirmed
tentative
updating
changed
cancelled
conflict
```

Không auto suy đoán giờ khi nguồn chỉ ghi “tối”, “sáng”, “chiều”, “trong ngày”.

Tạo thêm:

```text
time_precision
```

với các giá trị:

```text
exact
morning
afternoon
evening
day
unknown
```

## C. Today priority

Event hôm nay phải được ưu tiên.

Có thể có block:

```text
Hôm nay có gì?
```

Nếu Event hôm nay chưa có giờ chính xác vẫn phải hiển thị.

## D. Event Monitor

Tạo service chạy mặc định lúc:

```text
08:00
16:00
```

mỗi ngày.

Event Monitor phải phát hiện:

```text
NEW_EVENT
EVENT_UPDATED
EVENT_CANCELLED
CONFLICTING_INFORMATION
MISSING_EVENT_CHECK
STALE_INFORMATION_CHECK
```

## E. Missing Event Check

Kiểm tra Event Candidate trong 7 ngày tới.

Nếu candidate liên quan Post nhưng chưa có Event tương ứng, tạo missing alert.

Case test bắt buộc:

```text
Nông Tiến — 11/9/2026
```

Nếu source đã được ingest nhưng timeline không có Event, hệ thống phải cảnh báo.

## F. Stale Check

Cảnh báo các Event:

- tentative date đã qua;
- source quá cũ;
- event sắp diễn ra nhưng chưa xác minh;
- source mới conflict với data hiện tại.

## G. Content Inbox

Tạo Admin page:

```text
/admin/content-inbox
```

hoặc route tương đương.

Input phải nhận:

```text
URL
multiple URLs
plain text
copied social content
```

Sau khi submit:

1. ingest;
2. classify;
3. extract;
4. normalize;
5. detect Post;
6. deduplicate;
7. compare;
8. preview.

## H. Manual paste và auto collector dùng cùng pipeline

Cả scheduled collector và manual paste đều tạo `RawInboxItem` rồi chạy cùng service xử lý.

Không tạo hai logic riêng biệt.

## I. Source tier

Mỗi source có:

```text
tier
trust_level
```

Tier:

```text
1 = official
2 = press / trusted local source
3 = social / community
```

Tier 3 không tự chuyển Event sang `confirmed` nếu chưa có xác minh thêm.

## J. Deduplication

Không tạo Event mới nếu content mới chỉ là source mới cho cùng Event.

Dùng các signal:

- normalized title;
- local date;
- location;
- entity names;
- semantic similarity.

Nếu match:

```text
attach source
```

Nếu không:

```text
create EventCandidate
```

## K. Suggested Update

Preview phải hiển thị:

```text
old value
new value
source
confidence
reason
```

Ví dụ:

```text
Cũ:
12/9 · tentative

Mới:
16/9 · 17:00

Nguồn:
UBND phường An Tường
```

## L. Public flow

Không auto-public.

Flow:

```text
AI processing
→ preview
→ admin approve
→ publish
```

CTA:

```text
Bỏ qua
Sửa
Draft
Public
```

## M. Audit + rollback

Mọi publish phải lưu EventRevision và có khả năng rollback.

## N. Test cases bổ sung

Bắt buộc test:

1. Hai Event cùng ngày render trong một DateCard.
2. Event hôm nay được ưu tiên.
3. Event chỉ có “tối” không bị gán giờ giả.
4. `time_status` và `verification_status` hoạt động độc lập.
5. Tier 3 source không tự chuyển Event sang confirmed.
6. Hai source nói cùng Event không tạo duplicate Event.
7. Nguồn mới có ngày khác tạo SuggestedUpdate.
8. Hai official source mâu thuẫn tạo `conflict`.
9. Event Candidate 7 ngày tới chưa có trong Post tạo missing alert.
10. Tentative date đã qua tạo stale alert.
11. Manual paste và scheduled collector dùng cùng data pipeline.
12. Admin bấm Public cập nhật Event và Timeline ngay.
13. Reject không thay đổi production data.
14. Rollback khôi phục revision trước.
15. Nông Tiến 11/9 là regression test cho missing-event bug.

## O. Không hard-code cho Trung thu

Các module sau phải dùng được cho mọi Post động của CDP:

```text
Event Monitor
Content Inbox
Suggested Update
Date grouping
Verification status
Audit log
```

Bao gồm:

- hội chợ;
- festival;
- khai trương;
- giải thể thao;
- concert;
- lễ hội địa phương;
- cuối tuần;
- lịch du lịch;
- các Post động khác.
