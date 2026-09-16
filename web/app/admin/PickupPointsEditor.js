"use client";

import { useState } from "react";
import { PICKUP_MODES, MAX_PICKUP_POINTS, pickupPointsOf } from "@/lib/pickupPoints";
import { PROVINCES } from "@/lib/provinces";
import { parseMapsCoordinates } from "@/lib/coordinates";
import { LocationConfirm } from "@/app/LocationConfirm";

// Khối "Điểm đón khách" trong form sửa dịch vụ đón khách (NOTE-14 §11). Form admin là form thường
// (server action) nên danh sách điểm gửi đi dưới dạng MỘT ô ẩn JSON; server làm sạch lại toàn bộ
// bằng lib/pickupPoints.js — ô ẩn không được tin.
//
// Toạ độ: dán link Google Maps (hoặc "lat, lng") → tự đọc. Không bắt gõ toạ độ tay (NOTE-14 §6).

const inputClass = "rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900";

let draftCounter = 0;
function emptyPoint() {
  draftCounter += 1;
  return { draftKey: `new-${Date.now()}-${draftCounter}`, name: "", addressLine: "", wardOrDistrict: "", province: "", lat: null, lng: null, locationSource: null, locationConfirmed: false, note: "", active: true };
}

export function PickupPointsEditor({ place }) {
  const [mode, setMode] = useState(place.pickupMode ?? "");
  const [points, setPoints] = useState(() =>
    pickupPointsOf(place, { activeOnly: false }).map((point) => ({ ...point, draftKey: point.id }))
  );
  const [mapsInput, setMapsInput] = useState({}); // draftKey → chữ đang gõ trong ô link

  function update(index, patch) {
    setPoints((current) => current.map((point, i) => (i === index ? { ...point, ...patch } : point)));
  }
  function move(index, delta) {
    setPoints((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  function remove(index) {
    setPoints((current) => current.filter((_, i) => i !== index));
  }
  function readMaps(index, key, text) {
    setMapsInput((current) => ({ ...current, [key]: text }));
    const coords = parseMapsCoordinates(text);
    // Toạ độ đọc từ link là của ghim Google, chưa ai soi lại trên bản đồ → chưa tính là đã xác nhận.
    if (coords) update(index, { lat: coords.lat, lng: coords.lng, locationSource: coords.source ?? null, locationConfirmed: false });
  }

  const payload = JSON.stringify(
    points.map(({ draftKey, ...point }) => ({ ...point, id: point.id ?? undefined }))
  );

  return (
    <fieldset className="mt-3 rounded-lg border border-zinc-200 bg-white p-2">
      <legend className="px-1 text-sm font-semibold text-zinc-900">Điểm đón khách</legend>
      <p className="text-xs text-zinc-500">
        Nơi khách thật sự lên xe — lộ trình và Google Maps dẫn tới đây, KHÔNG dẫn tới địa chỉ chung của dịch vụ.
        Chỉ áp dụng cho xe ghép, taxi, thuê xe có lái. Bắt buộc có địa chỉ + tỉnh/thành.
      </p>
      <input type="hidden" name="pickupPointsJson" value={payload} />

      <label className="mt-2 flex flex-col gap-1 text-xs text-zinc-500 sm:w-64">
        Cách đón
        <select name="pickupMode" value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass}>
          <option value="">— chưa rõ —</option>
          {PICKUP_MODES.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <ol className="mt-2 flex flex-col gap-2">
        {points.map((point, index) => {
          const missing = !point.addressLine?.trim() || !point.province;
          const hasCoords = Number.isFinite(point.lat) && Number.isFinite(point.lng);
          const mapsText = mapsInput[point.draftKey] ?? "";
          return (
            <li
              key={point.draftKey}
              className={`rounded-lg border p-2 ${missing ? "border-red-300 bg-red-50" : "border-zinc-200 bg-zinc-50"} ${point.active ? "" : "opacity-60"}`}
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <label className="flex flex-col gap-1 text-xs text-zinc-500">
                  Tên điểm
                  <input value={point.name ?? ""} onChange={(e) => update(index, { name: e.target.value })} placeholder="VD: Điểm đón Hàng Bún" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-zinc-500">
                  Địa chỉ *
                  <input value={point.addressLine ?? ""} onChange={(e) => update(index, { addressLine: e.target.value })} placeholder="31 Hàng Bún" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-zinc-500">
                  Phường/Quận
                  <input value={point.wardOrDistrict ?? ""} onChange={(e) => update(index, { wardOrDistrict: e.target.value })} placeholder="Ba Đình" className={inputClass} />
                </label>
                <label className="flex flex-col gap-1 text-xs text-zinc-500">
                  Tỉnh/thành *
                  <select value={point.province ?? ""} onChange={(e) => update(index, { province: e.target.value })} className={inputClass}>
                    <option value="">— chọn —</option>
                    {PROVINCES.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="col-span-2 flex flex-col gap-1 text-xs text-zinc-500">
                  Link Google Maps (tự lấy toạ độ — không bắt buộc)
                  <input value={mapsText} onChange={(e) => readMaps(index, point.draftKey, e.target.value)} placeholder="Dán link google.com/maps/place/…" className={inputClass} />
                  <span className={hasCoords ? "text-green-700" : mapsText ? "text-red-600" : "text-zinc-400"}>
                    {hasCoords
                      ? `📍 Có toạ độ ${point.lat}, ${point.lng}`
                      : mapsText
                        ? "Chưa đọc được toạ độ từ link này (link rút gọn chưa hỗ trợ) — Maps sẽ dùng địa chỉ"
                        : "Chưa có toạ độ — Maps sẽ dùng địa chỉ đầy đủ"}
                  </span>
                </label>
                <div className="col-span-2">
                  {/* Cách chắc ăn hơn dán link: xem ghim trên bản đồ rồi kéo cho đúng (2026-09-16). */}
                  <LocationConfirm
                    addressLine={point.addressLine}
                    wardOrDistrict={point.wardOrDistrict}
                    province={point.province}
                    label="điểm đón"
                    value={
                      hasCoords
                        ? { lat: point.lat, lng: point.lng, source: point.locationSource, confirmed: point.locationConfirmed }
                        : null
                    }
                    onConfirm={(next) => {
                      // Form admin là form thường: lưu vào ô ẩn JSON, ghi thật khi bấm Lưu cả form.
                      update(index, {
                        lat: next.lat,
                        lng: next.lng,
                        locationSource: next.source,
                        locationConfirmed: true,
                      });
                      return { ok: true };
                    }}
                  />
                </div>
                <label className="col-span-2 flex flex-col gap-1 text-xs text-zinc-500">
                  Ghi chú
                  <input value={point.note ?? ""} onChange={(e) => update(index, { note: e.target.value })} placeholder="VD: đón trước cửa, gọi trước 30 phút" className={inputClass} />
                </label>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <label className="flex items-center gap-1 text-zinc-700">
                  <input type="checkbox" checked={point.active !== false} onChange={(e) => update(index, { active: e.target.checked })} />
                  Đang dùng
                </label>
                <button type="button" onClick={() => move(index, -1)} disabled={index === 0} className="rounded border border-zinc-300 px-2 py-0.5 disabled:opacity-40">↑</button>
                <button type="button" onClick={() => move(index, 1)} disabled={index === points.length - 1} className="rounded border border-zinc-300 px-2 py-0.5 disabled:opacity-40">↓</button>
                {hasCoords && (
                  <button type="button" onClick={() => update(index, { lat: null, lng: null, locationSource: null, locationConfirmed: false })} className="rounded border border-zinc-300 px-2 py-0.5">
                    Xoá toạ độ
                  </button>
                )}
                <button type="button" onClick={() => remove(index)} className="rounded border border-red-200 px-2 py-0.5 text-red-700">
                  Xoá điểm
                </button>
                {missing && <span className="text-red-700">Thiếu địa chỉ hoặc tỉnh/thành — điểm này sẽ KHÔNG được lưu</span>}
              </div>
            </li>
          );
        })}
      </ol>

      {points.length < MAX_PICKUP_POINTS && (
        <button type="button" onClick={() => setPoints((current) => [...current, emptyPoint()])} className="mt-2 rounded-lg border border-dashed border-zinc-400 px-3 py-1 text-sm text-zinc-700">
          + Thêm điểm đón
        </button>
      )}
    </fieldset>
  );
}
