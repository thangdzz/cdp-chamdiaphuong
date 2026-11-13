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

**vNext UX/UI — Bản đồ gấp + Cơ bản: A3 ACCEPTED → PLAN A4 duyệt có điều chỉnh (13/11) → BUILD A4 đang làm.**
**Chưa deploy, chưa release, không rollback. Chưa làm A5.**
- **Kế hoạch A4** (Trang chủ B + giới hạn tiêu đề Admin 60 ký tự): [SPEC-A4-trang-chu.md](SPEC-A4-trang-chu.md).
- **Quay lại bản trước / phát hành:** [VAN-HANH-RELEASE-ROLLBACK.md](VAN-HANH-RELEASE-ROLLBACK.md) — rollback code không khôi
  phục dữ liệu; Hobby chỉ rollback về bản liền trước; CLI Vercel đang đăng xuất (13/11).
- **Báo cáo A3:** [REPORT-A3-anh-minh-hoa-2026-11-12.md](REPORT-A3-anh-minh-hoa-2026-11-12.md). Commit `81ca254` (SVG),
  `2f8f425` (ảnh menu không còn làm ảnh đại diện — đúng 1/344 chỗ đổi), `5e7b5fe` (`photo` cho `/tim`, +0,97 KB nén),
  `29b413d` (`PlaceThumb`, chưa gắn màn nào). Ảnh: https://claude.ai/artifact/KaoM2j3fDJLntc64FMdCut.
- **Ảnh (13/11):** **Chủ dự án xác nhận ngày 13/11/2026: ảnh hiện có do chính chủ dự án chụp/tải lên.** Ảnh hiện có **dùng được** ở vị trí mới A5–A8.
  Hồ sơ kỹ thuật gốc giữ nguyên: [KIEM-KE-anh-legacy-2026-11-12.md](KIEM-KE-anh-legacy-2026-11-12.md).
- Nghiệm thu A2: [PM-NGHIEM-THU-A2-CDP-2026-11-12.md](PM-NGHIEM-THU-A2-CDP-2026-11-12.md). Việc còn lại đã xếp theo bước
  A4–A9 + TEST A trong [TASKS.md](TASKS.md).
- **Báo cáo A2:** [REPORT-A2-khung-dieu-huong-2026-11-12.md](REPORT-A2-khung-dieu-huong-2026-11-12.md). Commit `6285ed5`
  (A2-0 tên đủ + `/tim`), `4e546e8` (màu khung), `6e43aa6` (thanh đáy), `7f56897` (Menu + sidebar), `ed6e927` (footer
  Admin). Ảnh trước/sau: https://claude.ai/artifact/KFGeAHdFkFcKYkcmyi33by.
- A2-0 đạt: 0/218 trạng thái header có “…” (320–1280px, phóng chữ tới 200%, Chromium + WebKit).
- **Còn phải kiểm trên iPhone/Android thật + Zalo/Facebook** (vùng an toàn, bàn phím) — cổng trước RELEASE A.
- Kế hoạch + Q1–Q5: [SPEC-A2-khung-dieu-huong.md](SPEC-A2-khung-dieu-huong.md) §14.
- **Quy tắc chủ dự án:** tên thương hiệu không bao giờ bị “…”/rút gọn. Còn một trạng thái header bị cắt = A2 FAIL.
- Nghiệm thu A1: [PM-NGHIEM-THU-A1-VA-YEU-CAU-A2-0-CDP-2026-11-12.md](PM-NGHIEM-THU-A1-VA-YEU-CAU-A2-0-CDP-2026-11-12.md).
- **Báo cáo A1:** [REPORT-A1-mau-va-font-2026-11-12.md](REPORT-A1-mau-va-font-2026-11-12.md). Commit `2ee6f00` (token)
  + `7ca6816` (font); ảnh trước/sau https://claude.ai/artifact/WW4nd64x7VzKz8RoXzV3MR.
- `main` giờ có giao diện dở (font + nền mới, màu từng màn còn cũ): **không deploy `main`** tới RELEASE A. Sửa gấp
  production → nhánh từ tag `prod-2026-09-30` (= `e3b38a4`).
- Còn lại cho bước sau: vệt dấu dưới ô `line-clamp` (A5–A7, phải sửa trước production); lớp cố định của Chi tiết /
  bộ chọn / form đề xuất chưa đệm tai thỏ khi xoay ngang (A6/A8); footer chữ 12px (A9 hoặc PM cho sửa).
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

1. PM duyệt [PLAN A4](SPEC-A4-trang-chu.md) + chốt câu hỏi.
2. Code A4 theo thứ tự commit trong SPEC → REPORT A4.
