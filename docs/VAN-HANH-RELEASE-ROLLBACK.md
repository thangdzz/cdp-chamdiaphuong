# VẬN HÀNH — Phát hành và quay lại bản trước (rollback)

> Tài liệu vận hành bắt buộc cho **RELEASE A** và **RELEASE B** (đợt UX/UI Bản đồ gấp + Cơ bản) và mọi lần deploy
> production sau này. Nguồn quyết định: [PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md](PM-NGHIEM-THU-A3-VA-ROLLBACK-CDP-2026-11-13.md) §2.
> Cập nhật: **2026-11-13** (lần 2, theo [PM-DUYET-PLAN-A4-VA-ROLLBACK-CDP-2026-11-13.md](PM-DUYET-PLAN-A4-VA-ROLLBACK-CDP-2026-11-13.md) §5).
>
> **Trạng thái tài liệu: DOCUMENTED, NOT YET VERIFIED ON ACCOUNT.** PM duyệt **khung quy trình**, **chưa** duyệt là
> phương án đã diễn tập. Chưa có cách quay lại nào được thử trên tài khoản Vercel của CDP.

## Mức xác minh của từng cách quay lại

| Cách | Mức | Ghi chú |
|---|---|---|
| A. Instant Rollback về bản production **liền trước** | **Đã xác minh trên tài liệu Vercel**; **chưa thử trên tài khoản CDP** | Chỉ về đúng 30/9 nếu kiểm chứng không có deploy xen giữa |
| B. Promote một bản production cũ hơn | **Dự phòng, chưa xác minh** | Không gọi là đường quay lại chắc chắn. **Không** chạy `vercel promote` trên production chỉ để thử quyền |
| C. Deploy lại mã từ tag | **Dự phòng, cần diễn tập** | Không phải “luôn làm được”: còn phụ thuộc môi trường build, biến môi trường, tài khoản, cấu hình dự án, cron, dữ liệu, domain |

**Chưa chốt được đường quay lại thực sự khả dụng thì KHÔNG RELEASE.**

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
[CLI promote](https://vercel.com/docs/cli/promote) · [Promoting a deployment](https://vercel.com/docs/deployments/promoting-a-deployment) ·
[Rollback production deployment](https://vercel.com/docs/deployments/rollback-production-deployment) (PM kiểm 13/11).

| Điều | Nội dung |
|---|---|
| Gói Hobby | Chỉ rollback về **bản production liền trước**. Chỉ định bản cũ hơn thì CLI báo lỗi “To rollback further than the previous production deployment, upgrade to pro.” |
| Gói Pro/Enterprise | Rollback về **mọi bản từng được gắn domain production** |
| Sau rollback | Vercel **tắt tự gán domain production**: push mới lên `main` **không** tự lên production. Gỡ bằng `vercel promote <bản>` (hoặc nút Manage trên Dashboard) |
| Biến môi trường | **Không** đổi theo rollback. Bản cũ chạy với biến môi trường hiện tại |
| Cơ sở dữ liệu, API ngoài | **Không** khôi phục. Vercel chỉ nhắc kiểm tra |
| Cron | Vercel khôi phục định nghĩa cron của bản được quay về. Cài đặt “Disable Cron Jobs” giữ nguyên |
| Chạy đồng thời | Mỗi dự án chỉ một lần rollback/promote tại một thời điểm |
| `vercel promote <bản>` | Đưa một bản đã có lên production. Tài liệu có khác biệt theo loại deployment (bản preview, bản từng là production) và không ghi rõ giới hạn theo gói. **[Chưa xác minh với tài khoản/gói của CDP — chỉ là dự phòng]** |

**Hệ quả cho CDP** (nếu đúng là gói Hobby):
- **RELEASE A:** nếu không có deploy nào chen giữa (kể cả sửa gấp), bản liền trước của bản A **chính là bản 30/9**. Rollback một bước là về 30/9.
- **RELEASE B:** bản liền trước **thường** là bản A, **không mặc định** là 30/9. Xác minh trên Dashboard/CLI và hồ sơ release. Muốn về thẳng 30/9 thì không dùng rollback một bước được; chỉ còn hai cách **dự phòng chưa kiểm thử** (B, C) — phải diễn tập trước RELEASE B.
- **Có sửa gấp production trước RELEASE A:** bản liền trước của A sẽ là bản sửa gấp. Ghi rõ vào hồ sơ release.

## 3. Ba cách quay lại (theo thứ tự ưu tiên khi có sự cố)

> A là cách chính (đã xác minh trên tài liệu). B và C là **dự phòng chưa kiểm thử**: chỉ được ghi vào hồ sơ release
> là “đường quay lại” sau khi đã diễn tập thành công ở phạm vi không chạm production.

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

**B. Promote một bản production cũ hơn** — **DỰ PHÒNG, CHƯA XÁC MINH** (Pro theo tài liệu; Hobby chưa rõ):
```sh
vercel promote <deployment-id-hoac-url-da-doi-chieu>
vercel promote status
```
- **Không** chạy lệnh này trên production chỉ để thử quyền. Thử quyền chỉ ở **dự án thử tách biệt**.
- Chỉ dùng khi chủ dự án ra lệnh và ID deployment đã đối chiếu.

**C. Deploy lại mã baseline từ tag** — **DỰ PHÒNG, CẦN DIỄN TẬP** (chậm hơn vì build lại; không phải “luôn làm được”):
```sh
git fetch --tags
git rev-parse prod-2026-09-30^{commit}                          # phải ra e3b38a4…
git worktree add ../cdp-khoi-phuc-2026-09-30 prod-2026-09-30    # thư mục riêng, KHÔNG đụng main
cd ../cdp-khoi-phuc-2026-09-30/web
vercel link                                                     # chọn ĐÚNG team + dự án; KHÔNG chép tay project.json
cat .vercel/project.json                                        # đối chiếu projectId/orgId với web/.vercel của bản chính
npm ci && npm run build                                         # build thử trên máy trước
vercel deploy                                                   # bản PREVIEW để kiểm, chưa phải production
vercel deploy --prod                                            # CHỈ khi chủ dự án ra lệnh
```
Phải kiểm trước khi coi cách C là dùng được (ghi kết quả vào hồ sơ release):
- **Môi trường build:** phiên bản Node/npm, lệnh build, thư mục gốc (Root Directory) của dự án Vercel khớp với mã 30/9.
- **Biến môi trường:** bản này chạy với biến **hiện tại**; mã cũ có cần biến nào đã bị xóa/đổi tên không.
- **Tài khoản, dự án, `.vercel`:** đúng team, đúng dự án; `vercel link` tạo `.vercel` mới trong worktree; kiểm ID trước mọi lệnh.
- **Cron:** định nghĩa cron trong mã cũ có khác bản đang chạy không.
- **Dữ liệu:** mã cũ đọc được Redis/Blob và cấu hình có sau release (§5).
- **Domain:** sau deploy, domain trỏ đúng bản mới deploy.
- Xong việc thì xóa worktree: `git worktree remove ../cdp-khoi-phuc-2026-09-30`.

**Diễn tập** (trước RELEASE A cho A; trước RELEASE B cho B/C): chỉ ở **dự án Vercel thử tách biệt** hoặc bằng bước
kiểm tra không thay đổi production (đọc `vercel list`, `vercel inspect`, Dashboard). Hành động trên production cần
lệnh riêng của chủ dự án.

**Cấm:**
- `git reset --hard` + force-push `main`;
- xóa hay viết lại commit A1–A3;
- sửa tag `prod-2026-09-30`;
- rollback hay deploy khi chưa đối chiếu ID deployment;
- chạy `vercel promote`/`rollback` trên production để “thử quyền”;
- chép tay `.vercel/project.json` sang thư mục khác thay cho `vercel link`.

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
- [ ] Xác nhận **bản sao lưu dữ liệu** theo quyền chủ dự án (có/không, ở đâu, thời điểm).
- [ ] **Chốt đường quay lại thực sự khả dụng** (đã thử hoặc đã xác minh trên Dashboard), ghi đường dẫn/ID bản phát hành đã xác minh. **Chưa chốt → không RELEASE.**
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
- [ ] Ghi rõ: rollback một bước về A (kiểm bản liền trước thật sự là A); về thẳng 30/9 bằng B hay C — **chỉ cách nào đã diễn tập thành công** ở dự án thử mới được ghi là đường quay lại.
- [ ] Kiểm tương thích dữ liệu của mã A **và** mã 30/9 với dữ liệu sau B (khóa giao diện mới trên thiết bị, `updatedAt` trong tóm tắt Sổ, sự kiện có `theme`…).
- [ ] Công tắc “Cơ bản” **không** được ghi là phương án rollback.
