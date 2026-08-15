# SPEC — Chặng 3: Thêm "Chơi" và "Đi lại"

> Đọc kèm [ARCHITECTURE.md §6](ARCHITECTURE.md) — mục "Loại địa điểm hiện chỉ có 2 giá trị"
> liệt kê đủ 6 file kèm số dòng. Code làm bên Antigravity, trình kế hoạch trước.

---

## 1. Làm gì, trong một câu

Web hiện chỉ có **Ăn** và **Ngủ**; chặng này thêm **Chơi** và **Đi lại** cho đủ bốn nhóm
đúng lời hứa "cuốn sổ ăn, chơi, ngủ, đi lại".

---

## 2. ⚠️ Việc nguy hiểm nhất — đọc trước

Giá trị loại địa điểm `"an"` / `"ngu"` bị **viết cứng ở 6 file**. Hai chỗ nguy hiểm nhất
viết theo kiểu *"nếu không phải Ăn thì là Ngủ"*:

```js
// lib/placeForm.js dòng 19
type: formData.get("type") === "an" ? "an" : "ngu",

// lib/ingestion/normalize.js dòng 70
category_primary: raw.category_primary === "an" ? "an" : "ngu",
```

**Bỏ sót hai dòng này thì mọi địa điểm Chơi/Đi lại sẽ bị âm thầm biến thành Ngủ, không có
lỗi nào hiện ra.** Dữ liệu hỏng mà không ai biết cho tới khi nhìn thấy quảng trường nằm
trong mục khách sạn.

**Cách sửa bắt buộc:** thay kiểu "nếu không phải X thì là Y" bằng **kiểm tra danh sách hợp
lệ**, giá trị lạ thì báo lỗi rõ ràng, không âm thầm quy về mặc định.

### Danh sách 6 file phải sửa

| File | Dòng | Việc |
|---|---|---|
| `lib/placeForm.js` | 19 | Kiểm tra theo danh sách, không mặc định về `"ngu"` |
| `lib/ingestion/normalize.js` | 70 | Như trên, cho `category_primary` |
| `lib/ingestion/schema.js` | 59 | JSDoc `{"an"\|"choi"\|"ngu"\|"dilai"}` |
| `app/occupancy.js` | 9 | Chọn từ "phòng"/"chỗ" — xem §5 |
| `app/admin/page.js` | 107, 164, 322, 325 | 3 form nhập/sửa: thêm 2 lựa chọn |
| `app/PlaceExplorer.js` | 211, 466, 512 | Phân nhóm + nút lọc |

**Đề xuất:** đưa danh sách loại vào một chỗ duy nhất (ví dụ `lib/placeTypes.js`) rồi 6 file
kia đọc từ đó — để lần sau thêm loại không phải đi tìm lại.

```js
export const PLACE_TYPES = [
  { id: "an",    label: "Ăn",     noun: "chỗ" },
  { id: "choi",  label: "Chơi",   noun: "chỗ" },
  { id: "ngu",   label: "Ngủ",    noun: "phòng" },
  { id: "dilai", label: "Đi lại", noun: "chỗ" },
];
```

**Thứ tự hiển thị:** Ăn · Chơi · Ngủ · Đi lại (đúng thứ tự tên dự án hay nói).

---

## 3. Dữ liệu cũ

25 địa điểm hiện có đều là `"an"` hoặc `"ngu"` — **không cần chuyển đổi gì**. Chỉ thêm giá
trị mới, không đổi giá trị cũ.

---

## 4. Bộ câu hỏi cho hai nhóm mới

Thêm vào `lib/questions.js` (đã dựng ở Chặng 2). 4 câu dùng chung (gửi xe, lối vào, giờ đông,
thanh toán) áp dụng cho cả 4 loại, không phải làm lại.

### 4.1 Riêng "Chơi"

| id | Câu hỏi | Kiểu | Lựa chọn |
|---|---|---|---|
| `ticket` | Có mất phí không? | 1 đáp án | `free` Miễn phí · `paid` Có vé · `paid_service` Miễn phí vào, trả tiền dịch vụ |
| `best_time` | Lúc nào đi đẹp nhất? | nhiều đáp án | `morning` Sáng sớm · `afternoon` Chiều · `sunset` Hoàng hôn · `evening` Tối · `festival` Dịp lễ hội |
| `suitable_for` | Hợp với ai? | nhiều đáp án | `family` Gia đình có trẻ · `couple` Cặp đôi · `group` Nhóm bạn · `photo` Chụp ảnh · `elderly` Người lớn tuổi |
| `facilities` | Có gì ở đó? | nhiều đáp án | `toilet` Nhà vệ sinh · `shade` Chỗ ngồi có mái · `food_nearby` Hàng ăn gần đó · `wheelchair` Lối cho xe lăn |

### 4.2 Riêng "Đi lại"

Nhóm này gồm: bến xe, điểm thuê xe máy/xe đạp, điểm đỗ taxi/xe ôm, bãi gửi xe.

| id | Câu hỏi | Kiểu | Lựa chọn |
|---|---|---|---|
| `transport_kind` | Đây là chỗ gì? | 1 đáp án | `bus_station` Bến xe · `rental` Thuê xe · `taxi` Điểm taxi/xe ôm · `parking` Bãi gửi xe |
| `price_style` | Giá thế nào? | 1 đáp án | `fixed` Niêm yết rõ · `negotiate` Phải hỏi/trả giá · `meter` Theo đồng hồ |
| `available_when` | Lúc nào có xe? | nhiều đáp án | `early` Sáng sớm · `daytime` Ban ngày · `evening` Tối · `late` Khuya · `always` Cả ngày |
| `festival_note` | Dịp lễ hội thì sao? | 1 đáp án | `normal` Bình thường · `crowded` Rất đông, nên đến sớm · `blocked` Bị chặn/đổi lộ trình |

Câu `festival_note` đáng giá nhất trong nhóm này — đúng loại thông tin Google Maps không bao
giờ có.

---

## 5. Nhãn "còn chỗ" với hai nhóm mới

`app/occupancy.js` đoán trạng thái còn chỗ theo lịch lễ hội. Việc này **vô nghĩa với Chơi và
Đi lại** — quảng trường không bao giờ "hết chỗ".

**Quyết định:** nhãn còn chỗ **chỉ áp dụng cho Ăn và Ngủ**. Chơi và Đi lại không hiện nhãn
này. Dòng xác nhận "vẫn mở" (Chặng 1) thì áp dụng cho **cả bốn nhóm**.

> Nhắc lại việc còn treo từ [SPEC-chang-1 §5](SPEC-chang-1.md): nhãn còn chỗ có ngày lễ hội
> 2026 viết cứng trong file, **sang năm là sai**. Chặng 3 chỉ thu hẹp phạm vi của nó, chưa
> giải quyết. Cần quyết trước mùa lễ hội 2027.

---

## 6. Routine quét dữ liệu

Lệnh routine hằng ngày hiện chỉ tìm chỗ ăn và ngủ. Cần:

1. Mở rộng phạm vi tìm sang Chơi và Đi lại
2. Cập nhật `AREA_PRESETS` trong `lib/ingestion/schema.js` — hiện mới có 5 phường, và có
   `"Hà Giang 1"` lạc chỗ. Địa chỉ ngoài danh sách này không chuẩn hoá được về `ward`
3. Chạy lại `scripts/export-known-places.mjs` sau khi có dữ liệu mới

**Chú ý về địa danh:** Tuyên Quang đã sáp nhập đơn vị hành chính (bỏ cấp huyện, hợp nhất với
Hà Giang). Dự án chủ ý dùng **vùng địa lý TP Tuyên Quang cũ** và lấy địa chỉ theo Google Maps
([DECISIONS 2026-07-14](DECISIONS.md)). Giữ nguyên nguyên tắc đó, đừng tự ý "sửa" tên hành
chính.

**Số lượng mục tiêu:** không đặt KPI cứng. Có đủ để mỗi nhóm mới hiện được vài chỗ thật là
đạt — dữ liệu sẽ dày lên dần qua routine và qua khách góp ý.

---

## 7. Ảnh hưởng tới chi phí đọc Redis

Chặng 3 **không thêm key Redis nào**. Nhưng nó tăng số địa điểm (25 → có thể ~100), nên:

- Cách lưu của Chặng 1 và 2 (hash, đọc `HGETALL` 1 lệnh) **không bị ảnh hưởng** — đây chính
  là lý do đã chọn hash thay vì key riêng từng chỗ
- Nhưng `places:live` là **một mảng JSON trong một key** — 100 địa điểm vẫn 1 lệnh, chỉ là
  gói dữ liệu to hơn. Chấp nhận được ở mức này, để mắt khi vượt ~300 chỗ

---

## 8. Xong thì bấm thử được gì

1. Trang chủ có **4 nút lọc**: Ăn · Chơi · Ngủ · Đi lại
2. Mỗi nhóm lọc ra được ít nhất vài chỗ thật
3. Thêm một chỗ Chơi qua `/admin` → **hiện đúng nhóm Chơi**, không bị nhảy sang Ngủ
4. Thử nhập giá trị loại sai qua form → **báo lỗi rõ ràng**, không âm thầm quy về Ngủ
5. Mở một chỗ Chơi → thấy câu hỏi riêng của Chơi (không thấy câu hỏi của Ăn)
6. Chỗ Chơi/Đi lại **không hiện nhãn "còn chỗ"**, nhưng vẫn có nút "Tôi vừa đến, vẫn mở"
7. Chạy routine quét → dữ liệu Chơi/Đi lại vào đúng nhóm

---

## 9. Ngoài phạm vi Chặng 3

- Sửa hoặc bỏ nhãn "còn chỗ" theo lịch (chỉ thu hẹp phạm vi, xem §5)
- Bản đồ, khoảng cách giữa các chỗ
- Nhóm con trong "Chơi" (điểm cho thuê chỗ ngồi xem rước đèn — PRD §3.2 ghi để sau)
- Chuẩn hoá tên hành chính mới sau sáp nhập
