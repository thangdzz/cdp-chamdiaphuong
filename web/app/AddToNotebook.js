"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { getMyNotebooks, addPlaceToNotebook, createNotebookAndAddPlace } from "./notebookActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// Nút "+ Thêm vào sổ" trên thẻ (SPEC-chang-4.md §3.1). Chưa có sổ nào -> tạo luôn sổ đầu
// tiên tên mặc định, không hỏi gì. Có sẵn sổ -> hiện danh sách để chọn + ô tạo sổ mới.
// Sau khi thêm PHẢI dẫn thẳng tới sổ (link "Xem sổ") — chỉ hiện "✓ Đã thêm" không đủ, khách
// không biết lưu ở đâu/tìm lại thế nào (phản hồi thật sau khi thử Chặng 4).
export function AddToNotebook({ place }) {
  const [open, setOpen] = useState(false);
  const [notebooks, setNotebooks] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [added, setAdded] = useState(false);
  const [addedSlug, setAddedSlug] = useState(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  function saveProfileIfNew(newProfile, local) {
    if (!newProfile) return;
    saveLocalContributor({
      anonId: newProfile.anonId,
      nickname: newProfile.nickname,
      recoveryCode: newProfile.recoveryCode,
      categoryId: local?.categoryId ?? null,
    });
  }

  async function openMenu() {
    if (busyRef.current) return;
    if (open) {
      setOpen(false);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const list = await getMyNotebooks(local?.anonId);
      if (list.length === 0) {
        // Chưa có sổ nào -> tạo luôn, không hỏi gì (§3.1)
        const result = await createNotebookAndAddPlace({
          anonId: local?.anonId,
          title: null,
          placeId: place.id,
          nameSnapshot: place.name,
        });
        saveProfileIfNew(result.newProfile, local);
        if (result.ok) {
          setAddedSlug(result.slug);
          setAdded(true);
        }
        return;
      }
      setNotebooks(list);
      setOpen(true);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function pick(slug) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await addPlaceToNotebook({
        anonId: local?.anonId,
        slug,
        placeId: place.id,
        nameSnapshot: place.name,
      });
      saveProfileIfNew(result.newProfile, local);
      if (result.ok) {
        setAddedSlug(slug);
        setAdded(true);
        setOpen(false);
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function createAndAdd() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await createNotebookAndAddPlace({
        anonId: local?.anonId,
        title: newTitle,
        placeId: place.id,
        nameSnapshot: place.name,
      });
      saveProfileIfNew(result.newProfile, local);
      if (result.ok) {
        setAddedSlug(result.slug);
        setAdded(true);
        setOpen(false);
        setNewTitle("");
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  if (added) {
    return (
      <p className="mt-2 text-sm text-zinc-500">
        ✓ Đã thêm vào sổ (lưu trên máy này, không cần đăng nhập) ·{" "}
        <Link href={`/so/${addedSlug}`} className="font-medium text-zinc-700 underline">
          Xem sổ
        </Link>
      </p>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={openMenu}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
      >
        + Thêm vào sổ
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
          <div className="flex flex-col gap-1.5">
            {notebooks?.map((nb) => (
              <button
                key={nb.slug}
                type="button"
                disabled={busy}
                onClick={() => pick(nb.slug)}
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-700 disabled:opacity-50"
              >
                {nb.title} <span className="text-zinc-400">({nb.itemCount} chỗ)</span>
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
              placeholder="Tên sổ mới"
              maxLength={60}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button
              type="button"
              disabled={busy || !newTitle.trim()}
              onClick={createAndAdd}
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
            >
              Tạo sổ mới
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
