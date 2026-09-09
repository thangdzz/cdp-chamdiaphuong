# SPEC — Kiểm lại dữ liệu cũ

> Không phải một chặng mới. Đây là việc **làm cho dữ liệu đã có luôn tươi**, song song với
> việc routine đi tìm chỗ mới. Code làm bên Antigravity, trình kế hoạch trước.
>
> Đọc kèm [ROUTINE.md](ROUTINE.md) (routine hoạt động thế nào) và
> [ARCHITECTURE.md](ARCHITECTURE.md) (dữ liệu nằm đâu).

---

## 1. Vấn đề: routine chỉ nhìn tới, không bao giờ nhìn lui

Mỗi sáng routine đi tìm chỗ **mới**. Chỗ đã có trên web thì từ lúc thêm vào **không ai đụng
đến nữa** — không routine, không admin, không khách.

39+ địa điểm đang nằm đó với dữ liệu của đúng ngày chúng được thêm vào. Có chỗ đã hơn một
tháng. Mình bỏ công tìm chỗ thứ 40 trong khi chỗ số 3 có thể đã đóng cửa.

Đây là **đúng lỗi mà CDP đang chê Google Maps** ([NOTEBOOK-DESIGN §2](NOTEBOOK-DESIGN.md)):
giữ thông tin chết mà vẫn hiển thị như thật.

---

## 2. Hai loại "còn mới" — và chỉ một loại là thật

| | Đối chiếu bằng máy | Xác nhận bằng người |
|---|---|---|
| Ai làm | Routine tìm lại trên web | Khách vừa đi ngang, bấm nút |
| Chi phí | Rẻ, chạy hằng ngày được | Đắt, cần có lưu lượng khách |
| Độ tin | Đọc lại chính internet — **cũng cũ y như Google** | **Tín hiệu thật duy nhất** |
| Đã có chưa | Chưa — spec này làm | Rồi — Chặng 1, nút "Hôm nay vẫn mở" |

**Nói thẳng:** đối chiếu bằng máy là **thuốc giảm đau**, không phải thuốc chữa. Quán đóng cửa
thì fanpage vẫn còn, Google Maps vẫn ghi đang mở — máy đọc lại cũng không biết. Thuốc chữa là
nút xác nhận của Chặng 1 cộng với lưu lượng khách mùa lễ hội.

**Nhưng có một việc máy làm được mà người không làm được:** phát hiện **mâu thuẫn theo thời
gian**. Số điện thoại đổi giữa hai lần quét, review tháng trước có người viết "đã đóng cửa",
giá niêm yết khác hẳn lần trước — máy bắt được, người đi ngang không bắt được.

Đó là lý do vẫn nên làm, dù biết nó không giải quyết triệt để.

---

## 3. ⚠️ Lỗ hổng phải vá trước: không có mốc "lần cuối được kiểm"

Mỗi địa điểm trong `places:live` hiện có `lastUpdatedAt`. Nhưng nó là **lần cuối dữ liệu bị
SỬA**, không phải lần cuối được KIỂM.

Hệ quả: routine kiểm một quán, thấy mọi thứ vẫn đúng, **không có gì được ghi lại**. Thẻ vẫn
hiện "cập nhật 2 tháng trước" dù vừa đối chiếu sáng nay.

Không vá chỗ này thì mọi nỗ lực kiểm lại đều **vô hình với khách** — mà cái khách cần thấy
chính là *"thông tin này vừa được kiểm"*.

### Ba mốc thời gian, ba ý nghĩa khác nhau

| Trường | Nghĩa | Ai ghi |
|---|---|---|
| `lastUpdatedAt` | Lần cuối có thông tin **thay đổi** | Đã có sẵn |
| **`lastVerifiedAt`** | Lần cuối được **đối chiếu**, kể cả khi không đổi gì | **Thêm mới** |
| `place_checkins:latest` | Lần cuối có **người thật** xác nhận | Đã có (Chặng 1) |

`lastVerifiedAt` thêm vào shape của `places:live`. Chỗ chưa từng được kiểm → `null`, khi đó
lùi về dùng `lastUpdatedAt` để tính tuổi dữ liệu.

---

## 4. Việc 1 — Nói thật về tuổi của dữ liệu

Rẻ nhất, đúng tinh thần dự án nhất, và **làm được ngay không cần chờ việc 2**.

Hiện "cập nhật lần cuối" đang nằm chìm trong phần bung thẻ. Đưa ra chỗ dễ thấy, và **nói
thẳng khi dữ liệu đã cũ**.

### Cách hiển thị

Lấy mốc mới nhất trong ba mốc ở §3, rồi:

| Tuổi dữ liệu | Hiển thị | Màu |
|---|---|---|
| ≤ 7 ngày | *Đối chiếu 3 ngày trước* | Xám |
| 8–30 ngày | *Đối chiếu 3 tuần trước* | Xám |
| 31–90 ngày | *Chưa kiểm lại hơn 1 tháng* | Vàng nhạt |
| > 90 ngày | *Chưa kiểm lại hơn 3 tháng* | Vàng nhạt |
| Chưa có mốc nào | Không hiện gì | — |

Nếu có xác nhận của người thật (Chặng 1) thì **ưu tiên hiện dòng đó**, vì nó mạnh hơn:
*"Còn mở · xác nhận 2 ngày trước"*.

### Vì sao dám tự nói dữ liệu mình cũ

Nghe như tự bôi xấu, nhưng **đây chính là thứ CDP đang bán**. Google không bao giờ nói với
khách rằng thông tin nó đưa đã hai năm tuổi — nó hiển thị y như mới. Mình nói.

Khách thà biết "thông tin này cũ, nên gọi điện trước" còn hơn đến nơi thấy cửa đóng.

---

## 5. Việc 2 — Routine chia đôi công việc

Thay vì mỗi lần chạy chỉ tìm chỗ mới, đổi thành **tìm mới + kiểm lại cũ**.

### Chọn chỗ nào để kiểm

Mỗi lần chạy lấy **5 chỗ lâu chưa kiểm nhất**, sắp theo `lastVerifiedAt` tăng dần (chỗ
`null` lên đầu).

Với 39 chỗ và 5 chỗ/ngày thì hết một vòng mất **8 ngày** — mỗi địa điểm được kiểm lại khoảng
4 lần/tháng. Đủ dày mà không tốn thêm gì đáng kể.

### Routine cần biết chỗ nào cần kiểm

Routine **không đọc được Redis** (giới hạn hạ tầng, xem [ROUTINE.md §4](ROUTINE.md)). Nên
danh sách cần kiểm phải nằm trong repo, giống cách `known-places-snapshot.json` đang làm.

**Cách gọn nhất:** thêm `lastVerifiedAt` vào chính
`web/data/known-places-snapshot.json` — file này sắp được GitHub Action tự cập nhật sau mỗi
lần ingest, nên không tốn thêm hạ tầng nào.

Routine đọc file đó, tự sắp xếp, lấy 5 chỗ đầu.

### Kiểm cái gì

Với mỗi chỗ: tìm lại trên web bằng tên + địa chỉ, rồi đối chiếu 4 thứ —
**còn hoạt động không · địa chỉ · số điện thoại · giờ mở cửa**.

Trả về đúng khuôn `NormalizedPlace` như dữ liệu quét mới, thêm một cờ đánh dấu đây là bản
ghi **kiểm lại** chứ không phải chỗ mới.

### Kết quả đi đâu

**Đi qua đúng `ingestBatch()` đang có, không viết logic mới.**

| Tình huống | Xử lý |
|---|---|
| Không đổi gì | Chỉ cập nhật `lastVerifiedAt` — không tạo mục chờ duyệt |
| Có đổi (địa chỉ, SĐT, giờ) | Tự cập nhật như mọi dữ liệu khác, cập nhật cả 2 mốc |
| Hai nguồn mâu thuẫn | `conflict_detected` → hàng chờ duyệt |
| **Nghi đã đóng cửa** | `stale_place` → **luôn phải qua admin duyệt** |

Dòng cuối là nguyên tắc đã chốt từ 2026-07-17: **gỡ một chỗ khỏi công khai không bao giờ
được tự động**. Không có ngoại lệ.

> Loại `stale_place` đã có sẵn trong `REVIEW_ITEM_TYPE` ở `lib/ingestion/schema.js` từ đầu
> nhưng **chưa từng được dùng tới**. Đây đúng là mục đích ban đầu của nó.

---

## 6. ⚠️ Rủi ro phải chặn trước: ngập hàng chờ duyệt

Kiểm lại chỗ cũ sẽ đẻ ra **nhiều mục chờ duyệt hơn hẳn hiện nay**, vì đối chiếu dữ liệu cũ
rất hay ra mâu thuẫn vặt — địa chỉ viết khác cách, giờ mở cửa nguồn này nguồn kia, số điện
thoại thêm bớt số 0 đầu.

Không chặn thì sáng nào anh cũng có cả chục mục phải xử lý, rồi bỏ luôn không xem — mà bỏ
không xem thì tính năng này thành vô dụng.

**Đặt trần: tối đa 3 mục chờ duyệt MỚI mỗi ngày từ nguồn kiểm lại.**

Ưu tiên theo mức nghiêm trọng:

1. Nghi đã đóng cửa (`stale_place`) — luôn ưu tiên cao nhất
2. Số điện thoại mâu thuẫn
3. Địa chỉ mâu thuẫn
4. Giờ mở cửa mâu thuẫn — nếu quá trần thì **bỏ qua, không xếp hàng**

Trần này áp riêng cho nguồn kiểm lại, **không ảnh hưởng** hàng chờ từ việc quét chỗ mới.

---

## 7. Việc 3 — Một đợt kiểm tay trước lễ hội (anh làm, không cần code)

Việc đáng giá nhất trong cả spec này, và **không máy nào làm thay được**.

Chọn **10–15 chỗ quan trọng nhất cho khách lễ hội**: khách sạn quanh Quảng trường Nguyễn Tất
Thành · quán ăn mở khuya · bãi gửi xe gần tuyến diễu hành.

Gọi điện từng chỗ, hỏi đúng bốn câu:

1. Quán/khách sạn còn hoạt động bình thường không?
2. **Dịp lễ hội 19–25/09 giá khoảng bao nhiêu?**
3. Có nhận khách muộn / mở khuya không?
4. Gửi xe ở đâu?

Mất khoảng 2–3 tiếng. Nhập kết quả qua `/admin`.

**Vì sao đáng làm hơn mọi thứ khác:** đợt lễ hội mà 15 chỗ quan trọng nhất có thông tin chính
xác thì hơn hẳn 100 chỗ thông tin mơ hồ. Và câu hỏi số 2 giải luôn vấn đề **giá mùa cao
điểm** — thứ đã ghi trong [STATUS.md](STATUS.md) mà chưa có hướng giải — bằng cách rẻ nhất
có thể: hỏi thẳng.

---

## 8. File dự kiến

**Sửa:**
- `lib/ingestion/toLivePlace.js` — thêm `lastVerifiedAt` vào shape
- `lib/ingestion/ingestBatch.js` — nhận cờ "kiểm lại", cập nhật `lastVerifiedAt`, áp trần 3 mục/ngày
- `scripts/export-known-places.mjs` — xuất thêm `lastVerifiedAt`
- `app/PlaceExplorer.js` — hiện tuổi dữ liệu trên thẻ
- `app/admin/page.js` — phân biệt mục chờ duyệt từ nguồn kiểm lại

**Không đụng:** logic chống trùng · `place_checkins` · `occupancy.js`

**Sửa ngoài repo:** nội dung routine (thêm bước kiểm lại) — em soạn văn bản, anh dán.

---

## 9. Xong thì bấm thử được gì

1. Mở một thẻ → thấy dòng tuổi dữ liệu, đúng theo bảng ở §4
2. Chỗ có dữ liệu trên 1 tháng → hiện chữ vàng "Chưa kiểm lại hơn 1 tháng"
3. Chỗ vừa có người bấm "vẫn mở" → ưu tiên hiện dòng xác nhận người thật
4. Chạy routine thử → 5 chỗ cũ được kiểm, `lastVerifiedAt` cập nhật kể cả khi **không đổi gì**
5. Sửa tay địa chỉ một chỗ cho lệch → routine kiểm lại phát hiện, vào hàng chờ duyệt
6. Giả lập nhiều mâu thuẫn cùng lúc → chỉ có **tối đa 3 mục** vào hàng chờ
7. Giả lập một chỗ "đã đóng cửa" → **không tự gỡ**, vào hàng chờ chờ admin
8. Vào `/admin` → phân biệt được mục nào từ quét mới, mục nào từ kiểm lại

---

## 10. Ngoài phạm vi

- Tự động gỡ chỗ đã đóng cửa (**không bao giờ làm** — luôn phải qua người duyệt)
- Gọi Google Places API để đối chiếu (vướng điều khoản lưu trữ, và thừa hưởng luôn dữ liệu
  cũ của Google — bàn ngày 2026-08-21, kết luận không làm)
- Nhắc admin qua email/thông báo khi có chỗ lâu chưa kiểm
- Cho khách thấy lịch sử thay đổi của một địa điểm
- Tự động gọi điện xác minh
