# HANDOFF — Bàn giao trạng thái

> Cập nhật: **2026-09-29**. Kênh bàn giao duy nhất giữa Claude Code và Codex — quy tắc ở
> [/AGENTS.md](../AGENTS.md) §7. Giữ file này **ngắn**: chỉ trạng thái hiện tại, ghi đè bản cũ.
> Bản bàn giao cũ (tới 17/9): [archive/logs/HANDOFF-2026-09-17.md](archive/logs/HANDOFF-2026-09-17.md).

---

## 1. Task hiện tại

**Dọn tài liệu theo PRODUCT mới — xong, chờ Product Owner duyệt.** Chưa build vNext.

Nguồn chuẩn: [PRODUCT.md](PRODUCT.md) (cao nhất) → [SCOPE-vNext.md](SCOPE-vNext.md) (FROZEN).

## 2. Đã làm tới đâu

- Production: `chamdiaphuongio-eex4ejxif` (22/9), alias `chamdiaphuong.io.vn`. Không có code
  nào chưa deploy.
- 29/9: tạo PRODUCT / SCOPE-vNext / INBOX / BACKLOG; rút gọn STATUS, TASKS, HANDOFF; chuyển tài
  liệu cũ vào `docs/archive/`; đổi `SPEC-giao-dien.md` → `DESIGN.md`; sửa CLAUDE.md, AGENTS.md.
  Chỉ sửa 3 dòng comment trong code (đường dẫn tài liệu), không đổi logic.

## 3. File vừa sửa

Một commit "Reorganize docs around the new PRODUCT source of truth" (29/9). Xem `git show --stat`.

## 4. Lỗi / chỗ đang dở

| Mức | Việc |
|---|---|
| 🟠 | Game `endAt` trong code = 30/9 23:59, Product Owner chốt kết thúc 27/9 → khối game vẫn hiện tới 30/9. Chưa sửa, chờ chốt (STATUS câu hỏi mở 3) |
| 🟢 | Link markdown trong toàn bộ `docs/` đã kiểm: 0 link gãy. Dẫn chiếu dạng chữ (`NOTE-08 §3`…) tra theo [archive/README.md](archive/README.md) — NOTE trùng số 12–17 |
| 🟡 | DELETE CANDIDATE giữ nguyên chờ review: `docs/CDP_P1-P8_PostDong_LoTrinh_Prompt.md` (trùng y hệt phần đầu bản `-tiep` đã archive) · `data/dia-diem-mau-giai-doan-1.md` · `web/README.md` |

## 5. Bước tiếp theo nên làm

1. Chờ Product Owner duyệt đợt dọn tài liệu.
2. Chốt câu hỏi mở trong [STATUS.md](STATUS.md).
3. Viết kế hoạch vNext → trình duyệt → mới code.

**Bẫy cho người sau (vẫn đúng):** test giao diện bản đồ phải chạy `next build` + `next start`
(ở `next dev` MapLibre đứng "Đang tải bản đồ…"). Deploy: `npx vercel --prod --yes --scope thangdz1`
— thiếu `--scope thangdz1` là báo "Not authorized". **Chỉ deploy khi được yêu cầu.**
