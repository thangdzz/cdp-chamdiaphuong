# PM REVIEW — DUYỆT KẾ HOẠCH BUILD A1 (MÀU + FONT)

**Dự án:** CDP — chamdiaphuong.io.vn  
**Ngày:** 2026-11-12 (giờ Việt Nam)  
**Nguồn review:** `docs/SPEC-A1-mau-va-font.md` (bản trình PM ngày 12/11), FREEZE DESIGN v2.0  
**Commit HEAD theo báo cáo Claude:** `7ebbc8a` (**chưa kiểm chứng trực tiếp từ Git remote**).  
**Trạng thái:** **A1 PLAN APPROVED WITH AMENDMENTS — cho phép BUILD A1 sau khi ghi bổ sung quyết định vào tài liệu; không cần trình lại kế hoạch nếu không vượt phạm vi.**  
**Production:** giữ nguyên; **KHÔNG DEPLOY**.

## 1. Quyết định ba câu hỏi

### Q1 — Font `/admin`: DUYỆT

- Dùng **Be Vietnam Pro** cho cả phần khách xem lẫn `/admin`, đúng bốn độ đậm **400/500/600/700** và các bộ ký tự **latin + vietnamese**.
- Giữ nguyên màu sắc, cấu trúc, chức năng và luồng đăng nhập của `/admin`; việc font thay đổi chiều rộng/chiều cao chữ phải được kiểm tra bằng ảnh trước/sau ở 320/360/390/1280 px.
- Không tải Geist, Geist Mono cho phần web cũ, nếu không có phụ thuộc thực tế khác; ghi rõ ngoại lệ nếu phát hiện.
- Thực tế font sẽ được Next.js tự lưu cùng web **khi build**; trình duyệt khách không tải font từ Google lúc chạy. Ghi dung lượng font chuyển tải thực tế; không khẳng định chắc chắn kích thước gói trước khi đo.

### Q2 — Viền ô nhập: DUYỆT VỚI MÀU ĐIỀU CHỈNH

- Bổ sung token CSS **`--line-strong: #7F8882`**, thay cho đề xuất ban đầu `#858D88`.
- Lý do: `#858D88` trên nền phụ `#EFEEE9` chỉ đạt khoảng **2,93:1**; `#7F8882` đạt khoảng **3,15:1**. Đối với nền trắng và nền trang kem, `#7F8882` lần lượt đạt khoảng **3,65:1** và **3,35:1**.
- Dùng cho viền ô nhập, ô tìm, và chip/bộ lọc **khi viền là tín hiệu nhận biết thành phần tương tác**. `--line: #E3E1DA` tiếp tục dùng cho đường chia hoặc viền trang trí.
- A1 **chỉ khai báo** token; áp dụng theo từng màn tại A2–A9, không đi sửa tất cả ô nhập ở A1.
- Ghi quyết định này thành **phụ lục/chỉnh sửa có dấu vết** trong DESIGN.md §2 và DECISIONS.md, đồng thời cập nhật SPEC A1 §3.1, §4, §10. Không tự mở lại Scope hay thêm chức năng.

### Q3 — Tag mốc sửa gấp: DUYỆT

- Tạo tag Git **`prod-2026-09-30`** tham chiếu commit **`e3b38a4`** sau khi kiểm tra đối tượng commit và bảo đảm tag chưa tồn tại. Khuyến nghị dùng **annotated tag**, ghi rõ đây là mốc release theo hồ sơ.
- **Chưa xác minh trực tiếp trạng thái Vercel** vì phiên đăng nhập hết hạn: không được trình bày việc gắn tag như bằng chứng độc lập rằng Vercel đang phục vụ đúng SHA này. Trước hotfix/release, phải đối chiếu deployment thực tế với hồ sơ.
- Không di chuyển hoặc ghi đè tag đã tồn tại; nếu có xung đột phải báo PM.
- Khi có hotfix production trước RELEASE A: tách nhánh từ mốc production đã xác nhận, kiểm thử riêng, deploy hotfix riêng, rồi **đưa bản sửa tương ứng trở lại nhánh phát triển** để tránh bị mất ở RELEASE A. Tuyệt đối không deploy `main` đang có giao diện làm dở.
- A1 không đòi đăng nhập Vercel vì **không deploy**. Việc `vercel login` để trước thời điểm phát hành/kiểm chứng production.

## 2. Phạm vi BUILD A1 được phép

**Chỉ ba file code:**

1. `web/app/globals.css`: khai báo token màu theo vai trò, nối Tailwind, CSS nền/chữ/focus của `cdp-site`, quy tắc font; bổ sung `--line-strong`.
2. `web/app/AppShell.js`: thêm dấu hiệu phạm vi `cdp-site` (không tái cấu trúc khung).
3. `web/app/layout.js`: đổi Geist/Geist Mono sang Be Vietnam Pro cho cả site.

**Thứ tự hai commit code:**

- **A1a:** Role-based tokens + `cdp-site`, chỉ định nghĩa và áp nền/chữ/focus theo SPEC.
- **A1b:** Be Vietnam Pro; kiểm chứng ảnh hưởng tới Admin và trang khách.

Được cập nhật `docs/` để phản ánh quyết định PM, thiết kế và kết quả. **Không sửa API, Redis, dữ liệu địa điểm, logic tìm kiếm/lưu/Sổ/Lộ trình, `_game`, màn Admin, analytics, tài khoản, khôi phục mã, màn A2–A9 hoặc các hạng mục đợt B.** Không deploy.

## 3. Điều kiện kỹ thuật và kiểm thử PM bổ sung

- Chạy **lint, test, production build**; kiểm tra 320, 360, 390 và 1280 px trên các nhóm trang mà SPEC §7 đã nêu, cả `/admin`.
- Ghi ảnh **trước/sau**, thống kê khác biệt. Chỉ nền tổng thể và font có thể đổi ở A1; màu nút và màu riêng của từng màn sẽ được chuyển đổi ở bước sau.
- Kiểm dấu tiếng Việt (cả tổ hợp NFD), dấu chữ hoa không bị cắt, tên địa điểm dài không tràn ngang, trạng thái tối của hệ điều hành, điều khiển Tab và viền focus. **Kiểm tra trên thành phần có `outline-none` hoặc vùng `overflow-hidden` nếu có**, không chỉ kiểm tra một ô ví dụ.
- Xác minh `/admin` chỉ đổi font, không lệch bố cục/nhãn/nút hoặc xảy ra cuộn ngang.
- Đo **CLS trước/sau** và tổng **dung lượng font tải thật**; ngưỡng 150 KB trong SPEC là mốc rà soát để tối ưu tải trước, không phải số liệu chắc chắn của font.
- Không thực hiện hành động ghi dữ liệu thật khi kiểm thử. Sử dụng môi trường dữ liệu thử hoặc mô phỏng/chặn các đường ghi, không giả định test trên máy là tự động an toàn cho Redis production.
- **Chưa tuyên bố toàn site đạt tiêu chuẩn tương phản** sau A1: 73 vị trí chữ `text-zinc-400` và các màu cũ vẫn nằm trong kế hoạch A2–A9.
- Nếu sửa lỗi font bị cắt buộc phải đụng **file thứ tư**, **dừng và báo PM trước**, không tự mở rộng phạm vi. Lỗi chỉ thẩm mỹ có thể ghi lại cho bước tiếp theo, miễn không gây cản trở sử dụng.

## 4. Trình tự thực hiện

1. Đồng bộ `origin/main` (fast-forward, không đè dữ liệu từ routine), xác nhận HEAD và trạng thái sạch; cập nhật SPEC/DESIGN/DECISIONS theo Q1–Q3 và ghi rõ đây là thay đổi nhỏ sau FREEZE.
2. Kiểm tra/tạo và push tag `prod-2026-09-30` theo Q3; không sử dụng tag để tự động deploy.
3. BUILD A1a, commit/push riêng; BUILD A1b, commit/push riêng.
4. Kiểm thử theo SPEC §7 và điều kiện §3 của PM review này; nếu lỗi, sửa trong phạm vi hoặc báo xin thay đổi Scope.
5. Báo cáo cho PM: commit, diff, ảnh trước/sau, lint/test/build, font tải thực tế, CLS, lỗi/bất thường, tình trạng production, kế hoạch rollback. **Chưa chuyển A2 khi chưa được PM nghiệm thu A1.**

## 5. Các điểm không thay đổi

- PRODUCT.md vẫn đợi **chủ dự án** duyệt riêng. Không sửa trong A1.
- DESIGN v2.0 là nguồn chuẩn; Q2 được ghi thành điều chỉnh nhỏ có truy vết, không thay đổi triết lý hai giao diện.
- Quy tắc Sổ/tài khoản/đồng bộ giữ nguyên như đã khóa. Không hỏi lại.
- Hai lỗi mã khôi phục 6 số vẫn trong BACKLOG; không sửa trong A1.
- Phạm vi RELEASE A và RELEASE B giữ nguyên, không thêm nút chọn giao diện ở A1.

## 6. Chốt PM

**CHO PHÉP BUILD A1** khi Claude đã ghi rõ ba quyết định và làm bước chuẩn bị Git nêu trên. **Không cần PM duyệt lại kế hoạch A1** nếu nội dung triển khai không vượt quá ba file code đã nêu. Khi A1 hoàn tất, gửi **REPORT A1** để PM nghiệm thu trước A2. **Không deploy.**

---

**Chú giải:** *Token* là biến đặt tên màu theo chức năng sử dụng; *focus* là dấu hiệu cho biết phần tử đang được chọn bằng bàn phím; *tag Git* là nhãn đánh dấu một commit; *hotfix* là bản sửa gấp cho website đang chạy; *CLS* là chỉ số mức độ nhảy bố cục khi trang tải; *NFD* là dạng ký tự Unicode có dấu được lưu tách khỏi chữ cái nền.
