# Test của CDP

Chạy:

```bash
cd web && npm test
```

**Không cần cài gì thêm.** Dùng bộ chạy test có sẵn trong Node (`node --test`), không thêm phụ
thuộc nào vào dự án.

## Chỗ này test cái gì — và KHÔNG test cái gì

Chỉ test **hàm thuần**: cho đầu vào, kiểm đầu ra, không đụng Redis, không mở trình duyệt, không
gọi mạng. Nhờ vậy chạy trong một giây và không bao giờ làm hỏng dữ liệu thật.

Không test giao diện. Việc "bấm thử trên điện thoại" vẫn phải làm tay — xem `docs/STATUS.md`.

Vài test cần biến môi trường Upstash mới nạp được module (`lib/redis.js` dựng client ngay lúc
nạp file), nên `npm test` đặt sẵn giá trị giả. **Không có lệnh Redis nào chạy thật.**

## Các file

| File | Giữ cho luật nào không bị phá |
|---|---|
| `locationVotes.test.js` | Gom cụm phiếu vị trí 40m, ≥2 người mới tính, hai cụm bằng nhau thì KHÔNG tự chọn |
| `placeValidity.test.js` | Chỗ tạm tính TRỌN ngày cuối theo giờ VN (máy chủ chạy UTC) |
| `placeTypes.test.js` | Trang chủ vẫn đúng 4 tab; "Chỗ quen gọi" không sinh câu hỏi nào |
| `placeSearch.test.js` | Gõ tên dân gian ra đúng chỗ; form thiếu ô thì KHÔNG xoá dữ liệu cũ |
| `mapsUrl.test.js` | Ghim đã xác nhận thắng chuỗi chữ khi dẫn đường |
| `provinces.test.js` | Đoán tỉnh từ địa chỉ Google, đoán không ra thì để trống |
| `scrollLock.test.js` | Hai lớp phủ chồng nhau đóng cùng lúc không làm trang đơ |
