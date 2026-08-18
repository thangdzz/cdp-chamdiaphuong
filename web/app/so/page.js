"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyNotebooks } from "@/app/notebookActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { SiteHeader } from "@/app/SiteHeader";

// Cần biết "tôi là ai" ngay từ đầu (anonId trong localStorage) nên làm Client Component,
// giống CheckinButton/QuestionPrompt — Server Component không đọc được localStorage.
export default function MyNotebooksPage() {
  const [notebooks, setNotebooks] = useState(null);

  useEffect(() => {
    const local = loadLocalContributor();
    getMyNotebooks(local?.anonId).then(setNotebooks);
  }, []);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />
        <h1 className="mb-6 text-xl font-bold text-zinc-900">Sổ của tôi</h1>

        {notebooks === null && <p className="text-sm text-zinc-500">Đang tải...</p>}

        {notebooks?.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
            <p>Bạn chưa có sổ nào.</p>
            <p className="mt-1 text-zinc-500">
              Mở 1 chỗ bất kỳ trên trang chủ, bấm &quot;Xem thêm&quot; rồi bấm &quot;+ Thêm vào
              sổ&quot; để tạo sổ đầu tiên.
            </p>
            <Link href="/" className="mt-3 inline-block text-sm font-medium text-zinc-900 underline">
              Về trang chủ
            </Link>
          </div>
        )}

        {notebooks && notebooks.length > 0 && (
          <ul className="flex flex-col gap-3">
            {notebooks.map((nb) => (
              <li key={nb.slug} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-base font-semibold text-zinc-900">{nb.title}</p>
                <p className="mt-1 text-sm text-zinc-500">{nb.itemCount} chỗ</p>
                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/so/${nb.slug}`}
                    className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700"
                  >
                    Xem
                  </Link>
                  <Link
                    href={`/so/${nb.slug}/sua`}
                    className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white"
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
