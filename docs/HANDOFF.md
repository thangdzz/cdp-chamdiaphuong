# HANDOFF — Bàn giao trạng thái

> Cập nhật: **2026-11-12**. Kênh bàn giao duy nhất giữa Claude Code và Codex — quy tắc ở
> [/AGENTS.md](../AGENTS.md) §7. Giữ file này **ngắn**: chỉ trạng thái hiện tại, ghi đè bản cũ.
> Bản bàn giao cũ (tới 17/9): [archive/logs/HANDOFF-2026-09-17.md](archive/logs/HANDOFF-2026-09-17.md).

---

## 0. Quy tắc phải đọc trước (không hỏi lại PM)

**Sổ / tài khoản / đồng bộ** — [DECISIONS.md](DECISIONS.md) mục 2026-11-12. Tóm tắt: chưa có tài khoản; Sổ và
Lộ trình lưu trên server nhưng **gắn với thiết bị qua mã ẩn danh**, **không tự đồng bộ**; mã khôi phục 6 số là
**khôi phục thủ công** (cơ chế: [ARCHITECTURE.md](ARCHITECTURE.md) “Truy cập Sổ/Lộ trình từ thiết bị khác”);
Ghi chú riêng chỉ trên thiết bị. Câu chữ chuẩn: “Sổ của bạn gắn với thiết bị này. Chưa có đồng bộ tự động giữa
các thiết bị.”

## 1. Task hiện tại

**vNext UX/UI — Bản đồ gấp + Cơ bản: A3 ACCEPTED (13/11) → PLAN A4 chờ PM duyệt** ([SPEC-A4-trang-chu.md](SPEC-A4-trang-chu.md)).
**Không code A4 trước khi PM duyệt.** Phát hành / rollback: **[VAN-HANH-RELEASE-ROLLBACK.md](VAN-HANH-RELEASE-ROLLBACK.md)** —
rollback code không khôi phục dữ liệu; Hobby chỉ về bản liền trước; tag `prod-2026-09-30` không bao giờ sửa.
Việc còn lại theo từng bước A4–A9 + TEST A: bảng trong [TASKS.md](TASKS.md).
- Ảnh: **một quy tắc** — `placeCoverMedia()` (không bao giờ ảnh menu) → `placePhoto()` / `placeIllustration()` trong
  `lib/placeImage.js`; hiển thị bằng `app/PlaceThumb.js` (A5–A8 dùng, không tự viết lại xử lý ảnh lỗi). Minh họa:
  `web/public/minh-hoa/`. **Ảnh hiện có dùng được ở A5–A8**: chủ dự án xác nhận 13/11 toàn bộ ảnh hiện có do
  mình chụp/tải lên (DECISIONS 13/11). Ảnh đóng góp **về sau** mới cần xác nhận quyền (A6).
- Khung mới: `BottomNav.js` (thanh đáy), `lib/shellRoutes.js` (trang nào có thanh đáy — thêm thanh hành động ở A6–A8 thì
  sửa ở đây), biến CSS `--cdp-header-h` / `--cdp-bottom-nav-h`. Cấu hình điều hướng có 6 mục (thêm `search`).

- **Quy tắc cố định của chủ dự án:** tên “Chạm Địa Phương” luôn hiện đủ ở mọi header khách, kể cả 320px. Cấm
  `truncate`/`ellipsis`/`line-clamp`/“CDP” thay tên. Đã làm ở A2-0 (`BrandName` trong `SiteHeader.js`); đừng thêm lại.
- A1 (`2ee6f00` token, `7ca6816` font): [REPORT-A1-mau-va-font-2026-11-12.md](REPORT-A1-mau-va-font-2026-11-12.md).
  **Chưa deploy; không deploy `main`** (giao diện dở) tới RELEASE A. Sửa gấp production → nhánh từ tag `prod-2026-09-30`.
- Kế hoạch A1 + Q1–Q3: [SPEC-A1-mau-va-font.md](SPEC-A1-mau-va-font.md).
- Kiểm thử trên máy: chạy `next start` với `KV_REST_API_TOKEN` = token chỉ đọc, token Blob/cron rỗng, khóa phiên
  admin riêng để thử; chặn mọi POST trong trình duyệt.
- Bản ghi FREEZE: [FREEZE-UXUI-ban-do-gap-2026-11-12.md](FREEZE-UXUI-ban-do-gap-2026-11-12.md) (§9 xác minh Git).
- Scope FROZEN: [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) (đợt A = Cơ bản mới; đợt B = Bản đồ gấp + công
  tắc + nhóm quay lại; checklist nghiệm thu A/B ở §4–§5).
- **[DESIGN.md](DESIGN.md) v2.0 có hiệu lực từ 12/11.** Bản v1 ở `archive/2026-11-uxui-freeze/`.
- Mockup 9 bảng (tham khảo; DESIGN.md thắng khi khác): https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo
- Bộ minh họa đã duyệt hướng: `docs/design/minh-hoa/*.svg` — chỉ chép vào `web/public/minh-hoa/` ở BUILD A.

## 2. Đã làm tới đâu

- Production vẫn là vNext Core Discovery: **`chamdiaphuongio-og2r8pgy7`** (30/9) = commit `e3b38a4`.
- 11–12/11: SCOPE → DESIGN v1 → PM review v2 → DESIGN v2 → **PM FINAL duyệt** → FREEZE tài liệu.
- Kiểm kê chỉ đọc: 16/342 chỗ có ảnh thật; số liệu nền 37 phiên / 42 ngày.

## 3. File quan trọng vừa thêm (chỉ tài liệu)

`docs/FREEZE-UXUI-ban-do-gap-2026-11-12.md` · `docs/SCOPE-UXUI-ban-do-gap.md` · `docs/DESIGN.md` (v2.0) ·
`docs/KIEM-KE-anh-so-lieu-nen-2026-11-11.md` · `docs/design/minh-hoa/` · 4 file PM review / kế hoạch trong `docs/`.

## 4. Lỗi / chỗ đang dở

| Mức | Việc |
|---|---|
| 🟡 | `PlaceDetail.js` còn dùng `PhotoGallery`, `formatDate`, `formatRelativeAge`, `staleMenuAgeMonths` từ `PlaceExplorer.js` → tách ra trước khi dọn (ghi chú cũ “không trang nào dùng” là sai) |
| 🔴 | **[Khôi phục-1]** lần lưu đầu không cho khách thấy mã 6 số · **[Khôi phục-2]** nhập mã ghi đè hồ sơ máy đã có Sổ. BACKLOG §3, PM xếp ưu tiên sớm. Không thêm lối vào khôi phục mới trước khi sửa |
| 🟡 | Đề xuất 2 sửa nhỏ PRODUCT.md chờ chủ dự án duyệt (FREEZE record §4); không chặn BUILD A |
| 🟡 | A2 chưa kiểm trên iPhone/Android thật + Zalo/Facebook (vùng an toàn, bàn phím) — cổng trước RELEASE A |
| 🟢 | Lớp cố định ở Chi tiết chỗ / bộ chọn / form đề xuất chưa đệm tai thỏ khi xoay ngang (`viewport-fit=cover`) — A6/A8 |
| 🟢 | Lint của dự án tắt `no-undef` (BACKLOG §8) |
| 🟡 | DELETE CANDIDATE chờ review: `docs/CDP_P1-P8_PostDong_LoTrinh_Prompt.md` · `data/dia-diem-mau-giai-doan-1.md` · `web/README.md` |

## 5. Bước tiếp theo nên làm

1. Chờ PM duyệt PLAN A4 → code A4 → REPORT A4. Không code A4 trước khi PM duyệt.
2. Deploy lần sau: `npx vercel --prod --yes --scope thangdz1`. **Chỉ deploy khi được yêu cầu.** CLI Vercel trên máy
   đã hết phiên đăng nhập (12/11) → chủ dự án cần chạy `vercel login` trước RELEASE.

**Bẫy cho người sau:** test giao diện bản đồ phải chạy `next build` + `next start` (`next dev` MapLibre đứng
“Đang tải bản đồ…”). Kiểm bằng trình duyệt ở máy dùng chung Redis thật: chặn `/api/track` và mọi Server Action
ghi. `logNotebookView` là lượt GHI. Đọc dữ liệu thật để kiểm kê: dùng `KV_REST_API_READ_ONLY_TOKEN` (lệnh
`PFCOUNT` bị khóa chỉ-đọc từ chối).
