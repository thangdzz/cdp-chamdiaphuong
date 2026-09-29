# NOTE 04 — Đi lại, Mẹo dạng chọn và tạo Lộ trình nhanh

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: tối ưu nhóm **Đi lại**, sửa UX phần **Mẹo**, và thêm luồng **chọn nhiều địa điểm → tạo Sổ/Lộ trình**.  
> Đọc cùng `10-NOTE-01-Product-UX.md`, `11-NOTE-02-Share-Place.md`, `12-NOTE-03-Notebook-Route-Content.md`.

---

## 1. Vấn đề 1 — Nhóm Đi lại đang dùng field quá chung

Ví dụ `Xe ghép Anh Huy` hiện mới có tên, địa chỉ, giá và đơn vị `/người`. Cấu trúc này chưa đủ cho dịch vụ xe ghép, taxi, xe khách, thuê xe...

### Giải pháp

Giữ:

```text
primaryCategory = "dilai"
```

Thêm subtype:

```text
transportSubtype
```

Gợi ý ban đầu:
- `xe-ghep`
- `taxi`
- `xe-khach`
- `xe-buyt`
- `thue-xe`
- `diem-don-tra`
- `bai-xe`

Không cần làm đủ mọi subtype ngay. Bắt đầu với `xe-ghep`.

---

## 2. Field cho Đi lại → Xe ghép

Các field nên hỗ trợ:
- Loại xe: `4 chỗ · 7 chỗ · 15 chỗ...`
- Tuyến chính
- Giá tham khảo
- Hình thức: `Ghép khách / Bao xe`
- Điểm đón: `Tận nơi / Điểm cố định`
- Điểm trả: `Tận nơi / Điểm cố định`
- Khung giờ chạy
- Có cần đặt trước không
- Hành lý
- Số điện thoại tham khảo + trạng thái xác nhận

Ví dụ:

> **Xe ghép Anh Huy**  
> `Xe ghép · 7 chỗ`  
> `Tuyên Quang ↔ Hà Nội`  
> `300k/người`

Không hiện field rỗng. Không ép xe ghép dùng field dành cho quán/cafe.

---

## 3. Vấn đề 2 — Mẹo đang bắt user gõ lại thứ đã có nút chọn

UX sai hiện tại:
1. user chọn `Gửi xe`;
2. đã có lựa chọn `Vỉa hè cạnh quán`;
3. nhưng vẫn phải gõ lại `Vỉa hè cạnh quán`.

Đây là thao tác thừa và đi ngược nguyên tắc:

> **Chọn là mặc định. Gõ là ngoại lệ.**

---

## 4. Giải pháp cho Mẹo / câu hỏi có cấu trúc

### Trường hợp A — đáp án đã có sẵn

Ví dụ:

> Gửi xe ở đâu?

Các nút:
- Trước cửa
- Vỉa hè cạnh quán
- Bãi riêng
- Bãi gần, mất phí
- Khó gửi
- Không rõ

User bấm `Vỉa hè cạnh quán` → ghi phiếu ngay. Không mở textarea.

### Trường hợp B — đáp án cần làm rõ

Ví dụ chọn `Bãi gần, mất phí` → mới hỏi `Bãi nào?`

Textarea ngắn chỉ xuất hiện khi cần.

### Trường hợp C — không có lựa chọn phù hợp

User chọn `Khác` → mới mở ô gõ.

### Trường hợp D — Mẹo địa phương thật sự

Nếu user chủ động muốn thêm mẹo ngoài bộ đáp án:
1. chọn context;
2. gõ nội dung ngắn;
3. qua admin duyệt;
4. mới public.

Không trộn luồng này với câu hỏi bấm chọn.

---

## 5. Hai cơ chế phải tách rõ

### Dữ liệu chọn sẵn

```text
Bấm → đồng thuận → public
```

Không qua admin.

### Mẹo địa phương dạng chữ

```text
Chọn context → gõ → admin duyệt → public
```

Không tự public.

---

## 6. Vấn đề 3 — Tạo Sổ/Lộ trình hiện còn chậm

Hiện tư duy chính là:

> vào từng địa điểm → `+ Vào sổ`

Cách này ổn cho lưu từng chỗ nhưng chậm khi user đã biết muốn gom nhiều địa điểm để gửi.

CDP cần thêm:

> **Chọn nhiều → Tạo Sổ / Tạo lộ trình**

---

## 7. Một engine cho hai cách tạo

Không tạo hai feature riêng. Dùng cùng một `selection mode`.

### Flow A — bắt đầu từ một địa điểm

Ví dụ đang xem `Xe ghép Anh Huy`.

CTA:

> **Tạo lộ trình từ đây**

Khi bấm:
- bật selection mode;
- `Xe ghép Anh Huy` được chọn sẵn;
- mở danh sách/search địa điểm;
- user chọn thêm nhiều địa điểm.

Ví dụ:
- Xe ghép Anh Huy
- Khách sạn A
- Nhà hàng B
- Quảng trường C

Sau đó bấm `Tạo lộ trình`.

---

## 8. Flow B — bắt đầu từ search/list

User đang ở danh sách địa điểm.

Có nút:

> **Chọn nhiều**

Sau khi bật:

```text
☑ Xe ghép Anh Huy
☑ Nhà hàng B
☑ Khách sạn A
☑ Quảng trường C
```

Thanh thao tác cố định:

> **4 địa điểm đã chọn**

Actions:
- `Thêm vào sổ`
- `Tạo lộ trình`

Hai flow dùng chung selection state và cùng backend.

---

## 9. Sau khi chọn xong

Không mở form lớn.

Chỉ cần:

### Tên

Tự đặt tên mặc định, user sửa được.

Ví dụ:
- `Xe ghép Anh Huy + 3 điểm`
- `Hà Nội → ăn → chơi → nghỉ`

### Thứ tự

Hiện:

```text
1. Xe ghép Anh Huy
2. Khách sạn A
3. Nhà hàng B
4. Quảng trường C
```

Cho:
- reorder;
- xoá điểm;
- thêm điểm.

Sau đó:

> **Lưu & chia sẻ**

---

## 10. Sổ và Lộ trình vẫn dùng cùng model

Giữ quyết định ở NOTE 03:

```text
notebook.mode = "list" | "route"
```

Selection mode chỉ là cách tạo nhanh.

Nếu bấm `Thêm vào sổ` → `mode = "list"`.

Nếu bấm `Tạo lộ trình` → `mode = "route"`.

Không tạo schema hoàn toàn mới.

---

## 11. Use case nhà xe

Ví dụ nhà xe Anh Huy có thể tạo:

> **Hà Nội → Thành Tuyên cuối tuần**

Gồm:
1. Xe ghép Anh Huy
2. Khách sạn
3. Chỗ ăn
4. Điểm chơi
5. Điểm đón về

Sau đó gửi một link cho khách.

Người nhận:
- mở không cần login;
- xem toàn bộ;
- có thể `Lưu thành sổ của tôi`;
- chỉnh bản copy;
- gửi tiếp.

Đây là use case thật cho vòng chia sẻ của CDP.

---

## 12. Không tối ưu route tự động ở bản đầu

Chưa làm:
- tự tìm đường tối ưu;
- tự đổi thứ tự điểm;
- tính route phức tạp;
- ETA chính xác nếu chưa có nguồn.

Bản đầu:
- giữ thứ tự user chọn;
- cho reorder;
- map đánh số nếu đã có;
- khoảng cách/thời gian chỉ hiện khi có dữ liệu thật.

Sau này mới cân nhắc:

> `Sắp xếp tuyến hợp lý`

---

## 13. Pattern tham khảo

Có thể học:

### Wanderlog
- thêm nhiều địa điểm vào itinerary;
- reorder;
- list + map;
- thao tác theo nhóm.

### Roadtrippers
- nhiều stop;
- đánh số route;
- tổ chức tuyến theo thứ tự.

### Google Maps Lists
- share collection bằng link;
- lưu/copy danh sách.

### Mapstr
- lưu place nhanh;
- tag;
- private note;
- share place/map.

Không copy:
- review;
- social feed;
- follower;
- comment.

---

## 14. Thứ tự triển khai

### P0
1. Sửa UX Mẹo: bấm đáp án có sẵn → ghi ngay; chỉ gõ khi `Khác` hoặc lựa chọn cần làm rõ.
2. Tạo subtype `Đi lại → Xe ghép`.
3. Thêm field động cơ bản cho Xe ghép.

### P1
4. Selection mode.
5. Multi-select địa điểm.
6. `Thêm vào sổ`.
7. `Tạo lộ trình`.
8. Reorder trước khi lưu.
9. Share link.
10. Người nhận copy/lưu Sổ.

### P2
11. Map route.
12. Khoảng cách/thời gian giữa stop.
13. Drag & drop nâng cao.
14. Tối ưu route tự động nếu sau này có nhu cầu thật.

---

## 15. Nguyên tắc triển khai

- Không rewrite hệ Sổ đang chạy.
- Tận dụng `notebook` hiện có.
- Không tạo entity Route riêng nếu `mode=route` là đủ.
- Không tự public chữ tự do.
- Không bắt user gõ lại dữ liệu đã có nút chọn.
- Không bịa route/khoảng cách.
- Không mở thêm social layer.

---

## 16. Tiêu chí hoàn thành

- Xe ghép có field phù hợp thay vì field chung chung.
- Câu hỏi chọn sẵn thực sự one-tap.
- Text input chỉ xuất hiện khi cần.
- User có thể chọn nhiều địa điểm cùng lúc.
- Có thể tạo Sổ hoặc Lộ trình từ cùng selection mode.
- Có thể bắt đầu tạo Lộ trình từ một địa điểm đang xem.
- Người nhận link vẫn copy/lưu thành Sổ của mình.
