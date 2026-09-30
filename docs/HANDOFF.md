# HANDOFF — Bàn giao trạng thái

> Cập nhật: **2026-09-30**. Kênh bàn giao duy nhất giữa Claude Code và Codex — quy tắc ở
> [/AGENTS.md](../AGENTS.md) §7. Giữ file này **ngắn**: chỉ trạng thái hiện tại, ghi đè bản cũ.
> Bản bàn giao cũ (tới 17/9): [archive/logs/HANDOFF-2026-09-17.md](archive/logs/HANDOFF-2026-09-17.md).

---

## 1. Task hiện tại

**vNext — Core Discovery Flow ĐÃ RELEASE (2026-09-30).** Không có task đang mở. Chưa mở Scope mới,
chưa làm MAY — chờ Product Owner chọn việc tiếp theo.

## 2. Đã làm tới đâu

- Production: **`chamdiaphuongio-og2r8pgy7`** (30/9) = commit `e3b38a4`, alias chamdiaphuong.io.vn.
  Bản trước để quay lại nếu cần: `chamdiaphuongio-87p9xw2vr` (hotfix `de8e1bc`).
- Product Owner test tay đạt (kể cả `two-wheeler` trên iPhone thật). Smoke test production 307/307.
- [SCOPE-vNext.md](SCOPE-vNext.md) đã đánh dấu RELEASED.

## 3. File quan trọng vừa thêm

`lib/phone.js` + `app/CallPhone.js` (mọi `tel:` đi qua đây) · `app/SaveChanges.js` (thanh Lưu
thay đổi) · `app/VisitConfirm.js` · `app/BackButton.js` · `lib/placeRank.js` · `app/tim/`.

## 4. Lỗi / chỗ đang dở

| Mức | Việc |
|---|---|
| 🟢 | Font Geist thiếu bộ chữ tiếng Việt — UX follow-up (Be Vietnam Pro / Inter), không chặn |
| 🟢 | `CallButton` (nút "Gọi" + "Chọn số để gọi") chỉ còn dùng trong `PlaceExplorer.js` không dùng — chưa trang nào hiện; trang địa điểm hiện từng số là link gọi riêng |
| 🟢 | `PlaceExplorer.js` (+ `PersonalNote.js`) không còn trang nào dùng — dọn sau release |
| 🟢 | Lint của dự án tắt `no-undef` — biến chưa khai báo không bị bắt (đã quét tay 30/9: sạch). BACKLOG §8 |
| 🟡 | DELETE CANDIDATE chờ review: `docs/CDP_P1-P8_PostDong_LoTrinh_Prompt.md` · `data/dia-diem-mau-giai-doan-1.md` · `web/README.md` |

## 5. Bước tiếp theo nên làm

1. Chờ Product Owner chọn việc tiếp theo. Không tự mở Scope mới / MAY.
2. Deploy lần sau: `npx vercel --prod --yes --scope thangdz1` (thiếu `--scope` là "Not authorized").
   **Chỉ deploy khi được yêu cầu.** Sau deploy kiểm production chỉ đọc.

**Bẫy cho người sau:** test giao diện bản đồ phải chạy `next build` + `next start` (`next dev`
MapLibre đứng "Đang tải bản đồ…"). Kiểm bằng trình duyệt ở máy dùng chung Redis thật: chặn
`/api/track` và mọi Server Action ghi (đọc `.next/server/server-reference-manifest.json` để biết
action nào là ghi — trên production mã action khác bản build ở máy: lấy bảng mã từ file JS công
khai của trang, chuỗi `createServerReference)("<id>",…,"<tên>"`). `logNotebookView` là lượt GHI
(đếm lượt xem sổ), không phải đọc.
