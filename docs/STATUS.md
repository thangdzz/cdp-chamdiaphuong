# STATUS — Tình trạng hiện tại

> File này chỉ giữ **trạng thái hiện tại** — ngắn, đọc 2 phút là nắm. Cập nhật cuối mỗi phiên
> (ghi đè phần cũ, không cộng dồn thành nhật ký). Nhật ký các phiên trước:
> [archive/logs/STATUS-log-2026-07-15-den-09-22.md](archive/logs/STATUS-log-2026-07-15-den-09-22.md).
> Chi tiết từng lượt sửa: [TASKS.md](TASKS.md) · lý do: [DECISIONS.md](DECISIONS.md) (29/9–30/9).

Cập nhật: **2026-09-30**

---

## Đang ở đâu

**vNext — Core Discovery Flow: RELEASE CHECK xong (30/9) → READY WITH KNOWN NON-BLOCKERS.**
**Chưa deploy production** — chờ Product Owner làm checklist tay bên dưới rồi mới deploy.

- Scope: [SCOPE-vNext.md](SCOPE-vNext.md) (FROZEN). Toàn bộ MUST đã làm; MAY chưa làm.
- Commit Release Check: xem `git log` (sau `82fff3f`). Code trên `main`, chưa lên production.
- Kiểm tự động (iPhone 13 + desktop 1366, chặn mọi lượt ghi): **310/310** + thẻ tóm tắt desktop
  7/7 (2 ca "không có gì để cuộn" không tính). Lint sạch · `npm test` 70/70 · build đạt.
- Không có migration / đổi dữ liệu. Analytics chỉ thêm 4 event của Scope (search_use,
  category_pick, place_open, notebook_save), chỉ đếm theo ngày.

## Còn chờ Product Owner (trước khi deploy)

1. **`two-wheeler` — BLOCKED BY OWNER TEST.** Chưa thử trên điện thoại thật. Không chặn luồng lõi
   (Home → Tìm → Place → Sổ), nhưng Xe máy là mặc định của MỌI lộ trình → phải thử trước khi deploy.
   Hỏng thì đổi lại `driving` (1 dòng trong `lib/routes.js`) rồi mới deploy.
2. Thử tay trên iPhone thật: luồng lõi, nút Lưu thay đổi, gọi ô 2 số (checklist trong HANDOFF §5).
3. **Font** — Geist không có bộ chữ tiếng Việt (máy tự bù font khác cho chữ có dấu). Không lỗi
   hiển thị nghiêm trọng → UX follow-up, **không chặn release**. Đề xuất Be Vietnam Pro hoặc Inter.

## Web đang chạy

- Link: **https://chamdiaphuong.io.vn** · trang duyệt `/admin` (một mật khẩu chung).
- Bản deploy mới nhất: **`chamdiaphuongio-87p9xw2vr` (2026-09-29)** = hotfix `de8e1bc` (bản
  trước vNext).
- Dữ liệu: ~290 địa điểm (Ăn · Chơi · Ngủ · Đi lại). Routine quét tự chạy mỗi sáng và tự đăng
  (xem [ROUTINE.md](ROUTINE.md)); chỉ giữ chờ duyệt khi nghi trùng/mâu thuẫn.
- Thử bản vNext ở máy: `npm run build` + `npx next start -p 3100` → `http://localhost:3100`
  (điện thoại cùng wifi: `http://MAdz.local:3100`).

## Câu hỏi mở — chờ Product Owner chốt

1. **Giá mùa cao điểm** — một ô giá cho cả năm. Chọn hướng trước khi code (BACKLOG §1).
2. **Ghi chú trong lộ trình chia sẻ** — riêng tư hay công khai qua duyệt (BACKLOG §3).
3. **Font có tiếng Việt** — Be Vietnam Pro / Inter (UX follow-up, sau release).

## Bước tiếp theo hợp lý nhất

1. Product Owner làm checklist tay (HANDOFF §5), nhất là `two-wheeler`.
2. Duyệt → deploy production (`npx vercel --prod --yes --scope thangdz1`) → kiểm production chỉ đọc.
3. Sau release: đọc số event Home → Search → Place → Save để chọn version tiếp theo; cân nhắc MAY,
   font, dọn `PlaceExplorer.js`.
