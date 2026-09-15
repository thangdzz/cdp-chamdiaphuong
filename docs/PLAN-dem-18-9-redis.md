# Kế hoạch đêm 18/9 — Ngân sách Redis & theo dõi game Săn đèn

> Viết 2026-09-15 (đêm), sau khi deploy NOTE-08 Phần 1–3 (`web-l2j8wqis8`).
> Người đọc: chủ dự án + phiên Cowork. Mục đích: chốt 2 quyết định trước 18/9 19:00 và lịch theo dõi đêm đó.
> Ký hiệu: **[Fact]** đã kiểm chứng · **[Giả định]** ước lượng, cần số thật · **[Đề xuất]** chờ duyệt.

---

## 0. Đã chốt (2026-09-15 khuya)

- ✅ Chuyển Upstash **Pay-as-you-go**, hạn mức ngân sách **$10/tháng** — chủ dự án tự làm trên dashboard.
- ✅ **B1 + B2 + B3 đã code, test và deploy** (xem §5B). Thêm một sửa phát sinh: điện thoại bỏ qua
  snapshot cũ hơn bản đang có, để marker người vừa báo không biến mất.
- ✅ Giữ công tắc `CDP_ANALYTICS_DISABLED`. ✅ **Không sửa luồng ghi lượt báo** trước 18/9.
- ⏳ Theo dõi đêm 18/9 phải **tự động** (chủ dự án cũng đi săn đèn), kế hoạch chờ duyệt.
- ⚠️ $10 ≈ 5 triệu lệnh/tháng. Sau B: kịch bản thấp/vừa dư sức. Kịch bản cao (1.000 người chơi mỗi đêm
  × 7 đêm ≈ 5,8 triệu) có thể chạm hạn mức cuối tuần lễ hội → bị rate limit. Báo cáo tự động phải canh
  tổng tháng so với $10.

## 1. Tóm tắt 30 giây

- Game mở thật **18/9 19:00**. Web, game và số liệu truy cập **dùng chung một Redis Upstash, gói miễn phí
  500K lệnh/tháng**.
- Ước tính **mỗi người chơi đang chơi tốn khoảng 950 lệnh Redis/giờ** với code hiện tại. Chỉ cần ~300 người
  chơi trong 3 tiếng là **dùng hết gói miễn phí của cả tháng trong một đêm**.
- Hết gói thì Upstash **có thể giới hạn tốc độ** database. Lúc đó cả web (danh sách quán, sổ, lộ trình) có
  thể chậm/lỗi, không riêng game.
- Cần anh chốt:
  1. **Chuyển Upstash sang trả theo dùng (Pay-as-you-go)** trước 18/9. Ước tính vài USD/đêm.
  2. **Cho phép em sửa code giảm ~70% số lệnh** trước 18/9 (khoảng 1–2 giờ làm, 3 thay đổi nhỏ).

---

## 2. Cách Upstash tính tiền

- **[Fact — anh cung cấp]** Upstash tính theo **số lệnh Redis thực thi**, không theo số HTTP request.
  Pipeline/batch chỉ gộp đường truyền, mỗi lệnh bên trong vẫn tính riêng.
- **[Fact]** Gói miễn phí: 500K lệnh/tháng, 256MB. Pay-as-you-go: 0,20 USD/100K lệnh. Fixed plan: không
  tính theo số lệnh.
- **[Fact — tài liệu Upstash]** Vượt giới hạn: Upstash gửi email và **có thể rate limit** database. Nâng
  cấp: thêm phương thức thanh toán là tự chuyển Pay-as-you-go, database gián đoạn ~1–2 giây, không mất dữ
  liệu. Pay-as-you-go có hạn mức ngân sách: chạm hạn mức thì bị rate limit.
- **[Giả định]** Script Lua (phần ghi nhận hoạt động dùng) cũng tính **từng lệnh bên trong**. Bảng dưới
  tính theo hướng thận trọng này.
- **[Giả định]** Database tạo qua Vercel Marketplace nên đổi gói có thể phải làm trong Vercel dashboard →
  Storage → Upstash, không phải trên upstash.com. Cần anh kiểm tra.

---

## 3. Mỗi thao tác tốn bao nhiêu lệnh (code đang chạy production)

Đếm từ code, làm tròn:

| Thao tác | Lệnh Redis | Tần suất giả định cho 1 người chơi / giờ | Lệnh / giờ |
|---|---|---|---|
| Mở trang game (cấu hình + snapshot + dữ liệu riêng) | ~15 | 1 | 15 |
| Tự làm mới snapshot (2 phút/lần khi đang mở) | ~11 | 30 | 330 |
| Làm mới khi quay lại tab / mở khoá màn hình | ~11 | 10 **[Giả định]** | 110 |
| Báo 1 lượt (chống spam + ghi + trả snapshot mới) | ~30 | 5 **[Giả định]** | 150 |
| Ghi nhận hoạt động (đợt 30 giây khi đang bấm) | ~9 | 40 **[Giả định]** | 360 |
| **Tổng** | | | **≈ 950** |

Khách chỉ đọc bài lễ hội (không vào game): khoảng 25 lệnh/lượt (tải trang + 2 đợt ghi nhận).

---

## 4. Kịch bản đêm 18/9 (19:00–22:00, 3 tiếng)

**[Giả định]** Chưa có số liệu thật về lượng người chơi. Ba mức để xem độ nhạy:

| Kịch bản | Người chơi đồng thời | Lệnh cả đêm (code hiện tại) | So với gói miễn phí | Chi phí nếu Pay-as-you-go |
|---|---|---|---|---|
| Thấp | 100 | ~285K | 57% gói cả tháng | ~0,6 USD |
| Vừa | 300 | ~855K | **vượt 1,7 lần** | ~1,7 USD |
| Cao | 1.000 | ~2,85 triệu | **vượt 5,7 lần** | ~5,7 USD |

Cả tuần lễ hội 19–25/9 (đỉnh 20/9 và 25/9), kịch bản vừa: khoảng **10–20 USD** với code hiện tại.
Sau khi giảm lệnh ở §5B: khoảng **3–6 USD**.

---

## 5. Đề xuất

### A. [Quyết định của anh] Chuyển Upstash sang Pay-as-you-go trước 18/9

- **Vì sao:** rủi ro lớn nhất là **cả web bị rate limit giữa đêm hội**, không phải tiền. Vài USD/đêm rẻ
  hơn nhiều so với việc web chậm/lỗi đúng lúc đông khách nhất.
- **Làm:** thêm phương thức thanh toán, đặt hạn mức ngân sách tháng (gợi ý 20–30 USD). Làm vào giờ vắng
  (sáng 16/9 hoặc 17/9) vì database gián đoạn ~1–2 giây.
- **Đánh đổi:** tốn tiền thật (nhỏ). Nếu chạm hạn mức ngân sách vẫn bị rate limit, nên đặt hạn mức dư.
- Không chuyển thì phương án dự phòng là bật công tắc tắt ghi nhận (§6), nhưng chỉ cắt được ~38% số lệnh.

### B. [Code — chờ duyệt] Giảm ~70% lệnh mỗi người chơi, làm trước 18/9

| # | Thay đổi | Tiết kiệm | Đánh đổi |
|---|---|---|---|
| B1 | **Snapshot game dùng chung 20 giây phía server.** Nhiều người cùng làm mới trong 20 giây thì server chỉ đọc Redis 1 lần. Người vừa báo vẫn nhận snapshot mới ngay (bỏ qua bộ nhớ đệm). | ~440 lệnh/người/giờ, **không còn tăng theo số người chơi** | Người khác thấy marker mới trễ thêm tối đa 20 giây (hiện đã trễ tới 2 phút do chu kỳ làm mới) |
| B2 | **Ghi nhận hoạt động gửi mỗi 2 phút** thay vì 30 giây (vẫn gửi nốt khi rời trang) | ~270 lệnh/người/giờ | Số liệu Dashboard trễ thêm tối đa 2 phút — không ảnh hưởng gì |
| B3 | **Quay lại tab chỉ làm mới nếu lần gần nhất đã quá 30 giây** | phần còn lại của 110 | Không đáng kể |

Sau B: khoảng **250–300 lệnh/người chơi/giờ**, cộng một phần cố định nhỏ cho snapshot dùng chung.
Kịch bản vừa (300 người) còn khoảng 250K lệnh/đêm.

**[Giả định]** B1 là bộ nhớ đệm trong từng máy chủ Vercel. Vercel có thể chạy vài máy song song nên phần
cố định nhân theo số máy (vẫn nhỏ: ~2K lệnh/giờ/máy).

### C. Chưa đề xuất làm trước 18/9

- Viết lại phần ghi lượt báo cho ít lệnh hơn (30 → ~15): đụng đúng luồng quan trọng nhất đêm hội, dễ vỡ.
  Để sau lễ hội.
- Dashboard admin (NOTE-08 Phần 4): không tốn lệnh khi không ai mở, làm sau deploy vẫn có đủ số liệu.

---

## 6. Lịch theo dõi đêm 18/9

| Giờ | Việc | Ai |
|---|---|---|
| 18/9 trước 18:30 | Ghi **số lệnh đã dùng trong tháng** ở Upstash (mốc đầu). Xác nhận đã chuyển gói (nếu chọn §5A). | Anh |
| 18:30 | Mở `chamdiaphuong.io.vn/le-hoi-thanh-tuyen` trên iPhone: banner đếm ngược đúng, không lỗi. | Anh |
| **19:00** | Game tự chuyển live (không cần bấm gì). Tải lại trang game: hết chữ "chưa tới giờ", có nút báo. | Anh |
| 19:15 | Mở `/admin/game`: có lượt báo đầu tiên chưa, ảnh chờ duyệt. | Anh |
| 20:00 · 21:00 · 22:00 | Ghi số lệnh Upstash mỗi mốc → tính **lệnh/giờ**. Em chạy script **chỉ đọc** lấy nhanh: số khách, phiên, người mở game, lượt báo (Dashboard Phần 4 chưa có). | Anh + em |
| Bất kỳ lúc nào | **Ngưỡng hành động** (còn gói miễn phí): lệnh/giờ > 80K, hoặc tổng tháng > 400K → bật `CDP_ANALYTICS_DISABLED=1` trên Vercel + deploy lại (~1 phút). Game vẫn chạy bình thường, chỉ ngừng ghi số liệu truy cập. | Em (anh bảo) |
| Sau 23:00 | Ghi tổng kết đêm vào `docs/STATUS.md`: số người chơi, lượt báo, lệnh Redis thật → **thay các [Giả định] ở §3–§4 bằng số thật** cho các đêm 19–25/9. | Em |

**Lưu ý:** script đọc số liệu cũng tốn lệnh (khoảng 20 lệnh/lần), không chạy liên tục.

---

## 7. Cần anh trả lời

1. Chuyển Upstash sang **Pay-as-you-go** (§5A)? Nếu có: hạn mức ngân sách bao nhiêu?
2. Cho em làm **B1 + B2 + B3** (§5B) rồi deploy trước 18/9?
3. Đêm 18/9 anh muốn em trực theo lịch §6, hay anh tự xem và gọi em khi cần?

Nguồn tính phí: [Upstash Redis Pricing](https://upstash.com/pricing/redis) ·
[Pricing & Limits](https://upstash.com/docs/redis/overall/pricing) ·
[Upgrade Your Database](https://upstash.com/docs/redis/howto/upgrade-database).
