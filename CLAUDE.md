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

## Chia việc giữa các công cụ (từ 2026-08-11)
- **Cowork (Claude desktop):** bàn hướng đi, thiết kế, brainstorm, và **cập nhật tài liệu
  `.md`**. Không code ở đây.
- **Antigravity:** nơi viết code thật.

Nghĩa là: ở Cowork, sau khi chốt thiết kế thì ghi vào `docs/`, rồi bàn giao sang Antigravity
để code — không tự viết code trong phiên Cowork trừ khi anh nói khác.

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
6. **Dữ liệu địa điểm (quán ăn/khách sạn) do AI quét được thì tự động đăng công khai luôn**
   (kể cả độ tin cậy thấp — hiển thị rõ độ tin cậy cho khách tự đánh giá, không giấu).
   **Chỉ giữ lại chờ anh (hoặc người anh tin tưởng) duyệt khi hệ thống phát hiện nghi trùng
   lặp hoặc mâu thuẫn dữ liệu.** Gỡ 1 chỗ khỏi công khai (nghi đã đóng cửa/không còn hoạt
   động) luôn phải qua duyệt, không tự động xoá. (Đổi hướng 2026-07-17, xem lý do ở
   [docs/DECISIONS.md](docs/DECISIONS.md) — nguyên tắc trước đó là "luôn phải duyệt".)
7. Nếu yêu cầu còn mơ hồ, hỏi lại **1 câu một**, không hỏi dồn nhiều câu cùng lúc.

## Ngôn ngữ
- Giao tiếp, giải thích, comment cấp cao: tiếng Việt.
- Tên file, tên biến, tên hàm, commit message: tiếng Anh.
- Nội dung hiển thị cho người dùng cuối (khách xem web): tiếng Việt là chính.

## Tài liệu liên quan
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **đọc trước khi code**: dữ liệu nằm đâu,
  file nào làm gì, chỗ nào cần cẩn thận
- [docs/PRD.md](docs/PRD.md) — sản phẩm này làm gì, cho ai, phạm vi bản đầu
- [docs/NOTEBOOK-DESIGN.md](docs/NOTEBOOK-DESIGN.md) — thiết kế hướng "cuốn sổ địa phương"
  (chốt 2026-08-11, hướng đi hiện tại — đọc cùng PRD)
- [docs/ROADMAP.md](docs/ROADMAP.md) — chia giai đoạn nhỏ
- `docs/SPEC-chang-N.md` — mô tả chi tiết từng chặng, viết ngay trước khi code chặng đó
- [docs/STATUS.md](docs/STATUS.md) — tình trạng hiện tại, cập nhật mỗi phiên
- [docs/DECISIONS.md](docs/DECISIONS.md) — nhật ký các quyết định quan trọng
