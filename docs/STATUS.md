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
- **2026-09-29 — dọn tài liệu xong, đã duyệt và push** (`1191e43`): tài liệu cũ chuyển vào
  `docs/archive/`, ý tưởng còn giá trị trích sang [INBOX.md](INBOX.md) / [BACKLOG.md](BACKLOG.md).
  Lý do: DECISIONS 2026-09-29.
- **Game Săn đèn Thành Tuyên 2026 đã kết thúc** 23:59 ngày 27/09/2026 (chốt của Product Owner;
  code sửa ở hotfix 29/9). Tài liệu game ở `archive/2026-thanh-tuyen-game/`. Dữ liệu game trong
  Redis giữ nguyên.

## Web đang chạy

- Link: **https://chamdiaphuong.io.vn** · trang duyệt `/admin` (một mật khẩu chung).
- Bản deploy mới nhất: `chamdiaphuongio-eex4ejxif` (2026-09-22) — nhật ký ghim xem được,
  tìm Google trong form admin, lint sạch, 36 test hàm thuần.
- Dữ liệu: ~241 địa điểm công khai (22/9), **11 chỗ đã ghim toạ độ**. Routine quét tự chạy mỗi
  sáng và tự đăng (xem [ROUTINE.md](ROUTINE.md)); chỉ giữ chờ duyệt khi nghi trùng/mâu thuẫn.
- Kiểm tra: `npm run lint` sạch 0 lỗi · `npm test` 36 test đạt (22/9).

## Hotfix 29/9 (commit riêng, **chưa deploy**)

- Game kết thúc 23:59 27/9 → trang chủ không còn cổng vào game; khối game trong bài lễ hội ghi
  "Mùa 2026 đã kết thúc".
- **Bỏ nhãn "còn chỗ"** (chỉ suy theo lịch lễ hội) — làm lại khi có dữ liệu thật.
- vNext giữ vùng dữ liệu Tuyên Quang hiện có; "TP Tuyên Quang cũ" không còn là ranh giới cố định.
- Lint sạch · `npm test` 36/36 · `npm run build` đạt. Lý do: DECISIONS "2026-09-29 (sau)".

⚠️ Production vẫn là bản 22/9 — hotfix chỉ lên web khi deploy (**chờ Product Owner cho lệnh**).
Trong lúc chưa deploy, web thật vẫn hiện cổng vào game tới hết 30/9 và vẫn còn nhãn "còn chỗ".

## Câu hỏi mở — chờ Product Owner chốt

1. **Giá mùa cao điểm** — một ô giá cho cả năm. Chọn hướng trước khi code (BACKLOG §1).
2. **Ghi chú trong lộ trình chia sẻ** — riêng tư hay công khai qua duyệt (BACKLOG §3).
3. **Banner "Lễ hội Thành Tuyên 2026" to trên trang chủ** (không phải game) vẫn hiện sau lễ hội —
   vNext quy định nội dung theo mùa không chiếm vai trò lõi; xử lý trong kế hoạch vNext.

## Bước tiếp theo hợp lý nhất

1. Product Owner cho lệnh deploy hotfix 29/9 (hoặc gộp deploy cùng vNext).
2. Viết kế hoạch/spec chi tiết cho vNext (đối chiếu code hiện tại: `app/page.js`,
   `app/PlaceExplorer.js`, trang địa điểm, `lib/notebooks.js`) → trình duyệt → mới code.
