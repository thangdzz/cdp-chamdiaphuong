"use client";

import { useState } from "react";
import Link from "next/link";
import { LocationConfirm } from "@/app/LocationConfirm";
import { savePlaceLocation } from "@/app/admin/actions";
import { DEFAULT_PROVINCE } from "@/lib/provinces";
import { locationSourceLabel } from "@/lib/placeLocation";

// Bảng xác minh vị trí hàng loạt (spec Location-Routing §13). Một chỗ, một hàng, ghim xong là xong —
// không phải mở form sửa đầy đủ của từng địa điểm.
//
// Bản này KHÔNG gọi Google Places: tra địa chỉ bằng OpenStreetMap rồi người ghim. Khi có khoá Google
// thì thêm nút chọn từ danh sách gợi ý vào đúng hàng này.

export function LocationQueue({ places, verifiedCount }) {
  // Chỗ vừa ghim xong / vừa bỏ qua: bỏ khỏi danh sách đang làm để hàng tiếp theo trôi lên.
  const [done, setDone] = useState({});
  const [error, setError] = useState(null);
  const remaining = places.filter((place) => !done[place.id]);
  const justPinned = Object.values(done).filter((state) => state === "pinned").length;

  return (
    <div>
      <div className="mb-4 rounded-xl bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-zinc-700">
          <span className="font-medium text-zinc-900">{remaining.length}</span> địa điểm chưa xác minh vị trí
          {justPinned > 0 && <span className="text-green-700"> · vừa ghim {justPinned}</span>}
          <span className="text-zinc-500"> · đã xác minh {verifiedCount + justPinned}</span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Chỗ chưa xác minh vẫn hiện bình thường cho khách, nhưng nút của nó là &quot;Tìm trên Google
          Maps&quot; chứ không phải &quot;Chỉ đường&quot; — CDP không nói chắc một vị trí mà chưa ai kiểm.
        </p>
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {remaining.length === 0 ? (
        <p className="rounded-xl bg-white px-4 py-6 text-center text-sm text-zinc-500 shadow-sm">
          Hết rồi. Mọi địa điểm đều đã có vị trí xác minh.
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {remaining.map((place) => (
            <li key={place.id} className="rounded-xl bg-white px-4 py-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{place.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {[place.typeLabel, place.address, place.ward].filter(Boolean).join(" · ") || "Chưa có địa chỉ"}
                  </p>
                  {place.hasCoordinates && (
                    <p className="text-xs text-amber-700">
                      Có sẵn toạ độ ({locationSourceLabel(place.locationSource)}) — mở bản đồ để kiểm rồi xác nhận.
                    </p>
                  )}
                </div>
                <Link
                  href={`/dia-diem/${place.id}`}
                  target="_blank"
                  className="shrink-0 text-xs text-zinc-500 underline"
                >
                  Xem
                </Link>
              </div>

              <LocationConfirm
                addressLine={place.address || place.name}
                wardOrDistrict={place.ward}
                province={DEFAULT_PROVINCE}
                label="vị trí"
                pinSource="admin_pin"
                value={place.coordinates}
                onConfirm={async (next) => {
                  const result = await savePlaceLocation({ id: place.id, coordinates: next });
                  if (result?.ok) setDone((current) => ({ ...current, [place.id]: "pinned" }));
                  else setError(result?.error ?? "Chưa lưu được vị trí.");
                  return result;
                }}
              />

              <button
                type="button"
                onClick={() => setDone((current) => ({ ...current, [place.id]: "skipped" }))}
                className="mt-2 text-xs text-zinc-500 underline"
              >
                Bỏ qua chỗ này
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
