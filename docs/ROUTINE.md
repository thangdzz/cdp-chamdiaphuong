# ROUTINE — Lịch quét dữ liệu hằng ngày

> Bản ghi chép về routine tự động quét địa điểm. **Toàn bộ nội dung lệnh chỉ tồn tại trên
> claude.ai** — file này là bản sao lưu duy nhất trong repo, để dựng lại được nếu routine bị
> xoá, token hết hạn, hoặc cần chuyển sang tài khoản khác.
>
> Cập nhật file này **mỗi khi sửa nội dung routine**.

---

## 1. Routine nằm ở đâu

| | |
|---|---|
| Đường đi | claude.ai → **Code** → **Routines** (⚠️ **không phải** Home → Scheduled) |
| Tên | `CDP - Quet du lieu An/Choi/Ngu/Di lai Tuyen Quang hang ngay` |
| Lịch chạy | Hằng ngày **8:00 GMT+7** |
| Repo gắn kèm | `thangdzz/cdp-chamdiaphuong` |
| Connector | `Claude_Code_Remote` |
| Trạng thái | Active |

> **Dễ nhầm:** claude.ai có hai chỗ khác nhau cho việc chạy tự động — *Scheduled tasks* (mục
> Home) và *Routines* (mục Code). Routine của dự án nằm ở **Routines**, và mục Scheduled
> tasks sẽ hiện **trống** — đó là bình thường, không phải routine bị mất.

---

## 2. Routine làm gì — 5 bước

1. **Đọc danh sách đã biết** — đọc `web/data/known-places-snapshot.json` trong repo để biết
   những chỗ nào đã có trên web, tránh tìm lại.
2. **Tìm địa điểm mới** — dùng WebSearch, tìm 5–10 chỗ mới trong phạm vi **TP Tuyên Quang
   địa danh cũ** (trước sáp nhập tỉnh), thuộc 4 nhóm Ăn / Chơi / Ngủ / Đi lại.
3. **Xử lý xung đột địa chỉ** — nhiều nguồn cho địa chỉ khác nhau thì ưu tiên Google Maps;
   vẫn không chắc thì để `null`, không đoán.
4. **Ghi kết quả lên GitHub** — `curl PUT` vào `data/pending-scan.json` qua GitHub Contents
   API, gộp vào mảng đang có sẵn.
5. **Gửi thông báo đẩy** — báo ngắn kết quả (tối đa 280 ký tự).

---

## 3. ⚠️ Chống trùng hoạt động thế nào — đọc kỹ chỗ này

**Routine KHÔNG tự so sánh dữ liệu quét giữa các ngày.** Nó không nhớ gì giữa các lần chạy.
Mỗi lần chạy là một phiên hoàn toàn mới, trắng trơn.

Chống trùng nằm ở **hai tầng tách rời**:

### Tầng 1 — `known-places-snapshot.json` (chỉ để đỡ tốn công tìm)

Một file tĩnh trong repo, chứa **tên, loại, địa chỉ** các chỗ đã có trên web. Routine đọc nó
ở Bước 1 rồi tự tránh tìm lại.

- ✅ **Tự động từ 2026-08-21** — GitHub Action chạy `scripts/export-known-places.mjs` và
  commit lại snapshot **sau mỗi lần ingest thành công**, không cần ai đụng tay nữa (trước đó
  đóng băng từ 2026-07-18, qua 16 lần chạy routine không hề biết — nguyên nhân chính khiến
  routine hay tìm ra chỗ trùng).
- Vẫn có thể chạy tay `scripts/export-known-places.mjs` bất cứ lúc nào nếu nghi ngờ file
  lệch (xem §9).
- Nếu file cũ → routine tốn công tìm lại chỗ đã có, **nhưng không gây đăng trùng** (chống
  trùng thật nằm ở Tầng 2 bên dưới).

### Tầng 2 — `ingestBatch()` phía web (đây mới là tầng chống trùng thật)

Nằm ở `web/lib/ingestion/ingestBatch.js`, chạy **mọi lúc, bất kể snapshot mới hay cũ**. Mọi
nguồn dữ liệu đều đi qua đúng hàm này.

- Chuẩn hoá → so khớp với `places:live` → phân loại
- Chỗ mới / có thay đổi / tin cậy thấp → **tự động công khai luôn**
- Nghi trùng (`duplicate_candidate`) hoặc mâu thuẫn (`conflict_detected`) → giữ lại trong
  `ingestion:review_queue`, chờ admin duyệt trong `/admin`
- Cặp đã được admin xác nhận "không trùng" → nhớ vĩnh viễn trong
  `ingestion:confirmed_distinct`, không hỏi lại

**Kết luận:** nếu muốn cải thiện chống trùng thì sửa `ingestBatch()`, **không phải sửa
routine**. Routine chỉ đi tìm; việc quyết định đăng hay không hoàn toàn nằm ở phía web.

---

## 4. Luồng chạy đầy đủ

```
8:00 sáng: routine tự chạy trên hạ tầng claude.ai
   ↓ WebSearch tìm chỗ mới
   ↓ công cụ GitHub có sẵn trong phiên (đọc → gộp vào cuối mảng cũ → ghi lại → commit)
data/pending-scan.json trên GitHub
   ↓ file thay đổi → tự kích hoạt
.github/workflows/ingest-from-scan.yml   (chạy trên hạ tầng GitHub)
   ↓ POST + Bearer CRON_SECRET
/api/ingest/submit  trên web
   ↓
ingestBatch()  → lọc trùng/mâu thuẫn
   ↓
├─ Phần lớn  → places:live (tự công khai)
└─ Nghi trùng → ingestion:review_queue (chờ admin)
   ↓
GitHub Action: xoá pending-scan.json + xuất lại known-places-snapshot.json từ dữ liệu mới
nhất (tự động từ 2026-08-21, xem "Sửa routine quét dữ liệu" trong STATUS.md việc 2) →
commit cả 2 file
```

**Vì sao vòng vèo qua GitHub:** môi trường chạy routine **chặn gọi ra mọi domain trừ
GitHub**. Đã thử 3 hướng khác đều thất bại — chi tiết ở [DECISIONS.md](DECISIONS.md)
2026-07-15, 2026-07-17, 2026-08-04.

### ✅ 2026-08-21 — đã bỏ đoạn curl chết ở Bước 4, chuyển sang công cụ GitHub trực tiếp

Báo cáo lần chạy 2026-08-21 ghi rõ:

> *"script curl gốc trong prompt bị proxy môi trường chặn ghi thẳng vào GitHub API (403
> Forbidden dù dùng đúng token), nên mình chuyển sang dùng công cụ GitHub MCP có sẵn trong
> phiên để commit — kết quả tương đương."*

**Đã sửa:** Bước 4 (§7) không còn đoạn `curl`/`base64`/`$GITHUB_TOKEN` nữa — thay bằng chỉ
dẫn dùng thẳng công cụ GitHub có sẵn trong phiên để đọc/sửa/commit file, **giữ nguyên hành vi
gộp dữ liệu mới vào CUỐI mảng đã đọc được (không ghi đè)** để không mất dữ liệu của lần chạy
trước nếu lần đó lỡ bị lỗi giữa chừng.

**Còn để mắt:** dòng `GITHUB_TOKEN=` trong CONFIG (đầu §7) tạm thời **giữ nguyên**, chưa xoá
— chưa xác nhận chắc chắn công cụ GitHub trong phiên không cần tới nó ở bước nào khác (vd
Bước 1 đọc `known-places-snapshot.json`). Xoá nhầm mà vẫn cần thì hỏng cả routine; để sau khi
thấy vài lần chạy thật ổn định rồi mới cân nhắc bỏ.

---

## 5. ⚠️ Token — việc cần để mắt

Nội dung routine chứa một **GitHub Personal Access Token dạng chữ thường**, vì nền tảng
không có chỗ lưu bí mật riêng cho routine (đánh đổi đã chấp nhận, xem
[DECISIONS.md](DECISIONS.md) 2026-08-04).

| | |
|---|---|
| Loại | Fine-grained PAT |
| Phạm vi | Đúng 1 repo `thangdzz/cdp-chamdiaphuong`, quyền Contents: Read/write |
| Tạo ngày | 2026-08-04 |
| **Hết hạn** | **~đầu tháng 11/2026** (90 ngày) |

**Khi hết hạn:** routine vẫn chạy và vẫn tìm được chỗ mới, nhưng bước ghi GitHub thất bại →
thông báo đẩy sẽ báo *"LOI khi ghi GitHub"*. Cách sửa: tạo PAT mới trên GitHub (cùng phạm vi
hẹp như trên), rồi sửa dòng `GITHUB_TOKEN=` trong nội dung routine.

**Nguyên tắc:** khi sửa nội dung routine, **chỉ chèn/sửa phần cần thiết**, không chọn tất cả
rồi gõ lại — để không phải nhập lại token.

---

## 6. Lịch sử sửa nội dung routine

| Ngày | Sửa gì |
|---|---|
| 2026-08-04 | Dựng routine tự ghi GitHub (thay cho bản chỉ in báo cáo để copy-paste tay) |
| 2026-08-17 | Mở rộng từ 2 nhóm (Ăn/Ngủ) lên **4 nhóm** Ăn/Chơi/Ngủ/Đi lại (Chặng 3) |
| 2026-08-20 | Thêm khối **"MON DAC TRUNG"** vào Bước 4 mục 3 — trường `signature_dishes`, tối đa 3 món, chỉ với `category_primary = "an"`. Nội dung lệnh: 5.084 → 6.030 ký tự |
| 2026-08-21 | **Viết lại toàn bộ Bước 4** — bỏ đoạn `curl` đã chết (403 Forbidden), thay bằng dùng thẳng công cụ GitHub trong phiên. Giữ nguyên khối "MON DAC TRUNG" và bổ sung khối **"QUAN TRONG - KHONG DUOC GHI DE"**. Nội dung lệnh: 6.030 → **5.786 ký tự**. Đã dán và xác nhận lưu thành công |
| 2026-08-21 | Bỏ đoạn `curl`/`base64`/`$GITHUB_TOKEN` chết ở Bước 4 (403 Forbidden mọi lần chạy) — thay bằng chỉ dẫn dùng thẳng công cụ GitHub có sẵn trong phiên, **giữ nguyên hành vi gộp vào cuối mảng cũ, không ghi đè** |

---

## 7. Nội dung lệnh routine (bản sao lưu)

> Chép nguyên văn, **trừ dòng token đã thay bằng chỗ trống**. Viết tiếng Việt không dấu —
> giữ nguyên phong cách này khi sửa, cho đồng bộ.

```text
Ban la 1 agent chay dinh ky hang ngay cho du an "Cham Dia Phuong". Nhiem vu MOI LAN CHAY:

CONFIG:
GITHUB_TOKEN=<<DAN TOKEN VAO DAY - fine-grained PAT, chi repo cdp-chamdiaphuong, quyen Contents Read/write>>
REPO=thangdzz/cdp-chamdiaphuong
PENDING_FILE=data/pending-scan.json

BUOC 1 - DOC DANH SACH DA BIET

Dung Read de doc file `web/data/known-places-snapshot.json` trong repo (checkout local) - day la danh sach TEN cac dia diem (An/Choi/Ngu/Di lai) da co san tren web roi. KHONG duoc tim lai bat ky ten nao trung hoac gan giong voi ten trong danh sach nay.

BUOC 2 - TIM DIA DIEM MOI (du 4 nhom: An, Choi, Ngu, Di lai)

Dung WebSearch de tim thong tin cong khai MOI ve dia diem tai TP Tuyen Quang (dia danh cu, TRUOC sap nhap tinh - chi khu vuc trung tam TP Tuyen Quang cu, KHONG mo rong ra toan tinh/huyen khac), thuoc 1 trong 4 nhom:
- AN: quan an, quan cafe, nha hang
- NGU: khach san, nha nghi
- CHOI: quang truong, cong vien, diem tham quan/di tich, diem chup anh, khu vui choi
- DI LAI: ben xe, diem thue xe may/xe dap, diem do taxi/xe om, bai gui xe

Tim khoang 5-10 dia diem MOI HOAN TOAN (chua co trong danh sach o buoc 1), co the tron ca 4 nhom tuy theo tim duoc gi, KHONG bat buoc du 4 nhom moi lan chay - uu tien chat luong thong tin hon so luong. Uu tien thong tin: ten, dia chi cu the, so dien thoai (neu co), khoang gia (neu co), gio mo cua (neu co).

BUOC 3 - XU LY XUNG DOT DIA CHI

Neu tim thay nhieu nguon cho cung 1 ten nhung dia chi/SDT KHAC NHAU (vi du trung ten voi cho o thanh pho khac, hoac thong tin cu da loi thoi), UU TIEN thong tin tren Google Maps (hoac nguon co ve moi nhat/nhieu danh gia nhat). Neu van khong chac chan, de null thay vi doan/bia.

BUOC 4 - GHI KET QUA LEN GITHUB (dung cong cu GitHub co san trong phien, KHONG dung curl)

Sua ngay 2026-08-21: doan curl truoc day o buoc nay bi proxy moi truong chan (403 Forbidden moi lan chay). Gio dung thang cong cu GitHub co san trong phien (connector Claude_Code_Remote) de doc/sua/commit file, khong tu dung Bash + curl nua.

1. Dung cong cu GitHub de doc noi dung HIEN TAI cua file $PENDING_FILE tren nhanh main cua repo $REPO. Day la mang JSON cac dia diem dang cho xu ly - co the rong [], hoac da co san du lieu tu lan chay truoc chua kip duoc web nhan (vi du lan do bi loi).

2. Neu KHONG tim duoc dia diem moi dang tin cay nao o Buoc 2-3: KHONG can ghi gi len GitHub, chuyen thang sang Buoc 5 voi thong bao la khong co gi moi.

3. Neu CO dia diem moi: xay 1 mang JSON, moi phan tu dung dung dinh dang sau (KHONG bia du lieu, thieu gi thi de null). Truong category_primary CHI duoc la 1 trong 4 gia tri: "an", "choi", "ngu", "dilai" (viet lien khong dau gach, dung chinh xac 4 chu nay - sai chinh ta se bi web tu choi ban ghi):
{"name": "...", "category_primary": "an|choi|ngu|dilai", "address_text": "... hoac null", "near_landmark": "... hoac null", "phone": "... hoac null", "opening_hours_text": "... hoac null", "price_range_text": "... hoac null", "map_note": "... hoac null"}

MON DAC TRUNG (chi voi category_primary = "an"):

Them truong signature_dishes: mang toi da 3 chuoi, ten mon dac trung cua quan - doc tu ten quan, mo ta tren Google Maps/fanpage, hoac review khach de lai. Vi du: "Pho Vinh Tuyen Quang" -> ["pho"]; "Vit Bau Minh Huong" -> ["vit bau"]; "Banh Gai Ba Then" -> ["banh gai"].

Quy tac bat buoc:
- Chi dien khi that su thay bang chung (ten mon trong ten quan, menu, review nhac nhieu lan). KHONG doan/bia mon chi vi do la mon pho bien o loai quan do.
- Toi da 3 mon, khong can du 3 - 1 hoac 2 mon cung duoc.
- KHONG kem gia theo mon (gia quan da co truong price_range_text rieng).
- Khong tim thay bang chung nao thi bo han truong nay (dung gui mang rong [], dung bia).
- Chi ap dung quan loai "an". Loai khac (choi/ngu/dilai) khong can truong nay.

Vi du 1 ban ghi co mon:
{"name": "Pho Vinh Tuyen Quang", "category_primary": "an", "address_text": "...", "signature_dishes": ["pho bo tai", "pho ga"]}

QUAN TRONG - KHONG DUOC GHI DE: gop mang dia diem moi vua tim duoc VAO CUOI mang da doc duoc o buoc 1 (giu nguyen tung phan tu cu, chi them phan tu moi vao sau cung). Neu ghi de thang bang mang moi se lam MAT du lieu cua lan chay truoc neu lan do bi loi chua kip xu ly.

4. Dung cong cu GitHub de cap nhat noi dung file $PENDING_FILE tren nhanh main thanh DUNG mang JSON da gop o tren (toan bo mang, khong phai chi phan moi them vao), commit voi message "scan: dia diem moi ngay <ngay hom nay dang YYYY-MM-DD>".

Xac nhan cong cu GitHub bao cap nhat/commit THANH CONG truoc khi qua Buoc 5. Neu that bai (loi quyen, loi mang, hay bat ky ly do gi), ghi ro trong Buoc 5 la ghi GitHub that bai kem loi cu the, KHONG duoc bao la thanh cong neu chua xac nhan.

BUOC 5 - GUI THONG BAO (bat buoc, dung PushNotification, toi da 280 ky tu)

Khong tim duoc gi moi:
"CDP quet hang ngay - Khong co dia diem moi. Da quet TP Tuyen Quang, khong can lam gi them."

Co dia diem moi, ghi GitHub thanh cong:
"CDP quet hang ngay - [so luong] dia diem moi da tu dong len web. [ten 1-2 cho tieu bieu]. Khong can copy-paste gi ca."

Co dia diem moi nhung ghi GitHub that bai:
"CDP quet hang ngay - Tim duoc [so luong] cho moi nhung LOI khi ghi GitHub. Can kiem tra thu cong tai claude.ai/code/routines."

QUY TAC BAT BUOC:
- KHONG mo rong pham vi tim kiem ra ngoai TP Tuyen Quang (dia danh cu).
- KHONG bia du lieu - thieu thong tin gi thi de null.
- KHONG tim lai ten da co trong known-places-snapshot.json.
- category_primary CHI duoc 1 trong 4 gia tri an/choi/ngu/dilai, viet dung chinh ta - gia tri sai se bi web tu choi ca ban ghi do.
- Neu khong tim duoc gi moi dang tin cay, bao cao trung thuc la khong tim duoc gi, KHONG bia dia diem.
- Sau khi hoan tat Buoc 4 (hoac xac nhan khong co gi moi) va gui thong bao o Buoc 5, NHIEM VU HOAN TAT - khong lam gi them.

Bat dau tu Buoc 1.
```

---

## 8. Dựng lại routine nếu bị mất

1. claude.ai → **Code** → **Routines** → tạo routine mới
2. **Name:** `CDP - Quet du lieu An/Choi/Ngu/Di lai Tuyen Quang hang ngay`
3. **Instructions:** chép nguyên §7, thay `<<DAN TOKEN VAO DAY>>` bằng PAT thật
4. **Repository:** `thangdzz/cdp-chamdiaphuong`
5. **Trigger:** Runs daily at 8:00 GMT+7
6. **Connector:** `Claude_Code_Remote`
7. Bấm **Run now** chạy thử một lần, kiểm tra `data/pending-scan.json` trên GitHub

---

## 9. Khi có trục trặc — kiểm tra theo thứ tự

| Hiện tượng | Kiểm tra |
|---|---|
| Không nhận được thông báo đẩy | Routine còn **Active** không? Xem mục Runs có lần chạy hôm nay không |
| Thông báo báo "LOI khi ghi GitHub" | **Token hết hạn** (xem §5) — khả năng cao nhất |
| Chỗ mới không lên web | Xem `data/pending-scan.json` còn dữ liệu tồn không → nếu còn thì GitHub Action lỗi, xem tab Actions trên GitHub |
| Quét ra toàn chỗ đã có | Từ 2026-08-21 tự cập nhật sau mỗi lần ingest thành công (xem GitHub Action). Nếu vẫn cũ: xem tab Actions có bước "Xuất lại known-places-snapshot.json" bị lỗi không (thường do thiếu/sai secret `KV_REST_API_URL`/`KV_REST_API_TOKEN`) — sửa xong chạy tay `scripts/export-known-places.mjs` rồi commit 1 lần cho khớp lại |
| Chỗ mới vào hàng chờ chứ không lên thẳng | Đúng thiết kế — nghi trùng/mâu thuẫn. Vào `/admin` xác nhận |
| Địa điểm bị nhảy sai nhóm | `category_primary` sai chính tả trong dữ liệu quét — phải đúng 1 trong `an`/`choi`/`ngu`/`dilai` |
