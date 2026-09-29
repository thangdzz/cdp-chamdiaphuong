# INBOX — Ý tưởng chưa review

> **INBOX** = ý tưởng / đề xuất **chưa được review**, hoặc thuộc nhóm **NOT NOW** của
> [SCOPE-vNext.md](SCOPE-vNext.md). Chưa ai hứa sẽ làm. Review theo câu hỏi ở
> [PRODUCT.md §7](PRODUCT.md): có giúp **tìm / lưu / dùng / chia sẻ / cập nhật** thông tin địa
> phương tốt hơn không? Có → chuyển sang [BACKLOG.md](BACKLOG.md). Không → xoá khỏi đây, ghi
> lý do vào [DECISIONS.md](DECISIONS.md) nếu đáng nhớ.
>
> Mỗi mục ghi **nguồn** (tài liệu cũ đã archive) để tra lại chi tiết khi cần.
> Ý tưởng mới phát sinh: thêm vào cuối nhóm phù hợp, kèm ngày.

Trích lần đầu 2026-09-29 khi dọn tài liệu (xem DECISIONS 2026-09-29).

---

## 1. Tài khoản, chủ quán, kiếm tiền

- **Đăng nhập bằng số điện thoại** — chỉ mời khi người dùng đã "có thứ để mất" (vd. ≥3 ghi
  chú riêng). Còn 3 câu hỏi chưa chốt: kênh OTP (Zalo ZNS / SMS / email — chỗ duy nhất phải trả
  tiền bên thứ ba) · có cho đăng nhập bằng Zalo không · gộp thế nào với hồ sơ ẩn danh đang chạy.
  PRODUCT §4: *chức năng cơ bản không bắt buộc đăng nhập*.
  Nguồn: `archive/2026-07-08-nen-mong/SPEC-chang-7.md`, NOTEBOOK-DESIGN §8.
- **Chủ quán nhận (claim) địa điểm của mình** — bắt buộc xác minh OTP về đúng số công khai của
  chỗ đó; lời mời theo kiểu "có khách báo số điện thoại quán anh sai". Chỉ làm khi đã có traffic.
  Nguồn: `SPEC-chang-8.md`, NOTEBOOK-DESIGN §11, DECISIONS 2026-08-11.
- **Chủ quán/khách sạn tự cập nhật tình trạng còn chỗ** — gắn với claim. Nguồn: PRD §3.2.
- **Mô hình thu phí** (gói nổi bật…) — sau khi có người dùng thật. Nguồn: PRD §3.2, NOTE-01 P2.

## 2. Gamification / game layer (NOT NOW)

- **Bảng điểm + huy hiệu** đang chạy trong code, không mở rộng thêm lúc này. Thiết kế đầy đủ ở
  NOTEBOOK-DESIGN §10 (điểm chỉ trả cho phiếu trùng đồng thuận, không bao giờ trừ điểm).
- **Game engine dùng lại được** cho chợ phiên, mùa hoa, ảnh địa phương… — thứ tự mechanic đã
  đề xuất: Completion → Curiosity → Collection → First Discovery → Personal Progress → Quest…
  Leaderboard không phải lõi. Nguồn: `archive/2026-thanh-tuyen-game/12-NOTE-03-Game-Layer…` §2.7–2.8.
- **Mời bạn = tăng độ tin cậy khởi điểm** (xác minh chéo theo mạng giới thiệu) — cần trust model
  chống farm/vòng mời chéo trước. Nguồn: 12-NOTE-03-Game §3.
- **Chống gian lận game giai đoạn 2** (OTP, tách ẩn danh/đã xác minh, không cộng đôi điểm) —
  chỉ làm khi có giải thưởng thật; xem dữ liệu cờ đêm 18/9 trước. Nguồn: `archive/logs/TASKS-2026-09-22.md`.
- **Bản đồ game:** vòng tròn sai số quanh chấm xanh; hạn giờ ~6 giây khi nền bản đồ không về rồi
  chuyển nền dự phòng. Chỉ đáng làm nếu có mùa game sau. Nguồn: TASKS cũ "Bản đồ game".
- **Feed "X vừa báo thấy…"**. Nguồn: HANDOFF cũ §5.
- **Thưởng cho người gửi địa điểm mới** — chỉ tính khi đã duyệt và đạt chất lượng. Nguồn: PRD §3.2.

## 3. Nội dung, sự kiện, bài viết (NOT NOW: kho lễ hội / blog / cẩm nang)

- **Post Engine dạng block** dùng cho mọi loại nội dung (cuối tuần, họp lớp, lịch gia đình…).
  Nguồn: `archive/2026-09-notes/CDP_P1-P8-tiep…` Phase 3 §5.
- **Source Registry + Content Monitor + AI trích xuất cập nhật + admin duyệt diff** (bot không
  publish thẳng). Nguồn: CDP_P1-P8 Phase 2 §1–5.
- **Checklist Post/Event còn dở:** dữ liệu dán tay và bot dùng chung pipeline (#4) · chống trùng
  / mâu thuẫn Event đầy đủ (#5) · cảnh báo thiếu/cũ lịch, Nông Tiến 11/9 làm test hồi quy (#6).
  Nguồn: TASKS cũ "Checklist 8 việc".
- **Thông tin theo khu vực, không theo địa điểm** ("đường Nguyễn Tất Thành chặn từ 18h").
  Khoảng trống thật nhưng lớn. Nguồn: STATUS log "Việc đang chờ bàn".
- **Thuê chỗ ngồi xem rước đèn** (dịch vụ chủ mô hình tự kinh doanh, CDP chỉ hiển thị) —
  PRODUCT §1 có nhắc nhu cầu này. Nguồn: PRD §3.2.

## 4. Tìm kiếm & cá nhân hoá (NOT NOW: AI recommendation, cá nhân hoá sâu)

- **Tìm kiếm hiểu ý định bằng ngôn ngữ tự nhiên** ("cafe gần quảng trường, có wifi, mở sau
  22h"). Cần dữ liệu có cấu trúc tốt hơn trước. Nguồn: PRD §3.2.

## 5. Lộ trình & bản đồ nâng cao (NOT NOW: sửa lớn Lộ trình / Map)

- **Kéo-thả sắp xếp điểm nâng cao**, **trình sửa ảnh bìa Sổ**, **field nâng cao theo subtype**.
  Nguồn: `12-NOTE-03-Notebook…` P2, `13-NOTE-04-Transport…` P2.
- **Tối ưu tuyến tự động** — chỉ khi có nhu cầu thật. Nguồn: NOTE-04/NOTE-07 P2.

## 6. Admin (NOT NOW: redesign admin)

- **Dọn admin đợt 2** — đổi đường dẫn cho thống nhất + tách `/admin/duyet`. Khuyến nghị 22/9:
  **bỏ**, vì đổi đường dẫn làm hỏng link đã lưu; chủ dự án chưa chốt. Nguồn: TASKS cũ.
- **Trang Giới thiệu:** mục lục dính trên desktop, xem trước từ Admin. Nguồn: `18-NOTE-09` P1.

## 7. Mở rộng địa lý

- **Mở rộng dữ liệu ra vùng mới** (ngoài vùng Tuyên Quang đang quét). Đã chốt 29/9: vNext **không**
  mở rộng; "TP Tuyên Quang cũ" không còn là ranh giới sản phẩm cố định (DECISIONS "2026-09-29
  (sau)"). Khi nào mở vùng mới thì review lại ở đây. Nguồn: PRD §3, NOTE-01 P2.
