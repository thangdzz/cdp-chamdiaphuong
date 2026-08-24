"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getOccupancyLabel, getOccupancyStatus } from "./occupancy";
import { ContributionPanel } from "./ContributionPanel";
import { CheckinButton } from "./CheckinButton";
import { QuestionPrompt } from "./QuestionPrompt";
import { PlaceFacts } from "./PlaceFacts";
import { stripDiacritics } from "@/lib/ingestion/normalize";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { mapsUrl } from "@/lib/mapsUrl";
import { formatPriceCompact } from "@/lib/priceFormat";
import { AddToNotebook } from "./AddToNotebook";
import { NoteInput } from "./NoteInput";
import { PersonalNote } from "./PersonalNote";
import { PinIcon, ClockIcon, CheckCircleIcon, DocumentIcon, PhoneIcon } from "./Icon";

// Nhãn "còn chỗ" chỉ có nghĩa với Ăn/Ngủ (quảng trường, bến xe không "hết chỗ") —
// SPEC-chang-3.md §5.
const OCCUPANCY_LABEL_TYPES = new Set(["an", "ngu"]);

const PRICE_BUCKETS = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "duoi-100k", label: "Dưới 100.000đ", min: 0, max: 100000 },
  { id: "100k-500k", label: "100.000 – 500.000đ", min: 100000, max: 500000 },
  { id: "500k-1tr", label: "500.000 – 1.000.000đ", min: 500000, max: 1000000 },
  { id: "tren-1tr", label: "Trên 1.000.000đ", min: 1000000, max: Infinity },
];

// Rút gọn địa chỉ về "số nhà + tên đường" cho thẻ gọn — bỏ phần phường/thành phố (đã có
// mục "Khu vực" riêng). "Địa chỉ đầy đủ" lúc bung thẻ vẫn giữ nguyên chuỗi gốc.
const ADDRESS_DROP_PREFIXES = ["phường", "tp", "thành phố", "tổ", "xã", "huyện", "thị trấn"];
function formatShortAddress(address) {
  if (!address) return address;
  const parts = address.split(",").map((s) => s.trim());
  const kept = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (ADDRESS_DROP_PREFIXES.some((prefix) => lower.startsWith(prefix))) break;
    kept.push(part);
  }
  return kept.length > 0 ? kept.join(", ") : address;
}

// Nhóm từ đồng nghĩa cho tìm kiếm — gõ 1 trong các từ này đều ra kết quả như nhau. Đã qua
// stripDiacritics + lowercase nên viết không dấu (VD "cà phê" -> "ca phe").
const SEARCH_SYNONYM_GROUPS = [
  ["cafe", "coffee", "ca phe", "caphe"],
  ["khach san", "hotel"],
  ["nha nghi", "motel", "nha tro", "guesthouse"],
  ["nha hang", "restaurant", "quan an"],
  ["an sang", "breakfast"],
  ["an trua", "lunch"],
  ["an toi", "dinner"],
];

function expandSearchWord(word) {
  const group = SEARCH_SYNONYM_GROUPS.find((g) =>
    g.some((term) => term.startsWith(word) || word.startsWith(term))
  );
  return group ? [word, ...group] : [word];
}

// Khớp từng từ trong ô tìm kiếm với địa điểm — mỗi từ phải khớp (đúng chữ hoặc 1 từ đồng
// nghĩa của nó), cho phép gõ nhiều từ cùng lúc (VD "cafe minh xuan").
function matchesSearchQuery(haystack, query) {
  const words = query.split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  return words.every((word) => expandSearchWord(word).some((alt) => haystack.includes(alt)));
}

function matchesPriceBucket(place, bucketId) {
  if (bucketId === "all") return true;
  if (place.priceMin == null || place.priceMax == null) return false;
  const bucket = PRICE_BUCKETS.find((b) => b.id === bucketId);
  return place.priceMin <= bucket.max && place.priceMax >= bucket.min;
}

export function confidenceLabel(score) {
  if (score == null) return null;
  if (score >= 0.75) return "Cao";
  if (score >= 0.5) return "Trung bình";
  return "Thấp";
}

export function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return null;
  }
}

// Tuổi tương đối, không giới hạn trần (khác formatCheckinAge bên dưới, vốn ẩn hẳn sau 90
// ngày) — dùng cho ảnh menu, nơi cần nói thật ảnh cũ đến đâu chứ không được phép im lặng.
export function formatRelativeAge(iso) {
  if (!iso) return null;
  let diffDays;
  try {
    diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  } catch {
    return null;
  }
  if (!(diffDays >= 0)) return null;
  if (diffDays === 0) return "hôm nay";
  if (diffDays === 1) return "hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} tháng trước`;
  return `${Math.floor(diffDays / 365)} năm trước`;
}

// Dòng "Còn mở · xác nhận N ngày trước" trên thẻ — SPEC-chang-1.md §2.1. Trên 90 ngày (hoặc
// chưa ai xác nhận bao giờ) trả về null để component không hiện gì (bỏ hẳn khỏi DOM, không
// giữ chỗ như nhãn "còn chỗ" cũ).
function formatCheckinAge(lastCheckinAtIso) {
  if (!lastCheckinAtIso) return null;
  let diffDays;
  try {
    diffDays = Math.floor((Date.now() - new Date(lastCheckinAtIso).getTime()) / 86400000);
  } catch {
    return null;
  }
  if (!(diffDays >= 0) || diffDays > 90) return null;

  // Xanh lá dành riêng cho đúng 1 việc: "Còn mở" (SPEC-giao-dien.md §4). Cảnh báo lâu chưa
  // xác nhận không còn tô nền hổ phách — chỉ còn chữ xám nhạt.
  if (diffDays > 30) {
    return { text: "Lâu chưa ai xác nhận (hơn 1 tháng)", tone: "muted" };
  }
  if (diffDays >= 7) {
    const weeks = Math.min(4, Math.ceil(diffDays / 7));
    return { text: `Còn mở · xác nhận ${weeks} tuần trước`, tone: "green" };
  }
  const ago = diffDays === 0 ? "hôm nay" : diffDays === 1 ? "hôm qua" : `${diffDays} ngày trước`;
  return { text: `Còn mở · xác nhận ${ago}`, tone: "green" };
}

// Suy ra loại hình chỗ ngủ từ tên (không có trường riêng) — chỉ đọc lại thông tin đã có,
// không bịa. "Món chính"/"Phù hợp" (cho Ăn) chưa có dữ liệu nguồn nào -> ẩn nếu không có.
function inferLodgingKind(name) {
  return name.toLowerCase().includes("nhà nghỉ") ? "Nhà nghỉ" : "Khách sạn";
}

// Khối thông tin cuối thẻ bung (SPEC-giao-dien.md §6c mục 1) — mỗi thứ 1 dòng riêng, icon
// đầu dòng, BỎ HẲN dòng nào không có dữ liệu (không lấp bằng "Chưa rõ..."/"Chưa đánh giá...").
// Trả về mảng {icon, text}, component tự quyết định ẩn dòng nào.
function buildMetaRows(place, lodgingKind, showAddress) {
  const rows = [];
  if (showAddress) rows.push({ icon: PinIcon, text: place.address });
  const updated = formatDate(place.lastUpdatedAt);
  if (updated) rows.push({ icon: ClockIcon, text: `Cập nhật ${updated}` });
  const confidence = confidenceLabel(place.confidenceScore);
  if (confidence) rows.push({ icon: CheckCircleIcon, text: `Độ tin cậy ${confidence}` });
  if (place.sourceCount) rows.push({ icon: DocumentIcon, text: `Đối chiếu ${place.sourceCount} nguồn` });
  return rows;
}

// Dòng phụ không icon (loại hình/món chính/phù hợp/ghi chú) — vẫn ẩn hẳn khi rỗng, chỉ khác
// là không đủ "cấp" để có icon riêng như 4 dòng chính ở buildMetaRows.
function buildExtraLines(place, lodgingKind) {
  return [lodgingKind, place.mainDish, place.suitableFor, place.note].filter(Boolean);
}

// --- Gallery ảnh toàn màn hình -------------------------------------------------------

// Chụm 2 ngón để zoom (quanh tâm ảnh, không đuổi theo đúng điểm chụm — đơn giản, đủ dùng cho
// nhu cầu xem rõ chi tiết/đọc ảnh menu), 1 ngón kéo xem khi đã zoom, double-tap zoom nhanh
// 1x<->2.5x. `touch-none` trên đúng vùng ảnh chặn trình duyệt tự zoom cả trang (SPEC lỗi
// 2026-08-24: chụm 2 ngón trước đây bị trình duyệt hiểu thành zoom toàn trang, giật/lệch).
const ZOOM_MAX = 4;
const DOUBLE_TAP_ZOOM = 2.5;

function touchDistance(t0, t1) {
  return Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
}

export function PhotoGallery({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [visible, setVisible] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isGesturing, setIsGesturing] = useState(false);
  const pinchRef = useRef(null);
  // 1 ngón chạm: lưu điểm bắt đầu cho CẢ 2 việc (kéo xem khi đã zoom / vuốt đổi ảnh-đóng khi
  // chưa zoom) — quyết định đây là tap hay kéo dựa vào quãng đường di chuyển thực tế lúc buông
  // tay (touchend), KHÔNG dựa vào scale lúc bắt đầu chạm. Trước đây tách riêng theo scale lúc
  // touchstart nên double-tap khi đang zoom luôn bị hiểu nhầm thành bắt đầu kéo, không bao giờ
  // kiểm tra được double-tap để zoom ra lại.
  const touchRef = useRef(null);
  const lastTapRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function requestClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  // Ảnh mới (vuốt/bấm thumbnail) luôn bắt đầu từ 1x, không mang zoom ảnh cũ sang — reset ngay
  // tại nơi đổi `index` (thay vì effect riêng) để tránh setState lồng trong effect.
  function goToIndex(next) {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setIndex(next);
  }

  function clampTranslate(x, y, s) {
    const el = imgRef.current;
    if (!el) return { x: 0, y: 0 };
    const maxX = Math.max(0, (el.offsetWidth * s - el.offsetWidth) / 2);
    const maxY = Math.max(0, (el.offsetHeight * s - el.offsetHeight) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  }

  function toggleZoom() {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(DOUBLE_TAP_ZOOM);
    }
  }

  function handleTouchStart(e) {
    if (e.touches.length === 2) {
      pinchRef.current = { startDist: touchDistance(e.touches[0], e.touches[1]), startScale: scale };
      touchRef.current = null;
      setIsGesturing(true);
      return;
    }
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY, startTranslate: translate };
    if (scale > 1) setIsGesturing(true);
  }

  // `touch-action: none` trên vùng ảnh (JSX bên dưới) đã đủ chặn trình duyệt tự zoom/cuộn
  // trang khi chạm ở đây — không cần preventDefault() nữa (React gắn listener touch dạng
  // passive nên gọi preventDefault() chỉ tạo cảnh báo console vô ích, không có tác dụng thêm).
  function handleTouchMove(e) {
    if (pinchRef.current && e.touches.length === 2) {
      const dist = touchDistance(e.touches[0], e.touches[1]);
      const nextScale = Math.min(
        ZOOM_MAX,
        Math.max(1, pinchRef.current.startScale * (dist / pinchRef.current.startDist))
      );
      setScale(nextScale);
      setTranslate((t) => clampTranslate(t.x, t.y, nextScale));
      return;
    }
    // Kéo xem chỉ có tác dụng khi đã zoom — lúc scale === 1, clampTranslate() luôn ghim về
    // {0,0} (biên bằng 0), nên cứ để chạy, không cần tách nhánh riêng theo scale ở đây.
    if (touchRef.current && e.touches.length === 1 && scale > 1) {
      const t = e.touches[0];
      const dx = t.clientX - touchRef.current.startX;
      const dy = t.clientY - touchRef.current.startY;
      setTranslate(clampTranslate(touchRef.current.startTranslate.x + dx, touchRef.current.startTranslate.y + dy, scale));
    }
  }

  function handleTouchEnd(e) {
    if (pinchRef.current) {
      pinchRef.current = null;
      setIsGesturing(false);
      if (scale < 1.05) {
        setScale(1);
        setTranslate({ x: 0, y: 0 });
      }
      return;
    }

    const start = touchRef.current;
    touchRef.current = null;
    setIsGesturing(false);
    if (!start) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - start.startX;
    const dy = t.clientY - start.startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Gần như không di chuyển -> tap (bất kể đang zoom hay không). Cách lần chạm trước < 300ms,
    // gần đúng 1 chỗ -> double-tap, đổi zoom nhanh.
    if (absDx < 10 && absDy < 10) {
      const now = Date.now();
      const last = lastTapRef.current;
      if (last && now - last.time < 300 && Math.hypot(t.clientX - last.x, t.clientY - last.y) < 40) {
        lastTapRef.current = null;
        toggleZoom();
        return;
      }
      lastTapRef.current = { time: now, x: t.clientX, y: t.clientY };
      return;
    }

    if (scale > 1) return; // đã kéo xem ảnh zoom — không chuyển ảnh/đóng theo vuốt nữa

    if (absDy > 60 && absDy > absDx) {
      requestClose(); // vuốt lên hoặc xuống để đóng
    } else if (absDx > 50 && absDx > absDy) {
      if (dx < 0) goToIndex(Math.min(index + 1, photos.length - 1));
      else goToIndex(Math.max(index - 1, 0));
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-black/95 text-white transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span>
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={requestClose}
          className="cursor-pointer rounded-lg px-2 py-1 text-lg leading-none active:bg-white/10"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>

      <div
        className="touch-none relative flex flex-1 items-center justify-center overflow-hidden px-2"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={photos[index]}
          alt=""
          draggable={false}
          className={`max-h-full max-w-full select-none object-contain ${
            isGesturing ? "" : "transition-transform duration-200"
          }`}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${(visible ? 1 : 0.95) * scale})`,
          }}
        />
      </div>

      <p className="pb-2 text-center text-xs text-white/50">
        ← vuốt ngang xem ảnh khác → · vuốt lên/xuống để đóng · chụm 2 ngón hoặc chạm 2 lần để
        phóng to
      </p>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-4">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToIndex(i)}
              className={`h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 ${
                i === index ? "border-white" : "border-transparent opacity-50"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Thẻ địa điểm (gọn + bung "Xem thêm") --------------------------------------------

function PlaceCard({ place }) {
  // Tính theo giờ máy khách sau khi trang đã tải xong (tránh lệch giờ với máy chủ lúc build).
  const [status, setStatus] = useState(null);
  const [expanded, setExpanded] = useState(false);
  // Nội dung bung chỉ MOUNT khi khách thực sự bấm "Xem thêm" (giữ đúng chi phí như trước —
  // QuestionPrompt tự gọi Server Action lúc mount, mount cho mọi thẻ ngay lúc tải trang sẽ
  // tốn lệnh Redis theo số địa điểm, phạm đúng nguyên tắc ARCHITECTURE.md §"Chi phí đọc
  // Redis"). `mounted` trễ hơn `expanded` 250ms lúc đóng để kịp chạy hết hiệu ứng thu gọn
  // trước khi gỡ khỏi DOM (SPEC-giao-dien.md §7).
  const [mounted, setMounted] = useState(false);
  const unmountTimer = useRef(null);
  const [galleryIndex, setGalleryIndex] = useState(null);
  const [menuGalleryIndex, setMenuGalleryIndex] = useState(null);
  // Bắt đầu bằng giá trị máy chủ, đổi ngay tại chỗ khi khách vừa bấm "Tôi vừa đến, vẫn mở"
  // (SPEC-chang-1.md §2.2: dòng trên thẻ phải đổi ngay, không chờ tải lại trang).
  const [lastCheckinAt, setLastCheckinAt] = useState(place.lastCheckinAt);

  const showOccupancy = OCCUPANCY_LABEL_TYPES.has(place.type);

  useEffect(() => {
    if (showOccupancy) setStatus(getOccupancyStatus(place));
  }, [place, showOccupancy]);

  useEffect(() => () => clearTimeout(unmountTimer.current), []);

  function toggleExpanded() {
    if (expanded) {
      setExpanded(false);
      clearTimeout(unmountTimer.current);
      unmountTimer.current = setTimeout(() => setMounted(false), 250);
    } else {
      clearTimeout(unmountTimer.current);
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setExpanded(true)));
    }
  }

  const statusLabel = showOccupancy && status ? getOccupancyLabel(status, place.type) : null;
  const checkinLabel = formatCheckinAge(lastCheckinAt);
  const photos = place.photos ?? [];
  const menuPhotos = place.menuPhotos ?? [];
  const newestMenuPhotoAge =
    menuPhotos.length > 0
      ? formatRelativeAge(
          menuPhotos.reduce((max, m) => (new Date(m.addedAt) > new Date(max) ? m.addedAt : max), menuPhotos[0].addedAt)
        )
      : null;
  const signatureDishes = place.type === "an" ? (place.signatureDishes ?? []) : [];
  const lodgingKind = place.type === "ngu" ? inferLodgingKind(place.name) : null;
  const shortAddress = formatShortAddress(place.address);
  // §6c mục 2: dòng phụ dưới tên đã hiện địa chỉ rút gọn — nếu rút gọn không bớt được gì
  // (bằng hệt địa chỉ đầy đủ) thì đừng lặp lại y nguyên ở khối bung bên dưới.
  const showFullAddress = Boolean(place.address) && shortAddress !== place.address;
  const metaRows = buildMetaRows(place, lodgingKind, showFullAddress);
  const extraLines = buildExtraLines(place, lodgingKind);

  const compactPrice = formatPriceCompact(place);

  return (
    <li id={place.id} className="scroll-mt-20 rounded-xl bg-white px-[18px] py-5 shadow-sm">
      <h3 className="text-lg font-medium tracking-tight leading-snug text-zinc-900">{place.name}</h3>
      <p className="mt-1 text-[13px] text-zinc-500">{shortAddress}</p>

      <p className="mt-5 flex items-baseline gap-1">
        {compactPrice ? (
          <>
            <span className="text-2xl font-medium tracking-tight text-zinc-900">{compactPrice.compact}</span>
            <span className="text-xs text-zinc-400">{compactPrice.unitText}</span>
          </>
        ) : (
          <span className="text-base font-normal text-zinc-400">Chưa cập nhật giá</span>
        )}
      </p>

      {(checkinLabel || statusLabel) && (
        <div className="mt-3 flex flex-col items-start gap-0.5">
          {checkinLabel && (
            <span className={`text-[13px] font-medium ${checkinLabel.tone === "green" ? "text-emerald-700" : "text-zinc-400"}`}>
              {checkinLabel.text}
            </span>
          )}
          {statusLabel && <span className="text-[13px] text-zinc-400">{statusLabel.text}</span>}
        </div>
      )}

      {mounted && (
        <div className={`cdp-expand mt-5 ${expanded ? "cdp-expand-open" : ""}`}>
          <div className="flex flex-col gap-5 text-sm text-zinc-700">
            <PersonalNote place={place} />

            <PlaceFacts type={place.type} consensus={place.consensus} />

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

            <NoteInput place={place} />

            {photos.length > 0 && (
              <div>
                <p className="mb-1.5 text-[13px] text-zinc-500">Ảnh địa điểm</p>
                <div className="flex gap-2">
                  {photos.slice(0, 3).map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setGalleryIndex(i)}
                      className="h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-lg bg-zinc-100"
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
                    className="cursor-pointer mt-1.5 text-[13px] text-zinc-500 underline"
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
                    className="cursor-pointer mt-1.5 text-[13px] text-zinc-500 underline"
                  >
                    Xem thêm {menuPhotos.length - 3} ảnh →
                  </button>
                )}
              </div>
            )}

            {(metaRows.length > 0 || extraLines.length > 0) && (
              <div className="flex flex-col gap-1.5">
                {metaRows.map(({ icon: RowIcon, text }, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[13px] text-zinc-500">
                    <RowIcon size={15} className="mt-0.5 shrink-0 text-zinc-400" />
                    <span>{text}</span>
                  </div>
                ))}
                {extraLines.map((text, i) => (
                  <p key={i} className="pl-[22px] text-[13px] text-zinc-500">
                    {text}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
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
            className="cdp-pressable inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600"
          >
            <PhoneIcon size={16} />
          </a>
        )}
        {mounted && (
          <>
            <CheckinButton place={place} onCheckedIn={setLastCheckinAt} />
            <AddToNotebook place={place} />
            <ContributionPanel place={place} />
          </>
        )}
        <button
          type="button"
          onClick={toggleExpanded}
          className="cdp-pressable ml-auto inline-flex min-h-11 cursor-pointer items-center gap-0.5 rounded-lg px-2.5 text-sm text-zinc-500"
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

      {mounted && <QuestionPrompt place={place} />}

      {galleryIndex !== null && (
        <PhotoGallery
          photos={photos}
          startIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
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

function Section({ title, items }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="mb-3 text-lg font-medium tracking-tight text-zinc-900">{title}</h2>
      <ul className="flex flex-col gap-3">
        {items.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </ul>
    </section>
  );
}

// Nút lên đầu/xuống cuối trang — mờ khi trang đứng yên (đỡ che nội dung), rõ hơn khi khách
// đang vuốt (dễ bấm đúng lúc cần). Ẩn hẳn nếu trang ngắn, không cần cuộn.
function ScrollButtons() {
  const [scrolling, setScrolling] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    function updateState() {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setCanScrollUp(scrollY > 120);
      setCanScrollDown(maxScroll > 120 && scrollY < maxScroll - 120);
    }

    function handleScroll() {
      updateState();
      setScrolling(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setScrolling(false), 800);
    }

    updateState();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateState);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateState);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!canScrollUp && !canScrollDown) return null;

  return (
    <div
      className={`fixed bottom-3 right-2 z-40 flex flex-col gap-1.5 transition-opacity duration-300 ${
        scrolling ? "opacity-100" : "opacity-20"
      }`}
    >
      {canScrollUp && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="cdp-pressable flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 text-white shadow-lg active:bg-zinc-700"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 15l6-6 6 6" />
          </svg>
        </button>
      )}
      {canScrollDown && (
        <button
          type="button"
          onClick={() =>
            window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" })
          }
          aria-label="Xuống cuối trang"
          className="cdp-pressable flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-zinc-900 text-white shadow-lg active:bg-zinc-700"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default function PlaceExplorer({ places }) {
  const [type, setType] = useState("all");
  const [ward, setWard] = useState("all");
  const [priceBucket, setPriceBucket] = useState("all");
  const [search, setSearch] = useState("");

  // Nhảy tới từ /ghi-chu dùng link "/#placeId" — trình duyệt tự cuộn tới đúng thẻ nhờ id
  // trùng hash, nhưng giữa danh sách dài khách khó nhận ra đúng thẻ nào -> nhấp nháy nhẹ 1
  // lượt để chỉ rõ (không dùng setState, chỉ thao tác DOM trực tiếp qua classList).
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add("cdp-highlight-flash");
    const timer = setTimeout(() => el.classList.remove("cdp-highlight-flash"), 650);
    return () => clearTimeout(timer);
  }, []);

  const wards = useMemo(() => {
    const set = new Set(places.map((p) => p.ward).filter(Boolean));
    return Array.from(set).sort();
  }, [places]);

  const filtered = useMemo(() => {
    const query = stripDiacritics(search).toLowerCase().trim();
    return places.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (ward !== "all" && p.ward !== ward) return false;
      if (!matchesPriceBucket(p, priceBucket)) return false;
      if (query) {
        const haystack = stripDiacritics(
          `${p.name} ${p.address ?? ""} ${p.localArea ?? ""} ${p.ward ?? ""}`
        ).toLowerCase();
        if (!matchesSearchQuery(haystack, query)) return false;
      }
      return true;
    });
  }, [places, type, ward, priceBucket, search]);

  const groupedByType = PLACE_TYPES.map((t) => ({
    type: t,
    items: filtered.filter((p) => p.type === t.id),
  }));

  const hasActiveFilter = type !== "all" || ward !== "all" || priceBucket !== "all" || search !== "";

  return (
    <div>
      <ScrollButtons />

      <div className="mb-4 flex flex-col gap-2">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          >
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M20 20l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, địa chỉ..."
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Xoá tìm kiếm"
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {[{ id: "all", label: "Tất cả" }, ...PLACE_TYPES].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setType(opt.id)}
              className={`cdp-pressable min-h-11 cursor-pointer rounded-lg px-4 text-sm font-medium ${
                type === opt.id
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <select
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
          >
            <option value="all">Tất cả khu vực</option>
            {wards.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>

          <select
            value={priceBucket}
            onChange={(e) => setPriceBucket(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
          >
            {PRICE_BUCKETS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => {
              setType("all");
              setWard("all");
              setPriceBucket("all");
              setSearch("");
            }}
            className="cursor-pointer self-start text-sm text-zinc-500 underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-500">Không có chỗ nào khớp.</p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => {
                setType("all");
                setWard("all");
                setPriceBucket("all");
                setSearch("");
              }}
              className="cursor-pointer text-sm text-zinc-500 underline"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          {groupedByType.map(({ type: t, items }) => (
            <Section key={t.id} title={t.label} items={items} />
          ))}
        </>
      )}
    </div>
  );
}
