# STATUS — Tình trạng hiện tại

> File này chỉ giữ **trạng thái hiện tại** — ngắn, đọc 2 phút là nắm. Cập nhật cuối mỗi phiên
> (ghi đè phần cũ, không cộng dồn thành nhật ký). Nhật ký các phiên trước:
> [archive/logs/STATUS-log-2026-07-15-den-09-22.md](archive/logs/STATUS-log-2026-07-15-den-09-22.md).

Cập nhật: **2026-09-29**

---

## Đang ở đâu

- **Định hướng mới đã chốt:** [PRODUCT.md](PRODUCT.md) là nguồn chuẩn cao nhất (người địa
  phương là nền móng dữ liệu). Việc sắp build: [SCOPE-vNext.md](SCOPE-vNext.md) — Core
  Discovery Flow *Home → Search → Place → Lưu vào Sổ*. **Chưa bắt đầu build.**
- **2026-09-29 — dọn tài liệu xong** (chờ Product Owner duyệt): tài liệu cũ chuyển vào
  `docs/archive/`, ý tưởng còn giá trị trích sang [INBOX.md](INBOX.md) / [BACKLOG.md](BACKLOG.md).
  Lý do: DECISIONS 2026-09-29.
- **Game Săn đèn Thành Tuyên 2026 đã kết thúc** 23:59 ngày 27/09/2026 (chốt của Product Owner).
  Tài liệu game ở `archive/2026-thanh-tuyen-game/`. Dữ liệu game trong Redis giữ nguyên.

## Web đang chạy

- Link: **https://chamdiaphuong.io.vn** · trang duyệt `/admin` (một mật khẩu chung).
- Bản deploy mới nhất: `chamdiaphuongio-eex4ejxif` (2026-09-22) — nhật ký ghim xem được,
  tìm Google trong form admin, lint sạch, 36 test hàm thuần.
- Dữ liệu: ~241 địa điểm công khai (22/9), **11 chỗ đã ghim toạ độ**. Routine quét tự chạy mỗi
  sáng và tự đăng (xem [ROUTINE.md](ROUTINE.md)); chỉ giữ chờ duyệt khi nghi trùng/mâu thuẫn.
- Kiểm tra: `npm run lint` sạch 0 lỗi · `npm test` 36 test đạt (22/9).

## Câu hỏi mở — chờ Product Owner chốt

1. **Nhãn "còn chỗ" theo lịch lễ hội** (Ăn/Ngủ) — vNext không nhắc tới; ngày lễ hội 2026 đang
   viết cứng trong `app/occupancy.js`. Giữ, bỏ, hay làm lại theo dữ liệu thật?
2. **Phạm vi địa lý** — tài liệu cũ giới hạn TP Tuyên Quang (cũ); PRODUCT lấy ví dụ Tam Đảo
   nhưng không nói rõ. vNext có còn giới hạn vùng không?
3. **Ngày kết thúc game lệch nhau** — Product Owner chốt 27/9, nhưng code
   (`lib/game/seasons/thanh-tuyen-2026.js`) để `endAt` = **30/9 23:59**, nên trang chủ và trang
   lễ hội vẫn hiện khối game tới 30/9. Chưa sửa (đợt này chỉ dọn tài liệu).
4. **Giá mùa cao điểm** — một ô giá cho cả năm. Chọn hướng trước khi code (BACKLOG §1).
5. **Ghi chú trong lộ trình chia sẻ** — riêng tư hay công khai qua duyệt (BACKLOG §3).

## Bước tiếp theo hợp lý nhất

1. Product Owner duyệt đợt dọn tài liệu 29/9.
2. Chốt câu hỏi mở 1–3 (ảnh hưởng trực tiếp tới Home/kết quả tìm kiếm của vNext).
3. Viết kế hoạch/spec chi tiết cho vNext (đối chiếu code hiện tại: `app/page.js`,
   `app/PlaceExplorer.js`, trang địa điểm, `lib/notebooks.js`) → trình duyệt → mới code.
