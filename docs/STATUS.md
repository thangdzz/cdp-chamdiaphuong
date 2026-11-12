# STATUS — Tình trạng hiện tại

> File này chỉ giữ **trạng thái hiện tại** — ngắn, đọc 2 phút là nắm. Cập nhật cuối mỗi phiên
> (ghi đè phần cũ, không cộng dồn thành nhật ký). Nhật ký các phiên trước:
> [archive/logs/STATUS-log-2026-07-15-den-09-22.md](archive/logs/STATUS-log-2026-07-15-den-09-22.md).
> Chi tiết từng lượt sửa: [TASKS.md](TASKS.md) · lý do: [DECISIONS.md](DECISIONS.md) (29/9–30/9).

Cập nhật: **2026-11-12**

---

## Quy tắc cố định cần nhớ

**Sổ / tài khoản / đồng bộ:** chưa có tài khoản; Sổ và Lộ trình gắn với thiết bị (mã ẩn danh), không tự đồng
bộ; mã khôi phục 6 số = khôi phục thủ công; Ghi chú chỉ trên thiết bị. Chi tiết: [DECISIONS.md](DECISIONS.md)
2026-11-12. **Chờ chủ dự án duyệt** câu bổ sung vào PRODUCT.md (nằm trong mục DECISIONS đó).

## Đang làm (12/11)

**vNext UX/UI — Bản đồ gấp + Cơ bản: BUILD A1 (màu + font) xong, đã push, chờ PM nghiệm thu.** **Chưa deploy.**
Chưa làm A2.
- **Báo cáo A1:** [REPORT-A1-mau-va-font-2026-11-12.md](REPORT-A1-mau-va-font-2026-11-12.md). Commit `2ee6f00` (token)
  + `7ca6816` (font); ảnh trước/sau https://claude.ai/artifact/WW4nd64x7VzKz8RoXzV3MR.
- `main` giờ có giao diện dở (font + nền mới, màu từng màn còn cũ): **không deploy `main`** tới RELEASE A. Sửa gấp
  production → nhánh từ tag `prod-2026-09-30` (= `e3b38a4`).
- Còn lại cho bước sau: tên header bị “…” ở 320px (A2); vệt dấu dưới ô `line-clamp` (A5–A7).
- Kế hoạch + quyết định Q1–Q3: [SPEC-A1-mau-va-font.md](SPEC-A1-mau-va-font.md).
- Bản ghi FREEZE (tài liệu khóa, rủi ro, thứ tự BUILD, xác minh Git §9): [FREEZE-UXUI-ban-do-gap-2026-11-12.md](FREEZE-UXUI-ban-do-gap-2026-11-12.md).
- CLI Vercel trên máy **hết phiên đăng nhập**. Cần `vercel login` trước khi RELEASE.
- Scope FROZEN v1.0 + checklist A/B: [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md).
- [DESIGN.md](DESIGN.md) **v2.0 hiệu lực 12/11** (v1 trong `archive/2026-11-uxui-freeze/`).
- Mockup 9 bảng (tham khảo): https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo.
- Bộ minh họa 5 SVG đã duyệt hướng: `docs/design/minh-hoa/` (chưa vào production).
- Chờ chủ dự án: 2 sửa nhỏ PRODUCT.md (FREEZE record §4). Chờ PM: xếp ưu tiên 2 lỗi khôi phục (BACKLOG §3).
- Kiểm kê: [KIEM-KE-anh-so-lieu-nen-2026-11-11.md](KIEM-KE-anh-so-lieu-nen-2026-11-11.md); thêm 12/11: Ăn có
  145/192 chỗ chưa có giá, 0/192 có lượt xác nhận.

## Bản phát hành gần nhất (vNext Core Discovery, 30/9)

**vNext — Core Discovery Flow: ĐÃ RELEASE lên production (2026-09-30).**
Commit `e3b38a4` · deployment `chamdiaphuongio-og2r8pgy7` · https://chamdiaphuong.io.vn.
[SCOPE-vNext.md](SCOPE-vNext.md) đánh dấu RELEASED. Scope tiếp theo: UX/UI Bản đồ gấp (FROZEN 12/11, ở trên).

- Product Owner test tay đạt, `two-wheeler` đã kiểm trên iPhone thật — hoạt động đúng.
- Smoke test production (iPhone 13 + desktop, chặn mọi lượt ghi + analytics): **307/307** — luồng
  Home → /tim → Place → Lưu vào Sổ → Xem Sổ, tìm "Phở", Quay lại, ô 2 SĐT, nút Lưu thay đổi, không
  lỗi JS; 12 trang chính 200, trang không tồn tại 404; log Vercel không có lỗi.
- Trước deploy: lint sạch · `npm test` 70/70 · build đạt.

## Web đang chạy

- Link: **https://chamdiaphuong.io.vn** · trang duyệt `/admin` (một mật khẩu chung).
- Bản deploy mới nhất: **`chamdiaphuongio-og2r8pgy7` (2026-09-30)** = vNext `e3b38a4`. Bản trước:
  `87p9xw2vr` (29/9, hotfix `de8e1bc`) — muốn quay lại thì promote bản này trên Vercel.
- Dữ liệu: 344 địa điểm (kiểm 11/11; Ăn · Chơi · Ngủ · Đi lại + 2 Chỗ quen gọi). Routine quét tự chạy mỗi sáng và tự đăng
  (xem [ROUTINE.md](ROUTINE.md)); chỉ giữ chờ duyệt khi nghi trùng/mâu thuẫn.
- Analytics vNext đang đếm theo ngày: `search_use`, `category_pick`, `place_open`, `notebook_save`.

## Câu hỏi mở — chờ Product Owner chốt (ngoài scope UX/UI)

1. **Giá mùa cao điểm** — một ô giá cho cả năm. Chọn hướng trước khi code (BACKLOG §1).
2. **Ghi chú trong lộ trình chia sẻ** — riêng tư hay công khai qua duyệt (BACKLOG §3).

(Font tiếng Việt đã chốt trong DESIGN.md v2.0: Be Vietnam Pro + Literata. Dọn `PlaceExplorer.js` nằm trong BACKLOG.)

## Bước tiếp theo hợp lý nhất

1. PM nghiệm thu [A1](REPORT-A1-mau-va-font-2026-11-12.md).
2. Trình kế hoạch ngắn A2 (khung + thanh đáy + Menu) → PM duyệt → code A2.
