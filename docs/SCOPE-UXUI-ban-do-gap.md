# SCOPE — vNext UX/UI: Bản đồ gấp + Cơ bản

Status: **FROZEN v1.0 — hiệu lực 2026-11-12.** Muốn thêm/bớt gì phải được PM duyệt lại. Ý tưởng phát sinh → [INBOX.md](INBOX.md).
Chưa BUILD · chưa TEST · chưa RELEASE. BUILD A chỉ bắt đầu khi PM xác nhận [FREEZE record](FREEZE-UXUI-ban-do-gap-2026-11-12.md).

> Nguồn theo thứ tự ưu tiên: [PRODUCT.md](PRODUCT.md) → [DECISIONS.md](DECISIONS.md) (11–12/11) →
> [PM-FINAL-REVIEW-DESIGN…](PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md) → [PM-REVIEW-DESIGN…-v2](PM-REVIEW-DESIGN-CDP-Ban-do-gap-2026-11-12-v2.md)
> → [PM-REVIEW-SCOPE…](PM-REVIEW-SCOPE-UXUI-Ban-do-gap-11-11-2026.md) → [kế hoạch](CDP-ke-hoach-UXUI-Ban-do-gap-song-vNext.md).
> Thiết kế: [DESIGN.md](DESIGN.md) v2.0 · Mockup 9 bảng: https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo ·
> Kiểm kê: [KIEM-KE…](KIEM-KE-anh-so-lieu-nen-2026-11-11.md).

**Luồng:** FREEZE → PM xác nhận FREEZE record → BUILD A → TEST A → RELEASE A → BUILD B → TEST B → RELEASE B → OBSERVE.

---

## 1. Quyết định đã khóa

| # | Quyết định | Nguồn |
|---|---|---|
| 1 | Một app, một dữ liệu và logic; 2 giao diện khác nhau ở **bố cục, chất liệu, chuyển động**, không chỉ màu | PM 11/11, 12/11 |
| 2 | **Đợt A** = Cơ bản mới, không có công tắc giao diện. **Đợt B** = Bản đồ gấp + công tắc + Sổ gần đây + Lộ trình gần đây + Chọn ngẫu nhiên. Rollback riêng mỗi đợt | PM 11/11 |
| 3 | Mặc định cuối cùng là Bản đồ gấp **khi đạt hiệu năng**; không tự đổi giao diện khách cũ đã chọn | PM 11/11 |
| 4 | Logo `#C8553D`; nút/link hành động `#B04A33`; xanh rừng cho chữ/nền đậm; không có màu CTA thứ hai | PM 12/11 |
| 5 | **Ảnh:** ảnh thật phù hợp (không dùng ảnh menu) → không có / lỗi → **minh họa theo nhóm** (5 SVG). Cùng bộ hình cho 2 chế độ. Ảnh thẻ tìm kiếm **P0** | PM 12/11 |
| 6 | Nhãn Chi tiết: “Hình minh họa · Chưa có ảnh thực tế” + “Gửi ảnh”. Thẻ tìm: dấu nhỏ + chú giải 1 lần | PM 12/11 |
| 7 | **Sổ / tài khoản / đồng bộ** theo DECISIONS 2026-11-12. Câu chữ: “Sổ của bạn gắn với thiết bị này. Chưa có đồng bộ tự động giữa các thiết bị.” | PM 12/11 |
| 8 | **“Chọn ngẫu nhiên”**: đều xác suất trong đúng Sổ đã chọn; chỉ loại chỗ đã gỡ / hết hạn; chỗ chưa xác nhận vẫn được chọn kèm nhãn | PM 12/11 |
| 9 | Khẩu hiệu trên H1; H1 mặc định “Hôm nay bạn muốn ghé đâu?”; **không autofocus** trên mobile | PM 12/11 |
| 10 | Hoàn tác sau khi lưu = P0; chỉ báo thành công khi server OK; không hứa tự gửi lại khi offline | PM 11/11 |
| 11 | Analytics: thuộc tính `theme` (`basic` / `atlas`) + `theme_switch`; sửa có giới hạn đoạn ghi; không ghi từ khóa, Ghi chú, tên/mã Sổ, thông tin nhận dạng; số liệu cũ vẫn đọc được | PM 12/11 |
| 12 | Lộ trình gần đây = sửa trong 14 ngày; nhãn “Lộ trình gần đây / Mở lại Lộ trình” | PM 11/11 |
| 13 | Thiết bị: iPhone Safari iOS 16+, Android Chrome, trình duyệt Zalo/Facebook, máy tính Chrome/Safari/Edge; chuẩn ≥ 360px, kiểm thêm 320px | PM 11/11 |
| 14 | Thu thập thêm ảnh thật = BACKLOG nội dung, không chặn release | PM 12/11 |
| 15 | **Thanh điều hướng đáy 4 mục** trên mobile: Trang chủ · Tìm chỗ · Sổ · Lộ trình; chạm ≥ 44px; màn Chi tiết dùng thanh Lưu vào Sổ / Chỉ đường thay thế, có Quay lại; không chồng 2 thanh; tính vùng an toàn; desktop dùng sidebar | PM final §2.1 |
| 16 | **Công tắc Giao diện** trong Menu (mobile) và cuối sidebar (desktop). Đợt B được có **một lời gợi ý ngắn, không chặn**, tối đa 1 lần mỗi thiết bị, bỏ qua được, không ép đổi | PM final §2.2 |
| 17 | **Không mở lối vào mới “Dùng trên máy khác?”** trong đợt A (và B). Giữ nguyên mã 6 số và đường vào hiện có trong “Sửa giúp”; không làm hỏng khi đổi giao diện | PM final §2.3 |
| 18 | Trang chủ Bản đồ gấp: **người quay lại** bỏ minh họa địa hình lớn để Sổ gần đây lên sớm (giữ nền giấy, góc gập); **người mới** có địa hình 3 lớp sau ô tìm + 4 nhóm | PM final §2.4 |
| 19 | **Tiêu đề trang chủ trong Admin: tối đa 60 ký tự**, có bộ đếm + thông báo khi quá; không tự cắt tiêu đề cũ đã lưu; thuộc đợt A, là sửa nhỏ, không tái cấu trúc Admin | PM final §2.5 |

## 2. Phạm vi đợt A — Cơ bản mới

| Màn / phần | Làm gì |
|---|---|
| Nền | Token theo vai trò, font Be Vietnam Pro, giữ màu cố định cho ngoại lệ (DESIGN §2) |
| Điều hướng | Thanh đáy 4 mục, header + Menu, sidebar desktop; ẩn khi bàn phím bật; thay bằng thanh hành động ở màn chi tiết |
| Minh họa | 5 SVG vào `web/public/`; chọn ảnh thật → minh họa; nhãn + alt |
| Trang chủ `/` | Khẩu hiệu → H1 (Admin, mặc định) → câu dẫn → ô tìm (không autofocus) → 4 nhóm → khối người mới. Nội dung theo mùa chỉ khi còn hiệu lực |
| Tìm chỗ `/tim` | Thẻ ~92px với ảnh/minh họa 72px, chip nhóm, Khu vực, Giá, “Xem thêm”; giữ từ khóa/bộ lọc/vị trí cuộn khi Back |
| Chi tiết `/dia-diem/[id]` | Ảnh/minh họa 150px + nhãn; thứ tự theo DESIGN §7; Lưu (chọn Sổ) + Hoàn tác; thanh hành động |
| Sổ `/so…` | Thiết kế lại, câu chữ thiết bị; **chưa** có Chọn ngẫu nhiên |
| Lộ trình `/lo-trinh…` | Thiết kế lại; đánh số, ↑ ↓, thêm/xóa điểm, Google Maps, chia sẻ như hiện tại |
| Màn phụ | `/ghi-chu`, đóng góp, `/gioi-thieu`, lễ hội: chỉ token/chữ |
| Admin | **Chỉ** giới hạn 60 ký tự + bộ đếm cho tiêu đề trang chủ |
| Server | Thêm ảnh đại diện (url, rộng, cao; chỉ ảnh thường) vào dữ liệu thẻ `lib/searchResults.js` |

## 3. Phạm vi đợt B — Bản đồ gấp + công tắc + nhóm quay lại

| Phần | Làm gì |
|---|---|
| Công tắc | `data-theme` trên `<html>`, script chống nháy, ghi nhớ trên thiết bị (khóa mới), Menu + cuối sidebar, gợi ý 1 lần |
| Lớp Bản đồ gấp | 3 tấm gấp, tờ bản đồ, lớp địa hình (người mới), ảnh dán, bìa Sổ, dải giấy Lộ trình |
| Nhóm quay lại | Sổ gần đây (≤ 2, cần `updatedAt` trong tóm tắt Sổ), Lộ trình gần đây (14 ngày), Chọn ngẫu nhiên |
| Chuyển động | MỞ / GẤP / NỐI, giảm chuyển động, fallback không hiệu ứng |
| Analytics | `theme` cho sự kiện liên quan + `theme_switch` |

**Ngoài scope cả 2 đợt:** phần còn lại của `/admin` · lớp game · ảnh xem trước link chia sẻ · tài khoản/đồng bộ · lối vào khôi phục mới · gợi ý AI · 3D · tự làm bản đồ/định tuyến · thêm/bớt chức năng Lộ trình · đổi cấu trúc Redis · dark mode · ảnh AI giả làm ảnh thật · “lưu nhanh” trên thẻ tìm · dọn `PlaceExplorer.js` (chỉ tách phần đang dùng nếu BUILD cần).

## 4. Checklist nghiệm thu đợt A

**Thiết bị** (mỗi mục dưới chạy trên): iPhone Safari iOS 16+ · Chrome Android · trình duyệt trong Zalo · trình duyệt trong Facebook · máy tính Chrome/Safari/Edge · cỡ **320 / 360 / 390px**.

- [ ] **Luồng lõi:** Trang chủ → Tìm → Chi tiết → Lưu (chọn Sổ) → Hoàn tác → Lưu lại → Mở Sổ → Thêm vào Lộ trình.
- [ ] **Lưu:** đang lưu (phản hồi ≤ 100ms) / thành công chỉ sau server OK / lỗi lưu / Hoàn tác / Hoàn tác lỗi. Hoàn tác không đụng Sổ khác. Chỉ 1 Sổ → lưu thẳng.
- [ ] **Ảnh:** chỗ có ảnh thật hiện ảnh; chỗ không ảnh hiện đúng minh họa nhóm (Ăn, Chơi, Ngủ, Đi lại, dự phòng); ảnh lỗi → minh họa + nhãn; ảnh menu không làm đại diện; alt đúng; nhãn “Hình minh họa · Chưa có ảnh thực tế” ở Chi tiết.
- [ ] **Thiếu dữ liệu:** thiếu giá, chưa xác nhận, vị trí chưa xác nhận (“Tìm trên Maps”), Chỗ quen gọi, chưa rõ khu vực.
- [ ] **Mất mạng:** thông báo rõ, không báo đã lưu, không hứa tự gửi lại. **Lỗi server:** thông báo + Thử lại, dữ liệu không mất.
- [ ] **Điều hướng:** thanh đáy đúng mục; ẩn khi bàn phím bật, không che ô nhập/kết quả; màn chi tiết không chồng 2 thanh; Quay lại rõ; vùng an toàn iOS và trình duyệt trong app.
- [ ] **Trang chủ:** không autofocus; tiêu đề Admin 60 ký tự vẫn giữ ô tìm + 4 nhóm trong vùng đầu ở 320/360/390px; Admin chưa cấu hình → mặc định; tiêu đề cũ dài hơn 60 vẫn hiện an toàn.
- [ ] **Admin tiêu đề:** bộ đếm, chặn lưu khi quá 60, thông báo rõ; không cắt im lặng; phần Admin khác không đổi.
- [ ] **Tìm chỗ:** 20 thẻ + Xem thêm; danh sách dài trên máy thật; Back giữ từ khóa + bộ lọc + vị trí cuộn; 0 kết quả, đang tải.
- [ ] **Lộ trình:** tạo, thêm/xóa điểm, ↑ ↓ (có thông báo cho trình đọc màn hình), giờ dự kiến, mở Google Maps (kể cả chia chặng), chia sẻ.
- [ ] **Sổ/khôi phục:** câu chữ thiết bị đúng; mã 6 số vẫn dùng được qua đường cũ; không có nút/câu hứa đồng bộ.
- [ ] **Giữ nguyên:** link `/dia-diem/[id]`, `/so/[slug]`, `/lo-trinh/xem/[token]`, `/#mã-chỗ`; khóa `cdp_contributor`, `cdp_personal_notes`; dữ liệu Redis; `/admin` (trừ tiêu đề).
- [ ] **Tiếp cận:** chạm ≥ 44px, chữ ≥ 13px, tương phản đo trên máy thật (nút, nhấn, focus, disabled, chữ phụ), bàn phím Tab được.
- [ ] **Kỹ thuật:** `npm test` + test mới (chọn ảnh, giới hạn tiêu đề), lint, build; smoke test trên bản build thật với ghi số liệu bị chặn.
- [ ] **Release:** chụp lại số liệu nền; ghi bản deploy trước để rollback; **thử rollback** (promote bản cũ) trước khi công bố.

## 5. Checklist nghiệm thu đợt B (cộng thêm, chạy lại đủ đợt A ở chế độ Bản đồ gấp)

- [ ] **Công tắc:** trong Menu + cuối sidebar; đổi ngay, không tải lại, không đổi URL; tải lại vẫn nhớ; không nháy; bộ nhớ máy bị chặn → mặc định.
- [ ] **Giữ trạng thái khi đổi:** đang gõ tìm, đang lọc, form chưa gửi (ghi chú, đóng góp), đang cuộn, đang ở Chi tiết.
- [ ] **Gợi ý 1 lần:** không chặn, bỏ qua được, không hiện lại, không ép đổi; khách cũ giữ lựa chọn.
- [ ] **Mặc định:** khách mới vào Bản đồ gấp **chỉ khi** trang chủ đạt LCP ≤ 2,5 giây trên máy yếu; chưa đạt thì giữ Cơ bản.
- [ ] **Trang chủ:** người mới có địa hình 3 lớp sau ô tìm + 4 nhóm; người quay lại không có địa hình lớn, Sổ gần đây trong màn đầu.
- [ ] **Sổ gần đây** (≤ 2, lỗi tải → ẩn); **Lộ trình gần đây** (14 ngày, không có → ẩn).
- [ ] **Chọn ngẫu nhiên:** đúng Sổ đã chọn; đều xác suất (test hàm thuần); loại chỗ đã gỡ / hết hạn; chỗ chưa xác nhận có nhãn; Sổ trống / không còn chỗ hợp lệ nói lý do; Chọn lại; không đổi dữ liệu Sổ.
- [ ] **Chuyển động** trên máy thật: MỞ / GẤP (chỉ sau server OK) / NỐI; giảm chuyển động tắt hiệu ứng nhưng vẫn ở Bản đồ gấp; trình duyệt không hỗ trợ → mở bình thường; không che ô nhập/nút ở 320–360px.
- [ ] **Hiệu năng:** đo LCP/INP/CLS trang chủ, Tìm chỗ, Chi tiết ở cả 2 chế độ; hiệu ứng nặng không lên production.
- [ ] **Analytics:** sự kiện có `theme`; `theme_switch`; số liệu cũ vẫn đọc được; không có dữ liệu riêng tư.
- [ ] **Release:** rollback về bản cuối đợt A đã thử; công tắc “Cơ bản” không được dùng thay rollback.

## 6. Thứ tự BUILD dự kiến (mỗi bước một commit)

**A:** (1) token + font → (2) khung + thanh đáy + Menu → (3) minh họa vào `web/public/` + hàm chọn ảnh + dữ liệu ảnh thẻ → (4) Trang chủ + giới hạn tiêu đề Admin → (5) Tìm chỗ → (6) Chi tiết + Lưu + Hoàn tác → (7) Sổ → (8) Lộ trình → (9) màn phụ + trạng thái → TEST A → RELEASE A.

**B:** (1) công tắc + chống nháy + ghi nhớ → (2) lớp Bản đồ gấp từng màn → (3) Sổ/Lộ trình gần đây → (4) Chọn ngẫu nhiên → (5) chuyển động → (6) analytics theo theme → (7) gợi ý 1 lần → TEST B → RELEASE B.
