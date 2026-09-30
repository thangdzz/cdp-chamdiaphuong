# STATUS — Tình trạng hiện tại

> File này chỉ giữ **trạng thái hiện tại** — ngắn, đọc 2 phút là nắm. Cập nhật cuối mỗi phiên
> (ghi đè phần cũ, không cộng dồn thành nhật ký). Nhật ký các phiên trước:
> [archive/logs/STATUS-log-2026-07-15-den-09-22.md](archive/logs/STATUS-log-2026-07-15-den-09-22.md).

Cập nhật: **2026-09-29**

---

## Đang ở đâu

- **30/9 (khuya, sau) — chỉnh tiếp**: SĐT có số tham khảo + Tìm số trên Google + Số đúng/sai cạnh
  số; "Cần biết" chỉ để đọc; "Sửa giúp" 3 nhóm. Kiểm 209/209. **Chưa deploy.**
- **30/9 (khuya) — trang địa điểm gom còn 2 vùng** (Thông tin địa điểm + Cần biết), kiểm 177/177.
  **Chưa deploy.**
- **30/9 (tối) — trang địa điểm làm lại theo bố cục PO duyệt** (tóm tắt 6 thông tin + 2 nút,
  xác nhận hai bước, phần gập). Kiểm tự động 180/180. **Chưa deploy.**
- **30/9 (sau) — thêm nút Quay lại dùng chung + đóng góp theo ngữ cảnh**; kiểm tự động 160/160.
  **Chưa deploy.**
- **30/9 — đã sửa 4 mục theo owner test** (tìm kiếm, trang địa điểm, thẻ Sổ, "Đi bằng gì"), kiểm
  tự động 107/107 trên iPhone 13 + desktop. **Chưa deploy.** Còn chờ Product Owner: (1) thử link
  `two-wheeler` trên điện thoại thật, (2) chọn font có tiếng Việt. Lý do: DECISIONS 2026-09-30.

- **vNext — Core Discovery Flow: MUST đã build xong ở máy (29/9), CHỜ Product Owner test.**
  Chưa deploy production. Chi tiết từng bước + commit: [TASKS.md](TASKS.md); lựa chọn khi làm:
  DECISIONS "2026-09-29 (tối)". Thử ở `http://localhost:3100` (hoặc `http://MAdz.local:3100` trên
  điện thoại cùng wifi). MAY chưa làm.

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

1. Product Owner test luồng Home → Tìm → Chi tiết → Lưu vào Sổ trên điện thoại thật
2. Duyệt → làm MAY (nếu muốn) → deploy production → dọn `PlaceExplorer.js` (đối chiếu code hiện tại: `app/page.js`,
   `app/PlaceExplorer.js`, trang địa điểm, `lib/notebooks.js`) → trình duyệt → mới code.
