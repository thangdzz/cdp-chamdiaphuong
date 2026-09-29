"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PLACE_TYPES, placeTypeAsksStatus } from "@/lib/placeTypes";
import { placeValidityLabel } from "@/lib/placeValidity";
import { placeMapAction } from "@/lib/mapsUrl";
import { formatPriceCompact } from "@/lib/priceFormat";
import { PlaceFacts, placeFactRows } from "./PlaceFacts";
import { PhoneBlock } from "./PhoneBlock";
import { AddToNotebook } from "./AddToNotebook";
import { CreateRouteFromPlace } from "./CreateRouteFromPlace";
import { CheckinButton } from "./CheckinButton";
import { PlaceLocationVote } from "./PlaceLocationVote";
import { ContributionPanel } from "./ContributionPanel";
import { NoteInput } from "./NoteInput";
import { QuestionPrompt } from "./QuestionPrompt";
import { PhotoGallery, formatDate, formatRelativeAge, staleMenuAgeMonths } from "./PlaceExplorer";
import { PlaceStatusLine } from "./PlaceStatusLine";
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
import { PinIcon, ClockIcon, DocumentIcon } from "./Icon";
import { track } from "./analytics";

// Trang một địa điểm (NOTE-02). Bố cục làm lại theo owner test 30/9: không bày các trường phẳng
// ngang hàng nữa. Đầu trang theo đúng thứ tự khách cần để quyết định:
//   tên → loại/khu vực → trạng thái hoạt động + lần xác nhận → giá → Lưu vào Sổ / Chỉ đường
// Phần còn lại gom thành từng mục có tiêu đề để lướt nhanh: Thông tin thực tế · Mẹo địa phương ·
// Liên hệ & vị trí · Nguồn thông tin · Thao tác khác · Đóng góp.

// Một mục có tiêu đề. Nền trắng + bóng nhẹ, không viền (DESIGN.md §3).
function Section({ title, children, className = "" }) {
  return (
    <section aria-label={title} className={`rounded-xl bg-white px-[18px] py-5 shadow-sm ${className}`}>
      <h2 className="text-base font-medium tracking-tight text-zinc-900">{title}</h2>
      <div className="mt-3 flex flex-col gap-4">{children}</div>
    </section>
  );
}

// Thanh bám đáy (mobile) chỉ hiện khi hàng nút ở đầu trang đã cuộn khuất — không để hai nút
// "Lưu vào Sổ" cùng lúc trên màn hình.
function useOffscreen(ref) {
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setOffscreen(!entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return offscreen;
}

function typeLabel(type) {
  return PLACE_TYPES.find((t) => t.id === type)?.label ?? null;
}

export function PlaceDetail({ place, closed = false, replacement = null }) {
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [menuGalleryIndex, setMenuGalleryIndex] = useState(null);
  const [copyLabel, setCopyLabel] = useState("Chia sẻ");
  const [lastCheckinAt, setLastCheckinAt] = useState(place.lastCheckinAt);
  // "Chỗ quen gọi" (đỉnh dốc, cây đa) không mở cũng không đóng và không có giá — ẩn hết phần
  // trạng thái thay vì hiện "Chưa cập nhật giá" với nút "Vẫn mở" vô nghĩa. Câu hỏi cho khách
  // thì lib/questions.js đã tự cắt, PlaceFacts theo đó cũng rỗng.
  const asksStatus = placeTypeAsksStatus(place.type);
  // NOTE-15 §13: chỗ tạm. Trang riêng VẪN mở được kể cả khi đã hết ngày (lộ trình cũ còn trỏ
  // tới đây), nên câu chữ phải nói rõ tình trạng thay vì để khách tưởng chỗ này còn.
  const validityLabel = placeValidityLabel(place);
  const [activeNoteContext, setActiveNoteContext] = useState(null);
  const [correctionPanelOpen, setCorrectionPanelOpen] = useState(false);
  const action = primaryAction(place);
  const ctaRowRef = useRef(null);
  const ctaOffscreen = useOffscreen(ctaRowRef);

  // Đo luồng vNext: bước "Place". Chỗ đã đóng cửa không tính — khách không xem để đi.
  useEffect(() => {
    if (!closed) track("place_open");
  }, [place.id, closed]);
  // Spec Location-Routing §6: chưa xác nhận vị trí thì nút bản đồ là "Tìm trên Google Maps", không phải "Chỉ đường".
  const mapAction = placeMapAction(place);

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
        <Link href="/tim" className="mt-5 inline-block text-sm text-zinc-600 underline">
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

  // Hành động chính thứ hai cạnh "Lưu vào Sổ": liên hệ (Đi lại, NOTE-05 §6) hoặc bản đồ.
  // Là nút viền để "Lưu vào Sổ" là nút đậm duy nhất (SCOPE-vNext "Place → Sổ", DESIGN.md §4).
  const secondaryCtaClass =
    "cdp-pressable inline-flex min-h-11 items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-800";
  const mainAction =
    action.kind === "contact" ? (
      <button type="button" onClick={showContact} className={`${secondaryCtaClass} cursor-pointer`}>
        {action.label}
      </button>
    ) : action.kind === "google" || mapAction ? (
      <a
        href={action.kind === "google" ? findPhoneOnGoogleUrl(place) : mapAction.href}
        target="_blank"
        rel="noopener noreferrer"
        className={secondaryCtaClass}
      >
        {action.kind === "google" ? action.label : mapAction.label}
      </a>
    ) : null;

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

  // "Nguồn thông tin": ngày cập nhật + số nguồn đối chiếu. KHÔNG hiện "Độ tin cậy Thấp/Cao" nữa
  // (owner test 30/9) — trạng thái thật đã nói ở đầu trang (PlaceStatusLine). confidenceScore vẫn
  // dùng nội bộ để xếp hạng.
  const sourceRows = [];
  const updated = formatDate(place.lastUpdatedAt);
  if (updated) sourceRows.push({ icon: ClockIcon, text: `Cập nhật ${updated}` });
  if (place.sourceCount) sourceRows.push({ icon: DocumentIcon, text: `Đối chiếu ${place.sourceCount} nguồn` });

  const factProps = {
    type: place.type,
    subtype: place.transportSubtype,
    family: transportFamilyOf(place),
    filledFields: adminFilledFields(place),
    consensus: place.consensus,
  };
  const facts = <PlaceFacts {...factProps} />;
  // Biết trước có dòng nào không để không vẽ một mục chỉ có tiêu đề.
  const hasFacts = placeFactRows(factProps).length > 0;
  const hasPracticalInfo = hasFacts || signatureDishes.length > 0 || menuPhotos.length > 0;

  return (
    <div className="flex flex-col gap-5 text-[15px] leading-relaxed text-zinc-700 lg:text-sm">
      {/* ĐẦU TRANG — thứ khách cần để quyết định, đúng thứ tự owner test 30/9. */}
      <header>
        <h1 className="text-2xl font-medium leading-snug tracking-tight text-zinc-900 lg:text-3xl">{place.name}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        {transportDetailLine(place) && <p className="mt-0.5 text-sm text-zinc-700">{transportDetailLine(place)}</p>}
        {validityLabel && (
          <p className="mt-2 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[13px] text-amber-800">{validityLabel}</p>
        )}
        {asksStatus && <PlaceStatusLine place={{ ...place, lastCheckinAt }} className="mt-3 text-sm" />}
        {asksStatus && (
          <p className="mt-3 flex items-baseline gap-1">
            {compactPrice ? (
              <>
                <span className="text-2xl font-medium tracking-tight text-zinc-900">{compactPrice.compact}</span>
                <span className="text-sm text-zinc-400">{compactPrice.unitText}</span>
              </>
            ) : (
              <span className="text-base text-zinc-400">Chưa cập nhật giá</span>
            )}
          </p>
        )}
        <div ref={ctaRowRef} className="mt-4 flex flex-wrap items-start gap-2 [&>a]:flex-1 [&>button]:flex-1 sm:max-w-md">
          <AddToNotebook place={place} mode="notebook" />
          {mainAction}
        </div>
      </header>

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-5">
          {photos.length > 0 && (
            <div>
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

          {hasPracticalInfo && (
            <Section title="Thông tin thực tế">
              {facts}
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
                  <p className="mb-1.5 text-[13px] text-zinc-500">
                    {priceListPhotoTitle(priceListPhotoContext(place).name ?? "Bảng giá")} · khách gửi {newestMenuPhotoAge}
                  </p>
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
            </Section>
          )}

          {/* Mẹo địa phương hiện như FIELD, không phải bình luận — không avatar, không tên người
              viết (NOTE-02 §7). Chỉ nội dung admin đã duyệt mới tới được đây. */}
          {place.notes?.length > 0 && (
            <Section title="Mẹo địa phương">
              {place.notes.map((n) => (
                <p key={n.id} className="text-zinc-700">
                  {noteContextLabel(n.context) && (
                    <span className="mr-1.5 font-medium text-zinc-900">{noteContextLabel(n.context)}</span>
                  )}
                  {n.text}
                </p>
              ))}
            </Section>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Section title="Liên hệ & vị trí">
            {place.address && (
              <p className="flex items-start gap-1.5 text-zinc-700">
                <PinIcon size={16} className="mt-1 shrink-0 text-zinc-400" />
                <span>{place.address}</span>
              </p>
            )}
            <div id={`lien-he-${place.id}`}>
              <PhoneBlock place={place} />
            </div>
            {/* Giải thích vì sao nút bản đồ là "Chỉ đường" hay "Tìm trên Google Maps" (spec
                Consensus §16) — thuộc về vị trí nên đứng trong mục này. */}
            <PlaceLocationVote place={place} />
          </Section>

          {sourceRows.length > 0 && (
            <Section title="Nguồn thông tin">
              {sourceRows.map(({ icon: RowIcon, text }, i) => (
                <p key={i} className="flex items-start gap-1.5 text-sm text-zinc-500">
                  <RowIcon size={15} className="mt-0.5 shrink-0 text-zinc-400" />
                  <span>{text}</span>
                </p>
              ))}
            </Section>
          )}

          <Section title="Thao tác khác">
            {/* Lưu vào Sổ + bản đồ/liên hệ đã ở đầu trang. Lộ trình tách riêng để không lẫn với Sổ. */}
            <div className="flex flex-wrap items-center gap-2">
              <AddToNotebook place={place} mode="route" />
              <CreateRouteFromPlace place={place} />
              {asksStatus && <CheckinButton place={place} onCheckedIn={setLastCheckinAt} />}
              <button
                type="button"
                onClick={handleShare}
                className="cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
              >
                {copyLabel}
              </button>
            </div>
          </Section>
        </div>
      </div>

      <Section title="Đóng góp thông tin">
        {!correctionPanelOpen && (
          <NoteInput place={place} showPublishedNotes={false} onActiveContext={setActiveNoteContext} />
        )}
        <ContributionPanel
          place={place}
          onOpenChange={handleCorrectionPanelChange}
          onDone={() => setCorrectionPanelOpen(false)}
        />
        <QuestionPrompt place={place} suspended={activeNoteContext !== null || correctionPanelOpen} />
      </Section>

      {/* Mobile: khi đã cuộn qua hàng nút ở đầu trang, Lưu vào Sổ + bản đồ bám đáy màn hình để
          không phải cuộn ngược lên. Khoảng trống h-24 giữ khối cuối trang không bị thanh che. */}
      <div className="h-24 lg:hidden" aria-hidden="true" />
      <div
        className={`fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur transition-transform duration-200 lg:hidden ${
          ctaOffscreen ? "translate-y-0" : "pointer-events-none translate-y-full"
        }`}
        inert={!ctaOffscreen}
      >
        <div className="mx-auto flex max-w-xl flex-wrap items-start gap-2 [&>a]:flex-1 [&>button]:flex-1">
          <AddToNotebook place={place} mode="notebook" />
          {mainAction}
        </div>
      </div>

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
