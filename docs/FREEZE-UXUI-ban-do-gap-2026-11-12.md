# FREEZE RECORD — vNext UX/UI: Bản đồ gấp + Cơ bản

| | |
|---|---|
| Ngày FREEZE | **2026-11-12** |
| Trạng thái | **FREEZE ACCEPTED (PM 12/11) → A1 PLANNING.** Chưa BUILD, chưa TEST, chưa RELEASE |
| Mốc gốc của công việc | `ff450ed` (30/9) — `main` trên máy lúc bắt đầu, ngay sau bản phát hành `e3b38a4` (chỉ thêm tài liệu) |
| Commit cha trực tiếp của FREEZE | `fa6c5f6` — `origin/main` lúc 12/11, commit routine ngày 10/11. Từ `ff450ed` lên `fa6c5f6` là 50 commit routine, kéo về bằng fast-forward (xem §9) |
| Commit FREEZE | **`3d5a419`** — `Freeze vNext UX/UI design and scope documents` (nội dung khóa) |
| Commit ghi mã | `1406f98` — `Record the freeze commit hash` (chỉ điền mã `3d5a419` vào bản ghi này) |
| Production lúc FREEZE | `chamdiaphuongio-og2r8pgy7` (30/9) = vNext Core Discovery `e3b38a4`. **Không đổi** (căn cứ ở §9) |
| Quyết định PM | [PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md](PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md) · xác nhận FREEZE: [PM-XAC-NHAN-FREEZE-UXUI-CDP-2026-11-12.md](PM-XAC-NHAN-FREEZE-UXUI-CDP-2026-11-12.md) |

## 1. Tài liệu đã khóa

| Tài liệu | Trạng thái |
|---|---|
| [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) | **FROZEN v1.0** — 19 quyết định khóa, phạm vi đợt A / B, checklist nghiệm thu A / B, thứ tự BUILD |
| [DESIGN.md](DESIGN.md) | **v2.0, hiệu lực 12/11/2026** — thay bản v1 |
| `docs/design/minh-hoa/` (`an`, `choi`, `ngu`, `dilai`, `khac`.svg) | Tài sản đã duyệt hướng; chưa vào production; đăng ký ở DESIGN §5 |
| [DECISIONS.md](DECISIONS.md) mục 11/11 → 12/11 (cuối) | Ghi đủ quyết định; câu màu cũ đã đánh dấu bị thay |
| Quy tắc Sổ / tài khoản / đồng bộ | DECISIONS 2026-11-12 + ARCHITECTURE “Truy cập Sổ/Lộ trình từ thiết bị khác” + HANDOFF §0 + STATUS + CLAUDE.md quy tắc 8 + AGENTS.md. **Không hỏi lại ở session sau** |
| Lưu trữ | [archive/2026-11-uxui-freeze/](archive/2026-11-uxui-freeze/): DESIGN v1 (`git mv`, giữ lịch sử) + bản đề xuất DESIGN v2; [archive/README.md](archive/README.md) đã thêm dòng |
| Tham khảo (không phải nguồn chuẩn) | Mockup 9 bảng https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo — **DESIGN.md thắng khi khác nhau** |

Rà mâu thuẫn (12/11): PRODUCT · DECISIONS · ARCHITECTURE · HANDOFF · STATUS · TASKS · BACKLOG · CLAUDE.md · AGENTS.md.
Đã sửa: các chỗ trỏ “phạm vi đang build” về SCOPE-vNext cũ (CLAUDE, AGENTS, ARCHITECTURE, TASKS); lối vào “Dùng trên
máy khác?” bị bỏ khỏi DESIGN và mockup; 2 lỗi khôi phục tách thành 2 mục BACKLOG. **Còn 1 chỗ cần chủ dự án duyệt:
PRODUCT.md (mục 4).**

## 2. Phạm vi

- **Đợt A — Cơ bản mới:** token + font, thanh đáy 4 mục, bộ minh họa + ảnh thẻ tìm kiếm (P0), Trang chủ B (không
  autofocus), giới hạn 60 ký tự tiêu đề trong Admin, Tìm chỗ, Chi tiết + Lưu + Hoàn tác, Sổ, Lộ trình, màn phụ, trạng
  thái. **Không** có công tắc giao diện, Chọn ngẫu nhiên, Sổ/Lộ trình gần đây. Chi tiết: SCOPE §2.
- **Đợt B — Bản đồ gấp:** công tắc (Menu / cuối sidebar) + chống nháy + ghi nhớ + gợi ý 1 lần, lớp Bản đồ gấp, Sổ gần
  đây, Lộ trình gần đây, Chọn ngẫu nhiên, MỞ / GẤP / NỐI, analytics theo `theme`. Chi tiết: SCOPE §3.
- Checklist nghiệm thu: SCOPE §4 (A) và §5 (B). Rollback riêng mỗi đợt bằng promote bản deploy trước.

## 3. Thứ tự BUILD dự kiến

**A:** token + font → khung + thanh đáy + Menu → minh họa + hàm chọn ảnh + dữ liệu ảnh thẻ → Trang chủ + giới hạn
tiêu đề Admin → Tìm chỗ → Chi tiết + Lưu + Hoàn tác → Sổ → Lộ trình → màn phụ + trạng thái → TEST A → RELEASE A.
**B:** công tắc → lớp Bản đồ gấp → Sổ/Lộ trình gần đây → Chọn ngẫu nhiên → chuyển động → analytics → gợi ý 1 lần →
TEST B → RELEASE B. Mỗi bước một commit; trình kế hoạch ngắn trước khi code theo CLAUDE.md.

## 4. Đề xuất sửa PRODUCT.md — chờ chủ dự án duyệt (chưa sửa)

1. Dòng 8, thay `Phạm vi đang build: [SCOPE-vNext.md](SCOPE-vNext.md).` bằng
   `Phạm vi hiện hành: [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) (FROZEN 2026-11-12).`
   (nhãn “Phạm vi hiện hành” theo gợi ý PM 12/11)
2. Thêm vào cuối khối “Ghi chú diễn giải” (sau dòng 12):
   > **Lưu và đồng bộ (2026-11-12):** Sổ và Lộ trình gắn với thiết bị qua mã ẩn danh, chưa có đồng bộ tự động; mã
   > khôi phục 6 số là khôi phục thủ công. Khi có tài khoản và cơ chế đồng bộ thì người dùng mới có Sổ/Lộ trình trên
   > nhiều thiết bị; tài khoản không bắt buộc cho việc tra cứu và lưu trên một thiết bị.

Không duyệt hai sửa này cũng **không chặn BUILD A**: DECISIONS + CLAUDE.md đã mang đủ quy tắc. PM đồng ý hướng
nội dung (12/11), vẫn **chờ chủ dự án duyệt**; chưa sửa PRODUCT.md.

## 5. Rủi ro còn lại

| Rủi ro | Mức | Xử lý ở đâu |
|---|---|---|
| **[Khôi phục-1]** lần lưu đầu không cho khách thấy mã 6 số | Cao (mất truy cập Sổ khi đổi máy) | BACKLOG §3, PM xếp ưu tiên sớm; không thêm CTA khôi phục trước khi sửa |
| **[Khôi phục-2]** nhập mã trên máy đã có Sổ ghi đè hồ sơ | Cao | BACKLOG §3, như trên |
| Ảnh thật chỉ 4,7%; minh họa phải rõ bản chất | Trung bình | Nhãn + alt (DESIGN §5); BACKLOG §6 thu thập ảnh |
| ~1.000 chỗ màu viết cứng trên 68 file phía khách | Trung bình | Đổi theo từng màn ở BUILD A; ngoại lệ ghi ở DESIGN §2; không đụng `/admin` trừ tiêu đề |
| Hiệu năng / chuyển động / SVG chưa đo thật | Trung bình | TEST A / B; mặc định Bản đồ gấp chỉ khi LCP ≤ 2,5 giây |
| Ẩn thanh đáy khi bàn phím bật trên Safari iOS và trình duyệt Zalo/Facebook | Trung bình | Test riêng ở TEST A |
| Font Literata + Be Vietnam Pro làm chậm tải | Thấp–TB | Nạp đúng độ đậm; đo ở TEST |
| Sửa script Lua analytics cho `theme` | Thấp | Đợt B; giữ tương thích số cũ |
| `PlaceDetail.js` còn phụ thuộc `PlaceExplorer.js` | Thấp | Tách hàm trước nếu BUILD đụng tới; không dọn rộng |
| Lưu lượng rất thấp (37 phiên / 42 ngày) | — | Báo số tuyệt đối; không kết luận A/B |
| Mockup là ảnh tĩnh, một phần dựng động | — | DESIGN.md là chuẩn; nghiệm thu bằng checklist trên máy thật |

## 6. Ngoài lần release này (BACKLOG / INBOX)

Khôi phục-1, Khôi phục-2 · tài khoản + đồng bộ đa thiết bị · lối vào khôi phục mới · thu thập thêm ảnh thật · dọn
`PlaceExplorer.js` / `PersonalNote.js` · bật `no-undef` ESLint · test Playwright vào repo · các mục BACKLOG khác giữ
nguyên.

## 7. Điều kiện bắt đầu BUILD A

1. ✅ PM xác nhận bản ghi này (12/11).
2. Đồng bộ `origin/main` (routine quét commit hằng ngày) — làm lại ngay trước khi code.
3. 🚧 Kế hoạch bước A1 (token + font): [SPEC-A1-mau-va-font.md](SPEC-A1-mau-va-font.md) — chờ PM duyệt, rồi mới code.

## 8. Mã commit FREEZE

`3d5a419` — “Freeze vNext UX/UI design and scope documents” (chỉ tài liệu, trên `main`, cha trực tiếp `fa6c5f6`).
Sau đó `1406f98` chỉ điền mã này vào bản ghi. Các lần cập nhật bản ghi về sau (như §9) **không đổi nội dung đã khóa**;
tra bằng `git log --oneline -- docs/FREEZE-UXUI-ban-do-gap-2026-11-12.md`.

## 9. Xác minh lịch sử Git (12/11, sau khi PM xác nhận)

Kiểm bằng `git log`, `git reflog`, `git show --stat`; không sửa lịch sử.

| Commit | Cha | Thời điểm | Tác giả | Thay đổi |
|---|---|---|---|---|
| `ff450ed` | `e3b38a4` | 30/9 15:48 | thangdz | Ghi chú đã phát hành vNext (5 file trong `docs/`). `main` trên máy dừng ở đây tới 12/11 |
| 50 commit `ff450ed..fa6c5f6` | — | 01/10 → 10/11 | 25 `thangdzz` (“scan: …”) + 25 `cdp-ingest-bot` (“chore: …”) | Routine quét. Tổng thay đổi chỉ là `web/data/known-places-snapshot.json` (+266 / −1); `data/pending-scan.json` thêm rồi xóa, cộng lại bằng 0 |
| `fa6c5f6` | `aaf0fed` | 10/11 08:01 UTC | `cdp-ingest-bot` | Commit routine cuối cùng trước FREEZE |
| *(đồng bộ)* | — | 12/11 10:02 | — | `git pull --ff-only origin main`: `ff450ed` → `fa6c5f6`, fast-forward, **không có commit gộp** |
| **`3d5a419`** | `fa6c5f6` | 12/11 10:08:41 | thangdz | FREEZE: 24 file, **chỉ** `docs/`, `CLAUDE.md`, `AGENTS.md` (gồm 5 SVG ở `docs/design/minh-hoa/`) |
| `1406f98` | `3d5a419` | 12/11 10:08:51 | thangdz | 1 file: bản ghi này, điền mã commit (2 dòng) |

- **Không chạm code hoặc dữ liệu địa điểm:** cả `3d5a419` và `1406f98` không có file nào ngoài `docs/`, `CLAUDE.md`,
  `AGENTS.md`. Đúng như báo cáo.
- **Code web hiện tại = code production:** `git diff e3b38a4 1406f98 -- web/` chỉ có `known-places-snapshot.json`.
  File này do routine dùng để tránh quét trùng (`web/scripts/export-known-places.mjs`), trang web không đọc nó.
- **Production không đổi:** không có lệnh deploy nào trong phiên 11–12/11; Vercel không nối git nên push không làm
  đổi production (AGENTS.md §7). **Chưa kiểm trực tiếp được trên Vercel:** `npx vercel ls` báo phiên đăng nhập CLI
  đã hết hạn. Cần đăng nhập lại (`vercel login`) trước bước RELEASE A, và nên dùng nó để kiểm lại mục này.
- Trên GitHub còn nhánh `origin/cdp-scheduled-write-test-2026-11-10` (1 file thử của routine, 10/11). Nhánh này
  không liên quan FREEZE; để nguyên.
