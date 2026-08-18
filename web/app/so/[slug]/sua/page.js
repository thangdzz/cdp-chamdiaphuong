"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getNotebookForEdit,
  renameNotebook,
  updateNotebookItemNote,
  removePlaceFromNotebook,
  reorderNotebookItems,
} from "@/app/notebookActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { getPlaceTypeLabel } from "@/lib/placeTypes";
import { SiteHeader } from "@/app/SiteHeader";

// Chỉ chủ sổ mới vào được (SPEC-chang-4.md §3.3) — getNotebookForEdit tự kiểm tra ownership
// ở server, trang này chỉ điều hướng về trang xem khi không phải chủ sổ, không tự chặn.
export default function EditNotebookPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [notebook, setNotebook] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | forbidden | notFound
  const [titleInput, setTitleInput] = useState("");
  const [copyLabel, setCopyLabel] = useState("Sao chép link");
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const local = loadLocalContributor();
    getNotebookForEdit({ anonId: local?.anonId, slug }).then((result) => {
      if (!result.ok) {
        setStatus(result.notFound ? "notFound" : "forbidden");
        if (result.forbidden) router.replace(`/so/${slug}`);
        return;
      }
      setNotebook(result.notebook);
      setTitleInput(result.notebook.title);
      setStatus("ok");
    });
  }, [slug, router]);

  async function saveTitle() {
    if (busyRef.current || !titleInput.trim()) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const result = await renameNotebook({
        anonId: loadLocalContributor()?.anonId,
        slug,
        title: titleInput,
      });
      if (result.ok) setNotebook((nb) => ({ ...nb, title: titleInput.trim() }));
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function saveNote(placeId, note) {
    const result = await updateNotebookItemNote({
      anonId: loadLocalContributor()?.anonId,
      slug,
      placeId,
      note,
    });
    if (result.ok) {
      setNotebook((nb) => ({
        ...nb,
        items: nb.items.map((it) => (it.placeId === placeId ? { ...it, note: note || null } : it)),
      }));
    }
    return result;
  }

  async function removeItem(placeId) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const result = await removePlaceFromNotebook({
        anonId: loadLocalContributor()?.anonId,
        slug,
        placeId,
      });
      if (result.ok) {
        setNotebook((nb) => ({ ...nb, items: nb.items.filter((it) => it.placeId !== placeId) }));
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function move(index, direction) {
    if (busyRef.current) return;
    const items = [...notebook.items];
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    busyRef.current = true;
    setBusy(true);
    try {
      const result = await reorderNotebookItems({
        anonId: loadLocalContributor()?.anonId,
        slug,
        orderedPlaceIds: items.map((it) => it.placeId),
      });
      if (result.ok) setNotebook((nb) => ({ ...nb, items }));
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function copyLink() {
    if (!notebook || notebook.items.length === 0) return; // §9: sổ trống thì đừng cho gửi link
    const url = `${window.location.origin}/so/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyLabel("✓ Đã sao chép");
      setTimeout(() => setCopyLabel("Sao chép link"), 2000);
    } catch {
      setCopyLabel("Không sao chép được, tự chọn link nhé");
    }
  }

  if (status === "loading") return <main className="p-6 text-sm text-zinc-500">Đang tải...</main>;
  if (status === "notFound") return <main className="p-6 text-sm text-zinc-500">Không tìm thấy sổ này.</main>;
  if (status === "forbidden") return null; // đang điều hướng về trang xem

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />
        <Link href={`/so/${slug}`} className="text-sm text-zinc-400 underline">
          ← Xem sổ
        </Link>

        <div className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-base font-semibold text-zinc-900"
            value={titleInput}
            maxLength={60}
            onChange={(e) => setTitleInput(e.target.value)}
            onBlur={saveTitle}
          />
        </div>

        {notebook.items.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            Sổ chưa có chỗ nào. Về trang chủ, bấm &quot;+ Thêm vào sổ&quot; trên 1 chỗ bất kỳ.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {notebook.items.map((item, index) => (
              <li key={item.placeId} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-base font-semibold ${item.deleted ? "text-zinc-400" : "text-zinc-900"}`}>
                      {item.deleted ? item.nameSnapshot : item.place?.name}
                    </p>
                    {item.deleted ? (
                      <p className="text-xs text-zinc-400">Chỗ này không còn trong danh bạ</p>
                    ) : (
                      <p className="text-xs text-zinc-500">{getPlaceTypeLabel(item.place?.type)}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      disabled={busy || index === 0}
                      onClick={() => move(index, -1)}
                      className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 disabled:opacity-30"
                      aria-label="Lên"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={busy || index === notebook.items.length - 1}
                      onClick={() => move(index, 1)}
                      className="rounded-full border border-zinc-300 px-2 py-1 text-xs text-zinc-600 disabled:opacity-30"
                      aria-label="Xuống"
                    >
                      ↓
                    </button>
                  </div>
                </div>

                <NoteEditor placeId={item.placeId} initialNote={item.note} onSave={saveNote} />

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeItem(item.placeId)}
                  className="mt-2 text-xs text-red-500 underline disabled:opacity-50"
                >
                  Bỏ khỏi sổ
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          disabled={notebook.items.length === 0}
          onClick={copyLink}
          className="mt-6 w-full rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {copyLabel}
        </button>
        {notebook.items.length === 0 && (
          <p className="mt-2 text-center text-xs text-zinc-400">Thêm ít nhất 1 chỗ trước khi chia sẻ</p>
        )}
      </main>
    </div>
  );
}

function NoteEditor({ placeId, initialNote, onSave }) {
  const [value, setValue] = useState(initialNote ?? "");
  const [savedValue, setSavedValue] = useState(initialNote ?? "");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  async function handleBlur() {
    if (value === savedValue) return;
    setBusy(true);
    setError(null);
    setJustSaved(false);
    try {
      const result = await onSave(placeId, value);
      if (!result.ok) {
        setError(result.error ?? "Chưa lưu được ghi chú.");
      } else {
        setSavedValue(value);
        setJustSaved(true);
        setTimeout(() => setJustSaved(false), 2000);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-2">
      <input
        className="w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        placeholder="Ghi chú riêng cho chỗ này (tối đa 140 ký tự)"
        maxLength={140}
        value={value}
        disabled={busy}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
      />
      {busy && <p className="mt-1 text-xs text-zinc-400">Đang lưu...</p>}
      {justSaved && !busy && <p className="mt-1 text-xs text-green-600">✓ Đã lưu</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
