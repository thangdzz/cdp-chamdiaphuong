# vNext — Core Discovery Flow

Status: **RELEASED** — 2026-09-30 · commit `e3b38a4` · deployment `chamdiaphuongio-og2r8pgy7`
(alias chamdiaphuong.io.vn). Scope FROZEN từ 2026-09-29, không mở rộng. MAY **chưa làm**.

> Release: Product Owner test tay đạt (kể cả `two-wheeler` trên iPhone thật) · Release Check
> READY WITH KNOWN NON-BLOCKERS · smoke test production 307/307 (iPhone 13 + desktop).

> Đọc cùng [PRODUCT.md](PRODUCT.md). Scope đã đóng băng: muốn thêm/bớt gì phải được Product
> Owner duyệt lại. Ý tưởng phát sinh trong lúc làm → [INBOX.md](INBOX.md).

## Mục tiêu

Giúp người mới vào Chạm Địa Phương:

**hiểu website dùng để làm gì → tìm đúng nhu cầu → xem kết quả phù hợp → mở Place Detail → lưu vào Sổ.**

Không để Home chỉ giống một danh bạ địa điểm dài.

---

## MUST

### Home

- Giữ Search ở vị trí nổi bật.
- Giữ 4 nhóm chính: Ăn / Chơi / Ngủ / Đi lại.
- Giảm việc hiển thị danh sách địa điểm quá dài ngay trên Home.
- Làm rõ các hành động chính của CDP:
  - tìm địa điểm;
  - lưu vào Sổ;
  - lên Lộ trình.
- Có khu vực nội dung/sự kiện theo mùa nhưng không chiếm vai trò lõi của Home.

### Search / Khám phá

- Có trang kết quả riêng thay vì dồn toàn bộ danh sách vào Home.
- Search theo tên và địa chỉ tiếp tục hoạt động.
- Lọc theo nhóm Ăn / Chơi / Ngủ / Đi lại.
- Kết quả ưu tiên hiển thị:
  - trạng thái hoạt động;
  - thời gian xác nhận gần nhất;
  - khoảng giá khi có;
  - địa chỉ;
  - hành động xem chi tiết / chỉ đường.

### Place → Sổ

- Từ Place Detail phải thấy rõ hành động **Lưu vào Sổ**.
- User không cần tự đi tìm trang Sổ sau khi xem địa điểm.
- Nếu chưa có Sổ, flow tạo Sổ phải ngắn và dễ hiểu.

### Mobile

- Toàn bộ flow chính phải dùng tốt trên điện thoại.

---

## MAY

Nếu không làm tăng Scope đáng kể:

- shortcut: ăn tối, cafe, đang mở, gần đây;
- block “Địa điểm mới được xác nhận”;
- empty state tốt hơn cho Sổ.

---

## NOT NOW

- AI recommendation.
- Cá nhân hóa sâu.
- Contribution mới.
- Gamification.
- Sửa lớn Lộ trình.
- Sửa lớn Map.
- Kho lễ hội cũ / Blog / Cẩm nang.
- Game mới.
- Redesign admin.
- Booking.
- Thương mại điện tử.
- Review/chấm sao.

Ý tưởng phát sinh → `INBOX.md`.

---

## CORE FLOW

Home  
→ chọn nhu cầu / Search  
→ Search Results  
→ Place Detail  
→ Lưu vào Sổ

---

## DONE WHEN

- Home không còn phụ thuộc vào danh sách địa điểm dài.
- Tìm được địa điểm từ Home.
- Lọc được theo nhóm chính.
- Mở được Place Detail.
- Lưu được Place vào Sổ.
- Mobile hoạt động tốt.
- Không còn lỗi chính trong flow.
- Build/deploy thành công.
- Product Owner test và approve.

---

## OUTCOME

Theo dõi flow:

**Home → Search → Place → Save**

để xác định điểm user rơi và lựa chọn version tiếp theo.
