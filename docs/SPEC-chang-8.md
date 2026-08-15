# SPEC — Chặng 8: Chủ quán nhận địa điểm của mình

> ⚠️ **Bản DỰ KIẾN, không phải bản chốt.** Chặng xa nhất, phụ thuộc hoàn toàn vào việc web
> có traffic thật hay không. **Đọc lại và viết lại phần lớn trước khi code.**
> Xem [NOTEBOOK-DESIGN.md §11](NOTEBOOK-DESIGN.md).

---

## 1. Làm gì, trong một câu

Chủ quán xác minh bằng số điện thoại rồi **tự sửa thông tin quán mình**, không phải chờ admin.

## 2. ⛔ Điều kiện bắt buộc trước khi làm

**Chỉ làm khi web đã có khách vào xem thật.** Chủ quán không quan tâm nếu chưa ai nhìn thấy
quán họ — claim là **hệ quả của traffic, không phải nguyên nhân**.

Gợi ý mốc tối thiểu: một chỗ có **vài chục lượt xem/tháng** thì lời mời mới có sức nặng.
Chưa tới thì làm cũng không ai dùng.

**Phụ thuộc:** Chặng 7 phải xong trước (dùng chung hạ tầng OTP).

---

## 3. Nguyên tắc: chào bằng "sửa thông tin sai", không phải "mua quảng cáo"

Chủ quán nhận địa điểm vì **sợ mất khách**, không vì muốn quảng cáo. Lời chào nên là:

> *"Có 3 khách ghi chú về quán anh, 1 người nói số điện thoại sai — anh muốn sửa không?"*

Chứ không phải *"Đăng ký gói nổi bật"*. Đây cũng là lúc biết chính xác chỗ nào đáng bán gói
sau này.

Cách tiếp cận thực tế: in mã QR dán tại quán, hoặc gọi điện trực tiếp. Không làm quảng cáo
đại trà.

---

## 4. ⚠️ Xác minh — chỗ nguy hiểm nhất

**Tuyệt đối không cho nhận ẩn danh.** Không xác minh thì ai cũng nhận được quán không phải
của mình: sửa sai thông tin đối thủ, gắn số điện thoại của mình vào, đổi giá cho khách bỏ đi.

**Cách xác minh:** gửi mã OTP về **đúng số điện thoại đang hiển thị công khai** của chỗ đó
trong `places:live`.

Bốn tình huống cần xử lý:

| Tình huống | Cách làm |
|---|---|
| Chỗ **chưa có** số điện thoại | Không cho nhận tự động → chuyển sang duyệt tay |
| Số trong dữ liệu **sai** | Không cho nhận (đúng — số sai thì không xác minh được) → duyệt tay |
| **Hai người** cùng nhận một chỗ | Người xác minh trước thắng; người sau chuyển duyệt tay |
| Chủ **đổi số điện thoại** | Duyệt tay |

Mọi ca duyệt tay vào một mục mới trong `/admin`, admin gọi điện xác nhận rồi cấp quyền.

**Chốt nguyên tắc:** thà bỏ sót vài chủ quán thật còn hơn cho một người nhận nhầm quán của
người khác.

---

## 5. Chủ quán được làm gì

| Được | Không được |
|---|---|
| Sửa địa chỉ, số điện thoại, giờ mở cửa | Xoá ghi chú công khai của khách |
| Sửa giá | Xoá phiếu bấm chọn |
| Thêm/xoá ảnh của quán mình | Xoá hoặc ẩn quán khỏi web |
| Trả lời câu hỏi bấm chọn (đánh dấu "chủ quán xác nhận") | Đổi tên quán (dễ bị lợi dụng) |
| Báo "quán đã đóng cửa" (**vẫn qua admin duyệt**) | Sửa thông tin quán khác |

**Phiếu của chủ quán tính trọng số cao hơn** (đề xuất: 3 phiếu thường) nhưng **không phủ quyết
được** — nếu 5 khách nói khác chủ quán, hiện theo số đông. Chủ quán biết rõ quán mình, nhưng
cũng có động cơ nói tốt cho mình.

**Quan trọng nhất:** chủ quán **không được xoá ghi chú của khách**. Cho xoá là biến CDP thành
kênh quảng cáo của quán, mất sạch lý do khách tin. Nếu ghi chú sai sự thật, chủ quán dùng nút
"ghi chú này không đúng" như mọi người, và admin xử.

---

## 6. Khách nhìn thấy gì

Chỗ đã có chủ nhận, hiện một nhãn nhỏ:

```
✓ Chủ quán đã xác nhận thông tin · cập nhật 3 ngày trước
```

**Không hiện** tên chủ, không có trang hồ sơ doanh nghiệp, không có nút nhắn tin.

Nhãn này cũng là **lý do để chủ quán khác muốn nhận** — thấy quán bên cạnh có dấu xác nhận
thì mình cũng muốn có.

---

## 7. Lưu gì, ở đâu

| Key | Kiểu | Nội dung |
|---|---|---|
| `place_claims` | hash | field = `placeId`, value = `{ ownerAnonId, verifiedAt, method }`. Trang chủ đọc 1 lệnh |
| `claim_requests` | mảng | Yêu cầu chờ duyệt tay |
| `claim:otp:{placeId}` | chuỗi, `EX` 300 | Mã đang chờ |

`method`: `"otp"` (tự động) hoặc `"manual"` (admin duyệt) — để sau này biết đường nào tin
được hơn.

Tổng chi phí đọc trang chủ sau Chặng 8: **5 lệnh** (`places:live` · `place_checkins:latest` ·
`place_answers:consensus` · `place_notes:published` · `place_claims`). Vẫn không tăng theo số
địa điểm — đúng nguyên tắc từ Chặng 1.

---

## 8. Kiếm tiền — chưa làm ở Chặng 8

Chặng 8 **chỉ mở cửa**, chưa thu tiền. [PRD §3.2](PRD.md) vẫn ghi mô hình thu phí là để sau.

Khi tới lúc, dữ liệu cần để quyết đã có sẵn: bao nhiêu chủ quán nhận địa điểm · họ quay lại
sửa bao nhiêu lần · chỗ nào nhiều lượt xem nhất. **Đừng bàn giá trước khi có ba con số đó.**

Một điều cần giữ: [PRD §3.1 mục 7](PRD.md) hứa miễn phí cho **khách xem**. Dù sau này bán gói
cho doanh nghiệp thì phần khách xem vẫn phải miễn phí và không có quảng cáo chen vào dữ liệu.

---

## 9. Xong thì bấm thử được gì

1. Chủ quán bấm "Đây là quán của tôi" → nhận mã về số công khai của quán → xác minh xong
2. Sửa giờ mở cửa → **lên web ngay**, không cần admin
3. Thẻ hiện nhãn "Chủ quán đã xác nhận"
4. Chủ quán **không tìm thấy** nút nào xoá được ghi chú của khách
5. Người khác thử nhận cùng quán đó → bị từ chối, vào hàng chờ duyệt tay
6. Quán chưa có số điện thoại → không nhận tự động được, vào hàng chờ duyệt tay
7. Chủ quán trả lời câu hỏi bấm chọn → phiếu nặng hơn nhưng 5 khách nói khác thì vẫn theo
   số đông
8. Chủ quán báo "đã đóng cửa" → **vẫn phải qua admin duyệt**
9. `/admin` có mục xử lý yêu cầu nhận địa điểm thủ công

---

## 10. Ngoài phạm vi Chặng 8

- Thu tiền, gói nổi bật, quảng cáo
- Trang hồ sơ doanh nghiệp
- Nhắn tin giữa khách và quán
- Đặt bàn/đặt phòng (**PRD §6 ghi rõ ngoài phạm vi**)
- Thống kê cho chủ quán (bao nhiêu người xem quán tôi)
- Nhiều người cùng quản một quán
