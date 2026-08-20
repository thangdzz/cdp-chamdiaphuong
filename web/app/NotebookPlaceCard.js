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
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{place.name}</h3>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {getPlaceTypeLabel(place.type)}
        </span>
      </div>
      <p className="mt-1 text-sm text-zinc-600">
        {place.priceText ?? "Chưa cập nhật giá"}
        {place.ward ? ` · ${place.ward}` : ""}
      </p>
      {item.note && <p className="mt-2 text-sm text-zinc-700">💬 {item.note}</p>}

      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-100 pt-3 text-sm text-zinc-700">
          <p>
            <span className="text-zinc-500">Địa chỉ đầy đủ: </span>
            {place.address}
          </p>
          {(place.localArea || place.ward) && (
            <p>
              <span className="text-zinc-500">Khu vực: </span>
              {[place.localArea, place.ward].filter(Boolean).join(", ")}
            </p>
          )}
          <p>
            <span className="text-zinc-500">Cập nhật gần nhất: </span>
            {formatDate(place.lastUpdatedAt) ?? "Chưa rõ"}
          </p>
          <p>
            <span className="text-zinc-500">Độ tin cậy: </span>
            {confidenceLabel(place.confidenceScore) ?? "Chưa đánh giá"}
          </p>
          <p>
            <span className="text-zinc-500">Nguồn đối chiếu: </span>
            {place.sourceCount ?? "Chưa rõ"}
          </p>
          {place.note && (
            <p>
              <span className="text-zinc-500">Ghi chú chung: </span>
              {place.note}
            </p>
          )}

          <PlaceFacts type={place.type} consensus={place.consensus} />

          {place.notes?.length > 0 && (
            <div className="flex flex-col gap-1">
              {place.notes.map((n) => (
                <p key={n.id}>
                  <span className="mr-1">💡</span>
                  <span className="text-zinc-500">Mẹo: </span>
                  {n.text}
                </p>
              ))}
            </div>
          )}

          {photos.length > 0 && (
            <div className="mt-1">
              <p className="mb-1.5 text-xs font-medium text-zinc-500">Ảnh địa điểm</p>
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
                  className="mt-1.5 text-xs font-medium text-zinc-500 underline"
                >
                  Xem thêm {photos.length - 3} ảnh →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {expanded && place.phone && (
          <a
            href={`tel:${place.phone}`}
            className="inline-flex items-center gap-1 rounded-full bg-green-600 px-4 py-2 text-sm font-medium text-white active:bg-green-700"
          >
            Gọi ngay
          </a>
        )}
        <a
          href={mapsUrl(place)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white active:bg-zinc-700"
        >
          Chỉ đường
        </a>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700"
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
