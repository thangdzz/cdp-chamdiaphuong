# SPEC — Chặng 2: Câu hỏi bấm chọn + đồng thuận

> Đọc kèm [ARCHITECTURE.md](ARCHITECTURE.md) và [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md)
> §4–6 (nguyên tắc) và §10 (cách tính điểm). Code làm bên Antigravity, trình kế hoạch trước.
>
> **Đây là chặng nặng nhất và quan trọng nhất về mặt kỹ thuật.** Nó tạo ra cỗ máy gom dữ
> liệu cho toàn bộ dự án — Chặng 3, 5 đều xây trên cấu trúc dựng ở đây.

---

## 1. Làm gì, trong một câu

Hệ thống hỏi khách từng câu một (*"Gửi xe ở đâu?"*), khách chỉ **bấm chọn** đáp án có sẵn;
khi đủ 2 người trả lời giống nhau thì thông tin đó hiện lên thẻ.

**Vì sao quan trọng:** khách không gõ chữ → không có rác → **không cần admin duyệt**. Càng
đẩy nhiều thông tin về dạng bấm chọn, khối lượng việc duyệt càng tiến về 0 dù người dùng
tăng lên.

---

## 2. Bộ câu hỏi

Định nghĩa trong file mới `lib/questions.js`, dạng hằng số — thêm/bớt câu sau này chỉ sửa
một chỗ.

### 2.1 Dùng chung mọi loại địa điểm

| id | Câu hỏi | Kiểu | Lựa chọn |
|---|---|---|---|
| `parking` | Gửi xe ở đâu? | 1 đáp án | `front` Trước cửa · `sidewalk` Vỉa hè cạnh quán · `own_lot` Bãi riêng của quán · `paid_nearby` Bãi gần, mất phí · `hard` Khó gửi, nên đi bộ tới |
| `entrance` | Lối vào thế nào? | 1 đáp án | `street` Mặt đường dễ thấy · `alley` Trong ngõ · `upstairs` Trên tầng · `diff_sign` Biển hiệu khác tên · `shared` Chung cửa với chỗ khác |
| `busy_hours` | Giờ nào đông? | nhiều đáp án | `morning` Sáng 6–8h · `noon` Trưa 11–13h · `afternoon` Chiều · `evening` Tối 18–21h · `late` Khuya · `weekend` Cuối tuần · `festival` Dịp lễ hội |
| `payment` | Trả tiền kiểu gì? | nhiều đáp án | `cash` Tiền mặt · `transfer` Chuyển khoản · `qr` Quét QR · `card` Thẻ |

### 2.2 Riêng "Ăn" (`type === "an"`)

| id | Câu hỏi | Kiểu | Lựa chọn |
|---|---|---|---|
| `space` | Không gian thế nào? | 1 đáp án | `indoor` Trong nhà · `outdoor` Ngoài trời · `private_room` Có phòng riêng · `street` Vỉa hè |
| `good_for` | Hợp đi với ai? | nhiều đáp án | `solo` Một mình · `couple` Cặp đôi · `family` Gia đình có trẻ · `group` Nhóm đông · `business` Tiếp khách |
| `amenities_an` | Có gì tiện? | nhiều đáp án | `wifi` Wifi · `aircon` Điều hoà · `kid_chair` Ghế trẻ em |
| `serving_speed` | Ra món nhanh không? | 1 đáp án | `fast` Nhanh · `slow` Phải chờ |

### 2.3 Riêng "Ngủ" (`type === "ngu"`)

| id | Câu hỏi | Kiểu | Lựa chọn |
|---|---|---|---|
| `amenities_ngu` | Phòng có gì? | nhiều đáp án | `elevator` Thang máy · `hot_water` Nước nóng · `aircon` Điều hoà · `balcony` Ban công · `car_park` Chỗ để ô tô · `late_checkin` Nhận khách sau 22h · `pet` Cho mang thú cưng |
| `noise` | Có ồn không? | 1 đáp án | `quiet` Yên tĩnh · `street_noise` Nghe tiếng đường · `morning_noise` Sáng ồn |
| `booking` | Đặt phòng qua đâu? | nhiều đáp án | `phone` Gọi điện · `zalo` Zalo · `facebook` Facebook · `walkin` Đến thẳng |

### 2.4 Gõ có điều kiện

Chỉ hiện khi lựa chọn cần làm rõ. Đây là **hai ô gõ chữ duy nhất của Chặng 2**:

| Điều kiện | Ô hiện thêm | Giới hạn |
|---|---|---|
| `parking = paid_nearby` | "Bãi nào?" | 60 ký tự |
| `entrance = diff_sign` | "Trên biển ghi gì?" | 40 ký tự |

Áp dụng lớp lọc 1 và 2 của [NOTEBOOK-DESIGN §7](NOTEBOOK-DESIGN.md): **chặn link, chặn số
điện thoại, chặn chuỗi vô nghĩa**. Không cần AI đọc, không cần admin duyệt ở Chặng 2 — vì
nội dung quá ngắn và gắn cứng vào một lựa chọn cụ thể. (Ô gõ tự do đầy đủ là Chặng 5.)

### 2.5 Nút "Không rõ"

**Mọi câu hỏi đều phải có.** Bấm "Không rõ":
- Không tính phiếu
- **Không hỏi lại người đó câu đó ở chỗ đó trong 30 ngày**
- Không được điểm

Thiếu nút này, người không biết sẽ bấm bừa một đáp án cho xong — hỏng dữ liệu.

---

## 3. Khách nhìn thấy gì

### 3.1 Chỗ hỏi — dưới cùng phần bung của thẻ

Hiện **đúng một câu**, kèm các nút bấm và nút "Không rõ":

```
Bạn biết gửi xe ở đâu không?
[Trước cửa] [Vỉa hè] [Bãi riêng] [Bãi gần, mất phí] [Khó gửi]   [Không rõ]
```

Bấm xong: khối câu hỏi biến mất, hiện `✓ Cảm ơn bạn` + `+1 đang chờ xác nhận` (nếu chưa đạt
đồng thuận) hoặc `+1 điểm` (nếu bấm này làm đủ đồng thuận).

Câu nhiều đáp án: chọn xong bấm nút **"Xong"** mới gửi.

### 3.2 Chọn câu nào để hỏi

Thứ tự ưu tiên:
1. Câu **chưa ai trả lời** ở chỗ này
2. Câu mới có **1 phiếu** (sắp đạt đồng thuận — hỏi thêm là chốt được)
3. Câu có phiếu **cũ nhất** (cần làm mới)

Bỏ qua: câu người này đã trả lời · câu người này bấm "Không rõ" trong 30 ngày · câu đã đạt
đồng thuận và phiếu còn mới (dưới 6 tháng).

Nếu không còn câu nào để hỏi → **không hiện khối câu hỏi**.

### 3.3 Hiển thị kết quả trên thẻ

Trong phần bung, một khối gọn dạng **thuộc tính**, không phải bài đăng:

```
🅿️  Gửi xe        Vỉa hè cạnh quán
🚪  Lối vào       Trong ngõ
🕐  Giờ đông      Tối 18–21h · Cuối tuần
💳  Thanh toán    Tiền mặt · Chuyển khoản
```

| Số phiếu | Hiển thị |
|---|---|
| 0 phiếu | Không hiện dòng đó |
| 1 phiếu | Hiện **mờ**, kèm chữ nhỏ "1 người cho biết" |
| ≥2 phiếu trùng | Hiện bình thường |
| Phiếu lệch, có phương án dẫn đầu | Hiện phương án dẫn đầu |
| Phiếu lệch, hai phương án ngang nhau | **Không hiện gì** |

---

## 4. Lưu gì, ở đâu

### 4.1 Ba key Redis mới

> ⚠️ **Bài học từ Chặng 1:** trang chủ là `force-dynamic`, mỗi lượt khách xem là một lần đọc
> Redis. **Không được để số lệnh tăng theo số địa điểm.** Gói Upstash miễn phí chỉ có
> 500.000 lệnh/tháng.

**`place_answers:consensus`** — **hash**, field = `placeId`, value = JSON kết quả đã tính sẵn.

```js
// value của một field
{
  parking:  { value: "sidewalk", votes: 3, weak: false },
  entrance: { value: "alley",    votes: 1, weak: true  },  // weak = chỉ 1 phiếu, hiện mờ
  busy_hours: { value: ["evening","weekend"], votes: 2, weak: false }
}
```

Trang chủ đọc **1 lệnh `HGETALL`** cho toàn bộ địa điểm. Đây là bảng đã tính sẵn — không
bao giờ tính đồng thuận lúc khách xem trang.

**`place_answers:votes:{placeId}`** — **hash**, field = `{questionId}:{anonId}`, value = JSON.

```js
{ answer: "sidewalk", at: "2026-08-20T10:00:00.000Z", text: null }
```

Chỉ đọc **khi có người vừa bấm** (để tính lại đồng thuận cho đúng chỗ đó), không đọc lúc xem
trang. `HSET` theo field là nguyên tử — hai người bấm cùng lúc không đè nhau. Một người đổi
ý bấm lại thì ghi đè đúng field của mình.

**`answers:skip:{anonId}:{placeId}:{questionId}`** — key rỗng, `EX` 30 ngày. Đánh dấu đã bấm
"Không rõ".

### 4.2 Đếm để chặn cày điểm

| Key | Việc | TTL |
|---|---|---|
| `answers:count:{anonId}:{placeId}:{date}` | Trần 5 câu/chỗ/ngày | 48h |
| `points:day:{anonId}:{date}` | Trần 30 điểm/ngày (**dùng chung mọi nguồn điểm**) | 48h |

> ⚠️ Trần 30 điểm/ngày là trần **chung**. Chặng 1 hiện đang dùng key riêng
> `checkin:points-count:{anonId}:{date}` với trần 3. Chặng 2 phải **giữ nguyên trần 3 riêng
> cho việc xác nhận "vẫn mở"**, đồng thời thêm trần chung 30 áp lên tất cả. Không xoá key
> cũ.

---

## 5. Luật đồng thuận và tính điểm

### 5.1 Trọng số phiếu theo tuổi

```
phiếu dưới 6 tháng     → 1.0
phiếu 6–12 tháng       → 0.5
phiếu trên 12 tháng    → 0.1
```

Đây là **cơ chế tự dọn rác**: quán đổi chỗ gửi xe thì phiếu mới tự lấn phiếu cũ, không cần
ai đi xoá. Tính lúc tính đồng thuận, không cần cron.

### 5.2 Cách chốt đồng thuận

Với câu **một đáp án**: cộng trọng số theo từng lựa chọn, lấy lựa chọn cao nhất.
- Tổng trọng số cao nhất `< 2` → `weak: true` (hiện mờ)
- Hai lựa chọn cao nhất bằng nhau → **không hiện gì** (`value: null`)

Với câu **nhiều đáp án**: tính riêng từng lựa chọn, giữ những lựa chọn có tổng trọng số ≥ 2.

### 5.3 Tính điểm

Theo [NOTEBOOK-DESIGN §10](NOTEBOOK-DESIGN.md):

| Việc | Điểm | Khi nào cộng |
|---|---|---|
| Phiếu trùng đồng thuận cuối cùng | **+1** | Khi đồng thuận đạt (≥2 phiếu) |
| Là **người đầu tiên** trả lời câu đó ở chỗ đó | **+2 thêm** | Khi đồng thuận xác nhận đúng lựa chọn của họ |
| Phiếu lệch đồng thuận | **0** | Không trừ điểm, không bao giờ |

**Cách trả điểm hồi tố:** khi tính lại đồng thuận sau mỗi lượt bấm, duyệt các phiếu của câu
đó; phiếu nào trùng đáp án đồng thuận **và chưa được trả điểm** thì cộng điểm và đánh dấu
`awarded: true` ngay trong vote. Nghĩa là người bấm đầu tiên được cộng điểm **lúc người thứ
hai bấm trùng** — đúng thiết kế.

Người bấm sẽ thấy `+1 đang chờ xác nhận` cho tới khi thật sự được cộng. Cách hiển thị này
đã dùng ở phần góp ý từ 18/07, giữ nhất quán.

---

## 6. Quy tắc nghiệp vụ

| # | Quy tắc |
|---|---|
| 1 | Một người, một câu, một chỗ = **một phiếu**. Bấm lại = đổi ý, ghi đè phiếu cũ (không cộng dồn, không cộng điểm lần hai) |
| 2 | Tối đa **5 câu/chỗ/ngày** cho một người |
| 3 | Trần **30 điểm/ngày** dùng chung mọi nguồn điểm |
| 4 | **Không có duyệt.** Bấm chọn lên thẳng theo đồng thuận |
| 5 | Không cần đăng nhập. Chưa có hồ sơ thì tự tạo im lặng (giống Chặng 1 §2.3) |
| 6 | Điểm không bao giờ bị trừ |
| 7 | Đổi ý bấm lại làm **tính lại đồng thuận** — có thể khiến thông tin trên thẻ đổi theo, đúng thiết kế |

---

## 7. Chỗ dễ sai

**Tính lại đồng thuận và ghi bảng tính sẵn phải xong trong cùng một lượt bấm.** Nếu ghi
`votes` mà quên cập nhật `consensus`, thẻ sẽ không đổi và không ai biết vì sao.

**Hai người bấm cùng lúc cùng một câu ở cùng một chỗ:** cả hai đều đọc `votes`, tính, rồi
ghi `consensus` — người ghi sau thắng. Ở đây **chấp nhận được** vì cả hai đều tính từ dữ liệu
gần như giống nhau, và lượt bấm tiếp theo sẽ tính lại đúng. Không cần khoá. Nhưng phần **ghi
điểm** thì không được để trùng — dựa vào cờ `awarded` trong từng vote để chặn.

**Đừng tính đồng thuận lúc khách xem trang.** Luôn đọc bảng đã tính sẵn.

**Câu hỏi riêng theo loại địa điểm:** dùng `place.type`. Sau Chặng 3 sẽ có 4 loại — viết
`lib/questions.js` sao cho thêm loại mới chỉ là thêm một mục, không phải sửa `if/else` rải
rác.

---

## 8. File dự kiến

**Mới:** `lib/questions.js` (định nghĩa bộ câu hỏi) · `lib/answers.js` (đọc/ghi phiếu, tính
đồng thuận, trả điểm) · `app/answerActions.js` (Server Action) · `app/QuestionPrompt.js`
(khối hỏi) · `app/PlaceFacts.js` (khối hiển thị kết quả)

**Sửa:** `app/page.js` (thêm 1 lệnh `HGETALL` đọc consensus, gộp vào `Promise.all` sẵn có) ·
`app/PlaceExplorer.js` (chèn 2 khối trên vào phần bung) · `app/admin/actions.js` (xoá chỗ thì
dọn luôn field trong `place_answers:consensus` và key `place_answers:votes:{placeId}`)

**Không đụng:** `occupancy.js` · `checkins.js` · `contributors.js` (chỉ gọi hàm sẵn có) ·
schema `places:live`

---

## 9. Xong thì bấm thử được gì

1. Mở một chỗ → bung thẻ → thấy đúng **một** câu hỏi
2. Bấm một đáp án → khối hỏi biến mất, hiện "+1 đang chờ xác nhận"
3. Tải lại → hiện câu hỏi **khác**, không hỏi lại câu vừa trả lời
4. Mở trình duyệt khác, bấm **cùng đáp án** → thông tin hiện lên thẻ, **cả hai người** đều
   được cộng điểm (người đầu +1 và +2 thưởng người đầu tiên)
5. Trình duyệt thứ ba bấm **đáp án khác** → thẻ vẫn hiện đáp án dẫn đầu
6. Bấm "Không rõ" → không tính phiếu, tải lại không hỏi lại câu đó
7. Trả lời 6 câu ở một chỗ trong ngày → câu thứ 6 bị chặn
8. Chỗ chưa ai trả lời gì → không hiện khối kết quả nào
9. Mở trang chủ, xem log Redis: **đúng 3 lệnh** mỗi lượt xem (`places:live` +
   `place_checkins:latest` + `place_answers:consensus`), không tăng theo số địa điểm

---

## 10. Ngoài phạm vi Chặng 2

- Ô gõ chữ tự do ("Mẹo riêng") → **Chặng 5**
- Câu hỏi cho Chơi/Đi lại → **Chặng 3**
- "Nên gọi món gì" (ô gõ tích luỹ thành lựa chọn) → **Chặng 5**, cần cơ chế lọc chữ đầy đủ
- Lọc/xếp hạng địa điểm theo thông tin bấm chọn
- Trang thống kê câu nào thiếu dữ liệu nhất
