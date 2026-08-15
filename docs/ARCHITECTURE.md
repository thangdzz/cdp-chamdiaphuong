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

## 2. Kho dữ liệu — 10 key Redis

Tất cả đều là **một key = một mảng JSON**, **trừ `place_checkins:latest`** (Chặng 1, xem
bên dưới) — key đầu tiên trong dự án dùng kiểu dữ liệu Redis khác.

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

### Hình dạng một chỗ trong `places:live`

Xem `lib/ingestion/toLivePlace.js` (`candidateToLivePlace`) và `lib/placeForm.js`:

```js
{
  id: "live-<uuid>",
  name, type: "an" | "ngu",        // ⚠️ chỉ 2 giá trị — xem §6
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
│   ├── page.js              (61)  Trang chủ — đọc places:live + place_checkins:latest,
│   │                              render PlaceExplorer
│   ├── PlaceExplorer.js    (624)  ⭐ Client component: bộ lọc, tìm kiếm, card 2 lớp,
│   │                              gallery ảnh, dòng "còn mở" (Chặng 1). Nơi nặng nhất
│   ├── ContributionPanel.js(564)  ⭐ Luồng góp ý: báo sai, gửi ảnh, đặt biệt danh,
│   │                              mã khôi phục, chọn lĩnh vực, hiện huy hiệu. Export
│   │                              STORAGE_KEY/loadLocalContributor/saveLocalContributor
│   │                              để CheckinButton.js dùng chung 1 hồ sơ ẩn danh
│   ├── contributionActions.js(155) Server Action nhận góp ý từ ContributionPanel
│   ├── CheckinButton.js     (68)  Chặng 1: nút "Tôi vừa đến, vẫn mở"
│   ├── checkinActions.js    (43)  Server Action cho CheckinButton — gọi lib/checkins.js
│   │                              + lib/contributors.js (tạo hồ sơ im lặng, cộng điểm)
│   ├── occupancy.js         (29)  Nhãn "còn chỗ" 3 mức — suy theo LỊCH, không theo dữ liệu
│   ├── BadgeIcon.js        (136)  SVG huy hiệu theo bậc
│   ├── layout.js            (29)
│   ├── le-hoi-thanh-tuyen/page.js (173)  Bài viết lễ hội (nội dung tĩnh)
│   ├── admin/
│   │   ├── page.js         (459)  ⭐ Trang duyệt: đăng nhập, sửa live, duyệt hàng chờ,
│   │   │                          duyệt góp ý khách, dán báo cáo routine
│   │   ├── actions.js      (127)  Server Action: đăng nhập/xuất, sửa/xoá/thêm chỗ (xoá
│   │   │                          chỗ cũng dọn field trong place_checkins:latest)
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
│   ├── checkins.js          (65)  Chặng 1: place_checkins:latest (hash) + khoá 24h +
│   │                              trần điểm/ngày — 3 lệnh Redis nguyên tử, không đọc-
│   │                              sửa-ghi cả mảng (xem §2)
│   ├── placeForm.js         (32)  Đọc dữ liệu chỗ từ <form> — dùng chung cả 3 nơi nhập
│   ├── priceFormat.js       (35)  Định dạng/tách giá
│   ├── adminAuth.js         (43)  Mật khẩu admin + cookie phiên ký HMAC (TTL 7 ngày)
│   ├── badges.js           (167)  10 lĩnh vực × 5 bậc, ngưỡng điểm 0/5/20/50/100
│   ├── contributors.js     (120)  Hồ sơ ẩn danh, mã khôi phục, cộng điểm
│   ├── suggestions.js       (58)  Hàng chờ góp ý + chặn gửi trùng ăn điểm
│   └── ingestion/
│       ├── schema.js        (72)  ⭐ Hằng số + JSDoc định nghĩa shape dữ liệu
│       ├── normalize.js     (86)  Chuẩn hoá bản ghi thô về NormalizedPlace
│       ├── match.js        (157)  So khớp với chỗ đã có, phát hiện nghi trùng
│       ├── ingestBatch.js  (216)  ⭐ Hàm trung tâm — MỌI nguồn dữ liệu đều đi qua đây
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

**Loại địa điểm hiện chỉ có 2 giá trị.** `"an"` và `"ngu"` bị viết cứng ở **6 file** — đã
kiểm tra bằng `grep '"ngu"'`:

| File | Dòng | Vấn đề |
|---|---|---|
| `lib/placeForm.js` | 19 | `type: ... === "an" ? "an" : "ngu"` — **mọi giá trị lạ đều rơi về `"ngu"`, không báo lỗi** |
| `lib/ingestion/normalize.js` | 70 | y hệt, cho `category_primary` |
| `lib/ingestion/schema.js` | 59 | JSDoc `{"an"\|"ngu"}` |
| `app/occupancy.js` | 9 | chọn từ "phòng" hay "chỗ" |
| `app/admin/page.js` | 107, 164, 322, 325 | 3 form nhập/sửa |
| `app/PlaceExplorer.js` | 211, 466, 512 | phân nhóm + nút lọc |

**Chặng 3 (thêm Chơi + Đi lại) phải sửa hết 6 file này.** Hai dòng đầu nguy hiểm nhất: bỏ
sót là dữ liệu Chơi/Đi lại bị **âm thầm đẩy về `"ngu"`** mà không có lỗi nào hiện ra.

**Nhãn "còn chỗ" không dựa trên dữ liệu thật.** `app/occupancy.js` chỉ nhìn **ngày giờ trên
máy khách** so với mấy mốc lễ hội viết cứng trong file. Không liên quan gì tới việc quán có
đông thật hay không. Chặng 1 thêm nút "Hôm nay vẫn mở" — hai thứ này khác nhau hoàn toàn,
đừng nhầm.

**Ghi Redis không có khoá.** Mọi thao tác đều là đọc-cả-mảng → sửa → ghi-cả-mảng. Hai thao
tác cùng lúc thì thao tác sau đè thao tác trước. Đã biết và chấp nhận ở quy mô hiện tại
(admin duyệt từng cái một). **Nhưng Chặng 1–2 là thao tác của KHÁCH, nhiều người bấm cùng
lúc** — cần xử lý khác, không dùng lại kiểu đọc-sửa-ghi này cho phiếu bầu.

**Mảng phình vô hạn.** `places:live`, `contributors:all`, `user_suggestions` chưa có cơ chế
cắt bớt. Ở vài chục chỗ và vài trăm người thì không sao; cần để mắt khi lớn hơn.

**`data/known-places-snapshot.json` phải cập nhật thủ công.** Chỉ ảnh hưởng hiệu quả tìm
kiếm của routine (tránh tìm lại chỗ đã có), **không** ảnh hưởng việc chống đăng trùng —
việc đó nằm ở `ingestBatch()`.

**`AREA_PRESETS` trong `schema.js` mới có 5 phường.** Địa chỉ ngoài danh sách này không
chuẩn hoá được về `ward`, và chỗ không có `ward` thì nhãn còn chỗ luôn về "Chưa đủ dữ liệu".

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
