"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getOccupancyLabel, getOccupancyStatus } from "./occupancy";
import { ContributionPanel } from "./ContributionPanel";

const TYPE_LABEL = {
  ngu: "Ngủ",
  an: "Ăn",
};

const PRICE_BUCKETS = [
  { id: "all", label: "Tất cả mức giá" },
  { id: "duoi-100k", label: "Dưới 100.000đ", min: 0, max: 100000 },
  { id: "100k-500k", label: "100.000 – 500.000đ", min: 100000, max: 500000 },
  { id: "500k-1tr", label: "500.000 – 1.000.000đ", min: 500000, max: 1000000 },
  { id: "tren-1tr", label: "Trên 1.000.000đ", min: 1000000, max: Infinity },
];

function mapsUrl(place) {
  const query = `${place.name}, ${place.address}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function matchesPriceBucket(place, bucketId) {
  if (bucketId === "all") return true;
  if (place.priceMin == null || place.priceMax == null) return false;
  const bucket = PRICE_BUCKETS.find((b) => b.id === bucketId);
  return place.priceMin <= bucket.max && place.priceMax >= bucket.min;
}

function confidenceLabel(score) {
  if (score == null) return null;
  if (score >= 0.75) return "Cao";
  if (score >= 0.5) return "Trung bình";
  return "Thấp";
}

function formatDate(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return null;
  }
}

// Suy ra loại hình chỗ ngủ từ tên (không có trường riêng) — chỉ đọc lại thông tin đã có,
// không bịa. "Món chính"/"Phù hợp" (cho Ăn) chưa có dữ liệu nguồn nào -> ẩn nếu không có.
function inferLodgingKind(name) {
  return name.toLowerCase().includes("nhà nghỉ") ? "Nhà nghỉ" : "Khách sạn";
}

// --- Gallery ảnh toàn màn hình -------------------------------------------------------

function PhotoGallery({ photos, startIndex, onClose }) {
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

  useEffect(() => {
    setStatus(getOccupancyStatus(place));
  }, [place]);

  const statusLabel = status ? getOccupancyLabel(status, place.type) : null;
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

      <p className="mt-1 text-sm text-zinc-600">{place.address}</p>

      <p className="mt-2 text-sm font-medium text-zinc-800">
        {place.priceText ?? "Chưa cập nhật giá"}
      </p>

      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
          statusLabel ? statusLabel.className : "invisible"
        }`}
      >
        {statusLabel ? statusLabel.text : "…"}
      </span>

      {expanded && (
        <div className="mt-3 flex flex-col gap-1.5 border-t border-zinc-100 pt-3 text-sm text-zinc-700">
          <p>
            <span className="text-zinc-500">Địa chỉ đầy đủ: </span>
            {place.address}
          </p>
          {place.ward && (
            <p>
              <span className="text-zinc-500">Khu vực: </span>
              {place.ward}
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

export default function PlaceExplorer({ places }) {
  const [type, setType] = useState("all");
  const [ward, setWard] = useState("all");
  const [priceBucket, setPriceBucket] = useState("all");

  const wards = useMemo(() => {
    const set = new Set(places.map((p) => p.ward).filter(Boolean));
    return Array.from(set).sort();
  }, [places]);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (ward !== "all" && p.ward !== ward) return false;
      if (!matchesPriceBucket(p, priceBucket)) return false;
      return true;
    });
  }, [places, type, ward, priceBucket]);

  const ngu = filtered.filter((p) => p.type === "ngu");
  const an = filtered.filter((p) => p.type === "an");

  const hasActiveFilter = type !== "all" || ward !== "all" || priceBucket !== "all";

  return (
    <div>
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex gap-2">
          {[
            { id: "all", label: "Tất cả" },
            { id: "ngu", label: "Ngủ" },
            { id: "an", label: "Ăn" },
          ].map((opt) => (
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
          <Section title="Ngủ" items={ngu} />
          <Section title="Ăn" items={an} />
        </>
      )}
    </div>
  );
}
