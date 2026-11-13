# PM REVIEW — Nghiệm thu A3 và quy tắc quay về bản trước thiết kế

Ngày: 2026-11-13  
Dự án: CDP — Chạm Địa Phương  
Trạng thái: **A3 TECHNICALLY ACCEPTED → A4 PLANNING**. **CHƯA DEPLOY, CHƯA RELEASE, CHƯA BUILD A4.**

## 1. Nghiệm thu A3

PM chấp nhận kết quả kỹ thuật A3 **dựa trên REPORT-A3-anh-minh-hoa-2026-11-12.md và PDF kiểm thử**; đây không phải xác nhận đã kiểm tra trực tiếp remote Git hoặc Vercel.

- 5 SVG đúng bản đã duyệt, sử dụng chung cho 5 nhóm.
- Chọn ảnh: 344 địa điểm, 16 có ảnh đại diện thực, 328 dùng minh họa, 0 ảnh menu làm đại diện; đúng một địa điểm đổi cách chọn ảnh.
- Ảnh menu vẫn hiển thị trong mục thực đơn, không xuất hiện làm bìa Chi tiết/Sổ hoặc ảnh xem trước chia sẻ.
- Dữ liệu `/tim` tăng 0,97 KB gzip; component PlaceThumb có xử lý ảnh lỗi, thay địa điểm/URL và không lặp tải ảnh đã lỗi.
- Lint/build đạt, 87/87 bài test theo báo cáo; hồi quy A1/A2 không phát sinh thay đổi ngoài phạm vi.
- Chưa phát hành và chưa thay đổi dữ liệu Redis.

### Điều kiện mang sang A5–A8

1. **Quyền sử dụng ảnh:** 25 ảnh legacy có nguồn gửi qua form nhưng chưa có bằng chứng chấp thuận phạm vi sử dụng; 21 ảnh khách gửi sau đó cũng cùng tình trạng. Bản ghi Admin duyệt không thay thế bằng chứng quyền tác giả/quyền sử dụng. Không hiện các ảnh chưa xác minh ở **vị trí mới** tại A5–A8; tạm dùng SVG đúng nhóm. Chỉ dùng ảnh thật nếu đã xác minh quyền sử dụng, kể cả ảnh Admin tải. Duy trì hồ sơ kiểm kê nội bộ, không công khai dữ liệu người gửi.
2. A6 bổ sung thông tin công khai ảnh và xác nhận quyền từ người gửi, **chỉ cho ảnh gửi mới**; không mặc nhiên áp hồi tố cho ảnh cũ. Kiểm tra riêng việc ảnh cũ đang xuất hiện ở trang Chi tiết, có kế hoạch xử lý nếu phát hiện tranh chấp.
3. A6 chỉnh tỷ lệ khung minh họa: hình Chơi giữ mặt hồ, hình Đi lại giữ bánh xe; tránh dùng `object-cover` để cắt nội dung chính của SVG 3:2 trong khung siêu rộng.
4. Kiểm tra hạn mức tối ưu ảnh của Vercel khi đăng nhập lại, trước RELEASE A.

## 2. Quy tắc khôi phục giao diện trước thiết kế — BẮT BUỘC CHO RELEASE A/B

### Mốc đã biết từ báo cáo Claude
- Mã nguồn baseline: tag `prod-2026-09-30` → commit `e3b38a4`.
- Production ngày 30/9 được báo cáo là chưa thay; **chưa xác minh trực tiếp trên Vercel vì CLI hết đăng nhập**.
- A1–A3 chỉ nằm trên GitHub `main`, chưa deploy.

### Hai loại quay lại khác nhau

**A. Quay lại website đang chạy (ưu tiên khi có sự cố):** Dùng Instant Rollback trên Vercel hoặc CLI sau khi xác nhận đúng dự án, đúng deployment và đã đăng nhập:

```sh
vercel login
vercel list --prod
vercel rollback
vercel rollback status
```

`vercel rollback` quay về **deployment production liền trước**, không có nghĩa luôn quay được về bản 30/9. Gói Hobby chỉ cho rollback về deployment liền trước; Pro/Enterprise cho phép chỉ định deployment cũ đủ điều kiện: `vercel rollback <deployment-id-hoac-url>`. Không đoán ID/URL. Cần có phương án dự phòng nếu deployment 30/9 không còn đủ điều kiện.

**B. Quay về mã nguồn trước thiết kế:** tag `prod-2026-09-30` dùng để dựng **nhánh/worktree khôi phục riêng**, kiểm thử và deploy mới khi được chủ dự án duyệt. Không `git reset --hard` + force-push `main`; không tự xoá commit A1–A3. Bản code cũ không đồng nghĩa khôi phục dữ liệu.

### Cổng kiểm tra trước mỗi release

- Dùng `vercel login` để đọc và xác minh: dự án, gói, deployment ID/URL thực sự đang chạy, mốc ổn định 30/9, cách trỏ domain và tình trạng rollback eligibility. Ghi vào hồ sơ release. Không lấy commit Git làm bằng chứng duy nhất của bản Vercel.
- Thử **diễn tập rollback** ở phạm vi không ảnh hưởng production, hoặc lập kế hoạch kỹ thuật khả thi có xác nhận trên Vercel nếu không diễn tập được.
- Trước RELEASE A ghi lại deployment production hiện tại. Trước RELEASE B ghi cả deployment A và baseline 30/9; ghi rõ liệu có thể trở về trực tiếp baseline hay phải tái triển khai từ tag.
- Sao lưu/ghi nhận trạng thái dữ liệu Redis và các tài nguyên bên ngoài trước release; kiểm tính tương thích schema/API của code cũ với dữ liệu hiện tại. Vercel rollback không khôi phục Redis, Blob, biến môi trường, domain hoặc các thay đổi đã ghi bởi người dùng.
- Sau rollback, kiểm website công khai, tìm kiếm, Chi tiết, Sổ/Lộ trình, Admin và các đường API đọc/ghi an toàn; xác nhận domain trỏ đúng deployment; theo dõi log.
- Không tự rollback hoặc deploy nếu chưa có lệnh của chủ dự án, trừ quy trình ứng cứu đã được chủ dự án phê duyệt riêng.

### Lệnh/dẫn chứng tham khảo
- Vercel CLI: https://vercel.com/docs/cli/rollback
- Quy trình rollback: https://vercel.com/docs/deployments/rollback-production-deployment
- Hạn chế từng gói và rollback khác với khôi phục DB: https://vercel.com/docs/instant-rollback

## 3. Giao Claude tiếp theo

1. Cập nhật STATUS, TASKS, HANDOFF, DECISIONS theo nghiệm thu A3 và **quy tắc rollback ở mục 2**. Đưa checklist này vào RELEASE A và RELEASE B.
2. Duy trì bảng ảnh chưa xác minh trong tài liệu nội bộ; không cho ảnh đó vào các bề mặt mới ở A5–A8. Cập nhật TASKS A6 về form gửi ảnh và tỷ lệ minh họa.
3. Lập PLAN A4 (Trang chủ B + giới hạn 60 ký tự Admin), liệt kê file, cam kết không làm A5, test, rollback và rủi ro.
4. Chưa BUILD A4; chưa deploy/release. Gửi PLAN A4 để PM duyệt riêng.

## 4. Ghi chú

Quy tắc **giao diện Cơ bản/Bản đồ gấp có nút đổi chế độ ở đợt B** là khả năng đổi trải nghiệm trong cùng version, **không phải** rollback về code ngày 30/9. Hai cơ chế không được gọi lẫn nhau.

Chú giải: rollback = quay về bản ứng dụng đã triển khai; deployment = một bản ứng dụng đã đưa lên Vercel; baseline = mốc mã nguồn ban đầu; worktree = thư mục làm việc Git riêng; SVG = ảnh đồ họa dạng đường nét có thể co giãn.
