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

## 2026-09-10 (NOTE 06)

- [x] **P0 việc 1–2 — taxonomy 4 family**: `TRANSPORT_FAMILIES` + 11 subtype gán family trong
      `lib/transport.js`; ô chọn trong `/admin` nhóm theo family bằng `<optgroup>`
- [x] **P0 việc 3 — refactor theo family trước, subtype override sau**: thêm khoá `families` /
      `skipFamilies` cho `lib/questions.js`; `noteContextsForPlace()` và `primaryAction()` cũng
      khai theo family rồi mới override — không còn if/else rải rác
- [x] **P0 việc 4–6 — hoàn thiện Dịch vụ đón khách**: bộ nền chung cho xe ghép / taxi / thuê xe
      có lái; taxi bỏ điểm đón–điểm trả–hành lý, thêm "Cách gọi" + "Hoạt động lúc nào (24/7)";
      thuê xe có lái thêm "Đi tỉnh" + "Tính giá theo chuyến/ngày/km"
- [x] **P0 việc 7 — Loại xe đa giá trị**: `vehicleTypes` (mảng) thay ô chữ tự do; đồng thuận
      đếm RIÊNG từng loại, không loại nào "thắng" rồi ẩn loại khác; thẻ hiện "Taxi · 4 chỗ · 7 chỗ"
- [x] **P0 việc 8 — tương thích ngược**: `thue-xe` cũ vẫn hợp lệ (ẩn khỏi ô chọn), ô chữ tự do
      `vehicleSeats` cũ vẫn đọc được, chỗ Đi lại chưa chọn loại giữ nguyên bộ câu hỏi cũ
- [x] Thêm ô "Khu vực phục vụ" (`serviceArea`) — thứ taxi/thuê xe cần, tuyến chính thì không
- [x] CTA: taxi → "Xem thông tin gọi xe", thuê xe có lái → "Liên hệ thuê xe"; bến xe / bãi xe /
      điểm đón trả / thuê xe tự lái giữ "Chỉ đường" (đúng — đó là chỗ khách phải tới thật)
- [x] **Ví dụ trong ô gõ mẹo đổi theo ngữ cảnh** (anh phát hiện 2026-09-10): chọn "Loại xe" mà
      ví dụ vẫn là "VD: Gửi xe ở ngõ cạnh số 12". Mỗi ngữ cảnh trong 14 ngữ cảnh nay có ví dụ
      riêng, đặt cạnh nhãn trong `NOTE_CONTEXTS` để không lệch nhau
- [x] **Ví dụ còn đổi theo LOẠI CHỖ nữa**: "Tiện ích" ở quán ăn là wifi, trên xe là điều hoà,
      ở bãi đỗ là mái che; "Giờ chạy" của xe ghép là giờ chuyến, của taxi là giờ tổng đài trực.
      3 tầng ưu tiên (subtype → family → loại chính → mặc định), phủ đủ 90 tổ hợp
- [x] **Lộ trình — nửa đầu ra** (NOTE-03 §2/§4/§5, NOTE-04 §10; anh chốt 2026-09-10): thêm
      `mode: "list" | "route"` cho Sổ, công tắc "Sổ thường / Lộ trình" trong trang Sửa, trang
      xem đánh số ①②③ theo đúng thứ tự đang sắp, mô tả và preview đổi thành "N điểm · Ăn + Chơi".
      Bản sao Sổ mang theo `mode`. **Không** hiện khoảng cách/thời gian giữa các điểm — chưa có
      nguồn dữ liệu, §4 cấm bịa
- [x] **Hoàn thiện nốt Tự lái + Điểm giao thông** (anh phát hiện 2026-09-10: "trừ xe ghép ra thì
      chưa thấy thay đổi"). NOTE-06 §12 xếp 2 nhóm này vào "chưa làm chặng này", nhưng để lại
      thì 6 chỗ vẫn dùng bộ câu hỏi của quán ăn:
  - Tự lái: Loại xe · **Đặt cọc** · **Giấy tờ** · **Nhận xe**
  - Điểm giao thông: **Phí gửi xe** · **Nhận trông xe gì** · **Trông qua đêm**
  - Bỏ câu "Gửi xe ở đâu?" khỏi cả 3 nhóm không phải quán — đáp án của nó ("Bãi riêng của
    quán", "Vỉa hè cạnh quán") là chữ của quán ăn, mà hỏi ngay tại một bãi gửi xe thì thành
    vòng tròn
- [x] **Điền loại hình cho 14 chỗ Đi lại còn lại** — 8 taxi, 3 thuê xe máy, 1 thuê ô tô tự lái,
      1 bến xe, 1 bãi đỗ. Đây là nguyên nhân chính khiến anh không thấy gì đổi: code đúng nhưng
      chỗ nào chưa chọn loại hình thì hệ thống không có căn cứ để đổi

## 2026-09-10 (Chặng A — tách Lộ trình)

- [x] **`lib/routes.js`** — Lộ trình thành thực thể riêng `route:{slug}`. Mỗi điểm có giờ dự
      kiến · thời lượng · ghi chú chặng; cả lộ trình có phương tiện. Điểm có thể là địa điểm
      CDP **hoặc điểm tự đặt tên** ("Khách sạn của tôi")
- [x] **`lib/routeShare.js`** — chia sẻ bằng BẢN CHỤP (§P6): sửa/xoá lộ trình gốc thì link đã
      gửi vẫn mở đúng nội dung cũ. Kéo theo §P5 (chia sẻ không cần lưu/đặt tên trước)
- [x] **`lib/mapsUrl.js`** — `routeMapsUrl()` ghép waypoint (§P7 gđ1). Cắt bớt và **nói thật**
      khi quá 11 điểm, không im lặng bỏ điểm
- [x] 4 trang mới: `/lo-trinh` · `/lo-trinh/{slug}` · `/lo-trinh/{slug}/sua` ·
      `/lo-trinh/xem/{token}` (bản đã chia sẻ)
- [x] **Bỏ `notebook.mode`** — Sổ quay lại đúng nghĩa "bộ sưu tập". 0 cuốn sổ đang bật chế độ
      lộ trình nên không mất dữ liệu của ai
- [x] Lối vào: "Tạo lộ trình từ sổ này" ở trang Sổ; nút trên thẻ đổi thành "+ Sổ / Lộ trình"
      và cho chọn cả hai; link chéo giữa 2 trang danh sách

## 2026-09-11 (NOTE 07)

### P0
- [x] **Safari tự zoom khi nhập liệu** — 73 ô nhập toàn dùng cỡ chữ 13–14px, Safari iOS luôn
      phóng to trang khi chạm vào. Ép `font-size: 16px` cho input/textarea/select trên màn cảm
      ứng (`@media (pointer: coarse)` trong `globals.css`). **KHÔNG** dùng `user-scalable=no`
- [x] **`app/PlacePicker.js`** — bộ chọn địa điểm DÙNG CHUNG: tìm kiếm, lọc 4 nhóm, chọn nhiều,
      đếm số điểm, khoá cuộn nền. Selection giữ nguyên khi đổi ô tìm hoặc đổi bộ lọc
- [x] **`lib/placeTextSearch.js`** — tách logic tìm kiếm khỏi PlaceExplorer để trang chủ và
      PlacePicker dùng chung một bộ từ đồng nghĩa, không trôi lệch nhau
- [x] **"Tạo lộ trình từ đây"** trên thẻ và trang địa điểm — mở PlacePicker với chỗ đang xem
      đã chọn sẵn
- [x] **"+ Thêm địa điểm"** trong trang sửa lộ trình — cùng PlacePicker, chọn nhiều rồi mới
      bấm "Thêm N điểm", không đóng sau mỗi lần chọn
- [x] Điểm riêng thêm được ngay trong PlacePicker; ở màn tạo mới thì giữ tạm rồi ghi một lượt

### P1
- [x] **`lib/proposals.js`** — 3 loại điểm dừng `cdp_place | proposed_place | custom_stop`;
      `place_proposals:queue` + `place_proposals:index`
- [x] **Form đề xuất địa điểm** — vào lộ trình NGAY, đồng thời xếp hàng chờ admin
- [x] **Nhãn "Người tạo đề xuất · CDP chưa xác minh"** trên lộ trình của chủ VÀ trong bản chụp
      chia sẻ (nét đứt, nền trung tính — không phải cảnh báo đỏ)
- [x] **Hàng chờ trong `/admin`** — duyệt vào danh bạ / bỏ
- [x] **Duyệt → tự thành `cdp_place`** ở mọi lộ trình đang trỏ tới, không ai phải sửa tay
- [x] **Từ chối → thành `custom_stop`**, KHÔNG mất khỏi lộ trình
- [x] **Tương thích ngược**: `normalizeStop()` suy `type` từ route cũ, không migration

## 2026-09-11 (anh bấm thử lộ trình — 4 chỗ vướng)

- [x] **Ô "Điểm riêng" tự điền chữ đang gõ** — gõ "Xuất phát tại nhà" ở ô tìm mà không ra chỗ
      nào thì chữ đó nhảy thẳng xuống ô Điểm riêng, chỉ còn bấm Thêm. Gõ tay vào ô đó rồi thì
      thôi bám theo ô tìm. Thêm xong dọn luôn ô tìm để không bấm Thêm hai lần ra hai điểm trùng
- [x] **Chuỗi gửi Google Maps chuẩn hơn** (`lib/mapsUrl.js`) — luôn kèm địa chỉ, tự gắn
      "Tuyên Quang" nếu chưa có (trước đây "Winmart Hàng Bún" gửi trần dễ ra Hà Nội). Gom
      `stopMapsQuery()` dùng chung cho trang lộ trình và bản chụp chia sẻ — trước đó hai nơi
      tự ghép mỗi kiểu
- [x] **Điểm riêng có ô địa chỉ** — nhập lúc thêm trong bộ chọn, sửa lại được ở trang sửa lộ
      trình. Điểm riêng vào link Google bằng ĐỊA CHỈ, không bằng cái tên tự đặt. Bỏ trống thì
      điểm đó không vào link (trang lộ trình nói rõ có mấy điểm như vậy)
- [x] **Thêm một chỗ nhiều lần vào cùng lộ trình** — bỏ chặn trùng trong `addPlacesToRoute` và
      `addStopToRoute`. "Trưa về khách sạn nghỉ, tối lại về ngủ" là chặng thật. Bộ chọn báo
      trước "Đã có trong lộ trình · thêm lần nữa" để phân biệt với bấm nhầm
- [x] **Thời lượng viết cho người đọc** (`lib/durationFormat.js`) — "Khoảng 240 phút" →
      "Ở đây khoảng 4 tiếng"; dưới 1 tiếng giữ phút; ô nhập hiện quy đổi "= 4 tiếng" ngay bên
      dưới. Thời gian đi đường có câu riêng "Di chuyển khoảng ..." để hai loại không lẫn nhau

## 2026-09-11 (đổi điểm trong lộ trình)

- [x] **Nút "Đổi chỗ" trên từng điểm** (`replaceStop` trong `lib/routes.js`) — mở lại bộ chọn
      ở chế độ chọn MỘT, bấm phát nào xong phát đó. Thay **tại đúng vị trí đang đứng**, không
      đẩy xuống cuối như cách xoá-rồi-thêm-lại; thứ tự để anh tự kéo nếu muốn
- [x] **Giữ giờ · thời lượng · ghi chú chặng khi đổi chỗ** — đó là kế hoạch của CHẶNG, không
      phải thuộc tính của địa điểm. Riêng ghi chú thì nhắc "xem lại ghi chú chặng" vì nó rất
      hay đang nói về chỗ cũ
- [x] **Đổi qua lại giữa địa điểm CDP và điểm riêng** — trong bộ chọn chế độ đổi, gõ tên vào ô
      Điểm riêng là thay luôn ("Đổi sang điểm riêng này")
- [x] **Sửa tên điểm riêng tại chỗ** — ô "Tên điểm" ngay trong thẻ, cùng chỗ với ô địa chỉ;
      tiêu đề đổi theo ngay khi gõ. Địa điểm CDP thì KHÔNG cho sửa tên (tên lấy từ danh bạ,
      sửa thì mỗi lộ trình giữ một phiên bản khác nhau) — muốn thay hẳn thì bấm "Đổi chỗ"
