# Kiểm kê ảnh địa điểm + số liệu nền — 11/11/2026

> Chạy **chỉ đọc** bằng khóa Redis chỉ-đọc (`KV_REST_API_READ_ONLY_TOKEN`), không ghi gì vào dữ liệu thật. Ảnh:
> đọc `places:live`, phân loại bằng chính hàm của web (`lib/media.js`). Số liệu: đọc `analytics:day:*` và hồ
> sơ khách ẩn danh. Phục vụ [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) §8.

## 1. Ảnh địa điểm

**[Fact]** 344 chỗ trên web (342 thuộc 4 nhóm + 2 “Chỗ quen gọi”). Không chỗ nào đang hết hạn.

| Nhóm | Số chỗ | Có ảnh thường (dùng được cho thẻ) | Tỷ lệ | Có ảnh đánh dấu bìa | Chỉ có ảnh menu |
|---|---:|---:|---:|---:|---:|
| Ăn | 192 | 11 | 5,7% | 4 | 1 |
| Chơi | 56 | 2 | 3,6% | 0 | 0 |
| Ngủ | 71 | 3 | 4,2% | 0 | 0 |
| Đi lại | 23 | 0 | 0% | 0 | 0 |
| **Cộng 4 nhóm** | **342** | **16** | **4,7%** | 4 | 1 |

- Toàn bộ ảnh nằm ở Vercel Blob của dự án (cùng một kho, đã khai báo cho `next/image`).
- **1 chỗ chỉ có ảnh menu**: hàm chọn ảnh bìa hiện tại (`placeCoverMedia`) sẽ lấy ảnh menu làm bìa. Thẻ tìm
  kiếm phải dùng **ảnh thường** (`placeGeneralMedia`), không dùng ảnh menu.
- Chỉ **5/16** chỗ có ảnh ghi sẵn kích thước. Thẻ phải dùng **khung tỷ lệ cố định**, cắt ảnh vừa khung, để không
  xô lệch bố cục.

## 2. Dữ liệu tìm kiếm có cung cấp ảnh không?

**[Fact]** Không. Dữ liệu gửi xuống trang `/tim` (`toResultItem` trong `lib/searchResults.js`) **không có trường
ảnh**. Cần **thêm** một trường ảnh bìa (url, rộng, cao). Đây là thay đổi nhỏ, chỉ thêm trường, không đổi cấu
trúc Redis. Ảnh lấy từ dữ liệu đã có trong `places:live`, không gọi API ngoài.

## 3. Tác động tải trang

- **[Fact]** File gốc của 16 ảnh: nhỏ nhất 111 KB, giữa 376 KB, 90% dưới 847 KB, lớn nhất 963 KB; 11 JPEG,
  5 WebP.
- **[Assumption]** Qua `next/image` với khung thẻ khoảng 64–96px, mỗi ảnh còn khoảng 5–15 KB (WebP/AVIF tự
  chuyển). Một trang kết quả 20 thẻ hiện có tối đa vài ảnh → **tác động hiệu năng không đáng kể** ở dữ liệu
  hiện nay.
- **[Recommendation]** Ảnh thẻ tải lười (trừ 1–2 thẻ đầu), khung cố định, `sizes` đúng kích thước thẻ. Theo
  dõi hạn mức tối ưu ảnh của Vercel khi số ảnh tăng.

**Phương án dự phòng:** không ảnh (95%) → biểu tượng nhóm trên nền phẳng (Cơ bản) hoặc tem nét đứt (Bản đồ
gấp), kèm chữ “Chưa có ảnh thật”. Ảnh lỗi tải → cùng trạng thái đó, thông tin vẫn hiện đủ. Không dùng tranh AI
thay ảnh.

## 4. Số liệu nền (30/9 – 10/11/2026, 42 ngày)

**[Fact]** Đọc từ `analytics:day:<ngày>`:

| Tuần | Phiên | Khách mới | Xem `/` | Xem `/tim` | search_use | category_pick | place_open | notebook_save |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 30/9–6/10 | 20 | 2 | 29 | 26 | 8 | 13 | 48 | 4 |
| 7/10–13/10 | 2 | 2 | 2 | 0 | 0 | 0 | 0 | 0 |
| 14/10–20/10 | 5 | 3 | 4 | 1 | 0 | 1 | 6 | 0 |
| 21/10–27/10 | 3 | 0 | 2 | 3 | 2 | 2 | 1 | 0 |
| 28/10–3/11 | 2 | 2 | 0 | 0 | 0 | 0 | 0 | 0 |
| 4/11–10/11 | 5 | 3 | 5 | 2 | 0 | 1 | 0 | 0 |
| **Cộng** | **37** | **12** | **42** | **32** | **10** | **17** | **55** | **4** |

- **31/42 ngày không có phiên nào.**
- Tuần đầu gồm ngày release 30/9. Lượt test tay của chủ dự án **có thể đã được tính** (smoke test tự động thì
  đã chặn ghi số liệu).
- **Quay lại** (từ hồ sơ khách ẩn danh): 15 khách có mặt trong khoảng này; 11 khách lần đầu vào trong khoảng
  này, **0/11 quay lại** trong 7 hoặc 30 ngày (lần cuối ≥ 1 ngày sau lần đầu); 4 khách từng có hơn 1 phiên.
  Thiết bị: Chrome 7, Safari 4, **Zalo 3**, khác 1.
- **Chưa đọc được:** số khách khác nhau theo ngày và số khách quay lại theo ngày (lưu dạng HyperLogLog). Khóa
  chỉ-đọc bị từ chối lệnh `PFCOUNT`. Em **không dùng khóa ghi** để đọc. Nếu PM cần, chủ dự án có thể cho phép
  dùng khóa đầy đủ cho đúng lệnh đọc này, hoặc xem trong `/admin/users`.

**[Recommendation]** Ở mức truy cập này, tỷ lệ phần trăm trước/sau và so sánh hai theme **không có ý nghĩa
thống kê**. Nên báo số tuyệt đối, đọc kèm phản hồi định tính, và chụp lại bảng này ngay trước mỗi đợt release.
