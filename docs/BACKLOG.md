# BACKLOG — Đã review, có giá trị, chờ phase phù hợp

> **BACKLOG** = việc **khớp [PRODUCT.md](PRODUCT.md)** (giúp tìm / lưu / dùng / chia sẻ / cập
> nhật thông tin địa phương), nhưng **không nằm trong [SCOPE-vNext.md](SCOPE-vNext.md)**. Không
> tự làm — muốn kéo việc nào vào scope thì trình Product Owner duyệt.
> Ý tưởng chưa review nằm ở [INBOX.md](INBOX.md). Việc đang làm nằm ở [TASKS.md](TASKS.md).
>
> Mỗi mục ghi **nguồn** (tài liệu đã archive) để tra chi tiết. 🔗 = liên quan trực tiếp tới
> vNext, nên xem lại khi viết spec vNext.

Trích lần đầu 2026-09-29 khi dọn tài liệu (xem DECISIONS 2026-09-29).

---

## 1. Thông tin còn đúng không (độ tươi dữ liệu)

- 🔗 **Kiểm lại dữ liệu cũ** — trường `lastVerifiedAt`, hiện tuổi dữ liệu trên thẻ ("Chưa kiểm
  lại hơn 1 tháng"), routine chia đôi việc (~5 chỗ mới + ~5 chỗ lâu nhất chưa kiểm), trần 3 mục
  chờ duyệt/ngày, xoay vòng nguồn quét. Spec: [SPEC-kiem-lai-du-lieu.md](SPEC-kiem-lai-du-lieu.md).
  vNext MUST có "thời gian xác nhận gần nhất" — hiện đã có từ nút "vẫn mở" (Chặng 1).
- 🔗 **Trust UI thống nhất** cho số điện thoại / ảnh / còn mở / giá; **hiện tuổi ảnh**; **chuẩn
  hoá loại ảnh**. Nguồn: `archive/2026-09-notes/10-NOTE-01-Product-UX.md` P1 #10–12.
- **Giá mùa cao điểm** — `places:live` chỉ có một ô giá, dịp lễ giá phòng có thể gấp 2–3 lần.
  Rủi ro uy tín. 3 hướng đã nêu: cặp giá mùa cao điểm · chỉ cảnh báo · câu bấm chọn.
  **Chờ Product Owner chọn hướng.** Nguồn: STATUS log 2026-08-19.
- **Gọi điện xác minh 10–15 chỗ quan trọng nhất** (việc tay, không cần code). Nguồn: TASKS cũ.
- **Xác minh phân loại "Danh Khoa - Cho thuê xe tự lái"** (đang đoán `thue-o-to`). Nguồn: TASKS cũ.

## 2. Vị trí & chỉ đường

- **Ghim toạ độ cho địa điểm** — 11/241 chỗ đã ghim (22/9). Bảng ghim hàng loạt có sẵn ở
  `/admin/vi-tri`. Khi ghim được ~80% mới cân nhắc bật `REQUIRE_VERIFIED_LOCATION = true`
  (bật sớm là mất nút Chỉ đường ở hầu hết các chỗ). Nguồn: DECISIONS 2026-09-22.
- **Dùng toạ độ để phát hiện trùng / thay thế địa điểm** chính xác hơn. Nguồn: `23-NOTE-14` P1 #16.
- **Điểm trả khách `dropoffPoints[]`** và nhiều điểm đón theo chiều tuyến. Nguồn: `23-NOTE-14` P1 #12, #17.
- **Nhập điểm đón thật cho "Xe ghép Anh Huy"** (việc của chủ dự án trong `/admin`). Nguồn: TASKS cũ NOTE-14.
- **Micro-location** — cửa chính / bãi xe / điểm đón riêng của một chỗ (`locationPoints[]`).
  PRODUCT §3.2 nhắc "chỗ gửi xe, lối vào". Nguồn: `24-NOTE-15` §11–12, P1.
- **Bản đồ hiện toàn bộ địa điểm CDP** — màn mới, việc lớn (vNext NOT NOW: sửa lớn Map).
  PRODUCT §3.4. Nguồn: `24-NOTE-15` §6.

## 3. Sổ & Lộ trình

- 🔗 **8–12 sổ mẫu tổng thể** do CDP soạn (vNext MAY: empty state tốt hơn cho Sổ có thể dùng lại).
  Nguồn: `10-NOTE-01` P1 #9.
- **Lộ trình mẫu của CDP** (`is_featured`) + nút "Dùng lộ trình này" (sao chép sang người dùng);
  **nêu bật lộ trình cộng đồng**. Nguồn: `archive/2026-09-notes/CDP_P1-P8-tiep…` Phase 2 §6–8.
- **Google Routes API** — quãng đường/thời gian từng chặng, vẽ tuyến trong CDP (PRODUCT §3.3
  "di chuyển giữa các điểm thế nào"). Cần toạ độ trước. Nguồn: CDP_P1-P8 Phase 3, NOTE-07 P2.
- **Ghi chú trong lộ trình chia sẻ** — đang giữ 140 ký tự. Trước khi tăng phải chốt: riêng tư
  (không hiện ở link chia sẻ) hay công khai (phải qua duyệt). Nguồn: DECISIONS 2026-09-12.
- **Giới hạn `MAX_WAYPOINTS`** — phải thử trên iPhone thật mới biết số. Nguồn: DECISIONS 2026-09-22.
- **Phát hiện lộ trình đã sao chép** để khỏi tạo trùng. Nguồn: `22-NOTE-13` P1 #11.

## 4. Đi lại

- **Kiểm lại mức hoàn thiện nhóm "Theo tuyến"** (xe khách / xe buýt). Tự lái + Điểm giao thông
  đã làm sớm 10/9. Nguồn: `15-NOTE-06-Transport…` P1, `14-NOTE-05-Transport…` P1.

## 5. Địa điểm đóng cửa / thay thế

- **Lifecycle đầy đủ hơn** · **admin so sánh nguồn mới với chỗ đã đóng** · **lịch sử mở lại rõ
  nguồn gốc**. Nguồn: `22-NOTE-13` P1 #9, #10, #12.

## 6. Ảnh

- **Ảnh thu nhỏ (thumbnail) thật** · thống kê dùng ảnh · **dọn ảnh mồ côi** (phải có chỉ mục
  tham chiếu + chạy thử trước khi xoá) · UX chú thích/vai trò ảnh · ảnh nhận diện cho điểm dừng
  lộ trình. Nguồn: `20-NOTE-11` P1.

## 7. Bảo mật admin

- **Mỗi người duyệt một tài khoản**, khoá tạm sau nhiều lần sai, 2FA — làm khi có thêm người
  duyệt. Hiện là một mật khẩu chung + cookie ký HMAC. Nguồn: PRD §7, ROADMAP 5b.

## 8. Nợ kỹ thuật

- **MapLibre không khởi tạo xong ở `next dev`** (StrictMode chạy effect hai lần) — hoãn tới hết
  mùa game. Trong lúc chưa sửa: test giao diện bản đồ phải chạy `next build` + `next start`.
- **Gộp bộ đệm đọc**: `lib/game/store.js` giữ bản sao riêng của `createSharedRead`
  (`lib/sharedRead.js`).
- **Soát lượt đọc Redis mỗi lần mở trang** còn lại (`lib/aboutPage.js` trên `/gioi-thieu`).
- **Test giao diện bằng trình duyệt** — 22 script Playwright cũ đã mất; hiện chỉ có 36 test hàm
  thuần (`npm test`). Viết lại khi cần.
- **Nhãn "còn chỗ" viết cứng ngày lễ hội 2026** trong `app/occupancy.js` — gắn với câu hỏi mở
  "còn giữ nhãn còn chỗ không" ([STATUS.md](STATUS.md)).

## 9. Dọn sau game Thành Tuyên (cần duyệt vì đụng dữ liệu/cấu hình)

- Xoá khoá thử `cdp-thu-choi:*` trong Redis và 3 biến `CDP_*_NAMESPACE` ở môi trường Preview
  của Vercel. Nguồn: TASKS cũ "Gấp".
- Quyết định số phận khối game trên trang chủ (`HOME_GAME_SLUG`) và trang lễ hội sau khi game
  hết — xem xung đột ngày kết thúc ở [STATUS.md](STATUS.md). Dữ liệu game trong Redis **giữ
  nguyên** (NOTE-03 game §2.8: game theo mùa lưu thành lịch sử, không xoá).
