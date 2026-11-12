"use client";

import Image from "next/image";
import { useState } from "react";
import {
  ILLUSTRATION_LABEL,
  ILLUSTRATION_MARK,
  PHOTO_ERROR_LABEL,
  placeIllustration,
} from "@/lib/placeImage";

// Ảnh nhỏ / ảnh đầu trang của một địa điểm, dùng chung cho Tìm chỗ (A5), Chi tiết (A6), Sổ (A7), Lộ trình (A8)
// để chỉ có MỘT cách xử lý ảnh thiếu và ảnh lỗi (DESIGN §5, PM Q2 A3).
//
//   photo  {url,width,height} | null — lấy từ placePhoto() (lib/placeImage.js), không bao giờ là ảnh menu.
//   null   → minh họa đúng nhóm (`type`), alt theo DESIGN “Hình minh họa…, chưa có ảnh thực tế”.
//   lỗi    → chuyển sang minh họa, không thử tải lại ảnh đó nữa (kể cả khi quay lại đúng cặp địa điểm + url đó
//            trong cùng component). Đổi sang ảnh khác hoặc địa điểm khác thì thử ảnh mới một lần — trạng thái lỗi
//            gắn với từng cặp địa điểm + url, không phải một cờ chung.
//
// Khung luôn cố định (cỡ `size` hoặc lớp `className`), ảnh cắt giữa → không nhảy bố cục dù ảnh không ghi kích thước.
// Alt ảnh thật (PM Q3 A3): mặc định rỗng — dùng cho thẻ có tên địa điểm ngay cạnh, cùng liên kết. Nơi ảnh đứng
// riêng (Chi tiết) truyền `alt` mô tả, mặc định placePhotoAlt(tên).
// Minh họa không bao giờ trình bày như ảnh thật: alt luôn nói là minh họa; `mark` hiện dấu ✎ (thẻ tìm, kèm chú
// giải ở đầu danh sách), `label` hiện nhãn chữ (Chi tiết).
export function PlaceThumb({
  photo,
  type,
  placeId,
  alt = "",
  size,
  className = "",
  sizes,
  loading = "lazy",
  mark = false,
  label = false,
}) {
  const [failedKeys, setFailedKeys] = useState(() => new Set());
  const photoKey = photo?.url ? `${placeId ?? ""}|${photo.url}` : null;
  const failed = photoKey !== null && failedKeys.has(photoKey);
  const showPhoto = photoKey !== null && !failed;
  const illustration = placeIllustration(type);
  const state = showPhoto ? "photo" : failed ? "fallback" : "illustration";

  const frameStyle = typeof size === "number" ? { width: size, height: size } : undefined;
  const imageSizes = sizes ?? (typeof size === "number" ? `${size}px` : "100vw");

  return (
    <span
      data-thumb-state={state}
      style={frameStyle}
      className={`relative block shrink-0 overflow-hidden rounded-[10px] bg-surface-2 ${className}`}
    >
      {showPhoto ? (
        <Image
          key={photoKey}
          src={photo.url}
          alt={alt}
          fill
          sizes={imageSizes}
          quality={75}
          loading={loading}
          draggable={false}
          className="object-cover"
          onError={() => setFailedKeys((prev) => (prev.has(photoKey) ? prev : new Set(prev).add(photoKey)))}
        />
      ) : (
        // SVG: next/image tự bỏ qua bước tối ưu với đuôi .svg (Next 16), không cần cấu hình thêm.
        <Image
          src={illustration.src}
          alt={illustration.alt}
          fill
          sizes={imageSizes}
          loading={loading}
          draggable={false}
          className="object-cover"
        />
      )}

      {mark && !showPhoto && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface text-[0.8125rem] leading-none text-ink shadow-card"
        >
          {ILLUSTRATION_MARK}
        </span>
      )}

      {label && !showPhoto && (
        <span className="absolute bottom-2 left-2 rounded-md bg-surface/90 px-2 py-0.5 text-[0.8125rem] leading-snug text-ink">
          {failed ? PHOTO_ERROR_LABEL : ILLUSTRATION_LABEL}
        </span>
      )}
    </span>
  );
}
