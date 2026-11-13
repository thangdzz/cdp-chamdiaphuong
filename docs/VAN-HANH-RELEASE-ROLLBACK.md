# VẬN HÀNH — Phát hành và quay lại bản trước (rollback)

> Tài liệu vận hành bắt buộc cho **RELEASE A** và **RELEASE B** (đợt UX/UI Bản đồ gấp + Cơ bản) và mọi lần deploy
> production sau này. Nguồn quyết định: [PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md](PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md) §2.
> Cập nhật: **2026-11-13**.

## 0. Ba điều không bao giờ quên

1. **Rollback code KHÔNG khôi phục dữ liệu.**
   - Quay lại bản deploy cũ chỉ đổi **mã đang chạy**.
   - Mọi thứ đã ghi vẫn giữ nguyên: Redis (Sổ, Lộ trình, địa điểm, góp ý, cấu hình Admin, analytics), ảnh trên Vercel Blob, biến môi trường, domain, cron và dữ liệu khách tạo ra.
   - Muốn dữ liệu quay lại thì phải có bản sao lưu riêng và một thao tác khôi phục riêng, được duyệt riêng.
2. **Công tắc “Cơ bản / Bản đồ gấp” (đợt B) không phải rollback.**
   - Công tắc chỉ đổi trải nghiệm **trong cùng một bản**.
   - Bản phát hành bị lỗi thì phải rollback deployment; không bảo khách bấm “Cơ bản”.
3. **Không tự rollback, không tự deploy** khi chưa có lệnh của chủ dự án.
   - Ngoại lệ duy nhất: quy trình ứng cứu đã được chủ dự án phê duyệt riêng (hiện **chưa có**).

## 1. Mốc đã biết (cập nhật trước mỗi release)

| Mốc | Giá trị | Mức tin cậy |
|---|---|---|
| Mã nguồn baseline trước thiết kế | tag **`prod-2026-09-30`** → commit **`e3b38a4`** | **[Fact]** Kiểm 13/11: tag có chú thích, trên máy và GitHub cùng trỏ `e3b38a4` |
| Deployment production 30/9 | `chamdiaphuongio-og2r8pgy7` (theo hồ sơ release 30/9) | **[Chưa xác minh]** CLI Vercel đang **đăng xuất** (kiểm 13/11) |
| Deployment liền trước 30/9 | `87p9xw2vr` (hotfix 29/9, `de8e1bc`) | Theo hồ sơ, chưa xác minh |
| Dự án Vercel đã nối trong `web/.vercel` | tên dự án `web` | **[Fact]** (file liên kết trên máy) |
| Gói Vercel (Hobby / Pro) | ? | **[Chưa xác minh]** Đọc sau `vercel login` |
| A1–A3 | chỉ nằm trên `main` ở GitHub, **chưa deploy** | Theo báo cáo, chưa có lệnh deploy nào từ 30/9 |

**Quy tắc tag:** `prod-2026-09-30` **không bao giờ** sửa, xóa hay ghi đè. Tag chỉ là mốc mã nguồn, **không** chứng minh
Vercel đang chạy bản nào.

## 2. Vercel cho phép quay lại thế nào

Đã đọc tài liệu Vercel ngày 13/11/2026, trang cập nhật 2026:
[Instant Rollback](https://vercel.com/docs/instant-rollback) · [CLI rollback](https://vercel.com/docs/cli/rollback) ·
[CLI promote](https://vercel.com/docs/cli/promote).

| Điều | Nội dung |
|---|---|
| Gói Hobby | Chỉ rollback về **bản production liền trước**. Chỉ định bản cũ hơn thì CLI báo lỗi “To rollback further than the previous production deployment, upgrade to pro.” |
| Gói Pro/Enterprise | Rollback về **mọi bản từng được gắn domain production** |
| Sau rollback | Vercel **tắt tự gán domain production**: push mới lên `main` **không** tự lên production. Gỡ bằng `vercel promote <bản>` (hoặc nút Manage trên Dashboard) |
| Biến môi trường | **Không** đổi theo rollback. Bản cũ chạy với biến môi trường hiện tại |
| Cơ sở dữ liệu, API ngoài | **Không** khôi phục. Vercel chỉ nhắc kiểm tra |
| Cron | Vercel khôi phục định nghĩa cron của bản được quay về. Cài đặt “Disable Cron Jobs” giữ nguyên |
| Chạy đồng thời | Mỗi dự án chỉ một lần rollback/promote tại một thời điểm |
| `vercel promote <bản>` | Đưa một bản đã có lên production. Tài liệu **không ghi** giới hạn theo gói cho việc promote một bản production cũ. **[Giả định — phải thử trên Vercel thật trước RELEASE A]** |

**Hệ quả cho CDP** (nếu đúng là gói Hobby):
- **RELEASE A:** nếu không có deploy nào chen giữa (kể cả sửa gấp), bản liền trước của bản A **chính là bản 30/9**. Rollback một bước là về 30/9.
- **RELEASE B:** bản liền trước là bản A. Muốn về thẳng 30/9 thì **không dùng rollback được**: dùng promote (nếu Hobby cho phép) hoặc deploy lại từ tag (§3, cách C).
- **Có sửa gấp production trước RELEASE A:** bản liền trước của A sẽ là bản sửa gấp. Ghi rõ vào hồ sơ release.

## 3. Ba cách quay lại (theo thứ tự ưu tiên khi có sự cố)

Mọi cách đều cần: `vercel login` trên máy; đúng dự án (`vercel project ls`, kiểm `web/.vercel/project.json`); **lệnh của chủ dự án**.

**A. Instant Rollback về bản liền trước** (nhanh nhất, gần như tức thì):
```sh
cd web
vercel login
vercel list --prod            # đối chiếu ID/URL bản đang chạy và bản liền trước — KHÔNG đoán
vercel rollback               # về bản production liền trước
vercel rollback status
```
Sau đó: domain đang **khóa** ở bản cũ. Bản sửa lỗi deploy xong phải `vercel promote <bản mới>` mới lên production.

**B. Promote một bản production cũ hơn** (Pro; Hobby chưa xác minh):
```sh
vercel promote <deployment-id-hoac-url-da-doi-chieu>
vercel promote status
```

**C. Deploy lại mã baseline từ tag** (luôn làm được, chậm hơn vì build lại):
```sh
git fetch --tags
git worktree add ../cdp-khoi-phuc-2026-09-30 prod-2026-09-30   # thư mục riêng, KHÔNG đụng main
cp web/.vercel/project.json ../cdp-khoi-phuc-2026-09-30/web/.vercel/project.json   # nối đúng dự án
cd ../cdp-khoi-phuc-2026-09-30/web && npm ci && npm run build   # build + test thử trước
vercel deploy --prod   # chỉ khi chủ dự án duyệt
```
Trước khi chạy cách C phải kiểm:
- Bản này chạy với **biến môi trường và dữ liệu hiện tại**, nên phải xác nhận mã cũ đọc được dữ liệu mới (xem §5).
- Xong việc thì xóa worktree: `git worktree remove`.

**Cấm:**
- `git reset --hard` + force-push `main`;
- xóa hay viết lại commit A1–A3;
- sửa tag `prod-2026-09-30`;
- rollback hay deploy khi chưa đối chiếu ID deployment.

## 4. Checklist trước RELEASE A

- [ ] `vercel login`; ghi lại tài khoản/team, **gói** (Hobby/Pro), dự án.
- [ ] `vercel list --prod`: ghi **ID/URL deployment đang chạy production**. Đối chiếu đó là bản 30/9 (`chamdiaphuongio-og2r8pgy7`) hay bản khác. Ghi commit thật của nó (`vercel inspect`). Không lấy commit Git làm bằng chứng duy nhất.
- [ ] Domain `chamdiaphuong.io.vn` trỏ đúng deployment đó; ghi custom alias nếu có (rollback không mang custom alias).
- [ ] Xác định đường quay về 30/9: rollback một bước (A) có về đúng 30/9 không? Nếu không, B hay C? **Thử thật** một trong hai, theo một trong hai cách:
  - diễn tập ở phạm vi không ảnh hưởng production: deploy preview và promote thử trên dự án hoặc nhánh thử;
  - hoặc chủ dự án xác nhận trên Dashboard rằng nút Instant Rollback liệt kê đúng bản 30/9.
- [ ] Hạn mức tối ưu ảnh (Image Optimization) của gói đủ cho ảnh thẻ (PM A3).
- [ ] **Ghi lại trạng thái dữ liệu trước release** (chỉ đọc): số địa điểm, số Sổ/Lộ trình, cấu hình điều hướng (`site_config:navigation`), danh sách khóa. Nếu chủ dự án duyệt thì xuất bản sao Redis. Biến môi trường: chỉ ghi tên, không ghi giá trị bí mật.
- [ ] **Kiểm tương thích dữ liệu ↔ mã cũ** (§5).
- [ ] Không có deploy nào chen giữa từ lúc kiểm tới lúc release. Nếu có, làm lại các bước trên.
- [ ] Ghi tất cả vào hồ sơ release (`docs/RELEASE-A-<ngày>.md`).

## 5. Tương thích dữ liệu khi quay về mã cũ (rà lại mỗi release)

| Thay đổi từ đợt UX/UI | Mã 30/9 gặp dữ liệu mới thì sao |
|---|---|
| A2: cấu hình điều hướng 6 mục (`search`). Production **chưa lưu** cấu hình nào (kiểm 12/11) | Nếu Admin đã lưu bản 6 mục rồi mới quay về mã 30/9 (5 mục): mã cũ **bỏ bản lưu và dùng mặc định**. Trang không lỗi, nhưng mất nhãn tự đặt |
| A3: chọn ảnh, không đổi dữ liệu | Không ảnh hưởng. Mã cũ lại dùng ảnh menu làm ảnh đại diện cho 1 chỗ (lỗi cũ quay lại) |
| A4 (nếu làm): tiêu đề Trang chủ giới hạn 60 khi lưu | Mã cũ cho phép tới 120, nên đọc được |
| Các bước sau | Bước nào đổi dữ liệu/schema phải bổ sung dòng vào đây **trước** khi release |

## 6. Sau khi rollback / promote — kiểm ngay

- [ ] `vercel rollback status` / `promote status` xong. Domain trỏ đúng deployment mong muốn.
- [ ] Trang công khai: `/`, `/tim` (tìm “Phở”), 3 trang Chi tiết, `/so`, một Sổ chia sẻ, `/lo-trinh`, một Lộ trình chia sẻ, `/admin` (đăng nhập), API đọc. Kiểm thao tác ghi an toàn chỉ khi chủ dự án đồng ý.
- [ ] Log Vercel không có lỗi mới trong 30 phút.
- [ ] Nhớ: domain đang **khóa** ở bản cũ. Bản sửa lỗi phải promote mới lên production.
- [ ] Ghi sự cố, thời điểm, bản trước/sau vào hồ sơ release và [DECISIONS.md](DECISIONS.md).

## 7. Checklist trước RELEASE B (cộng thêm §4)

- [ ] Ghi **cả hai** mốc: deployment RELEASE A (đang chạy) và baseline 30/9.
- [ ] Ghi rõ: rollback một bước về A; về thẳng 30/9 bằng promote (nếu gói cho phép, đã thử) hay deploy lại từ tag (cách C).
- [ ] Kiểm tương thích dữ liệu của mã A **và** mã 30/9 với dữ liệu sau B (khóa giao diện mới trên thiết bị, `updatedAt` trong tóm tắt Sổ, sự kiện có `theme`…).
- [ ] Công tắc “Cơ bản” **không** được ghi là phương án rollback.
