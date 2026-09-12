# AGENTS.md — Hướng dẫn cho AI coding agent

> File này dành cho agent làm việc trên repo (Codex, Claude Code…).
> Trạng thái bàn giao mới nhất: [docs/HANDOFF.md](docs/HANDOFF.md).
> ⚠️ Còn một AGENTS.md thứ hai ở [web/AGENTS.md](web/AGENTS.md) — **bắt buộc đọc trước khi
> viết code Next.js**.

---

## 1. Dự án này là gì

**CDP — Chạm Địa Phương** (`chamdiaphuong.io.vn`): web mobile-first giúp khách du lịch và
người dân **Tuyên Quang** tìm nhanh chỗ **Ăn · Chơi · Ngủ · Đi lại** đáng tin — biết giá tầm
nào, còn mở hay không, ai đã kiểm lại gần đây — rồi **gom thành Sổ** hoặc **xếp thành Lộ
trình** và chia sẻ cho người khác.

- **Không có tài khoản đăng nhập.** Người dùng được định danh bằng mã ẩn danh trong
  localStorage, hồ sơ tạo im lặng lúc họ thực sự đóng góp lần đầu.
- **Dữ liệu địa điểm do AI quét hằng ngày**, tự động công khai kèm độ tin cậy; chỉ giữ lại
  chờ duyệt khi nghi trùng lặp/mâu thuẫn.
- Chủ dự án là **solo creator không rành kỹ thuật**. Mọi giải thích cho anh ấy phải bằng
  **tiếng Việt đơn giản**, thuật ngữ phải giải thích ngay.

Bối cảnh gần: **Lễ hội Thành Tuyên 19–25/9/2026** là đợt cao điểm đang nhắm tới.

---

## 2. Tài liệu cần đọc

Đọc theo thứ tự này, **không cần đọc hết cả repo**:

| File | Khi nào cần |
|---|---|
| [docs/HANDOFF.md](docs/HANDOFF.md) | **Đọc đầu tiên** — đang làm gì, dở ở đâu, làm gì tiếp |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | **Trước khi code** — dữ liệu nằm đâu, file nào làm gì, chỗ nào dễ vỡ |
| [web/AGENTS.md](web/AGENTS.md) | **Trước khi code Next.js** — bản Next.js này khác dữ liệu huấn luyện |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Trước khi đổi hướng thứ gì — vì sao đã chọn cách hiện tại |
| [docs/TASKS.md](docs/TASKS.md) | DONE / IN PROGRESS / TODO |
| [docs/STATUS.md](docs/STATUS.md) | Nhật ký từng phiên (dài, tra theo ngày) |
| [docs/PRD.md](docs/PRD.md) · [docs/NOTEBOOK-DESIGN.md](docs/NOTEBOOK-DESIGN.md) | Sản phẩm làm gì, cho ai |
| [docs/SPEC-giao-dien.md](docs/SPEC-giao-dien.md) | **Trước khi dựng UI** (dự án không có `docs/DESIGN.md`; đây là file thay thế) |
| `docs/SPEC-chang-N.md` · `docs/10..16-NOTE-*.md` · `docs/CDP_P1-P8_*.md` | Spec chi tiết của từng mảng — tra khi động vào mảng đó |
| [docs/ROUTINE.md](docs/ROUTINE.md) | Lịch quét dữ liệu hằng ngày |

⚠️ **`docs/reference/` là TƯ LIỆU THAM KHẢO, không phải yêu cầu tính năng.** Đừng tự biến nội
dung trong đó thành việc phải làm.

---

## 3. Quy tắc làm việc

1. **Trình kế hoạch ngắn trước khi code** và chờ chủ dự án duyệt. Nói rõ: làm gì, vì sao,
   ảnh hưởng gì.
2. **Làm từng việc nhỏ**, mỗi bước xong phải có thứ bấm thử được.
3. **Không tự mở rộng phạm vi.** Thấy việc hay thì đề xuất riêng.
4. **Không rewrite phần đang chạy ổn.** Ưu tiên tái dùng component/pattern có sẵn.
5. **Sửa bug thì tìm nguyên nhân gốc trước khi vá.**
6. **Giữ backward compatibility.** Dữ liệu cũ trong Redis thiếu trường mới là chuyện thường —
   xử lý bằng cách **suy ra lúc đọc**, không chạy migration cả kho (xem `normalizeStop`,
   `normalizeProvince`).
7. Yêu cầu mơ hồ → **hỏi lại một câu một**.
8. **Cuối phiên: cập nhật `docs/STATUS.md` + `docs/TASKS.md`; quyết định quan trọng ghi
   `docs/DECISIONS.md`** kèm lý do. Không đợi được nhắc.

---

## 4. Code convention

- **JavaScript thuần, không TypeScript.** Next.js 16 App Router + Tailwind v4.
- **Tên file/biến/hàm/commit message: tiếng Anh.** Comment giải thích, tài liệu, chữ hiển thị
  cho người dùng: **tiếng Việt**.
- **Comment nói VÌ SAO, không nói cái gì.** Dẫn chiếu spec khi có (`§P4`, `NOTE-07 §13`).
- Một khái niệm chỉ được định nghĩa **một chỗ**: loại địa điểm ở `lib/placeTypes.js`, tỉnh ở
  `lib/provinces.js`, tìm kiếm ở `lib/placeTextSearch.js`, thời lượng ở `lib/durationFormat.js`,
  chuỗi Google Maps ở `lib/mapsUrl.js`.
- **`id` câu hỏi trong `lib/questions.js` phải DUY NHẤT** — `getQuestion(id)` lấy cái đầu
  tiên, trùng id là phiếu bị chấm nhầm bộ đáp án rồi âm thầm loại.
- **Không viết `{soLuong && <X/>}`** — số 0 vẫn render ra chữ "0" trên màn hình. Dùng
  `!== null` / `> 0`.
- Component chỉ hiện theo điều kiện vẫn phải **dò đủ import**: lint và build đều không bắt
  được lỗi tên thiếu trong nhánh chưa bao giờ render.
- Ô nhập trên màn cảm ứng để **16px** (`@media (pointer: coarse)` trong `globals.css`) —
  nhỏ hơn là Safari iOS tự phóng to trang.

---

## 5. Lệnh

Mọi lệnh chạy trong thư mục **`web/`**.

```bash
npm run dev      # máy chủ phát triển, http://localhost:3000
npm run build    # build production (phải sạch trước khi giao)
npm run lint     # eslint
```

- **`npm run lint` hiện còn ĐÚNG 1 lỗi cũ đã biết** ở `app/PlaceExplorer.js`
  (`react-hooks/set-state-in-effect`). Lỗi này có từ trước, chưa sửa. **Thêm lỗi mới là
  không đạt** — mốc so sánh là "vẫn đúng 1 lỗi đó".
- **Repo KHÔNG có bộ test tự động.** Playwright nằm trong `devDependencies`, cách kiểm thử
  hiện tại là viết script `.mjs` rời rồi chạy bằng `node`, khổ máy `devices["iPhone 13"]`.
  Script test không được commit vào repo.
- Deploy: `npx vercel --prod --yes` rồi `npx vercel ls --prod` để xác nhận.
  **Chỉ deploy khi được yêu cầu.**
- Đọc/ghi Redis bằng script rời: `node --env-file=.env.local <script>.mjs`.

---

## 6. Không được tự ý thay đổi

**Dữ liệu thật**
- `places:live`, `route:*`, `notebook:*`, `contributors:all` là **dữ liệu thật đang chạy**.
  Dev và production **dùng chung một Redis**.
- **Không bao giờ thử hành động không thể hoàn tác trên dữ liệu thật.** Tạo dữ liệu test
  riêng, ghi lại ID, xoá đúng ID đó. **Không chắc thì để nguyên và báo lại.**
- Không tự xoá/gộp địa điểm. Gỡ một chỗ khỏi công khai luôn phải qua người duyệt.

**Cấu hình**
- `.env.local`, mọi secret, `.claude/settings*` (đã phải gỡ khỏi git một lần vì lộ secret).
- GitHub Secret `KV_REST_API_TOKEN` **cố ý chứa token CHỈ ĐỌC** — đừng "sửa lại cho đúng
  tên", lệch tên như vậy là chủ ý (repo Public, script chỉ cần đọc).

**Kiến trúc**
- Quy ước Redis "1 key = 1 mảng JSON" và các ngoại lệ dùng hash/set đều có lý do ghi trong
  ARCHITECTURE §2 — đọc trước khi đổi.
- Không migration cả kho dữ liệu để thêm một trường; giải bằng đọc-thì-suy-ra.
- Link chia sẻ là **bản chụp đóng băng** (`route_share:*`) — không đổi thành link sống, link
  đã gửi đi cho người khác không được vỡ.
- **Không hard-code logic riêng cho Trung thu.** Post Engine phải dùng lại được cho bài khác.
- Bot/AI **không được publish thẳng lên production** — luôn qua hàng chờ để người duyệt.

**Quy trình**
- Không commit/push/deploy nếu không được yêu cầu. Không đụng file ngoài phạm vi việc đang làm.
