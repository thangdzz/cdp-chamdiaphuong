"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveNotebookAsMine, checkNotebookOwnership } from "./notebookActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// Đáy trang xem sổ (SPEC-chang-4.md §3.2, §3.4). Trước đây luôn hiện 2 nút "Lưu sổ này thành
// sổ của tôi" / "Tự tạo sổ của riêng bạn" bất kể ai xem — gây nhầm khi chính CHỦ SỔ tự xem
// sổ của mình (2 lựa chọn đó đều vô nghĩa lúc đó). Giờ chỉ hiện đúng 1 nút theo đúng người
// đang xem: chủ sổ → "Sửa sổ này"; người khác → "Lưu sổ này thành sổ của tôi" (bỏ hẳn nút
// "Tự tạo sổ của riêng bạn" — thừa, đã có link "Sổ của tôi" trên đầu trang dẫn tới đúng chỗ
// đó rồi). checkNotebookOwnership() không lộ ai là chủ sổ thật — chỉ trả đúng/sai riêng cho
// người đang xem.
export function NotebookOwnerActions({ slug }) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(null); // null = chưa biết
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const local = loadLocalContributor();
    checkNotebookOwnership({ anonId: local?.anonId, slug }).then((res) => setIsOwner(res.isOwner));
  }, [slug]);

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

  if (isOwner === null) return null; // đợi biết chắc mới hiện, tránh nhấp nháy sai nút

  if (isOwner) {
    return (
      <div className="mt-6">
        <Link
          href={`/so/${slug}/sua`}
          className="block w-full rounded-full bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white"
        >
          ✏️ Sửa sổ này
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        disabled={busy}
        onClick={saveAsMine}
        className="w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Đang lưu..." : "Lưu sổ này thành sổ của tôi"}
      </button>
    </div>
  );
}
