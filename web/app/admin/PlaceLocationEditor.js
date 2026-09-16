"use client";

import { useState } from "react";
import { LocationConfirm } from "@/app/LocationConfirm";
import { DEFAULT_PROVINCE } from "@/lib/provinces";
import { coordinatesOf } from "@/lib/coordinates";
import { googlePlaceIdOf, isLocationVerified, locationSourceLabel, locationOf } from "@/lib/placeLocation";

// Khối "Vị trí trên bản đồ" trong form sửa địa điểm (spec Location-Routing §5, §12).
//
// Đây là cách để 234 địa điểm cũ dần có toạ độ thật: admin mở form, bấm xem bản đồ, kéo ghim, xác
// nhận. Chưa ghim thì địa điểm vẫn hiện bình thường cho khách, chỉ là nút bản đồ của nó là
// "Tìm trên Google Maps" chứ không phải "Chỉ đường" — không giả vờ là đã chính xác.
//
// Form admin là form thường (server action), nên vị trí gửi đi bằng MỘT ô ẩn JSON; server làm sạch
// lại bằng lib/coordinates.js — ô ẩn không được tin.

export function PlaceLocationEditor({ place }) {
  const [coordinates, setCoordinates] = useState(() => coordinatesOf(place) ?? null);
  const [googlePlaceId, setGooglePlaceId] = useState(() => googlePlaceIdOf(place));
  const verified = isLocationVerified({ ...place, coordinates, googlePlaceId });
  const sourceText = coordinates ? locationSourceLabel(locationOf({ coordinates }).source) : null;

  return (
    <fieldset className="mt-3 rounded-lg border border-zinc-200 bg-white p-2">
      <legend className="px-1 text-sm font-semibold text-zinc-900">Vị trí trên bản đồ</legend>
      <input type="hidden" name="placeLocationJson" value={JSON.stringify({ coordinates: coordinates ?? null, googlePlaceId })} />

      <p className={`text-xs ${verified ? "text-green-700" : "text-amber-700"}`}>
        {verified
          ? `✓ Đã xác nhận vị trí (${sourceText}) — khách thấy nút "Chỉ đường".`
          : coordinates
            ? `Có toạ độ nhưng chưa ai xác nhận (${sourceText}) — khách vẫn chỉ thấy nút "Tìm trên Google Maps".`
            : 'Chưa có vị trí. Khách chỉ thấy nút "Tìm trên Google Maps" — Google tự đoán theo tên và có thể ra nhầm chỗ.'}
      </p>
      <p className="mt-0.5 text-xs text-zinc-500">
        Bản đồ mở theo địa chỉ ĐÃ LƯU của chỗ này. Vừa sửa ô Địa chỉ ở trên thì bấm Lưu rồi mở lại
        cho khớp.
      </p>

      <LocationConfirm
        addressLine={place.address || place.name}
        wardOrDistrict={place.ward}
        province={DEFAULT_PROVINCE}
        name={place.name}
        label="vị trí"
        pinSource="admin_pin"
        value={coordinates}
        onConfirm={(next) => {
          // Chỉ ghi vào ô ẩn; lưu thật khi bấm Lưu cả form.
          setCoordinates(next);
          setGooglePlaceId(next.googlePlaceId ?? null);
          return { ok: true };
        }}
      />

      {coordinates && (
        <button
          type="button"
          onClick={() => {
            setCoordinates(null);
            setGooglePlaceId(null);
          }}
          className="mt-2 rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-700"
        >
          Xoá vị trí
        </button>
      )}
    </fieldset>
  );
}
