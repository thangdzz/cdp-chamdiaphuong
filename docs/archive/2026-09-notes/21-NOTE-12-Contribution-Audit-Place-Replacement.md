# NOTE 12 — Contribution UX Audit, Dynamic Text Contexts và Closed→Replacement Flow

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: audit/sửa block `Bạn biết thêm gì...`, chuẩn hóa context/placeholder theo category/subtype, loại bỏ render chồng câu hỏi, tối ưu actions ↔ contribution, và thêm flow `địa điểm đóng cửa → đề xuất địa điểm mới cùng vị trí`.
>
> Đọc cùng:
> - `14-NOTE-05-Transport-Dynamic-UX.md`
> - `15-NOTE-06-Transport-Families-Pickup-Service.md`
> - `16-NOTE-07-Route-PlacePicker-Proposals-Safari.md`
> - `20-NOTE-11-Media-Pipeline-Storage.md`
> - `ARCHITECTURE.md`
> - `DECISIONS.md`
> - `STATUS.md`
> - `TASKS.md`

## 1. Mục tiêu

Sửa triệt để các lỗi:
- chọn một context nhưng vẫn hiện thêm `Gửi xe ở đâu?`;
- placeholder text sai/nghèo ngữ cảnh giữa `Ăn / Chơi / Ngủ / Đi lại`;
- `Di chuyển` quá rộng;
- `Khác` chưa tách rõ moderation;
- actions và contribution block bố trí chưa hợp lý;
- `Bổ sung` có nguy cơ trùng vai trò;
- chưa có flow tốt khi place đóng cửa và có địa điểm mới thay thế cùng vị trí.

## 2. Trước khi code: audit phần đang có

Kiểm tra:
- `NoteInput`
- `QuestionPrompt`
- `answerActions`
- question config
- note context config
- state `activeContext`
- default question fallback
- moderation route cho free-text
- place card/detail layout
- action `Bổ sung`
- flow báo sai / place closed
- proposal queue hiện có
- replacement relation hiện có hay chưa

Không rewrite component đang chạy đúng.

## 3. Nguyên tắc render

> **Mỗi thời điểm chỉ có một context active và chỉ render đúng UI của context đó.**

Ví dụ:

```text
activeContext = "parking"  → chỉ Parking UI
activeContext = "entrance" → chỉ Entrance UI
activeContext = "timing"   → chỉ Timing UI
```

Không giữ default question `Gửi xe ở đâu?` dưới context khác.

Khi đổi context:
- clear UI cũ;
- clear text cũ nếu khác context;
- không giữ hidden state gây submit nhầm.

## 4. Context cho place thông thường

Khuyến nghị:

```text
Gửi xe
Lối vào
Thời điểm
Thanh toán
Tiện ích
Cách đến
Khác
```

Đổi `Di chuyển` → `Cách đến`.

## 5. Structured vs Free-text

### Structured
- Gửi xe
- Lối vào
- Thời điểm
- Thanh toán
- Tiện ích

Flow:
```text
bấm context → hiện question/options → bấm option → ghi phiếu ngay
```

Chỉ mở text khi user chọn `Khác` trong chính question đó.

### Free-text moderated
- Cách đến
- Khác

Flow:
```text
bấm context → textarea → submit → admin duyệt → mới public
```

## 6. `Lối vào`

Chỉ hiện:

> **Lối vào thế nào?**

Option gợi ý:
- Dễ thấy
- Trong ngõ
- Phải đi bộ một đoạn
- Có bậc thang
- Có lối cho xe lăn
- Khác

Không render thêm `Gửi xe ở đâu?`.

## 7. `Thời điểm`

Ví dụ với `Ăn`:

> **Khi nào nên đến?**

- Sáng
- Trưa
- Chiều
- Tối
- Cuối tuần đông
- Giờ cao điểm
- Khác

Không render context khác.

## 8. `Thanh toán`

> **Trả tiền kiểu gì?**

- Tiền mặt
- Chuyển khoản
- Quét QR
- Thẻ
- Khác

Không render `Gửi xe`.

## 9. `Tiện ích`

Chỉ hiện tiện ích phù hợp category/subtype.

Ví dụ quán ăn:
- Điều hòa
- Nhà vệ sinh
- Wifi
- Chỗ ngồi ngoài trời
- Phòng riêng
- Ghế trẻ em
- Khác

## 10. `Cách đến`

Free-text moderated.

Ví dụ với `Ăn`:

> `VD: Từ quảng trường đi bộ khoảng 5 phút, rẽ vào đường Trần Phú.`

Submit → admin queue → không public ngay.

## 11. `Khác`

Free-text moderated.

Placeholder mặc định:

> `Viết một điều hữu ích mà các mục trên chưa có…`

Submit → admin duyệt → mới public.

## 12. Placeholder phải đúng ngữ cảnh

Mapping theo:
- `primaryCategory`
- `context`
- với `Đi lại`: thêm `transportFamily/transportSubtype`

Gợi ý:

```text
placeholderByCategoryAndContext
placeholderBySubtypeAndContext
```

### Ăn
- Cách đến: `VD: Từ quảng trường đi bộ khoảng 5 phút, rẽ vào đường Trần Phú.`
- Khác: `VD: Quán nghỉ thứ Hai hàng tuần.`
- Mẹo: `VD: Nên gọi trước nếu đi nhóm đông.`

### Chơi
- Cách đến: `VD: Đi hết đường chính rồi rẽ trái ở cổng trường.`
- Khác: `VD: Nên đi buổi chiều vì khu này ít nắng hơn.`
- Mẹo: `VD: Cuối tuần thường đông, nên đến trước 17h.`

### Ngủ
- Cách đến: `VD: Xe ô tô vào tận cửa, lối vào nằm phía sau tòa nhà.`
- Khác: `VD: Nên hỏi trước nếu cần nhận phòng muộn.`
- Mẹo: `VD: Phòng phía trong yên tĩnh hơn phòng sát đường.`

### Đi lại — Xe ghép
Không mặc định có `Cách đến` nếu là service không có điểm vật lý.
Contexts chính:
- Điểm đón
- Điểm trả
- Giờ chạy
- Đặt xe
- Loại xe
- Thanh toán
- Hành lý
- Tiện ích
- Khác

`Khác`: `VD: Nhà xe thường gọi xác nhận trước giờ đón.`

### Taxi
`Khác`: `VD: Ban đêm thường phải chờ lâu hơn.`

### Bến xe / Bãi xe / Điểm đón-trả
Có thể có `Cách đến`:
`VD: Cổng vào nằm phía đường Bình Thuận, không phải mặt đường chính.`

## 13. Audit toàn bộ matrix

Phải rà tất cả category/subtype.

Kiểm tra:
- context không phù hợp thì không hiện;
- placeholder không dùng chéo;
- đổi context clear state cũ;
- structured submit không vào moderation;
- free-text luôn vào moderation;
- không có default question thừa.

## 14. Actions ↔ Contribution

Khuyến nghị:

```text
Thông tin chính
Thông tin đã biết

[ Chỉ đường ] [ Vẫn mở ] [ + Vào sổ ]
[ Chia sẻ ]   [ Bổ sung ]

────────────

Bạn biết thêm gì về chỗ này?

[ Gửi xe ] [ Lối vào ] [ Thời điểm ]
[ Thanh toán ] [ Tiện ích ] [ Cách đến ] [ Khác ]
```

Actions và contribution là hai section riêng nhưng gần nhau, có separator nhẹ.

## 15. `Bổ sung` có trùng không?

Phải audit.

- Nếu contribution luôn mở: cân nhắc bỏ `Bổ sung`.
- Nếu giữ `Bổ sung`: mobile nên để contribution collapsed; bấm `Bổ sung` thì mở + scroll tới block.
- Desktop có thể mở sẵn nếu hợp lý.

Không để nút `Bổ sung` và form mở sẵn ngay cạnh nhau mà không có lý do.

## 16. Closed place → replacement proposal

Không sửa record cũ thành record mới.

Flow:

```text
place cũ → xác nhận closed → ẩn khỏi public mặc định → tạo proposal mới cùng vị trí nếu có
```

### Admin flow

Khi admin duyệt báo `đã đóng cửa`, thêm action:

> **Có địa điểm mới ở đây**

Bấm:
- prefill address;
- prefill area;
- prefill coordinates nếu có;
- mở form proposal place mới;
- submit vào queue bình thường;
- không public trực tiếp.

### User flow

Sau khi user báo closed:

> **Bạn có biết chỗ nào mới mở tại địa chỉ này không?**

- `Có, đề xuất chỗ mới`
- `Không`

Nếu Có:
- prefill location cũ;
- user nhập place mới;
- gửi proposal;
- admin duyệt như thường.

## 17. Replacement relation

Khuyến nghị:

```text
newProposal.replacesPlaceId = oldPlace.id
```

Sau khi approved:

```text
oldPlace.replacedByPlaceId = newPlace.id
newPlace.replacesPlaceId = oldPlace.id
```

Không kế thừa tự động:
- ảnh;
- giá;
- món;
- note;
- confirmation;
- trạng thái hoạt động.

Chỉ reuse location data hợp lý.

## 18. URL cũ sau khi closed

Không cần 404 nếu record vẫn còn.

Nếu mở URL cũ:

> **Địa điểm này đã đóng cửa**

Nếu có replacement:

> **Hiện tại ở vị trí này: [Tên địa điểm mới]**

có link sang place mới.

Nếu replacement bị từ chối:
- place cũ vẫn closed;
- proposal không public;
- không rollback trạng thái closed.

## 19. P0

1. Audit contribution state/render.
2. Sửa bug context nào cũng hiện `Gửi xe ở đâu?`.
3. Enforce một active context → một UI.
4. Audit placeholder toàn `Ăn / Chơi / Ngủ / Đi lại`.
5. Đổi `Di chuyển` → `Cách đến` ở place phù hợp.
6. `Cách đến` + `Khác` → free-text moderation.
7. Structured context → one-tap.
8. Audit spacing/action/contribution.
9. Audit nút `Bổ sung`.

## 20. P1

10. Closed place → `Có địa điểm mới ở đây`.
11. User prompt đề xuất replacement.
12. `replacesPlaceId`.
13. `replacedByPlaceId`.
14. URL cũ hiển thị closed + replacement nếu có.

## 21. Không làm

Không:
- mutate place cũ thành place mới;
- kế thừa ảnh/dữ liệu cũ sang place mới;
- auto-public free-text;
- auto-public replacement;
- render nhiều context cùng lúc;
- dùng placeholder chung cho tất cả category.

## 22. Tiêu chí hoàn thành

- Bấm mỗi context chỉ hiện đúng một UI.
- Không còn `Gửi xe ở đâu?` sai context.
- Placeholder đúng `Ăn / Chơi / Ngủ / Đi lại`.
- `Cách đến` và `Khác` qua admin moderation.
- Structured choices vẫn one-tap.
- Actions/contribution có hierarchy rõ.
- `Bổ sung` không trùng chức năng.
- Closed place tạo được replacement proposal cùng vị trí.
- Record cũ và mới không trộn lịch sử.
- Không phá proposal/moderation hiện tại.

## 23. Bàn giao giữa Codex và Claude

Sau mỗi chặng hoàn thành đáng kể, Codex phải cập nhật các file bàn giao để Claude có thể tiếp tục nếu session/usage dừng giữa chừng.

Bắt buộc xem xét/cập nhật:

- `/AGENTS.md`
- `/CLAUDE.md`
- `/docs/HANDOFF.md`
- `/docs/TASKS.md`
- `/docs/DECISIONS.md`

### `/docs/HANDOFF.md`
Ghi:
- đã làm tới đâu;
- file/code đã sửa;
- hành vi hiện tại;
- phần đang dở;
- bước tiếp theo;
- bug/risk chưa xử lý;
- cách test nhanh.

### `/docs/TASKS.md`
Cập nhật:
- done;
- in progress;
- remaining;
- P0/P1 hiện tại.

### `/docs/DECISIONS.md`
Chỉ ghi quyết định đã chốt, ví dụ:
- `Cách đến` là free-text moderated;
- một active context chỉ render một UI;
- replacement place là record mới, không mutate place cũ.

### `/AGENTS.md` và `/CLAUDE.md`
Chỉ cập nhật khi có rule/workflow chung agent khác cần biết:
- nơi đọc handoff;
- convention continuation;
- nguyên tắc mới.

Không nhét chi tiết task vụn nếu không cần.

Mục tiêu:

> **Codex dừng ở đâu, Claude mở repo lên phải biết tiếp tục từ đó mà không cần đoán lại.**
