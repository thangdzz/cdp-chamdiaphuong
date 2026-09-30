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
import { PlaceLocationVote } from "./PlaceLocationVote";
import { ContributionPanel } from "./ContributionPanel";
import { NoteInput } from "./NoteInput";
import { QuestionPrompt } from "./QuestionPrompt";
import { VisitConfirm } from "./VisitConfirm";
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
import { PinIcon, PhoneIcon } from "./Icon";
import { track } from "./analytics";

// Trang một địa điểm (NOTE-02) — bố cục Product Owner/PM chốt 30/9 (vòng dọn cuối trước release).
// Khách chỉ nên cảm nhận HAI vùng nội dung:
//   A. THÔNG TIN ĐỊA ĐIỂM (đầu trang mobile; thẻ bám theo cột phải desktop): tên · loại/khu vực ·
//      trạng thái + "Bạn vừa ghé chỗ này?" · giá (có mới hiện) · địa chỉ · số điện thoại ·
//      [Lưu vào Sổ] [Chỉ đường | Tìm trên Maps | Liên hệ] · link phụ Chia sẻ / + Thêm vào lộ trình
//   B. CẦN BIẾT: thông tin thực tế + món đặc trưng + mẹo + ảnh menu gom chung — khách không cần
//      biết cái nào là trường hệ thống, cái nào là mẹo cộng đồng. Phụ thì vào "Xem thêm".
// Còn lại chỉ là phần phụ: dải ảnh (giữ nguyên), một dòng "Thông tin chưa đúng? Sửa giúp" gập mọi
// lối sửa, một dòng nguồn. Không có thẻ "Liên hệ" riêng, không hàng nút lơ lửng giữa các khối.
//
// Đóng góp nhẹ: hiện sẵn đúng "Bạn vừa ghé chỗ này?" (hai bước, VisitConfirm) và MỘT câu hỏi bấm chọn
// (QuestionPrompt). Mọi component đóng góp là loại sẵn có, cùng hàng chờ duyệt.

const linkButtonClass =
  "cursor-pointer text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2";
const disclosureSummaryClass =
  "flex min-h-11 cursor-pointer list-none items-center gap-1 text-sm font-medium text-zinc-700 [&::-webkit-details-marker]:hidden";
// Một dòng thông tin trong "Cần biết" — icon/nhãn + nội dung, cùng một kiểu cho mọi nguồn dữ liệu.
function InfoRow({ icon, label, children }) {
  return (
    <p className="text-zinc-800">
      {icon && <span className="mr-1.5">{icon}</span>}
      {label && <span className="text-zinc-500">{label}: </span>}
      {children}
    </p>
  );
}

// Một mục có tiêu đề. Nền trắng + bóng nhẹ, không viền (DESIGN.md §3).
function Section({ title, children }) {
  return (
    <section aria-label={title} className="rounded-xl bg-white px-[18px] py-5 shadow-sm">
      <h2 className="text-base font-medium tracking-tight text-zinc-900">{title}</h2>
      <div className="mt-3 flex flex-col gap-3">{children}</div>
    </section>
  );
}

// Phần gập: mũi tên xoay khi mở. Dùng <details> sẵn có của trình duyệt — mở/đóng không cần JS.
function Disclosure({ summary, children, className = "" }) {
  return (
    <details className={`group ${className}`}>
      <summary className={disclosureSummaryClass}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-zinc-400 transition-transform group-open:rotate-90">
          <path d="M9 6l6 6-6 6" />
        </svg>
        {summary}
      </summary>
      <div className="mt-2 flex flex-col gap-3 pl-5">{children}</div>
    </details>
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
  const [tipOpen, setTipOpen] = useState(false);
  // "Chỗ quen gọi" (đỉnh dốc, cây đa) không mở cũng không đóng và không có giá — ẩn hết phần
  // trạng thái thay vì hỏi "vẫn mở chứ" vô nghĩa. Câu hỏi cho khách thì lib/questions.js đã tự cắt.
  const asksStatus = placeTypeAsksStatus(place.type);
  // NOTE-15 §13: chỗ tạm. Trang riêng VẪN mở được kể cả khi đã hết ngày (lộ trình cũ còn trỏ
  // tới đây), nên câu chữ phải nói rõ tình trạng thay vì để khách tưởng chỗ này còn.
  const validityLabel = placeValidityLabel(place);
  const [activeNoteContext, setActiveNoteContext] = useState(null);
  const action = primaryAction(place);
  const ctaRowRef = useRef(null);
  const ctaOffscreen = useOffscreen(ctaRowRef);

  // Đo luồng vNext: bước "Place". Chỗ đã đóng cửa không tính — khách không xem để đi.
  useEffect(() => {
    if (!closed) track("place_open");
  }, [place.id, closed]);
  // Spec Location-Routing §6: chưa xác nhận vị trí thì nút bản đồ là "Tìm trên Maps", không phải "Chỉ đường".
  const mapAction = placeMapAction(place);

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

  // Nút "Liên hệ đặt xe" (Đi lại) cuộn tới mục Liên hệ bên dưới.
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
  const subtitle = [transportSummary(place) ?? typeLabel(place.type), place.ward].filter(Boolean).join(" · ");
  const newestMenuPhotoAt =
    menuPhotos.length > 0
      ? menuPhotos.reduce(
          (max, media) => (new Date(media.uploadedAt) > new Date(max) ? media.uploadedAt : max),
          menuPhotos[0].uploadedAt,
        )
      : null;
  const newestMenuPhotoAge = formatRelativeAge(newestMenuPhotoAt);
  const staleMenuMonths = staleMenuAgeMonths(newestMenuPhotoAt);

  const factProps = {
    type: place.type,
    subtype: place.transportSubtype,
    family: transportFamilyOf(place),
    filledFields: adminFilledFields(place),
    consensus: place.consensus,
  };
  const factRows = placeFactRows(factProps);
  const strongFacts = factRows.filter((r) => !r.consensus.weak);
  const weakFacts = factRows.filter((r) => r.consensus.weak);

  const notes = place.notes ?? [];

  // Hành động chính thứ hai cạnh "Lưu vào Sổ": liên hệ (Đi lại, NOTE-05 §6) hoặc bản đồ.
  // Là nút viền để "Lưu vào Sổ" là nút đậm duy nhất (DESIGN.md §4).
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

  const updated = formatDate(place.lastUpdatedAt);
  const sourceLine = [updated ? `Cập nhật ${updated}` : null, place.sourceCount ? `đối chiếu ${place.sourceCount} nguồn` : null]
    .filter(Boolean)
    .join(" · ");
  const hasNeedToKnow =
    asksStatus ||
    strongFacts.length > 0 ||
    weakFacts.length > 0 ||
    notes.length > 0 ||
    menuPhotos.length > 0 ||
    signatureDishes.length > 0 ||
    Boolean(transportDetailLine(place));

  return (
    <div className="text-[15px] leading-relaxed text-zinc-700 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start lg:gap-8 lg:text-sm">
      {/* ── A. THÔNG TIN ĐỊA ĐIỂM — đầu trang mobile, thẻ bám theo cột phải desktop. Không có đóng góp
          chi tiết, mẹo hay nguồn ở đây (PO 30/9). ── */}
      <header className="lg:sticky lg:top-6 lg:col-start-2 lg:row-start-1 lg:rounded-xl lg:bg-white lg:p-6 lg:shadow-sm">
        <h1 className="text-2xl font-medium leading-snug tracking-tight text-zinc-900">{place.name}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
        {validityLabel && (
          <p className="mt-2 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[13px] text-amber-800">{validityLabel}</p>
        )}

        {asksStatus && (
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <PlaceStatusLine place={{ ...place, lastCheckinAt }} className="text-sm" />
            <VisitConfirm place={place} onCheckedIn={setLastCheckinAt} />
          </div>
        )}

        {compactPrice && (
          <p className="mt-3 flex items-baseline gap-1">
            <span className="text-2xl font-medium tracking-tight text-zinc-900">{compactPrice.compact}</span>
            <span className="text-sm text-zinc-500">{compactPrice.unitText}</span>
          </p>
        )}
        <div className={`${compactPrice ? "mt-2" : "mt-3"} flex flex-col gap-1`}>
          {place.address && (
            <p className="flex items-start gap-1.5 text-zinc-800">
              <PinIcon size={16} className="mt-1 shrink-0 text-zinc-400" />
              <span>{place.address}</span>
            </p>
          )}
          {/* Số điện thoại là CHỮ bấm được để gọi, không thêm nút — xác nhận số đúng/sai nằm ở "Sửa giúp".
              `id` cho nút "Liên hệ đặt xe" (Đi lại) cuộn tới. */}
          {place.phone && (
            <p id={`lien-he-${place.id}`} className="flex items-center gap-1.5 text-zinc-800">
              <PhoneIcon size={16} className="shrink-0 text-zinc-400" />
              <a href={`tel:${place.phone}`} className="underline decoration-zinc-300 underline-offset-2">
                {place.phone}
              </a>
              <span className="text-xs text-zinc-500">số tham khảo</span>
            </p>
          )}
        </div>

        <div ref={ctaRowRef} className="mt-4 flex flex-wrap items-start gap-2 [&>a]:flex-1 [&>button]:flex-1">
          <AddToNotebook place={place} mode="notebook" />
          {mainAction}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-5">
          <button type="button" onClick={handleShare} className={`${linkButtonClass} min-h-11`}>
            {copyLabel}
          </button>
          <AddToNotebook place={place} mode="route" label="+ Thêm vào lộ trình" buttonClassName={`${linkButtonClass} min-h-11`}>
            <CreateRouteFromPlace place={place} label="Tạo lộ trình mới từ chỗ này" className={linkButtonClass} />
          </AddToNotebook>
        </div>
      </header>

      {/* ── Cột trái desktop / phía dưới mobile ── */}
      <div className="mt-8 flex flex-col gap-5 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:max-w-2xl">
        {photos.length > 0 && (
          <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" aria-label="Ảnh địa điểm">
            {photos.map((media, i) => (
              <button
                key={media.id}
                type="button"
                onClick={() => setGalleryIndex(i)}
                aria-label={`Xem ảnh ${i + 1}/${photos.length}`}
                className={`h-40 shrink-0 cursor-pointer snap-start overflow-hidden rounded-xl bg-zinc-100 lg:h-64 ${
                  photos.length === 1 ? "w-full" : "w-[78%] sm:w-72 lg:w-96"
                }`}
              >
                <MediaImage
                  media={media}
                  className="h-full w-full"
                  sizes="(max-width: 1023px) 80vw, 384px"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </button>
            ))}
          </div>
        )}

        {/* ── B. CẦN BIẾT — mọi thông tin thực tế trong MỘT khối, một kiểu dòng. ── */}
        {hasNeedToKnow && (
          <Section title="Cần biết">
            <PlaceFacts which="strong" {...factProps} />
            {signatureDishes.length > 0 && (
              <InfoRow icon="🍜" label="Món đặc trưng">{signatureDishes.join(", ")}</InfoRow>
            )}
            {transportDetailLine(place) && <InfoRow icon="🚐">{transportDetailLine(place)}</InfoRow>}
            {notes.length > 0 && <NoteLine note={notes[0]} />}

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
                  {menuPhotos.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setMenuGalleryIndex(3)}
                      className="h-16 shrink-0 cursor-pointer rounded-lg bg-zinc-100 px-3 text-[13px] text-zinc-600"
                    >
                      +{menuPhotos.length - 3} ảnh
                    </button>
                  )}
                </div>
                {/* !== null chứ không phải `staleMenuMonths &&` — xem chú thích ở PlaceExplorer.js */}
                {staleMenuMonths !== null && (
                  <p className="mt-1.5 text-[13px] text-zinc-500">
                    {priceListPhotoContext(place).name ?? "Bảng giá"} này đã {staleMenuMonths} tháng. Bạn có ảnh mới hơn?
                  </p>
                )}
              </div>
            )}

            {/* MỘT câu hỏi bấm chọn — một chạm. Tạm ẩn khi khách đang thêm mẹo (NOTE-12). */}
            <QuestionPrompt place={place} suspended={activeNoteContext !== null} />

            {/* Phần phụ: thông tin mới 1 người cho biết + mẹo thứ 2 trở đi. Thêm mẹo chỉ khi khách mở. */}
            {weakFacts.length + Math.max(notes.length - 1, 0) > 0 ? (
              <Disclosure summary={`Xem thêm ${weakFacts.length + Math.max(notes.length - 1, 0)} thông tin`}>
                <PlaceFacts which="weak" {...factProps} />
                {notes.slice(1).map((n) => (
                  <NoteLine key={n.id} note={n} />
                ))}
                <TipEntry open={tipOpen} onOpen={() => setTipOpen(true)} place={place} onActiveContext={setActiveNoteContext} />
              </Disclosure>
            ) : (
              <TipEntry open={tipOpen} onOpen={() => setTipOpen(true)} place={place} onActiveContext={setActiveNoteContext} />
            )}
          </Section>
        )}

        {/* Mọi việc SỬA: một dòng phụ nhẹ cuối trang, bấm mới bung (PO 30/9). */}
        <details className="group px-1">
          <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-1 text-sm text-zinc-500 [&::-webkit-details-marker]:hidden">
            Thông tin chưa đúng?
            <span className="font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-2">Sửa giúp</span>
          </summary>
          <div className="mt-2 flex flex-col gap-3 rounded-xl bg-white px-[18px] py-4 shadow-sm">
            {asksStatus && <ContributionPanel place={place} entry="closed" triggerLabel="Chỗ này đã đóng cửa" />}
            {asksStatus && <ContributionPanel place={place} entry="price" triggerLabel={compactPrice ? "Giá khác" : "Thêm giá"} />}
            <ContributionPanel place={place} entry="contact" triggerLabel="Sửa địa chỉ / SĐT" />
            <PhoneBlock place={place} part="confirm" />
            {/* Vì sao nút bản đồ là "Chỉ đường" hay "Tìm trên Maps" + ghim vị trí (spec Consensus §16). */}
            <PlaceLocationVote place={place} />
            <ContributionPanel place={place} triggerLabel="Sửa thêm hoặc gửi ảnh" />
          </div>
        </details>

        {sourceLine && <p className="px-1 text-[13px] text-zinc-500">{sourceLine}</p>}
      </div>

      {/* Mobile: khi đã cuộn qua hàng nút ở đầu trang, Lưu vào Sổ + bản đồ bám đáy màn hình. Khoảng
          trống h-24 giữ phần cuối trang không bị thanh che. */}
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
        <PhotoGallery photos={menuPhotos} startIndex={menuGalleryIndex} onClose={() => setMenuGalleryIndex(null)} />
      )}
    </div>
  );
}

// Mẹo cộng đồng hiện CÙNG kiểu dòng với thông tin thực tế — khách không cần phân biệt nguồn.
function NoteLine({ note }) {
  return (
    <InfoRow icon="💡" label={noteContextLabel(note.context)}>
      {note.text}
    </InfoRow>
  );
}

// "+ Thêm mẹo": các nút ngữ cảnh của NoteInput chỉ hiện khi khách chủ động bấm.
function TipEntry({ open, onOpen, place, onActiveContext }) {
  if (open) return <NoteInput place={place} showPublishedNotes={false} onActiveContext={onActiveContext} />;
  return (
    <button type="button" onClick={onOpen} className={`${linkButtonClass} self-start`}>
      + Thêm mẹo
    </button>
  );
}
