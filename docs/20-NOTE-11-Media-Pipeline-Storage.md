# NOTE 11 — Media Pipeline: tối ưu ảnh với hạ tầng hiện có, chừa đường mở rộng

> Dùng cho CDP — Chạm Địa Phương  
> Phạm vi: tối ưu upload/lưu/phục vụ ảnh bằng hạ tầng hiện tại, chưa mua thêm dịch vụ ngoài; đồng thời thiết kế đủ sạch để sau này có thể chuyển hoặc mở rộng sang object storage/CDN khác mà không phải rewrite toàn bộ hệ thống.
>
> Đọc cùng:
> - `19-NOTE-10-Desktop-AppShell-Navigation.md`
> - `ARCHITECTURE.md`
> - `DECISIONS.md`
> - `STATUS.md`
> - `TASKS.md`

## 1. Mục tiêu

Hiện tại tiếp tục dùng:
- Vercel chạy app;
- Upstash Redis giữ dữ liệu;
- Vercel Blob giữ ảnh.

Chưa mua thêm:
- Cloudflare R2;
- AWS S3;
- Google Cloud Storage;
- CDN/media service ngoài.

Nhưng code phải chừa đường để sau này đổi backend ảnh mà không phá schema place/notebook/route.

## 2. Nguyên tắc kiến trúc

Không lưu ảnh:
- trong Redis;
- trong repo;
- dưới dạng base64 trong document;
- trong Google Photos / Apple Photos như production storage.

Ảnh là object riêng. Database chỉ giữ URL/storage key + metadata.

## 3. Storage abstraction

Không gọi Vercel Blob trực tiếp rải rác trong nhiều component/API.

Tạo lớp dùng chung, ví dụ:

```text
lib/media-storage.js
```

Interface tối thiểu:

```js
uploadMedia(file, options)
deleteMedia(storageKey)
getPublicUrl(storageKey)
generateMediaKey(...)
```

Implementation hiện tại:

```text
VercelBlobStorage
```

Sau này có thể thay bằng:

```text
R2Storage
S3Storage
GCSStorage
```

mà UI/place schema ít thay đổi.

## 4. Media model cho place

Không chỉ lưu một mảng URL thuần.

Khuyến nghị:

```js
{
  id,
  storageKey,
  url,
  width,
  height,
  bytes,
  mimeType,
  caption,
  order,
  role,
  source,
  uploadedAt,
  uploadedBy
}
```

Không bắt buộc migrate ngay toàn bộ dữ liệu cũ nếu đang có URL đơn giản.

Có thể normalize khi đọc.

## 5. Role của ảnh

Role gợi ý:

```text
general
cover
navigation
entrance
parking
menu
interior
```

Không tạo kho riêng cho ảnh thường / cover / route. Ưu tiên cùng một media set + metadata role.

## 6. Nhiều ảnh cho mỗi địa điểm

Mỗi place phải hỗ trợ nhiều ảnh.

Admin có thể:
- upload nhiều ảnh;
- reorder;
- xóa;
- sửa caption;
- chọn ảnh cover;
- chọn ảnh navigation.

## 7. Reorder

Ảnh cần có `order`.

Admin UI nên có:
- drag & drop nếu component hiện có hỗ trợ tốt;
- hoặc nút lên/xuống nếu muốn giảm scope.

Order dùng cho:
- gallery;
- thumbnail fallback;
- cover fallback;
- route/navigation fallback.

Không dựa vào thời điểm upload để quyết định thứ tự hiển thị.

## 8. Cover image

Thứ tự ưu tiên:

1. `role=cover`;
2. ảnh đầu tiên theo `order`;
3. fallback mặc định.

Không copy file riêng để làm cover.

## 9. Navigation image cho Lộ trình

Ảnh dẫn đường ưu tiên khả năng nhận diện ngoài thực tế.

Thứ tự:

1. `role=navigation`;
2. `role=entrance`;
3. `role=cover`;
4. ảnh đầu tiên theo `order`;
5. fallback.

Ví dụ phù hợp:
- biển hiệu;
- cửa vào;
- mặt tiền;
- lối rẽ;
- bãi đỗ.

Không mặc định lấy ảnh đẹp nhất nếu nó không giúp nhận diện điểm.

## 10. Upload riêng “Ảnh dẫn đường”

Có thể cho Admin action:

> `Dùng ảnh này làm ảnh dẫn đường`

Nếu chưa có ảnh phù hợp:

> `+ Upload ảnh dẫn đường`

Nhưng ảnh upload ở đây vẫn đi vào media set chung và gán:

```text
role = navigation
```

Không tạo storage riêng.

## 11. Tối ưu ảnh trước khi lưu

Không lưu nguyên ảnh điện thoại nếu không cần.

Pipeline:

```text
upload
→ validate
→ resize
→ compress
→ convert format nếu phù hợp
→ upload Blob
→ lưu metadata
```

Mục tiêu:
- giảm storage;
- giảm bandwidth;
- tăng tốc mobile.

## 12. Giới hạn đầu vào

Cần có guardrail:
- giới hạn số ảnh mỗi lần upload;
- giới hạn dung lượng mỗi file;
- chỉ nhận format ảnh phổ biến;
- reject file quá lớn hoặc không hợp lệ.

Không cần chốt con số cứng nếu code hiện tại đã có limit; audit trước rồi dùng mức hợp lý.

Admin có thể có ngưỡng rộng hơn user.

## 13. Resize / variant

Không cần ảnh 5–10MB cho card nhỏ.

Khuyến nghị tối thiểu:
- một bản chính tối ưu cho gallery;
- một thumbnail/card variant nhỏ hơn.

Nếu kiến trúc hiện tại chưa phù hợp variant vật lý:
- ưu tiên resize/compress bản chính trước;
- chừa interface để thêm variant sau.

## 14. Format

Ưu tiên:
- WebP;
- AVIF nếu thư viện hiện có hỗ trợ ổn.

Không bắt buộc AVIF nếu tăng complexity.

Fallback JPEG/PNG khi cần.

## 15. Lazy loading và responsive images

Frontend cần:
- lazy load ảnh ngoài viewport;
- không tải toàn bộ gallery ngay;
- dùng kích thước ảnh phù hợp card/list/detail;
- tránh render ảnh full-size cho thumbnail.

Nếu dùng `next/image`, tận dụng khả năng hiện có.

## 16. CDN/cache

Tận dụng caching/CDN sẵn có của stack hiện tại.

Chưa mua CDN ngoài.

Kiểm tra:
- cache header;
- URL ổn định;
- không bust cache vô lý;
- không tải lại cùng ảnh nhiều lần.

## 17. Không dùng Google Photos / Apple Photos làm production storage

Không dùng:
- Google Photos;
- Apple Photos/iCloud Photos;
- Google Drive

làm nguồn ảnh public runtime chính.

Nếu sau này có connector/import:
- chỉ dùng làm nguồn nhập;
- sau khi import thì copy về object storage của CDP.

Nếu sau này dùng Google:
- sản phẩm phù hợp là Google Cloud Storage, không phải Google Photos.

## 18. Admin Media Manager

Trong edit place thêm block:

> **Ảnh địa điểm**

Tối thiểu có:
- upload nhiều ảnh;
- reorder;
- xóa;
- caption;
- đánh dấu cover;
- đánh dấu navigation;
- preview.

Không cần xây DAM/CMS phức tạp.

## 19. Hiển thị route

Mỗi stop trong route có thể hiện ảnh nhỏ.

Ưu tiên navigation image.

Ví dụ:

```text
1. Cafe A
[ảnh mặt tiền]

2. Bãi xe B
[ảnh lối vào]

3. Nhà hàng C
[ảnh biển hiệu]
```

Nếu không có ảnh:
- không để layout vỡ;
- dùng placeholder nhẹ hoặc bỏ vùng ảnh.

## 20. Backward compatibility

Nếu place cũ đang có:

```js
photos: ["url1", "url2"]
```

thì normalize thành media object mặc định.

Không bắt buộc migrate toàn Redis ngay nếu có thể xử lý bằng resolver.

## 21. Migration strategy

Ưu tiên:

```text
read old → normalize in memory → write new format khi edit/upload tiếp
```

Thay vì migrate toàn bộ một lần.

Nếu cần migration thật:
- backup;
- idempotent;
- dry run/log.

## 22. Theo dõi usage

Cần metrics cơ bản:
- tổng số ảnh;
- tổng bytes đã lưu nếu lấy được;
- số ảnh/place trung bình;
- upload lỗi;
- file quá lớn bị reject;
- ảnh không còn place tham chiếu.

Nếu Vercel Blob có API/metadata thuận tiện thì dùng; nếu không, lưu summary đơn giản.

## 23. Dọn orphan

Tránh ảnh đã upload nhưng place bị xóa hoặc upload fail giữa chừng.

Có thể:
- xóa blob ngay khi remove ảnh;
- hoặc có cleanup job/admin action sau.

Không cần cron phức tạp ở P0.

## 24. Tốc độ trang

Không coi mua hosting là cách chính để tăng tốc.

Ưu tiên:
1. resize/compress;
2. lazy load;
3. responsive image;
4. cache/CDN hiện có;
5. giảm số ảnh tải đồng thời;
6. pagination/load-more nếu gallery lớn.

Chỉ xem xét hạ tầng khác khi usage thực tế cho thấy cần.

## 25. Chừa đường mở rộng sau này

Code phải cho phép đổi từ:

```text
Vercel Blob
```

sang:

```text
R2 / S3 / GCS / storage khác
```

bằng cách thay storage adapter.

Place/media model không phụ thuộc trực tiếp vendor.

Vendor-specific metadata nếu cần thì để trong:

```js
providerMeta
```

## 26. P0 — làm ngay với hạ tầng hiện tại

1. Audit code upload ảnh hiện tại.
2. Tạo storage abstraction nếu chưa có.
3. Chuẩn hóa media object.
4. Hỗ trợ nhiều ảnh/place.
5. Reorder ảnh.
6. Cover role.
7. Navigation role.
8. Upload nhiều ảnh trong Admin.
9. Resize/compress trước khi lưu.
10. Lazy load / responsive image.
11. Backward compatibility với `photos[]` cũ.

## 27. P1

12. Thumbnail variant.
13. Media usage stats.
14. Cleanup orphan.
15. Caption/role UX tốt hơn.
16. Route stop dùng navigation image rõ ràng hơn.

## 28. Chưa làm

Chưa:
- chuyển sang R2/S3/GCS;
- mua thêm hosting;
- mua CDN;
- import Google Photos;
- import Apple Photos;
- xây DAM;
- AI image moderation;
- duplicate detection nâng cao.

## 29. Tiêu chí hoàn thành

- Ảnh vẫn dùng hạ tầng hiện tại.
- Không lưu ảnh trực tiếp trong Redis/repo.
- Có abstraction để đổi provider sau này.
- Một place có nhiều ảnh.
- Ảnh reorder được.
- Có cover và navigation role.
- Upload được tối ưu dung lượng.
- Frontend không tải ảnh nặng vô ích.
- Route có thể lấy ảnh nhận diện phù hợp.
- Dữ liệu ảnh cũ vẫn đọc được.
- Không khóa kiến trúc vào Vercel Blob.
