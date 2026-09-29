# TASKS — Việc đang thực sự active

> Chỉ giữ việc **đang làm hoặc sắp làm ngay** trong phạm vi [SCOPE-vNext.md](SCOPE-vNext.md).
> Việc có giá trị nhưng chưa tới lượt → [BACKLOG.md](BACKLOG.md). Ý tưởng chưa review →
> [INBOX.md](INBOX.md). Tình trạng chung → [STATUS.md](STATUS.md).
>
> Danh sách cũ (DONE chi tiết từ 07/2026, TODO trước lễ hội, việc game):
> [archive/logs/TASKS-2026-09-22.md](archive/logs/TASKS-2026-09-22.md).

Cập nhật: **2026-09-29**

Quy ước: ⬜ chưa làm · 🚧 đang làm · 👀 chờ Product Owner check · ✅ xong

---

## 🚧 Đang làm

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
- 👀 Product Owner thử link `two-wheeler` trên điện thoại thật ở Việt Nam (xem STATUS)
- 👀 Product Owner chọn font có tiếng Việt (xem STATUS)

**MAY** — chỉ làm khi MUST xong, test sạch, không làm tăng scope
- ⬜ Khối "Mới được xác nhận" · chỗ trống của Sổ ghi đúng hướng dẫn · shortcut "Cafe"

**Sau khi Product Owner duyệt:** deploy production · dọn `PlaceExplorer.js` nếu không còn dùng.

---

## ✅ Đã đóng 2026-09-29 — game Săn đèn Thành Tuyên 2026 (kết thúc 27/09)

Các việc game còn mở trong TASKS cũ **đóng lại, không làm**: thử luồng báo đèn trên iPhone ·
mở thử bản đồ khác mạng đêm 18/9 · thử 50–100 người tải ảnh · nâng routine 2–3 lần/ngày tuần lễ
hội · chủ dự án xem lại tuyến rước đèn. Ý tưởng game còn giá trị → [INBOX.md](INBOX.md) §2.
Việc dọn sau game (xoá namespace thử, số phận khối game) → [BACKLOG.md](BACKLOG.md) §9.
