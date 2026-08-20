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
import { AddToNotebook } from "./AddToNotebook";

const TYPE_LABEL = Object.fromEntries(PLACE_TYPES.map((t) => [t.id, t.label]));

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

  if (diffDays > 30) {
    return { text: "⚠️ Lâu chưa ai xác nhận (hơn 1 tháng)", className: "bg-amber-50 text-amber-700" };
  }
  if (diffDays >= 7) {
    const weeks = Math.min(4, Math.ceil(diffDays / 7));
    return { text: `✅ Còn mở · xác nhận ${weeks} tuần trước`, className: "bg-emerald-50 text-emerald-700" };
  }
  const ago = diffDays === 0 ? "hôm nay" : diffDays === 1 ? "hôm qua" : `${diffDays} ngày trước`;
  return { text: `✅ Còn mở · xác nhận ${ago}`, className: "bg-emerald-50 text-emerald-700" };
}

// Suy ra loại hình chỗ ngủ từ tên (không có trường riêng) — chỉ đọc lại thông tin đã có,
// không bịa. "Món chính"/"Phù hợp" (cho Ăn) chưa có dữ liệu nguồn nào -> ẩn nếu không có.
function inferLodgingKind(name) {
  return name.toLowerCase().includes("nhà nghỉ") ? "Nhà nghỉ" : "Khách sạn";
}

// --- Gallery ảnh toàn màn hình -------------------------------------------------------

export function PhotoGallery({ photos, startIndex, onClose }) {
  const [index, setIndex] = useState(startIndex);
  const [visible, setVisible] = useState(false);
  const touchStartRef = useRef(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function requestClose() {
    setVisible(false);
    setTimeout(onClose, 200);
  }

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }

  function handleTouchEnd(e) {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDy > 60 && absDy > absDx) {
      requestClose(); // vuốt lên hoặc xuống để đóng
    } else if (absDx > 50 && absDx > absDy) {
      if (dx < 0) setIndex((i) => Math.min(i + 1, photos.length - 1));
      else setIndex((i) => Math.max(i - 1, 0));
    }
    touchStartRef.current = null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-black/95 text-white transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <span>
          {index + 1} / {photos.length}
        </span>
        <button
          type="button"
          onClick={requestClose}
          className="rounded-full px-2 py-1 text-lg leading-none active:bg-white/10"
          aria-label="Đóng"
        >
          ✕
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[index]}
          alt=""
          className={`max-h-full max-w-full object-contain transition-transform duration-200 ${
            visible ? "scale-100" : "scale-95"
          }`}
        />
      </div>

      <p className="pb-2 text-center text-xs text-white/50">
        ← vuốt ngang xem ảnh khác → · vuốt lên/xuống để đóng
      </p>

      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 pb-4">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
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
  const [galleryIndex, setGalleryIndex] = useState(null);
  // Bắt đầu bằng giá trị máy chủ, đổi ngay tại chỗ khi khách vừa bấm "Tôi vừa đến, vẫn mở"
  // (SPEC-chang-1.md §2.2: dòng trên thẻ phải đổi ngay, không chờ tải lại trang).
  const [lastCheckinAt, setLastCheckinAt] = useState(place.lastCheckinAt);

  const showOccupancy = OCCUPANCY_LABEL_TYPES.has(place.type);

  useEffect(() => {
    if (showOccupancy) setStatus(getOccupancyStatus(place));
  }, [place, showOccupancy]);

  const statusLabel = showOccupancy && status ? getOccupancyLabel(status, place.type) : null;
  const checkinLabel = formatCheckinAge(lastCheckinAt);
  const photos = place.photos ?? [];
  const lodgingKind = place.type === "ngu" ? inferLodgingKind(place.name) : null;

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">{place.name}</h3>
        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {TYPE_LABEL[place.type]}
        </span>
      </div>

      <p className="mt-1 text-sm text-zinc-600">{formatShortAddress(place.address)}</p>

      <p className="mt-2 text-sm font-medium text-zinc-800">
        {place.priceText ?? "Chưa cập nhật giá"}
      </p>

      <div className="mt-2 flex flex-col items-start gap-1">
        {checkinLabel && (
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${checkinLabel.className}`}
          >
            {checkinLabel.text}
          </span>
        )}
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium opacity-70 ${
            statusLabel ? statusLabel.className : "invisible"
          }`}
        >
          {statusLabel ? statusLabel.text : "…"}
        </span>
      </div>

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
          {lodgingKind && (
            <p>
              <span className="text-zinc-500">Loại hình: </span>
              {lodgingKind}
            </p>
          )}
          {place.mainDish && (
            <p>
              <span className="text-zinc-500">Món chính: </span>
              {place.mainDish}
            </p>
          )}
          {place.suitableFor && (
            <p>
              <span className="text-zinc-500">Phù hợp: </span>
              {place.suitableFor}
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
              <span className="text-zinc-500">Ghi chú: </span>
              {place.note}
            </p>
          )}

          <PlaceFacts type={place.type} consensus={place.consensus} />

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

          <QuestionPrompt place={place} />
          <CheckinButton place={place} onCheckedIn={setLastCheckinAt} />
          <AddToNotebook place={place} />
          <ContributionPanel place={place} />
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
        <PhotoGallery
          photos={photos}
          startIndex={galleryIndex}
          onClose={() => setGalleryIndex(null)}
        />
      )}
    </li>
  );
}

function Section({ title, items }) {
  if (items.length === 0) return null;
  return (
    <section className="mt-6 first:mt-0">
      <h2 className="mb-3 text-lg font-bold text-zinc-900">{title}</h2>
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
      className={`fixed bottom-5 right-4 z-40 flex flex-col gap-2 transition-opacity duration-300 ${
        scrolling ? "opacity-100" : "opacity-35"
      }`}
    >
      {canScrollUp && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Lên đầu trang"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg active:bg-zinc-700"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
          className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg active:bg-zinc-700"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
            className="w-full rounded-full border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-700"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Xoá tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
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
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                type === opt.id
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-700"
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
            className="flex-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
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
            className="flex-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
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
            className="self-start text-sm text-zinc-500 underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-zinc-500">
          Không tìm thấy địa điểm phù hợp với bộ lọc. Thử bỏ bớt điều kiện lọc.
        </p>
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
