# PM XÁC NHẬN FREEZE — CDP vNext UX/UI Bản đồ gấp + Cơ bản

**Ngày:** 2026-11-12  
**Đầu vào:** `docs/FREEZE-UXUI-ban-do-gap-2026-11-12.md` và báo cáo FREEZE của Claude.  
**Trạng thái quyết định:** **FREEZE RECORD ACCEPTED → ALLOW A1 PLAN ONLY**.  
**Giới hạn kiểm chứng:** PM đã review nội dung bản ghi được cung cấp; chưa xác minh trực tiếp GitHub HEAD, cây commit, trạng thái production hoặc toàn văn mọi tài liệu trong repo.

## 1. Quyết định PM

1. **Xác nhận FREEZE hồ sơ thiết kế và phạm vi** dựa trên bản ghi cung cấp: SCOPE v1.0, DESIGN.md v2.0, 19 quyết định, phạm vi và checklist riêng cho release A/B.
2. **Cho phép Claude lập và trình kế hoạch BUILD A1** (màu theo vai trò + font) để duyệt. **Chưa cho phép sửa code sản phẩm, build, test toàn đợt hay release.** Chỉ sau khi kế hoạch A1 được duyệt mới bắt đầu code A1.
3. **Giữ nguyên thứ tự:** A1 → khung trang/điều hướng → minh họa/ảnh thẻ → Trang chủ/Admin → Tìm chỗ → Chi tiết/Lưu/Hoàn tác → Sổ → Lộ trình → màn phụ → TEST A → RELEASE A. Đợt B triển khai sau khi A ổn định.
4. **Giữ phạm vi cố định**: đợt A không có nút chuyển giao diện, chọn ngẫu nhiên, Sổ/Lộ trình gần đây hay hoạt ảnh giấy của đợt B. Các công năng hiện hữu phải giữ nguyên.
5. **Giữ quy tắc dữ liệu Sổ/Lộ trình đã chốt:** chưa có đồng bộ tự động đa thiết bị khi chưa có tài khoản/cơ chế đồng bộ; mã 6 số là khôi phục thủ công, không phải đồng bộ. Không hỏi lại PM ở session mới.
6. **Hai vấn đề khôi phục** tiếp tục là BACKLOG ưu tiên sớm; không thêm lối vào mới hoặc thay luồng khôi phục trong BUILD A. Khi chạm phần Sổ phải kiểm thử tránh làm xấu thêm hành vi hiện hữu.

## 2. Bổ sung hồ sơ FREEZE (không chặn trình A1)

- Báo cáo nêu `3d5a419` (FREEZE) và `1406f98` (commit ghi mã vào record), nhưng record chỉ nêu `3d5a419`. Claude kiểm tra `git log`, ghi cả hai mã, mô tả chức năng từng commit và HEAD sau cập nhật.
- Record gọi `fa6c5f6` là "commit gốc trước FREEZE", đồng thời báo cáo nói đã kéo 50 commit routine. Claude phân biệt **mốc gốc của công việc** và **commit cha trực tiếp của FREEZE**; không tự suy luận cây commit.
- Xác nhận các thay đổi trong hai commit chỉ gồm tài liệu, không chạm code hoặc dữ liệu địa điểm; báo PM ngay nếu thực tế khác báo cáo.
- Đồng bộ `origin/main` trước bất kỳ bước code nào, kiểm tra xung đột với các commit routine. Không tự sửa lại lịch sử Git.

## 3. PRODUCT.md — chưa được chủ dự án phê duyệt riêng

PM **đồng ý hướng nội dung** hai sửa trong FREEZE record §4 (đường dẫn SCOPE mới và giải thích Sổ/Lộ trình, mã khôi phục 6 số). Tuy nhiên Claude **chưa được tự sửa `PRODUCT.md`** theo quyết định này; tiếp tục giữ trạng thái "chờ chủ dự án duyệt". Việc này không chặn A1. Nếu chuẩn hóa nhãn, nên dùng "Phạm vi hiện hành" thay vì "Phạm vi đang build" trước lúc bắt đầu code, nhưng không tự ý sửa khi chưa được duyệt.

## 4. Claude phải trình gì trong kế hoạch A1

Kế hoạch A1 phải ngắn, đủ kiểm tra trước khi code, bao gồm:

1. **Danh sách file dự kiến tác động** và bảng vị trí hiện đang dùng màu/font viết cứng; tách phạm vi A1 khỏi các màn hình hoặc Admin chưa đến bước sửa.
2. **Bảng màu theo vai trò** (nền, bề mặt, chữ, viền, trạng thái, nút, focus) với mã màu cụ thể, chỉ rõ cách ánh xạ từ màu cũ; logo giữ nguyên `#C8553D`, nút hành động dùng `#B04A33` theo quyết định trước.
3. **Quy tắc font** (Be Vietnam Pro, Literata theo DESIGN.md), độ đậm thực dùng, fallback khi font lỗi/chậm, tải có chọn lọc, hiển thị dấu tiếng Việt.
4. **Giới hạn sửa code:** ưu tiên hệ biến màu dùng chung và các thành phần nền tảng; không thay hành vi tìm kiếm, Sổ, Lộ trình, API, lưu trữ hay telemetry ở A1; không thay hàng loạt 1.000 vị trí màu mà chưa phân loại và kiểm tra.
5. **Tiêu chí nghiệm thu riêng A1:** tương phản chữ/nút và trạng thái focus, khả năng đọc tiếng Việt, không nhảy bố cục khi font tải; kiểm tra 320/360/390 px và màn hình desktop; dark-mode nếu code hiện hỗ trợ thì không được hỏng; kiểm tra ảnh hưởng tới giao diện production hiện có ở môi trường phát triển.
6. **Cách kiểm thử và quay lại:** kiểm tra build/lint/test hiện có khi được cho code; điểm kiểm soát sau commit A1, diff giới hạn phạm vi, cách revert nếu gây lỗi.
7. **Rủi ro, phụ thuộc, thứ tự commit** và những lựa chọn cần PM quyết định trước khi code. Nếu A1 còn phụ thuộc refactor nhiều file, đề xuất chia bước nhỏ hơn.

## 5. Bất biến xuyên suốt

- Hai chế độ giao diện chia sẻ dữ liệu và chức năng; đợt A chỉ cung cấp giao diện Cơ bản mới.
- Thẻ địa điểm: ảnh thật nếu có, nếu thiếu dùng minh họa giấy theo loại và thể hiện rõ đó là minh họa; bỏ qua ảnh chỉ có menu khi chọn ảnh đại diện.
- Trang chủ giữ tiêu đề "Hôm nay bạn muốn ghé đâu?", khẩu hiệu "Gom chỗ hay. Chia sẻ dễ dàng.", bốn nhóm Ăn / Chơi / Ngủ / Đi lại.
- Không thêm chức năng tài khoản/đồng bộ đa thiết bị trong release A/B.
- Không đổi production trước khi qua TEST và PM duyệt RELEASE từng đợt.

## 6. Đầu ra mong đợi

Claude phản hồi **bản A1 PLAN để PM duyệt**, kèm xác minh ba mục Git ở §2. Không tự BUILD A1. Nếu mọi điểm đủ rõ, PM sẽ ra quyết định `A1 PLAN APPROVED → BUILD A1` ở lượt tiếp theo.

**Nguồn chuẩn:** `docs/SCOPE-UXUI-ban-do-gap.md` (FROZEN v1.0), `docs/DESIGN.md` (v2.0); bản mockup chỉ tham khảo khi khác nguồn chuẩn.
