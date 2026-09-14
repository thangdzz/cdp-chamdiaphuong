"use client";

import Link from "next/link";
import { useNotebookShare } from "./useShareActions";

// Hàng nút của một thẻ trong "Sổ của tôi": Xem · Sửa · Chia sẻ. Chia sẻ dùng đúng hook của
// trang xem sổ (link sống /so/{slug}).
export function NotebookCardActions({ slug, itemCount }) {
  const { share, label } = useNotebookShare({ slug, itemCount, idleLabel: "Chia sẻ" });

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Link
        href={`/so/${slug}`}
        className="cdp-pressable rounded-lg bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700"
      >
        Xem
      </Link>
      <Link
        href={`/so/${slug}/sua`}
        className="cdp-pressable rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white"
      >
        Sửa
      </Link>
      <button
        type="button"
        disabled={itemCount === 0}
        onClick={share}
        className="cdp-pressable cursor-pointer rounded-lg bg-[#c8553d] px-4 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
      >
        {label}
      </button>
    </div>
  );
}
