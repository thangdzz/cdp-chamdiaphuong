"use client";

import { useState } from "react";
import Link from "next/link";
import { savePlaceLocation } from "@/app/admin/actions";

// Vị trí do KHÁCH ghim, chờ CDP chốt (spec Consensus §15).
//
// Khác bảng bên dưới ở chỗ: những chỗ này đã có người chỉ đường tới đúng nơi giúp rồi, admin chỉ
// cần liếc bản đồ và bấm chốt — nhanh hơn tự ghim từ đầu. Chốt xong thành mức tin cao nhất
// (`admin_pin` + đã xác nhận), phiếu khách không đè lên được nữa.

function mapsLink(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function statusLine(item) {
  if (item.conflict) return { text: "⚠ Khách chỉ về hai chỗ khác nhau — cần anh chọn", tone: "text-amber-700" };
  if (item.status === "community_verified") {
    return { text: `${item.voters} khách cùng chỉ một chỗ — đang dùng để chỉ đường`, tone: "text-emerald-700" };
  }
  return { text: `${item.voters} khách đã ghim — chưa đủ 2 người đồng ý`, tone: "text-zinc-500" };
}

export function LocationSuggestions({ items }) {
  const [done, setDone] = useState({});
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState(null);
  const remaining = items.filter((item) => !done[item.id]);

  if (remaining.length === 0) return null;

  async function pick(item, cluster) {
    setBusy(`${item.id}:${cluster.lat}`);
    setError(null);
    const result = await savePlaceLocation({
      id: item.id,
      coordinates: { lat: cluster.lat, lng: cluster.lng, source: "admin_pin", confirmed: true },
      reason: `chốt theo ${cluster.voters} phiếu của khách`,
    });
    setBusy(null);
    if (result?.ok) setDone((current) => ({ ...current, [item.id]: true }));
    else setError(result?.error ?? "Chưa lưu được vị trí.");
  }

  return (
    <section className="mb-5">
      <h2 className="text-sm font-medium text-zinc-900">Khách đã ghim giúp ({remaining.length})</h2>
      <p className="mt-0.5 text-xs text-zinc-500">
        Bấm &quot;Xem&quot; để kiểm trên bản đồ, rồi chốt chỗ đúng. Chốt xong là vị trí của CDP, phiếu
        khách sau này không tự đổi được nữa.
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <ol className="mt-3 flex flex-col gap-3">
        {remaining.map((item) => {
          const status = statusLine(item);
          return (
            <li key={item.id} className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-amber-100">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.name}</p>
                  <p className="truncate text-xs text-zinc-500">
                    {[item.typeLabel, item.address, item.ward].filter(Boolean).join(" · ") || "Chưa có địa chỉ"}
                  </p>
                  <p className={`text-xs ${status.tone}`}>{status.text}</p>
                  {item.movedAwayMeters != null && (
                    <p className="text-xs text-amber-700">
                      Khách báo chỗ cách vị trí CDP đang dùng khoảng {item.movedAwayMeters}m.
                    </p>
                  )}
                </div>
                <Link
                  href={`/dia-diem/${item.id}`}
                  target="_blank"
                  className="shrink-0 text-xs text-zinc-500 underline"
                >
                  Hồ sơ
                </Link>
              </div>

              <ul className="mt-2 flex flex-col gap-1.5">
                {item.clusters.map((cluster) => (
                  <li key={`${cluster.lat},${cluster.lng}`} className="flex flex-wrap items-center gap-2">
                    <a
                      href={mapsLink(cluster.lat, cluster.lng)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tabular-nums text-zinc-500 underline"
                    >
                      Xem {cluster.lat.toFixed(5)}, {cluster.lng.toFixed(5)}
                    </a>
                    <span className="text-xs text-zinc-500">· {cluster.voters} người</span>
                    <button
                      type="button"
                      disabled={busy != null}
                      onClick={() => pick(item, cluster)}
                      className="cdp-pressable min-h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 text-xs font-medium text-zinc-700 disabled:opacity-50"
                    >
                      {busy === `${item.id}:${cluster.lat}` ? "Đang lưu…" : "Chốt chỗ này"}
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => setDone((current) => ({ ...current, [item.id]: true }))}
                className="mt-2 text-xs text-zinc-500 underline"
              >
                Để sau
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
