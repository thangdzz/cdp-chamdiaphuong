# ARCHITECTURE — Bản đồ hệ thống

> **Đọc file này trước khi code.** Mục đích: người/agent mới vào biết ngay dữ liệu nằm đâu,
> file nào làm gì, luồng chạy ra sao — không phải mò cả repo.
>
> Cập nhật khi đổi hạ tầng, thêm/bớt key Redis, hoặc thêm module lớn.
> Hướng đi sản phẩm xem [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md) · việc sắp làm xem
> [ROADMAP.md](ROADMAP.md) · lý do các lựa chọn xem [DECISIONS.md](DECISIONS.md).

---

## 1. Tóm tắt trong 10 dòng

- Web chạy bằng **Next.js 16 (App Router, JavaScript — không dùng TypeScript)**, deploy trên
  **Vercel**.
- Dữ liệu để trong **Upstash Redis** (qua Vercel Marketplace), truy cập bằng
  `@upstash/redis`. **Không có SQL, không có Supabase, không có Prisma.**
- Mỗi "bảng" là **một key Redis chứa nguyên một mảng JSON** — đọc cả mảng, sửa, ghi lại cả
  mảng. Không có index, không có truy vấn.
- Ảnh để ở **Vercel Blob** (store `cdp-photos`, public), nhưng domain/UI chỉ gọi qua
  `lib/mediaStorage.js`; SDK Vercel bị cô lập trong `lib/media-storage/vercelBlob.js` để
  sau này đổi R2/S3/GCS không phải đổi schema địa điểm.
- Không có tài khoản người dùng. Người góp ý được định danh bằng **mã ẩn danh lưu trong
  localStorage**. `/admin` dùng **một mật khẩu chung** + cookie ký HMAC.
- Toàn bộ code web nằm trong thư mục `web/` (~3.900 dòng).

⚠️ **Cảnh báo về phiên bản Next.js:** `web/AGENTS.md` ghi rõ bản Next.js này có breaking
changes so với dữ liệu huấn luyện của model. **Đọc `node_modules/next/dist/docs/` trước khi
viết code Next.js.**

---

## 2. Kho dữ liệu — 27 key Redis

Tất cả đều là **một key = một mảng JSON**, **trừ `places:closed`**,
`place_checkins:latest` (Chặng 1), 3 key của Chặng 2, và 4 key của Chặng 4 (xem bên dưới) —
dùng hash/set/string thay vì mảng.
`notebook:{slug}` là ngoại lệ trong ngoại lệ: bản thân nó VẪN là 1 key = 1 JSON đầy đủ (như
quy ước gốc), chỉ khác là có **nhiều key cùng dạng** (1 sổ = 1 key riêng) thay vì gộp chung.

### Dữ liệu địa điểm (`lib/redis.js`)

| Key | Chứa gì |
|---|---|
| `places:live` | **Các chỗ đang hiện trên web.** Trang chủ đọc thẳng key này |
| `places:pending` | Hàng chờ duyệt **thủ công** (người nhập tay qua `/admin`) |
| `places:closed` | **Hash**, field = `placeId`, value = record cũ + trạng thái đóng và `replacedByPlaceId`. `lib/closedPlaces.js` archive trước khi gỡ live; URL cũ đọc một field, không 404 |

### Nội dung bài viết có lịch động (`lib/postEvents.js`)

| Key | Chứa gì |
|---|---|
| `post_events:le-hoi-thanh-tuyen` | Mảng mốc lịch do admin sửa. Key chưa có, rỗng, sai khuôn hoặc Redis lỗi thì trang tự dùng `lib/postEvents/le-hoi-thanh-tuyen-2026.js` làm bản dự phòng |
| `post_event_revisions:le-hoi-thanh-tuyen` | Tối đa 100 lần sửa/thêm/hoàn tác gần nhất; giữ mốc trước và sau để admin hoàn tác. Không đọc được lịch sử thì chặn ghi mới, tránh xoá log cũ |

### Content Inbox (`lib/contentInbox.js`)

| Key | Chứa gì |
|---|---|
| `content_inbox:items` | Tối đa 500 URL/nội dung admin dán vào; giữ nguyên nguồn, preview `analysis`, bản sửa `draftEvent` và trạng thái `new/draft/published/ignored`. Item cũ `waiting` vẫn chạy lại được; local chưa có khóa AI nên dùng quy tắc có ghi rõ giới hạn |

Public từ Inbox dùng một Redis pipeline ghi đồng thời `post_events:*`, `post_event_revisions:*`
và `content_inbox:items`. Nếu lượt ghi lỗi thì không key nào được đánh dấu xong nửa chừng.

### Nội dung trang Giới thiệu (`lib/aboutPage.js`)

| Key | Chứa gì |
|---|---|
| `site_content:about` | Một object theo schema cố định P0 cho `/gioi-thieu`: Hero, các section NOTE-08, 3 bước, 5 nguồn dữ liệu và nhãn 2 CTA. Không lưu HTML hay URL tùy ý |

Key chưa có, Redis lỗi hoặc object sai khuôn thì trang tự dùng `DEFAULT_ABOUT_PAGE` trong
code. Admin chỉ sửa chữ trong các block cố định tại `/admin/gioi-thieu`; React render chuỗi
text nên nội dung giống thẻ HTML không được thực thi. Khi test dùng
`CDP_SITE_CONTENT_NAMESPACE` để không ghi vào key production.

### Cấu hình điều hướng public (`lib/navigation.js`)

| Key | Chứa gì |
|---|---|
| `site_config:navigation` | Năm item (explore, notes, notebooks, routes, about) có `key`, `navLabel`, `pageTitle`, `enabled`, `order`; `href` lưu kèm để đọc/debug nhưng luôn bị code ghi đè bằng route cố định |

`AppShell` desktop, menu mobile, footer và H1 của bốn trang chính đọc cùng object này. Key
thiếu, Redis lỗi hoặc dữ liệu sai khuôn/thứ tự trùng thì dùng `NAVIGATION_DEFINITIONS` trong
code. Admin tại `/admin/navigation` không có ô sửa key/route; Server Action cũng tự dựng lại
bốn item từ definition và bỏ qua mọi key/href do request gửi. Test dùng chung biến namespace
`CDP_SITE_CONTENT_NAMESPACE` với content Giới thiệu.

### Game layer (`lib/game/store.js` — hằng số `GAME_KEYS`, NOTE-03/NOTE-04)

Mọi key có dạng `game:{eventId}:…` (VD `game:thanh-tuyen-2026:sightings`). Thao tác của khách
nên dùng hash/zset/list + lệnh nguyên tử, **không** phải mảng JSON. Test đặt
`CDP_GAME_NAMESPACE` để tách hẳn khỏi key thật.

| Hậu tố key | Kiểu | Chứa gì |
|---|---|---|
| `objects` | Hash, field = objectId | Object do admin sửa/thêm + bí ẩn khách tạo. Ghi đè từng trường lên seed trong file season. `matchedTo` = đã ghép vào object khác |
| `sightings` | Hash, field = sightingId | Bản ghi đầy đủ (có `anonId`, toạ độ gốc, `photo.status`) — KHÔNG trả ra public |
| `sightings:by-time` | ZSET, score = ms | Dòng thời gian để lấy "tối nay" (ZRANGE BYSCORE REV) |
| `object-stats` / `object-photos` | Hash, HINCRBY | Số lượt báo / số ảnh theo objectId thô (cả mùa) |
| `object-stats:day:{YYYY-MM-DD}` | Hash, HINCRBY | Số lượt báo theo ngày giờ VN — nguồn cho "được nhìn thấy nhiều nhất" (chưa có UI) |
| `object-seers:{objectId}` | HyperLogLog (PFADD) | Ước lượng số người khác nhau đã thấy, không lưu danh tính |
| `config` | Hash | Cấu hình chạy admin đổi không cần deploy: `gameLiveAt` (giờ hết pre-game) |
| `collection-counts:{anonId}` | Hash, HINCRBY | Số lần một người gặp từng object (bộ sưu tập vẫn tính 1) |
| `firsts` | Hash, HSETNX | Người ghi nhận đầu tiên `{anonId, nickname, at, sightingId}` |
| `collection:{anonId}` | Hash, HSETNX | objectId → lần đầu gặp. HSETNX = không bao giờ đếm trùng |
| `user-sightings:{anonId}` | List (200 gần nhất) | Lịch sử riêng của một người |
| `counters` / `area-activity` / `flags` | Hash | Tổng lượt báo · lượt báo theo ô ~110m · số lượt báo sai |
| `cooldown:{anonId}:{objectId}` · `rate:{anonId}:{bucket}` · `flag-lock:…` | String TTL | Chống spam |

Tổng bộ sưu tập = mọi slot model chưa ghép/ẩn, kể cả slot chưa có tên (NOTE-06: 45 = 34 tên + 11
slot). Âm thanh game là file tĩnh `public/game-sounds/*.m4a` (CC0, sinh bằng
`scripts/game-sounds/build.mjs` từ `sources.json`), không nằm trong Redis/Blob.

**Bàn phím trong bottom sheet (2026-09-16):** `_game/BottomSheet.js` bám `visualViewport` (biến CSS
`--sheet-top`/`--sheet-vh`, `data-keyboard`); sheet có ô tìm kiếm truyền `expanded` để giữ chiều cao cố định —
**sheet neo đáy mà co theo nội dung thì gõ lọc sẽ tụt ra sau bàn phím.** Ô tìm kiếm đặt `sticky` trong
`[data-sheet-scroller]`. Chặn cuộn xuyên: touchmove dọc mà vùng cuộn không cuộn được theo hướng đó thì
`preventDefault` (body ghim fixed KHÔNG đủ khi bàn phím mở hoặc danh sách ngắn hơn khung).

**Bộ nhớ đệm đọc 20 giây (2026-09-15, PLAN-dem-18-9 §5 B1):** trang game + `loadGameSnapshot` +
`loadPlayerState` dùng `loadGameEventShared`/`getSharedGameSnapshot` (bộ nhớ máy chủ, mỗi instance
Vercel). Luồng ghi (báo, ảnh, admin) dùng bản đọc mới. Client bỏ qua snapshot cũ hơn bản đang có
(`applySnapshot` so `generatedAt`) — đừng bỏ phép so này khi sửa GameExperience.

Object đã ghép **không** ghi lại sighting/bộ sưu tập: `resolveObjectId()` trong
`lib/game/catalog.js` quy về object đích lúc đọc (cả bộ sưu tập, số đếm, first discovery).

### Pipeline AI quét dữ liệu (`lib/ingestion/store.js` — hằng số `KEYS`)

| Key | Chứa gì |
|---|---|
| `ingestion:review_queue` | Hàng chờ duyệt **tự động** — chỉ những ca nghi trùng/mâu thuẫn |
| `ingestion:review_events` | Nhật ký duyệt/từ chối |
| `ingestion:source_runs` | Lịch sử các lần quét (giữ 200 lần gần nhất) |
| `ingestion:place_snapshots` | Ảnh chụp dữ liệu từng lần quét (giữ 1000 bản gần nhất) |
| `ingestion:confirmed_distinct` | Các cặp chỗ **admin đã xác nhận là khác nhau** — để không hỏi lại (DECISIONS 2026-07-18) |

**Chặn địa điểm đã đóng (NOTE-13 + NOTE-14 A):** nguồn gửi `business_status` = `CLOSED_PERMANENTLY` (hoặc chữ
"Bị đóng vĩnh viễn") → review type `source_closed`, **không bao giờ tự công khai** (action riêng trong
`app/admin/reviewActions.js`: Không thêm / Đề xuất địa điểm mới tại đây / Gửi xác minh mở lại → rồi mới có nút
công khai / Tạo báo đóng cửa cho chỗ đang công khai). Khớp hồ sơ đã đóng thì vẫn là `closed_place_match`.
**Mọi đường công khai khác** (duyệt hàng chờ, duyệt "Chờ duyệt", duyệt đề xuất) cũng chạy
`matchPlaceAgainstClosedPlaces` — khớp thì `lib/ingestion/closedHold.js` tạo `closed_place_match` trong hàng
chờ thay vì công khai. Thêm đường công khai mới thì phải gọi guard này.

### Ghi nhận hoạt động ẩn danh (`lib/analytics/store.js` — hằng số `ANALYTICS_KEYS`, NOTE-08)

Đơn vị là **khách** = mã `v-…` trình duyệt tự sinh (`localStorage cdp_visitor_id`), khác `anonId` hồ sơ
đóng góp; có hồ sơ thì gắn thêm `anonId` (để sau này gộp vào tài khoản). Không lưu IP, vị trí, nguyên
user-agent. Trình duyệt gom sự kiện (`app/analytics.js` → `POST /api/track`), mỗi đợt = **một** lần gọi
script Lua. Test: `CDP_ANALYTICS_NAMESPACE` (mặc định theo `CDP_GAME_NAMESPACE`); `npm run dev` không
namespace thì route bỏ qua không ghi. Tắt khẩn cấp: `CDP_ANALYTICS_DISABLED=1`.

| Key (`analytics:` …) | Kiểu | Chứa gì |
|---|---|---|
| `visitor:{v-id}` | Hash | firstSeenAt, lastSeenAt, sessions, số lần từng sự kiện, device (thô "iOS · Zalo"), lastPath, firstReferrer, anonId, displayName |
| `visitors:by-last-seen` | ZSET | score = lastSeenAt — danh sách khách cho `/admin/users` |
| `visitor-names` | Hash | v-id → tên gần nhất (tìm theo tên) |
| `day:{YYYY-MM-DD}` | Hash | sessions, new_visitors, `event:<tên>`, `hour:<HH>:sessions`, `hour:<HH>:page_view`, `path:<đường dẫn>` |
| `day:{d}:visitors` · `day:{d}:returning` | HyperLogLog | Khách khác nhau / khách đã từng vào trước hôm đó. PFCOUNT nhiều ngày = khách khác nhau cả khoảng |
| `day:{d}:funnel:{stage}` | HyperLogLog | Phễu: post_view (bài có game) → game_open → sighting_start → sighting_submit → game_returning (người mở game từ phiên 2) |

Tên sự kiện định nghĩa ở MỘT chỗ `lib/analytics/events.js`. Phiên mới khi im lặng > 30 phút.

### Người góp ý

| Key | File | Chứa gì |
|---|---|---|
| `contributors:all` | `lib/contributors.js` | Hồ sơ ẩn danh: `anonId`, `nickname`, `recoveryCode` (6 số), `categoryId`, `points`, `legendaryBonus`, `nameChangedCount`/`nameChangedAt` (NOTE-08) |
| `contributors:names` | `lib/contributors.js` | **Hash** anonId → tên hiện tại (NOTE-08). Để hiện tên người khác (first discovery) bằng HMGET vài anonId, không đọc cả mảng. Hồ sơ cũ chưa có thì đọc mảng một lần rồi ghi bù |
| `user_suggestions` | `lib/suggestions.js` | Góp ý của khách (`type: "correction"` hoặc `"photo"`) chờ duyệt |

> **Tên hiển thị (NOTE-08):** luật sinh/kiểm tra tên ở MỘT chỗ `lib/displayName.js` (thuần, dùng cả
> server lẫn trình duyệt). Hồ sơ mới không truyền tên → tự sinh tên vui, không còn "Người ẩn danh".
> Hồ sơ cũ mang "Người ẩn danh" → `resolveDisplayName` suy ra tên cố định từ anonId lúc đọc, không sửa
> dữ liệu. Game: tên nháp trong localStorage `cdp_display_name_draft` (`app/_game/playerName.js`) tới lần
> báo đầu tiên thì thành tên hồ sơ.

> ⚠️ Key `user_suggestions` **không có tiền tố** (`user_suggestions`, không phải `suggestions:all`) — khác
> quy ước với các key còn lại. Giữ nguyên, chỉ ghi ra đây để khỏi nhầm.

### Xác nhận "hôm nay vẫn mở" (Chặng 1, `lib/checkins.js`)

| Key | Kiểu | Chứa gì |
|---|---|---|
| `place_checkins:latest` | **Hash** (không phải mảng JSON) | field = `placeId`, value = ISO timestamp lần xác nhận gần nhất. `HSET` ghi 1 field (nguyên tử, không đụng field khác); `HGETALL` đọc **toàn bộ** trong 1 lệnh |
| `checkin:lock:{placeId}:{anonId}` | String, tự hết hạn 24h | Khoá chặn 1 người xác nhận lại cùng 1 chỗ trong 24h (`SET NX EX`) |
| `checkin:points-count:{anonId}:{ngày}` | String (số đếm), tự hết hạn 2 ngày | Đếm số lượt được cộng điểm trong ngày, trần 3 (`INCR` + `EXPIRE`) |

**Vì sao lệch quy ước "1 key = 1 mảng":** đây là thao tác của **khách** (nhiều người bấm
cùng lúc), khác mọi luồng ghi khác trong dự án (routine/admin: từng cái một). Đọc-cả-mảng →
sửa → ghi-cả-mảng không an toàn ở đây. Ban đầu định lưu mỗi lượt xác nhận theo từng chỗ
(`ZADD` riêng từng key), nhưng trang chủ `force-dynamic` cần đọc lần xác nhận gần nhất của
**mọi** chỗ mỗi lượt xem — N key riêng sẽ tốn N lệnh Redis/lượt xem (gói Upstash free chỉ
500K lệnh/tháng). Gộp về 1 hash giải quyết đúng vấn đề đó: luôn đúng 1 lệnh đọc dù bao nhiêu
chỗ. Không lưu log từng lượt xác nhận (đếm số người/xem xu hướng) — ngoài phạm vi Chặng 1
(SPEC-chang-1.md §7); thêm sau bằng 1 sorted set riêng nếu cần, không ảnh hưởng hash này.

### Câu hỏi bấm chọn + đồng thuận (Chặng 2, `lib/answers.js`)

| Key | Kiểu | Chứa gì |
|---|---|---|
| `place_answers:consensus` | **Hash**, field = `placeId` | value = object đã tính sẵn `{questionId: {value, votes, weak}}`. `HGETALL` đọc toàn bộ trong 1 lệnh — bảng đã tính sẵn, KHÔNG tính lúc khách xem trang |
| `place_answers:votes:{placeId}` | **Hash**, field = `{questionId}:{anonId}` | value = `{answer, at, text, awarded}`. Chỉ đọc khi có người vừa bấm ở đúng chỗ đó |
| `answers:skip:{anonId}:{placeId}:{questionId}` | String rỗng, tự hết hạn 30 ngày | Đánh dấu đã bấm "Không rõ" — không hỏi lại câu đó trong 30 ngày |

Cộng 2 key đếm: `answers:count:{anonId}:{placeId}:{ngày}` (trần 5 câu/chỗ/ngày, TTL 48h) và
`points:day:{anonId}:{ngày}` (`lib/pointsCap.js` — trần CHUNG 30 điểm/ngày, áp dụng cho **mọi**
nguồn điểm kể cả Chặng 1's checkin, TTL 48h).

**Vì sao phần dữ liệu địa điểm chỉ dùng đúng 4 lệnh Redis/lượt xem dù bao nhiêu chỗ:** `places:live` (mảng) +
`place_checkins:latest` (`HGETALL`) + `place_answers:consensus` (`HGETALL`) +
`place_location:consensus` (`HGETALL`, từ 16/9) — không lệnh nào tăng theo số địa điểm. Việc "chọn câu nào để hỏi" (đọc phiếu + đồng thuận + phiếu "Không rõ"
của 1 chỗ cụ thể) chỉ chạy khi khách **bung 1 thẻ**, không chạy cho mọi chỗ lúc tải trang.
Root Layout đọc thêm đúng một object `site_config:navigation`; bài lễ hội, ghi chú công khai
và content khác có lệnh riêng theo module, không tăng theo số địa điểm.

**Trọng số phiếu theo tuổi** (dưới 6 tháng = 1.0, 6–12 tháng = 0.5, trên 12 tháng = 0.1) —
cơ chế tự dọn rác, tính lúc chốt đồng thuận (mỗi lượt bấm), không cần cron riêng.

**Điểm chỉ cộng khi đồng thuận đạt ≥2 phiếu thật** (không phải theo trọng số) — phiếu đầu
tiên luôn ghi `weak: true` để hiển thị ngay (§3.3 SPEC), nhưng KHÔNG được cộng điểm cho tới
khi có phiếu thứ hai trùng. Cộng điểm hồi tố: khi đồng thuận vừa đạt, duyệt lại các phiếu
trùng đáp án thắng, phiếu nào chưa `awarded` thì cộng và đánh dấu — người bấm đầu tiên được
cộng đúng lúc người thứ hai bấm trùng, không phải lúc họ tự bấm.

### Cộng đồng xác nhận vị trí (2026-09-16, `lib/locationVotes.js`)

| Key | Kiểu | Chứa gì |
|---|---|---|
| `place_location:consensus` | **Hash**, field = `placeId` | Kết luận đã tính sẵn `{lat, lng, googlePlaceId, voters, status, conflict, at, clusters[]}`. `status`: `community_verified` \| `conflict` \| `pending`. 1 `HGETALL` phục vụ cả trang công khai lẫn bảng admin |
| `place_location:votes:{placeId}` | **Hash**, field = `anonId` | `{lat, lng, googlePlaceId, at, awarded}` — **một người một phiếu cho một chỗ**, gửi lại là thay phiếu cũ. Chỉ đọc khi có người vừa bấm ở đúng chỗ đó |
| `location_votes:count:{anonId}:{ngày}` | String (số đếm), TTL 48h | Trần 20 phiếu vị trí/người/ngày — chặn bơm dữ liệu, khác trần điểm chung 30đ/ngày |

**Luật đồng thuận (spec Consensus §7):** gom phiếu thành cụm bán kính **40m**
(`LOCATION_CONSENSUS_RADIUS_METERS`, tâm cụm = trung bình các phiếu trong cụm; xét theo thứ tự thời
gian nên hai lần tính cho cùng kết quả). Cụm đông nhất **≥2 người VÀ đông hơn cụm nhì** →
`community_verified`. Hai cụm bằng nhau → `conflict`, **không tự chọn**, chỗ đó vẫn là chưa xác minh.
Cụm nhì có ≥2 người thì luôn bật cờ `conflict` để admin xem lại, kể cả khi đã có đa số.

**Thứ tự tin cậy (§8):** hồ sơ có Place ID / toạ độ `confirmed` (CDP hoặc chủ lộ trình ghim) →
`admin_verified`; chưa có gì mà cộng đồng đồng thuận → `community_verified`; còn lại `unverified`.
Phiếu khách **không bao giờ ghi đè `places:live`** — admin chốt ở `/admin/vi-tri` mới ghi vào hồ sơ.

**Cách nối vào chỗ khác:** trang nào cần nút bản đồ thì gắn `locationConsensus` vào từng place
(`getAllLocationConsensus()`, 1 lệnh cho cả danh sách) — `app/page.js`, `app/dia-diem/[id]/page.js`,
`resolveRouteStops()` (lib/routes.js), `resolveNotebookItems()` (lib/notebooks.js). `locationOf()` tự
đọc field đó, nên `placeMapAction()`/`stopRouteTarget()` không phải sửa gì.
Giao diện khách: `app/PlaceLocationVote.js` (+ `app/locationVoteActions.js`) ở trang địa điểm, và
`app/StopPlaceLocation.js` ở trang sửa lộ trình. Bảng admin: `app/admin/vi-tri/LocationSuggestions.js`. Xoá/gộp chỗ → `removePlaceLocationVotes()` dọn cùng
`removePlaceAnswers()`.

### Sổ chia sẻ được (Chặng 4, `lib/notebooks.js`)

| Key | Kiểu | Chứa gì |
|---|---|---|
| `notebook:{slug}` | **1 key = 1 sổ, JSON đầy đủ** | `{slug, title, ownerAnonId, items: [{placeId, nameSnapshot, note}], copiedFrom, createdAt, updatedAt}`. Chỉ ĐÚNG 1 người ghi (chủ sổ) nên đọc-sửa-ghi cả JSON an toàn — khác Chặng 1-2 (nhiều người lạ ghi cùng lúc) |
| `notebooks:by-owner:{anonId}` | **Set** (`SADD`/`SMEMBERS`, không phải mảng) | Danh sách slug của 1 người. Dùng lệnh nguyên tử dù chỉ 1 người ghi — để 2 tab của cùng người đó tạo sổ gần như đồng thời không đè mất lượt của nhau |
| `notebook:stats` | **Hash**, field `{slug}:views` / `{slug}:copies` | `HINCRBY` khi có người mở/lưu sổ — không đọc-sửa-ghi cả JSON sổ mỗi lượt xem (SPEC §7) |
| `notebook:count:total` | String (số đếm) | Tổng số sổ đã tạo — `INCR` mỗi lần tạo sổ mới, đọc trong `/admin` |

**`items[].nameSnapshot`** — chép tên chỗ lúc thêm vào sổ, CHỈ dùng khi chỗ đã bị xoá khỏi
`places:live` (khách vẫn thấy tên, không phải dòng trống kèm ghi chú vô nghĩa). Mọi lúc khác
luôn lấy tên MỚI NHẤT từ `places:live` — chỗ đổi giá/địa chỉ thì sổ tự cập nhật theo, không
sao chép dữ liệu chỗ vào sổ (SPEC-chang-4.md §4.3, sửa 1 lần sau khi phát hiện SPEC gốc thiếu
chỗ lưu tên — xem lịch sử SPEC-chang-4.md).

**Đếm lượt xem KHÔNG chạy lúc server render trang** — `app/so/[slug]/page.js` là Server
Component (để `generateMetadata`/Open Graph chạy được cho người lạ mở link lần đầu), nhưng
việc gọi `HINCRBY` tăng view lại nằm ở `NotebookViewTracker.js` (Client Component, chạy sau
khi trang tải xong ở trình duyệt). Lý do: bot quét link tạo preview (Zalo, Facebook...) chỉ
đọc HTML `<head>`, không chạy JavaScript — nếu đếm ngay lúc server render thì mỗi lần ai đó
dán link vào Zalo sẽ bị tính nhầm thành 1 "lượt mở" thật, làm sai đúng con số quan trọng nhất
của Chặng 4 (§7: đo lường vòng lan truyền).

**Trang `/so`, `/so/{slug}/sua` là Client Component** (không phải Server Component) — cả 2
cần biết "tôi là ai" (`anonId` trong localStorage) ngay từ đầu để lấy đúng dữ liệu, mà Server
Component không đọc được localStorage. `getNotebookForEdit()` tự kiểm tra đúng chủ sổ ở
server (so `anonId` gửi lên với `ownerAnonId` lưu trong sổ) — không tin giao diện chặn hộ.

### Hình dạng một chỗ trong `places:live`

Xem `lib/ingestion/toLivePlace.js` (`candidateToLivePlace`) và `lib/placeForm.js`.
Toạ độ (NOTE-14, không bắt buộc): `coordinates: { lat, lng, source, confirmed }` — MỘT chỗ quy định ở `lib/coordinates.js`
(khung Việt Nam, đọc link Google Maps, `coordinatesOf()` đọc cả dạng cũ). Import mới có toạ độ khi nguồn có;
chỗ đang công khai chưa có thì lần quét khớp sau điền vào (không đè toạ độ đã có). `providerMeta.google`
(placeId, mapsUrl, businessStatus) nếu nguồn là Google.
Dịch vụ đón khách (NOTE-14 B): `pickupMode` + `pickupPoints[{id,name,addressLine,wardOrDistrict,province,lat,lng,note,
order,active}]` — luật ở `lib/pickupPoints.js`, admin sửa ở `app/admin/PickupPointsEditor.js` (ô ẩn JSON
`pickupPointsJson`, `lib/placeForm.js` làm sạch lại). **Địa chỉ của service không phải điểm đón.**
Trong lộ trình (NOTE-14 C): stop `cdp_place` có thể có `pickupSelection` (bản chụp `pickup_point` hoặc `custom`),
lưu qua `setStopPickupSelection` (lib/routes.js). `stopMapsQuery` KHÔNG BAO GIỜ dùng tên/địa chỉ của dịch vụ đón
khách; `stopNeedsPickupSelection` chặn nút Maps ở trang xem và chặn tạo link chia sẻ.

### Xác nhận vị trí trên bản đồ (2026-09-16)

Mọi chỗ người dùng gõ địa chỉ bằng tay đều có khối `app/LocationConfirm.js`: tra vị trí gần đúng
(`app/geocodeActions.js` → Photon/OSM, phần thuần ở `lib/geocode.js`) → mở `GameMap` chế độ `picker` → kéo ghim →
**Xác nhận vị trí**. Tra hỏng thì mở ở tâm tỉnh (bảng 34 tỉnh trong `lib/geocode.js`), không chặn ai. Không ghi
Redis cho việc tra.
Nguồn toạ độ: `geocoded` (máy tra) < `user_adjusted` (người kéo ghim) / `cdp_verified`; `confirmed` = đã có người
nhìn bản đồ và xác nhận. Đổi địa chỉ → bỏ `confirmed`, GIỮ toạ độ.
Dùng ở: điểm riêng lộ trình (`coordinates` trên stop, lưu qua `confirmStopLocation`), điểm đón tận nơi và điểm đón
của nhà xe (dạng phẳng `lat`/`lng`/`locationSource`/`locationConfirmed`, `cleanPickupLocation` ở `lib/pickupPoints.js`).
`stopMapsQuery` ưu tiên toạ độ đã ghim cho MỌI loại điểm, chỉ rơi về địa chỉ chữ khi chưa có.
**Từ 16/9 điểm dừng là ĐỊA ĐIỂM CDP cũng ghim được** (`updateStop` nhận `coordinates` cho mọi loại điểm):
ghim lưu trên điểm dừng và thắng vị trí danh bạ **trong đúng lộ trình đó** (`stopRouteTarget`), đồng thời
gửi một phiếu cho danh bạ. Tên/địa chỉ của địa điểm CDP vẫn chỉ sửa được bằng "Đổi chỗ".

### Dẫn đường vs tìm kiếm (2026-09-16, spec CDP-Google-Maps-Location-Routing-v1)

`lib/placeLocation.js` — `locationOf()` / `isLocationVerified()`: **đã xác minh = có `googlePlaceId`,
hoặc có toạ độ `confirmed: true`**. Toạ độ máy tự suy không tính. Suy ra lúc đọc, không migration.
`lib/mapsUrl.js` tách hai việc: `placeRouteTarget()`/`stopRouteTarget()` cho DẪN ĐƯỜNG (null khi chưa
xác minh), `placeSearchQuery()`/`mapsSearchUrl()` cho TÌM KIẾM. `placeMapAction()` chọn nút đúng.
`routeMapsUrl()` nhận danh sách điểm đã resolve và trả `legs[]` (chia chặng khi dài).
Hai công tắc: `REQUIRE_VERIFIED_LOCATION` (đang false — xem DECISIONS) và `MAX_WAYPOINTS`.
Admin ghim hàng loạt ở `/admin/vi-tri`; ghim một chỗ ở form sửa (`PlaceLocationEditor`).
Khách cũng ghim được, và đủ 2 người đồng ý là dẫn đường được — xem mục "Cộng đồng xác nhận vị trí" bên trên.
Google Places (tuỳ chọn): `lib/googlePlaces.js` + `app/googlePlacesActions.js`, bật bằng
`GOOGLE_MAPS_SERVER_KEY` + `NEXT_PUBLIC_GOOGLE_PLACES=1`, chỉ gọi khi người dùng bấm nút.

```js
{
  id: "live-<uuid>",
  name, type: "an" | "choi" | "ngu" | "dilai", // xem lib/placeTypes.js
  address, ward, localArea, phone,
  priceMin, priceMax, priceUnit,
  priceText,                        // LUÔN tự tính, không nhận gõ tay
  media: [{
    id, storageKey, url,
    width, height, bytes, mimeType,
    caption, order,
    roles: ["general", "cover"],   // có thể thêm navigation/entrance/parking/menu/interior
    source, uploadedAt, uploadedBy,
    providerMeta                    // metadata riêng provider, domain không phụ thuộc vào nó
  }],
  signatureDishes: [ten],           // chỉ với type "an"

  // Chỉ với type "dilai" — xem lib/transport.js (NOTE-04 §1–§2, NOTE-06 §1)
  transportSubtype,                 // 1 trong 11 id ở TRANSPORT_SUBTYPES; family suy ra từ
                                    // đây, KHÔNG lưu riêng (xem DECISIONS 2026-09-10)
  vehicleTypes: ["4", "7"],         // admin tích, NHIỀU giá trị cùng lúc (NOTE-06 §8)
  vehicleSeats,                     // ô chữ tự do CŨ ("7 chỗ") — chỉ còn đọc, không còn ô nhập
  mainRoute,                        // admin điền, VD "Tuyên Quang ↔ Hà Nội"
  serviceArea,                      // admin điền, VD "TP Tuyên Quang và lân cận"

  confidenceScore, sourceCount,
  lastUpdatedAt, autoPublished
}
```

**Tương thích ảnh cũ:** phần lớn dữ liệu thật vẫn có `photos: [url]`,
`menuPhotos: [{url, addedAt}]` và có thể có `coverPhoto`. `placeMedia()` trong
`lib/media.js` chỉ chuẩn hoá các trường này **trong bộ nhớ**. Không migration toàn Redis;
chỉ địa điểm đang được Admin sửa/upload ảnh hoặc nhận ảnh đã duyệt mới ghi lại `media[]` và
bỏ ba trường cũ của chính địa điểm đó. Vì vậy dữ liệu cũ/phiếu ảnh cũ vẫn đọc được.

### Nhóm Đi lại: family quyết định, subtype override

4 family (NOTE-06 §1) — `transportFamilyOf(place)` suy ra từ subtype:

| Family | Subtype | Trạng thái |
|---|---|---|
| `pickup-service` | Xe ghép · Taxi · Thuê xe có lái | ✅ đã hoàn thiện |
| `scheduled-route` | Xe khách · Xe buýt | xe khách có bộ câu hỏi, xe buýt chưa |
| `transport-place` | Bến xe · Điểm đón/trả · Bãi xe | mới có taxonomy, CTA "Chỉ đường" |
| `self-drive` | Thuê ô tô · Thuê xe máy | mới có taxonomy |

Sáu khoá khai báo trong `lib/questions.js`, không rải if/else nơi khác:

| Khoá | Nghĩa |
|---|---|
| `families: [...]` | Câu NỀN của cả family |
| `subtypes: [...]` | Câu riêng, hẹp hơn family |
| `skipFamilies: [...]` | Câu chung nhưng vô nghĩa với cả family này |
| `skipSubtypes: [...]` | Như trên nhưng cho 1 subtype |
| `supersededBySubtype` | Thôi hỏi ngay khi admin đã chọn subtype |
| `supersededByField: "x"` | Thôi hỏi khi admin đã điền ô `x` (VD `vehicleTypes`) |

Có `families` hoặc `subtypes` là câu HẸP — khớp 1 trong 2 là được hỏi. CTA lấy từ
`primaryAction()`, chip góp ý từ `noteContextsForPlace()` — cả hai cũng khai theo family rồi
mới override theo subtype. Để `transportSubtype` rỗng thì mọi thứ chạy y như trước khi có nó.

**Quy tắc:** id câu hỏi phải DUY NHẤT trong toàn `lib/questions.js`, kể cả khác `scope` —
`getQuestion(id)` lấy câu đầu tiên khớp id, trùng id là phiếu bị kiểm tra nhầm bộ đáp án rồi
từ chối im lặng (đã dính 1 lần với `booking`, xem DECISIONS 2026-09-09).

**Quy tắc bất di bất dịch:** `priceText` không bao giờ nhận chữ gõ tay — luôn tính từ
`priceMin/priceMax/priceUnit` qua `formatPriceText()` (`lib/priceFormat.js`). Lý do ở
DECISIONS 2026-07-15.

---

## 3. Bản đồ file

```
web/
├── app/
│   ├── page.js              (64)  Trang chủ — đọc places:live + place_checkins:latest +
│   │                              place_answers:consensus, render PlaceExplorer
│   ├── gioi-thieu/page.js          Trang “CDP là gì?” đọc content an toàn từ Redis/fallback;
│   │                              mobile 1 cột, tablet 2 cột, desktop tối đa 6xl
│   ├── FirstVisitIntroCard.js      Card onboarding lần đầu; chỉ lưu trạng thái đóng ở
│   │                              localStorage, không tạo hồ sơ hay ghi Redis
│   ├── AppShell.js                 Shell public: sidebar desktop 248/72px, menu mobile,
│   │                              active state và PageTitle dùng chung navigation config
│   ├── SiteHeader.js               Header/menu mobile; desktop ẩn để dùng sidebar AppShell
│   ├── SiteFooter.js               Footer toàn site: link giới thiệu + cách cập nhật dữ liệu
│   ├── PlaceExplorer.js    (632)  ⭐ Client component: bộ lọc, tìm kiếm, card 2 lớp,
│   │                              gallery ảnh, dòng "còn mở" (Chặng 1), khối hỏi + khối
│   │                              kết quả (Chặng 2), 4 nhóm loại + gate nhãn còn chỗ
│   │                              (Chặng 3). Nơi nặng nhất của giao diện khách
│   ├── MediaImage.js              Wrapper `next/image` dùng chung: responsive `srcset`,
│   │                              `sizes` theo vị trí và lazy load mặc định
│   ├── ContributionPanel.js(564)  ⭐ Luồng góp ý: báo sai, gửi ảnh, đặt biệt danh,
│   │                              mã khôi phục, chọn lĩnh vực, hiện huy hiệu. Export
│   │                              STORAGE_KEY/loadLocalContributor/saveLocalContributor
│   │                              để CheckinButton.js + QuestionPrompt.js dùng chung
│   │                              1 hồ sơ ẩn danh; sau báo đóng cửa có thể mở form đề xuất
│   │                              địa điểm thay thế cùng vị trí
│   ├── contributionActions.js(155) Server Action nhận góp ý và proposal thay thế; luôn đọc
│   │                              lại vị trí record cũ ở server, không tin field vị trí client
│   ├── CheckinButton.js     (68)  Chặng 1: nút "Tôi vừa đến, vẫn mở"
│   ├── checkinActions.js    (48)  Server Action cho CheckinButton — gọi lib/checkins.js
│   │                              + lib/contributors.js + lib/pointsCap.js (trần chung
│   │                              30đ/ngày, thêm ở Chặng 2)
│   ├── QuestionPrompt.js   (152)  Chặng 2: khối hỏi 1 câu bấm chọn tại 1 thời điểm.
│   │                              Bỏ qua câu mà khối Mẹo đang bày sẵn (tránh hỏi 2 lần)
│   ├── PlacePicker.js      (240)  ⭐ Bộ chọn địa điểm DÙNG CHUNG — "Tạo lộ trình từ đây" và
│   │                              "+ Thêm địa điểm". Tìm + lọc + chọn NHIỀU, selection giữ
│   │                              nguyên qua mọi lần đổi ô tìm/bộ lọc (NOTE-07 §3, §13)
│   ├── ProposePlaceForm.js (140)  Form đề xuất địa điểm mới — nói rõ "vào lộ trình ngay,
│   │                              chưa vào danh bạ tới khi CDP duyệt"
│   ├── CreateRouteFromPlace.js (60) Nút "Tạo lộ trình từ đây" trên thẻ + trang địa điểm
│   ├── StopBadge.js         (25)  Nhãn "CDP chưa xác minh" / "Điểm riêng" — nền trung tính,
│   │                              KHÔNG cảnh báo đỏ (NOTE-07 §9)
│   ├── QuestionOptions.js   (95)  ⭐ Bộ nút đáp án của 1 câu hỏi — DÙNG CHUNG cho
│   │                              QuestionPrompt (hỏi tuần tự cuối thẻ) và NoteInput
│   │                              (khách tự chọn ngữ cảnh). Ô gõ làm rõ chỉ hiện khi
│   │                              đáp án cần (NOTE-04 §4)
│   ├── PlaceFacts.js        (41)  Chặng 2: khối hiển thị kết quả đã đồng thuận (thuần
│   │                              server, không "use client")
│   ├── answerActions.js     (54)  Server Action cho QuestionPrompt — gọi lib/answers.js
│   ├── occupancy.js         (29)  Nhãn "còn chỗ" 3 mức — suy theo LỊCH, không theo dữ liệu
│   ├── BadgeIcon.js        (136)  SVG huy hiệu theo bậc
│   ├── layout.js            (29)
│   ├── le-hoi-thanh-tuyen/page.js (173)  Bài viết lễ hội (nội dung tĩnh) + MỘT khối game
│   │                              `GameEntryCard` ngay dưới tiêu đề (ẩn nếu Redis lỗi). Cổng vào game
│   │                              kiểu banner nằm ở TRANG CHỦ: `_game/HomeGameEntry.js` (server, bộ đệm
│   │                              20s) → `_game/HomeGameDock.js` (thẻ nổi mép phải, thu gọn/ẩn hôm nay)
│   ├── [eventSlug]/page.js         ⭐ Game layer: route CHUNG mọi mùa, ở TẦNG GỐC
│   │                              (`/san-den-thanh-tuyen-2026` — đổi 2026-09-16, link cũ `/cham/...`
│   │                              chuyển hướng 308 trong `next.config.mjs`). `?bao=1` mở sẵn bảng báo.
│   │                              Route tĩnh luôn thắng route động này; slug lạ → 404 không gọi Redis
│   ├── gameActions.js              Server Action game: báo sighting (tạo hồ sơ ẩn danh im
│   │                              lặng), thêm ảnh, báo sai vị trí, tải snapshot/người chơi
│   ├── _game/                      Component game (thư mục `_` = không thành route):
│   │                              PreGameSheet (câu đùa trước giờ rước, đếm lần thử ở localStorage) ·
│   │                              GameExperience (4 tab + CTA đáy) · GameMap (MapLibre, marker
│   │                              + chế độ ghim) · ReportSheet (3 bước) · SuccessSheet · ObjectSheet
│   │                              · GameViews · GameProgress · ObjectIcon · BottomSheet · gameSound
│   ├── admin/game/                 Ghép bí ẩn, đặt tên/sửa/ẩn mô hình, duyệt ảnh, xoá lượt báo
│   ├── AddToNotebook.js   (156)  Chặng 4: nút "+ Thêm vào sổ" trên thẻ — chưa có sổ nào thì
│   │                              tự tạo luôn, có rồi thì hiện menu chọn
│   ├── PhoneBlock.js      (139)  Khối "Liên hệ": số dạng chữ + nhãn xác nhận + nút Gọi /
│   │                              Tìm số trên Google / Số đúng / Số sai (NOTE-01 §6)
│   ├── phoneActions.js     (44)  Server Action cho PhoneBlock — gọi lib/phoneConfirmations.js
│   ├── SharePlaceButton.js (38)  Nút "Chia sẻ" trên thẻ — luôn trỏ /dia-diem/{id}, KHÔNG
│   │                              mượn link sổ (NOTE-02 §1)
│   ├── PlaceDetail.js     (218)  ⭐ Nội dung trang một địa điểm (client) — bố cục phẳng,
│   │                              KHÔNG bọc card như trang chủ (NOTE-02 §10)
│   ├── dia-diem/[id]/page.js (78) Trang một địa điểm — Server Component để generateMetadata
│   │                              (Open Graph) chạy được khi share ra Zalo/Facebook
│   ├── NotebookOwnerActions.js(59) Chặng 4: đáy trang xem sổ — "Lưu sổ này thành sổ của tôi"
│   ├── NotebookViewTracker.js(19) Chặng 4: không render gì, chỉ báo lượt xem thật (client,
│   │                              né bot Zalo/Facebook quét link — xem §2)
│   ├── notebookActions.js  (106)  Server Action cho cả cụm sổ — gọi lib/notebooks.js
│   ├── so/
│   │   ├── page.js          (70)  Chặng 4: "Sổ của tôi" — Client Component (cần anonId
│   │   │                          ngay từ đầu, Server Component không đọc được localStorage)
│   │   ├── [slug]/
│   │   │   ├── page.js     (117)  Chặng 4: trang xem sổ — Server Component thật (để
│   │   │   │                      generateMetadata/Open Graph chạy được), phải mở được
│   │   │   │                      không cần đăng nhập, không cần localStorage
│   │   │   └── sua/page.js (251)  Chặng 4: trang sửa sổ — Client Component, tự kiểm tra
│   │   │                          đúng chủ sổ qua Server Action, không phải chủ thì điều
│   │   │                          hướng về trang xem
│   ├── admin/
│   │   ├── page.js         (497)  ⭐ Trang duyệt: đăng nhập, sửa live, duyệt hàng chờ,
│   │   │                          duyệt góp ý khách, dán báo cáo routine. 3 form chọn
│   │   │                          loại đọc từ lib/placeTypes.js (Chặng 3); mục thống kê
│   │   │                          sổ chia sẻ (Chặng 4); sửa lịch bài lễ hội
│   │   ├── FestivalEventsManager.js Giao diện gấp/mở từng mốc để sửa hoặc thêm mốc
│   │   ├── festivalEventActions.js Server Action lưu lịch, bắt buộc kiểm tra phiên admin
│   │   ├── content-inbox/page.js   Nhận URL/nội dung copy và hiện preview phân tích
│   │   ├── content-inbox/actions.js Xác thực admin, phân tích rồi ghi/cập nhật Content Inbox
│   │   ├── gioi-thieu/page.js     Editor chữ thuần cho các block cố định của trang Giới thiệu
│   │   ├── gioi-thieu/actions.js  Xác thực admin, kiểm tra schema rồi lưu site_content:about
│   │   ├── navigation/page.js     Sửa nhãn, tiêu đề, bật/tắt và thứ tự menu; route chỉ đọc
│   │   ├── navigation/actions.js  Xác thực + dựng lại key/href cố định rồi lưu config
│   │   ├── actions.js      (129)  Server Action: đăng nhập/xuất, sửa/xoá/thêm chỗ (xoá
│   │   │                          chỗ cũng dọn field trong place_checkins:latest và
│   │   │                          place_answers:consensus/votes)
│   │   ├── reviewActions.js(138)  Duyệt/từ chối hàng chờ tự động
│   │   ├── suggestionActions.js(87) Duyệt góp ý khách + cộng điểm
│   │   ├── MediaManager.js         Admin upload nhiều ảnh, preview, caption, lên/xuống,
│   │   │                          chọn bìa/dẫn đường và gỡ ảnh khỏi địa điểm
│   │   ├── ClosedPlacesManager.js  Danh sách tombstone + URL cũ; tạo proposal địa điểm mới
│   │   │                          cùng vị trí vào hàng chờ bình thường, không public thẳng
│   │   ├── mediaActions.js         Server Action media; kiểm tra phiên, chỉ cho sửa media
│   │   │                          đang thuộc đúng địa điểm
│   │   ├── ingestPasteActions.js(50) Xử lý báo cáo routine dán tay
│   │   ├── IngestPasteBox.js (77)
│   │   ├── mergeActions.js  (200)  Gộp 2 chỗ trùng lặp — dùng chung cho 2 nguồn (khách báo
│   │   │                          + AI quét phát hiện, xem §6). Nhánh khách báo xoá dữ liệu
│   │   │                          thật, LUÔN cần admin tự bấm xác nhận, không có đường
│   │   │                          tự động. Cũng có confirmSuggestionNotDuplicate (nhớ 2 chỗ
│   │   │                          khác nhau, dùng chung confirmed_distinct_pairs với AI quét)
│   │   └── MergeDuplicatePanel.js(343) Giao diện so sánh 2 cột + chọn giữ trường nào — 1
│   │                              component dùng chung 2 mode ("suggestion"/"reviewItem")
│   └── api/
│       ├── track/route.js            Nhận đợt sự kiện ẩn danh (NOTE-08), gói sai/bot → 204 im lặng
│       ├── ingest/submit/route.js    Nhận dữ liệu quét từ ngoài (bảo vệ bằng CRON_SECRET)
│       └── cron/daily-ingest/route.js Vercel Cron 1:30 UTC (hiện gần như không dùng)
│
├── lib/
│   ├── redis.js             (29)  Kết nối Redis + đọc/ghi places:live, places:pending
│   ├── aboutPage.js                Default NOTE-08 + schema/giới hạn + đọc/ghi content Giới thiệu
│   ├── navigation.js              Definition route cố định + kiểm tra/đọc/ghi menu và pageTitle
│   ├── postEvents.js              Đọc/ghi `post_events:{slug}`; kiểm tra khuôn và tự rơi về
│   │                              lịch trong file nếu Redis trống/hỏng/tạm lỗi
│   ├── postEventForm.js           Đọc + kiểm tra form lịch; gắn múi giờ Việt Nam `+07:00`
│   ├── contentInbox.js            Nhận dạng URL/text, giới hạn đầu vào, đọc/ghi Inbox
│   ├── contentAnalyzer.js         Đọc nguồn công khai an toàn, extract + so lịch sơ bộ
│   ├── placeTypes.js        (39)  ⭐ Chặng 3: nguồn duy nhất cho 4 loại địa điểm
│   │                              (an/choi/ngu/dilai) — ném lỗi rõ ràng nếu giá trị lạ,
│   │                              không âm thầm quy về "ngu" như trước
│   ├── checkins.js          (65)  Chặng 1: place_checkins:latest (hash) + khoá 24h +
│   │                              trần điểm/ngày — 3 lệnh Redis nguyên tử, không đọc-
│   │                              sửa-ghi cả mảng (xem §2)
│   ├── questions.js        (302)  Chặng 2 + 3: định nghĩa bộ câu hỏi (19 câu, đủ 4 loại)
│   ├── answers.js          (239)  ⭐ Chặng 2: ghi phiếu, tính đồng thuận (trọng số theo
│   │                              tuổi), thưởng điểm hồi tố, chọn câu để hỏi. Ô gõ điều
│   │                              kiện áp lib/textFilter.js (vá thiếu sót Chặng 2, làm ở
│   │                              Chặng 4) — file lõi nặng nhất của Chặng 2
│   ├── pointsCap.js         (27)  Trần CHUNG 30 điểm/ngày, dùng chung mọi nguồn điểm kể
│   │                              cả checkin (Chặng 1) — không thay thế trần riêng từng nơi
│   ├── locationVotes.js    (268)  ⭐ Cộng đồng xác nhận VỊ TRÍ (16/9): phiếu 1 người/1 chỗ,
│   │                              gom cụm 40m, ≥2 người là dẫn đường được, hai cụm bằng nhau
│   │                              thì không tự chọn. KHÔNG ghi đè places:live — xem §2
│   ├── notebooks.js        (215)  ⭐ Chặng 4: tạo/sửa sổ, sinh slug 8 ký tự (SET NX chống
│   │                              trùng), tra places:live 1 lần rồi ghép vào items, đếm
│   │                              view/copy — file lõi nặng nhất của Chặng 4
│   ├── textFilter.js        (15)  Chặn link/số điện thoại trong ô gõ ngắn — dùng chung
│   │                              cho ghi chú trong sổ (Chặng 4) và ô gõ điều kiện của
│   │                              câu hỏi bấm chọn (Chặng 2)
│   ├── mapsUrl.js            (4)  Link "Chỉ đường" ra Google Maps — tách khỏi
│   │                              PlaceExplorer.js để trang sổ (Server Component) dùng
│   │                              chung, không import từ file "use client"
│   ├── placeForm.js         (33)  Đọc dữ liệu chỗ từ <form> — dùng chung cả 3 nơi nhập.
│   │                              type ném lỗi qua assertValidPlaceType (Chặng 3)
│   ├── priceFormat.js       (35)  Định dạng/tách giá
│   ├── placeSearch.js       (27)  Dò tên chỗ gần giống trong places:live — dùng cho công
│   │                              cụ gộp trùng lặp (mergeActions.js), tự viết riêng, không
│   │                              dùng chung logic với lib/ingestion/match.js (khác dữ liệu)
│   ├── adminAuth.js         (43)  Mật khẩu admin + cookie phiên ký HMAC (TTL 7 ngày)
│   ├── badges.js           (167)  10 lĩnh vực × 5 bậc, ngưỡng điểm 0/5/20/50/100
│   ├── contributors.js     (120)  Hồ sơ ẩn danh, mã khôi phục, cộng điểm
│   ├── suggestions.js       (58)  Hàng chờ góp ý + chặn gửi trùng ăn điểm
│   ├── closedPlaces.js             Hash `places:closed`: archive nguyên record trước khi gỡ
│   │                              live, đọc tombstone/quan hệ replacement; suy ra báo đóng
│   │                              cửa legacy lúc đọc, không migration
│   ├── media.js                    Chuẩn hoá schema media cũ/mới, role, order và fallback
│   │                              cover/navigation; chỉ `withPlaceMedia()` mới ghi schema mới
│   ├── mediaStorage.js             Interface upload/delete/public URL + sinh storage key;
│   │                              domain không biết provider đang dùng
│   ├── media-storage/vercelBlob.js Adapter duy nhất được import `@vercel/blob`
│   ├── mediaProcessing.js          Server validate ≤8MB/file, xoay/resize ≤1600px,
│   │                              chuyển WebP bằng Sharp và tính hash nội dung
│   ├── clientImageCompression.js   Nén trước ở trình duyệt để giảm request; khách tối đa
│   │                              5 ảnh/lần, Admin tối đa 10 ảnh/lần
│   ├── phoneConfirmations.js(106) Xác nhận số điện thoại: place_phone_confirmations:{placeId},
│   │                              field "{số đã chuẩn hoá}:{anonId}" — đổi số thì phiếu cũ
│   │                              tự hết hiệu lực (NOTE-01 §6.4)
│   ├── cover.js             (44)  ⭐ Chọn ảnh bìa dùng chung: placeCover() ưu tiên
│   │                              role `cover`, rồi ảnh đầu theo `order`; notebookCover()
│   │                              theo thứ tự cover sổ → collage 3 chỗ đầu → cover chỗ đầu
│   │                              → ảnh mặc định. Gom về đây để thẻ / trang địa điểm /
│   │                              Open Graph luôn hiện CÙNG một ảnh
│   ├── transport.js        (185)  ⭐ Taxonomy Đi lại: 4 family × 11 subtype. Family là lớp
│   │                              NỀN cho câu hỏi/chip/CTA, subtype chỉ override.
│   │                              transportSummary() -> "Taxi · 4 chỗ · 7 chỗ";
│   │                              transportDetailLine() -> tuyến chính hoặc khu vực phục vụ;
│   │                              primaryAction() -> CTA; contributionPrompt() -> danh xưng;
│   │                              vehicleTypesOf() -> loại xe (đọc được cả ô chữ tự do cũ);
│   │                              adminFilledFields() -> ô admin đã điền thì thôi hỏi khách
│   │                              (NOTE-04 §1–§2, NOTE-05 §2/§6/§9, NOTE-06 §1/§8/§10)
│   ├── proposals.js        (140)  ⭐ Địa điểm khách ĐỀ XUẤT khi dựng lộ trình hoặc thay chỗ
│   │                              đã đóng (NOTE-07 §6.B, NOTE-12 §16–§18).
│   │                              `place_proposals:queue` (hàng chờ admin) +
│   │                              `place_proposals:index` (bảng tra lúc hiển thị). Duyệt/từ
│   │                              chối chỉ đổi bảng tra — KHÔNG ghi lại route nào. Proposal
│   │                              thay thế có `replacesPlaceId`; duyệt mới nối tombstone
│   ├── placeTextSearch.js   (50)  Tìm theo tên/địa chỉ + nhóm từ đồng nghĩa — DÙNG CHUNG cho
│   ├── placeReliability.js        Xếp theo xác nhận mới → độ đầy đủ → xác nhận cũ;
│   │                              confidence/số nguồn chỉ là tín hiệu phá hoà cuối
│   │                              bộ lọc trang chủ và PlacePicker
│   ├── routes.js           (330)  ⭐ Lộ trình — thực thể RIÊNG, không phải trạng thái của Sổ
│   │                              (CDP_P1-P8 §P4). `route:{slug}` + `routes:by-owner:{anonId}`.
│   │                              Mỗi điểm: giờ dự kiến · thời lượng · ghi chú chặng, và có
│   │                              thể là điểm TỰ ĐẶT TÊN thay vì địa điểm CDP (khi đó thêm
│   │                              `customAddress` + `customProvince` — CHỈ để Google tra,
│   │                              không hiện thay tên).
│   │                              MỘT CHỖ ĐƯỢC PHÉP NẰM NHIỀU LẦN trong cùng lộ trình; điểm
│   │                              dừng nhận diện bằng VỊ TRÍ trong mảng, không bằng placeId.
│   │                              `replaceStop()` = đổi chỗ TẠI VỊ TRÍ, giữ giờ/thời lượng/
│   │                              ghi chú (thuộc về chặng, không thuộc về địa điểm)
│   ├── durationFormat.js    (37)  Viết thời lượng thành tiếng Việt đọc được: "Ở đây khoảng 4
│   │                              tiếng" (dừng lại) vs "Di chuyển khoảng 25 phút" (đi đường).
│   │                              Vẫn LƯU bằng phút, chỉ đổi lúc hiển thị
│   ├── mapsUrl.js           (85)  Chuỗi tra Google Maps: luôn kèm địa chỉ + gắn TỈNH nếu chưa
│   │                              có. Địa điểm CDP và đề xuất -> Tuyên Quang; ĐIỂM RIÊNG ->
│   │                              tỉnh khách CHỌN (nhà khách có thể ở tỉnh khác).
│   │                              `stopMapsQuery()` dùng CHUNG cho trang lộ trình và bản chụp
│   ├── events.js           (130)  ⭐ Mốc thời gian của Post (CDP_P1-P8 §P1) — trạng thái tính
│   │                              theo giờ Asia/Ho_Chi_Minh, KHÔNG theo giờ máy chủ. Dùng
│   │                              chung cho mọi Post, không dính Trung thu
│   ├── postEvents/                Dữ liệu lịch từng bài, tách hẳn khỏi giao diện
│   │   └── le-hoi-thanh-tuyen-2026.js  11 mốc + PLAN_TEMPLATE (khung Interactive Plan)
│   ├── game/                      ⭐ Game layer primitive (NOTE-03/04). Thuần = client dùng được:
│   │   ├── registry.js            Event: đăng ký mùa, pha upcoming/live/ended
│   │   ├── seasons/thanh-tuyen-2026.js  Cấu hình mùa (copy, bản đồ, category, điểm tổ chức
│   │   │                          `venues` lấy từ OSM, seed object)
│   │   ├── venues.js              Venue → GeoJSON, điểm đặt nhãn, khung bao để căn bản đồ.
│   │   │                          `kind: "area"` vẽ vùng, `"route"` vẽ tuyến; thêm `dashed: true`
│   │   │                          thì tuyến vẽ NÉT ĐỨT (đường đoàn đi qua, khác chỗ đứng xem)
│   │   ├── catalog.js             Object: chuẩn hoá + fallback tên/icon, gộp seed + Redis, ghép
│   │   ├── progress.js            Tiến độ cá nhân/cộng đồng (đã quy alias)
│   │   ├── badge.js               Huy hiệu sưu tập (NOTE-07): khung theo nhóm + 1 hình hero + trạng
│   │   │                          thái → chuỗi HTML dùng chung React/marker/admin — thuần
│   │   ├── iconArt.js             SINH TỰ ĐỘNG bởi scripts/game-icons/build.mjs — hình game-icons.net
│   │   │                          (CC BY 3.0, ghi công). iconArtCustom.js = hình CDP tự vẽ
│   │   ├── sounds.js              Sound identity (NOTE-06): công thức lớp theo soundKey/soundFamily,
│   │   │                          âm sự kiện, thời lượng — thuần; bộ phát ở app/_game/gameSound.js
│   │   ├── soundSamples.js        SINH TỰ ĐỘNG bởi scripts/game-sounds/build.mjs — file .m4a CC0 +
│   │   │                          nguồn/giấy phép. Đừng sửa tay
│   │   ├── collections.js         Bộ sưu tập theo luật tag, bộ ẩn, combo, milestone, độ hiếm theo
│   │   │                          đêm, thống kê cuối đêm (NOTE-05) — thuần
│   │   ├── quests.js              Nhiệm vụ tự sinh từ data gap (thiếu ảnh/vị trí lệch/chưa tên)
│   │   ├── mapLayer.js            Gom sighting → marker công khai + mức tin cậy
│   │   ├── mapStyle.js            Tile OpenFreeMap "liberty" + chỉnh màu/nhãn tiếng Việt lúc tải,
│   │   │                          dự phòng tile OSM
│   │   ├── geo.js · format.js     Khoảng cách/khung tỉnh · "X phút trước", tìm không dấu
│   │   └── store.js               (server) Redis: ghi sighting nguyên tử, snapshot, admin
│   ├── provinces.js         (60)  34 tỉnh/thành (sắp xếp 01/7/2025) cho ô chọn của điểm riêng;
│   │                              mặc định + fallback là Tuyên Quang
│   ├── routeShare.js        (95)  ⭐ Chia sẻ bằng BẢN CHỤP (§P6) — `route_share:{token}` đóng
│   │                              băng nội dung lúc bấm. Sửa/xoá lộ trình gốc thì link đã gửi
│   │                              vẫn mở đúng thứ được gửi
│   ├── siteUrl.js           (17)  Hằng số tên miền chính + placeShareUrl/notebookShareUrl —
│   │                              mọi link ĐEM ĐI CHIA SẺ dựng từ đây, không dùng
│   │                              window.location.origin (sẽ mang địa chỉ đang mở)
│   └── ingestion/
│       ├── schema.js        (72)  ⭐ Hằng số + JSDoc định nghĩa shape dữ liệu
│       ├── normalize.js     (87)  Chuẩn hoá bản ghi thô về NormalizedPlace. category_primary
│       │                          ném lỗi qua assertValidPlaceType (Chặng 3)
│       ├── match.js        (157)  So khớp với chỗ đã có, phát hiện nghi trùng; guard hồ sơ đã
│       │                          đóng cho đường công khai ngoài crawler (matchPlaceAgainstClosedPlaces)
│       ├── sourceSignals.js       NOTE-14: trạng thái kinh doanh, toạ độ, providerMeta.google từ nguồn
│       ├── closedHold.js          NOTE-14: tạo closed_place_match khi Admin công khai trùng chỗ đã đóng
│       ├── ingestBatch.js  (231)  ⭐ Hàm trung tâm — MỌI nguồn dữ liệu đều đi qua đây. Bắt
│       │                          riêng InvalidPlaceTypeError để bỏ 1 bản ghi hỏng, không
│       │                          làm hỏng cả lô (Chặng 3)
│       ├── toLivePlace.js   (53)  Chuyển candidate → shape places:live
│       ├── store.js         (80)  Đọc/ghi các key ingestion:*
│       ├── runDailyIngest.js(141)
│       └── sources/         githubScanSource.js · inboxSource.js · index.js
│
└── scripts/
    ├── export-known-places.mjs   Xuất data/known-places-snapshot.json (chạy tay)
    ├── run-daily-ingest.mjs      Chạy pipeline thủ công
    ├── seed-redis.mjs
    ├── backfill-price-unit.mjs
    ├── game-icons/               Lấy hình hero huy hiệu (NOTE-07): icons.json (tên → tác giả) + build.mjs
    └── game-sounds/              Dựng âm thanh game (NOTE-06, chạy tay trên Mac cần afconvert):
        ├── sources.json          Mẫu CC0 Freesound: nguồn, tác giả, giấy phép, đoạn cắt
        └── build.mjs             Tải → cắt → chuẩn hoá âm lượng → AAC → public/game-sounds/
```

**Ba file quan trọng nhất nếu chỉ đọc được 3:** `lib/ingestion/ingestBatch.js` ·
`app/PlaceExplorer.js` · `app/admin/page.js`.

---

## 4. Luồng dữ liệu

### A. AI quét hằng ngày → lên web (tự động hoàn toàn từ 2026-08-04)

```
8h sáng: claude.ai routine tự tìm kiếm web
   ↓ curl PUT (GitHub Contents API + Personal Access Token)
data/pending-scan.json trên GitHub  ← file thay đổi thì kích hoạt bước sau
   ↓
GitHub Action .github/workflows/ingest-from-scan.yml  (chạy trên hạ tầng GitHub)
   ↓ POST + Bearer CRON_SECRET
/api/ingest/submit
   ↓
ingestBatch()  ← normalize → match → phân loại
   ↓
├─ Chỗ mới / có thay đổi / tin cậy thấp  → GHI THẲNG vào places:live (tự công khai)
└─ Nghi trùng (duplicate_candidate)      → ingestion:review_queue, chờ admin
   hoặc mâu thuẫn (conflict_detected)
   ↓
Action tự dọn pending-scan.json về rỗng
```

**Vì sao vòng vèo qua GitHub:** môi trường cloud của routine **chặn gọi ra mọi domain trừ
GitHub**. Đã thử 3 hướng khác đều thất bại — chi tiết ở DECISIONS 2026-07-15, 07-17, 08-04.

**Quy tắc quan trọng:** mọi nguồn dữ liệu (routine tự động · dán tay trong `/admin` · chạy
script) đều gọi **cùng một hàm `ingestBatch()`**. Không viết logic lọc trùng riêng ở bất kỳ
đâu khác.

### B. Khách góp ý → lên web (luôn phải duyệt)

```
Khách bấm "Bổ sung thông tin" trong card (ContributionPanel.js)
   ↓
├─ Sửa thông tin  → Server Action contributionActions.js
└─ Gửi tối đa 5 ảnh/lần
   → nén trước ở trình duyệt
   → server kiểm tra loại/≤8MB, resize ≤1600px, chuyển WebP
   → mediaStorage.uploadMedia() → Vercel Blob cdp-photos
   ↓
user_suggestions (mỗi ảnh là 1 phiếu `media` đang chờ duyệt) ← chặn hash trùng để ăn điểm
   ↓  admin duyệt trong /admin, mục "Góp ý từ khách"
places:live.media[] được cập nhật  +  cộng điểm (sửa +5, ảnh +10)
```

Nhánh đóng cửa + địa điểm thay thế (NOTE-12) vẫn đi qua người duyệt:

```
Khách báo đóng cửa → user_suggestions → Admin duyệt
   ↓ archive nguyên record vào places:closed (hash) TRƯỚC khi gỡ live
   ↓ gỡ khỏi places:live; URL /dia-diem/{id-cũ} hiện closed, không 404
   ↓ User/Admin có thể tạo proposal mới cùng vị trí
place_proposals:queue → Admin duyệt
   ↓ tạo live place MỚI; chỉ reuse location
old.replacedByPlaceId ↔ new.replacesPlaceId
```

Không mutate record cũ thành chỗ mới và không kế thừa ảnh/giá/note/confirmation. Bốn báo
cáo đóng cửa lịch sử được `closedPlaces.js` suy ra lúc đọc để URL cũ còn hoạt động; vì flow
cũ đã làm mất vị trí nên các tombstone này chỉ hiện dữ liệu còn thật, không tự đoán.

Admin có thể tải tối đa 10 ảnh/lần qua `MediaManager`. Upload lỗi sau khi Blob đã nhận nhưng
trước khi Redis lưu sẽ chỉ xoá đúng file vừa tạo. Nút “Gỡ ảnh” hiện chỉ bỏ tham chiếu khỏi
địa điểm, chưa xoá Blob vật lý: `route_share:*` là snapshot đóng băng có thể còn tham chiếu
URL đó. Cleanup orphan an toàn cần reference index/dry-run và thuộc NOTE-11 P1.

### C. Khách xem web

```
places:live  →  app/page.js (force-dynamic, đọc mỗi lần tải)  →  PlaceExplorer.js
```

Không có cache, không có ISR — mỗi lần khách mở trang là một lần đọc Redis.

---

## 5. Đăng nhập & bảo mật (mức hiện tại)

- `/admin`: **một mật khẩu chung** (biến môi trường `ADMIN_PASSWORD`), so sánh bằng
  `crypto.timingSafeEqual`. Phiên là cookie `cdp_admin_session` ký HMAC, hạn 7 ngày.
  Cookie chỉ bật `secure` khi chạy production (đã từng gây lỗi không đăng nhập được ở local
  — xem ROADMAP Giai đoạn 5a).
- **Chưa có** tài khoản riêng từng người, phân quyền, khoá sau nhiều lần sai, 2FA. Đó là
  Giai đoạn 5b, chưa làm.
- `/api/ingest/submit`: bảo vệ bằng header `Authorization: Bearer <CRON_SECRET>`.
- Khách: **không có tài khoản**. Định danh bằng `anonId` lưu trong localStorage + mã khôi
  phục 6 số để lấy lại hồ sơ ở máy khác.

**Biến môi trường cần có** (đúng tên như trong `web/.env.local`):

`KV_REST_API_URL` · `KV_REST_API_TOKEN` · `KV_REST_API_READ_ONLY_TOKEN` · `KV_URL` ·
`REDIS_URL` · `ADMIN_PASSWORD` · `ADMIN_SESSION_SECRET` · `CRON_SECRET` ·
`BLOB_READ_WRITE_TOKEN`

Tuỳ chọn: `CDP_GAME_NAMESPACE` / `CDP_ANALYTICS_NAMESPACE` (chỉ server test, **không đặt trên
production**) · `CDP_ANALYTICS_DISABLED=1` (tắt ghi nhận hoạt động).

---

## 6. Những chỗ cần cẩn thận

**Không lồng `<form>` trong `<form>` trong `/admin`.** HTML không cho phép — bấm nút bên
trong sẽ bị chặn im lặng, không báo lỗi gì (chỉ thấy trong console trình duyệt: "cannot
contain a nested `<form>`"), rất dễ tưởng nhầm là bug ở chỗ khác. Đã dính lỗi này **2 lần**
khi thêm `MergeDuplicatePanel` (có `<form>` riêng) vào bên trong `SuggestionCard` và
`ReviewItemCard` (cả 2 vốn tự bọc `<form>` quanh toàn bộ thẻ). Cách sửa đã áp dụng cho cả 2:
đổi khung ngoài của card từ `<form>` sang `<div>`, chỉ bọc `<form>` quanh đúng cụm nút bấm
cần nó (thường là 2 nút Duyệt/Từ chối), các cụm nút/form khác (như panel gộp) làm `<form>`
riêng, độc lập, không lồng nhau.

**2 nguồn "nghi trùng lặp" khác nhau, dùng chung công cụ gộp nhưng khác nhánh xử lý** —
xem `app/admin/mergeActions.js` + `MergeDuplicatePanel.js` (mode `"suggestion"` vs
`"reviewItem"`): khách báo tay thì CẢ 2 chỗ đã công khai (gộp xong phải xoá 1 chỗ khỏi
`places:live`); AI quét phát hiện thì chỗ mới (candidate) **chưa từng lên web** (gộp xong chỉ
cập nhật chỗ đã có, không có gì để xoá). Nhầm 2 nhánh này sẽ gọi sai action hoặc xoá nhầm.

**Loại địa điểm — đã có 4 giá trị (Chặng 3, xong 2026-08-17).** `lib/placeTypes.js` là nguồn
duy nhất (`PLACE_TYPES`: `an`/`choi`/`ngu`/`dilai`). Giá trị lạ giờ **ném lỗi rõ ràng**
(`assertValidPlaceType`/`InvalidPlaceTypeError`), không còn âm thầm rơi về `"ngu"` như trước.
`lib/ingestion/ingestBatch.js` bắt riêng lỗi này để **bỏ qua đúng 1 bản ghi hỏng**, không làm
hỏng cả lô quét (đếm ở `summary.skippedInvalidType`). Thêm loại thứ 5 sau này: chỉ sửa
`lib/placeTypes.js` + thêm bộ câu hỏi tương ứng trong `lib/questions.js` — 6 file kia (form
nhập, bộ lọc, nhãn còn chỗ...) đều đọc từ `PLACE_TYPES`, không cần sửa thêm.

**Nhãn "còn chỗ" chỉ áp dụng cho Ăn/Ngủ (Chặng 3 §5).** `app/occupancy.js` bản thân không
đổi (vẫn suy theo **ngày giờ máy khách** so với mốc lễ hội viết cứng, không liên quan dữ liệu
thật) — chỗ đổi là `PlaceExplorer.js` giờ chỉ GỌI nó cho `type` trong `OCCUPANCY_LABEL_TYPES`
(`an`, `ngu`). Chơi/Đi lại không hiện nhãn này, nhưng vẫn có nút "Hôm nay vẫn mở" (Chặng 1,
áp dụng cho cả 4 loại). Việc "sang năm nhãn còn chỗ sai vì mốc lễ hội viết cứng" vẫn còn treo
— chưa giải quyết, xem SPEC-chang-1.md §5 và SPEC-chang-3.md §5.

**Ghi Redis không có khoá.** Mọi thao tác đều là đọc-cả-mảng → sửa → ghi-cả-mảng. Hai thao
tác cùng lúc thì thao tác sau đè thao tác trước. Đã biết và chấp nhận ở quy mô hiện tại
(admin duyệt từng cái một). **Nhưng Chặng 1–2 là thao tác của KHÁCH, nhiều người bấm cùng
lúc** — cần xử lý khác, không dùng lại kiểu đọc-sửa-ghi này cho phiếu bầu.

**Mảng phình vô hạn.** `places:live`, `contributors:all`, `user_suggestions` chưa có cơ chế
cắt bớt. Ở vài chục chỗ và vài trăm người thì không sao; cần để mắt khi lớn hơn.

**`data/known-places-snapshot.json` phải cập nhật thủ công.** Chỉ ảnh hưởng hiệu quả tìm
kiếm của routine (tránh tìm lại chỗ đã có), **không** ảnh hưởng việc chống đăng trùng —
việc đó nằm ở `ingestBatch()`.

**`AREA_PRESETS` trong `schema.js` — đã sửa 2026-08-17, giờ có 11 phường** (10 phường TP
Tuyên Quang cũ + "Bình Thuận" tên mới sau sáp nhập — xem DECISIONS.md). Địa chỉ ngoài danh
sách này không chuẩn hoá được về `ward`, và chỗ không có `ward` thì nhãn còn chỗ luôn về
"Chưa đủ dữ liệu". Chỉ dò theo **phường**, chưa mở rộng theo tên xã.

---

## 7. Bên ngoài repo

| Thứ | Ở đâu |
|---|---|
| Web đang chạy | https://web-five-xi-28.vercel.app |
| Trang duyệt | https://web-five-xi-28.vercel.app/admin |
| Mã nguồn | github.com/thangdzz/cdp-chamdiaphuong (Public) |
| Cơ sở dữ liệu | Upstash Redis qua Vercel Marketplace (gói miễn phí) |
| Ảnh | Vercel Blob, store `cdp-photos` (public) |
| Lịch quét | claude.ai routine, 8h sáng hằng ngày |
| Cron dự phòng | Vercel Cron → `/api/cron/daily-ingest`, 1:30 UTC (gần như không dùng) |
