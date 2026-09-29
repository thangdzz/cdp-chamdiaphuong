# CLAUDE.md — Dự án: chamdiaphuong (Chạm Địa Phương)

## Dự án này là gì
Web mobile-first **gom, tổ chức và duy trì thông tin địa phương** (Ăn · Chơi · Ngủ · Đi lại)
để người dùng ra quyết định thực tế, thay vì tự ghép dữ liệu rời rạc. **Người địa phương là
nền móng dữ liệu**; khách đến địa phương dùng nền dữ liệu đó. Người dùng lưu địa điểm vào
**Sổ**, ghép thành **Lộ trình**, và chia sẻ — chức năng cơ bản không bắt buộc đăng nhập.

**Nguồn chuẩn cao nhất: [docs/PRODUCT.md](docs/PRODUCT.md).** Phạm vi đang build:
[docs/SCOPE-vNext.md](docs/SCOPE-vNext.md) (FROZEN). Tài liệu nào nói khác PRODUCT thì PRODUCT
thắng. File này chỉ nói **cách làm việc**.

## Người chủ dự án
Anh là solo creator, **không rành kỹ thuật (non-tech)**. Mọi giải thích phải bằng tiếng Việt
đơn giản, tránh thuật ngữ khi không cần thiết; nếu buộc phải dùng thuật ngữ kỹ thuật, giải
thích ngắn ngay sau đó.

## Chia việc giữa các công cụ (cập nhật 2026-09-14)
- **Cowork (Claude desktop):** bàn hướng đi, thiết kế, brainstorm, và **cập nhật tài liệu
  `.md`**. Không code ở đây.
- **Antigravity:** nơi viết code thật. Trong Antigravity, agent code chính là **Claude Code**
  (vẫn trình kế hoạch trước khi code); **Codex** chỉ dự phòng khi Claude hết usage.

Bàn giao giữa Claude Code và Codex đi qua `docs/HANDOFF.md` trên GitHub — quy tắc ở
[AGENTS.md](AGENTS.md) §7.

## Quy tắc làm việc bắt buộc

1. **Trước khi code: phải trình kế hoạch ngắn gọn để anh duyệt.**
   Kế hoạch nói rõ: làm gì, vì sao, ảnh hưởng gì. Chỉ code sau khi anh đồng ý.
2. **Làm từng việc nhỏ.** Không gộp nhiều thay đổi lớn vào một lần. Mỗi bước xong phải có
   thứ xem/bấm thử được, hoặc ít nhất kiểm tra được là đúng.
3. **Không tự ý mở rộng phạm vi.** Nếu thấy có thể làm thêm gì hay ho, đề xuất riêng —
   không tự làm luôn. Ý tưởng phát sinh → ghi vào [docs/INBOX.md](docs/INBOX.md).
4. **Cuối mỗi phiên làm việc: cập nhật [docs/STATUS.md](docs/STATUS.md)** (và
   [docs/TASKS.md](docs/TASKS.md)). STATUS chỉ giữ **trạng thái hiện tại** — ghi đè, không cộng
   dồn thành nhật ký: đang ở đâu, còn gì dang dở, bước tiếp theo hợp lý nhất.
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
- [docs/PRODUCT.md](docs/PRODUCT.md) — **nguồn chuẩn cao nhất**: vì sao CDP tồn tại, phục vụ ai,
  làm gì, không làm gì, nguyên tắc chọn feature
- [docs/SCOPE-vNext.md](docs/SCOPE-vNext.md) — phạm vi đang build (FROZEN): MUST / MAY / NOT NOW
- [docs/TASKS.md](docs/TASKS.md) — việc đang thực sự active
- [docs/BACKLOG.md](docs/BACKLOG.md) — đã review, có giá trị, chờ phase phù hợp. **Không tự làm**
- [docs/INBOX.md](docs/INBOX.md) — ý tưởng chưa review / thuộc NOT NOW. **Không tự làm**
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — **đọc trước khi code**: dữ liệu nằm đâu,
  file nào làm gì, chỗ nào cần cẩn thận
- [docs/DESIGN.md](docs/DESIGN.md) — **đọc trước khi dựng UI** (tên cũ `SPEC-giao-dien.md`)
- [docs/ROUTINE.md](docs/ROUTINE.md) — lịch quét dữ liệu hằng ngày: nằm ở đâu, làm gì, bản
  sao lưu nội dung lệnh, cách dựng lại nếu mất. **Cập nhật mỗi khi sửa nội dung routine.**
- [docs/STATUS.md](docs/STATUS.md) — tình trạng hiện tại, cập nhật mỗi phiên
- [docs/DECISIONS.md](docs/DECISIONS.md) — nhật ký các quyết định quan trọng
- [docs/HANDOFF.md](docs/HANDOFF.md) — bàn giao Claude Code ↔ Codex
- `docs/SPEC-*.md` — spec chi tiết, viết ngay trước khi code một mảng
- `docs/reference/` — **tài liệu tham khảo, KHÔNG phải yêu cầu tính năng.** Nghiên cứu, tư
  liệu bối cảnh. Đọc để đối chiếu và tìm khoảng trống; **không tự biến thành việc phải làm.**
  Muốn đề xuất gì từ đây thì trình anh duyệt như mọi việc khác.
- `docs/archive/` — tài liệu đã hết vai trò (PRD, ROADMAP, NOTE, SPEC chặng cũ, game Thành
  Tuyên, nhật ký cũ). **Không phải nguồn chuẩn** — chỉ tra khi cần biết vì sao code như vậy.
  Mục lục: [docs/archive/README.md](docs/archive/README.md)
