# 12-NOTE-03 — CDP Game Layer + MVP1 Thành Tuyên 2026

**Trạng thái:** Duyệt triển khai thử nghiệm  
**Ngày:** 14/09/2026  
**Phạm vi:** Chạm địa phương (CDP)

---

## 1. Duyệt MVP1 — Thành Tuyên 2026

Thử nghiệm game layer đầu tiên trên CDP bằng **Trung thu / Lễ hội Thành Tuyên 2026**.

### Mục tiêu

Không làm một minigame tách rời. Dùng chính dữ liệu lễ hội để thử cơ chế:

**tò mò → tìm → ghi nhận → sưu tầm → hoàn thành → đóng góp thêm dữ liệu → xuất hiện mục tiêu mới**

Ưu tiên **lượng đóng góp và hành vi sử dụng trước**, chất lượng/xác minh sẽ tăng dần sau.

### Concept

**Thành Tuyên 2026 trên Chạm địa phương**

Các lớp chính:

- **Săn đèn Thành Tuyên:** mỗi mô hình đèn là một object có thể tìm/gặp.
- **Bộ sưu tập của tôi:** hiển thị `đã gặp / tổng số đã biết`.
- **Cộng đồng cùng tìm:** hiển thị `số mô hình CDP đã ghi nhận / tổng hiện biết`.
- **Đèn đang ở đâu?:** user báo vừa nhìn thấy mô hình tại vị trí/thời gian hiện tại.
- **Ai tìm thấy trước?:** lưu người ghi nhận đầu tiên cho từng mô hình.

### Scope MVP1

P0:

1. Có hồ sơ riêng cho từng mô hình đèn.
2. User có trạng thái `Đã gặp / Chưa gặp`.
3. Có progress cá nhân: `x / tổng`.
4. Có progress cộng đồng: `đã ghi nhận x mô hình`.
5. User có CTA **“Bạn vừa thấy mô hình nào?”**.
6. Ghi nhận sighting gồm tối thiểu:
   - `model_id`
   - `user_id`
   - `timestamp`
   - `location`
   - ảnh nếu user cung cấp.
7. Hiển thị người ghi nhận đầu tiên khi dữ liệu đủ tin cậy.

P1 sau khi P0 chạy ổn:

- bản đồ các sighting gần đây;
- collection theo phường;
- mô hình chưa được cộng đồng tìm thấy;
- quest từ dữ liệu thiếu;
- xác minh chéo;
- mô hình hiếm dựa trên số người gặp;
- collection riêng cho nhóm mô hình được chọn vào đêm chính.

### Nguyên tắc dữ liệu

- Không hard-code tổng số mô hình nếu nguồn chính thức còn thay đổi.
- Tổng số phải có `source`, `updated_at`, trạng thái xác minh/version.
- Một mô hình có thể có nhiều sighting theo thời gian.
- Không coi một sighting duy nhất là vị trí hiện tại tuyệt đối.
- Dữ liệu cộng đồng có thể vào nhanh trước, sau đó mới nâng độ tin cậy bằng xác minh chéo.

---

# 2. CDP Game Layer — khung tổng quát

## 2.1. Tư tưởng

CDP **không có một game duy nhất**.

Game là một lớp phủ lên dữ liệu và hoạt động thật trên CDP. Hệ thống phải có khả năng **tự sinh nhiều game liên tục** từ địa điểm, khu vực, category, sự kiện, ảnh, người dùng, dữ liệu thiếu, dữ liệu cũ và hành vi cộng đồng.

Game không nên phụ thuộc vào tiền, quà hoặc coin.

Động lực chính:

1. **Tò mò:** còn gì chưa biết?
2. **Hoàn thành:** còn thiếu bao nhiêu?
3. **Sưu tầm:** tôi đã có những gì?
4. **Khám phá đầu tiên:** tôi có thể là người đầu tiên không?
5. **Tiến bộ:** bản đồ/hiểu biết của tôi đang lớn lên.
6. **Làm chủ:** tôi hiểu khu vực/chủ đề nào nhất?
7. **Đóng góp cộng đồng:** mọi người đang cùng hoàn thiện thứ gì?
8. **Danh tính:** lịch sử sử dụng CDP nói lên tôi là người thế nào.

---

## 2.2. Quy tắc cốt lõi

> **Mọi khoảng trống trong dữ liệu có thể trở thành một nhiệm vụ.**

> **Mọi dữ liệu đã có có thể trở thành thứ để tìm, mở, sưu tầm, hoàn thành, xác minh hoặc nối sang mục tiêu tiếp theo.**

Game phải sinh từ **data model**, không phải từ một module minigame độc lập.

---

## 2.3. Object nào có thể sinh game?

### Địa điểm

Có thể sinh:

- phát hiện đầu tiên;
- đã đến/chưa đến;
- hoàn thiện hồ sơ;
- ảnh còn thiếu;
- xác minh thông tin;
- thông tin bí mật/mách nhỏ;
- lịch sử thay đổi;
- collection theo loại địa điểm.

### Khu vực địa lý

Có thể sinh:

- `% đã mở`;
- Fog of War;
- vùng còn thiếu dữ liệu;
- phủ kín phường/xã/huyện;
- Local Expert;
- nhiệm vụ cộng đồng theo địa bàn.

### Category / chủ đề

Có thể sinh:

- collection;
- checklist;
- mystery item;
- hunt;
- mastery;
- collection ẩn.

### Sự kiện

Có thể sinh:

- seasonal collection;
- đối tượng đang xuất hiện ở đâu;
- quest theo thời gian thực;
- community progress;
- before/during/after event;
- season history.

### Ảnh / tư liệu

Có thể sinh:

- đoán địa điểm;
- chụp lại góc cũ;
- trước & nay;
- ảnh chưa xác định;
- mở khóa lịch sử;
- collection theo thời gian/chủ đề.

### User

Có thể sinh:

- bản đồ cá nhân;
- vùng hiểu biết;
- collection;
- first discovery;
- role/danh tính;
- lịch sử theo năm;
- streak hoặc progression nếu phù hợp.

### Dữ liệu thiếu

Tự sinh quest:

- thiếu ảnh;
- thiếu vị trí;
- thiếu giờ mở cửa;
- thiếu category;
- thiếu mô tả;
- thiếu giá/menu;
- chưa đủ người xác minh.

### Dữ liệu cũ/nghi vấn

Tự sinh quest:

- còn hoạt động không?
- giờ mở cửa còn đúng?
- địa điểm có đổi tên?
- ảnh hiện tại đã khác?
- thông tin nào cần xác minh lại?

---

## 2.4. Các form game chuẩn

Game engine nên hỗ trợ các form cơ bản sau:

### A. Completion

`x / y`, `%`, khu vực còn thiếu.

Ví dụ logic:

`collection_progress = completed_objects / known_objects`

### B. Collection

Tập hợp object theo:

- địa lý;
- category;
- chủ đề;
- thời gian;
- event;
- thuộc tính;
- collection ẩn.

### C. Discovery

- object chưa ai ghi nhận;
- first discovery;
- first photo;
- first verification;
- first detail.

### D. Mystery / Curiosity

- object bị ẩn;
- chỉ hiện clue;
- Fog of War;
- nội dung chỉ mở sau khi đạt điều kiện;
- random quest.

### E. Quest

Quest có thể do:

- hệ thống tự sinh từ data gap;
- user khác yêu cầu;
- event sinh;
- khu vực sinh;
- admin tạo thủ công khi cần.

### F. Territory / Mastery

Không phải “sở hữu đất”.

Là mức độ hiểu biết/tham gia:

- Local Expert;
- Street Keeper;
- Category Expert;
- vùng hiểu biết cá nhân.

### G. Community Goal

Cộng đồng cùng hoàn thành:

`progress / target`

Ví dụ:

- hoàn thiện 500 địa điểm;
- xác minh 2.000 thông tin cũ;
- tìm đủ object của một event.

### H. History / Legacy

Lưu dấu vết lâu dài:

- ai ghi nhận đầu tiên;
- ai từng đóng góp;
- object thay đổi theo năm;
- season history;
- bản đồ đời sống của user qua thời gian.

---

## 2.5. Game loop chuẩn

Không thiết kế:

`Game 1 → hết → Game 2`

Mà tạo vòng liên tục:

`thấy thứ chưa biết`
→ `tò mò`
→ `đi tìm / Chạm`
→ `ghi nhận`
→ `collection tăng`
→ `mở thêm object/quest`
→ `phát hiện data gap`
→ `đóng góp`
→ `progress khu vực/cộng đồng tăng`
→ `mở mục tiêu mới`
→ `tiếp tục`

Không có điểm kết thúc cố định.

---

## 2.6. Nguyên tắc tự sinh content

Hệ thống về sau nên có **Game Generator** đọc dữ liệu CDP và sinh candidate game.

Ví dụ rule:

```text
IF category có >= N objects
THEN có thể sinh Collection

IF user đã hoàn thành >= 70% collection
THEN ưu tiên hiển thị phần còn thiếu

IF location chưa có ảnh
THEN sinh Nearby Quest: "Chụp ảnh địa điểm này"

IF data_field quá cũ
THEN sinh Verification Quest

IF object chưa có contributor
THEN đánh dấu Discovery Opportunity

IF một geographic area có coverage thấp
THEN sinh Explore Area / Fog Quest

IF nhiều user cùng đóng góp vào một mục tiêu
THEN sinh Community Goal

IF event có nhiều objects + time window
THEN sinh Seasonal Collection + Live Quest
```

Không phải rule nào sinh ra cũng phải public. Có thể chấm điểm candidate theo:

- mức tò mò;
- khả năng hoàn thành;
- khoảng cách với user;
- độ mới;
- giá trị data thu được;
- số người có thể tham gia;
- mức phù hợp với bối cảnh hiện tại.

---

## 2.7. Ưu tiên mechanic cho CDP

Thứ tự ưu tiên khi phát triển:

1. Completion
2. Curiosity / Mystery
3. Collection
4. First Discovery / dấu vết cá nhân
5. Personal Progress
6. Quest
7. Territory / Mastery
8. Community Goal
9. Puzzle / Treasure Hunt
10. History / Before-After
11. Identity / Role
12. Leaderboard

**Leaderboard không phải lõi.** Chỉ dùng khi thực sự tạo thêm hành vi tốt.

---

## 2.8. Nguyên tắc sản phẩm

- Game phải làm CDP có thêm dữ liệu hoặc làm dữ liệu hữu ích hơn.
- Không thêm game chỉ để tăng thời gian trên màn hình.
- Ưu tiên nhiệm vụ nhỏ, dễ làm ngoài đời.
- Cho user thấy tiến độ rõ ràng.
- Luôn để lại một mục tiêu kế tiếp.
- Một hành động có thể đồng thời đóng góp cho nhiều progress.
- Không bắt user hiểu thuật ngữ game mới dùng được CDP.
- UI nên nói ngôn ngữ đời thường:  
  `Bạn đã gặp 8/20`, `Còn 3 nơi chưa có ảnh`, `Có một nhiệm vụ cách bạn 300 m`.
- Có thể lấy lượng trước; hệ thống uy tín và xác minh chéo sẽ lọc chất dần.
- Game theo mùa phải lưu thành lịch sử, không xóa sau khi event kết thúc.
- Game engine phải tái sử dụng được giữa tỉnh, sự kiện và category.

---

## 3. Ghi chú về trust / invite

Ý tưởng để phát triển riêng:

**User 1 mời User 2 bằng link giới thiệu → User 2 có thể nhận mức trust khởi điểm cao hơn một chút. Nếu User 2 về sau đóng góp tốt và được xác minh, User 1 cũng tăng reputation.**

Đây có thể là một dạng **xác minh chéo theo mạng giới thiệu**.

Cần thiết kế chống:

- tự tạo tài khoản;
- vòng mời chéo;
- farm reputation;
- một user xấu kéo trust của cả cụm.

Không đưa vào MVP1 Thành Tuyên nếu chưa có trust model rõ ràng.

---

## 4. Kết luận triển khai

**MVP1 Thành Tuyên 2026 được duyệt làm pilot đầu tiên.**

Mục tiêu của pilot không chỉ là tạo một game Trung thu.

Mục tiêu lớn hơn là kiểm tra xem kiến trúc CDP có thể vận hành theo nguyên tắc:

> **Data sinh game → game sinh hành vi → hành vi sinh thêm data → data mới lại sinh game.**

Nếu vòng này hoạt động, cùng một game engine có thể dùng tiếp cho địa điểm thường ngày, lễ hội, chợ phiên, mùa hoa, tuyến du lịch, ảnh địa phương, lịch sử đô thị và các chủ đề mới mà không phải xây lại từ đầu.
