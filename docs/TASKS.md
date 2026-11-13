# TASKS — Việc đang thực sự active

> Chỉ giữ việc **đang làm hoặc sắp làm ngay** trong phạm vi [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) (FROZEN 12/11).
> Việc có giá trị nhưng chưa tới lượt → [BACKLOG.md](BACKLOG.md). Ý tưởng chưa review →
> [INBOX.md](INBOX.md). Tình trạng chung → [STATUS.md](STATUS.md).
>
> Danh sách cũ (DONE chi tiết từ 07/2026, TODO trước lễ hội, việc game):
> [archive/logs/TASKS-2026-09-22.md](archive/logs/TASKS-2026-09-22.md).

Cập nhật: **2026-11-12**

Quy ước: ⬜ chưa làm · 🚧 đang làm · 👀 chờ Product Owner check · ✅ xong

---

## 🚧 Đang làm

- ✅ **vNext UX/UI: SCOPE** (11/11): PM duyệt có điều kiện; đã sửa [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) (đợt A/B).
- ✅ **Kiểm kê ảnh + số liệu nền (chỉ đọc)** (11/11): [KIEM-KE-anh-so-lieu-nen-2026-11-11.md](KIEM-KE-anh-so-lieu-nen-2026-11-11.md).
- ✅ **DESIGN v1 3 màn** (11/11) → PM review v2 (12/11): duyệt hướng có điều kiện.
- ✅ **Quy tắc Sổ/tài khoản/đồng bộ** ghi vào DECISIONS, ARCHITECTURE, HANDOFF, STATUS, CLAUDE.md (12/11).
  Câu bổ sung PRODUCT.md: chờ chủ dự án duyệt.
- ✅ **DESIGN v2** (12/11): PM FINAL duyệt.
- ✅ **FREEZE tài liệu** (12/11): SCOPE FROZEN v1.0, DESIGN.md v2.0, bản ghi
  [FREEZE-UXUI-ban-do-gap-2026-11-12.md](FREEZE-UXUI-ban-do-gap-2026-11-12.md). PM xác nhận; đã ghi xác minh Git (§9).
- ✅ **Kế hoạch A1 — màu + font** (12/11): [SPEC-A1-mau-va-font.md](SPEC-A1-mau-va-font.md). PM duyệt kèm Q1–Q3.
- ✅ **BUILD A1** (12/11): A1a `2ee6f00` token + `cdp-site`, A1b `7ca6816` Be Vietnam Pro. Tag `prod-2026-09-30`.
  [REPORT-A1](REPORT-A1-mau-va-font-2026-11-12.md). **PM nghiệm thu có điều kiện** (sửa tên bị cắt ở A2). Chưa deploy.
- ✅ **PLAN A2** (12/11): PM duyệt, Q1–Q5 chọn A ([SPEC-A2](SPEC-A2-khung-dieu-huong.md) §14).
- ✅ **BUILD A2** (12/11) — **PM ACCEPTED**: A2-0 `6285ed5`, A2-a `4e546e8`, A2-b `6e43aa6`, A2-c `7f56897`, `ed6e927`.
  [REPORT-A2](REPORT-A2-khung-dieu-huong-2026-11-12.md) · [nghiệm thu](PM-NGHIEM-THU-A2-CDP-2026-11-12.md). Chưa deploy.
- ✅ **PLAN A3** (12/11): PM duyệt, Q1–Q4 chọn A ([SPEC-A3](SPEC-A3-anh-minh-hoa.md) §13).
- ✅ **BUILD A3** (12/11) — **PM ACCEPTED 13/11**: `81ca254` · `2f8f425` · `5e7b5fe` · `29b413d`.
  [REPORT-A3](REPORT-A3-anh-minh-hoa-2026-11-12.md) · [nghiệm thu + rollback](PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md).
- ✅ **Quy trình phát hành + rollback** (13/11): [VAN-HANH-RELEASE-ROLLBACK.md](VAN-HANH-RELEASE-ROLLBACK.md).
- 👀 **PLAN A4** Trang chủ B + giới hạn tiêu đề Admin 60 ký tự: [SPEC-A4-trang-chu.md](SPEC-A4-trang-chu.md). Chờ PM duyệt.
  Chưa code.

### Việc mang theo từng bước đợt A (PM nghiệm thu A1/A2 — không bỏ sót trước RELEASE A)

| Bước | Việc phải làm ở bước đó | Nguồn |
|---|---|---|
| Mọi bước | Tên “Chạm Địa Phương” luôn đủ, không “…”; không thêm lại `truncate` ở header/sidebar | Chủ dự án 12/11 |
| A4–A9 | Đổi màu cũ (`zinc-400` chữ nhạt — 73 chỗ, nút `#c8553d`) sang token **trong file của màn đó**, đo tương phản | PM A1/A2 |
| A5 Tìm chỗ | Vệt dấu dòng ẩn dưới ô `line-clamp` (thẻ, địa chỉ 2 dòng) · **cổng quyền ảnh**: chỉ hiện ảnh thật **đã xác minh quyền** (kể cả ảnh Admin cũng phải xác minh), còn lại SVG đúng nhóm · dấu ✎ + chú giải | PM A1, A3 |
| A6 Chi tiết | **Khung minh họa không cắt nội dung chính** (Chơi giữ mặt hồ, Đi lại giữ bánh xe; không `object-cover` ở khung siêu rộng) · Vệt dấu dưới ô cắt 2 dòng · thanh “Lưu vào Sổ + Chỉ đường” đệm tai thỏ khi xoay ngang · nhãn minh họa / ảnh lỗi · **form gửi ảnh: thông báo công khai + xác nhận quyền, chỉ cho ảnh gửi mới** (không hồi tố) · **rà ảnh cũ đang hiện ở Chi tiết + kế hoạch nếu có tranh chấp** · ảnh chưa xác minh không vào vị trí mới | PM A1/A2/A3 |
| A7 Sổ | Vệt dấu dưới ô cắt 2 dòng · cổng quyền ảnh cho ảnh nhỏ trong Sổ | PM A1, Q4 A3 |
| A8 Lộ trình | Bộ chọn địa điểm + form đề xuất (lớp cố định toàn màn) đệm tai thỏ khi xoay ngang · cổng quyền ảnh cho ảnh điểm dừng | PM A2, Q4 A3 |
| A9 Màn phụ | Footer phía khách chữ ≥ 13px (đang 12px) | PM A2 |
| Màn có thanh hành động (A6–A8) | Thêm đường dẫn vào `lib/shellRoutes.js` để chỉ một thanh đáy | PM Q2 A2 |

### Mang theo TEST A (cộng thêm checklist SCOPE §4)

- [ ] iPhone Safari + Android Chrome thật, trình duyệt Zalo/Facebook: vùng an toàn (vạch Home), bàn phím ẩn/hiện thanh
  đáy, thanh địa chỉ co giãn, màn thấp, xoay ngang (tai thỏ) — A2 mới kiểm giả lập.
- [ ] Tên “Chạm Địa Phương” đủ trên máy thật ở cỡ chữ lớn của hệ điều hành.
- [ ] Rà Admin sau đổi font: hàng tab xuống dòng, tên bị “…” trong danh sách có cản thao tác không.
- [ ] Lỗi tải trước WebKit (“access control checks”) có tái hiện không; nếu có, đánh giá trước release.
- [ ] Tương phản đo trên máy thật cho mọi màn đã đổi token.
- [ ] Đối chiếu deployment Vercel thật + `vercel login` trước RELEASE A.

### RELEASE A / RELEASE B — cổng bắt buộc

Checklist đầy đủ: [VAN-HANH-RELEASE-ROLLBACK.md](VAN-HANH-RELEASE-ROLLBACK.md) §4 (A), §7 (B), §6 (sau rollback).
- [ ] `vercel login`; ghi gói, dự án, **deployment đang chạy** (ID/URL + commit thật), domain.
- [ ] Đường quay về 30/9 đã xác định và **đã thử** (rollback một bước / promote / deploy lại từ tag `prod-2026-09-30`).
- [ ] Ghi trạng thái dữ liệu trước release; kiểm mã cũ đọc được dữ liệu mới. **Rollback code không khôi phục dữ liệu.**
- [ ] Hạn mức tối ưu ảnh Vercel đủ dùng.
- [ ] Không deploy nào chen giữa từ lúc kiểm tới lúc release.

- ✅ **Dọn tài liệu theo PRODUCT mới** (29/9) — đã duyệt, push `1191e43`. DECISIONS 2026-09-29.
- ✅ **Hotfix 29/9** — game hết 27/9, bỏ nhãn "còn chỗ", README 4 nhóm, vùng dữ liệu. Deploy
  `87p9xw2vr`, kiểm production 34/34 đạt. DECISIONS "2026-09-29 (sau)".
- ✅ **Kế hoạch vNext** — Product Owner duyệt 29/9 (kèm chỉnh sửa). Scope vẫn ở [SCOPE-vNext.md](SCOPE-vNext.md);
  kế hoạch triển khai ghi ngay dưới đây, không có file spec riêng.

## 🚧 vNext — Core Discovery Flow: kế hoạch triển khai (duyệt 29/9)

Mỗi bước một commit, chạy test phù hợp sau mỗi bước. **Không deploy production** cho tới khi
Product Owner test xong toàn bộ MUST. Mặc định đã duyệt: trang kết quả `/tim` · nội dung theo mùa
trên Home thành thẻ nhỏ khi không còn active · analytics chỉ ghi event, không làm màn admin.

**MUST**
- ✅ **1. Tách logic lọc** (`6f351cc`) — `lib/placeFilter.js` (+ test) dùng chung cho Home cũ và `/tim`; giao diện không đổi
- ✅ **2. Trang kết quả `/tim`** (`c2af4a1`) — `?q=&loai=`, 4 tab + lọc khu vực/giá như cũ, giữ bộ lọc khi Back,
  20 chỗ/lượt + "Xem thêm"; thẻ gọn: tên · nhóm · trạng thái xác nhận · giá (khi có) · địa chỉ ·
  [Xem chi tiết] → `/dia-diem/[id]` · [Chỉ đường]
- ✅ **3. Đo luồng (baseline trước khi đổi Home)** (`8881361`) — event ẩn danh: dùng tìm kiếm · chọn nhóm · mở
  trang địa điểm · lưu vào sổ. Chỉ đếm theo ngày, không đổi script ghi, không dashboard
- ✅ **4. Place Detail → Lưu vào Sổ** (`1494dd5`) — nút chính "Lưu vào Sổ" ngay dưới tên/giá, thanh bám đáy
  mobile [Lưu vào Sổ] [Chỉ đường], "Thêm vào lộ trình" thành nút phụ
- ✅ **5. Home mới** (`9818e82`) — ô tìm → `/tim`, 4 ô nhóm, 3 hành động Tìm / Lưu vào Sổ / Lên Lộ trình, thẻ
  theo mùa nhỏ, bỏ danh sách dài; `/#mã-chỗ` tự chuyển `/dia-diem/[id]`
- ✅ **Sửa 3 chỗ sót sau hotfix** (`b3423e4`; nút nổi hết cùng danh sách cũ ở bước 5) — câu "Tối nay bạn gặp được bao nhiêu mô hình?" · tab "Bản đồ tối
  nay" · nút nổi mobile đè ô tìm kiếm
- 👀 **Kiểm toàn luồng** mobile + desktop, build sạch (71/71 kiểm tự động đạt, 29/9) → **chờ Product Owner test**

**Sửa theo owner test (30/9)** — chưa deploy
- ✅ **Tìm kiếm `/tim`**: nút Tìm + một handler cho Enter/bàn phím; xếp hạng theo mức liên quan (`e2144c1`)
- ✅ **Trang địa điểm** làm lại thứ bậc thông tin, bỏ "Độ tin cậy" (`74dd284`)
- ✅ **Thẻ trong Sổ** đủ để nhận ra/so sánh + Xem chi tiết/Chỉ đường (`146885f`)
- ✅ **"Đi bằng gì"**: Xe máy → two-wheeler, bỏ Kết hợp (`a071b7a`)
- ✅ **Nút Quay lại dùng chung** mọi trang con, có trang cha khi mở thẳng link (`283b124`)
- ✅ **Đóng góp theo ngữ cảnh** thay khối "Đóng góp thông tin" (`76864df`)
- ✅ **Trang địa điểm đọc lướt 5–10 giây** + xác nhận hai bước (PO duyệt bố cục trước khi code)
- ✅ **Trang địa điểm gom còn 2 vùng** (vòng dọn cuối PO/PM 30/9)
- ✅ **Thẻ trong Sổ đi cùng thứ tự tóm tắt trang chi tiết** + thông báo "Đã lưu vào sổ" nổi hơn (màu CDP cho tên sổ và "Xem sổ")
- ✅ **Trang sửa Sổ + sửa Lộ trình có nút "Lưu thay đổi"** (vẫn tự lưu khi rời ô) — component chung `SaveChanges.js`
- ✅ **Ô nhiều SĐT tách từng số**, mỗi số một link gọi riêng (`lib/phone.js`, `CallPhone.js`)
- 👀 Product Owner thử link `two-wheeler` trên điện thoại thật ở Việt Nam (xem STATUS)
- 👀 Product Owner chọn font có tiếng Việt (xem STATUS)

**✅ RELEASED 30/9** — commit `e3b38a4`, deployment `chamdiaphuongio-og2r8pgy7`, smoke test production 307/307

**Release Check (30/9)** — **READY WITH KNOWN NON-BLOCKERS**
- ✅ Scope: đủ MUST; MAY chưa làm · không migration · analytics chỉ 4 event của Scope
- ✅ Kiểm tự động 310/310 (iPhone 13 + desktop): luồng lõi Home → Tìm → Place → Lưu → Xem Sổ, Quay lại,
  sửa Sổ/Lộ trình + Lưu thay đổi, ô 2 SĐT, thẻ tóm tắt desktop · lint sạch · `npm test` 70/70 · build đạt
- ✅ **`two-wheeler`** — Product Owner đã kiểm trên iPhone thật, hoạt động đúng
- ✅ Product Owner test tay đạt
- ✅ Deploy production 30/9 + smoke test mobile/desktop 307/307, không lỗi JS/runtime
- Follow-up sau release (không chặn): font có tiếng Việt (Be Vietnam Pro / Inter) · dọn `PlaceExplorer.js`

**MAY** — chỉ làm khi MUST xong, test sạch, không làm tăng scope
- ⬜ Khối "Mới được xác nhận" · chỗ trống của Sổ ghi đúng hướng dẫn · shortcut "Cafe"

**Sau khi Product Owner duyệt:** deploy production · dọn `PlaceExplorer.js` nếu không còn dùng.

---

## ✅ Đã đóng 2026-09-29 — game Săn đèn Thành Tuyên 2026 (kết thúc 27/09)

Các việc game còn mở trong TASKS cũ **đóng lại, không làm**: thử luồng báo đèn trên iPhone ·
mở thử bản đồ khác mạng đêm 18/9 · thử 50–100 người tải ảnh · nâng routine 2–3 lần/ngày tuần lễ
hội · chủ dự án xem lại tuyến rước đèn. Ý tưởng game còn giá trị → [INBOX.md](INBOX.md) §2.
Việc dọn sau game (xoá namespace thử, số phận khối game) → [BACKLOG.md](BACKLOG.md) §9.
