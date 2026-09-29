# NOTE 09 — Admin chỉnh trang Giới thiệu & tối ưu Desktop

> Nối tiếp `17-NOTE-08-CDP-About-Data-Transparency.md`.
> Phạm vi: cho phép Admin chỉnh nội dung `/gioi-thieu` và tối ưu layout desktop/tablet.

## 1. Mục tiêu

1. Nội dung `/gioi-thieu` không bị hardcode hoàn toàn trong source.
2. Admin có thể chỉnh các section chính.
3. Desktop/tablet có layout riêng hợp lý, không chỉ kéo mobile rộng ra.

## 2. Admin

Thêm mục:

> **Nội dung hệ thống → Giới thiệu CDP**

Cho chỉnh ít nhất:
- Hero
- CDP là gì?
- Vì sao CDP tồn tại?
- CDP hoạt động như thế nào?
- CDP không phải gì?
- Dữ liệu đến từ đâu?
- Độ mới và độ trễ
- Sổ/Lộ trình và danh bạ
- CTA cuối trang

Mỗi section nên hỗ trợ:
- tiêu đề;
- nội dung;
- bật/tắt;
- thứ tự.

Ưu tiên cấu trúc block-based nếu code hiện tại phù hợp. Nếu chưa phù hợp, có thể dùng Markdown editor tối giản trước.

## 3. Data model gợi ý

```js
aboutPage = {
  hero: {...},
  sections: [
    {
      id: "what-is-cdp",
      title: "...",
      body: "...",
      enabled: true,
      order: 1
    }
  ],
  ctas: [...]
}
```

Không cần xây CMS tổng quát.

## 4. Admin UX tối thiểu

- danh sách section;
- input tiêu đề;
- textarea/editor nội dung;
- toggle bật/tắt;
- reorder;
- Lưu;
- trạng thái lưu thành công/thất bại.

Nếu dễ làm:
- preview;
- mở trang public trong tab mới.

Chỉ Admin được sửa. Nếu render Markdown/HTML thì sanitize an toàn.

## 5. Desktop layout

Không kéo mobile layout full-width.

Khuyến nghị:
- container max-width khoảng `1100–1200px`;
- body text giữ độ dài dòng dễ đọc;
- spacing desktop thoáng hơn mobile;
- CTA có thể nằm ngang;
- section cards có thể thành grid.

Ví dụ:

```text
[ Hero ]

[ Mục lục ]   [ Nội dung chính........................ ]
               [ CDP là gì? ........................... ]
               [ Cách hoạt động ....................... ]
               [ Dữ liệu / độ trễ ..................... ]
               [ CTA cuối ............................. ]
```

## 6. “CDP hoạt động như thế nào?”

Desktop:
- 3 cột.

Tablet:
- 2 cột hoặc 1 cột tùy breakpoint.

Mobile:
- 1 cột.

## 7. Mục lục desktop

Có thể thêm sticky TOC nhẹ:
- CDP là gì?
- Cách hoạt động
- Dữ liệu
- Độ mới
- Sổ & Lộ trình

Click scroll tới anchor.

Không cần hiện sticky TOC trên mobile.

## 8. Breakpoints cần kiểm tra

- 375–430px
- 768–1024px
- 1280px+
- 1440px+

Kiểm tra:
- text overflow;
- CTA wrap;
- anchor bị header che;
- khoảng trắng quá lớn;
- tablet bị vỡ bố cục;
- onboarding card quá rộng.

## 9. Onboarding card desktop

Không kéo full width vô lý.

Có thể bố cục:

```text
[ Copy giới thiệu ]   [ CTA + nút đóng ]
```

Mobile vẫn 1 cột.

## 10. Không làm

Không xây:
- page builder;
- CMS tổng quát;
- workflow duyệt nhiều cấp;
- version history phức tạp;
- editor HTML tự do;
- drag/drop nặng.

## 11. Thứ tự triển khai

### P0
1. Audit `/gioi-thieu` hiện tại.
2. Tách content khỏi hardcode nếu đang hardcode.
3. Thêm Admin editor.
4. Lưu/đọc content an toàn.
5. Tối ưu desktop container/layout.
6. Responsive grid cho section 3 bước.
7. Kiểm tra tablet.

### P1
8. Sticky mục lục desktop.
9. Preview từ Admin.
10. Reorder/toggle nếu chưa có ở P0.

## 12. Tiêu chí hoàn thành

- Admin sửa được nội dung `/gioi-thieu`.
- Không cần sửa code để đổi copy.
- Mobile vẫn ổn.
- Desktop không phải mobile kéo rộng.
- Tablet không vỡ layout.
- Nội dung an toàn khi render.
- Không phá onboarding/footer/link hiện có.
