# NOTEBOOK-DESIGN — Thiết kế "Cuốn sổ địa phương"

> Tài liệu thiết kế cho hướng đi mới (chốt 2026-08-11). Ghi lại **thiết kế và lý do**, chưa
> phải kế hoạch code. Các quyết định đổi hướng tóm tắt ở [DECISIONS.md](DECISIONS.md);
> tình trạng thực tế ở [STATUS.md](STATUS.md).

---

## 1. Đổi hướng: từ "công cụ tra cứu" sang "cuốn sổ địa phương"

**Trước:** CDP là công cụ quyết định nhanh lúc đông khách — tra chỗ ăn/ngủ còn chỗ không.

**Từ nay:** CDP là **cuốn sổ địa chỉ về ăn, ngủ, chơi, đi lại** của Tuyên Quang. Dữ liệu
mẫu do CDP đăng trước; người dùng vào bổ sung, sửa, ghi chú; sau này doanh nghiệp vào
nhận (claim) chính địa điểm của mình.

**Lễ hội Thành Tuyên không còn là đích, chỉ là điểm khởi đầu thuận lợi** — thời điểm duy
nhất trong năm có lượng người quan tâm tập trung, dùng để lấy nhóm người dùng đầu tiên.

Miễn phí giai đoạn đầu. Mô hình kiếm tiền bàn sau, dự kiến gắn với việc doanh nghiệp nhận
địa điểm.

---

## 2. Vì sao người ta ghi vào CDP thay vì Google Maps

Bốn lý do, xếp theo sức nặng thực tế:

| # | Lý do | Đánh giá |
|---|---|---|
| 1 | **Google giữ thông tin chết** — quán đóng cửa lâu rồi vẫn hiện đang mở, vẫn 4.6 sao | **Mạnh nhất.** Nỗi đau ai cũng gặp, rất cụ thể. CDP đã có sẵn hạ tầng: độ tin cậy, báo đóng cửa, ngày cập nhật |
| 2 | **Không chia sẻ được danh sách theo cách của mình** | **Quan trọng nhất về kinh doanh** — đây là vòng lan truyền, xem §9 |
| 3 | Google Maps chủ yếu để chỉ đường, không tối ưu làm sổ lưu chỗ | Đúng, nhưng chưa đủ đau để người ta đổi thói quen |
| 4 | Google không "chạm" sâu vào địa phương | Đúng, nhưng mơ hồ — phải cụ thể hoá thành mẹo địa phương thật (§5) |

**Kết luận:** thứ CDP thắng được không phải "sổ lưu cho mình" (Google Maps đã có Lists +
ghi chú riêng, CDP không có cửa) mà là **thông tin còn sống + kho mẹo địa phương + gửi
được cho người khác**.

---

## 3. Ba loại nội dung — ba mức kiểm soát khác nhau

| Loại | Ai thấy | Cách nhập | Kiểm duyệt |
|---|---|---|---|
| **Thông tin chọn sẵn** | Công khai | Bấm chọn từ danh sách có sẵn | **Không duyệt** — hiện theo đồng thuận số đông |
| **Note công khai** | Công khai | Gõ chữ ngắn, gắn với câu hỏi cố định | **Phải duyệt** trước khi hiện |
| **Note cá nhân** | Chỉ mình chủ nhân | Gõ tự do | **Không kiểm duyệt gì cả** |

**Vì sao note công khai dạng chữ phải duyệt, dù nguyên tắc auto-publish (17/07) nói ngược
lại:** dữ liệu AI quét sai là sai **vô tình** (sai địa chỉ, sai giá — khách bực mình, sửa
được). Note do người gõ có thể sai **cố ý**: đối thủ bôi nhọ, quảng cáo trá hình gài số
điện thoại, mâu thuẫn cá nhân. Loại rủi ro này có người bị thiệt hại thật, và người đó sẽ
tìm chủ dự án chứ không tìm người viết.

**KHÔNG BAO GIỜ làm:** đánh giá sao, bình luận công khai, diễn đàn.

---

## 4. Nguyên tắc: chọn là mặc định, gõ là ngoại lệ

Mỗi ô gõ chữ là một cơ hội để có rác. Nên câu hỏi đúng không phải "cho gõ gì" mà **"cái nào
bắt buộc phải gõ, còn lại chuyển hết thành bấm chọn"**.

Ba cách biến "gõ" thành "chọn":

1. **Liệt kê sẵn** — cho thứ đoán trước được (gửi xe, giờ đông, lối vào, tiện ích). Quán
   nào cũng chỉ rơi vào vài trường hợp.
2. **Gõ một lần → thành lựa chọn cho người sau.** Món ăn không liệt kê trước được, nhưng
   người đầu gõ "phở bò tái" thì người thứ hai đã thấy nó thành nút bấm. **Ô gõ tự thu hẹp
   theo thời gian.**
3. **Không hỏi cái không liệt kê được.** Nếu một câu hỏi không quy về danh sách được và
   cũng không tích luỹ được, đó là dấu hiệu câu hỏi sai — không phải cần ô text to hơn.

### Cách hỏi: mỗi lần đúng 1 câu

Không bung form nhiều câu. Khách mở một địa điểm → dưới cùng hiện **đúng một câu** mà chỗ
đó đang thiếu nhiều nhất:

> **Bạn biết gửi xe ở đâu không?**
> [Trước cửa] [Vỉa hè] [Bãi riêng] [Bãi gần, mất phí] [Khó gửi] [Không rõ]

Một chạm, xong, biến mất. Lần sau vào hỏi câu khác.

### Luôn phải có nút "Không rõ"

Thiếu nút này, người không biết sẽ **bấm bừa một đáp án cho xong**. "Không rõ" không tính
phiếu, và không hỏi lại người đó câu đó trong 30 ngày. Chi tiết nhỏ nhưng quyết định chất
lượng toàn bộ dữ liệu.

---

## 5. Bộ câu hỏi khởi điểm

### Dùng chung mọi loại

| Câu hỏi | Lựa chọn |
|---|---|
| Gửi xe ở đâu? | Trước cửa · Vỉa hè cạnh quán · Bãi riêng của quán · Bãi gần, mất phí · Khó gửi, nên đi bộ tới |
| Lối vào thế nào? | Mặt đường dễ thấy · Trong ngõ · Trên tầng · Biển hiệu khác tên · Chung cửa với chỗ khác |
| Giờ nào đông? *(chọn nhiều)* | Sáng 6–8h · Trưa 11–13h · Chiều · Tối 18–21h · Khuya · Cuối tuần · Dịp lễ hội |
| Trả tiền kiểu gì? *(chọn nhiều)* | Tiền mặt · Chuyển khoản · Quét QR · Thẻ |

**Gõ có điều kiện** (chỉ hiện khi lựa chọn cần làm rõ):
- Chọn "Bãi gần, mất phí" → ô "Bãi nào?" (60 ký tự)
- Chọn "Biển hiệu khác tên" → ô "Trên biển ghi gì?" (40 ký tự)

### Riêng "Ăn"
- Không gian: Trong nhà · Ngoài trời · Phòng riêng · Vỉa hè
- Hợp đi với ai: Một mình · Cặp đôi · Gia đình có trẻ · Nhóm đông · Tiếp khách
- Tiện nghi: Wifi · Điều hoà · Ghế trẻ em
- Ra món: Nhanh · Phải chờ
- **Nên gọi món gì?** — ô gõ 40 ký tự, tích luỹ thành lựa chọn (§4 cách 2)

### Riêng "Ngủ"
- Thang máy · Nước nóng · Điều hoà · Ban công · Chỗ để ô tô · Nhận khách sau 22h · Cho mang thú cưng
- Độ ồn: Yên tĩnh · Nghe tiếng đường · Sáng ồn
- Đặt phòng qua: Gọi điện · Zalo · Facebook · Đến thẳng

### "Chơi" / "Đi lại"
Để sau, cấu trúc y hệt — chỉ đổi danh sách lựa chọn.

### Note công khai dạng chữ (mục duy nhất gõ tự do)
- **Mẹo riêng** — tối đa 120 ký tự
- Tuỳ chọn "chỉ đúng trong dịp lễ hội" → tự ẩn sau lễ hội. Loại thông tin có hạn sử dụng
  ("tối 20/09 chặn đường Nguyễn Tất Thành từ 18h, gửi xe sau chợ") là thứ Google vĩnh viễn
  không chứa được, và tự dọn rác cho mình.

### Cấu trúc hỏi–đáp gắn cứng

Câu hỏi **do hệ thống đặt**, người dùng chỉ điền câu trả lời. Hiển thị ra là một cặp:

> 🅿️ **Gửi xe** · Ngõ cạnh số 12

Hai hệ quả: (a) không ai đặt được câu hỏi bậy vì không ai được đặt câu hỏi; (b) câu trả lời
lạc đề **tự lộ ra ngay** — "Gửi xe · đồ ăn ngon quá" trông sai rành rành, cả máy lẫn người
duyệt nhận ra trong một giây. Cùng câu đó nằm trong ô ghi chú tự do thì trông hoàn toàn
bình thường.

---

## 6. Luật đồng thuận và cơ chế tự dọn rác

- **1 phiếu:** hiện mờ, kèm chữ "1 người cho biết"
- **2 phiếu trùng nhau:** hiện bình thường
- **Phiếu lệch nhau:** lấy phương án nhiều phiếu nhất; nếu ngang nhau → không hiện gì
- **Phiếu cũ nhẹ dần:** quá 6 tháng tính một nửa, quá 12 tháng gần như không tính

Vế cuối chính là **cơ chế tự dọn rác**. Quán đổi chỗ gửi xe, sửa lối vào, đổi giờ mở —
không cần ai đi xoá, phiếu mới tự lấn phiếu cũ. Dữ liệu tự già đi và tự được thay.

### Vì sao đồng thuận quan trọng với khối lượng việc của admin

Lựa chọn có sẵn **không cần duyệt** — người dùng không tạo ra nội dung, chỉ bỏ phiếu cho
phương án có sẵn. Ai chọn lệch một mình thì bị số đông ghi đè, tự nhiên.

Nghĩa là: **càng đẩy nhiều thứ về dạng chọn, khối lượng việc duyệt càng tiến về 0 dù người
dùng tăng lên.** Đây là lý do mạnh nhất để thiết kế theo hướng "chọn là mặc định".

### Rủi ro mới: bấm bừa

Hết lo gõ bậy thì sinh ra rủi ro khác — **bấm bừa khó phát hiện hơn gõ bậy**, vì mọi phiếu
đều trông hợp lệ. Cách chặn:

- Một người, một câu, một chỗ = một phiếu (sửa được, không cộng dồn)
- Giới hạn ~5 câu mỗi chỗ mỗi ngày cho một người
- Không bao giờ hiện phiếu đơn lẻ ở dạng khẳng định chắc chắn
- **Điểm thưởng chỉ trả cho phiếu trùng đồng thuận** (xem §10) — cách duy nhất ăn điểm là
  trả lời đúng

---

## 7. Note công khai dạng chữ — 5 lớp chặn

| Lớp | Cơ chế | Chặn được gì |
|---|---|---|
| **0** | Cấu trúc: ~80% câu là bấm chọn | Không có chỗ để viết bậy |
| **1** | Giới hạn ô gõ: 40–120 ký tự, 1 dòng, **chặn link và số điện thoại** | Quảng cáo trá hình — dạng phá hoại phổ biến nhất ở VN, không phải chửi bậy |
| **2** | Lọc máy: từ khoá bậy, chuỗi vô nghĩa (asdfgh), lặp ký tự, toàn chữ hoa | Rác rõ ràng — loại thẳng, không vào hàng chờ |
| **3** | AI đọc 1 lượt, hỏi đúng 1 việc: *"câu này có đang trả lời câu hỏi kia không?"* | Nội dung lạc đề. Nhờ cặp hỏi–đáp nên câu hỏi này rất dễ, AI gần như không sai |
| **4** | Admin duyệt | Số ít còn lại, mỗi cái nhìn 2 giây |
| **5** | Sau khi đã hiện: nút "ghi chú này không đúng", 2 người báo là tự ẩn | Cái lọt lưới. Không tranh luận, không hiện ai báo |

**Lớp mềm:** người viết bậy **không thấy thành quả ngay**. Phần lớn động lực phá hoại đến
từ việc nhìn thấy nó hiện lên; không có phản hồi tức thì thì hầu hết bỏ cuộc sau 1–2 lần.

---

## 8. Note cá nhân — 3 bước

**Vấn đề gốc:** note cá nhân cất ở đâu? Chỉ có hai chỗ, mỗi chỗ một nhược điểm.

- **Trên máy khách (bộ nhớ trình duyệt):** ghi được ngay, không cần đăng ký. Nhưng đổi máy
  hoặc xoá dữ liệu duyệt web là mất sạch.
- **Trên máy chủ:** không bao giờ mất. Nhưng phải biết "ai là ai" → phải đăng ký.

Bắt đăng ký ngay thì nhiều người bỏ đi. Không bắt thì họ mất note rồi bỏ app. **Giải pháp:
không chọn cái nào — đi từ cái thứ nhất sang cái thứ hai đúng lúc.**

**Bước 1 — lần đầu.** Khách bấm "Ghi chú riêng", gõ, lưu xong ngay. Không hỏi tên, không
hỏi số điện thoại. Note nằm trong bộ nhớ trình duyệt trên máy họ.

**Bước 2 — khi đã có 3 note.** Mới hiện một dòng nhỏ: *"Bạn đang có 3 ghi chú. Lưu lại để
không mất khi đổi điện thoại?"* → nhập số điện thoại, nhận mã, xong trong 20 giây. Từ giờ
note được cất lên máy chủ.

**Bước 3 — đổi máy.** Đăng nhập bằng số cũ, note còn nguyên.

**Vì sao phải đúng thứ tự này:** cùng một việc "xin số điện thoại", hỏi lúc chưa có gì thì
là **phiền**, hỏi lúc đã có 3 note thì là **giúp**. Khác nhau hoàn toàn ở cảm giác dù thao
tác y hệt.

**Rủi ro chấp nhận:** ai đó xoá dữ liệu duyệt web trước khi kịp đăng ký thì mất — lúc đó
họ mới có 1–2 note.

**Khác hệ thống đang chạy:** hiện dùng biệt danh + mã khôi phục 6 số. Cái đó ổn cho
điểm/huy hiệu (mất thì tiếc thôi), nhưng note cá nhân nên dùng **số điện thoại** — không
ai giữ nổi tờ giấy ghi mã 6 số sau 3 tháng, còn số điện thoại thì ai cũng nhớ.

### Cầu nối sang note công khai

Mỗi note cá nhân có nút **"Chia sẻ ghi chú này cho mọi người"** → chuyển thành note công
khai (qua duyệt). Note cá nhân là thứ người ta viết thật lòng, cho chính mình, không diễn —
đó là nguồn note công khai chất lượng cao nhất, và nó tự chảy sang mà không cần đi xin ai
viết.

---

## 9. Sổ chia sẻ được — vòng lan truyền

**Nhận định cốt lõi: sổ có giá trị vì GỬI ĐƯỢC, không phải vì LƯU ĐƯỢC.**

Lưu cho mình xem sau: động lực yếu, mơ hồ, cạnh tranh trực tiếp với Google Maps và thua.
Gửi cho một người cụ thể sắp đến Tuyên Quang: động lực mạnh, có thời hạn, có người nhận.

Tháng 9/2026 sẽ có rất nhiều người Tuyên Quang được bạn bè/họ hàng tỉnh khác nhắn *"tao về
xem lễ hội, ăn ngủ ở đâu?"*. Hiện họ trả lời bằng đoạn tin nhắn dài gõ tay, hoặc gửi 5 link
Google Maps rời rạc — cả hai đều tệ.

Nếu CDP cho họ gửi **một link duy nhất** tới cuốn sổ 8 chỗ kèm ghi chú riêng:

- Người viết có lý do rõ ràng để viết (đang có người hỏi thật) — **giải bài toán "ai viết
  note đầu tiên"**
- Người nhận vào xem, thấy hay, tự tạo sổ của mình → gửi tiếp
- Không tốn đồng nào marketing

Google Maps về cấu trúc không làm được: list chia sẻ ra xấu, không ghi chú theo ý mình
được, người nhận muốn lưu phải có tài khoản Google.

**Yêu cầu thiết kế:** tạo sổ không cần tài khoản · ra link ngắn · mở là xem được ngay không
cần cài/đăng nhập · người nhận bấm "Lưu sổ này" thành sổ của mình, sửa được, gửi tiếp.

---

## 10. Cách tính điểm (thay cơ chế +5/+10 hiện tại)

| Việc làm | Điểm | Cộng khi nào |
|---|---|---|
| Bấm chọn, trùng đồng thuận | **+1** | Khi có người thứ 2 trả lời trùng |
| Bấm chọn, lệch đồng thuận | 0 | Không trừ |
| **Người đầu tiên** trả lời một câu ở một chỗ | **+2** thêm | Khi đồng thuận xác nhận đúng |
| Xác nhận "hôm nay vẫn mở" | **+1** | Ngay, tối đa 3 lần/ngày |
| Note công khai dạng chữ được duyệt | **+5** | Sau khi admin duyệt |
| Ảnh được duyệt | **+10** | Sau khi admin duyệt |
| Báo đóng cửa, xác nhận đúng | **+15** | Sau khi admin xác nhận |

**Ba lý do đằng sau bảng này:**

1. **Người đầu tiên được thưởng thêm.** Phiếu đầu tiên khó nhất — không có gì để nhìn theo,
   phải thật sự biết mới trả lời được. Phiếu thứ năm gần như miễn phí. Thưởng đúng chỗ khó.
2. **Báo đóng cửa trả cao nhất.** Dữ liệu quý nhất của cả sản phẩm (đúng cái Google không
   có), và khó nhất — phải đến tận nơi mới biết. Ít người làm nên phải trả xứng.
3. **Không bao giờ trừ điểm.** Trừ điểm khiến người ta sợ trả lời khi không chắc — mà dữ
   liệu ít còn tệ hơn dữ liệu lệch. "Không được điểm" là đủ răn đe.

**Nguyên tắc quan trọng nhất:** điểm trả cho **phiếu trùng đồng thuận**, không trả cho mỗi
lượt bấm. Nếu cứ bấm là có điểm thì đang trực tiếp trả tiền cho hành vi bấm bừa.

**Chặn cày điểm:** trần 30 điểm/ngày; mỗi chỗ tối đa 5 câu/ngày; điểm bấm chọn chỉ cộng sau
khi có người thứ hai trùng nên về bản chất không cày nhanh được.

**Chi tiết giao diện:** bấm xong chưa có điểm ngay dễ khiến người ta tưởng lỗi → hiện luôn
*"+1 đang chờ xác nhận"*, đúng cách đã làm cho phần góp ý hồi 18/07.

---

## 11. Doanh nghiệp nhận địa điểm (claim) — để sau

**Chưa làm bây giờ.** Chủ quán chỉ bỏ công nhận địa điểm khi thấy có khách vào xem — claim
là **hệ quả của traffic, không phải nguyên nhân**.

Khi làm, ghi nhớ 2 điều:

- **Phải xác minh, không cho claim ẩn danh.** Tối thiểu: mã OTP gửi về đúng số điện thoại
  đang hiển thị công khai của chỗ đó. Không có bước này thì ai cũng claim được quán không
  phải của mình — sửa sai thông tin đối thủ, gắn số của mình vào.
- **Lời chào nên là "sửa thông tin sai", không phải "mua quảng cáo".** Ví dụ: *"Có 3 khách
  ghi chú về quán anh, 1 người nói số điện thoại sai — anh muốn sửa không?"*. Chủ quán
  claim vì **sợ mất khách**, không vì muốn quảng cáo. Đó cũng là lúc biết chính xác chỗ nào
  đáng bán gói.

---

## 12. Chưa chốt / câu hỏi mở

- **Thứ tự làm** — chưa lên kế hoạch. Cần một buổi riêng để chia giai đoạn nhỏ và cập nhật
  [ROADMAP.md](ROADMAP.md).
- **Tài khoản thật** (số điện thoại + OTP) chưa có trong hệ thống — mâu thuẫn với
  [PRD §6](PRD.md) ("không tài khoản người dùng"). Cần sửa PRD khi bắt tay làm.
- **Quan hệ giữa hồ sơ ẩn danh hiện tại và tài khoản số điện thoại mới** — gộp hay chạy
  song song, chưa quyết.
- **"Chơi" và "Đi lại"** hiện ngoài phạm vi v1 trong PRD nhưng nằm trong hướng mới — cần
  cập nhật PRD.
- **Ai là người viết note đầu tiên** — giả thuyết hiện tại: người địa phương viết để **gửi
  cho người quen sắp đến** (§9). Cần kiểm chứng bằng số liệu thật trong mùa lễ hội, không
  suy đoán tiếp.
