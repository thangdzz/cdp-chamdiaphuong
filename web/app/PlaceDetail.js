"use client";

import { useState } from "react";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { mapsUrl } from "@/lib/mapsUrl";
import { formatPriceCompact } from "@/lib/priceFormat";
import { PlaceFacts } from "./PlaceFacts";
import { PhoneBlock } from "./PhoneBlock";
import { AddToNotebook } from "./AddToNotebook";
import { CreateRouteFromPlace } from "./CreateRouteFromPlace";
import {
  PhotoGallery,
  confidenceLabel,
  formatDate,
  formatRelativeAge,
  staleMenuAgeMonths,
} from "./PlaceExplorer";
import { noteContextLabel } from "@/lib/notes";
import { placeShareUrl } from "@/lib/siteUrl";
import { placeCover } from "@/lib/cover";
import {
  transportSummary,
  transportDetailLine,
  transportFamilyOf,
  primaryAction,
  findPhoneOnGoogleUrl,
  adminFilledFields,
} from "@/lib/transport";
import { PinIcon, ClockIcon, CheckCircleIcon, DocumentIcon } from "./Icon";

// Trang một địa điểm (NOTE-02). Cố ý KHÔNG bọc nội dung trong một card lớn như ở trang chủ —
// bản thân trang này đã là trang địa điểm, bọc thêm card sẽ thành "trang → sổ → card → nội
// dung" (NOTE-02 §10). Thứ tự khối theo NOTE-02 §5.

const ctaClass =
  "cdp-pressable inline-flex items-center rounded-lg bg-[#c8553d] px-4 py-2.5 text-sm font-medium text-white active:bg-[#ad4832]";

function typeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.label ?? null;
}

export function PlaceDetail({ place }) {
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [menuGalleryIndex, setMenuGalleryIndex] = useState(null);
  const [copyLabel, setCopyLabel] = useState("Chia sẻ");
  const action = primaryAction(place);

  // Trang này không có gì để bung — chỉ cần cuộn tới khối "Liên hệ" đã hiện sẵn bên dưới.
  function showContact() {
    document.getElementById(`lien-he-${place.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const photos = place.photos ?? [];
  const menuPhotos = place.menuPhotos ?? [];
  const coverPhoto = placeCover(place);
  const signatureDishes = place.type === "an" ? (place.signatureDishes ?? []) : [];
  const compactPrice = formatPriceCompact(place);
  // Đi lại đã chọn loại -> "Xe ghép · 7 chỗ · Minh Xuân"; các loại khác giữ nguyên như cũ.
  const subtitle = [transportSummary(place) ?? typeLabel(place.type), place.ward]
    .filter(Boolean)
    .join(" · ");
  const newestMenuPhotoAt =
    menuPhotos.length > 0
      ? menuPhotos.reduce((max, m) => (new Date(m.addedAt) > new Date(max) ? m.addedAt : max), menuPhotos[0].addedAt)
      : null;
  const newestMenuPhotoAge = formatRelativeAge(newestMenuPhotoAt);
  const staleMenuMonths = staleMenuAgeMonths(newestMenuPhotoAt);

  async function handleShare() {
    const url = placeShareUrl(place.id);
    const shareData = { title: place.name, text: subtitle, url };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Khách bấm huỷ hộp chia sẻ của máy — không phải lỗi, rơi xuống copy link bên dưới.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopyLabel("Đã sao chép link");
      setTimeout(() => setCopyLabel("Chia sẻ"), 2000);
    } catch {
      setCopyLabel("Không sao chép được");
      setTimeout(() => setCopyLabel("Chia sẻ"), 2000);
    }
  }

  const metaRows = [];
  if (place.address) metaRows.push({ icon: PinIcon, text: place.address });
  const updated = formatDate(place.lastUpdatedAt);
  if (updated) metaRows.push({ icon: ClockIcon, text: `Cập nhật ${updated}` });
  const confidence = confidenceLabel(place.confidenceScore);
  if (confidence) metaRows.push({ icon: CheckCircleIcon, text: `Độ tin cậy ${confidence}` });
  if (place.sourceCount) metaRows.push({ icon: DocumentIcon, text: `Đối chiếu ${place.sourceCount} nguồn` });

  return (
    <div className="flex flex-col gap-5 text-sm text-zinc-700">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight leading-snug text-zinc-900">{place.name}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-zinc-500">{subtitle}</p>}
        {transportDetailLine(place) && (
          <p className="mt-1 text-sm text-zinc-700">{transportDetailLine(place)}</p>
        )}
      </div>

      {photos.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setGalleryIndex(0)}
            className="block w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverPhoto} alt="" className="h-56 w-full object-cover" />
          </button>
          {photos.length > 1 && (
            <div className="mt-1.5 flex gap-1.5">
              {photos.slice(1, 3).map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setGalleryIndex(i + 1)}
                  className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-zinc-100"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
              {photos.length > 3 && (
                <button
                  type="button"
                  onClick={() => setGalleryIndex(3)}
                  className="h-14 shrink-0 cursor-pointer rounded-lg bg-zinc-100 px-3 text-[13px] font-medium text-zinc-600"
                >
                  Xem tất cả {photos.length} ảnh
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div>
        <p className="flex items-baseline gap-1">
          {compactPrice ? (
            <>
              <span className="text-2xl font-medium tracking-tight text-zinc-900">{compactPrice.compact}</span>
              <span className="text-xs text-zinc-400">{compactPrice.unitText}</span>
            </>
          ) : (
            <span className="text-base font-normal text-zinc-400">Chưa cập nhật giá</span>
          )}
        </p>
        {place.lastCheckinAt && (
          <p className="mt-1 text-[13px] text-zinc-500">
            Có người xác nhận còn mở {formatRelativeAge(place.lastCheckinAt)}
          </p>
        )}
      </div>

      <PlaceFacts
        type={place.type}
        subtype={place.transportSubtype}
        family={transportFamilyOf(place)}
        filledFields={adminFilledFields(place)}
        consensus={place.consensus}
      />

      {signatureDishes.length > 0 && (
        <div>
          <p className="mb-1.5 text-[13px] text-zinc-500">Món đặc trưng</p>
          <div className="flex flex-wrap gap-1.5">
            {signatureDishes.map((dish) => (
              <span key={dish} className="rounded-full bg-zinc-100 px-2.5 py-1 text-[13px] text-zinc-700">
                {dish}
              </span>
            ))}
          </div>
        </div>
      )}

      {menuPhotos.length > 0 && (
        <div>
          <p className="mb-1.5 text-[13px] text-zinc-500">Ảnh menu · khách gửi {newestMenuPhotoAge}</p>
          <div className="flex gap-2">
            {menuPhotos.slice(0, 3).map((m, i) => (
              <button
                key={m.url}
                type="button"
                onClick={() => setMenuGalleryIndex(i)}
                className="h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-zinc-100"
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
              className="mt-1.5 cursor-pointer text-[13px] text-zinc-500 underline"
            >
              Xem thêm {menuPhotos.length - 3} ảnh →
            </button>
          )}
          {/* !== null chứ không phải `staleMenuMonths &&` — xem chú thích ở PlaceExplorer.js */}
          {staleMenuMonths !== null && (
            <p className="mt-1.5 text-[13px] text-zinc-400">
              Menu này đã {staleMenuMonths} tháng. Bạn có ảnh mới hơn?
            </p>
          )}
        </div>
      )}

      <div id={`lien-he-${place.id}`}>
        <PhoneBlock place={place} />
      </div>

      {metaRows.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {metaRows.map(({ icon: RowIcon, text }, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[13px] text-zinc-500">
              <RowIcon size={15} className="mt-0.5 shrink-0 text-zinc-400" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Mẹo địa phương hiện như FIELD, không phải bình luận — không avatar, không tên người
          viết (NOTE-02 §7). Chỉ nội dung admin đã duyệt mới tới được đây. */}
      {place.notes?.length > 0 && (
        <div>
          <p className="mb-1.5 text-[13px] text-zinc-500">Mẹo địa phương</p>
          <div className="flex flex-col gap-2">
            {place.notes.map((n) => (
              <p key={n.id} className="text-sm leading-relaxed text-zinc-700">
                {noteContextLabel(n.context) && (
                  <span className="mr-1.5 font-medium text-zinc-900">{noteContextLabel(n.context)}</span>
                )}
                {n.text}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/* CTA chính theo loại hình Đi lại (NOTE-05 §6) — xem chú thích ở PlaceExplorer.js */}
        {action.kind === "contact" ? (
          <button type="button" onClick={showContact} className={`${ctaClass} cursor-pointer`}>
            {action.label}
          </button>
        ) : (
          <a
            href={action.kind === "google" ? findPhoneOnGoogleUrl(place) : mapsUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className={ctaClass}
          >
            {action.label}
          </a>
        )}
        <AddToNotebook place={place} />
        <CreateRouteFromPlace place={place} />
        <button
          type="button"
          onClick={handleShare}
          className="cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
        >
          {copyLabel}
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
    </div>
  );
}
