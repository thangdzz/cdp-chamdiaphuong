# TASKS — Việc đã làm xong

> Danh sách việc **đã hoàn thành**, tổng hợp từ lịch sử git (163 commit, từ 2026-07-15).
> Bỏ qua các commit tự động hằng ngày của routine quét dữ liệu (`scan:` / `chore: xoa
> pending-scan`).
>
> Việc **đang làm / sắp làm** xem [STATUS.md](STATUS.md); **vì sao** chọn cách làm đó xem
> [DECISIONS.md](DECISIONS.md); kế hoạch chia chặng xem [ROADMAP.md](ROADMAP.md).
>
> File này tạo ngày 2026-09-08, dựng lại từ toàn bộ lịch sử git — nên các mục cũ ghi theo
> mức tóm tắt, không chi tiết bằng các mục mới.

---

## Nền tảng ban đầu (2026-07-15 → 07-17)

- [x] Dựng web app Next.js đầu tiên, hiển thị danh sách địa điểm + bộ lọc (loại hình/khu
      vực/giá)
- [x] Pipeline "AI quét dữ liệu": chuẩn hoá → so khớp/dedupe → hàng chờ duyệt
      (`lib/ingestion/`)
- [x] Nguồn dữ liệu qua GitHub cho cloud agent + API nhận dữ liệu trực tiếp
      (`/api/ingest/submit`)
- [x] Trang duyệt `/admin` (Giai đoạn 5a): 1 mật khẩu chung, sửa được nội dung ngay trong thẻ
      trước khi duyệt
- [x] **Đổi nguyên tắc: tự động công khai** kết quả quét, chỉ giữ lại chờ duyệt khi nghi trùng
      lặp / mâu thuẫn dữ liệu
- [x] Thẻ địa điểm 2 lớp (gọn → bung "Xem thêm") + xem ảnh toàn màn hình

## Khách đóng góp dữ liệu (2026-07-18 → 07-20)

- [x] "Báo sai / Bổ sung ảnh": khách sửa field (địa chỉ/SĐT/giá), báo đã đóng cửa, hoặc gửi
      tối đa 3 ảnh/lần
- [x] Tự nén ảnh phía trình duyệt trước khi gửi (ảnh điện thoại thật >1MB từng làm hỏng luồng
      gửi)
- [x] Hồ sơ ẩn danh: biệt danh + **mã khôi phục 6 số**; hệ thống điểm & huy hiệu 5 bậc, có
      hiệu ứng ăn mừng bậc "Huyền thoại"
- [x] Chặn ăn điểm khống: gửi trùng y hệt nội dung/ảnh đã gửi cho cùng chỗ thì không tính điểm
- [x] Sửa lỗi luồng góp ý bị kẹt/reset khi bấm nhanh 2 lần
- [x] Ô tìm kiếm + nút cuộn lên/xuống cho danh sách địa điểm; tìm kiếm hiểu từ đồng nghĩa
      (cafe/coffee/cà phê/café)
- [x] Ô dán báo cáo routine ngay trong `/admin` (không cần mở chat)
- [x] Rút gọn địa chỉ hiển thị + thêm trường "khu vực" do khách nhập
- [x] Logo CDP + header bấm về trang chủ

## Tự động hoá routine quét (2026-08-04)

- [x] GitHub Action tự ingest kết quả quét hằng ngày → **pipeline chạy tự động hoàn toàn**,
      không cần copy-paste thủ công nữa

## Hướng mới "cuốn sổ địa phương" (2026-08-15 → 08-20)

- [x] **Chặng 0** — cập nhật PRD theo hướng mới (4 nhóm Ăn/Chơi/Ngủ/Đi lại, bỏ vai trò hạn
      chót của 21/08)
- [x] Viết `ARCHITECTURE.md` + spec chi tiết cho cả 8 chặng
- [x] **Chặng 1** — nút "Tôi vừa đến, vẫn mở" (check-in)
- [x] **Chặng 2** — câu hỏi bấm chọn + cơ chế đồng thuận (phiếu nhẹ dần theo thời gian)
- [x] **Chặng 3** — thêm 2 loại địa điểm Chơi và Đi lại
- [x] **Chặng 4** — sổ chia sẻ được (`/so/{slug}`): tạo sổ, thêm chỗ, chia sẻ link
- [x] Sửa `AREA_PRESETS` theo địa giới thực tế sau sáp nhập 2025 (bỏ nhầm phường của TP Hà
      Giang)
- [x] **Chặng 5 phần (a)** — "Mẹo tự do": ghi chú công khai bằng chữ, có duyệt
- [x] **Chặng 6** — ghi chú riêng (chỉ chủ nhân thấy)
- [x] Bấm vào chỗ trong sổ chia sẻ bung xem đầy đủ + nút "Sao chép link" cho chủ sổ
- [x] Rà soát giao diện theo `SPEC-giao-dien.md`: sửa font Arial→Geist, thang chữ 5 bậc, 1 màu
      nhấn, bo góc thống nhất, 3 chuyển động chuẩn (tắt khi máy bật "giảm chuyển động")
- [x] Ép giao diện luôn sáng màu (tránh chữ khó đọc khi máy bật chế độ tối)

## Công cụ xử lý trùng lặp trong `/admin` (2026-08-18 → 08-21)

- [x] Công cụ so sánh & gộp 2 chỗ trùng lặp, dùng chung cho cả 2 nguồn (khách báo + AI quét
      phát hiện)
- [x] Xử lý 3 mục "hoá thạch" kẹt trong hàng chờ duyệt; vá 2 lỗi pipeline (cảnh báo lặp, liên
      kết trùng lặp hỏng)
- [x] **L1** — xưng hô lệch giọng: sửa 19 chỗ trong 12 file ("em/bọn em/nhé/nha" → giọng trung
      tính)
- [x] **L2** — chặn gửi trùng không xét trạng thái (khách bị chặn vĩnh viễn dù bản cũ đã xử lý
      xong)
- [x] **L3** — gộp trùng lặp **gộp nhầm bên**: chỗ còn lại mang id của B nhưng nội dung của A
- [x] Ẩn nút "Duyệt, áp dụng" gây nhầm với báo cáo trùng lặp (nút đó chỉ cộng điểm, không gộp
      gì)
- [x] Đổi `mode="reviewItem"` sang ưu tiên dữ liệu chỗ đã công khai (B), không phải bản mới
      quét (A)

## Sửa routine quét dữ liệu (2026-08-20 → 08-21)

- [x] Thêm trường `signature_dishes` (tối đa 3 món, chỉ với loại Ăn) vào schema ingestion +
      cập nhật lệnh routine
- [x] **Tự động hoá `known-places-snapshot.json`** — tự cập nhật sau mỗi lần ingest thành công
      (trước đó đóng băng từ 18/07, routine chạy 16 lần không biết 70 chỗ mới đã lên web)
- [x] Thêm địa chỉ vào snapshot; viết lại Bước 4 của routine (đoạn `curl` đã chết 403)

## 2026-08-23 → 08-24

- [x] `/admin` mục "Đang công khai": đổi từ mở sẵn 122 form thành danh sách có tìm kiếm (không
      dấu) + tab lọc theo loại, 1 form mở tại 1 thời điểm
- [x] **Món đặc trưng** — thêm loại ảnh "Ảnh menu" riêng (mảng `menuPhotos`, mỗi ảnh kèm ngày
      gửi); hiện món do AI quét được lên thẻ dạng nhãn tĩnh
- [x] Công cụ gộp trùng lặp xử lý cả `menuPhotos` (trước đó gộp là mất im lặng ảnh menu của
      bên bị xoá)
- [x] Hiện tuổi ảnh menu ("khách gửi 3 tháng trước") — vì ảnh menu chụp nguyên bảng giá
- [x] **Zoom ảnh** trong khối xem ảnh toàn màn hình: chụm 2 ngón (1x–4x), kéo xem khi đã zoom,
      double-tap 1x⇄2.5x; chặn trình duyệt tự zoom cả trang
- [x] Khôi phục `an-03` "Nhà hàng Dũng Cá" bị xoá nhầm khi test công cụ gộp (xem
      [DECISIONS.md](DECISIONS.md) 2026-08-24)

## 2026-09-03 → 09-08

- [x] Ngừng theo dõi git cho `.claude/settings.json` / `.claude/settings.local.json` (từng
      chứa secret bị lộ; secret đã đổi giá trị mới)
- [x] **Gắn tên miền riêng `chamdiaphuong.io.vn`**: khai báo vào Vercel, trỏ 2 bản ghi A ở
      VinaHost, HTTPS tự cấp (Let's Encrypt, tự gia hạn)
- [x] Đặt `www` chuyển hướng 308 về tên miền gốc (tránh Google coi là 2 trang trùng nội dung)
- [x] Bổ sung `DECISIONS.md` (6 mục từ 23/08 → 08/09) + tạo `TASKS.md` (file này)
- [x] **NOTE-01 P0 việc 1–3** — copy đầu trang mới ("Gom chỗ hay. Chia sẻ dễ dàng."), sửa số
      mô hình đèn 40 → 45, banner lễ hội đổi sang câu theo nhu cầu thật ("Đi Thành Tuyên
      20/9?") + tăng độ đậm lớp phủ cho chữ dễ đọc
- [x] **Báo đóng cửa** — thêm lối vào riêng ở menu "Bổ sung" (trước đây là ô tích giấu cuối
      form, phải cuộn qua 6 ô nhập mới thấy) + trả đúng **15 điểm** như NOTEBOOK-DESIGN đã chốt
      (trước đây chỉ 5 điểm)
- [x] **NOTE-01 P0 việc 5–7 — xác nhận số điện thoại**: khối "Liên hệ" trong thẻ bung (số hiện
      dạng chữ lần đầu tiên), nhãn 3 trạng thái xác nhận, nút Tìm số trên Google, Số đúng / Số
      sai (+1 điểm lần đầu, chống bấm khống), dọn dữ liệu xác nhận khi xoá/gộp chỗ
- [x] **NOTE-01 P0 việc 8** — khối ảnh đổi sang 1 cover lớn + thumbnail + "Xem tất cả N ảnh";
      lời mời gửi ảnh nói rõ đang giúp việc gì (khác nhau tuỳ chỗ đã có ảnh hay chưa)
- [x] **NOTE-02 xong** — route mới `/dia-diem/{id}`: trang một địa điểm có Open Graph riêng
      (tên · loại · khu vực · ảnh), bố cục phẳng không bọc card, CTA Chỉ đường / + Vào sổ /
      Chia sẻ; nút Chia sẻ trên thẻ trang chủ trỏ đúng trang địa điểm thay vì mượn link sổ
- [x] **NOTE-03 P0** — tách bạch "Mẹo địa phương" (công khai, phải duyệt) và "Ghi chú trong sổ"
      (riêng của sổ, không lên trang địa điểm); mẹo có ngữ cảnh 7 lựa chọn và hiện dạng field
      thay vì bình luận; trang xem Sổ thêm collage ảnh + metadata "N địa điểm · Nhóm chính";
      Open Graph của Sổ dùng cùng mẫu đó
- [x] **Sửa lỗi link chia sẻ mang địa chỉ cũ** — gom về `lib/siteUrl.js` (hằng số tên miền
      chính), sửa cả 4 chỗ chia sẻ (địa điểm + sổ) và thêm `metadataBase` cho ảnh Open Graph
- [x] **Metadata card chỉ hiện dữ liệu thật** — thẻ trong Sổ bỏ "Chưa rõ ngày cập nhật" /
      "Độ tin cậy chưa đánh giá" / "Đối chiếu chưa rõ nguồn"; giữ "Chưa cập nhật giá" vì giá
      cần cho quyết định
- [x] **Tách bạch ảnh bìa địa điểm và ảnh bìa Sổ** (`lib/cover.js`) — admin chọn được ảnh bìa
      cho từng địa điểm trong `/admin`; 5 chỗ trước đây tự lấy `photos[0]` nay dùng chung, nên
      preview khi chia sẻ khớp ảnh khách đang thấy
- [x] **Dọn nốt P0 còn sót của NOTE 10/12** (sau khi rà lại 3 NOTE, 2026-09-09):
  - Mẹo địa phương trong thẻ Sổ hiện dạng field như trang địa điểm (trước đây vẫn là "💡 …")
  - Thẻ trong Sổ thêm ảnh nhỏ + loại hình (NOTE-03 §3 card compact)
  - Nút Chia sẻ / Lưu sổ chuyển lên ngay dưới tên sổ, không còn nằm cuối trang (NOTE-03 §6)
  - Lời mời gửi ảnh menu mới khi menu đã quá 3 tháng (NOTE-01 §7.4)
  - Trang địa điểm thêm nút "Xem thêm N ảnh menu" cho khớp thẻ trang chủ

## 2026-09-09 (NOTE 04)

- [x] **P0 việc 1 — Mẹo bấm chọn thay vì bắt gõ lại**: chọn ngữ cảnh xong, ngữ cảnh nào đã có
      sẵn câu hỏi bấm chọn thì đưa luôn bộ đáp án ra bấm (1 chạm → đồng thuận, không cần duyệt).
      Ô gõ chỉ mở khi đáp án cần làm rõ, khi bấm "Không có ý nào đúng", hoặc khi ngữ cảnh không
      có câu hỏi nào (Di chuyển / Khác)
- [x] Tách `app/QuestionOptions.js` dùng chung cho khối Mẹo và câu hỏi cuối thẻ, để 2 nơi không
      trôi lệch nhau
- [x] Chống hỏi trùng: câu khối Mẹo đang bày sẵn thì cuối thẻ bỏ qua đúng câu đó
- [x] **P0 việc 2 — `transportSubtype`** (7 loại), admin chọn trong `/admin`
- [x] **P0 việc 3 — field cho Xe ghép**: admin điền Loại xe + Tuyến chính; khách bấm chọn Hình
      thức / Điểm đón / Điểm trả / Đặt trước / Hành lý; thẻ hiện `Xe ghép · 7 chỗ` +
      `Tuyên Quang ↔ Hà Nội`
- [x] Xe ghép thôi bị hỏi những câu vô nghĩa (Gửi xe, Lối vào, Giờ đông, "Đây là chỗ gì?");
      mọi chỗ Đi lại đã chọn loại đều thôi bị hỏi "Đây là chỗ gì?"
- [x] Điền loại hình cho "Xe ghép Anh Huy" (xe ghép · 7 chỗ · Tuyên Quang ↔ Hà Nội)

## 2026-09-09 (NOTE 05)

- [x] **P0 việc 1–2 — câu hỏi và CTA theo `transportSubtype`**: `getQuestionsForType(type,
      subtype, filledFields)` + `primaryAction(place)` trong `lib/transport.js`
- [x] **P0 việc 3 — xe ghép**: 8 câu đúng ngữ cảnh (Đón / Trả / Giờ chạy / Loại xe / Đặt trước
      / Hành lý / Trên xe có / Hình thức), bỏ hẳn Gửi xe · Lối vào · Giờ đông
- [x] **P0 việc 4 — xe khách**: dùng chung bộ trên, thêm câu Ghế ngồi hay giường nằm
- [x] **P0 việc 5 — copy khối đóng góp**: "Bạn biết thêm về **dịch vụ** này?" (xe ghép) /
      "**nhà xe** này?" (xe khách); chip đổi theo loại hình
- [x] **P0 việc 6 — one-tap**: mọi đáp án bấm là ghi phiếu ngay; chỉ "Điểm cố định" / "Cả hai"
      mới mở ô gõ vị trí
- [x] CTA: xe ghép → "Liên hệ đặt xe" (cuộn tới khối Liên hệ, không gọi thẳng); chưa có số →
      "Tìm số nhà xe"; xe khách → "Liên hệ nhà xe"; bãi xe / điểm đón trả giữ "Chỉ đường"
- [x] **Sửa lỗi**: id `booking` trùng giữa câu "Đặt phòng qua đâu?" (Ngủ) và câu đặt xe mới —
      phiếu gửi lên sẽ bị kiểm tra nhầm bộ đáp án rồi từ chối. Đổi thành `ride_booking`
- [x] **Sửa lỗi cũ**: khối ảnh menu ở trang địa điểm đang là `menuPhotos.length > 3` nên không
      bao giờ hiện (lỗi do lệnh khôi phục sed đổi nhầm cả 2 dòng hôm 09/09)
