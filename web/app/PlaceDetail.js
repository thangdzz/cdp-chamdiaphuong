"use client";

import { useState } from "react";
import Link from "next/link";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { mapsUrl } from "@/lib/mapsUrl";
import { formatPriceCompact } from "@/lib/priceFormat";
import { PlaceFacts } from "./PlaceFacts";
import { PhoneBlock } from "./PhoneBlock";
import { AddToNotebook } from "./AddToNotebook";
import { CreateRouteFromPlace } from "./CreateRouteFromPlace";
import { CheckinButton } from "./CheckinButton";
import { ContributionPanel } from "./ContributionPanel";
import { NoteInput } from "./NoteInput";
import { QuestionPrompt } from "./QuestionPrompt";
import {
  PhotoGallery,
  confidenceLabel,
  formatDate,
  formatRelativeAge,
  staleMenuAgeMonths,
} from "./PlaceExplorer";
import { noteContextLabel } from "@/lib/notes";
import { placeShareUrl } from "@/lib/siteUrl";
import { MediaImage } from "./MediaImage";
import { placeCoverMedia, placeGeneralMedia, placeMenuMedia } from "@/lib/media";
import { priceListPhotoContext, priceListPhotoTitle } from "@/lib/priceListPhoto";
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

export function PlaceDetail({ place, closed = false, replacement = null }) {
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [menuGalleryIndex, setMenuGalleryIndex] = useState(null);
  const [copyLabel, setCopyLabel] = useState("Chia sẻ");
  const [lastCheckinAt, setLastCheckinAt] = useState(place.lastCheckinAt);
  const [activeNoteContext, setActiveNoteContext] = useState(null);
  const [correctionPanelOpen, setCorrectionPanelOpen] = useState(false);
  const action = primaryAction(place);

  function handleCorrectionPanelChange(open) {
    setCorrectionPanelOpen(open);
    if (open) setActiveNoteContext(null);
  }

  if (closed) {
    return (
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#c8553d]">
          Hồ sơ địa điểm
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-snug tracking-tight text-zinc-900">
          {place.name}
        </h1>
        <section className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-lg font-semibold text-red-800">Địa điểm này đã đóng cửa</h2>
          <p className="mt-2 text-sm leading-relaxed text-red-700">
            CDP giữ lại URL cũ để người đã lưu hoặc được chia sẻ link không bị dẫn tới trang
            không tồn tại.
          </p>
          {replacement && (
            <p className="mt-4 text-sm text-zinc-700">
              Hiện tại ở vị trí này: {" "}
              <Link href={`/dia-diem/${replacement.id}`} className="font-semibold text-[#c8553d] underline">
                {replacement.name}
              </Link>
            </p>
          )}
        </section>
        <Link href="/" className="mt-5 inline-block text-sm text-zinc-600 underline">
          Xem các địa điểm đang hoạt động
        </Link>
      </div>
    );
  }

  // Trang này không có gì để bung — chỉ cần cuộn tới khối "Liên hệ" đã hiện sẵn bên dưới.
  function showContact() {
    document.getElementById(`lien-he-${place.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  const generalMedia = placeGeneralMedia(place);
  const coverPhoto = placeCoverMedia(place);
  const photos = coverPhoto
    ? [coverPhoto, ...generalMedia.filter((item) => item.id !== coverPhoto.id)]
    : generalMedia;
  const menuPhotos = placeMenuMedia(place);
  const signatureDishes = place.type === "an" ? (place.signatureDishes ?? []) : [];
  const compactPrice = formatPriceCompact(place);
  // Đi lại đã chọn loại -> "Xe ghép · 7 chỗ · Minh Xuân"; các loại khác giữ nguyên như cũ.
  const subtitle = [transportSummary(place) ?? typeLabel(place.type), place.ward]
    .filter(Boolean)
    .join(" · ");
  const newestMenuPhotoAt =
    menuPhotos.length > 0
      ? menuPhotos.reduce(
          (max, media) =>
            new Date(media.uploadedAt) > new Date(max) ? media.uploadedAt : max,
          menuPhotos[0].uploadedAt,
        )
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
    <div className="flex flex-col gap-5 text-sm text-zinc-700 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:items-start lg:gap-8">
      <div className="order-0 lg:col-span-2 lg:order-none">
        <h1 className="text-2xl font-semibold tracking-tight leading-snug text-zinc-900">{place.name}</h1>
        {subtitle && <p className="mt-1 text-[13px] text-zinc-500">{subtitle}</p>}
        {transportDetailLine(place) && (
          <p className="mt-1 text-sm text-zinc-700">{transportDetailLine(place)}</p>
        )}
      </div>

      {/* Hai wrapper thành `contents` trên mobile để các khối vẫn theo đúng thứ tự NOTE-02;
          lên desktop chúng trở thành hai cột độc lập, tránh khoảng trắng do grid row kéo cao. */}
      <div className="contents lg:col-start-1 lg:flex lg:flex-col lg:gap-8">
        {photos.length > 0 && (
          <div className="order-1 lg:order-none">
            <button
              type="button"
              onClick={() => setGalleryIndex(0)}
              className="block w-full cursor-pointer overflow-hidden rounded-xl bg-zinc-100"
            >
              <MediaImage
                media={coverPhoto}
                className="h-56 w-full lg:h-[420px]"
                sizes="(max-width: 1023px) 100vw, 720px"
                loading="eager"
              />
            </button>
            {photos.length > 1 && (
              <div className="mt-1.5 flex gap-1.5">
                {photos.slice(1, 3).map((media, i) => (
                  <button
                    key={media.id}
                    type="button"
                    onClick={() => setGalleryIndex(i + 1)}
                    className="h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-zinc-100"
                  >
                    <MediaImage media={media} className="h-full w-full" sizes="56px" />
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

        {signatureDishes.length > 0 && (
          <div className="order-3 lg:order-none">
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
          <div className="order-4 lg:order-none">
            <p className="mb-1.5 text-[13px] text-zinc-500">{priceListPhotoTitle(priceListPhotoContext(place).name ?? "Bảng giá")} · khách gửi {newestMenuPhotoAge}</p>
            <div className="flex gap-2">
              {menuPhotos.slice(0, 3).map((m, i) => (
                <button
                  key={m.url}
                  type="button"
                  onClick={() => setMenuGalleryIndex(i)}
                  className="h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-zinc-100"
                >
                  <MediaImage media={m} className="h-full w-full" sizes="80px" />
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
                {priceListPhotoContext(place).name ?? "Bảng giá"} này đã {staleMenuMonths} tháng. Bạn có ảnh mới hơn?
              </p>
            )}
          </div>
        )}

        {/* Mẹo địa phương hiện như FIELD, không phải bình luận — không avatar, không tên người
            viết (NOTE-02 §7). Chỉ nội dung admin đã duyệt mới tới được đây. */}
        {place.notes?.length > 0 && (
          <div className="order-6 lg:order-none">
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
      </div>

      <div className="contents lg:col-start-2 lg:flex lg:flex-col lg:gap-5">
        <aside aria-label="Thông tin nhanh" className="order-2 flex flex-col gap-5 lg:order-none lg:rounded-2xl lg:border lg:border-zinc-200 lg:bg-white lg:p-6 lg:shadow-sm">
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
            {lastCheckinAt && (
              <p className="mt-1 text-[13px] text-zinc-500">
                Có người xác nhận còn mở {formatRelativeAge(lastCheckinAt)}
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
        </aside>

        <aside aria-label="Liên hệ và nguồn dữ liệu" className="order-5 flex flex-col gap-5 lg:order-none lg:rounded-2xl lg:border lg:border-zinc-200 lg:bg-white lg:p-6 lg:shadow-sm">
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
        </aside>

        <section aria-label="Thao tác địa điểm" className="order-7 flex flex-wrap items-center gap-2 lg:order-none lg:rounded-2xl lg:border lg:border-zinc-200 lg:bg-white lg:p-6 lg:shadow-sm">
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
          <CheckinButton place={place} onCheckedIn={setLastCheckinAt} />
          <button
            type="button"
            onClick={handleShare}
            className="cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
          >
            {copyLabel}
          </button>
        </section>
      </div>

      <section
        aria-label="Đóng góp thông tin địa điểm"
        className="order-8 border-t border-zinc-200 pt-5 lg:col-span-2 lg:order-none lg:rounded-2xl lg:border lg:bg-white lg:p-6 lg:shadow-sm"
      >
        {!correctionPanelOpen && (
          <NoteInput
            place={place}
            showPublishedNotes={false}
            onActiveContext={setActiveNoteContext}
          />
        )}
        <div className={correctionPanelOpen ? "" : "mt-3"}>
          <ContributionPanel
            place={place}
            onOpenChange={handleCorrectionPanelChange}
            onDone={() => setCorrectionPanelOpen(false)}
          />
        </div>
        <QuestionPrompt
          place={place}
          suspended={activeNoteContext !== null || correctionPanelOpen}
        />
      </section>

      {galleryIndex !== null && (
        <PhotoGallery photos={photos} startIndex={galleryIndex} onClose={() => setGalleryIndex(null)} />
      )}
      {menuGalleryIndex !== null && (
        <PhotoGallery
          photos={menuPhotos}
          startIndex={menuGalleryIndex}
          onClose={() => setMenuGalleryIndex(null)}
        />
      )}
    </div>
  );
}
