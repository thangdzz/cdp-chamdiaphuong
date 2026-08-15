# SPEC — Chặng 1: Nút "Hôm nay vẫn mở"

> Bản mô tả đủ chi tiết để code thẳng, không phải đoán. Đọc kèm
> [ARCHITECTURE.md](ARCHITECTURE.md) (hệ thống hiện tại) và
> [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md) (vì sao làm).
>
> **Code làm bên Antigravity, không làm ở Cowork.** Trước khi code phải trình kế hoạch cho
> anh duyệt ([CLAUDE.md](../CLAUDE.md) quy tắc 1).

---

## 1. Làm gì, trong một câu

Thêm một nút để khách xác nhận **"tôi vừa đến, chỗ này vẫn mở"**, và hiển thị lần xác nhận
gần nhất trên thẻ.

**Vì sao đáng làm trước tiên:** đây là điểm yếu số 1 của Google Maps (giữ quán đã đóng cửa
vẫn hiện đang mở), và tốn của khách đúng một cái chạm. Rẻ nhất trong roadmap nhưng kiểm
chứng được giả thuyết lớn nhất: người ta có chịu bấm không.

---

## 2. Khách nhìn thấy gì

### 2.1 Trên thẻ (lớp gọn)

Thêm **một dòng** dưới nhãn trạng thái đang có:

| Tình huống | Hiển thị |
|---|---|
| Có xác nhận trong 7 ngày | ✅ **Còn mở** · xác nhận 2 ngày trước |
| Xác nhận 8–30 ngày trước | ✅ Còn mở · xác nhận 3 tuần trước |
| Xác nhận 31–90 ngày trước | ⚠️ Lâu chưa ai xác nhận (hơn 1 tháng) |
| Trên 90 ngày, hoặc chưa ai xác nhận bao giờ | *(không hiện gì)* |

**Không hiện gì** khi chưa có dữ liệu — quan trọng. Hiện "chưa ai xác nhận" trên 25 thẻ
cùng lúc chỉ làm web trông chết chóc.

Cách viết thời gian: `hôm nay` · `hôm qua` · `N ngày trước` (2–6) · `N tuần trước` (1–4) ·
`hơn 1 tháng` · `hơn 3 tháng`. Không hiện ngày cụ thể, không hiện giờ.

### 2.2 Nút bấm (lớp bung — bấm "Xem thêm")

Đặt nút trong phần bung của card, **cạnh nút "Bổ sung thông tin" đã có**:

```
[ Tôi vừa đến, vẫn mở ]
```

Bấm xong:
- Nút đổi thành trạng thái đã bấm: `✓ Cảm ơn bạn` (mờ, không bấm được nữa)
- Dòng trên thẻ đổi ngay thành "xác nhận hôm nay"
- Hiện `+1 điểm` bên cạnh

Nếu người này **đã xác nhận chỗ này trong 24h qua**: nút hiện sẵn trạng thái đã bấm ngay từ
đầu, kèm chữ nhỏ *"Bạn đã xác nhận hôm nay"*.

### 2.3 Không cần đăng nhập

Không hỏi biệt danh, không hỏi gì cả. Nếu khách chưa có hồ sơ ẩn danh (`anonId` trong
localStorage) thì **tự tạo một hồ sơ im lặng** với biệt danh mặc định — không hiện màn hình
đặt tên như luồng góp ý hiện tại.

> Lý do: đây là hành động một chạm. Chèn bất kỳ bước nào vào giữa là mất phần lớn người bấm.
> Việc đặt biệt danh có thể mời sau, ở luồng góp ý đã có.

---

## 3. Lưu gì, ở đâu

### 3.1 Key Redis mới

```
place_checkins
```

Một mảng, mỗi phần tử là một lượt xác nhận:

```js
{
  placeId: "live-<uuid>",        // khớp id trong places:live
  contributorId: "c-<uuid>",     // anonId từ localStorage
  at: "2026-08-11T09:20:00.000Z" // ISO, giờ máy chủ (KHÔNG dùng giờ máy khách)
}
```

**Vì sao lưu từng lượt thay vì chỉ lưu ngày gần nhất trên `places:live`:**
1. Cần đếm được số người xác nhận, không chỉ lần cuối
2. Cần biết một người đã bấm chưa để chặn bấm lại trong 24h
3. Sau này muốn xem xu hướng (chỗ này có đang được xác nhận đều không) thì đã có dữ liệu

**Không sửa gì trong `places:live`.** Giữ hai thứ tách nhau — `places:live` là dữ liệu về
chỗ, `place_checkins` là hành vi của khách.

### 3.2 Cắt bớt

Mỗi lần ghi, xoá các bản ghi **cũ hơn 180 ngày**. Không cần dữ liệu xa hơn thế, và tránh
mảng phình vô hạn (vấn đề đã ghi ở [ARCHITECTURE §6](ARCHITECTURE.md)).

### 3.3 ⚠️ Vấn đề ghi đồng thời — phải xử lý

Cách đọc-cả-mảng → sửa → ghi-cả-mảng đang dùng khắp dự án **không an toàn ở đây**, vì đây là
thao tác của **khách** (nhiều người có thể bấm cùng lúc), khác với admin duyệt từng cái một.

**Cách làm:** dùng kiểu dữ liệu Redis có thao tác ghi thêm nguyên tử thay vì `get` rồi `set`
cả mảng — ví dụ `LPUSH` vào một list, hoặc `ZADD` vào sorted set theo thời gian. Việc dọn
bản ghi cũ làm riêng, không làm trong cùng thao tác ghi.

Nếu vì lý do nào đó buộc phải giữ kiểu mảng-một-key, thì phải nêu rõ trong kế hoạch trình
anh duyệt, kèm cách chấp nhận rủi ro mất phiếu.

---

## 4. Quy tắc nghiệp vụ

| # | Quy tắc |
|---|---|
| 1 | Một người, một chỗ → **tối đa 1 lượt trong 24 giờ**. Bấm lại trong 24h: không ghi, không cộng điểm, không báo lỗi (nút đã ở trạng thái đã bấm sẵn) |
| 2 | Điểm: **+1 ngay lập tức**, không chờ duyệt |
| 3 | Trần điểm từ việc xác nhận: **3 điểm/người/ngày** (bấm chỗ thứ 4 trở đi trong ngày vẫn ghi nhận xác nhận, nhưng không cộng điểm) |
| 4 | **Không có duyệt.** Xác nhận lên thẳng, giống dữ liệu bấm chọn |
| 5 | Không có nút ngược lại ("chỗ này đóng rồi"). Việc báo đóng cửa đã có sẵn trong luồng "Bổ sung thông tin" và **luôn phải qua duyệt** — không đổi |
| 6 | Chỗ mới thêm vào web chưa có xác nhận nào: không hiện gì (§2.1) |

**Vì sao trần 3 điểm/ngày mà vẫn ghi nhận xác nhận:** tách rời hai việc — dữ liệu thì càng
nhiều càng tốt, còn điểm thì không nên cày được. Người thật sự đi 5 quán một ngày vẫn giúp
được dữ liệu, chỉ là không ăn thêm điểm.

---

## 5. Quan hệ với nhãn "còn chỗ" đang có — cần chốt

Thẻ hiện **đã có** một nhãn: *"Có tín hiệu còn chỗ"* / *"Tín hiệu ít chỗ trống"* /
*"Chưa đủ dữ liệu"* (`app/occupancy.js`). Nhãn này **suy theo lịch lễ hội viết cứng trong
code**, không liên quan gì tới dữ liệu thật.

Thêm dòng "Còn mở · xác nhận 2 ngày trước" nữa là **hai nhãn cạnh nhau**, nói hai chuyện
khác nhau, dễ làm khách rối:

- Nhãn cũ = *chỗ này lúc này có đông không* (đoán theo lịch)
- Dòng mới = *chỗ này còn tồn tại không* (dữ liệu thật từ người đi qua)

**Đề xuất:** giữ cả hai ở Chặng 1, nhưng **xếp rõ thứ bậc** — dòng xác nhận (dữ liệu thật)
đặt **trên**, nhãn còn chỗ (phỏng đoán) đặt **dưới** và làm nhạt hơn.

**Cần anh quyết trước khi code:** sau lễ hội 2026, nhãn "còn chỗ" theo lịch có nên bỏ hẳn
không? Nó chỉ đúng trong mùa lễ hội 2026 (ngày tháng viết cứng trong file), sang năm là sai.
Không thuộc Chặng 1 nhưng nên biết trước để không xây thêm lên trên nó.

---

## 6. Xong thì bấm thử được gì

1. Mở một chỗ bất kỳ → bung thẻ → thấy nút "Tôi vừa đến, vẫn mở"
2. Bấm → nút đổi trạng thái, thẻ hiện "Còn mở · xác nhận hôm nay", được +1 điểm
3. Tải lại trang → vẫn thấy "xác nhận hôm nay", nút vẫn ở trạng thái đã bấm
4. Bấm lại → không cộng điểm thêm
5. Mở bằng trình duyệt khác (giả làm người thứ hai) → bấm được, xác nhận được ghi nhận
6. Bấm 4 chỗ trong một ngày → chỗ thứ 4 vẫn ghi xác nhận nhưng không cộng điểm

---

## 7. Ngoài phạm vi Chặng 1

Không làm trong chặng này, để tránh phình:

- Đếm và hiển thị *"12 người đã xác nhận"* — chỉ hiện lần gần nhất
- Nút "chỗ này đóng cửa rồi" — đã có trong luồng góp ý, không đụng
- Xếp hạng/lọc theo độ tươi của xác nhận — để Chặng 2 trở đi
- Thông báo cho admin khi một chỗ lâu không ai xác nhận
- Đổi hay bỏ nhãn "còn chỗ" cũ (xem §5 — chỉ hỏi, chưa làm)
