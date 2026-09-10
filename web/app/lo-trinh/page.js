"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyRoutes } from "@/app/routeActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { SiteHeader } from "@/app/SiteHeader";

// Cần biết "tôi là ai" ngay từ đầu (anonId trong localStorage) nên làm Client Component,
// giống trang Sổ của tôi — Server Component không đọc được localStorage.
export default function MyRoutesPage() {
  const [routes, setRoutes] = useState(null);

  useEffect(() => {
    const local = loadLocalContributor();
    getMyRoutes(local?.anonId).then(setRoutes);
  }, []);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">Lộ trình của tôi</h1>
          <Link href="/so" className="text-[13px] text-zinc-500 underline">
            Sổ của tôi →
          </Link>
        </div>
        <p className="mb-6 text-[13px] text-zinc-500">
          Lộ trình là các chỗ đi theo thứ tự, có giờ dự kiến. Khác Sổ — Sổ chỉ là tập hợp chỗ hay.
        </p>

        {routes === null && <p className="text-sm text-zinc-500">Đang tải...</p>}

        {routes?.length === 0 && (
          <div className="rounded-xl bg-white p-4 text-sm text-zinc-600 shadow-sm">
            <p>Bạn chưa có lộ trình nào.</p>
            <p className="mt-1 text-zinc-500">
              Cách nhanh nhất: mở một cuốn sổ đã gom sẵn rồi bấm &quot;Tạo lộ trình từ sổ này&quot;.
            </p>
            <Link href="/so" className="mt-3 inline-block text-sm font-medium text-zinc-900 underline">
              Sổ của tôi
            </Link>
          </div>
        )}

        {routes && routes.length > 0 && (
          <ul className="flex flex-col gap-3">
            {routes.map((r) => (
              <li key={r.slug} className="rounded-xl bg-white px-[18px] py-5 shadow-sm">
                <p className="text-lg font-medium tracking-tight text-zinc-900">{r.title}</p>
                <p className="mt-1 text-[13px] text-zinc-500">{r.stopCount} điểm</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/lo-trinh/${r.slug}`}
                    className="cdp-pressable rounded-lg bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700"
                  >
                    Xem
                  </Link>
                  <Link
                    href={`/lo-trinh/${r.slug}/sua`}
                    className="cdp-pressable rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white"
                  >
                    Sửa
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
