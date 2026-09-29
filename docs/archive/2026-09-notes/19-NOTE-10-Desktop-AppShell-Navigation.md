# NOTE 10 — Desktop App Shell, Sidebar, Navigation Config và tối ưu layout

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: tạo App Shell desktop dùng chung, sidebar trái có mở/thu, đưa `CDP là gì?` vào menu, cho phép Admin sửa tên menu/tiêu đề page, tối ưu desktop trang địa điểm và thêm accent màu CDP cho `/gioi-thieu`.
>
> Đọc cùng:
> - `17-NOTE-08-CDP-About-Data-Transparency.md`
> - `18-NOTE-09-About-Admin-Desktop.md`
> - `SPEC-giao-dien.md`
> - `SPEC-admin.md`
> - `ARCHITECTURE.md`
> - `DECISIONS.md`
> - `STATUS.md`
> - `TASKS.md`

---

## 1. Trước khi code: audit phần hiện tại

Trước khi sửa, cần kiểm tra:

- header/nav desktop hiện tại;
- layout chung của các page;
- `/gioi-thieu`;
- trang danh sách địa điểm;
- trang chi tiết địa điểm;
- menu mobile hiện có;
- admin content/config hiện có;
- các component layout/nav đang dùng chung.

Không tạo thêm một hệ thống navigation thứ hai nếu code hiện tại đã có config/layout dùng chung.

Không rewrite phần mobile đang chạy ổn.

---

## 2. Mục tiêu tổng

Desktop của CDP cần chuyển từ kiểu:

```text
một cột hẹp nằm giữa màn hình lớn
```

sang:

```text
Sidebar trái + vùng nội dung chính rộng, responsive
```

Sidebar phải là App Shell dùng chung toàn site.

---

## 3. Desktop App Shell

Khuyến nghị:

```text
┌───────────────┬──────────────────────────────────────────────┐
│ Sidebar       │ Main content                                 │
│               │                                              │
│ CDP           │ Page header                                  │
│ Khám phá      │                                              │
│ Ghi chú       │ Page content                                 │
│ Sổ            │                                              │
│ CDP là gì?    │                                              │
│               │                                              │
│ Thu gọn       │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

Desktop:
- sidebar fixed/sticky;
- main content co giãn theo viewport;
- không để main content lọt thỏm ở giữa.

---

## 4. Sidebar mở rộng / thu gọn

### Expanded

Khoảng:

```text
230–260px
```

Hiển thị:
- logo CDP;
- icon;
- label;
- active state;
- nút thu gọn.

Menu ban đầu:

```text
Khám phá
Ghi chú của tôi
Sổ của tôi
CDP là gì?
```

Không cần tách `Lộ trình của tôi` ở thời điểm này nếu Lộ trình vẫn là `Notebook mode=route`.

### Collapsed

Khoảng:

```text
64–72px
```

Chỉ hiện:
- logo/icon;
- nav icon;
- nút mở rộng.

Hover/focus:
- có tooltip.

Lưu trạng thái mở/thu bằng localStorage hoặc cơ chế client nhẹ.

---

## 5. Mobile

Không dùng sidebar fixed.

Mobile:
- giữ header nhẹ;
- có nút menu/drawer nếu cần;
- dùng chung `navigation config` với desktop;
- không hardcode hai danh sách menu riêng biệt.

---

## 6. Navigation Config dùng chung

Không hardcode label rải rác trong component.

Tạo config tương đương:

```js
navigation = [
  {
    key: "explore",
    href: "/",
    navLabel: "Khám phá",
    pageTitle: "Khám phá Tuyên Quang",
    enabled: true,
    order: 1
  },
  {
    key: "notes",
    href: "/ghi-chu",
    navLabel: "Ghi chú của tôi",
    pageTitle: "Ghi chú của tôi",
    enabled: true,
    order: 2
  },
  {
    key: "notebooks",
    href: "/so",
    navLabel: "Sổ của tôi",
    pageTitle: "Sổ của tôi",
    enabled: true,
    order: 3
  },
  {
    key: "about",
    href: "/gioi-thieu",
    navLabel: "CDP là gì?",
    pageTitle: "Chạm Địa Phương là gì?",
    enabled: true,
    order: 4
  }
]
```

Tên field có thể điều chỉnh theo kiến trúc hiện tại.

---

## 7. Admin — Menu & tên trang

Thêm mục:

> **Nội dung hệ thống → Menu & tên trang**

Cho phép sửa:
- `navLabel`;
- `pageTitle`;
- bật/tắt;
- thứ tự.

Không cho sửa:
- `key`;
- `href`;
- route thật.

Mục tiêu:
- tránh admin phá navigation;
- vẫn đủ linh hoạt đổi copy.

---

## 8. `navLabel` và `pageTitle` tách riêng

Ví dụ:

```text
Menu:
CDP là gì?

Page H1:
Chạm Địa Phương là gì?
```

Có thể thêm option:

> `Dùng tên menu làm tiêu đề trang`

Nếu dễ làm.

---

## 9. Trang `/gioi-thieu` — thêm màu CDP

Không đổi cả page sang màu thương hiệu.

Chỉ dùng màu logo CDP như accent ở:
- số thứ tự `01 / 02 / 03`;
- icon;
- vạch trái heading;
- underline;
- CTA;
- link;
- badge nhỏ;
- border/callout.

Ví dụ:
- `Dữ liệu sống`
- `Sổ`
- `Lộ trình`

Không dùng màu CDP cho paragraph dài.

Không làm page trông như banner quảng cáo.

---

## 10. Trang danh sách địa điểm — desktop

Hiện trạng cần tránh:

```text
một cột card hẹp ở giữa màn hình desktop
```

Desktop nên:
- dùng main container rộng hơn;
- max-width khoảng `1200–1360px`;
- tận dụng vùng sau sidebar;
- card list dùng grid phù hợp.

Gợi ý:

```text
Khám phá Tuyên Quang

[ Search................................................ ]

[ Ăn ] [ Chơi ] [ Ngủ ] [ Đi lại ]

[ Card A                    ] [ Card B                    ]
[ Card C                    ] [ Card D                    ]
```

Ưu tiên:
- 2 cột desktop;
- 1–2 cột tablet;
- 1 cột mobile.

Không ép 3 cột nếu card hiện tại quá nhiều thông tin.

---

## 11. Trang chi tiết địa điểm — desktop

Nếu hiện tại vẫn là một cột hẹp, tối ưu thành:

```text
[ Nội dung chính ~760px ] [ Actions / info nhanh ~300–340px ]
```

Cột phải có thể sticky.

Chứa:
- CTA chính;
- `+ Vào sổ`;
- Chia sẻ;
- Liên hệ;
- metadata/trạng thái cập nhật phù hợp.

Mobile vẫn 1 cột.

---

## 12. Responsive

Kiểm tra ít nhất:

- 375–430px
- 768–1024px
- 1280px+
- 1440px+

Đảm bảo:
- sidebar không đè main content;
- collapsed mode không vỡ;
- tooltip usable;
- card grid không quá hẹp;
- page title không wrap xấu;
- drawer mobile không lệch config;
- `/gioi-thieu` không bị quá rộng.

---

## 13. Header

Desktop có sidebar rồi thì header ngang nên được tối giản.

Không giữ đồng thời:
- sidebar đầy đủ;
- header chứa lại toàn bộ nav cũ.

Có thể giữ:
- page title;
- một số action ngữ cảnh;
- user/account nếu sau này có.

Không duplicate navigation.

---

## 14. Admin UX cho Menu & tên trang

Có thể dùng table:

| Trang | Tên menu | Tiêu đề trang | Hiện | Thứ tự |
|---|---|---|---|---|
| Trang chính | Khám phá | Khám phá Tuyên Quang | ✓ | 1 |
| Ghi chú | Ghi chú của tôi | Ghi chú của tôi | ✓ | 2 |
| Sổ | Sổ của tôi | Sổ của tôi | ✓ | 3 |
| Giới thiệu | CDP là gì? | Chạm Địa Phương là gì? | ✓ | 4 |

Có:
- Save;
- trạng thái lưu thành công/thất bại.

Không cần page builder.

---

## 15. Backward compatibility

Nếu label/page title hiện hardcode:
- thêm default config;
- fallback về copy cũ nếu config chưa tồn tại.

Không bắt migration phức tạp nếu có thể resolve bằng default.

---

## 16. P0

1. Audit layout/nav hiện tại.
2. Tạo App Shell desktop dùng chung.
3. Sidebar mở/thu.
4. Navigation config dùng chung.
5. Đưa `CDP là gì?` vào menu.
6. Mobile dùng chung config.
7. Tối ưu desktop danh sách địa điểm.
8. Thêm accent màu CDP cho `/gioi-thieu`.

---

## 17. P1

9. Admin `Menu & tên trang`.
10. `navLabel` + `pageTitle`.
11. enable/disable.
12. reorder.
13. Tối ưu desktop trang chi tiết địa điểm nếu chưa làm đủ ở P0.

---

## 18. Không làm

Không:
- đổi route;
- cho admin sửa href/key;
- thêm page builder;
- tạo nav riêng cho từng page;
- hardcode menu mới ở nhiều nơi;
- đổi toàn bộ theme sang màu CDP;
- phá layout mobile hiện tại.

---

## 19. Tiêu chí hoàn thành

- Desktop có sidebar trái dùng chung.
- Sidebar mở/thu được.
- Trạng thái sidebar được nhớ.
- Mobile không bị sidebar fixed.
- `CDP là gì?` nằm cùng menu với Ghi chú/Sổ.
- Menu dùng chung một config.
- Admin sửa được tên menu và tiêu đề page.
- Trang địa điểm desktop không còn một cột lọt thỏm.
- `/gioi-thieu` có accent màu CDP tiết chế.
- Không duplicate navigation.
- Không phá mobile.
