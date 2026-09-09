# NOTE 02 — Chia sẻ một địa điểm và trang địa điểm

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi file này: **share một địa điểm**, Open Graph preview, landing page của địa điểm và CTA liên quan.  
> Không lặp lại các quyết định Homepage/ảnh/phone tổng quát đã có trong `10-NOTE-01-Product-UX.md`.

---

## 1. Quyết định chính

**Share một địa điểm không được giả lập bằng một Sổ có 1 địa điểm.**

Hai luồng phải tách nghĩa rõ:

- Share địa điểm → mở **trang địa điểm**
- Share Sổ → mở **trang Sổ**

Không dùng tiêu đề kiểu `Sổ của tôi · 1 chỗ` khi người nhận thực tế chỉ được gửi một địa điểm.

---

## 2. Mục tiêu UX

Khi người nhận mở link một địa điểm, trong vài giây phải hiểu:

1. Đây là địa điểm nào?
2. Thuộc loại gì?
3. Ở khu vực nào?
4. Có gì hữu ích để quyết định?
5. Đi tới đó bằng cách nào?
6. Có muốn thêm vào Sổ không?

Không ép người nhận hiểu khái niệm Sổ ngay từ đầu.

---

## 3. Open Graph / preview khi share

Preview ngoài Zalo/Facebook/Messenger nên ưu tiên:

- ảnh cover tốt nhất;
- tên địa điểm;
- loại + khu vực;
- thương hiệu CDP.

Ví dụ:

> **SERENITY COFFEE HOUSE**  
> Cafe · Minh Xuân  
> Chạm Địa Phương

Không đưa vào preview:

- review;
- lời khen/chê;
- số điện thoại;
- mô tả dài;
- quá nhiều tag;
- các field chưa chắc chắn.

---

## 4. Trang địa điểm sau khi mở link

### 4.1. Header

Hiển thị trực tiếp:

- tên địa điểm;
- loại;
- khu vực;
- ảnh cover.

Không dùng:

- `Sổ của tôi`
- `1 chỗ`
- `Lưu sổ này thành sổ của tôi`

### 4.2. Thông tin quyết định nhanh

Ưu tiên:

- giá nếu có;
- trạng thái mở/cập nhật gần đây;
- 2–4 fact có cấu trúc;
- ảnh.

Ví dụ:

> **SERENITY COFFEE HOUSE**  
> Cafe · Minh Xuân  
> 30–70k / ly

> 💡 Có 2 cơ sở sát nhau  
> 🌿 Trong nhà · Ngoài trời  
> 📷 Có khu vực chụp ảnh

Không viết câu mang tính review.

---

## 5. Thứ tự nội dung

Khuyến nghị:

1. Tên + loại + khu vực
2. Ảnh cover/gallery
3. Giá / trạng thái
4. Fact có cấu trúc
5. Thông tin thực tế
6. Mẹo địa phương đã duyệt
7. CTA

---

## 6. Thông tin thực tế

Có thể gồm:

- địa chỉ;
- giờ mở cửa;
- trạng thái còn hoạt động;
- số điện thoại tham khảo;
- trạng thái xác nhận số;
- gửi xe;
- lối vào;
- thời điểm đông;
- phương thức thanh toán;
- thời điểm cập nhật gần nhất.

Chỉ hiện field có dữ liệu.

---

## 7. Mẹo địa phương

Giữ nguyên nguyên tắc hiện tại:

- chữ tự do;
- tối đa ngắn;
- bắt buộc admin duyệt;
- hiển thị như field/fact;
- không hiển thị như comment.

Ví dụ:

> **Gửi xe**  
> Tối lễ hội nên gửi phía sau chợ.

Không hiện avatar/tên người viết.

---

## 8. CTA

CTA chính:

- `Chỉ đường`
- `+ Thêm vào sổ`

CTA phụ:

- `Chia sẻ`

Không dùng:

> `Lưu sổ này thành sổ của tôi`

cho trang share một địa điểm.

### `+ Thêm vào sổ`

- chưa có Sổ → cho tạo Sổ nhanh;
- đã có Sổ → chọn Sổ;
- không bắt login.

---

## 9. Header navigation

Trên landing page từ shared link:

- giảm độ nổi của `Ghi chú của tôi` / `Sổ của tôi`;
- không để các nút cá nhân cạnh tranh với nội dung địa điểm;
- ưu tiên người nhận hiểu địa điểm trước.

Không nhất thiết xoá navigation global, chỉ giảm hierarchy thị giác.

---

## 10. Layout

Không bọc toàn bộ địa điểm trong một card lớn nếu chính trang đó đã là place page.

Ưu tiên:

```text
Tên địa điểm
Loại · Khu vực

[ Cover lớn ]
[ thumbnail ] [ thumbnail ] [ +N ]

Giá / trạng thái

Fact nhanh

Thông tin thực tế

Mẹo địa phương

[ Chỉ đường ] [ + Thêm vào sổ ]
```

Mục tiêu: giảm cảm giác `page → sổ → card → nội dung`.

---

## 11. URL / routing

Khuyến nghị có route riêng cho địa điểm, ví dụ:

```text
/place/{slug}
```

hoặc route tương đương theo kiến trúc hiện tại.

Không reuse `/so/{slug}` cho share một địa điểm.

Nếu hiện tại chưa có slug địa điểm:
- có thể dùng `id`;
- không đổi schema lớn chỉ để có URL đẹp.

---

## 12. Tiêu chí hoàn thành

- share một địa điểm không mở trang Sổ;
- Open Graph preview nhận diện đúng địa điểm;
- người nhận hiểu nội dung ngay;
- CTA đúng ngữ cảnh;
- không có review;
- không ép user học khái niệm Sổ;
- có thể thêm địa điểm vào Sổ bằng 1–2 thao tác;
- tương thích mobile-first.

---

## 13. Quy tắc cho Claude Code

Trước khi sửa:

- đọc `CLAUDE.md`;
- đọc `10-NOTE-01-Product-UX.md`;
- đọc `NOTEBOOK-DESIGN.md`;
- đọc `SPEC-giao-dien.md`;
- kiểm tra cách share hiện tại trước khi tạo route mới.

Không rewrite hệ thống Sổ nếu chỉ cần tách place page.

Sau khi đổi:
- cập nhật `ARCHITECTURE.md` nếu thêm route/component mới;
- cập nhật `DECISIONS.md` nếu có trade-off;
- cập nhật `TASKS.md` khi xong.
