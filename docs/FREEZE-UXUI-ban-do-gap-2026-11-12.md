# FREEZE RECORD — vNext UX/UI: Bản đồ gấp + Cơ bản

| | |
|---|---|
| Ngày FREEZE | **2026-11-12** |
| Trạng thái | **FREEZE tài liệu hoàn tất — chờ PM xác nhận trước BUILD A.** Chưa BUILD, chưa TEST, chưa RELEASE |
| Commit gốc trước FREEZE | `fa6c5f6` (`origin/main`, đã đồng bộ 50 commit quét dữ liệu tự động) |
| Commit FREEZE | `Freeze vNext UX/UI design and scope documents` — mã commit ghi ở mục cuối |
| Production lúc FREEZE | `chamdiaphuongio-og2r8pgy7` (30/9) = vNext Core Discovery `e3b38a4`. **Không đổi** |
| Quyết định PM | [PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md](PM-FINAL-REVIEW-DESIGN-CDP-BAN-DO-GAP-2026-11-12.md) |

## 1. Tài liệu đã khóa

| Tài liệu | Trạng thái |
|---|---|
| [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) | **FROZEN v1.0** — 19 quyết định khóa, phạm vi đợt A / B, checklist nghiệm thu A / B, thứ tự BUILD |
| [DESIGN.md](DESIGN.md) | **v2.0, hiệu lực 12/11/2026** — thay bản v1 |
| `docs/design/minh-hoa/` (`an`, `choi`, `ngu`, `dilai`, `khac`.svg) | Tài sản đã duyệt hướng; chưa vào production; đăng ký ở DESIGN §5 |
| [DECISIONS.md](DECISIONS.md) mục 11/11 → 12/11 (cuối) | Ghi đủ quyết định; câu màu cũ đã đánh dấu bị thay |
| Quy tắc Sổ / tài khoản / đồng bộ | DECISIONS 2026-11-12 + ARCHITECTURE “Truy cập Sổ/Lộ trình từ thiết bị khác” + HANDOFF §0 + STATUS + CLAUDE.md quy tắc 8 + AGENTS.md. **Không hỏi lại ở session sau** |
| Lưu trữ | [archive/2026-11-uxui-freeze/](archive/2026-11-uxui-freeze/): DESIGN v1 (`git mv`, giữ lịch sử) + bản đề xuất DESIGN v2; [archive/README.md](archive/README.md) đã thêm dòng |
| Tham khảo (không phải nguồn chuẩn) | Mockup 9 bảng https://claude.ai/artifact/DH3MS2vJQAxwH4niPBFzEo — **DESIGN.md thắng khi khác nhau** |

Rà mâu thuẫn (12/11): PRODUCT · DECISIONS · ARCHITECTURE · HANDOFF · STATUS · TASKS · BACKLOG · CLAUDE.md · AGENTS.md.
Đã sửa: các chỗ trỏ “phạm vi đang build” về SCOPE-vNext cũ (CLAUDE, AGENTS, ARCHITECTURE, TASKS); lối vào “Dùng trên
máy khác?” bị bỏ khỏi DESIGN và mockup; 2 lỗi khôi phục tách thành 2 mục BACKLOG. **Còn 1 chỗ cần chủ dự án duyệt:
PRODUCT.md (mục 4).**

## 2. Phạm vi

- **Đợt A — Cơ bản mới:** token + font, thanh đáy 4 mục, bộ minh họa + ảnh thẻ tìm kiếm (P0), Trang chủ B (không
  autofocus), giới hạn 60 ký tự tiêu đề trong Admin, Tìm chỗ, Chi tiết + Lưu + Hoàn tác, Sổ, Lộ trình, màn phụ, trạng
  thái. **Không** có công tắc giao diện, Chọn ngẫu nhiên, Sổ/Lộ trình gần đây. Chi tiết: SCOPE §2.
- **Đợt B — Bản đồ gấp:** công tắc (Menu / cuối sidebar) + chống nháy + ghi nhớ + gợi ý 1 lần, lớp Bản đồ gấp, Sổ gần
  đây, Lộ trình gần đây, Chọn ngẫu nhiên, MỞ / GẤP / NỐI, analytics theo `theme`. Chi tiết: SCOPE §3.
- Checklist nghiệm thu: SCOPE §4 (A) và §5 (B). Rollback riêng mỗi đợt bằng promote bản deploy trước.

## 3. Thứ tự BUILD dự kiến

**A:** token + font → khung + thanh đáy + Menu → minh họa + hàm chọn ảnh + dữ liệu ảnh thẻ → Trang chủ + giới hạn
tiêu đề Admin → Tìm chỗ → Chi tiết + Lưu + Hoàn tác → Sổ → Lộ trình → màn phụ + trạng thái → TEST A → RELEASE A.
**B:** công tắc → lớp Bản đồ gấp → Sổ/Lộ trình gần đây → Chọn ngẫu nhiên → chuyển động → analytics → gợi ý 1 lần →
TEST B → RELEASE B. Mỗi bước một commit; trình kế hoạch ngắn trước khi code theo CLAUDE.md.

## 4. Đề xuất sửa PRODUCT.md — chờ chủ dự án duyệt (chưa sửa)

1. Dòng 8, thay `Phạm vi đang build: [SCOPE-vNext.md](SCOPE-vNext.md).` bằng
   `Phạm vi đang build: [SCOPE-UXUI-ban-do-gap.md](SCOPE-UXUI-ban-do-gap.md) (FROZEN 2026-11-12).`
2. Thêm vào cuối khối “Ghi chú diễn giải” (sau dòng 12):
   > **Lưu và đồng bộ (2026-11-12):** Sổ và Lộ trình gắn với thiết bị qua mã ẩn danh, chưa có đồng bộ tự động; mã
   > khôi phục 6 số là khôi phục thủ công. Khi có tài khoản và cơ chế đồng bộ thì người dùng mới có Sổ/Lộ trình trên
   > nhiều thiết bị; tài khoản không bắt buộc cho việc tra cứu và lưu trên một thiết bị.

Không duyệt hai sửa này cũng **không chặn BUILD A**: DECISIONS + CLAUDE.md đã mang đủ quy tắc.

## 5. Rủi ro còn lại

| Rủi ro | Mức | Xử lý ở đâu |
|---|---|---|
| **[Khôi phục-1]** lần lưu đầu không cho khách thấy mã 6 số | Cao (mất truy cập Sổ khi đổi máy) | BACKLOG §3, PM xếp ưu tiên sớm; không thêm CTA khôi phục trước khi sửa |
| **[Khôi phục-2]** nhập mã trên máy đã có Sổ ghi đè hồ sơ | Cao | BACKLOG §3, như trên |
| Ảnh thật chỉ 4,7%; minh họa phải rõ bản chất | Trung bình | Nhãn + alt (DESIGN §5); BACKLOG §6 thu thập ảnh |
| ~1.000 chỗ màu viết cứng trên 68 file phía khách | Trung bình | Đổi theo từng màn ở BUILD A; ngoại lệ ghi ở DESIGN §2; không đụng `/admin` trừ tiêu đề |
| Hiệu năng / chuyển động / SVG chưa đo thật | Trung bình | TEST A / B; mặc định Bản đồ gấp chỉ khi LCP ≤ 2,5 giây |
| Ẩn thanh đáy khi bàn phím bật trên Safari iOS và trình duyệt Zalo/Facebook | Trung bình | Test riêng ở TEST A |
| Font Literata + Be Vietnam Pro làm chậm tải | Thấp–TB | Nạp đúng độ đậm; đo ở TEST |
| Sửa script Lua analytics cho `theme` | Thấp | Đợt B; giữ tương thích số cũ |
| `PlaceDetail.js` còn phụ thuộc `PlaceExplorer.js` | Thấp | Tách hàm trước nếu BUILD đụng tới; không dọn rộng |
| Lưu lượng rất thấp (37 phiên / 42 ngày) | — | Báo số tuyệt đối; không kết luận A/B |
| Mockup là ảnh tĩnh, một phần dựng động | — | DESIGN.md là chuẩn; nghiệm thu bằng checklist trên máy thật |

## 6. Ngoài lần release này (BACKLOG / INBOX)

Khôi phục-1, Khôi phục-2 · tài khoản + đồng bộ đa thiết bị · lối vào khôi phục mới · thu thập thêm ảnh thật · dọn
`PlaceExplorer.js` / `PersonalNote.js` · bật `no-undef` ESLint · test Playwright vào repo · các mục BACKLOG khác giữ
nguyên.

## 7. Điều kiện bắt đầu BUILD A

1. PM xác nhận bản ghi này.
2. Đồng bộ `origin/main` (routine quét commit hằng ngày).
3. Trình kế hoạch bước A1 (token + font) cho chủ dự án duyệt, rồi mới code.

## 8. Mã commit FREEZE

(điền sau khi commit)
