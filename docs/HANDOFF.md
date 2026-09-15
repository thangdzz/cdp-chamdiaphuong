# HANDOFF — Bàn giao trạng thái

> Cập nhật: **2026-09-14**. Đọc cùng [/AGENTS.md](../AGENTS.md) (quy tắc) và
> [ARCHITECTURE.md](ARCHITECTURE.md) (bản đồ code).
> Nhật ký chi tiết từng phiên: [STATUS.md](STATUS.md). Việc: [TASKS.md](TASKS.md).

---

## 1. Task hiện tại

**2026-09-16 — Sửa 3 lỗi sau NOTE-08 ĐÃ CODE, CHƯA DEPLOY (chờ chủ dự án bảo).** Chi tiết DECISIONS
2026-09-16. Trang lễ hội 1 khối game; thẻ game nổi trang chủ (`app/_game/HomeGameEntry.js` +
`HomeGameDock.js`); `BottomSheet` bám visualViewport + prop `expanded`. Việc tiếp: chủ dự án thử iPhone
thật → deploy. Các việc treo trước đó (theo dõi tự động đêm 18/9, kênh thông báo ntfy) **để sau** theo lời
chủ dự án.

**2026-09-15 (khuya, sau) — B1–B3 giảm lệnh Redis ĐÃ DEPLOY (`web-969b2ewsj`).** Kế hoạch theo dõi tự
động đêm 18/9: `docs/PLAN-dem-18-9-redis.md` §8 (chờ duyệt, code xong trước 17/9 tối).
Chốt ở DECISIONS "Ngân sách Redis đêm hội". Bộ đệm đọc 20 giây ở `lib/game/store.js`; client bỏ snapshot
cũ hơn. **Không sửa luồng ghi lượt báo trước 18/9** (chủ dự án chốt). Việc tiếp: kế hoạch theo dõi tự động
đêm 18/9 (chờ duyệt); chủ dự án tự chuyển Upstash Pay-as-you-go + hạn mức $10.

**2026-09-15 (khuya) — NOTE-08 Phần 1–3 ĐÃ DEPLOY PRODUCTION** (`web-l2j8wqis8`, chamdiaphuong.io.vn).
Production không có biến namespace. Kiểm tra: banner đếm ngược, thẻ tên + bảng đổi tên, không lỗi JS,
`/api/track` ghi được (1 gói thử `v-00000000-…` đã xoá đúng 4 key, lúc đó chưa có khách thật nào).
**Việc gấp trước 18/9 19:00: chủ dự án chốt `docs/PLAN-dem-18-9-redis.md` §7** — chuyển Upstash
Pay-as-you-go? cho làm B1–B3 giảm lệnh? Upstash tính TỪNG lệnh (kể cả trong pipeline), ước tính code
hiện tại ~950 lệnh/người chơi/giờ → 300 người × 3 giờ vượt gói miễn phí cả tháng.

**2026-09-15 (đêm, cuối) — NOTE-08 Phần 3/4 (ghi nhận hoạt động) ĐÃ CODE, CHƯA DEPLOY.** Trình
duyệt `app/analytics.js` → `app/api/track/route.js` → `lib/analytics/store.js` (script Lua, key xem
ARCHITECTURE §2 "Ghi nhận hoạt động"). Server test 3100 ghi analytics vào namespace `cdp-test-game-owner`.
**Deploy Phần 1–3 trước 18/9 19:00** (production không đặt namespace). Sau đêm 18/9 xem số lệnh Upstash.
Việc tiếp: Phần 4 (menu admin + Dashboard + Người dùng) đọc từ các key này.

**2026-09-15 (đêm, sau) — NOTE-08 Phần 2/4 (tên ẩn danh) ĐÃ CODE, CHƯA DEPLOY.** Luật tên ở
`lib/displayName.js`; hash `contributors:names`; game `app/_game/playerName.js` + `PlayerNameSheet.js`.
Mọi hồ sơ mới của CDP giờ tự có tên vui. **Khi test tạo hồ sơ thật:** ghi anonId, xoá khỏi cả
`contributors:all` lẫn `contributors:names`. Việc tiếp: Phần 3 (ghi nhận hoạt động) — cần trước 18/9.

**2026-09-15 (đêm) — NOTE-08 ĐANG LÀM, Phần 1/4 (banner) ĐÃ CODE, CHƯA DEPLOY.** Spec:
`docs/17-NOTE-08-Game-Banner-Anonymous-Name-Admin-Tracking.md` (trùng số với NOTE-08 Giới thiệu cũ).
Kế hoạch 4 phần đã duyệt ở DECISIONS 2026-09-15; tiến độ ở TASKS mục IN PROGRESS. Banner
`app/_game/GameBanner.js`, huy hiệu chọn ở `bannerObjectIds` file mùa, `getGameTeaser` giờ trả thêm
`tonightStats`. Việc tiếp: Phần 2 (tên ngẫu nhiên + đổi tên) — trình chủ dự án bấm thử banner trước.

**2026-09-15 (tối muộn) — GAME SĂN ĐÈN ĐÃ DEPLOY PRODUCTION** (`web-lqtaavabq`, alias
chamdiaphuong.io.vn; gồm MVP1 + polish + điểm tổ chức + NOTE-05/06/07 + sửa admin cookie + nút định vị).
Production KHÔNG có `CDP_GAME_NAMESPACE`; Redis thật chưa có key `game:thanh-tuyen-2026:*` → game ở
pre-game tới 18/9 19:00 (mặc định file mùa). Từ giờ lượt báo trên production là dữ liệu thật — muốn
thử live thì dùng server local namespace test, đừng bấm "Mở game ngay" trên production nếu không định
mở thật. Ghi chú: lệnh deploy chạy 2 lần liên tiếp (cùng code, `web-q5i2pumsf` rồi `web-lqtaavabq`).

**2026-09-15 (khuya, cuối) — NOTE-07 (tiếng + huy hiệu) ĐÃ CODE, CHƯA DEPLOY.** Huy hiệu:
`lib/game/badge.js` (khung/`badgeHtml`), hình ở `lib/game/iconArt.js` (**sinh bởi
`scripts/game-icons/build.mjs` từ `icons.json`, đừng sửa tay**) + `iconArtCustom.js` (tự vẽ); khoá hình
trong `iconSet` file mùa (`{ art, emoji }`), khung trong `categories[].frame`. Hình game-icons là CC BY
3.0 — thêm hình mới phải ghi đúng thư mục tác giả trong `icons.json`. Tiếng mới vẫn qua
`scripts/game-sounds/sources.json`. Việc tiếp: chủ dự án duyệt ở `/admin/game` → deploy trước 19/9.

**2026-09-15 (khuya) — NOTE-06 (45 slot + âm thanh thật) ĐÃ CODE, CHƯA DEPLOY.** 11 slot
`tt26-slot-35…45` cuối mảng `objects` file mùa; công thức tiếng `soundSet`/`soundFamilies` cũng trong
file mùa; bộ phát `app/_game/gameSound.js`, logic thuần `lib/game/sounds.js`; mẫu âm `web/public/
game-sounds/*.m4a` sinh bởi `web/scripts/game-sounds/build.mjs` từ `sources.json` (**không sửa tay
`lib/game/soundSamples.js`**). Thêm mẫu mới: chỉ lấy CC0, ghi nguồn vào `sources.json`, chạy script
trên Mac. Việc tiếp: chủ dự án nghe "Nghe lần lượt" ở `/admin/game` trên iPhone → đổi tiếng chưa hợp
→ quyết định deploy trước 19/9.

**2026-09-15 (tối) — NOTE-05 Săn đèn ĐÃ CODE, CHƯA DEPLOY.** Pha pre-game tới `gameLiveAt`
(file mùa, admin ghi đè ở hash `game:{eventId}:config`); 34 mô hình + `iconSet`/`collections`/
`milestones` trong `lib/game/seasons/thanh-tuyen-2026.js`; logic bộ sưu tập/độ hiếm ở
`lib/game/collections.js`; âm thanh `app/_game/gameSound.js`. **Khi deploy:** production sẽ ở
pre-game tới 18/9 19:00 — muốn thử live trên production thì dùng "Mở game ngay" ở `/admin/game`
rồi nhớ "Về giờ mặc định". Lượt báo thử trên production (nếu mở game sớm) là dữ liệu thật.

**2026-09-15 (sau) — Điểm tổ chức trên bản đồ Săn đèn ĐÃ CODE, CHƯA DEPLOY.** `venues` trong file
season (quảng trường + phố đi bộ Nguyễn Văn Linh, toạ độ OSM), vẽ ở `GameMap` qua `lib/game/venues.js`.
Đổi/thêm điểm tổ chức: sửa mảng `venues`, giữ `source` ghi way/node OSM.

**2026-09-15 — Polish MVP1 Săn đèn ĐÃ CODE, CHƯA DEPLOY.** Badge ×N + popup lượt tối nay, nền
bản đồ style chỉnh sẵn trong `lib/game/mapStyle.js`, vuốt đóng trong `app/_game/BottomSheet.js`,
chống nháy trong `app/_game/GameMap.js` (**đừng bật lại `trackResize` hay dùng `dvh` cho khung
bản đồ** — lý do ở DECISIONS 2026-09-15). Server `localhost:3100` vẫn chạy namespace
`cdp-test-game-owner`. Việc tiếp: chủ dự án thử trên iPhone thật → quyết định deploy.

**2026-09-14 (khuya, cuối) — Game layer MVP1 "Săn đèn Thành Tuyên 2026" ĐÃ CODE, CHƯA DEPLOY.**
Spec: `docs/13-NOTE-04-…` (MVP1) + `docs/12-NOTE-03-…` (dài hạn) — lưu ý 2 file này trùng số
thứ tự với NOTE-03/NOTE-04 cũ, tra theo tên đầy đủ. Lõi `web/lib/game/` (xem ARCHITECTURE §2
"Game layer" + bản đồ file), route `/cham/[eventSlug]`, admin `/admin/game`, khối game trên
`/le-hoi-thanh-tuyen`. Server test của chủ dự án đang chạy `localhost:3100` với
`CDP_GAME_NAMESPACE=cdp-test-game-owner` (lượt báo khi thử không lẫn vào dữ liệu thật; hồ sơ ẩn
danh tạo khi báo lần đầu vẫn ghi vào `contributors:all` như mọi đóng góp khác). **Khi deploy
production KHÔNG đặt biến namespace.** Việc tiếp: chủ dự án thử trên máy thật → thay 10 tên mô
hình tạm ở `/admin/game` → deploy trước 19/9.

**2026-09-14 (khuya, sau) — Ảnh bảng giá theo ngữ cảnh ĐÃ DEPLOY** (`web-eyywjhnh2`). Nút ảnh
riêng cho mọi nhóm, tên lấy từ `lib/priceListPhoto.js` (Ăn "Ảnh menu", Chơi "Ảnh bảng giá vé",
Ngủ "Ảnh bảng giá phòng", Đi lại theo subtype; điểm đón/trả không có). Dữ liệu vẫn role `menu`,
không migration. **Chỗ mới hiện chữ về ảnh menu/bảng giá phải lấy tên từ helper này.**
Production: nút đúng cho Ngủ/Chơi/Bến xe, ảnh menu cũ của Min Garden vẫn đúng, không lỗi JS.

**2026-09-14 (khuya) — Icon menu mobile + chuyển trang kiểu iOS ĐÃ DEPLOY** (`web-bgv0djbky`).
Icon tách ra `app/NavigationIcon.js` dùng chung sidebar + menu mobile. Chuyển trang:
`app/PageTransition.js` + CSS `cdp-page-enter` trong `globals.css`, bật bằng
`experimental.viewTransition` trong `next.config.mjs` (đặt `false` là tắt). Link "←" gắn
`transitionTypes={["nav-back"]}` — **link quay lại mới phải gắn thêm prop này**. Production:
đi tới trượt +28px, link ← trượt −28px, Back trình duyệt không chạy, 5 icon mobile, không lỗi.

**2026-09-14 (tối, sau) — Menu "Lộ trình của tôi" ĐÃ DEPLOY** (`web-jxi3j7u43`). Thêm key
`routes` → `/lo-trinh` vào `NAVIGATION_DEFINITIONS` (order 4, "CDP là gì?" xuống 5), icon riêng
trong sidebar, H1 trang `/lo-trinh` đọc `pageTitle` qua `PageTitle`. Production chưa có
`site_config:navigation` nên không mất cấu hình Admin. Kiểm tra production: menu mobile +
sidebar desktop đủ 5 mục, bấm về `/lo-trinh`, mục active đúng, không lỗi JS.

**2026-09-14 (tối) — Link quay lại + nút Chia sẻ ở danh sách ĐÃ DEPLOY** (`web-rbd3watu6`).
Trang xem lộ trình/sổ có "← Lộ trình của tôi"/"← Sổ của tôi" chỉ cho chủ (`OwnerBackLink`).
Thẻ trong `/lo-trinh` và `/so` có Xem · Sửa · Chia sẻ; logic chia sẻ gom vào
`app/useShareActions.js` (`useRouteShare` tạo bản chụp, `useNotebookShare` gửi link sống) dùng
chung với trang chi tiết. Nút chủ sổ đổi "Sao chép link" → "Chia sẻ sổ", mở bảng chia sẻ của
điện thoại. Chưa tự bấm tạo link lộ trình từ thẻ (sẽ ghi bản chụp thật) — logic chuyển nguyên
từ `RouteOwnerActions`; chủ dự án bấm thử một lần. Trang xem sổ chưa mở bằng trình duyệt tự
động vì mỗi lượt mở ghi view thật.

**2026-09-14 (sau) — Logo + ảnh ở link chia sẻ cũ ĐÃ DEPLOY** (`web-rdrc3fg1c`). Logo ảnh
`public/cdp-logo.png` (cắt từ `data/cdp-logo.PNG`, nền trong suốt) thay chữ "CDP" ở header
mobile (26px) và sidebar desktop (24px mở / 20px thu gọn; lề hàng logo `pl-4 pr-2` để
"Chạm Địa Phương" không bị cắt). Link chia sẻ tạo trước NOTE-11 nay mượn ảnh hiện tại của địa
điểm (`withLegacyNavigationMedia`, xem DECISIONS). Production: 6/6 link cũ hiện ảnh cho mọi
điểm có ảnh, header vẫn 65px, không tràn, không lỗi JS.

**2026-09-14 — NOTE-11 + NOTE-12 + NOTE-13 ĐÃ DEPLOY production** (deployment
`web-gz3gex60d`, alias `chamdiaphuong.io.vn`, từ commit `bdd13ef`). Trước deploy: build đạt,
lint đúng 1 lỗi nền, env production đủ (không có biến `CDP_*_NAMESPACE` — đúng). Sau deploy:
Playwright iPhone 15 Plus + desktop 1440 trên trang chủ, chi tiết có ảnh (`ngu-01`), URL chỗ
đã đóng (Chang's Restaurant) và link share `67ukq88dec`: không tràn ngang, không ảnh vỡ,
không lỗi JS; `_next/image` từ Blob tải được. Chỉ kiểm tra xem, không ghi dữ liệu. Chủ dự án
chưa bấm hết checklist nhóm B (tải/gỡ ảnh, gửi mẹo `Khác`, lưu route share) — nên làm trên
production. Các đoạn "chưa deploy" bên dưới là lịch sử trước lần deploy này.

**NOTE-13 P0 đã code local, chưa deploy — chặng A+B đã xong:** pipeline ingestion đọc cả
`places:closed` trước nhánh auto-public. Candidate khớp hồ sơ đã đóng có type riêng
`closed_place_match`, luôn vào verify queue dù confidence cao. Admin có đúng ba lối: mở lại
record cũ (giữ ID + lịch sử), tạo proposal mới có `replacesPlaceId`, hoặc bỏ qua. Mốc crawler
gặp lại được lưu ở `lastCrawlMatchAt`; fallback tombstone cũ được chặn đúng khi record đã mở
lại, không migration Redis. Trang `/lo-trinh/xem/[token]` có CTA “Lưu lộ trình này”; server
đọc snapshot đóng băng và tạo Route riêng bằng owner ẩn danh hiện có. Chỉ sau khi lưu mới có
“Sửa lộ trình của tôi”; route gốc vẫn được bảo vệ bởi owner check. Snapshot mới giữ thêm
proposal/custom fields; snapshot cũ được suy ra lúc copy, không migration. Integration crawler
và route-copy đều chạy trong namespace riêng rồi rollback sạch. Build đạt; lint không thêm lỗi;
Playwright đạt iPhone 15 Plus 430×932 + desktop 1440×1000. P0 không còn code dở.

**NOTE-12 P0 + P1 đã xong local, chưa deploy:** đã audit implementation và dữ liệu thật
(223 địa điểm). Mỗi lần chỉ có một UI đóng góp; `Cách đến`/`Khác` là chữ tự do qua duyệt,
structured option vẫn bấm một chạm; matrix phủ Ăn/Chơi/Ngủ và 11 subtype Đi lại. Card và
trang chi tiết dùng cùng hierarchy, action phụ ghi rõ “Sửa thông tin hoặc gửi ảnh”.

Khi Admin xác nhận đóng cửa, record đầy đủ được archive vào hash `places:closed` trước khi
gỡ khỏi `places:live`; URL cũ hiện trạng thái đóng thay vì 404. User hoặc Admin có thể tạo
proposal địa điểm mới cùng vị trí vào đúng hàng chờ hiện có. Chỉ sau khi duyệt mới tạo record
mới và nối `old.replacedByPlaceId` ↔ `new.replacesPlaceId`; không kế thừa ảnh, giá, note hay
xác nhận. Bốn record đã đóng từ trước NOTE-12 được suy ra lúc đọc từ lịch sử, nhưng vị trí đã
mất trong flow cũ nên UI nói rõ “không còn dữ liệu vị trí”, không đoán. Build/lint/data test
tách namespace và UI Chrome thật + iPhone 15 Plus 430×932 + Admin desktop đều đạt.

**NOTE-11 P0 đã code và kiểm thử local, chưa deploy.** Media dùng Vercel Blob qua storage
adapter, place có `media[]` nhiều ảnh với order/caption/role, Admin có Media Manager, upload
được resize WebP ở server và frontend dùng `next/image` responsive/lazy. Khách tối đa **5
ảnh/lần** với cảnh báo; Admin 10. Dữ liệu cũ được normalize lúc đọc, không migration toàn
Redis. Build đạt; Playwright iPhone 15 Plus + desktop đạt; không ghi Redis/Blob trong test.

**NOTE-08 + NOTE-09 P0 + NOTE-10 P0/P1 đã deploy production.**
Public site có sidebar desktop mở/thu, menu mobile cùng config, `/gioi-thieu` trong menu,
homepage hai cột và trang chi tiết hai vùng. `/admin/navigation` sửa nhãn, tiêu đề, bật/tắt,
thứ tự nhưng không sửa key/route. NOTE-08/09 vẫn nguyên; editor Giới thiệu tiếp tục ở
`/admin/gioi-thieu`. Nội dung chủ dự án vừa sửa đã được đưa vào bản mặc định: tiêu đề
“Cụ thể là?” và câu “Mẹo người dùng nhập vào và qua admin duyệt trước khi công khai.”
Deployment `web-rn6nho9f0` đã Ready và alias `chamdiaphuong.io.vn`; Playwright production
đạt trên desktop 1440px và iPhone 15 Plus, không tràn ngang.

Lịch động + Content Inbox + ranking trang chủ đã deploy production ngày 12/9/2026. Không có
dữ liệu test nào được ghi vào key thật. Local NOTE-08 không ghi Redis.

Bối cảnh chi phối mọi ưu tiên: **Lễ hội Thành Tuyên 19–25/9/2026** — còn khoảng một tuần. Việc
gì phục vụ đợt cao điểm này thì làm trước.

---

## 2. Đã làm tới đâu

**NOTE-13 local:** root cause crawler là `ingestBatch()` trước đây chỉ match `places:live`,
nên record vừa archive khỏi live có thể quay lại như `new_place`. Guard mới chạy trước cả
de-dupe hàng chờ; item cũ đang chờ cũng được nâng thành `closed_place_match` nếu nguồn mới
khớp tombstone. `reopenClosedPlaceFromReview` ghi lại active record cùng ID và đánh dấu
override `closed:false` trong archive để lịch sử legacy không tự hiện closed lần nữa.
`createReplacementFromClosedMatch` chỉ tạo proposal, không public. Shared route dùng
`SharedRouteSaveAction`; action chỉ nhận token và tự đọc `route_share:{token}` phía server,
không nhận stops từ client. `copyRouteFromShare` ghi route mới với `copiedFrom` trỏ snapshot,
giữ thứ tự/giờ/thời lượng/note/CDP/proposal/custom stop và phương tiện. Test crawler xác nhận
closed match không thêm vào live (`liveCount=0`) và lượt quét sau chỉ bổ sung source vào item
đang chờ. Test UI xác nhận chưa copy thì không có link sửa, copy xong mới sửa được bằng owner
mới. Hai namespace test đã được kiểm tra rỗng sau rollback.

**NOTE-12 P0/P1 local:** P0 sửa `web/lib/notes.js`, `web/lib/questions.js`,
`web/app/QuestionOptions.js`, `web/app/NoteInput.js`, `web/app/QuestionPrompt.js`,
`web/app/PlaceExplorer.js`, `web/app/ContributionPanel.js`, `web/app/PlaceDetail.js`. P1 thêm
`web/lib/closedPlaces.js`, `web/app/admin/ClosedPlacesManager.js` và nối flow qua
`web/lib/proposals.js`, `web/app/contributionActions.js`, `web/app/ProposePlaceForm.js`,
`web/app/admin/proposalActions.js`, `web/app/admin/page.js`, hai action duyệt đóng cửa và
`web/app/dia-diem/[id]/page.js`. Kiểm tra nhanh: mở card → chọn `Lối vào` không còn câu gửi
xe bên dưới; chọn `Cách đến`/`Khác` thấy textarea; mở action sửa/ảnh thì UI kia ẩn. URL
`/dia-diem/<id-cũ>` hiện thẻ đóng cửa. `/admin` có mục “Địa điểm đã đóng cửa” và “Có địa
điểm mới ở đây”. Không có phần code P0/P1 nào còn dở; bước tiếp theo là chủ dự án test local,
sau đó mới deploy NOTE-11 + NOTE-12 khi được yêu cầu.

**NOTE-11 P0 local:** `lib/media.js` là nơi duy nhất chuẩn hoá `photos[]`/`menuPhotos[]`/
`coverPhoto` cũ và schema `media[]` mới. `lib/mediaStorage.js` là facade trung lập provider;
chỉ adapter Vercel biết `@vercel/blob`. Admin upload nhiều ảnh, sắp xếp, sửa caption, gán
cover/navigation và gỡ khỏi place. Gỡ chưa xoá Blob vì route share cũ có thể đang giữ URL;
dọn orphan có reference index/dry-run thuộc P1. Route live và snapshot mới hiện ảnh nhận diện;
snapshot cũ thiếu ảnh không vỡ. Ảnh khách cũ/phiếu gợi ý cũ vẫn duyệt được.

**NOTE-08 + NOTE-09 + NOTE-10 đã lên production:** có `/gioi-thieu` với định nghĩa CDP, nguồn dữ liệu, độ mới/độ trễ, ranh
giới Sổ/Lộ trình và danh bạ công khai, cùng hai CTA. Trang chủ có card nhẹ cho người lần đầu;
nút đóng lưu ở localStorage, không modal. Footer toàn site có `CDP là gì?` và
`Dữ liệu & cách cập nhật`. Không thêm link vào header đang chật, không thêm disclaimer từng
card và không mở rộng review/rating/social. Copy được tách sang `lib/aboutPage.js`, đọc
`site_content:about` và có bản mặc định khi Redis lỗi; Admin sửa chữ thuần ở route riêng.
Public responsive 1 cột mobile, 2 cột tablet và phần 3 bước thành 3 cột desktop. App Shell
public đọc `site_config:navigation`, dùng sidebar desktop 248/72px và header/menu mobile;
trạng thái sidebar chỉ lưu localStorage. Homepage/card địa điểm và trang chi tiết đã tận dụng
không gian desktop. P1 riêng của NOTE-09 vẫn còn toggle/thứ tự section, preview trong Admin
và mục lục sticky.

**Đã lên production ngày 12/9:** trang chủ + bài lễ hội đọc lịch từ
`post_events:le-hoi-thanh-tuyen`, có file tĩnh dự phòng; `/admin` sửa/thêm mốc và đổi trạng
thái lịch. Timeline nhóm cùng ngày, có “Hôm nay”, không đoán giờ khi nguồn chỉ nói buổi,
hiện rõ Đã huỷ/Mâu thuẫn/Đang cập nhật và có lịch sử hoàn tác. Đã qua unit check, build
production và Playwright iPhone 13.

Đã bổ sung mốc quá khứ “Đêm hội Trung thu phường Nông Tiến” tối 11/9 theo phản hồi chủ dự
án; không gán giờ giả. Theo dõi 8 bước tiếp theo ở `TASKS.md` mục “Checklist 8 việc”.

Checklist mục 3 đã lên production sau phản hồi test: route `/admin/content-inbox` nhận URL/nhiều
URL/nội dung copy rồi tự hiện preview nhận dạng + so lịch, không còn đứng ở “chờ phân tích”.
Các mục chủ dự án đã dán được giữ nguyên và đã chạy lại; dữ liệu kiểm thử riêng đã hoàn
nguyên. Local không có khóa AI nên UI ghi rõ đây là phân tích sơ bộ bằng quy tắc. Inbox có
Mới/Bản nháp/Đã đăng/Bỏ qua, khôi phục/xóa hẳn, form chỉnh và Public tay có xác nhận + audit.
Phần dedupe/conflict đầy đủ và pipeline collector chung vẫn thuộc mục 4–5.

Theo phản hồi ảnh lộ trình: tạm giữ ghi chú từng chặng ở 140 ký tự, chưa code thay đổi. Nguyên
tắc đã chốt là chữ tự do muốn thành nội dung công khai của CDP phải rút gọn và qua admin duyệt.
Trước khi tăng độ dài `route.stop.note`, phải hỏi lại có loại ghi chú này khỏi link chia sẻ hay
xây kiểm duyệt cho nó; xem quyết định mới nhất trong `DECISIONS.md`.

Đã deploy tiếp: `lib/mapsUrl.js` không còn ghép nguyên địa chỉ dài vào địa điểm
CDP. Thành Tín có tên chứa Tuyên Quang gửi đúng tên. Điểm ngoài CDP như Winmart Hàng Bún
bắt buộc người dùng chọn tỉnh/thành (trường hợp này là Hà Nội), không còn mặc định Tuyên
Quang; thiếu tỉnh thì không cho thêm và không đoán khi tạo link Maps. Điểm riêng/đề xuất giữ
địa chỉ đã bỏ chú thích trong ngoặc; thiếu địa chỉ thì dùng tên + tỉnh đã chọn. Đã bỏ chữ
“(tại đây)”. Trang chủ xếp từng nhóm theo xác nhận mới trong 30 ngày → độ đầy đủ dữ liệu →
xác nhận cũ; độ tin cậy/số nguồn chỉ phá hoà cuối. Logo và ô tìm kiếm + 5 nút loại được ghim
khi cuộn. Đã kiểm tra production trên iPhone 15 Plus 430×932 và deploy `web-2uhe5w6sq`.
Link chia sẻ cũ là snapshot nên không đổi; phải chia sẻ lại để áp dụng thay đổi Maps.

**Đã chạy trên production** (`chamdiaphuong.io.vn`, deploy gần nhất `web-opqyajp32`):

- **NOTE-07 (P0+P1)** — sửa Safari tự phóng to khi gõ; `PlacePicker` dùng chung cho tạo/sửa
  lộ trình; khách đề xuất địa điểm mới → vào lộ trình ngay kèm nhãn "CDP chưa xác minh", đồng
  thời xếp hàng chờ trong `/admin`; duyệt → thành địa điểm chính thức ở mọi lộ trình, từ chối
  → thành điểm riêng (không biến mất).
- **Bốn chỗ vướng khi dựng lộ trình thật** — ô "Điểm riêng" tự điền chữ đang gõ; chuỗi gửi
  Google Maps luôn kèm địa chỉ; cho phép thêm **một chỗ nhiều lần** vào cùng lộ trình; thời
  lượng viết thành "Ở đây khoảng 4 tiếng" thay vì "Khoảng 240 phút".
- **Đổi chỗ tại vị trí** — mỗi điểm có nút "Đổi chỗ", thay ngay tại vị trí đang đứng, giữ
  nguyên giờ/thời lượng/ghi chú; điểm riêng sửa được tên tại chỗ.
- **Tỉnh/thành cho điểm riêng** — 34 tỉnh/thành (sắp xếp 01/7/2025), bắt buộc người dùng tự
  chọn, không mặc định Tuyên Quang. Sửa lỗi gắn cứng "Tuyên Quang" vào chỗ ở tỉnh khác.
- **CDP_P1-P8 P1/P2/P3** — trang lễ hội thành **timeline động** (trạng thái tính theo giờ VN
  mỗi lượt xem, mốc đã qua thu gọn, nhãn "Đang diễn ra"/"Dự kiến"); **card trang chủ** khớp
  nội dung và lấy mốc sắp tới từ cùng nguồn dữ liệu; khối **"Bạn định đi thế nào?"** biến
  người đọc bài thành người tạo lộ trình.

---

## 3. File vừa sửa (4 commit gần nhất)

**Đã commit + push (2026-09-14):** toàn bộ việc của Codex (NOTE-08 → NOTE-13, gồm cả code đã
deploy lẫn NOTE-11/12/13 chưa deploy) nằm gọn trong **một** commit `93695a5` "handoff from
Codex to Claude" (101 file). Không còn gì chưa commit. Lưu ý: vì gộp một commit nên không
revert riêng từng NOTE bằng git được — muốn tách phải làm tay.

Danh sách file cũ dưới đây giữ để tra cứu: `web/lib/navigation.js` · `web/app/AppShell.js` ·
`web/app/admin/navigation/*` · `web/lib/events.js` · `web/lib/postEvents.js` · `web/lib/postEventForm.js` ·
`web/lib/contentInbox.js` · `web/lib/contentAnalyzer.js` · `web/app/admin/content-inbox/*` ·
`web/app/admin/FestivalEventsManager.js` · `web/app/admin/festivalEventActions.js` ·
`web/app/admin/page.js` · `web/app/admin/gioi-thieu/*` · `web/lib/aboutPage.js` ·
`web/lib/media.js` · `web/lib/mediaStorage.js` · `web/lib/media-storage/*` ·
`web/lib/mediaProcessing.js` · `web/lib/clientImageCompression.js` ·
`web/app/MediaImage.js` · `web/app/admin/MediaManager.js` ·
`web/app/admin/mediaActions.js` · `web/app/contributionActions.js` ·
`web/app/page.js` · `web/app/le-hoi-thanh-tuyen/page.js` ·
`web/app/le-hoi-thanh-tuyen/EventCard.js` và tài liệu.

| Nhóm | File |
|---|---|
| Mới | `web/app/AppShell.js` · `web/lib/navigation.js` · `web/app/admin/navigation/*` · `web/app/gioi-thieu/page.js` · `web/app/FirstVisitIntroCard.js` · `web/app/SiteFooter.js` · `web/lib/events.js` · `web/lib/postEvents/le-hoi-thanh-tuyen-2026.js` · `web/lib/provinces.js` · `web/lib/durationFormat.js` · `web/app/InteractivePlan.js` · `web/app/le-hoi-thanh-tuyen/EventCard.js` |
| Sửa | `web/app/layout.js` · `web/app/SiteHeader.js` · `web/app/PlaceExplorer.js` · `web/app/PlaceDetail.js` · `web/lib/routes.js` · `web/lib/mapsUrl.js` · `web/lib/routeShare.js` · `web/app/routeActions.js` · `web/app/PlacePicker.js` · `web/app/page.js` · `web/app/le-hoi-thanh-tuyen/page.js` · `web/app/lo-trinh/[slug]/page.js` · `web/app/lo-trinh/[slug]/sua/page.js` · `web/app/lo-trinh/xem/[token]/page.js` |
| Tài liệu | `docs/HANDOFF.md` · `docs/ARCHITECTURE.md` · `docs/DECISIONS.md` · `docs/STATUS.md` · `docs/TASKS.md` |

Commit: `088581e` timeline động · `e16eb67` tỉnh cho điểm riêng · `383bc55` đổi chỗ ·
`8911541` lặp điểm + thời lượng · `4b4d68d` PlacePicker + đề xuất địa điểm.

---

## 4. Lỗi / chỗ đang dở

| Mức | Việc |
|---|---|
| 🟢 | **NOTE-11 P0 đã deploy 14/9.** P1 còn thumbnail vật lý, usage/error metrics, reference index + cleanup orphan dry-run và UX caption/role nâng cao. |
| 🟢 | **Timeline + màn sửa/lịch sử hoàn tác đã deploy.** Các lần đổi lịch sau làm ngay trong `/admin`, không cần deploy code. |
| 🔴 | **Giá mùa cao điểm.** `places:live` chỉ có **một ô giá**. Khách sạn 900k ngày thường có thể 2,5 triệu dịp lễ hội → đúng tuần đông khách nhất thì web hiển thị sai với chính nhóm cần nó nhất. Là rủi ro uy tín, chưa có hướng xử lý, cần bàn trước khi code. |
| 🟡 | **0/210 địa điểm có toạ độ.** Chặn toàn bộ P2 của NOTE-07 và Phase 3 của P1-P8: bản đồ, khoảng cách/thời gian từng chặng, tối ưu tuyến. Hướng đề xuất: chỉ geocode những chỗ thực sự được dùng trong lộ trình. |
| 🟡 | **1 lỗi lint cũ** ở `web/app/PlaceExplorer.js` (`react-hooks/set-state-in-effect`). Có từ trước, chưa sửa. Mốc "sạch" hiện tại = đúng 1 lỗi này. |
| 🟡 | **Không có bộ test trong repo.** Kiểm thử đang làm bằng script Playwright rời, chạy tay, không commit. Ai tiếp quản nên cân nhắc đưa vào repo. |
| 🟢 | Header chưa có link "Lộ trình của tôi" (chỉ có link chéo ở `/so`). |
| 🟢 | "Danh Khoa - Cho thuê xe tự lái" đang xếp `thue-o-to` theo phỏng đoán, chưa xác minh. |
| 🟢 | Dữ liệu cũ chưa ai kiểm lại: thiếu trường `lastVerifiedAt`, xem [SPEC-kiem-lai-du-lieu.md](SPEC-kiem-lai-du-lieu.md). |

---

## 5. Bước tiếp theo nên làm

Xếp theo mức đáng làm trước lễ hội:

0. **Chốt `docs/PLAN-dem-18-9-redis.md` §7** (gói Upstash + giảm lệnh B1–B3) và làm trước 18/9 19:00;
   theo dõi đêm 18/9 theo §6. NOTE-08 Phần 4 (menu admin + Dashboard + Người dùng) sau. Chi tiết kế hoạch ở DECISIONS 2026-09-15 "NOTE-08".

1. **Chủ dự án bấm thử NOTE-11/12/13 trên production** (đã deploy 14/9): Admin tải → gỡ ảnh,
   khách gửi 6 ảnh thấy báo đỏ, gửi mẹo `Khác` → từ chối, lưu một route share → sửa bản copy.
   Lỗi gì sửa trước 19/9 (tuần lễ hội chỉ đo số liệu, không code).
2. **Bàn hướng xử lý giá mùa cao điểm** — cần chủ dự án chốt trước, đừng tự code.
3. **Lộ trình mẫu của CDP** (`is_featured`) + nút "Dùng lộ trình này" — `CDP_P1-P8 §Phase 2`.
   Phần copy route đã có từ NOTE-13 (`copyRouteFromShare`, copy từ snapshot share); còn thiếu
   cờ featured, nơi hiển thị lộ trình mẫu và copy từ route sống thay vì snapshot.
4. **Toạ độ địa điểm** — mở khoá bản đồ và khoảng cách/thời gian.
5. Phase 2 còn lại: Source Registry, Content Monitor, admin duyệt diff.

**Trước khi bắt tay bất kỳ việc nào:** đọc [/AGENTS.md](../AGENTS.md) §6 (những thứ không
được tự ý đổi) và trình kế hoạch ngắn cho chủ dự án duyệt.
