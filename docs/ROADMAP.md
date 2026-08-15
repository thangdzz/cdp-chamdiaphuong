# ROADMAP — chamdiaphuong (Chạm Địa Phương)

> Chia nhỏ để mỗi giai đoạn xong đều có thứ **bấm thử được**, không có giai đoạn nào chỉ
> code mà không xem được kết quả. Xem tiến độ thật ở [STATUS.md](STATUS.md).

> ⚠️ **Đọc phần "HƯỚNG MỚI — Cuốn sổ địa phương" ở cuối file trước.** Đó là kế hoạch đang
> chạy (chốt 2026-08-11). Phần "Giai đoạn 0–6" bên dưới là **lịch sử đã làm xong**, giữ lại
> để tra cứu, không phải việc sắp làm.

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
- **AI quét dữ liệu hằng ngày, mở rộng dần ra toàn TP Tuyên Quang** ✅ (bán tự động,
  auto-publish)
  1. ✅ Trang duyệt (5a) xong trước.
  2. ✅ Dữ liệu ingestion đã ở Upstash Redis (`ingestion:review_queue` +
     `ingestion:source_runs` + `ingestion:place_snapshots`) — xem `lib/ingestion/`.
  3. ✅ Pipeline chuẩn hoá + so khớp/dedupe — **từ 2026-07-17: tự động công khai luôn**
     (chỗ mới/có đổi/tin cậy thấp), chỉ giữ chờ duyệt trong `/admin` khi nghi trùng lặp/mâu
     thuẫn (xem DECISIONS.md).
  4. ✅ **Lịch chạy hằng ngày (claude.ai routine, 8h sáng):** tự tìm kiếm web thật, trả về
     báo cáo (JSON + tóm tắt) qua chat — **bán tự động**, không tự ghi vào đâu. Anh dán báo
     cáo vào chat mỗi sáng, em xử lý (~30 giây) — đa số tự lên web luôn (xem DECISIONS.md
     lý do không làm hoàn toàn tự động được: 3 giới hạn hạ tầng/gói dịch vụ).
  5. 🔲 Hoàn toàn tự động (routine tự ghi thẳng vào Redis) — cần 1 trong 2: nâng cấp
     gói Claude Team/Enterprise (để routine ghi được lên GitHub), hoặc Google Places API
     (trả phí, gọi trực tiếp từ Vercel Cron đã có sẵn — `app/api/cron/daily-ingest`).
- **Đề xuất sửa (khách góp ý) + thưởng điểm/huy hiệu** ✅ (2026-07-18): "Báo sai"/"Bổ sung
  ảnh" ngay trong thẻ, hồ sơ ẩn danh + mã khôi phục (không cần tài khoản), 10 lĩnh vực × 5
  bậc danh hiệu, duyệt trong `/admin`. Xem chi tiết STATUS.md/DECISIONS.md.

---
---

# HƯỚNG MỚI — Cuốn sổ địa phương (chốt 2026-08-11)

> Kế hoạch đang chạy. Thiết kế đầy đủ ở [NOTEBOOK-DESIGN.md](NOTEBOOK-DESIGN.md), lý do đổi
> hướng ở [DECISIONS.md](DECISIONS.md).
>
> Gọi là **"Chặng"** để khỏi lẫn với "Giai đoạn 0–6" cũ đã xong.

**Nguyên tắc xếp thứ tự:** cái rẻ và không cần đăng nhập làm trước; cái làm cho dữ liệu tốt
lên làm trước cái đem dữ liệu đi chia sẻ.

**Xâu chuỗi cho dễ nhớ:** Chặng 1–3 lo **thông tin đúng và đủ** → Chặng 4 lo **có người biết
đến** → Chặng 5–6 lo **khách quay lại** → Chặng 7–8 lo **giữ khách và kiếm tiền**.

---

## Chặng 0 — Dọn tài liệu · 1 buổi

**Nói dễ hiểu:** sửa mấy chỗ trong tài liệu cũ đang nói khác với hướng mới. Không đụng web.

Sửa [PRD.md](PRD.md) 3 chỗ đã lệch: §3 (phạm vi chỉ Ăn+Ngủ) · §4 (mốc 21/08 là hạn chót) ·
§6 (ngoài phạm vi: "tài khoản người dùng, đăng nhập").

**Cần vì:** ai đọc tài liệu sau này sẽ làm sai nếu nó còn ghi hướng cũ.
👉 **Bấm thử:** không có (tài liệu).

---

## Chặng 1 — Nút "Hôm nay vẫn mở" · 2–3 ngày

**Nói dễ hiểu:** dưới mỗi chỗ có một nút. Ai vừa đi ngang, thấy quán còn mở thì bấm một
cái. Trên thẻ hiện *"Có người xác nhận: hôm nay"*.

Không cần đăng nhập, không cần duyệt. Quá lâu không ai xác nhận → tự tụt xuống "chưa rõ còn
hoạt động". Cộng +1 điểm ngay, tối đa 3 lần/ngày.

**Cần vì:** đúng thứ Google làm dở nhất (quán đóng cửa vẫn hiện đang mở), mà chỉ tốn của
khách một cái chạm. Rẻ nhất trong tất cả nhưng kiểm chứng được giả thuyết lớn nhất: người
ta có chịu bấm không.
👉 **Bấm thử:** mở một chỗ, bấm "vẫn mở", thấy hiện "Có người xác nhận: hôm nay".

---

## Chặng 2 — Câu hỏi bấm chọn · ~1 tuần

**Nói dễ hiểu:** khách mở một quán, dưới cùng hiện **đúng một câu hỏi** (*"Gửi xe ở đâu?"*)
kèm 5–6 nút bấm. Bấm xong câu hỏi biến mất, lần sau vào hỏi câu khác. Hai người trả lời
giống nhau thì thông tin mới hiện lên thẻ.

Gồm: 4 câu dùng chung + câu riêng cho Ăn/Ngủ · nút "Không rõ" · luật đồng thuận · phiếu cũ
nhẹ dần theo thời gian · giới hạn 5 câu/chỗ/ngày. **Đổi cách tính điểm làm luôn trong chặng
này** (bấm chọn +1 chỉ khi trùng đồng thuận, không phải mỗi lượt bấm — xem
[NOTEBOOK-DESIGN §10](NOTEBOOK-DESIGN.md)).

**Cần vì:** đây là cách gom thông tin mà khách không phải gõ chữ — không gõ thì không có
rác, và anh không phải ngồi duyệt.
👉 **Bấm thử:** mở một chỗ thấy đúng 1 câu hỏi, bấm xong biến mất; hai người trả lời trùng
thì thông tin hiện lên thẻ.

---

## Chặng 3 — Thêm "Chơi" và "Đi lại" · 3–4 ngày

**Nói dễ hiểu:** hiện web mới có Ăn và Ngủ, chặng này thêm hai nhóm còn lại cho đủ bốn.

Gồm: mở rộng phạm vi quét của routine hằng ngày · bộ câu hỏi bấm chọn riêng cho 2 nhóm mới
· thêm vào bộ lọc.

**Cần vì:** mình đang hứa "cuốn sổ ăn, chơi, ngủ, đi lại" — thiếu hai mục thì chưa đúng lời
hứa.
👉 **Bấm thử:** lọc ra được cả 4 nhóm, mỗi nhóm có dữ liệu thật.

---

## Chặng 4 — Sổ chia sẻ được · ~1,5 tuần ⭐

**Nói dễ hiểu:** khách chọn vài chỗ, ghi mỗi chỗ một dòng, bấm nút → được **một đường
link**. Gửi qua Zalo cho bạn. Bạn bấm vào xem được ngay, không cài gì, không đăng nhập.

Gồm: tạo sổ không cần tài khoản · link ngắn · người nhận bấm "Lưu sổ này" thành sổ của mình,
sửa được, gửi tiếp.

**Cần vì:** tháng 9 rất nhiều người Tuyên Quang sẽ bị bạn bè nhắn *"tao về xem lễ hội, ăn
ngủ ở đâu?"* — hiện họ phải gõ tay một tin nhắn dài. Mình cho họ gửi một cái link thay thế.
Mỗi lần ai đó gửi link là web có thêm người biết — **không tốn tiền quảng cáo**.

**Nhắm xong trước 15/09.**
👉 **Bấm thử:** tự tạo một sổ 5 chỗ, gửi link qua Zalo cho người khác, họ mở được trên máy
họ.

---

## Chặng 5 — Ghi chú công khai bằng chữ · ~1 tuần

**Nói dễ hiểu:** khách gõ được mẹo ngắn (*"gửi xe ở ngõ cạnh số 12"*). Gõ xong chưa hiện
ngay — máy lọc trước, anh duyệt rồi mới lên.

Gồm: 5 lớp chặn (giới hạn ký tự + chặn link/số điện thoại → lọc máy → AI đọc 1 lượt → anh
duyệt → nút "ghi chú này không đúng") · tuỳ chọn "chỉ đúng trong dịp lễ hội" rồi tự ẩn.

**Cần vì:** có những thứ không làm thành nút bấm được. Nhưng đây cũng là chỗ dễ bị phá nhất
nên phải qua duyệt.
👉 **Bấm thử:** gõ một mẹo, thấy báo "đang chờ kiểm tra"; duyệt trong `/admin` thì nó hiện
lên thẻ; thử gõ bậy hoặc gài số điện thoại thì bị chặn.

---

## Chặng 6 — Ghi chú riêng · 4–5 ngày

**Nói dễ hiểu:** khách tự ghi cho mình xem, không ai khác thấy. Lưu ngay trên máy họ, không
cần đăng ký gì.

Gồm: lưu vào bộ nhớ trình duyệt · nút "Chia sẻ ghi chú này cho mọi người" (chuyển thành note
công khai, qua duyệt).

**Cần vì:** đây mới là thứ biến web thành "cuốn sổ của tôi" chứ không phải "trang web tra
cứu".
👉 **Bấm thử:** ghi chú riêng ở 3 chỗ, tải lại trang vẫn còn.

---

## Chặng 7 — Đăng nhập bằng số điện thoại · khi cần

**Nói dễ hiểu:** khi ai đó đã ghi được vài ghi chú riêng, mới hiện lời mời *"Để lại số điện
thoại để không mất khi đổi máy?"*.

**Chỉ làm khi đã có người thật ghi từ 3 note trở lên** — làm sớm hơn là làm thừa.

**Cần vì:** ghi chú riêng đang nằm trong máy khách, đổi điện thoại là mất. Nhưng hỏi sớm quá
thì họ thấy phiền và bỏ đi — phải đợi họ **có thứ để mất** rồi mới hỏi.
👉 **Bấm thử:** ghi note trên điện thoại, đăng nhập trên máy tính, thấy note.

---

## Chặng 8 — Chủ quán nhận địa điểm của mình · sau, khi có traffic

**Nói dễ hiểu:** chủ quán xác minh bằng số điện thoại rồi tự sửa thông tin quán mình.

Bắt buộc có xác minh (OTP về đúng số điện thoại đang hiển thị công khai của chỗ đó) — không
cho nhận ẩn danh. Lời chào nên là *"có khách nói số điện thoại quán anh sai, sửa không?"*,
không phải "mua quảng cáo".

**Cần vì:** đây là cửa để sau này kiếm tiền. Nhưng chỉ làm được khi web đã có khách vào xem
— chủ quán không quan tâm nếu chưa ai nhìn thấy quán họ.
👉 **Bấm thử:** nhận một địa điểm thật bằng số điện thoại thật, sửa được thông tin.

---

## Đường thời gian dự kiến

```
11/08  →  Chặng 0-1  →  ~15/08
       →  Chặng 2    →  ~22/08
       →  Chặng 3    →  ~26/08
       →  Chặng 4    →  ~06/09   ⭐ xong trước lễ hội, còn ~2 tuần dự phòng

19–25/09   LỄ HỘI — đo số liệu thật, KHÔNG code

sau đó →  Chặng 5, 6, 7, 8
```

**Hai điều cố ý xếp như vậy:**

1. **Chặng 4 xong trước lễ hội, còn lại để sau.** Lễ hội là cửa sổ traffic duy nhất trong
   năm — thứ đáng có mặt lúc đó là *sổ chia sẻ được* (vòng lan truyền), không phải note chữ
   hay tài khoản.
2. **Tuần lễ hội không code.** Dùng để nhìn 3 con số thật: có ai bấm "vẫn mở" không · có ai
   tạo sổ và gửi đi không · sổ gửi đi có ai mở không. Ba con số đó quyết định Chặng 5–8 có
   đáng làm hay không — tốt hơn là đoán tiếp.
