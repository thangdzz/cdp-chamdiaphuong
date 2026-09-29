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
- Bản deploy mới nhất: **`chamdiaphuongio-87p9xw2vr` (2026-09-29)** = hotfix `de8e1bc`. Bản trước:
  `eex4ejxif` (22/9).
- Dữ liệu: 281 địa điểm trên trang chủ (29/9: Ăn 159 · Chơi 37 · Ngủ 65 · Đi lại 20), **11 chỗ đã ghim toạ độ**. Routine quét tự chạy mỗi
  sáng và tự đăng (xem [ROUTINE.md](ROUTINE.md)); chỉ giữ chờ duyệt khi nghi trùng/mâu thuẫn.
- Kiểm tra: `npm run lint` sạch 0 lỗi · `npm test` 36 test đạt (22/9).

## Hotfix 29/9 — ĐÃ DEPLOY (`87p9xw2vr`)

- Game kết thúc 23:59 27/9 → trang chủ không còn cổng vào game; khối game trong bài lễ hội ghi
  "Mùa 2026 đã kết thúc".
- **Bỏ nhãn "còn chỗ"** (chỉ suy theo lịch lễ hội) — làm lại khi có dữ liệu thật.
- vNext giữ vùng dữ liệu Tuyên Quang hiện có; "TP Tuyên Quang cũ" không còn là ranh giới cố định.
- Lint sạch · `npm test` 36/36 · `npm run build` đạt. Lý do: DECISIONS "2026-09-29 (sau)".

Kiểm production sau deploy (Playwright, iPhone 13 + desktop 1366, chỉ đọc): 34/34 đạt — trang
chủ không còn cổng game, không còn nhãn "còn chỗ" (cả khi bung thẻ và ở trang địa điểm), 4 tab
lọc + tìm kiếm chạy, `/so` `/lo-trinh` `/gioi-thieu` 200, trang lễ hội hiện "Mùa 2026 đã kết thúc"
+ "Xem lại bản đồ mùa 2026", không có lỗi JS.

Còn sót nhỏ, **để kế hoạch vNext** (không sửa trong hotfix): câu giới thiệu thẻ game vẫn là "Tối
nay bạn gặp được bao nhiêu mô hình?"; trang game vẫn có tab "Bản đồ tối nay" (thông báo hết mùa
thì có sẵn); trên mobile nút nổi xám đè mép phải ô tìm kiếm trang chủ.

## Câu hỏi mở — chờ Product Owner chốt

1. **Giá mùa cao điểm** — một ô giá cho cả năm. Chọn hướng trước khi code (BACKLOG §1).
2. **Ghi chú trong lộ trình chia sẻ** — riêng tư hay công khai qua duyệt (BACKLOG §3).
3. **Banner "Lễ hội Thành Tuyên 2026" to trên trang chủ** (không phải game) vẫn hiện sau lễ hội —
   vNext quy định nội dung theo mùa không chiếm vai trò lõi; xử lý trong kế hoạch vNext.

## Bước tiếp theo hợp lý nhất

1. Product Owner duyệt kế hoạch vNext (đã trình 29/9)
2. Sau khi duyệt: viết spec chi tiết cho vNext (đối chiếu code hiện tại: `app/page.js`,
   `app/PlaceExplorer.js`, trang địa điểm, `lib/notebooks.js`) → trình duyệt → mới code.
