# TASKS — DONE / IN PROGRESS / TODO

> Cập nhật: **2026-09-14**. Trạng thái bàn giao: [HANDOFF.md](HANDOFF.md) ·
> **vì sao** chọn cách làm: [DECISIONS.md](DECISIONS.md) ·
> nhật ký từng phiên: [STATUS.md](STATUS.md) · chia chặng: [ROADMAP.md](ROADMAP.md).
>
> Phần **DONE chi tiết theo thời gian** nằm ở nửa dưới file, dựng lại từ lịch sử git
> (163 commit, từ 2026-07-15; bỏ qua commit tự động của routine quét).

---

## 🚧 IN PROGRESS

- [ ] **NOTE-14 P0 — Pickup points, toạ độ, chặn import địa điểm đã đóng (kế hoạch 3 chặng duyệt 16/9)**
  - [x] Chặng A: nguồn báo đóng vĩnh viễn → `source_closed` (không tự công khai, 3 hành động); vá 3 đường lách
        guard NOTE-13; lưu `coordinates` cho import mới + điền dần cho chỗ đang công khai — 💻 chỉ local
  - [ ] Chủ dự án: dán khối "TRANG THAI VA TOA DO" (docs/ROUTINE.md §7) lên routine thật trên claude.ai
  - [x] Chặng B: `pickupMode` + `pickupPoints[]` cho dịch vụ đón khách, admin sửa điểm đón (thêm/sửa/xoá/đổi thứ tự/
        bật-tắt, dán link Maps lấy toạ độ) — 💻 chỉ local
  - [ ] Chủ dự án: nhập điểm đón thật cho "Xe ghép Anh Huy" (và taxi nếu có điểm đón cố định) sau khi deploy
  - [x] Chặng C: `pickupSelection` trong lộ trình, bắt chọn điểm đón (trang sửa tự cuộn tới), Google Maps dùng điểm
        đón/toạ độ, chặn mở Maps + chia sẻ khi chưa chọn, bản chụp/bản copy giữ lựa chọn — 💻 chỉ local
  - [x] Xác nhận vị trí trên bản đồ (kéo P1 §14–§15 lên): tra địa chỉ → mở bản đồ → kéo ghim → "Xác nhận vị trí";
        áp dụng cho điểm riêng, điểm đón tận nơi, điểm đón nhà xe ở admin; Maps ưu tiên toạ độ đã xác nhận — 💻 chỉ local
  - [x] Ba sửa nhỏ trang lộ trình: điểm đón tự nhập tự lưu khi bấm ra ngoài, điểm riêng hiện địa chỉ đầy đủ,
        nút "Xem lộ trình" ghim đáy trang sửa — 💻 chỉ local
  - [x] Spec Google-Maps-Location-Routing chặng 1: tách "Chỉ đường" (chỉ khi đã xác minh) khỏi "Tìm trên
        Google Maps"; lộ trình kể tên điểm chưa xác minh; chia chặng khi dài; admin ghim vị trí trong form — 💻 chỉ local
  - [x] Chặng 2: bảng `/admin/vi-tri` ghim hàng loạt cho 234 địa điểm chưa có toạ độ — 💻 chỉ local
  - [x] Chặng 3: Google Places Text Search (tuỳ chọn, tắt sẵn) — chọn ứng viên có Place ID — 💻 chỉ local
  - [ ] Chủ dự án: tạo khoá `GOOGLE_MAPS_SERVER_KEY` + đặt `NEXT_PUBLIC_GOOGLE_PLACES=1` nếu muốn bật Google Places
  - [ ] Chủ dự án: ghim dần 234 địa điểm ở `/admin/vi-tri` (ưu tiên chỗ hay dùng)
  - [ ] Sau khi ghim gần xong: đổi `REQUIRE_VERIFIED_LOCATION = true` trong `lib/mapsUrl.js`
  - [ ] Thử trên iPhone thật xem Google Maps nhận được bao nhiêu điểm giữa, rồi chỉnh `MAX_WAYPOINTS`
  - [ ] Deploy NOTE-14 P0 khi chủ dự án bảo
  - [ ] Chủ dự án: sau deploy, mở `/lo-trinh/ep3jjcay/sua` ghim đúng vị trí "Khu đỉnh dốc Bà The" và điểm đón
        "Quán Cháo Lòng" (test đã chạy trên lộ trình này rồi TRẢ LẠI NGUYÊN TRẠNG — chưa có ghim thật)
  - [ ] P1 còn lại (NOTE-14 §21): dropoffPoints, backfill toạ độ chỗ cũ, dùng toạ độ cho nghi trùng/thay thế,
        link Maps rút gọn, hiện điểm đón trên thẻ địa điểm

- [x] **Sửa 3 lỗi sau NOTE-08 (2026-09-16) — 🚀 Đã deploy 2026-09-16 (`web-4tl2b0ue6`)**
  - [x] `/le-hoi-thanh-tuyen` chỉ còn 1 khối game (GameEntryCard dưới tiêu đề), bỏ GameBanner
  - [x] Thẻ game nổi mép phải ở trang chủ: tự mở lần đầu mỗi ngày, tab nhỏ các lần sau, "Ẩn hôm nay"
  - [x] Bảng "Bạn vừa thấy mô hình nào?" không tụt ra sau bàn phím (visualViewport + chiều cao cố định + ô tìm kiếm sticky)
  - [x] iPhone thật (chủ dự án): bàn phím hết che ô tìm kiếm
  - [x] Vuốt danh sách sau khi gõ làm nền chạy theo/khựng → chặn cuộn xuyên trong BottomSheet
  - [x] Chủ dự án thử lại iPhone thật: gõ rồi vuốt danh sách — OK
  - [x] Deploy — production kiểm: lễ hội 1 khối game, thẻ nổi trang chủ, lọc không tụt, danh sách ngắn chặn cuộn xuyên

- [ ] **NOTE-08 — Banner game, tên ẩn danh, theo dõi người dùng (4 phần, kế hoạch duyệt 15/9)**
  - [x] Phần 1: banner cổng vào game trên `/le-hoi-thanh-tuyen` — 💻 chỉ local, chưa deploy
  - [x] Phần 2: tên ngẫu nhiên không trùng mô hình + đổi tên + tên tra lúc hiển thị — 💻 chỉ local
  - [x] Phần 3: ghi nhận hoạt động ẩn danh (gom sự kiện, ít lệnh Redis) — 💻 chỉ local, cần deploy trước 18/9
  - [x] Deploy Phần 1–3 — 🚀 2026-09-15 (`web-l2j8wqis8`)
  - [x] Chốt PLAN-dem-18-9 §7: Pay-as-you-go $10 · B1–B3 · giữ kill switch · không sửa luồng báo
  - [ ] Chủ dự án: thêm thanh toán Upstash (Pay-as-you-go) + đặt hạn mức $10 — sáng 16/9 hoặc 17/9
  - [x] B1 bộ đệm snapshot 20s · B2 analytics 2 phút · B3 quay lại tab ≥ 30s + sửa snapshot cũ ghi đè
  - [ ] Theo dõi tự động đêm 18/9 — kế hoạch chờ duyệt
  - [ ] Đêm 18/9: theo dõi theo PLAN §6, sau đó thay số giả định bằng số thật
  - [ ] Phần 4: tách menu admin, Dashboard `/admin`, duyệt dữ liệu → `/admin/duyet`, `/admin/users`

- [x] **Game layer MVP1 "Săn đèn Thành Tuyên 2026" (NOTE-03 + NOTE-04) — 💻 Chỉ local, chưa deploy**
  - [x] Primitive dùng lại `lib/game/` (Event · Object · Sighting · Collection · Progress · Quest · Map Layer)
  - [x] Route chung `/cham/[eventSlug]` 4 tab + khối game trên `/le-hoi-thanh-tuyen`
  - [x] Báo 3 bước (mô hình/"Không biết tên" → GPS hoặc kéo ghim → ảnh tuỳ chọn), không đếm trùng
  - [x] Bản đồ MapLibre + OpenFreeMap (OSM), marker gom cụm + mức tin cậy, "được nhìn thấy X phút trước"
  - [x] Màn "Đã Chạm!" + animation + âm thanh Web Audio + nút 🔊/🔇; reduced motion tắt hiệu ứng
  - [x] Nhiệm vụ tự sinh (thiếu ảnh · vị trí lệch · có ảnh chưa tên), lịch sử riêng
  - [x] `/admin/game`: ghép bí ẩn, đặt tên/sửa/ẩn mô hình, duyệt ảnh, xoá lượt báo
  - [x] Test Redis namespace riêng (đếm trùng, ghép, song song, cờ báo sai, không lộ anonId) +
        Playwright iPhone 13 + desktop 1440, dọn sạch dữ liệu test; build đạt, lint đúng 1 lỗi nền
  - [x] Polish 15/9: badge ×N + popup "tối nay N lượt · gần nhất", thống kê theo ngày/số người;
        nền bản đồ sáng kiểu Google + tên tiếng Việt; vuốt xuống đóng sheet; hết nháy bản đồ khi
        cuộn (Chromium + WebKit + desktop: 0 lần resize canvas/remount/vẽ lại marker khi cuộn)
  - [x] 15/9: bản đồ có Quảng trường Nguyễn Tất Thành + Tuyến phố đi bộ Nguyễn Văn Linh (Hà Huy
        Tập → Đinh Tiên Hoàng), toạ độ từ OSM, bản đồ tự căn khung vừa cả hai
  - [x] 15/9 NOTE-05: pre-game tới 18/9 19:00 (3 câu troll, không ghi dữ liệu, admin đổi giờ mở không
        cần deploy, trang tự chuyển live); 34 mô hình thật có tag/icon ghép/âm thanh theo nhóm; bộ sưu
        tập theo tag + 2 bộ ẩn + combo + milestone; độ hiếm theo đêm; "Tối nay có gì"; "Bạn gặp N lần"
  - [ ] Chủ dự án thử trên điện thoại thật (GPS, âm thanh, chụp ảnh, vuốt sheet, câu troll) tại localhost:3100
  - [x] 15/9: mục "Nghe thử âm thanh" trong `/admin/game` (▶ từng mô hình + âm sự kiện); server test
        `cdp-test-game-owner` đã chuyển sang live để nghe tiếng mở khoá trên điện thoại
  - [x] 15/9: sửa lệch pha giữa các máy (máy tính câu đùa / iPhone "Đã Chạm"): hỏi lại server khi mở
        luồng báo + server trả mã pre_game trước khi tạo hồ sơ; server test trả về pre-game, xoá dữ liệu thử
  - [x] 15/9 NOTE-06: tổng 45 (34 tên + 11 slot "chưa xác định #35–45", đặt tên trên slot không mất
        dữ liệu, mốc 40 + 45/45); 45 âm thanh thật CC0 (Freesound) đã cắt/chuẩn hoá âm lượng; 34 công
        thức tiếng riêng theo NOTE-06 §2–§4; gặp lại có tiếng ngắn riêng; tiếng bí ẩn; trọn bộ có trống
        hội + đám đông; `/admin/game` nghe lần lượt cả 45 kèm thời lượng, đổi tiếng bằng ô chọn
  - [x] 15/9: nút định vị trên bản đồ game không còn bị khoá (icon gạch chéo) sau khi bị từ chối —
        bấm lại được, bấm để tắt, có thông báo lý do + nút tải lại trang
  - [x] 15/9 NOTE-07: tiếng hổ oai hơn, Mãng long "boss" hơn Rồng vàng, 4 rồng 4 giọng, nghê ≠ hổ,
        cá chép ≠ cửu ngư (8 mẫu CC0 mới); huy hiệu sưu tập một hình hero (game-icons.net CC BY 3.0 +
        2 hình tự vẽ), khung theo nhóm, trạng thái chưa gặp/đã gặp/vừa mở/bí ẩn, marker bản đồ tròn,
        ảnh thật + icon góc; `/admin/game` có "Nghe so sánh cùng họ" + "Xem trước bộ huy hiệu"
  - [ ] Nghe "Nghe so sánh cùng họ" + xem "Xem trước bộ huy hiệu" ở `/admin/game`, báo lại hình/tiếng chưa hợp
  - [ ] Nghe "Nghe lần lượt" 45 mô hình ở `/admin/game` trên điện thoại thật, đổi tiếng nào chưa hợp
  - [ ] Điền tên thật cho 11 slot "Mô hình chưa xác định #35–45" khi có danh sách
  - [x] 15/9 tối: deploy production (`web-lqtaavabq`) — kiểm trên chamdiaphuong.io.vn: pre-game + đếm
        ngược, 0/45, 45 huy hiệu, câu đùa không ghi key nào, file âm thanh 200, nút định vị lấy được vị trí (https)
  - [ ] Tối 18/9 19:00 kiểm tra game tự chuyển live trên production; theo dõi lượt báo đầu tiên ở `/admin/game`

- [x] **Link "← Lộ trình của tôi"/"← Sổ của tôi" (chỉ chủ) + nút Chia sẻ ở thẻ danh sách +
      nút chủ sổ thành "Chia sẻ sổ" — 🚀 Đã deploy 2026-09-14** (`web-rbd3watu6`)
  - [ ] Chủ dự án bấm thử: Chia sẻ một lộ trình từ danh sách; mở Sổ cafe → thấy "← Sổ của tôi"
- [x] **Logo ảnh ở header/sidebar — 🚀 Đã deploy 2026-09-14** (`web-rdrc3fg1c`)
- [x] **Ảnh bảng giá theo ngữ cảnh cho Chơi/Ngủ/Đi lại — 🚀 Đã deploy 2026-09-14** (`web-eyywjhnh2`)
- [x] **Icon menu mobile + chuyển trang kiểu iOS — 🚀 Đã deploy 2026-09-14** (`web-bgv0djbky`)
- [x] **Menu có "Lộ trình của tôi" (key `routes`, sau Sổ) — 🚀 Đã deploy 2026-09-14** (`web-jxi3j7u43`)
- [x] **Link chia sẻ cũ (trước NOTE-11) hiện ảnh địa điểm — 🚀 Đã deploy 2026-09-14**

- [x] **Deploy NOTE-11 + NOTE-12 + NOTE-13 — 🚀 Đã deploy 2026-09-14** (`web-gz3gex60d`).
      Kiểm tra production chỉ-xem đạt trên iPhone 15 Plus + desktop 1440.
  - [ ] Chủ dự án bấm thử nhóm B trên production (ảnh, mẹo `Khác`, lưu route share)

- [x] **NOTE-13 P0 — Closed crawler guard + shared route copy — 🚀 Đã deploy 2026-09-14:**
  - [x] Audit crawler: root cause là chỉ match `places:live`, không đọc `places:closed`
  - [x] Candidate khớp closed luôn thành `closed_place_match` trong verify queue, không
        auto-public; guard chạy trước de-dupe item đang chờ
  - [x] Admin có `Mở lại địa điểm cũ` (giữ ID/lịch sử), `Tạo địa điểm mới thay thế`
        (proposal chờ duyệt) và `Bỏ qua`
  - [x] Lưu `lastCrawlMatchAt`; override `closed:false` chặn fallback legacy sau khi mở lại,
        không migration toàn kho
  - [x] Shared route có CTA lưu thành route cá nhân; server copy từ snapshot bằng anonymous
        owner hiện có; chỉ bản copy mới hiện link sửa
  - [x] Snapshot mới giữ field CDP/proposal/custom; link cũ suy ra an toàn lúc copy, không
        migration và không tạo proposed stop rỗng
  - [x] Build đạt; lint vẫn đúng 1 lỗi nền ở `PlaceExplorer.js:409`; integration test crawler
        + route copy dùng namespace riêng và rollback rỗng; Playwright đạt iPhone 15 Plus
        430×932 + desktop 1440×1000
  - [ ] P1 backlog: compare view sâu hơn, lifecycle/provenance đầy đủ hơn và nhận ra route đã
        copy để tránh người dùng vô tình lưu lặp

- [x] **NOTE-12 P0 + P1 — Contribution Audit + Place Replacement — 🚀 Đã deploy 2026-09-14:**
  - [x] Audit code + dữ liệu thật; xác định lỗi `QuestionPrompt` chỉ ẩn câu trùng id
  - [x] Một context active chỉ render UI của context đó; đổi context xoá text/state cũ
  - [x] `Cách đến`/`Khác` là free-text qua Admin; structured option giữ luồng đồng thuận
  - [x] Matrix placeholder/context phủ Ăn/Chơi/Ngủ + 11 subtype Đi lại; giữ tương thích
        `di-chuyen` cũ lúc đọc, không migration
  - [x] P0 hierarchy: bỏ nút `Bổ sung` trùng nghĩa; card/detail có section riêng, action phụ
        ghi rõ “Sửa thông tin hoặc gửi ảnh”; mỗi lúc chỉ một bề mặt nhập active
  - [x] P0 kiểm thử matrix + data flow tách namespace; build đạt; lint không thêm lỗi;
        Chrome thật và iPhone 15 Plus 430×932 đạt
  - [x] P1 archive record đóng cửa vào `places:closed`, user/Admin tạo proposal thay thế
  - [x] P1 chỉ reuse location; duyệt mới nối `replacedByPlaceId` ↔ `replacesPlaceId`; URL cũ
        hiện closed/replacement thay vì 404
  - [x] Backward compatibility: suy ra 4 tombstone cũ lúc đọc, không migration; dữ liệu vị
        trí đã mất từ flow cũ được ghi rõ là không còn, không tự đoán
  - [x] Deploy production 2026-09-14

- [x] **NOTE-11 P0 — Media Pipeline bằng Vercel Blob + Redis — 🚀 Đã deploy 2026-09-14:**
      một `media[]` cho nhiều ảnh/place, role bìa/dẫn đường/menu..., reorder + caption + gỡ
      trong Admin, upload nhiều ảnh, server resize WebP, `next/image` responsive/lazy và ảnh
      nhận diện ở lộ trình. Khách tối đa **5 ảnh/lần** (cảnh báo tĩnh + báo đỏ khi chọn quá),
      Admin 10, server chặn lại độc lập. Không migration toàn Redis: đọc `photos[]`/
      `menuPhotos[]`/`coverPhoto` cũ rồi chỉ ghi schema mới khi đúng place được chỉnh.
      Build đạt; lint không thêm lỗi; Playwright iPhone 15 Plus 430×932 + Admin desktop
      1440px đạt. P1 còn thumbnail vật lý, usage/error metrics, reference index + dọn orphan
      dry-run và tinh chỉnh UX caption/role.

- [x] **NOTE-10 P0 + P1 — App Shell desktop và navigation config — 🚀 Đã deploy:**
      public site dùng chung sidebar desktop 248/72px có nhớ trạng thái và menu
      mobile cùng một config; `/gioi-thieu` đã vào menu. Homepage rộng tối đa 1360px, card
      địa điểm hai cột trên desktop; trang chi tiết chia media/thông tin thành hai cột độc
      lập; `/gioi-thieu` có accent cam tiết chế. `/admin/navigation` sửa được `navLabel`,
      `pageTitle`, bật/tắt và thứ tự, nhưng key/route khóa trong code. Build đạt; Playwright
      đạt ở 375/430/820/1024/1280/1440px; production kiểm tra lại ở desktop 1440px và
      iPhone 15 Plus. Deployment `web-rn6nho9f0` Ready.

- [x] **NOTE-09 P0 — Admin chỉnh Giới thiệu + responsive — 🚀 Đã deploy:**
      `/gioi-thieu` đọc nội dung từ `site_content:about`, tự dùng bản trong code khi key
      thiếu/hỏng/lỗi. `/admin/gioi-thieu` sửa được toàn bộ copy P0 dưới dạng chữ thuần;
      Server Action kiểm tra phiên admin và schema trước khi ghi. Mobile 1 cột, tablet 2,
      desktop 3 cột cho phần cách hoạt động. Build đạt; Playwright đạt ở 375/430/768/1024/
      1280/1440px. P1 còn toggle/thứ tự, preview trong Admin và mục lục sticky.

- [x] **NOTE-08 — giới thiệu và minh bạch dữ liệu — 🚀 Đã deploy:** thêm
      `/gioi-thieu`, onboarding card không bắt buộc cho lần đầu và footer có hai link cố
      định. Trạng thái đóng chỉ lưu localStorage; không thêm Redis, disclaimer nặng hay social.
      Build đạt; Playwright production trên iPhone 15 Plus đạt.

- [x] **Rút gọn từ khóa mở Google Maps — 🚀 Đã deploy:** địa điểm CDP
      dùng Tên + phường + tỉnh; tên đã có “Tuyên Quang” thì không ghép thêm. Điểm riêng/đề
      xuất vẫn dùng địa chỉ nhưng bỏ chú thích dài trong ngoặc. Điểm người dùng tự gõ ngoài
      CDP bắt buộc chọn tỉnh/thành, không mặc định Tuyên Quang; thiếu địa chỉ thì Maps dùng
      tên + tỉnh đã chọn. Bỏ chữ “(tại đây)” cạnh Tuyên Quang.
- [x] **Ưu tiên địa điểm đáng tin + ghim tìm kiếm — 🚀 Đã deploy:** trong từng
      nhóm, xác nhận mới trong 30 ngày đứng trước theo đúng độ mới → 6 nhóm dữ liệu hữu ích →
      xác nhận cũ; độ tin cậy/số nguồn chỉ phá hoà cuối. Kho chưa lưu số lượt xác nhận nên
      chưa dùng tín hiệu này và không migration. Logo ghim hàng trên; ô tìm kiếm và 5 nút loại
      ghim ngay dưới. Khu vực/giá không ghim. Đã kiểm tra production trên iPhone 15 Plus
      430×932; deployment `web-2uhe5w6sq` Ready.
- [x] **Sửa lịch lễ hội không cần deploy — 🚀 Đã deploy:** trang chủ
      và bài lễ hội đọc `post_events:le-hoi-thanh-tuyen` từ Redis, tự rơi về file tĩnh nếu
      key rỗng/hỏng/lỗi; `/admin` sửa và thêm mốc. Timeline đã nhóm cùng ngày, có “Hôm nay”,
      đủ trạng thái xác minh, không bịa giờ khi chỉ biết buổi và có lịch sử hoàn tác.

### Checklist 8 việc — Post động, Event Monitor và Lộ trình

Quy ước: `✅ Local xong` → `👀 Chờ anh check` → `🚀 Đã deploy`.

1. **Event đúng dữ liệu:** nhóm theo ngày, Hôm nay, trạng thái xác minh, không bịa giờ —
   **🚀 Đã deploy**
2. **Lịch sử Event + hoàn tác** — **🚀 Đã deploy**
3. **Content Inbox nhận URL/nội dung dán tay và tự phân tích ra preview** — **🚀 Đã deploy**
4. **Dữ liệu dán tay và bot tự quét dùng chung pipeline** — ⬜ Chưa làm
5. **Event Candidate, chống trùng, so sánh cũ–mới, hàng chờ duyệt** — 🚧 Phần candidate,
   Cũ/Mới, bản nháp và Public tay **đã deploy**; còn thiếu dedupe/conflict đầy đủ
6. **Cảnh báo thiếu lịch/cũ lịch; Nông Tiến 11/9 là regression test** — ⬜ Chưa làm
7. **Lộ trình mẫu CDP, clone và gợi ý cộng đồng** — ⬜ Chưa làm
8. **Google Routes API + Post Engine dạng block** — ⬜ Chưa làm

Đang **chờ chủ dự án chốt hướng** trước khi code:

- [ ] **Ghi chú trong lộ trình chia sẻ** — tạm giữ 140 ký tự. Trước khi tăng phải chốt ghi chú
      đó là riêng tư (không hiện ở link chia sẻ) hay nội dung công khai cần qua duyệt
- [ ] **Giá mùa cao điểm** — `places:live` chỉ có một ô giá; đúng tuần lễ hội thì web hiển thị
      giá sai với nhóm khách cần nhất. Rủi ro uy tín, chưa có hướng xử lý
- [ ] **Tài khoản / đăng nhập (Chặng 7)** — chọn kênh OTP (Zalo ZNS / SMS / email), có nên
      đăng nhập bằng Zalo, gộp thế nào với hồ sơ ẩn danh. Xem [SPEC-chang-7.md](SPEC-chang-7.md)
- [ ] **Thông tin theo khu vực** (kiểu "đường Nguyễn Tất Thành chặn từ 18h") — không thuộc về
      địa điểm nào; khoảng trống thật nhưng lớn

---

## 📋 TODO

### Gấp — trước lễ hội 19–25/9
- [ ] 🔴 **Chủ dự án bật Pay-as-you-go cho Upstash + đặt hạn mức $25.** Đo được: mỗi lượt báo đèn
      tốn 28 lệnh, một đêm 2.000 người ≈ 250.000 lệnh → gói miễn phí (500K/tháng) hết sau ~2 đêm,
      Redis bị bóp là game đứng. Cả mùa ước 3–6 USD. Việc duy nhất không ai làm thay được
- [ ] 🟠 **Thử luồng báo đèn trên iPhone thật** (bản đồ, nút vị trí, gửi lượt báo) — code đã deploy.
      Bản chơi thử: `https://web-bm6a9kfpq-thangdz1.vercel.app/san-den-thanh-tuyen-2026` (phải đăng
      nhập Vercel một lần). Game đã MỞ trong namespace `cdp-thu-choi`, dữ liệu thật không đụng tới
- [ ] 🧹 **Dọn sau khi thử xong**: xoá khoá `cdp-thu-choi:*` trong Redis và xoá 3 biến
      `CDP_*_NAMESPACE` ở môi trường Preview của Vercel (`vercel env rm <tên> preview`)
- [ ] **Routine quét nâng 2–3 lần/ngày trong tuần lễ hội**, xong lại về 1
- [ ] Gọi điện xác minh 10–15 chỗ quan trọng nhất (không cần code)
- [ ] 🟠 **Đêm 18/9 mở thử bản đồ trên máy khác mạng.** Nền bản đồ OpenFreeMap là dịch vụ miễn phí
      bên thứ ba, KHÔNG thử tải được (không thể bắn tải vào họ) — 2.000 người cùng kéo bản đồ là
      rủi ro chưa có số liệu. Ô bản đồ trắng thì báo để bật nền dự phòng
- [ ] 🟡 **Thử 50–100 người cùng tải ảnh** — luồng ảnh chưa bắn tải bao giờ. Có sẵn giới hạn 8 MB
      mỗi ảnh và nén ở điện thoại, nhưng chưa biết ngưỡng thật

### Chặn bởi thiếu dữ liệu
- [ ] **Toạ độ địa điểm** — 0/210 chỗ có. Chặn: bản đồ lộ trình · khoảng cách/thời gian từng
      chặng · tối ưu tuyến (NOTE-07 P2, CDP_P1-P8 Phase 3). Hướng: chỉ geocode chỗ thực sự
      được dùng trong lộ trình
- [ ] **Google Routes API** (Phase 3) — sau khi có toạ độ

### CDP_P1-P8 Phase 2
- [ ] Lộ trình mẫu của CDP (`is_featured`) + nút "Dùng lộ trình này" (clone sang người dùng)
- [ ] Feature lộ trình của cộng đồng
- [ ] Source Registry + Content Monitor + admin duyệt diff (bot **không** publish thẳng)

### Kiểm lại dữ liệu — [SPEC-kiem-lai-du-lieu.md](SPEC-kiem-lai-du-lieu.md)
- [ ] Hiện tuổi dữ liệu trên thẻ ("Chưa kiểm lại hơn 1 tháng")
- [ ] Thêm trường `lastVerifiedAt`; routine chia đôi việc: ~5 chỗ mới + ~5 chỗ lâu nhất chưa
      kiểm. Trần 3 mục chờ duyệt/ngày từ nguồn kiểm lại
- [ ] Xoay vòng trọng tâm quét theo ngày + thêm nguồn ngoài Google Maps/Facebook

### Bản đồ game
- [x] **Vẽ tuyến rước đèn (nét đứt)** — xong 2026-09-16, đã deploy (`web-421078m6k`). Ngã 8 →
      Bình Thuận → Đại lộ Tân Trào → Phan Thiết → Quang Trung → về Ngã 8, 3.339 m, toạ độ từ OSM,
      đi đúng chiều một chiều và ngược kim đồng hồ qua 2 bùng binh
- [ ] Chủ dự án xem lại tuyến trên máy thật, có chỗ nào đoàn đi khác thì sửa toạ độ trong file mùa
- [x] **Tách thông báo dữ liệu game / thông báo GPS + sửa nút vị trí** — xong 2026-09-17, đã deploy
      (`web-2dc7ytio3`). Hai dòng mỏng ở mép trên, hướng dẫn dài vào sheet riêng; nút vị trí thành
      máy trạng thái do React giữ, `watchPosition` + `maximumAge: 0`. 22/22 test trình duyệt đạt
- [ ] **Vòng tròn sai số quanh chấm xanh** — chưa làm: cần thêm nguồn/lớp GeoJSON, mà `setStyle`
      (lúc rơi về nền dự phòng) xoá sạch source. Hiện chỉ báo bằng một câu khi sai số > 50 m
- [ ] **Bản đồ treo ở "Đang tải bản đồ…" nếu style không về** — `loadGameMapStyle()` không có hạn
      giờ: nhà cung cấp chậm/treo là chờ mãi, không rơi sang nền dự phòng. Sóng 4G đêm hội đông là
      đúng cảnh đó. Nên thêm hạn giờ ~6 giây rồi chuyển nền dự phòng

### Chống gian lận game — giai đoạn 2 (sau lễ hội, chỉ làm khi có giải thưởng thật)
> Giai đoạn 1 (quan sát + gắn cờ) đã xong 2026-09-16. Xem DECISIONS cùng ngày để biết hạn chế.
- [ ] OTP số điện thoại (cần dịch vụ SMS trả tiền — chưa có)
- [ ] Tách người chơi ẩn danh / đã xác minh; một số điện thoại chỉ ứng với một người chính
- [ ] Gộp lượt hợp lệ của người ẩn danh vào người đã xác minh, **không được cộng đôi điểm**
- [ ] Một mô hình chỉ tính điểm một lần cho cùng một người đã xác minh, kể cả trước đó dùng nhiều
      trình duyệt
- [ ] Trước khi làm: xem dữ liệu cờ đêm 18/9 xem có ai gian lận thật không. Không có thì khỏi làm

### Dọn gọn khu quản trị (admin) — gộp cả việc sửa đường dẫn
> Ý anh nêu 2026-09-16. Chưa chốt phạm vi, cần bàn trước khi code.
- [ ] **Rà lại toàn bộ trang `/admin/*`** — hiện là `game`, `vi-tri`, `gioi-thieu`,
      `navigation`, `content-inbox` cộng trang gốc `/admin`, mỗi việc một trang rời. Xem chỗ
      nào gộp được, chỗ nào thừa, có cần một trang chủ admin dẫn đường không
- [x] **Sửa đường dẫn game** — xong 2026-09-16 (làm trước, không đợi đợt dọn admin):
      `/cham/thanh-tuyen-2026` → `/san-den-thanh-tuyen-2026`, link cũ chuyển hướng 308.
      Đã deploy (`web-5oqws6bid`)
- [ ] Nhân tiện soát luôn đường dẫn các trang admin cho thống nhất một kiểu đặt tên

### Nợ kỹ thuật & việc nhỏ
- [ ] Sửa lỗi lint cũ ở `web/app/PlaceExplorer.js` (`react-hooks/set-state-in-effect`)
- [ ] Đưa test Playwright vào repo (hiện là script rời, chạy tay, không commit) — đã có sẵn 22 test
      định vị/bố cục bản đồ viết 17/9, đáng giữ lại
- [ ] **MapLibre không khởi tạo xong ở `next dev`** (StrictMode chạy effect hai lần) — bản đồ đứng ở
      "Đang tải bản đồ…". Chỉ ở dev, bản build bình thường; nhưng làm mọi test giao diện bản đồ phải
      chạy trên `next build` + `next start`. Đáng sửa cho đỡ vướng về sau
- [ ] **Gộp bộ đệm đọc**: `lib/game/store.js` giữ bản sao riêng của `createSharedRead`
      (`lib/sharedRead.js`). Cố ý chưa gộp để không đụng luồng game sát 18/9 — làm sau lễ hội
- [ ] Soát các lượt đọc Redis mỗi-lượt-mở-trang còn lại (`lib/aboutPage.js` trên `/gioi-thieu`)
      xem có đáng đệm như menu không
- [x] Header thêm link "Lộ trình của tôi" — xong 2026-09-14 (key `routes` trong menu)
- [ ] Xác minh lại phân loại "Danh Khoa - Cho thuê xe tự lái" (đang đoán là `thue-o-to`)
- [ ] Nhãn "còn chỗ" theo lịch — ngày lễ hội 2026 viết cứng trong `app/occupancy.js`, sang năm
      là sai. Quyết trước mùa 2027: bỏ hẳn hay làm theo dữ liệu thật

---

## ✅ DONE — chi tiết theo thời gian

### 2026-09-12 — Sửa lịch lễ hội không cần deploy (đã deploy)

- [x] Thêm `post_events:le-hoi-thanh-tuyen`; trang chủ và bài lễ hội dùng cùng một mảng Redis
      nên không thể nói lệch lịch nhau
- [x] Thêm mục "Lịch Lễ hội Thành Tuyên" trong `/admin`: sửa từng mốc, thêm mốc, đổi trạng
      thái Đã xác nhận / Dự kiến / Đã huỷ; mọi Server Action đều kiểm tra phiên admin
- [x] Redis chưa có/rỗng/sai khuôn/tạm lỗi thì giữ nguyên lịch trong file đang deploy
- [x] Unit check + build production + Playwright iPhone 13 qua; không ghi dữ liệu thật
- [x] Bổ sung theo prompt 11/9: `timePrecision`, trạng thái thời gian độc lập với xác minh,
      nhóm nhiều hoạt động cùng ngày, hiện rõ Đã huỷ và log tối đa 100 revision để hoàn tác
- [x] Test trọn luồng Lưu → trang khách đổi ngay → Hoàn tác trên namespace Redis riêng; đã
      xác nhận và xoá sạch đúng 2 key test sau khi chạy
- [x] Bổ sung mốc đã diễn ra “Đêm hội Trung thu phường Nông Tiến” tối 11/9, không đoán giờ

### 2026-09-12 — Checklist mục 3: Content Inbox (đã deploy)

- [x] Route `/admin/content-inbox`, chỉ mở khi có phiên admin
- [x] Nhận một URL, tối đa 20 URL mỗi dòng hoặc nội dung copy tối đa 30.000 ký tự
- [x] Sau khi dán tự chạy và hiện preview: loại/chủ đề/khu vực/Post/Event/độ tin cậy/so lịch
- [x] Hai mục admin đã dán bằng bản cũ được phân tích lại mà không phải dán lại
- [x] Local chưa có khóa AI: ghi rõ “phân tích sơ bộ bằng quy tắc”, không giả là AI; link bị
      nguồn chặn đọc có cảnh báo để admin dán nguyên nội dung
- [x] Link vào từ `/admin`; liệt kê mục mới nhất trước và mở được nguồn trong tab mới
- [x] Có 4 tab Mới/Bản nháp/Đã đăng/Bỏ qua; Bỏ qua khôi phục được, chỉ tab này mới cho xóa hẳn
- [x] Chỉnh kết quả rồi Lưu bản nháp hoặc Public; Public cần xác nhận, cập nhật trang khách
      và ghi lịch sử hoàn tác cùng một lượt Redis
- [x] Mốc nghi trùng hiện Cũ/Mới và cho admin chọn cập nhật mốc cũ hay tạo mốc mới
- [x] Parser + build + Playwright iPhone 13 qua; test 3 loại đầu vào trên namespace riêng và
      xoá sạch key test

### Nền tảng ban đầu (2026-07-15 → 07-17)

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

### Khách đóng góp dữ liệu (2026-07-18 → 07-20)

- [x] "Báo sai / Bổ sung ảnh": khách sửa field (địa chỉ/SĐT/giá), báo đã đóng cửa, hoặc gửi
      tối đa 5 ảnh/lần
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

### Tự động hoá routine quét (2026-08-04)

- [x] GitHub Action tự ingest kết quả quét hằng ngày → **pipeline chạy tự động hoàn toàn**,
      không cần copy-paste thủ công nữa

### Hướng mới "cuốn sổ địa phương" (2026-08-15 → 08-20)

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

### Công cụ xử lý trùng lặp trong `/admin` (2026-08-18 → 08-21)

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

### Sửa routine quét dữ liệu (2026-08-20 → 08-21)

- [x] Thêm trường `signature_dishes` (tối đa 3 món, chỉ với loại Ăn) vào schema ingestion +
      cập nhật lệnh routine
- [x] **Tự động hoá `known-places-snapshot.json`** — tự cập nhật sau mỗi lần ingest thành công
      (trước đó đóng băng từ 18/07, routine chạy 16 lần không biết 70 chỗ mới đã lên web)
- [x] Thêm địa chỉ vào snapshot; viết lại Bước 4 của routine (đoạn `curl` đã chết 403)

### 2026-08-23 → 08-24

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

### 2026-09-03 → 09-08

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

### 2026-09-09 (NOTE 04)

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

### 2026-09-09 (NOTE 05)

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

### 2026-09-10 (NOTE 06)

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

### 2026-09-10 (Chặng A — tách Lộ trình)

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

### 2026-09-11 (NOTE 07)

#### P0
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

#### P1
- [x] **`lib/proposals.js`** — 3 loại điểm dừng `cdp_place | proposed_place | custom_stop`;
      `place_proposals:queue` + `place_proposals:index`
- [x] **Form đề xuất địa điểm** — vào lộ trình NGAY, đồng thời xếp hàng chờ admin
- [x] **Nhãn "Người tạo đề xuất · CDP chưa xác minh"** trên lộ trình của chủ VÀ trong bản chụp
      chia sẻ (nét đứt, nền trung tính — không phải cảnh báo đỏ)
- [x] **Hàng chờ trong `/admin`** — duyệt vào danh bạ / bỏ
- [x] **Duyệt → tự thành `cdp_place`** ở mọi lộ trình đang trỏ tới, không ai phải sửa tay
- [x] **Từ chối → thành `custom_stop`**, KHÔNG mất khỏi lộ trình
- [x] **Tương thích ngược**: `normalizeStop()` suy `type` từ route cũ, không migration

### 2026-09-11 (anh bấm thử lộ trình — 4 chỗ vướng)

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

### 2026-09-11 (đổi điểm trong lộ trình)

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

### 2026-09-11 (điểm riêng ở tỉnh khác — anh phát hiện)

- [x] **Điểm riêng chọn được tỉnh/thành** (`lib/provinces.js`, 34 đơn vị theo sắp xếp 01/7/2025)
      — bắt buộc người dùng tự chọn, có cả trong bộ chọn lẫn trang sửa lộ trình. Không mặc
      định Tuyên Quang; đổi tỉnh là lưu ngay, không đợi rời ô
- [x] **Bỏ gắn cứng "Tuyên Quang" cho điểm riêng** — lỗi do chính bản sáng nay: khách từ Hà Nội
      về chơi, gõ "31 Hàng Bún" thì thành "31 Hàng Bún, Tuyên Quang" và Google dẫn sai hẳn.
      Địa điểm CDP và đề xuất thì VẪN gắn Tuyên Quang (danh bạ chỉ có Tuyên Quang)
- [x] **Điểm riêng cũ (chưa có trường tỉnh)** → để trống và bắt người tạo chọn lại trước khi
      Google Maps dùng; không migration hay đoán tỉnh trên toàn bộ dữ liệu cũ

### 2026-09-11 (CDP_P1-P8: P1, P2, P3)

#### P1 — Timeline động
- [x] **`lib/events.js`** — logic chung cho mốc thời gian của MỌI Post (không dính Trung thu):
      `eventStatus()` (đã qua / đang diễn ra / sắp tới / chưa có ngày), `groupEvents()`,
      `formatEventWhen()`, `formatCountdown()`. Mốc ghi kèm `+07:00` nên máy chủ chạy giờ UTC
      vẫn ra đúng giờ Việt Nam
- [x] **`lib/postEvents/le-hoi-thanh-tuyen-2026.js`** — 11 mốc lịch chuyển từ JSX sang dữ liệu,
      kèm `verificationStatus` (chắc / dự kiến) và nguồn
- [x] **Trang lễ hội chuyển sang `force-dynamic`** — trước là trang tĩnh, trạng thái sẽ đóng
      băng ở thời điểm deploy
- [x] **Khối "Sắp diễn ra" + đếm ngược** ở đầu trang; mốc đã qua gom vào "✓ N hoạt động đã
      diễn ra — xem lại" (dùng `<details>`, không cần JavaScript); mốc chưa có ngày xếp riêng
      thay vì đoán bừa một ngày

#### P2 — Card trang chủ
- [x] Bỏ câu "Chỗ gửi xe, ăn tối, cafe nghỉ chân và chỗ ngủ" (hứa một đằng, trang trong là
      lịch lễ hội). Card giờ lấy **mốc sắp tới** từ đúng nguồn dữ liệu của trang lễ hội — hai
      nơi không bao giờ lệch nhau, hết lễ hội thì câu chữ tự đổi

#### P3 — Interactive Plan
- [x] **`app/InteractivePlan.js`** — khối "Bạn định đi thế nào?" sau lịch: 5 khung giờ
      (17:30 ăn tối · 19:00 gửi xe · 20:00 Đêm hội · 22:15 cafe · sau đó ngủ lại), mỗi khung
      bấm chọn chỗ bằng **PlacePicker dùng chung**, mở sẵn đúng nhóm
- [x] **`createRouteFromPlan()`** — giờ dự kiến theo sang lộ trình, ô bỏ trống thì bỏ hẳn
      (không tạo điểm rỗng). Mốc Đêm hội mang sẵn địa chỉ Quảng trường Nguyễn Tất Thành nên
      vào được link Google Maps
