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
- Ảnh khách gửi để ở **Vercel Blob** (store `cdp-photos`, public).
- Không có tài khoản người dùng. Người góp ý được định danh bằng **mã ẩn danh lưu trong
  localStorage**. `/admin` dùng **một mật khẩu chung** + cookie ký HMAC.
- Toàn bộ code web nằm trong thư mục `web/` (~3.900 dòng).

⚠️ **Cảnh báo về phiên bản Next.js:** `web/AGENTS.md` ghi rõ bản Next.js này có breaking
changes so với dữ liệu huấn luyện của model. **Đọc `node_modules/next/dist/docs/` trước khi
viết code Next.js.**

---

## 2. Kho dữ liệu — 14 key Redis

Tất cả đều là **một key = một mảng JSON**, **trừ `place_checkins:latest`** (Chặng 1) và
3 key của Chặng 2 (xem bên dưới) — dùng hash/string thay vì mảng.

### Dữ liệu địa điểm (`lib/redis.js`)

| Key | Chứa gì |
|---|---|
| `places:live` | **Các chỗ đang hiện trên web.** Trang chủ đọc thẳng key này |
| `places:pending` | Hàng chờ duyệt **thủ công** (người nhập tay qua `/admin`) |

### Pipeline AI quét dữ liệu (`lib/ingestion/store.js` — hằng số `KEYS`)

| Key | Chứa gì |
|---|---|
| `ingestion:review_queue` | Hàng chờ duyệt **tự động** — chỉ những ca nghi trùng/mâu thuẫn |
| `ingestion:review_events` | Nhật ký duyệt/từ chối |
| `ingestion:source_runs` | Lịch sử các lần quét (giữ 200 lần gần nhất) |
| `ingestion:place_snapshots` | Ảnh chụp dữ liệu từng lần quét (giữ 1000 bản gần nhất) |
| `ingestion:confirmed_distinct` | Các cặp chỗ **admin đã xác nhận là khác nhau** — để không hỏi lại (DECISIONS 2026-07-18) |

### Người góp ý

| Key | File | Chứa gì |
|---|---|---|
| `contributors:all` | `lib/contributors.js` | Hồ sơ ẩn danh: `anonId`, `nickname`, `recoveryCode` (6 số), `categoryId`, `points`, `legendaryBonus` |
| `user_suggestions` | `lib/suggestions.js` | Góp ý của khách (`type: "correction"` hoặc `"photo"`) chờ duyệt |

> ⚠️ Key này **không có tiền tố** (`user_suggestions`, không phải `suggestions:all`) — khác
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

**Vì sao đúng 3 lệnh Redis/lượt xem trang chủ dù bao nhiêu chỗ:** `places:live` (mảng) +
`place_checkins:latest` (`HGETALL`) + `place_answers:consensus` (`HGETALL`) — không lệnh nào
tăng theo số địa điểm. Việc "chọn câu nào để hỏi" (đọc phiếu + đồng thuận + phiếu "Không rõ"
của 1 chỗ cụ thể) chỉ chạy khi khách **bung 1 thẻ**, không chạy cho mọi chỗ lúc tải trang.

**Trọng số phiếu theo tuổi** (dưới 6 tháng = 1.0, 6–12 tháng = 0.5, trên 12 tháng = 0.1) —
cơ chế tự dọn rác, tính lúc chốt đồng thuận (mỗi lượt bấm), không cần cron riêng.

**Điểm chỉ cộng khi đồng thuận đạt ≥2 phiếu thật** (không phải theo trọng số) — phiếu đầu
tiên luôn ghi `weak: true` để hiển thị ngay (§3.3 SPEC), nhưng KHÔNG được cộng điểm cho tới
khi có phiếu thứ hai trùng. Cộng điểm hồi tố: khi đồng thuận vừa đạt, duyệt lại các phiếu
trùng đáp án thắng, phiếu nào chưa `awarded` thì cộng và đánh dấu — người bấm đầu tiên được
cộng đúng lúc người thứ hai bấm trùng, không phải lúc họ tự bấm.

### Hình dạng một chỗ trong `places:live`

Xem `lib/ingestion/toLivePlace.js` (`candidateToLivePlace`) và `lib/placeForm.js`:

```js
{
  id: "live-<uuid>",
  name, type: "an" | "choi" | "ngu" | "dilai", // xem lib/placeTypes.js
  address, ward, localArea, phone,
  priceMin, priceMax, priceUnit,
  priceText,                        // LUÔN tự tính, không nhận gõ tay
  confidenceScore, sourceCount,
  lastUpdatedAt, autoPublished
}
```

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
│   ├── PlaceExplorer.js    (632)  ⭐ Client component: bộ lọc, tìm kiếm, card 2 lớp,
│   │                              gallery ảnh, dòng "còn mở" (Chặng 1), khối hỏi + khối
│   │                              kết quả (Chặng 2), 4 nhóm loại + gate nhãn còn chỗ
│   │                              (Chặng 3). Nơi nặng nhất của giao diện khách
│   ├── ContributionPanel.js(564)  ⭐ Luồng góp ý: báo sai, gửi ảnh, đặt biệt danh,
│   │                              mã khôi phục, chọn lĩnh vực, hiện huy hiệu. Export
│   │                              STORAGE_KEY/loadLocalContributor/saveLocalContributor
│   │                              để CheckinButton.js + QuestionPrompt.js dùng chung
│   │                              1 hồ sơ ẩn danh
│   ├── contributionActions.js(155) Server Action nhận góp ý từ ContributionPanel
│   ├── CheckinButton.js     (68)  Chặng 1: nút "Tôi vừa đến, vẫn mở"
│   ├── checkinActions.js    (48)  Server Action cho CheckinButton — gọi lib/checkins.js
│   │                              + lib/contributors.js + lib/pointsCap.js (trần chung
│   │                              30đ/ngày, thêm ở Chặng 2)
│   ├── QuestionPrompt.js   (179)  Chặng 2: khối hỏi 1 câu bấm chọn tại 1 thời điểm
│   ├── PlaceFacts.js        (41)  Chặng 2: khối hiển thị kết quả đã đồng thuận (thuần
│   │                              server, không "use client")
│   ├── answerActions.js     (54)  Server Action cho QuestionPrompt — gọi lib/answers.js
│   ├── occupancy.js         (29)  Nhãn "còn chỗ" 3 mức — suy theo LỊCH, không theo dữ liệu
│   ├── BadgeIcon.js        (136)  SVG huy hiệu theo bậc
│   ├── layout.js            (29)
│   ├── le-hoi-thanh-tuyen/page.js (173)  Bài viết lễ hội (nội dung tĩnh)
│   ├── admin/
│   │   ├── page.js         (469)  ⭐ Trang duyệt: đăng nhập, sửa live, duyệt hàng chờ,
│   │   │                          duyệt góp ý khách, dán báo cáo routine. 3 form chọn
│   │   │                          loại đọc từ lib/placeTypes.js (Chặng 3)
│   │   ├── actions.js      (129)  Server Action: đăng nhập/xuất, sửa/xoá/thêm chỗ (xoá
│   │   │                          chỗ cũng dọn field trong place_checkins:latest và
│   │   │                          place_answers:consensus/votes)
│   │   ├── reviewActions.js(138)  Duyệt/từ chối hàng chờ tự động
│   │   ├── suggestionActions.js(87) Duyệt góp ý khách + cộng điểm
│   │   ├── ingestPasteActions.js(50) Xử lý báo cáo routine dán tay
│   │   └── IngestPasteBox.js (77)
│   └── api/
│       ├── ingest/submit/route.js    Nhận dữ liệu quét từ ngoài (bảo vệ bằng CRON_SECRET)
│       └── cron/daily-ingest/route.js Vercel Cron 1:30 UTC (hiện gần như không dùng)
│
├── lib/
│   ├── redis.js             (29)  Kết nối Redis + đọc/ghi places:live, places:pending
│   ├── placeTypes.js        (39)  ⭐ Chặng 3: nguồn duy nhất cho 4 loại địa điểm
│   │                              (an/choi/ngu/dilai) — ném lỗi rõ ràng nếu giá trị lạ,
│   │                              không âm thầm quy về "ngu" như trước
│   ├── checkins.js          (65)  Chặng 1: place_checkins:latest (hash) + khoá 24h +
│   │                              trần điểm/ngày — 3 lệnh Redis nguyên tử, không đọc-
│   │                              sửa-ghi cả mảng (xem §2)
│   ├── questions.js        (302)  Chặng 2 + 3: định nghĩa bộ câu hỏi (19 câu, đủ 4 loại)
│   ├── answers.js          (228)  ⭐ Chặng 2: ghi phiếu, tính đồng thuận (trọng số theo
│   │                              tuổi), thưởng điểm hồi tố, chọn câu để hỏi — file lõi
│   │                              nặng nhất của Chặng 2
│   ├── pointsCap.js         (27)  Trần CHUNG 30 điểm/ngày, dùng chung mọi nguồn điểm kể
│   │                              cả checkin (Chặng 1) — không thay thế trần riêng từng nơi
│   ├── placeForm.js         (33)  Đọc dữ liệu chỗ từ <form> — dùng chung cả 3 nơi nhập.
│   │                              type ném lỗi qua assertValidPlaceType (Chặng 3)
│   ├── priceFormat.js       (35)  Định dạng/tách giá
│   ├── adminAuth.js         (43)  Mật khẩu admin + cookie phiên ký HMAC (TTL 7 ngày)
│   ├── badges.js           (167)  10 lĩnh vực × 5 bậc, ngưỡng điểm 0/5/20/50/100
│   ├── contributors.js     (120)  Hồ sơ ẩn danh, mã khôi phục, cộng điểm
│   ├── suggestions.js       (58)  Hàng chờ góp ý + chặn gửi trùng ăn điểm
│   └── ingestion/
│       ├── schema.js        (72)  ⭐ Hằng số + JSDoc định nghĩa shape dữ liệu
│       ├── normalize.js     (87)  Chuẩn hoá bản ghi thô về NormalizedPlace. category_primary
│       │                          ném lỗi qua assertValidPlaceType (Chặng 3)
│       ├── match.js        (157)  So khớp với chỗ đã có, phát hiện nghi trùng
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
    └── backfill-price-unit.mjs
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
└─ Gửi ảnh (tự nén ở trình duyệt: ≤1600px, JPEG 82%) → Vercel Blob cdp-photos
   ↓
user_suggestions (chờ duyệt)  ← chặn gửi trùng để ăn điểm
   ↓  admin duyệt trong /admin, mục "Góp ý từ khách"
places:live được cập nhật  +  cộng điểm (sửa +5, ảnh +10)
```

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

---

## 6. Những chỗ cần cẩn thận

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
