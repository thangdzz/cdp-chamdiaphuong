# NOTE 13 — Closed Place Crawl Guard & Shared Route Copy Ownership

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: ngăn crawler/public pipeline tự hồi sinh địa điểm đã đóng mà chưa xác minh; bổ sung flow người nhận lộ trình phải lưu/copy về Sổ của mình trước khi sửa.
>
> Đọc trước:
> - `21-NOTE-12-Contribution-Audit-Place-Replacement.md`
> - `HANDOFF.md`
> - `TASKS.md`
> - `DECISIONS.md`
>
> Chỉ mở spec cũ khác khi thực sự cần đối chiếu dependency.

## 1. Mục tiêu

Giải quyết 2 lỗi quan trọng:

1. Địa điểm đã được xác nhận `closed` nhưng crawler/bot lại tìm thấy tín hiệu cũ/mới và auto-public lại mà không đối chiếu lịch sử.
2. Người nhận shared route chưa có flow `Lưu lộ trình này` → tạo bản copy của riêng họ → sau đó mới được sửa.

# PHẦN A — CLOSED PLACE CRAWL GUARD

## 2. Nguyên tắc

> **Trạng thái `closed` có trọng lượng cao hơn dữ liệu crawler mới cho tới khi được xác minh lại.**

Crawler không được tự đổi một place `closed` thành `active` chỉ vì:
- thấy bài cũ;
- thấy kết quả index cũ;
- thấy social post không rõ ngày;
- thấy cùng tên xuất hiện lại;
- thấy nguồn không đủ mạnh để xác minh reopening.

## 3. Bắt buộc match dữ liệu cũ trước khi tạo/public place

Trước khi bot tạo hoặc public một candidate mới, phải chạy duplicate/history match.

Dùng các tín hiệu hiện có nếu có:
- tên gần giống;
- địa chỉ;
- khu vực;
- tọa độ;
- số điện thoại;
- category/subtype;
- source URL;
- normalized name.

Không cần xây fuzzy engine quá phức tạp ở P0, nhưng phải có guard để không tạo lại record cũ một cách ngây thơ.

## 4. Nếu candidate match với place `closed`

Không auto-public.

Đưa candidate vào trạng thái tương đương:

> **Có tín hiệu hoạt động trở lại — cần xác minh**

Admin cần chọn:

### A. Mở lại chính địa điểm cũ

Dùng khi:
- cùng thương hiệu;
- cùng địa điểm;
- cùng business;
- có bằng chứng mới đủ mạnh.

Khi duyệt:
- đổi `status` từ `closed` → `active`;
- giữ history;
- không tạo place mới.

### B. Đây là địa điểm mới thay thế

Dùng khi:
- cùng địa chỉ nhưng khác business;
- quán cũ đóng, quán mới mở;
- dữ liệu mới không phải sự trở lại của place cũ.

Khi duyệt:
- tạo proposal/place mới;
- dùng `replacesPlaceId`;
- giữ place cũ là `closed`.

## 5. Metadata lifecycle khuyến nghị

Nếu schema hiện tại phù hợp, bổ sung hoặc chuẩn hóa:

```text
status
closedAt
closedReason
lastSeenActiveAt
lastCrawlMatchAt
reopenedAt
reopenedBy
```

Không bắt buộc thêm mọi field nếu hệ hiện tại đã có dữ liệu tương đương.

## 6. Crawler confidence

Nếu crawler match place `closed`, không dùng cùng threshold như place chưa tồn tại.

Rule:

```text
closed match
→ never auto-public
→ admin/user verification required
```

Có thể vẫn lưu:
- source;
- fetchedAt;
- sourcePublishedAt nếu biết;
- candidate fields;
- confidence.

Nhưng không public.

## 7. Admin UI

Khi candidate đụng place `closed`, hiển thị rõ:

```text
Địa điểm này từng được xác nhận đã đóng.

Nguồn mới cho thấy có thể đang hoạt động trở lại.

[ Mở lại địa điểm cũ ]
[ Tạo địa điểm mới thay thế ]
[ Bỏ qua ]
```

Kèm:
- tên cũ;
- địa chỉ;
- ngày đóng nếu có;
- nguồn mới;
- ngày nguồn;
- khác biệt chính nếu có.

## 8. Không overwrite lịch sử

Không được:
- tạo duplicate active place cùng địa chỉ/tên khi match mạnh với closed place;
- overwrite `closedAt`;
- xoá history chỉ vì crawler tìm thấy nguồn mới.

# PHẦN B — SHARED ROUTE COPY OWNERSHIP

## 9. Nguyên tắc

> **Người nhận chỉ xem route gốc. Muốn sửa phải lưu/copy thành bản của mình.**

Không cho recipient sửa shared route của owner khác.

## 10. Shared route CTA

Trên trang route người khác chia sẻ, hiển thị CTA chính:

> **Lưu lộ trình này**

Dòng giải thích nhỏ:

> **Bạn đang xem lộ trình do người khác chia sẻ. Lưu một bản để chỉnh theo ý mình.**

Không hiển thị `Sửa lộ trình` cho recipient khi họ chưa có ownership.

## 11. Khi bấm `Lưu lộ trình này`

Tạo notebook/route copy mới.

Giữ:
- `mode = route`;
- title snapshot hoặc title copy phù hợp;
- thứ tự stop;
- item notes nếu policy hiện tại đã cho phép copy;
- custom stop;
- proposed place snapshot/status nếu route hiện hỗ trợ;
- metadata cần thiết để route không gãy.

Thêm:

```text
copiedFrom
```

nếu hệ hiện tại đã dùng field này thì tái sử dụng.

Không tạo entity mới.

## 12. Sau khi copy

CTA chuyển thành:

> **Sửa lộ trình của tôi**

Có thể thêm:

> **Đã lưu vào Sổ của tôi**

Sau đó user được:
- reorder;
- add/remove stop;
- sửa note;
- thêm place;
- share bản riêng.

Bản gốc không bị ảnh hưởng.

## 13. Ownership

Tái sử dụng owner/session hiện có của hệ Notebook.

Không bắt login nếu product hiện đang cho anonymous owner/session hoạt động.

Không mở auth scope mới chỉ cho feature này.

## 14. Shared route read-only state

Nếu viewer không phải owner:

Cho phép:
- xem;
- chia sẻ;
- mở Google Maps;
- lưu/copy.

Không cho:
- edit;
- delete;
- reorder;
- add/remove stop trên bản gốc.

## 15. Nếu user đã lưu route này rồi

Nếu có thể detect bằng `copiedFrom`, tránh tạo nhiều bản ngoài ý muốn.

Có thể:
- hiện `Mở bản của tôi`;
- hoặc vẫn cho `Lưu bản khác` ở action phụ.

P0 chỉ cần tránh duplicate accidental nếu đơn giản.

## 16. Route copy và dữ liệu chưa xác minh

Nếu route chứa:
- `proposed_place`;
- `custom_stop`;

thì copy vẫn giữ đủ snapshot để route không gãy.

Không tự biến proposal thành cdp_place khi copy.

# PHẦN C — THỨ TỰ TRIỂN KHAI

## 17. P0

1. Audit crawler/public pipeline hiện tại.
2. Thêm guard match với `closed` trước auto-public.
3. Candidate match `closed` → luôn vào verify queue.
4. Admin action `Mở lại địa điểm cũ` / `Tạo địa điểm mới thay thế`.
5. Audit shared route ownership.
6. Thêm CTA `Lưu lộ trình này`.
7. Copy route bằng Notebook entity hiện có.
8. Chỉ sau copy mới hiện `Sửa lộ trình của tôi`.

## 18. P1

9. Lifecycle metadata đầy đủ hơn.
10. Admin compare view source mới vs closed place cũ.
11. Detect route đã copy để tránh duplicate.
12. History/reopen provenance tốt hơn.

## 19. Không làm

Không:
- auto-reopen place `closed`;
- tạo duplicate active place nếu match mạnh với place cũ;
- cho recipient sửa route gốc;
- tạo entity Route mới;
- bắt login mới nếu ownership hiện tại chưa cần login.

## 20. Tiêu chí hoàn thành

### Closed place
- crawler không auto-public lại place `closed`;
- match closed luôn cần verify;
- admin phân biệt reopen vs replacement;
- history cũ được giữ.

### Shared route
- recipient thấy `Lưu lộ trình này`;
- chưa lưu thì không sửa được;
- sau lưu có bản copy riêng;
- sửa bản copy không ảnh hưởng route gốc;
- route copy giữ đủ stop/note/snapshot hiện có.

## 21. Bàn giao giữa Codex và Claude

Sau mỗi chặng đáng kể, cập nhật:

- `/docs/HANDOFF.md`
- `/docs/TASKS.md`
- `/docs/DECISIONS.md`

Chỉ cập nhật khi thực sự có rule/workflow chung mới:
- `/AGENTS.md`
- `/CLAUDE.md`

### HANDOFF phải ghi
- đã làm gì;
- file nào sửa;
- hành vi hiện tại;
- phần đang dở;
- bước tiếp theo;
- test nhanh;
- bug/risk còn lại.

Mục tiêu:

> Codex dừng ở đâu, Claude tiếp tục được ngay từ đó.
