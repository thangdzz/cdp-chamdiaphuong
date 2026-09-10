"use client";

import { useState } from "react";
import { mapsUrl } from "@/lib/mapsUrl";
import { formatPriceCompact } from "@/lib/priceFormat";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { transportSummary, transportFamilyOf } from "@/lib/transport";
import { placeCover } from "@/lib/cover";
import { noteContextLabel } from "@/lib/notes";
import { PlaceFacts } from "./PlaceFacts";
import { PhotoGallery, confidenceLabel, formatDate, formatRelativeAge } from "./PlaceExplorer";

// Thẻ chỗ trong trang Xem sổ (/so/{slug}) — bản rút gọn của PlaceCard ở trang chủ, chỉ
// thêm "Xem thêm" để bung xem đầy đủ thông tin (địa chỉ, độ tin cậy, ảnh...), không kèm các
// nút hành động (báo sai/hỏi đáp/check-in) vì đây là trang xem cho khách lạ, không phải
// trang quản lý dữ liệu.
export function NotebookPlaceCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [menuGalleryIndex, setMenuGalleryIndex] = useState(null);
  const place = item.place;
  const photos = place.photos ?? [];
  const menuPhotos = place.menuPhotos ?? [];
  const newestMenuPhotoAge =
    menuPhotos.length > 0
      ? formatRelativeAge(
          menuPhotos.reduce((max, m) => (new Date(m.addedAt) > new Date(max) ? m.addedAt : max), menuPhotos[0].addedAt)
        )
      : null;
  const signatureDishes = place.type === "an" ? (place.signatureDishes ?? []) : [];
  const compactPrice = formatPriceCompact(place);
  // NOTE-03 §3: card compact gồm ảnh · tên · LOẠI · khu vực · giá · ghi chú. Trước đây chỉ có
  // tên + khu vực, nên lướt một cuốn sổ 6 chỗ là 6 khối chữ trông giống hệt nhau — ảnh nhỏ và
  // loại hình là 2 thứ giúp nhận ra nhanh nhất chỗ nào là chỗ nào.
  // Chỗ "Đi lại" đã chọn loại thì nói rõ "Xe ghép · 7 chỗ" thay vì chỉ "Đi lại" (NOTE-04 §2).
  const typeLabel = PLACE_TYPES.find((t) => t.id === place.type)?.label ?? null;
  const subtitle = [transportSummary(place) ?? typeLabel, place.ward].filter(Boolean).join(" · ");
  const cover = placeCover(place);

  return (
    <li className="rounded-xl bg-white px-[18px] py-5 shadow-sm">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium tracking-tight leading-snug text-zinc-900">{place.name}</h3>
          {subtitle && <p className="mt-1 text-[13px] text-zinc-500">{subtitle}</p>}
          <p className="mt-3 flex items-baseline gap-1">
            {compactPrice ? (
              <>
                <span className="text-2xl font-medium tracking-tight text-zinc-900">{compactPrice.compact}</span>
                <span className="text-xs text-zinc-400">{compactPrice.unitText}</span>
              </>
            ) : (
              <span className="text-base font-normal text-zinc-400">Chưa cập nhật giá</span>
            )}
          </p>
        </div>
        {cover && (
          // Cố ý KHÔNG bấm được: ảnh ở đây để nhận diện chỗ, còn xem ảnh thì đã có khối "Ảnh
          // địa điểm" sau khi bung. Ảnh bìa có thể là ảnh menu (xem lib/cover.js), bấm vào mà
          // mở gallery ảnh thường sẽ nhảy sang một ảnh khác hẳn ảnh vừa bấm.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-20 w-20 shrink-0 rounded-lg bg-zinc-100 object-cover" />
        )}
      </div>
      {item.note && <p className="mt-3 text-sm text-zinc-700">💬 {item.note}</p>}

      {expanded && (
        <div className="mt-5 flex flex-col gap-5 text-sm text-zinc-700">
          <PlaceFacts
            type={place.type}
            subtype={place.transportSubtype}
            family={transportFamilyOf(place)}
            consensus={place.consensus}
          />

          {signatureDishes.length > 0 && (
            <div>
              <p className="mb-1.5 text-[13px] text-zinc-500">Món đặc trưng</p>
              <div className="flex flex-wrap gap-1.5">
                {signatureDishes.map((dish) => (
                  <span
                    key={dish}
                    className="rounded-full bg-zinc-100 px-2.5 py-1 text-[13px] text-zinc-700"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NOTE-03 §1.B: mẹo đã duyệt hiện dạng FIELD ("Gửi xe — ..."), không phải bình luận.
              Trước đây chỗ này in "💡 {text}" nên CÙNG một mẹo mở ở trang địa điểm thì thành
              field, mở trong Sổ lại thành dòng bình luận. Mẹo cũ (trước 2026-09-09) chưa có
              ngữ cảnh -> vẫn dùng 💡 để không thành dòng chữ trần, giống cách NoteInput làm. */}
          {place.notes?.length > 0 && (
            <div>
              <p className="mb-1.5 text-[13px] text-zinc-500">Mẹo địa phương</p>
              <div className="flex flex-col gap-2">
                {place.notes.slice(0, 3).map((n) => (
                  <p key={n.id}>
                    {noteContextLabel(n.context) ? (
                      <span className="mr-1.5 font-medium text-zinc-900">{noteContextLabel(n.context)}</span>
                    ) : (
                      <span className="mr-1">💡</span>
                    )}
                    {n.text}
                  </p>
                ))}
              </div>
            </div>
          )}

          {photos.length > 0 && (
            <div>
              <p className="mb-1.5 text-[13px] text-zinc-500">Ảnh địa điểm</p>
              <div className="flex gap-2">
                {photos.slice(0, 3).map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {photos.length > 3 && (
                <button
                  type="button"
                  onClick={() => setGalleryIndex(3)}
                  className="mt-1.5 text-[13px] text-zinc-500 underline"
                >
                  Xem thêm {photos.length - 3} ảnh →
                </button>
              )}
            </div>
          )}

          {menuPhotos.length > 0 && (
            <div>
              <p className="mb-1.5 text-[13px] text-zinc-500">
                Ảnh menu · khách gửi {newestMenuPhotoAge}
              </p>
              <div className="flex gap-2">
                {menuPhotos.slice(0, 3).map((m, i) => (
                  <button
                    key={m.url}
                    type="button"
                    onClick={() => setMenuGalleryIndex(i)}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
              {menuPhotos.length > 3 && (
                <button
                  type="button"
                  onClick={() => setMenuGalleryIndex(3)}
                  className="mt-1.5 text-[13px] text-zinc-500 underline"
                >
                  Xem thêm {menuPhotos.length - 3} ảnh →
                </button>
              )}
            </div>
          )}

          {/* Chỉ hiện thứ CÓ dữ liệu thật. Trước đây 3 dòng cuối luôn hiện kể cả khi trống
              ("Chưa rõ ngày cập nhật", "Độ tin cậy chưa đánh giá", "Đối chiếu chưa rõ nguồn")
              — vừa chiếm chỗ vừa không giúp khách quyết định gì, lại làm dữ liệu trông tệ hơn
              thực tế. Thẻ ở trang chủ đã bỏ kiểu lấp chỗ trống này từ 2026-08-21
              (SPEC-giao-dien.md §6c mục 1), thẻ trong Sổ giờ theo cho khớp.
              Riêng GIÁ vẫn giữ "Chưa cập nhật giá" ở khối trên — giá là thứ khách cần để
              quyết định đi hay không, im lặng ở đó gây hiểu nhầm là miễn phí/rẻ. */}
          <p className="text-[13px] leading-5 text-zinc-500">
            {[
              place.address,
              [place.localArea, place.ward].filter(Boolean).join(", ") || null,
              formatDate(place.lastUpdatedAt) ? `Cập nhật ${formatDate(place.lastUpdatedAt)}` : null,
              confidenceLabel(place.confidenceScore) ? `Độ tin cậy ${confidenceLabel(place.confidenceScore)}` : null,
              place.sourceCount ? `Đối chiếu ${place.sourceCount} nguồn` : null,
              place.note,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center gap-1">
        <a
          href={mapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="cdp-pressable inline-flex items-center rounded-lg bg-[#c8553d] px-4 py-2.5 text-sm font-medium text-white active:bg-[#ad4832]"
        >
          Chỉ đường
        </a>
        {expanded && place.phone && (
          <a
            href={`tel:${place.phone}`}
            aria-label="Gọi ngay"
            title="Gọi ngay"
            className="cdp-pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-lg text-zinc-500"
          >
            📞
          </a>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="cdp-pressable ml-auto inline-flex min-h-11 items-center gap-0.5 rounded-lg px-2.5 text-sm text-zinc-500"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {galleryIndex !== null && (
        <PhotoGallery photos={photos} startIndex={galleryIndex} onClose={() => setGalleryIndex(null)} />
      )}

      {menuGalleryIndex !== null && (
        <PhotoGallery
          photos={menuPhotos.map((m) => m.url)}
          startIndex={menuGalleryIndex}
          onClose={() => setMenuGalleryIndex(null)}
        />
      )}
    </li>
  );
}
