"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyNotebooks } from "@/app/notebookActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { PageTitle } from "@/app/AppShell";
import { NotebookCardActions } from "@/app/NotebookCardActions";

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
        <div className="mb-6 flex items-baseline justify-between gap-2">
          <PageTitle pageKey="notebooks" fallback="Sổ của tôi" className="text-xl font-medium tracking-tight text-zinc-900" />
          <Link href="/lo-trinh" className="text-[13px] text-zinc-500 underline">
            Lộ trình của tôi →
          </Link>
        </div>

        {notebooks === null && <p className="text-sm text-zinc-500">Đang tải...</p>}

        {notebooks?.length === 0 && (
          <div className="rounded-xl bg-white p-4 text-sm text-zinc-600 shadow-sm">
            <p>Bạn chưa có sổ nào.</p>
            {/* Chỉ sửa cho đúng nút hiện tại (vNext bước 4 đổi tên nút). Làm lại trạng thái rỗng
                cho đẹp hơn thuộc mục MAY — chưa làm. */}
            <p className="mt-1 text-zinc-500">
              Tìm một chỗ, mở trang chi tiết rồi bấm &quot;Lưu vào Sổ&quot; — sổ đầu tiên sẽ tự được tạo.
            </p>
            <Link href="/tim" className="mt-3 inline-block text-sm font-medium text-zinc-900 underline">
              Tìm chỗ
            </Link>
          </div>
        )}

        {notebooks && notebooks.length > 0 && (
          <ul className="flex flex-col gap-3">
            {notebooks.map((nb) => (
              <li key={nb.slug} className="rounded-xl bg-white px-[18px] py-5 shadow-sm">
                <p className="text-lg font-medium tracking-tight text-zinc-900">{nb.title}</p>
                <p className="mt-1 text-[13px] text-zinc-500">{nb.itemCount} chỗ</p>
                <NotebookCardActions slug={nb.slug} itemCount={nb.itemCount} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
