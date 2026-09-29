"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BROWSABLE_PLACE_TYPES } from "@/lib/placeTypes";
import { ALL, PRICE_BUCKETS, filterPlaces, wardsOf } from "@/lib/placeFilter";
import { RESULTS_PAGE_SIZE, filtersFromParams, paramsFromFilters } from "@/lib/searchResults";
import { PlaceResultCard } from "@/app/PlaceResultCard";

const EMPTY_FILTERS = { search: "", type: ALL, ward: ALL, priceBucket: ALL };

// Danh sách kết quả /tim. Bộ lọc nằm TRÊN URL (replaceState, không tải lại trang): bấm vào một
// chỗ rồi Back là về đúng danh sách đang lọc, và gửi link /tim?loai=an cho người khác vẫn đúng.
// `items` đã xếp chỗ đáng tin lên trước ở máy chủ; lọc giữ nguyên thứ tự đó.
//
// Bộ lọc đọc từ URL ở ĐÂY (useSearchParams), không nhận từ máy chủ: bấm Back từ trang chi tiết,
// Next.js dựng lại trang từ bản đã lưu của lượt mở ĐẦU TIÊN (lúc chưa lọc) — nhận từ máy chủ là
// giao diện về "Tất cả" trong khi URL vẫn đang lọc.
function filtersOf(searchParams) {
  return filtersFromParams(Object.fromEntries(searchParams));
}

export function SearchResults({ items, now }) {
  const searchParams = useSearchParams();
  const urlQuery = paramsFromFilters(filtersOf(searchParams));
  const [filters, setFilters] = useState(() => filtersOf(searchParams));
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const [visible, setVisible] = useState(RESULTS_PAGE_SIZE);

  // URL đổi từ bên ngoài (Back/Forward giữa các lượt lọc) → theo URL. Đổi do chính mình gõ thì
  // hai bên đã khớp, không làm gì. Điều chỉnh ngay lúc vẽ (không dùng effect) như React khuyên.
  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    if (urlQuery !== paramsFromFilters(filters)) setFilters(filtersOf(searchParams));
  }

  const wards = useMemo(() => wardsOf(items), [items]);
  const results = useMemo(() => filterPlaces(items, filters), [items, filters]);
  const hasActiveFilter = paramsFromFilters(filters) !== "";

  function update(patch) {
    const next = { ...filters, ...patch };
    setFilters(next);
    setVisible(RESULTS_PAGE_SIZE); // đổi bộ lọc thì bắt đầu lại từ đầu danh sách
    const query = paramsFromFilters(next);
    window.history.replaceState(null, "", query ? `/tim?${query}` : "/tim");
  }

  return (
    <div>
      {/* SiteHeader cao cố định 57px trên mobile — hàng tìm + tab bám ngay dưới khi cuộn, giống
          trang chủ cũ. Lọc khu vực/giá đi theo nội dung để không che quá nhiều màn hình. */}
      <div className="sticky top-[57px] z-10 -mx-4 flex flex-col gap-2 border-b border-zinc-200 bg-zinc-50/95 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:mx-0 lg:rounded-b-xl lg:border-x lg:px-4">
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
            type="search"
            enterKeyHint="search"
            value={filters.search}
            onChange={(e) => update({ search: e.target.value })}
            placeholder="Tìm theo tên, địa chỉ..."
            aria-label="Tìm theo tên, địa chỉ"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-9 pr-9 text-sm text-zinc-700"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              aria-label="Xoá tìm kiếm"
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {[{ id: ALL, label: "Tất cả" }, ...BROWSABLE_PLACE_TYPES].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => update({ type: opt.id })}
              aria-pressed={filters.type === opt.id}
              className={`cdp-pressable min-h-11 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-medium ${
                filters.type === opt.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 mt-2 flex gap-2">
        <select
          value={filters.ward}
          onChange={(e) => update({ ward: e.target.value })}
          aria-label="Khu vực"
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
        >
          <option value={ALL}>Tất cả khu vực</option>
          {wards.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
        <select
          value={filters.priceBucket}
          onChange={(e) => update({ priceBucket: e.target.value })}
          aria-label="Mức giá"
          className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700"
        >
          {PRICE_BUCKETS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 flex items-baseline justify-between gap-2">
        <p className="text-[13px] text-zinc-500">{results.length} chỗ</p>
        {hasActiveFilter && (
          <button
            type="button"
            onClick={() => update(EMPTY_FILTERS)}
            className="cursor-pointer text-[13px] text-zinc-500 underline"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-sm text-zinc-500">Không có chỗ nào khớp.</p>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={() => update(EMPTY_FILTERS)}
              className="cursor-pointer text-sm text-zinc-500 underline"
            >
              Xoá bộ lọc
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {results.slice(0, visible).map((item) => (
              <PlaceResultCard key={item.id} item={item} now={now} />
            ))}
          </ul>
          {visible < results.length && (
            <button
              type="button"
              onClick={() => setVisible((n) => n + RESULTS_PAGE_SIZE)}
              className="cdp-pressable mt-4 min-h-11 w-full cursor-pointer rounded-xl bg-white text-sm font-medium text-zinc-700 shadow-sm"
            >
              Xem thêm {Math.min(RESULTS_PAGE_SIZE, results.length - visible)} chỗ
            </button>
          )}
        </>
      )}
    </div>
  );
}
