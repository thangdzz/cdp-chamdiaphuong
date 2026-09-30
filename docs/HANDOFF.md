# HANDOFF — Bàn giao trạng thái

> Cập nhật: **2026-09-30**. Kênh bàn giao duy nhất giữa Claude Code và Codex — quy tắc ở
> [/AGENTS.md](../AGENTS.md) §7. Giữ file này **ngắn**: chỉ trạng thái hiện tại, ghi đè bản cũ.
> Bản bàn giao cũ (tới 17/9): [archive/logs/HANDOFF-2026-09-17.md](archive/logs/HANDOFF-2026-09-17.md).

---

## 1. Task hiện tại

**vNext — Release Check xong (30/9): READY WITH KNOWN NON-BLOCKERS. CHƯA deploy production.**
Chờ Product Owner làm checklist tay (§5) rồi mới deploy. Scope FROZEN: [SCOPE-vNext.md](SCOPE-vNext.md).
Không thêm feature, không làm MAY, không đụng admin.

## 2. Đã làm tới đâu

- Production vẫn là `chamdiaphuongio-87p9xw2vr` (29/9) = hotfix `de8e1bc`. Code vNext trên `main`.
- vNext MUST xong: Home mới · `/tim` · Place Detail (Lưu vào Sổ nổi bật, 2 vùng) · Sổ.
- Sửa theo owner test 30/9 (đều đã kiểm): xếp hạng tìm kiếm ("Phở"), thẻ Sổ khớp tóm tắt trang
  chi tiết, nút Quay lại chung, đóng góp theo ngữ cảnh (sắp lại cái sẵn có), xác nhận hai bước,
  "Đi bằng gì" (Xe máy → `two-wheeler`), thông báo "Đã lưu" màu CDP, nút "Lưu thay đổi" ở trang sửa
  Sổ/Lộ trình, tách ô nhiều SĐT.
- Release Check: 310/310 kiểm tự động, lint sạch, `npm test` 70/70, build đạt. Không migration.

## 3. File quan trọng vừa thêm

`lib/phone.js` + `app/CallPhone.js` (mọi `tel:` đi qua đây) · `app/SaveChanges.js` (thanh Lưu
thay đổi) · `app/VisitConfirm.js` · `app/BackButton.js` · `lib/placeRank.js` · `app/tim/`.

## 4. Lỗi / chỗ đang dở

| Mức | Việc |
|---|---|
| 🟡 | `two-wheeler` chưa thử trên điện thoại thật — **BLOCKED BY OWNER TEST**. Xe máy là mặc định mọi lộ trình; hỏng thì đổi `mapsMode` của `xe-may` về `driving` ở `lib/routes.js` |
| 🟢 | Font Geist thiếu bộ chữ tiếng Việt — UX follow-up (Be Vietnam Pro / Inter), không chặn |
| 🟢 | `CallButton` (nút "Gọi" + "Chọn số để gọi") chỉ còn dùng trong `PlaceExplorer.js` không dùng — chưa trang nào hiện; trang địa điểm hiện từng số là link gọi riêng |
| 🟢 | `PlaceExplorer.js` (+ `PersonalNote.js`) không còn trang nào dùng — dọn sau release |
| 🟢 | Lint của dự án tắt `no-undef` — biến chưa khai báo không bị bắt (đã quét tay 30/9: sạch). BACKLOG §8 |
| 🟡 | DELETE CANDIDATE chờ review: `docs/CDP_P1-P8_PostDong_LoTrinh_Prompt.md` · `data/dia-diem-mau-giai-doan-1.md` · `web/README.md` |

## 5. Checklist Product Owner test tay (trước deploy)

Trên **iPhone thật** (`http://MAdz.local:3100` cùng wifi):
1. Mở một lộ trình có ≥2 điểm → "Mở Google Maps" → Maps có mở chế độ **xe máy** và đủ điểm dừng không.
2. Home → gõ "phở" → Tìm → Xem chi tiết → Lưu vào Sổ → thấy "Đã lưu vào sổ …" màu cam → Xem sổ.
3. Ở Sổ bấm Quay lại liên tục: Sổ → địa điểm → kết quả tìm (còn từ khoá) → trang chủ.
4. Sửa Sổ: đổi tên → nút "Lưu thay đổi" sáng màu cam → bấm → "✓ Đã lưu"; mở lại trang xem tên mới.
5. Sửa Lộ trình: đổi ghi chú chặng → bấm Lưu thay đổi → "✓ Đã lưu".
6. `/dia-diem/pending-72c2da63-ad43-4b00-a436-7de787ecacd1` → bấm từng số → iPhone gọi đúng
   0393 083 596 / 0356 569 627 (không phải một số dài 20 chữ số).
7. Trên máy tính: trang địa điểm có thẻ tóm tắt bên phải, cuộn trang thẻ vẫn bám theo.

Lưu ý: bước 2, 4, 5 trên điện thoại thật **ghi dữ liệu thật** (tạo sổ / sửa sổ của chính anh).

## 6. Bước tiếp theo nên làm

1. Product Owner làm §5 → duyệt → deploy: `npx vercel --prod --yes --scope thangdz1` (thiếu
   `--scope` là "Not authorized"). **Chỉ deploy khi được yêu cầu.**
2. Sau deploy: kiểm production chỉ đọc (chặn POST + `/api/track`).

**Bẫy cho người sau:** test giao diện bản đồ phải chạy `next build` + `next start` (`next dev`
MapLibre đứng "Đang tải bản đồ…"). Kiểm bằng trình duyệt ở máy dùng chung Redis thật: chặn
`/api/track` và mọi Server Action ghi (đọc `.next/server/server-reference-manifest.json` để biết
action nào là ghi).
