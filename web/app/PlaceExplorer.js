"use client";

import { useEffect, useMemo, useState } from "react";
import { OCCUPANCY_LABEL, getOccupancyStatus } from "./occupancy";

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

function PlaceCard({ place }) {
  // Tính theo giờ máy khách sau khi trang đã tải xong (tránh lệch giờ với máy chủ lúc build).
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setStatus(getOccupancyStatus(place));
  }, [place]);

  const statusLabel = status ? OCCUPANCY_LABEL[status] : null;

  return (
    <li className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-zinc-900">
          {place.name}
        </h3>
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

      <a
        href={mapsUrl(place)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white active:bg-zinc-700"
      >
        Chỉ đường
      </a>
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
