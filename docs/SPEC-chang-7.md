# SPEC — Chặng 7: Đăng nhập bằng số điện thoại

> ⚠️ **Bản DỰ KIẾN, không phải bản chốt.** Viết trước theo yêu cầu 2026-08-15, nhưng chặng
> này còn xa và phụ thuộc số liệu thật sau lễ hội. **Đọc lại và sửa trước khi code.**
> Xem [NOTEBOOK-DESIGN.md §8](NOTEBOOK-DESIGN.md).

---

## 1. Làm gì, trong một câu

Khách đã có vài ghi chú riêng thì được mời để lại **số điện thoại**, để ghi chú không mất khi
đổi máy.

## 2. ⛔ Điều kiện bắt buộc trước khi làm

**Chỉ code khi đã có người thật ghi từ 3 ghi chú riêng trở lên.** Làm sớm hơn là làm thừa.

Cách kiểm tra: Chặng 6 không lưu gì lên máy chủ nên không đếm được từ xa. Thêm một chỉ số ẩn
danh đơn giản (chỉ đếm số người vượt mốc 3 ghi chú, **không gửi nội dung**), hoặc hỏi trực
tiếp vài người dùng thật. **Không đoán.**

---

## 3. ⚠️ Việc phải quyết trước khi code: gửi tin nhắn OTP bằng gì

Đây là chỗ **duy nhất trong cả dự án cần trả tiền cho bên thứ ba**, và chưa có quyết định.
SMS ở Việt Nam không miễn phí, và tin nhắn thương hiệu cần đăng ký.

Vài hướng để cân nhắc — **cần tra giá và điều kiện tại thời điểm làm, đừng tin số liệu cũ:**

| Hướng | Cần lưu ý |
|---|---|
| **Zalo ZNS** | Người Việt gần như ai cũng dùng Zalo; cần doanh nghiệp đăng ký OA |
| **SMS trong nước** (eSMS, Viettel...) | Cần đăng ký brandname, có phí theo tin |
| **Twilio / nước ngoài** | Dễ tích hợp, nhưng gửi về VN thường đắt và hay bị chặn |
| **Bỏ SMS, dùng email** | Miễn phí (Resend/Brevo có gói free), nhưng người dùng phổ thông ở Tuyên Quang ít dùng email |
| **Mã khôi phục như hiện tại** | Không tốn gì, nhưng đã kết luận là không đủ (không ai giữ nổi mã 6 số sau 3 tháng) |

**Đề xuất khi tới lúc:** thử **Zalo ZNS** trước; nếu vướng thủ tục doanh nghiệp thì lùi về
email + giữ mã khôi phục làm phương án hai.

> Không chốt ở đây vì giá và chính sách thay đổi liên tục. Phần còn lại của spec này **không
> phụ thuộc vào việc chọn kênh nào** — chỉ cần "gửi được một mã 6 số tới người dùng".

---

## 4. Luồng người dùng

### 4.1 Lần đầu để lại số

Từ lời mời ở `/ghi-chu` (đã có sẵn từ Chặng 6):

```
1. Nhập số điện thoại      → 0912 345 678
2. Nhận mã 6 số            → nhập mã
3. Xong                    → "Đã lưu. Ghi chú của bạn giờ an toàn."
```

Ngay sau khi xác thực: **đẩy toàn bộ ghi chú riêng đang có trong máy lên máy chủ**.

### 4.2 Đăng nhập ở máy khác

Nhập số → nhận mã → xong. Ghi chú riêng **tải về máy mới**.

### 4.3 Gộp khi hai bên đều có ghi chú

Máy mới đã có ghi chú riêng (chưa đăng nhập) mà tài khoản trên máy chủ cũng có:

- **Gộp cả hai**, không xoá bên nào
- Cùng một địa điểm mà hai bên khác nhau → **giữ cả hai**, nối lại kèm dấu phân cách và ghi
  rõ "(ghi trên máy này)" / "(đã lưu trước đó)"
- **Không bao giờ tự chọn bên nào để bỏ**

---

## 5. Quan hệ với hồ sơ ẩn danh đang có

Hiện đã có `contributors:all` với `anonId` + `recoveryCode` 6 số (điểm, huy hiệu).

**Không tạo hệ thống tài khoản thứ hai.** Số điện thoại là **thêm một cách đăng nhập** vào
đúng hồ sơ đã có:

- Thêm trường `phoneHash` vào hồ sơ (**lưu dạng băm, không lưu số thật**)
- `recoveryCode` **giữ nguyên**, vẫn dùng được — không bỏ thứ đang chạy
- Một số điện thoại ↔ một hồ sơ

**Nếu số đã gắn với hồ sơ khác** (người dùng đổi máy nhưng máy mới đã lỡ tạo hồ sơ mới):
gộp hai hồ sơ — cộng điểm, gộp ghi chú, gộp sổ; giữ biệt danh của hồ sơ **cũ hơn**.

---

## 6. Lưu gì, ở đâu

| Key | Kiểu | Nội dung |
|---|---|---|
| `contributors:all` | mảng (đã có) | Thêm trường `phoneHash` |
| `contributors:by-phone` | hash | field = `phoneHash`, value = `anonId`. Tra 1 lệnh |
| `personal_notes:{anonId}` | JSON | Ghi chú riêng đã đồng bộ. Chỉ đọc khi chính chủ đăng nhập |
| `otp:{phoneHash}` | chuỗi, `EX` 300 | Mã 6 số đang chờ nhập |
| `otp:attempts:{phoneHash}` | số, `EX` 3600 | Đếm số lần nhập sai |

**Số điện thoại luôn lưu dạng băm** (HMAC với `ADMIN_SESSION_SECRET` hoặc khoá riêng), không
bao giờ lưu số thật. Nếu cần hiện lại cho người dùng thì chỉ hiện 3 số cuối — lưu riêng phần
đuôi đó.

---

## 7. Bảo mật tối thiểu

| Việc | Cách làm |
|---|---|
| Mã OTP | 6 số, sống **5 phút** |
| Nhập sai | Tối đa **5 lần/giờ** cho một số → khoá 1 giờ |
| Gửi lại mã | Tối đa **3 lần/giờ** cho một số |
| Chặn quét số hàng loạt | Giới hạn theo địa chỉ IP |
| Phiên đăng nhập | Cookie ký HMAC, hạn 90 ngày (dùng lại cách của `lib/adminAuth.js`) |
| Ghi chú riêng | Chỉ chính chủ đọc được. **Admin không có đường nào xem** |

Quy tắc cuối quan trọng: đã hứa với người dùng ghi chú riêng là riêng tư, thì `/admin` **phải
không có** chức năng xem ghi chú riêng của ai. Không làm ngoại lệ.

---

## 8. Xong thì bấm thử được gì

1. Có 3 ghi chú riêng → hiện lời mời → nhập số → nhận mã → xác thực xong
2. Mở trên máy tính, đăng nhập cùng số → **thấy đủ 3 ghi chú**
3. Ghi thêm trên máy tính → điện thoại tải lại thấy ghi chú mới
4. Máy thứ ba đã có ghi chú riêng, đăng nhập → **gộp cả hai**, không mất bên nào
5. Nhập sai mã 5 lần → bị khoá 1 giờ
6. Mã quá 5 phút → không dùng được
7. Điểm và huy hiệu cũ **vẫn nguyên** sau khi gắn số điện thoại
8. `recoveryCode` cũ vẫn dùng được
9. Trong `/admin` **không tìm thấy** chỗ nào xem được ghi chú riêng của người dùng

---

## 9. Ngoài phạm vi Chặng 7

- Đăng nhập bằng Google/Facebook/Zalo OAuth
- Đổi số điện thoại
- Xoá tài khoản (⚠️ cân nhắc kỹ — có thể là **nghĩa vụ pháp lý** khi đã thu số điện thoại;
  xem lại khi làm)
- Thông báo đẩy
- Hồ sơ công khai của người dùng (**không bao giờ làm**)
