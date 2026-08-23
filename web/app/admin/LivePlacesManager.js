"use client";

import { useMemo, useState } from "react";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { stripDiacritics } from "@/lib/ingestion/normalize";
import { Field, PlaceForm } from "./PlaceFormFields";
import { updateLive, deleteLive } from "./actions";

function matchesQuery(place, normalizedQuery) {
  if (!normalizedQuery) return true;
  const haystack = stripDiacritics(
    [place.name, place.address, place.ward, place.localArea].filter(Boolean).join(" ")
  ).toLowerCase();
  return haystack.includes(normalizedQuery);
}

export function LivePlacesManager({ live }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState(null);

  const countByType = useMemo(() => {
    const counts = {};
    for (const p of live) counts[p.type] = (counts[p.type] ?? 0) + 1;
    return counts;
  }, [live]);

  const filtered = useMemo(() => {
    const normalizedQuery = stripDiacritics(query.trim()).toLowerCase();
    return live.filter(
      (p) => (typeFilter === "all" || p.type === typeFilter) && matchesQuery(p, normalizedQuery)
    );
  }, [live, query, typeFilter]);

  async function handleSave(formData) {
    await updateLive(formData);
    setExpandedId(null);
  }

  async function handleDelete(formData) {
    await deleteLive(formData);
    setExpandedId(null);
  }

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm theo tên, địa chỉ, khu vực..."
        className="mb-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
      />

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTypeFilter("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            typeFilter === "all" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
          }`}
        >
          Tất cả {live.length}
        </button>
        {PLACE_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTypeFilter(t.id)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              typeFilter === t.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {t.label} {countByType[t.id] ?? 0}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
          Không tìm thấy chỗ nào
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTypeFilter("all");
            }}
            className="text-xs font-medium text-zinc-900 underline"
          >
            Xoá bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((place) =>
            expandedId === place.id ? (
              <div key={place.id} className="sm:col-span-2">
                <PlaceForm place={place}>
                  <button
                    formAction={handleSave}
                    className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white"
                  >
                    Lưu
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpandedId(null)}
                    className="rounded-full bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700"
                  >
                    Huỷ
                  </button>
                  <button
                    formAction={handleDelete}
                    className="ml-auto rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700"
                  >
                    Xoá
                  </button>
                </PlaceForm>
              </div>
            ) : (
              <div
                key={place.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{place.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {PLACE_TYPES.find((t) => t.id === place.type)?.label ?? place.type}
                    {place.ward ? ` · ${place.ward}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setExpandedId(place.id)}
                  className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                >
                  Sửa
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
