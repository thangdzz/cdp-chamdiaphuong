# CDP — PM REVIEW: Duyệt PLAN A4 và rà quy trình rollback

**Ngày:** 2026-11-13  
**Trạng thái:** **A4 PLAN APPROVED WITH CHANGES → BUILD A4 AUTHORIZED**; chưa deploy/release.  
**Căn cứ:** `docs/SPEC-A4-trang-chu.md`, `docs/VAN-HANH-RELEASE-ROLLBACK.md`, các quyết định PM đã khóa và xác nhận của chủ dự án ngày 13/11/2026.

## 1. Quyết định mới về ảnh — áp dụng trước A5

Chủ dự án **xác nhận toàn bộ ảnh địa điểm hiện có do chính chủ dự án chụp và tải lên CDP**. Các bản ghi tải qua form “Bổ sung ảnh” là dấu vết kỹ thuật của đường tải lên, không tự chứng minh người chụp là người khác.

- Chấp nhận xác nhận của chủ dự án làm căn cứ nội bộ để sử dụng **ảnh địa điểm hiện có** ở các vị trí mới tại A5–A8. Không tiếp tục dùng trạng thái “chưa xác minh người tải” làm cổng chặn cho lô ảnh này.
- Claude cập nhật `DECISIONS.md`, `STATUS.md`, `TASKS.md` và `docs/KIEM-KE-anh-legacy-2026-11-12.md` hoặc hồ sơ nguồn ảnh tương ứng bằng ghi chú: **“Chủ dự án xác nhận ngày 13/11/2026: ảnh hiện có do chính chủ dự án chụp/tải lên.”** Giữ bản ghi nguồn kỹ thuật gốc, không sửa giả log cũ hoặc biến các ID ẩn danh thành danh tính khẳng định.
- Phạm vi xác nhận **không bao gồm** ảnh do người khác đóng góp về sau, ảnh mua/từ nguồn ngoài hoặc ảnh chưa có trong lô hiện tại.
- Ở A6, thêm câu thông báo ảnh được công khai sau duyệt, cùng xác nhận người gửi có quyền chia sẻ ảnh. Đây là việc dành cho ảnh đóng góp *về sau*, không áp ngược cổng xác minh cho ảnh chủ dự án đã xác nhận.
- Không tự sửa/xóa/thay ảnh trên Redis hoặc Blob trong bước A4.

## 2. Bốn quyết định PLAN A4

| Câu | PM chốt | Cách thực hiện |
|---|---|---|
| Q1 — Câu dẫn | **A** | Giữ “Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.” |
| Q2 — Bỏ “CDP giúp bạn” | **A** | Bỏ khối này ở Trang chủ; hướng dẫn 3 bước chuyển vào thẻ “Bắt đầu Sổ đầu tiên”, mục “CDP là gì?” vẫn ở Menu |
| Q3 — Người mới | **A** | Thiết bị chưa có Sổ: hiện thẻ. Có Sổ: ẩn. Chưa tải xong/lỗi mạng: ẩn để tránh diễn đạt sai |
| Q4 — Kích thước thử | **A, điều chỉnh tiêu chí** | Thử 320×568, 360×640, 390×664, 390×844 và 1280×800; cả Chromium/WebKit |

**Chỉnh tiêu chí Q4:**
- Với **H1 mặc định**, ưu tiên hiển thị H1, ô tìm và 4 nhóm sớm trong màn hình đầu, đặc biệt trên 320×568. Báo cáo tọa độ và phần nào xuất hiện trước thanh đáy.
- **Không áp điều kiện tuyệt đối** rằng H1 đủ 60 ký tự rộng nhất vẫn phải nhét trọn ô tìm và cả 4 nhóm vào 320×568. Trường hợp H1 dài, chấp nhận cuộn dọc tự nhiên. Không cắt H1, không thu chữ quá nhỏ, không giấu nhóm, không che bởi thanh đáy, không cuộn ngang.
- Tiêu đề cũ >60 ký tự (nếu có) vẫn hiện đầy đủ và cho phép cuộn dọc, không tự sửa dữ liệu.
- Khi thu phóng chữ 125/150/200%, ưu tiên khả năng đọc và truy cập thao tác thay vì ép tất cả vào một màn hình.

**Sửa SPEC trước code:** H1 mặc định `Hôm nay bạn muốn ghé đâu?` có **25 ký tự Unicode NFC**, không phải 24. Bộ đếm mặc định phải là **25/60**. Phải kiểm thử số đếm từ code thực tế, không hardcode bộ đếm mẫu. Với NFD, chuẩn hóa NFC trước khi đếm.

## 3. Cho phép BUILD A4 theo ba commit

1. **A4-a:** Mặc định H1 + kiểm giới hạn 60 ký tự tại form Admin và tại server; paste dài giữ đủ nội dung; không cắt im lặng. Chỉ áp quy tắc 60 cho tiêu đề Trang chủ.
2. **A4-b:** Trang chủ Cơ bản theo bố cục B; khẩu hiệu → H1 → câu dẫn → ô tìm (không tự bật bàn phím) → Ăn/Chơi/Ngủ/Đi lại; bỏ “CDP giúp bạn”; chỉ hiện khối theo mùa khi đang/sắp có mốc; đổi màu theo vai trò.
3. **A4-c:** Thẻ người chưa có Sổ, ba bước và câu “Không cần đăng nhập. Sổ gắn với thiết bị này.” Dùng luồng đọc Sổ hiện có, không tạo API mới, không hé lộ mã ẩn danh trong log/ảnh.

**Giới hạn file:** Chỉ 9 file trong `SPEC-A4-trang-chu.md` §4 và tài liệu dự án cần cập nhật. Không sửa các màn A5–A9, không thêm tính năng đợt B, không sửa Redis/Blob, không thay API ngoài phần kiểm tra dữ liệu form đã mô tả. Nếu phải thay đổi kế hoạch hoặc file ngoài danh sách, báo PM trước.

## 4. Nghiệm thu A4

- H1 mặc định **25/60**, hiển thị đủ, đúng thông điệp “Hôm nay bạn muốn ghé đâu?”. Tên thương hiệu “Chạm Địa Phương” luôn đầy đủ.
- Admin: bộ đếm NFC/NFD đúng; 60 được lưu; 61 bị chặn; dán 80 không bị cắt; chữ đã nhập còn nguyên khi lỗi trong trình duyệt; server từ chối vượt giới hạn; không ảnh hưởng các tiêu đề khác.
- Thẻ người mới đạt 4 trạng thái trong SPEC, kể cả máy có mã ẩn danh nhưng chưa có Sổ và trạng thái mạng lỗi.
- Không tự focus ô tìm; nhóm địa điểm và lối tìm kiếm dùng được; các sự kiện theo dõi hiện có không bị nhân đôi.
- Tình trạng lễ hội cũ đã hết không còn chiếm diện tích Trang chủ; trang lưu trữ vẫn truy cập được.
- Không lỗi bố cục/che nút, không cuộn ngang tại các kích thước duyệt; CLS ≤0,1 và không tệ hơn trước.
- Lint, test, build đạt; kiểm hồi quy A1–A3; không deploy. Báo ảnh trước/sau trên các kích thước, đặc biệt 320×568 và 390×664; không đưa ảnh/danh tính Sổ thật vào báo cáo.

## 5. PM rà `VAN-HANH-RELEASE-ROLLBACK.md`

**Kết luận:** Duyệt **khung quy trình** làm hồ sơ vận hành, **chưa duyệt là phương án đã diễn tập**. Cập nhật các điểm sau:

1. **Mốc code:** giữ bất biến tag `prod-2026-09-30` → `e3b38a4`. Việc tag tồn tại **không chứng minh** deployment hiện hành trên Vercel. Trước RELEASE A phải đăng nhập và đối chiếu deployment ID, commit và domain thực tế.
2. **Rollback tức thời:** trên gói Hobby chỉ về **production liền trước**; do đó RELEASE A chỉ chắc về bản 30/9 nếu kiểm chứng không có deploy xen giữa. Sau RELEASE B, bản liền trước thường là A, không mặc định là 30/9. Xác minh trên Dashboard/CLI và hồ sơ release trước khi quyết định.
3. **Promote bản 30/9:** chưa xác minh khả năng này đối với tài khoản/gói của CDP. **Không gọi đây là đường quay lại chắc chắn**; tài liệu Vercel có khác biệt theo loại deployment. Không dùng `vercel promote` trên production chỉ để thử quyền.
4. **Deploy mã cũ từ tag (phương án C):** đổi cách gọi từ “luôn làm được” thành **phương án dự phòng cần diễn tập**. Phải kiểm môi trường build, biến môi trường, tài khoản, cấu hình dự án, cron, tương thích Redis/Blob, thư mục `.vercel` và domain. Có thể dùng worktree riêng; không giả định sao chép `project.json` vào thư mục chưa tồn tại sẽ chạy. Chuẩn bị quy trình liên kết dự án chính xác (`vercel link` nếu cần), kiểm ID trước mọi thao tác.
5. **Không động production trong A4.** Mọi diễn tập liên quan promote/rollback chỉ thực hiện ở dự án thử tách biệt hoặc qua bước kiểm tra không thay đổi production; hành động trên production cần lệnh riêng của chủ dự án.
6. **Rollback không phục hồi dữ liệu.** Đối chiếu tương thích bản cũ với Redis, Blob và cấu hình có sau release; không dùng `git reset --hard`/force-push `main` để quay lại website.
7. Trước RELEASE A/B: **chốt đường quay lại thực sự khả dụng**, xác nhận backup theo quyền chủ dự án, kiểm tra sau rollback và ghi đường dẫn bản phát hành đã xác minh. Nếu chưa chốt, **không RELEASE**.

**Tài liệu Vercel tham khảo (kiểm 13/11/2026):**
- https://vercel.com/docs/instant-rollback
- https://vercel.com/docs/cli/rollback
- https://vercel.com/docs/deployments/promoting-a-deployment
- https://vercel.com/docs/deployments/rollback-production-deployment

## 6. Bàn giao và trạng thái

Claude cần:
- Cập nhật SPEC A4, DECISIONS, STATUS, TASKS, HANDOFF và tài liệu vận hành rollback theo các quyết định trên.
- Ghi quyết định về ảnh của chủ dự án vào tài liệu chuẩn; bỏ chặn ảnh cũ tại A5–A8 vì lý do chưa biết người tải, nhưng không xóa lịch sử kiểm kê.
- Triển khai A4-a → A4-b → A4-c thành commit riêng, kiểm thử sau mỗi commit; push theo quy trình repo.
- Gửi `REPORT A4` với mã commit, file diff, kết quả test, ảnh trước/sau, bất thường, cách revert.
- **Chưa làm A5. KHÔNG DEPLOY/RELEASE/ROLLBACK.**

**Trạng thái:** A1–A3 ACCEPTED → **A4 BUILD AUTHORIZED** → A4 REVIEW → A5 PLAN. Quy trình rollback: **DOCUMENTED, NOT YET VERIFIED ON ACCOUNT**.
