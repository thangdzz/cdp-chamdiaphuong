# HANDOFF — Bàn giao trạng thái

> Cập nhật: **2026-09-12**. Đọc cùng [/AGENTS.md](../AGENTS.md) (quy tắc) và
> [ARCHITECTURE.md](ARCHITECTURE.md) (bản đồ code).
> Nhật ký chi tiết từng phiên: [STATUS.md](STATUS.md). Việc: [TASKS.md](TASKS.md).

---

## 1. Task hiện tại

Không có việc nào đang code dở. Phiên gần nhất (11/9) **đã đóng trọn vẹn**: code xong, build
sạch, test qua, đã deploy production và đã dọn dữ liệu test.

Bối cảnh chi phối mọi ưu tiên: **Lễ hội Thành Tuyên 19–25/9/2026** — còn khoảng một tuần. Việc
gì phục vụ đợt cao điểm này thì làm trước.

---

## 2. Đã làm tới đâu

**Đã chạy trên production** (`chamdiaphuong.io.vn`, deploy gần nhất `web-kn1qetbwx`):

- **NOTE-07 (P0+P1)** — sửa Safari tự phóng to khi gõ; `PlacePicker` dùng chung cho tạo/sửa
  lộ trình; khách đề xuất địa điểm mới → vào lộ trình ngay kèm nhãn "CDP chưa xác minh", đồng
  thời xếp hàng chờ trong `/admin`; duyệt → thành địa điểm chính thức ở mọi lộ trình, từ chối
  → thành điểm riêng (không biến mất).
- **Bốn chỗ vướng khi dựng lộ trình thật** — ô "Điểm riêng" tự điền chữ đang gõ; chuỗi gửi
  Google Maps luôn kèm địa chỉ; cho phép thêm **một chỗ nhiều lần** vào cùng lộ trình; thời
  lượng viết thành "Ở đây khoảng 4 tiếng" thay vì "Khoảng 240 phút".
- **Đổi chỗ tại vị trí** — mỗi điểm có nút "Đổi chỗ", thay ngay tại vị trí đang đứng, giữ
  nguyên giờ/thời lượng/ghi chú; điểm riêng sửa được tên tại chỗ.
- **Tỉnh/thành cho điểm riêng** — 34 tỉnh/thành (sắp xếp 01/7/2025), mặc định Tuyên Quang.
  Sửa lỗi gắn cứng "Tuyên Quang" vào nhà của khách ở tỉnh khác.
- **CDP_P1-P8 P1/P2/P3** — trang lễ hội thành **timeline động** (trạng thái tính theo giờ VN
  mỗi lượt xem, mốc đã qua thu gọn, nhãn "Đang diễn ra"/"Dự kiến"); **card trang chủ** khớp
  nội dung và lấy mốc sắp tới từ cùng nguồn dữ liệu; khối **"Bạn định đi thế nào?"** biến
  người đọc bài thành người tạo lộ trình.

---

## 3. File vừa sửa (4 commit gần nhất)

| Nhóm | File |
|---|---|
| Mới | `web/lib/events.js` · `web/lib/postEvents/le-hoi-thanh-tuyen-2026.js` · `web/lib/provinces.js` · `web/lib/durationFormat.js` · `web/app/InteractivePlan.js` · `web/app/le-hoi-thanh-tuyen/EventCard.js` |
| Sửa | `web/lib/routes.js` · `web/lib/mapsUrl.js` · `web/lib/routeShare.js` · `web/app/routeActions.js` · `web/app/PlacePicker.js` · `web/app/page.js` · `web/app/le-hoi-thanh-tuyen/page.js` · `web/app/lo-trinh/[slug]/page.js` · `web/app/lo-trinh/[slug]/sua/page.js` · `web/app/lo-trinh/xem/[token]/page.js` |
| Tài liệu | `docs/ARCHITECTURE.md` · `docs/DECISIONS.md` · `docs/STATUS.md` · `docs/TASKS.md` |

Commit: `088581e` timeline động · `e16eb67` tỉnh cho điểm riêng · `383bc55` đổi chỗ ·
`8911541` lặp điểm + thời lượng · `4b4d68d` PlacePicker + đề xuất địa điểm.

---

## 4. Lỗi / chỗ đang dở

| Mức | Việc |
|---|---|
| 🔴 | **Sửa lịch lễ hội vẫn phải deploy.** Dữ liệu nằm ở `lib/postEvents/*.js`, chưa đọc từ Redis, chưa có màn admin. Chủ dự án không tự sửa được — mà lễ hội đang tới và có mốc còn ghi "Dự kiến". |
| 🔴 | **Giá mùa cao điểm.** `places:live` chỉ có **một ô giá**. Khách sạn 900k ngày thường có thể 2,5 triệu dịp lễ hội → đúng tuần đông khách nhất thì web hiển thị sai với chính nhóm cần nó nhất. Là rủi ro uy tín, chưa có hướng xử lý, cần bàn trước khi code. |
| 🟡 | **0/210 địa điểm có toạ độ.** Chặn toàn bộ P2 của NOTE-07 và Phase 3 của P1-P8: bản đồ, khoảng cách/thời gian từng chặng, tối ưu tuyến. Hướng đề xuất: chỉ geocode những chỗ thực sự được dùng trong lộ trình. |
| 🟡 | **1 lỗi lint cũ** ở `web/app/PlaceExplorer.js` (`react-hooks/set-state-in-effect`). Có từ trước, chưa sửa. Mốc "sạch" hiện tại = đúng 1 lỗi này. |
| 🟡 | **Không có bộ test trong repo.** Kiểm thử đang làm bằng script Playwright rời, chạy tay, không commit. Ai tiếp quản nên cân nhắc đưa vào repo. |
| 🟢 | Header chưa có link "Lộ trình của tôi" (chỉ có link chéo ở `/so`). |
| 🟢 | "Danh Khoa - Cho thuê xe tự lái" đang xếp `thue-o-to` theo phỏng đoán, chưa xác minh. |
| 🟢 | Dữ liệu cũ chưa ai kiểm lại: thiếu trường `lastVerifiedAt`, xem [SPEC-kiem-lai-du-lieu.md](SPEC-kiem-lai-du-lieu.md). |

---

## 5. Bước tiếp theo nên làm

Xếp theo mức đáng làm trước lễ hội:

1. **Cho sửa lịch lễ hội không cần deploy** — đọc `FESTIVAL_EVENTS` từ Redis (rơi về file
   tĩnh khi key rỗng) + một màn sửa mốc trong `/admin`. Lịch đã tách hẳn khỏi giao diện nên
   chỉ phải thay chỗ lấy mảng. Đây là bước đầu tiên của Phase 2 (Content Monitor) và là việc
   gấp nhất vì lễ hội đang tới.
2. **Bàn hướng xử lý giá mùa cao điểm** — cần chủ dự án chốt trước, đừng tự code.
3. **Lộ trình mẫu của CDP** (`is_featured`) + nút "Dùng lộ trình này" (clone sang tài khoản
   người dùng) — `CDP_P1-P8 §Phase 2`. Toàn bộ hạ tầng Route đã có, chỉ thiếu cờ featured và
   hàm clone.
4. **Toạ độ địa điểm** — mở khoá bản đồ và khoảng cách/thời gian.
5. Phase 2 còn lại: Source Registry, Content Monitor, admin duyệt diff.

**Trước khi bắt tay bất kỳ việc nào:** đọc [/AGENTS.md](../AGENTS.md) §6 (những thứ không
được tự ý đổi) và trình kế hoạch ngắn cho chủ dự án duyệt.
