# ROADMAP — chamdiaphuong (Chạm Địa Phương)

> Chia nhỏ để mỗi giai đoạn xong đều có thứ **bấm thử được**, không có giai đoạn nào chỉ
> code mà không xem được kết quả. Xem tiến độ thật ở [STATUS.md](STATUS.md).

## Giai đoạn 0 — Khung tài liệu ✅
- CLAUDE.md, PRD, ROADMAP, STATUS, DECISIONS.
- Kết quả bấm thử: không có (đây là tài liệu, chưa code).

## Giai đoạn 1 — Dữ liệu mẫu đầu tiên
- Thu thập thủ công ~10-20 địa điểm ăn/ngủ tại khu vực TP Tuyên Quang cũ (từ Google Maps + Facebook)
  vào một file dữ liệu đơn giản (VD bảng/spreadsheet hoặc file JSON).
- Anh xem và duyệt danh sách này trước khi đưa lên web.
- **Bấm thử được:** anh xem được một danh sách/spreadsheet có tên, giá, địa chỉ của các
  điểm — kiểm tra đúng/sai trước khi đi tiếp.

## Giai đoạn 2 — Trang web hiển thị danh sách (chưa có lọc) ✅
- Web app mobile-first, hiển thị danh sách địa điểm từ dữ liệu Giai đoạn 1.
- Mỗi thẻ: tên, giá, địa chỉ + nút chỉ đường.
- **Bấm thử được:** mở link trên điện thoại, thấy danh sách quán ăn/khách sạn thật.
  👉 https://web-five-xi-28.vercel.app

## Giai đoạn 3 — Bộ lọc tìm kiếm đơn giản ✅ (một phần)
- Đã làm: Lọc theo **loại hình** (Ăn/Ngủ), **khu vực** (phường, suy từ địa chỉ có sẵn), và
  **khoảng giá** (4 mức, phù hợp cả giá đồ ăn lẫn giá phòng).
- **Chưa làm** (thiếu dữ liệu thật): lọc theo **giờ mở cửa** và **tiện ích** (wifi...) —
  20 địa điểm mẫu chưa có 2 loại dữ liệu này. Sẽ làm khi có dữ liệu, không đoán bừa.
- **Bấm thử được:** lọc ra đúng nhóm quán mình cần trong vài giây.
  👉 https://web-five-xi-28.vercel.app

## Giai đoạn 4 — Trạng thái còn chỗ (ước lượng) ✅
- Đã làm: Nhãn 3 mức (Có khả năng còn chỗ / Khả năng hết chỗ cao / Chưa đủ dữ liệu) cho cả
  Ngủ và Ăn. Suy luận theo lịch (không cần dữ liệu riêng từng chỗ): cao điểm lễ hội
  (19–25/9/2026) hoặc tối thứ 6/7 mùa diễu diễu (21/8–27/9) → hết chỗ cao; ngày khác → còn
  chỗ. Chỗ chưa xác định khu vực (ward) → luôn "Chưa đủ dữ liệu".
- Tính theo giờ thiết bị của khách (client-side), không phải giờ máy chủ lúc build — để
  luôn đúng thời điểm thực khi khách mở trang.
- **Bấm thử được:** thấy nhãn trạng thái trên từng thẻ, đổi ngày giờ máy sẽ thấy nhãn đổi
  theo. 👉 https://web-five-xi-28.vercel.app

## Giai đoạn 5 — Quy trình duyệt trước khi đăng

### 5a — Trang duyệt tối giản ✅
- Đã làm: Chuyển kho dữ liệu từ file JSON đi kèm code sang **Upstash Redis** (qua Vercel
  Marketplace, gói miễn phí) — 2 danh sách: "đang công khai" và "chờ duyệt". Trang chủ giờ
  đọc dữ liệu từ đây (không còn tĩnh hoàn toàn — xem lại mỗi lần khách tải trang).
- Đã làm: Trang `/admin` — đăng nhập bằng 1 mật khẩu chung (lưu trong biến môi trường
  `ADMIN_PASSWORD`, không lộ trong code); xem/sửa "đang công khai", xem/duyệt/từ chối
  "chờ duyệt", thêm địa điểm mới vào hàng chờ.
- Sự cố phát hiện & đã sửa: cookie phiên đăng nhập đặt `secure: true` cứng, chỉ hoạt động
  qua HTTPS — làm việc đăng nhập luôn thất bại khi thử ở máy local (http). Đã sửa: chỉ bắt
  buộc `secure` khi chạy thật (production).
- Đã kiểm tra kỹ: đăng nhập sai/đúng mật khẩu, thêm — duyệt — từ chối — sửa — xoá, đăng
  xuất, và xác nhận phiên bị xoá sau khi đăng xuất. Test cả ở bản build thật và trên link
  thật (HTTPS).
- Đủ dùng cho quy mô anh + 1-2 người tin tưởng, và làm "đích" sẵn sàng nếu sau này có AI
  quét dữ liệu hằng ngày đổ vào (xem mục "Sau bản đầu").
- **Bấm thử được:** vào `/admin`, đăng nhập bằng mật khẩu đã đặt, thêm/duyệt/sửa/xoá một
  điểm — thấy ngay thay đổi trên trang chủ không cần deploy lại.
  👉 https://web-five-xi-28.vercel.app/admin

### 5b — Bảo mật đầy đủ (để sau, khi có nhiều người dùng hơn)
- Mỗi người một tài khoản riêng, phân quyền rõ, khoá tạm sau nhiều lần đăng nhập sai, mật
  khẩu lưu mã hoá, 2FA (xem [PRD §7](PRD.md#7-bảo-mật-cơ-bản)).
- Làm khi thực sự cần: nhiều người duyệt hơn, dữ liệu quan trọng hơn, hoặc trước khi mở
  rộng công khai hơn.

## Giai đoạn 6 — Hoàn thiện & kiểm thử trước lễ hội
- Kiểm thử trên điện thoại thật, sửa lỗi, bổ sung đủ số lượng địa điểm cần thiết.
- Có bản dùng thử sẵn sàng **trước cả hai mốc**: dân bản địa chơi sớm (~1 tháng trước
  chính lễ) và khách tỉnh khác đến sớm (~3 tuần trước chính lễ).
- **Bấm thử được:** bản chạy thật, đủ dữ liệu để mời người dùng thật đầu tiên thử.

---

## Sau bản đầu (v2+, chưa lên kế hoạch chi tiết)
- Tìm kiếm hiểu ý định bằng ngôn ngữ tự nhiên.
- Mở rộng sang Chơi và Đi lại.
- Chủ quán/khách sạn tự cập nhật trạng thái còn chỗ.
- Mô hình thu phí (gói nổi bật...).
- Mở rộng ngoài khu vực TP Tuyên Quang (cũ).
- **AI tự động tìm & cập nhật dữ liệu hằng ngày, mở rộng dần ra toàn TP Tuyên Quang** ✅
  (khung đã xong, đang bật lịch chạy thật)
  1. ✅ Trang duyệt (5a) xong trước — dữ liệu AI tìm được luôn vào "hàng chờ duyệt", không
     tự động công khai.
  2. ✅ Dữ liệu ingestion đã ở Upstash Redis (`ingestion:review_queue` +
     `ingestion:source_runs` + `ingestion:place_snapshots`) — xem `lib/ingestion/`.
  3. ✅ Pipeline chuẩn hoá + so khớp/dedupe + hiển thị duyệt trong `/admin` — đã code, test
     kỹ bằng dữ liệu mẫu (xem `data/ingestion-inbox/`).
  4. 🔲 **Nguồn dữ liệu thật:** anh chọn đặt lịch cho 1 phiên AI tự tìm kiếm web mỗi ngày
     (không phải job chạy nền miễn phí — tốn hạn mức dùng AI mỗi lần). Đang thiết lập lịch.
  5. 🔲 Google Places API (trả phí) vẫn là lựa chọn thay thế/bổ sung sau này nếu cần dữ
     liệu đầy đủ + chính xác hơn (giờ mở cửa, toạ độ...) — chưa cần ngay.
