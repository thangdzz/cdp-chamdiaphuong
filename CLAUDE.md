# CLAUDE.md — Dự án: chamdiaphuong (Chạm Địa Phương)

## Dự án này là gì
Công cụ giúp khách du lịch và người dân Tuyên Quang tìm nhanh chỗ ăn/ngủ đáng tin, biết
được ước lượng còn chỗ hay không, giá tầm nào, để quyết định nhanh — đặc biệt lúc đông
khách (ví dụ dịp Trung Thu Tuyên Quang).

Chi tiết đầy đủ nằm ở [docs/PRD.md](docs/PRD.md). File này chỉ nói **cách làm việc**.

## Người chủ dự án
Anh là solo creator, **không rành kỹ thuật (non-tech)**. Mọi giải thích phải bằng tiếng Việt
đơn giản, tránh thuật ngữ khi không cần thiết; nếu buộc phải dùng thuật ngữ kỹ thuật, giải
thích ngắn ngay sau đó.

## Quy tắc làm việc bắt buộc

1. **Trước khi code: phải trình kế hoạch ngắn gọn để anh duyệt.**
   Kế hoạch nói rõ: làm gì, vì sao, ảnh hưởng gì. Chỉ code sau khi anh đồng ý.
2. **Làm từng việc nhỏ.** Không gộp nhiều thay đổi lớn vào một lần. Mỗi bước xong phải có
   thứ xem/bấm thử được, hoặc ít nhất kiểm tra được là đúng.
3. **Không tự ý mở rộng phạm vi.** Nếu thấy có thể làm thêm gì hay ho, đề xuất riêng —
   không tự làm luôn.
4. **Cuối mỗi phiên làm việc: cập nhật [docs/STATUS.md](docs/STATUS.md).**
   Ghi: đã làm gì trong phiên này, còn gì dang dở, bước tiếp theo hợp lý nhất.
5. **Quyết định quan trọng (đổi hướng, đổi công nghệ, đổi phạm vi) phải ghi vào
   [docs/DECISIONS.md](docs/DECISIONS.md)** kèm lý do — để sau này không quên vì sao đã
   chọn vậy.
6. **Dữ liệu địa điểm (quán ăn/khách sạn) không tự ý đăng công khai.** Điểm nào quan trọng
   hoặc dữ liệu không chắc chắn phải chờ anh (hoặc người anh tin tưởng) duyệt trước.
7. Nếu yêu cầu còn mơ hồ, hỏi lại **1 câu một**, không hỏi dồn nhiều câu cùng lúc.

## Ngôn ngữ
- Giao tiếp, giải thích, comment cấp cao: tiếng Việt.
- Tên file, tên biến, tên hàm, commit message: tiếng Anh.
- Nội dung hiển thị cho người dùng cuối (khách xem web): tiếng Việt là chính.

## Tài liệu liên quan
- [docs/PRD.md](docs/PRD.md) — sản phẩm này làm gì, cho ai, phạm vi bản đầu
- [docs/ROADMAP.md](docs/ROADMAP.md) — chia giai đoạn nhỏ
- [docs/STATUS.md](docs/STATUS.md) — tình trạng hiện tại, cập nhật mỗi phiên
- [docs/DECISIONS.md](docs/DECISIONS.md) — nhật ký các quyết định quan trọng
