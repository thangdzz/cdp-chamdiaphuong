# STATUS — Tình trạng hiện tại

> File này chỉ giữ **trạng thái hiện tại** — ngắn, đọc 2 phút là nắm. Cập nhật cuối mỗi phiên
> (ghi đè phần cũ, không cộng dồn thành nhật ký). Nhật ký các phiên trước:
> [archive/logs/STATUS-log-2026-07-15-den-09-22.md](archive/logs/STATUS-log-2026-07-15-den-09-22.md).
> Chi tiết từng lượt sửa: [TASKS.md](TASKS.md) · lý do: [DECISIONS.md](DECISIONS.md) (29/9–30/9).

Cập nhật: **2026-09-30**

---

## Đang ở đâu

**vNext — Core Discovery Flow: ĐÃ RELEASE lên production (2026-09-30).**
Commit `e3b38a4` · deployment `chamdiaphuongio-og2r8pgy7` · https://chamdiaphuong.io.vn.
[SCOPE-vNext.md](SCOPE-vNext.md) đánh dấu RELEASED. **Chưa mở Scope mới, chưa làm MAY.**

- Product Owner test tay đạt, `two-wheeler` đã kiểm trên iPhone thật — hoạt động đúng.
- Smoke test production (iPhone 13 + desktop, chặn mọi lượt ghi + analytics): **307/307** — luồng
  Home → /tim → Place → Lưu vào Sổ → Xem Sổ, tìm "Phở", Quay lại, ô 2 SĐT, nút Lưu thay đổi, không
  lỗi JS; 12 trang chính 200, trang không tồn tại 404; log Vercel không có lỗi.
- Trước deploy: lint sạch · `npm test` 70/70 · build đạt.

## Web đang chạy

- Link: **https://chamdiaphuong.io.vn** · trang duyệt `/admin` (một mật khẩu chung).
- Bản deploy mới nhất: **`chamdiaphuongio-og2r8pgy7` (2026-09-30)** = vNext `e3b38a4`. Bản trước:
  `87p9xw2vr` (29/9, hotfix `de8e1bc`) — muốn quay lại thì promote bản này trên Vercel.
- Dữ liệu: ~290 địa điểm (Ăn · Chơi · Ngủ · Đi lại). Routine quét tự chạy mỗi sáng và tự đăng
  (xem [ROUTINE.md](ROUTINE.md)); chỉ giữ chờ duyệt khi nghi trùng/mâu thuẫn.
- Analytics vNext đang đếm theo ngày: `search_use`, `category_pick`, `place_open`, `notebook_save`.

## Follow-up sau release (chưa làm — chờ Product Owner)

- Font có tiếng Việt (Be Vietnam Pro / Inter) — UX follow-up.
- Dọn `PlaceExplorer.js` / `PersonalNote.js` không còn dùng.
- MAY của vNext — chỉ khi Product Owner duyệt.

## Câu hỏi mở — chờ Product Owner chốt

1. **Giá mùa cao điểm** — một ô giá cho cả năm. Chọn hướng trước khi code (BACKLOG §1).
2. **Ghi chú trong lộ trình chia sẻ** — riêng tư hay công khai qua duyệt (BACKLOG §3).
3. **Font có tiếng Việt** — Be Vietnam Pro / Inter (UX follow-up).

## Bước tiếp theo hợp lý nhất

1. Theo dõi vài ngày số event Home → Search → Place → Save (SCOPE-vNext "OUTCOME") để thấy khách
   rơi ở bước nào.
2. Product Owner chọn việc tiếp theo (Scope mới / MAY / follow-up) — **chưa tự mở**.
