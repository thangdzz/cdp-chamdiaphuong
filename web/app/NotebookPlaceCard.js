"use client";

import { useState } from "react";
import { getPlaceTypeLabel } from "@/lib/placeTypes";
import { mapsUrl } from "@/lib/mapsUrl";
import { PlaceFacts } from "./PlaceFacts";
import { PhotoGallery, confidenceLabel, formatDate } from "./PlaceExplorer";

// Thẻ chỗ trong trang Xem sổ (/so/{slug}) — bản rút gọn của PlaceCard ở trang chủ, chỉ
// thêm "Xem thêm" để bung xem đầy đủ thông tin (địa chỉ, độ tin cậy, ảnh...), không kèm các
// nút hành động (báo sai/hỏi đáp/check-in) vì đây là trang xem cho khách lạ, không phải
// trang quản lý dữ liệu.
export function NotebookPlaceCard({ item }) {
  const [expanded, setExpanded] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const place = item.place;
  const photos = place.photos ?? [];

  return (
    <li className="rounded-xl bg-white px-[18px] py-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-lg font-medium tracking-tight leading-snug text-zinc-900">{place.name}</h3>
        <span className="shrink-0 rounded-lg bg-zinc-100 px-2 py-0.5 text-[13px] font-medium text-zinc-500">
          {getPlaceTypeLabel(place.type)}
        </span>
      </div>
      <p className="mt-3 text-2xl font-medium tracking-tight text-zinc-900">
        {place.priceText ?? <span className="text-base font-normal text-zinc-400">Chưa cập nhật giá</span>}
      </p>
      {place.ward && <p className="mt-1 text-[13px] text-zinc-500">{place.ward}</p>}
      {item.note && <p className="mt-2 text-sm text-zinc-700">💬 {item.note}</p>}

      {expanded && (
        <div className="mt-5 flex flex-col gap-5 text-sm text-zinc-700">
          <PlaceFacts type={place.type} consensus={place.consensus} />

          {place.notes?.length > 0 && (
            <div className="flex flex-col gap-2">
              {place.notes.slice(0, 3).map((n) => (
                <p key={n.id}>
                  <span className="mr-1">💡</span>
                  {n.text}
                </p>
              ))}
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

          <p className="text-[13px] leading-5 text-zinc-500">
            {[
              place.address,
              [place.localArea, place.ward].filter(Boolean).join(", ") || null,
              formatDate(place.lastUpdatedAt) ? `Cập nhật ${formatDate(place.lastUpdatedAt)}` : "Chưa rõ ngày cập nhật",
              `Độ tin cậy ${confidenceLabel(place.confidenceScore) ?? "chưa đánh giá"}`,
              `Đối chiếu ${place.sourceCount ?? "chưa rõ"} nguồn`,
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
          className="cdp-pressable inline-flex min-h-11 items-center rounded-lg bg-[#c8553d] px-4 text-sm font-medium text-white active:bg-[#ad4832]"
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
          className="cdp-pressable ml-auto inline-flex min-h-11 items-center gap-0.5 rounded-lg px-2.5 text-sm font-medium text-zinc-500"
        >
          {expanded ? "Thu gọn" : "Xem thêm"}
        </button>
      </div>

      {galleryIndex !== null && (
        <PhotoGallery photos={photos} startIndex={galleryIndex} onClose={() => setGalleryIndex(null)} />
      )}
    </li>
  );
}
