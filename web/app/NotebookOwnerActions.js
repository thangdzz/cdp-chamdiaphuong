"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveNotebookAsMine } from "./notebookActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// Đáy trang xem sổ (SPEC-chang-4.md §3.2, §3.4) — client vì cần đọc anonId trong localStorage.
// Không tự dò "đây có phải sổ của mình không" — làm vậy phải lộ ownerAnonId ra ngoài, trái
// nguyên tắc "sổ không hiện tên người tạo" (§5 quy tắc 5). Luôn hiện cả 2 nút như bản mẫu.
export function NotebookOwnerActions({ slug }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  async function saveAsMine() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await saveNotebookAsMine({ anonId: local?.anonId, sourceSlug: slug });
      if (result.newProfile) {
        saveLocalContributor({
          anonId: result.newProfile.anonId,
          nickname: result.newProfile.nickname,
          recoveryCode: result.newProfile.recoveryCode,
          categoryId: local?.categoryId ?? null,
        });
      }
      if (result.ok) {
        router.push(`/so/${result.slug}/sua`);
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-2">
      <button
        type="button"
        disabled={busy}
        onClick={saveAsMine}
        className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Đang lưu..." : "Lưu sổ này thành sổ của tôi"}
      </button>
      <Link
        href="/so"
        className="w-full rounded-full border border-zinc-300 px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
      >
        Tự tạo sổ của riêng bạn
      </Link>
    </div>
  );
}
