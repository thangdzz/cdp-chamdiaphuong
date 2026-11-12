# Kiểm kê ảnh “legacy” chưa rõ quyền dùng — 12/11/2026 (hồ sơ nội bộ)

> PM Q4 PLAN A3: lập danh sách để **xác minh nguồn/quyền trước A5**. Danh sách **không kết luận** ảnh có quyền dùng hay
> không. Đọc **chỉ đọc** bằng token Redis chỉ-đọc lúc 2026-11-12T16:25:39.732Z (`places:live` + hàng góp ý `user_suggestions`).
> Không ghi định danh người gửi.

## Tóm tắt

| | Số |
|---|---:|
| Ảnh trên web theo nguồn | legacy 25 · khách (có ghi người gửi ẩn danh) 21 · Admin 3 |
| Ảnh legacy | **25** ở **12** chỗ (23 ảnh thường, 2 ảnh menu) |
| Ảnh legacy đang là **ảnh đại diện** | **11** (tức 11/16 chỗ có ảnh) |
| Tìm thấy trong hàng góp ý của khách (đã duyệt) | 25/25 |

**[Fact] Nguồn đã truy được:**
- Cả 25 ảnh nằm trong thư mục `place-photos/` của Blob. Thư mục này do luồng **“Bổ sung ảnh” của khách** tạo ra (commit `4827d37`, 18/7/2026: khách gửi ẩn danh, Admin duyệt). Luồng dùng tới khi đổi sang `place-media/` (14/9).
- Cả 25/25 ảnh có bản ghi góp ý loại “photo”, trạng thái “approved” trong `user_suggestions`.
- Dữ liệu cũ không lưu trường `source` / người tải, nên trong `places:live` chúng hiện là “legacy”.

**[Fact] Căn cứ quyền:** form “Bổ sung ảnh” lúc đó **không có** câu thông báo ảnh sẽ hiển thị công khai, cũng không có
xác nhận người gửi có quyền chia sẻ ảnh. Form hiện tại cũng chưa có (sẽ thêm ở A6, BACKLOG §6).

**Kết luận theo điều kiện PM:** Admin đã duyệt và ảnh đã nằm trên Blob **không phải bằng chứng quyền dùng**. Cả 25 ảnh: **chưa xác minh**.
Chưa xác minh thì **ở bề mặt mới (thẻ tìm A5, A6–A8) dùng minh họa**. Vị trí đang hiển thị hiện nay (trang Chi tiết) giữ nguyên, PM không yêu cầu gỡ.

**Cùng tình trạng (ghi để PM quyết cổng A5):**
- 21 ảnh khách gửi sau 14/9 (`place-media/`, có ghi mã người gửi ẩn danh) cũng đi qua form không có câu đồng ý.
- 3 ảnh do Admin tải lên. Admin là người có thể xác nhận nguồn.

## Danh sách

| # | ID ảnh | ID chỗ | Nhóm | Vai trò | Ảnh đại diện | Nguồn đã biết | Tình trạng | Hướng xử lý |
|---|---|---|---|---|---|---|---|---|
| 1 | `legacy-fdegai` | `ngu-01` | Ngủ | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 2 | `legacy-1uv5gs2` | `ngu-01` | Ngủ | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 3 | `legacy-nyqejh` | `pending-ada64e1a-7ed4-41e0-928a-1bee158825dc` | Ăn | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 4 | `legacy-1xsg5u5` | `pending-ada64e1a-7ed4-41e0-928a-1bee158825dc` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 5 | `legacy-1ey81w8` | `pending-ada64e1a-7ed4-41e0-928a-1bee158825dc` | Ăn | menu | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Chỉ ở khối thực đơn (không làm ảnh đại diện) |
| 6 | `legacy-1ejlxjp` | `live-7c820799-88ec-43a0-8ed0-12c3c4342dd0` | Ăn | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 7 | `legacy-1mcwxtl` | `live-0e3f8d02-1872-4c4e-b4ae-a8d4d27a4560` | Ăn | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 8 | `legacy-jd1f8a` | `live-0e3f8d02-1872-4c4e-b4ae-a8d4d27a4560` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 9 | `legacy-4we045` | `pending-d6afbf4b-f88d-4c2c-8967-f28a44bc4d8a` | Ăn | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 10 | `legacy-barzmo` | `pending-d6afbf4b-f88d-4c2c-8967-f28a44bc4d8a` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 11 | `legacy-zupf2a` | `pending-d6afbf4b-f88d-4c2c-8967-f28a44bc4d8a` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 12 | `legacy-1jwsbpd` | `pending-d6afbf4b-f88d-4c2c-8967-f28a44bc4d8a` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 13 | `legacy-1ca1rgj` | `pending-d6afbf4b-f88d-4c2c-8967-f28a44bc4d8a` | Ăn | menu | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Chỉ ở khối thực đơn (không làm ảnh đại diện) |
| 14 | `legacy-odlr8g` | `live-10fe20dd-0218-4f93-a896-008f953df74d` | Ngủ | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 15 | `legacy-pqlsww` | `live-10fe20dd-0218-4f93-a896-008f953df74d` | Ngủ | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 16 | `legacy-lvi4ma` | `live-10fe20dd-0218-4f93-a896-008f953df74d` | Ngủ | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 17 | `legacy-1ov0000` | `pending-799f7eda-b860-4a14-9172-63dd05bc75bb` | Chơi | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 18 | `legacy-6im4be` | `pending-799f7eda-b860-4a14-9172-63dd05bc75bb` | Chơi | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 19 | `legacy-s61wkn` | `live-2e39813d-5b0e-4365-8ed8-a8345a8eb189` | Chơi | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 20 | `legacy-sy1zfp` | `live-9c63de0e-7f0c-4c61-99f2-37687a545457` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 21 | `legacy-6h1qct` | `live-ec9d5944-6bfe-42d9-a2eb-cf4623db55a5` | Ngủ | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 22 | `legacy-18y139x` | `pending-e5c5f573-2d10-42d0-aec9-9d8c8b357aff` | Ăn | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |
| 23 | `legacy-1t2jdc2` | `pending-e5c5f573-2d10-42d0-aec9-9d8c8b357aff` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 24 | `legacy-10sgrjn` | `pending-e5c5f573-2d10-42d0-aec9-9d8c8b357aff` | Ăn | thường | không | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → không dùng cho tới khi xác minh |
| 25 | `legacy-10a3q91` | `pending-5d52f858-7300-4514-9ed1-5eece316caef` | Ăn | thường | **có** | Khách gửi qua form “Bổ sung ảnh” (có bản ghi góp ý đã duyệt) | Chưa xác minh | Bề mặt mới → minh họa cho tới khi xác minh |

## Cách xác minh (đề xuất, chờ PM)

1. Chủ dự án/Admin xem từng ảnh. Ảnh do chính CDP chụp hoặc có liên hệ được người gửi để xin phép thì ghi bằng chứng (ngày, cách xác nhận) vào cột Tình trạng.
2. Ảnh có dấu hiệu lấy từ nguồn khác (ảnh mạng, logo, ảnh có watermark) thì đề xuất gỡ. Gỡ là thao tác dữ liệu, cần duyệt riêng; A3 không làm.
3. Không xác minh được thì giữ “chưa xác minh” và dùng minh họa ở bề mặt mới.
