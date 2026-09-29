"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getMyNotebooks, addPlaceToNotebook, createNotebookAndAddPlace } from "./notebookActions";
import { getMyRoutes, addPlaceToRoute, createRouteAndAddPlace } from "./routeActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { BookmarkIcon } from "./Icon";
import { track } from "./analytics";

// Nút lưu một chỗ trên thẻ (SPEC-chang-4.md §3.1). Chưa có gì -> tạo luôn sổ đầu tiên tên
// mặc định, không hỏi gì. Có sẵn -> hiện danh sách để chọn.
// Sau khi thêm PHẢI dẫn thẳng tới nơi vừa lưu — chỉ hiện "✓ Đã thêm" không đủ, khách không
// biết lưu ở đâu/tìm lại thế nào (phản hồi thật sau khi thử Chặng 4).
//
// Từ 2026-09-10 nhận cả LỘ TRÌNH, không chỉ Sổ (CDP_P1-P8 §P4 tách 2 thực thể). Nhãn nút đổi
// theo: gọi là "+ Vào sổ" trong khi menu có cả lộ trình là nói thiếu.
//
// vNext (SCOPE "Place → Sổ"): trang địa điểm cần hành động **Lưu vào Sổ** thấy rõ, không lẫn với
// lộ trình. `mode`:
//   "notebook" — nút chính "Lưu vào Sổ", chỉ hiện Sổ
//   "route"    — nút phụ "+ Lộ trình", chỉ hiện lộ trình (không tự tạo gì)
//   "both"     — như cũ, một nút "+ Sổ / Lộ trình" (thẻ trang chủ cũ)
const MODE_LABEL = { notebook: "Lưu vào Sổ", route: "+ Lộ trình", both: "+ Sổ / Lộ trình" };

// Trang địa điểm có HAI nút "Lưu vào Sổ" (đầu trang + thanh bám đáy khi đã cuộn qua). Lưu ở nút
// này thì nút kia cũng phải hiện "đã lưu" — báo cho nhau qua một sự kiện trong trang.
const SAVED_EVENT = "cdp-place-saved";

export function AddToNotebook({ place, mode = "both", className = "" }) {
  const showNotebooks = mode !== "route";
  const showRoutes = mode !== "notebook";
  const [open, setOpen] = useState(false);
  const [notebooks, setNotebooks] = useState(null);
  const [routes, setRoutes] = useState(null);
  const [newNotebookTitle, setNewNotebookTitle] = useState("");
  const [newRouteTitle, setNewRouteTitle] = useState("");
  const [added, setAdded] = useState(null); // null | { kind: "so" | "lo-trinh", slug }
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    function onSaved(event) {
      const { placeId, kind, slug, title } = event.detail ?? {};
      if (placeId === place.id && (kind === "so" ? showNotebooks : showRoutes)) {
        setAdded({ kind, slug, title });
        setOpen(false);
      }
    }
    window.addEventListener(SAVED_EVENT, onSaved);
    return () => window.removeEventListener(SAVED_EVENT, onSaved);
  }, [place.id, showNotebooks, showRoutes]);

  function saveProfileIfNew(newProfile, local) {
    if (!newProfile) return;
    saveLocalContributor({
      anonId: newProfile.anonId,
      nickname: newProfile.nickname,
      recoveryCode: newProfile.recoveryCode,
      categoryId: local?.categoryId ?? null,
    });
  }

  // Gói mọi thao tác gọi máy chủ vào đây: khoá chống bấm 2 lần, và lưu hồ sơ ẩn danh vừa tạo.
  async function run(fn) {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await fn(local);
      saveProfileIfNew(result?.newProfile, local);
      return result;
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function openMenu() {
    if (open) {
      setOpen(false);
      return;
    }
    await run(async (local) => {
      const [notebookList, routeList] = await Promise.all([
        showNotebooks ? getMyNotebooks(local?.anonId) : [],
        showRoutes ? getMyRoutes(local?.anonId) : [],
      ]);
      // Chế độ "route" không bao giờ tự tạo sổ — khách bấm "+ Lộ trình" mà lại ra một sổ là sai ý.
      if (showNotebooks && notebookList.length === 0 && routeList.length === 0) {
        // Chưa có gì -> tạo luôn sổ đầu tiên, không hỏi gì (§3.1). Lộ trình cần thứ tự và giờ
        // giấc nên không hợp làm thứ tạo tự động cho người mới.
        const result = await createNotebookAndAddPlace({
          anonId: local?.anonId,
          title: null,
          placeId: place.id,
          nameSnapshot: place.name,
        });
        if (result.ok) done("so", result.slug, result.title);
        return result;
      }
      setNotebooks(notebookList);
      setRoutes(routeList);
      setOpen(true);
      return null;
    });
  }

  function done(kind, slug, title = null) {
    // Đo luồng vNext: bước "Save" — chỉ tính lưu vào SỔ, không tính thêm vào lộ trình.
    if (kind === "so") track("notebook_save");
    setAdded({ kind, slug, title });
    window.dispatchEvent(new CustomEvent(SAVED_EVENT, { detail: { placeId: place.id, kind, slug, title } }));
    setOpen(false);
  }

  async function pickNotebook(slug) {
    const result = await run((local) =>
      addPlaceToNotebook({ anonId: local?.anonId, slug, placeId: place.id, nameSnapshot: place.name })
    );
    if (result?.ok) done("so", slug);
  }

  async function pickRoute(slug) {
    const result = await run((local) =>
      addPlaceToRoute({ anonId: local?.anonId, slug, placeId: place.id, nameSnapshot: place.name })
    );
    if (result?.ok) done("lo-trinh", slug);
  }

  async function createNotebook() {
    const result = await run((local) =>
      createNotebookAndAddPlace({
        anonId: local?.anonId,
        title: newNotebookTitle,
        placeId: place.id,
        nameSnapshot: place.name,
      })
    );
    if (result?.ok) {
      done("so", result.slug, result.title);
      setNewNotebookTitle("");
    }
  }

  async function createRoute() {
    const result = await run((local) =>
      createRouteAndAddPlace({
        anonId: local?.anonId,
        title: newRouteTitle,
        placeId: place.id,
        nameSnapshot: place.name,
      })
    );
    if (result?.ok) {
      done("lo-trinh", result.slug);
      setNewRouteTitle("");
    }
  }

  if (added) {
    const isRoute = added.kind === "lo-trinh";
    const title = added.title ?? (isRoute ? routes : notebooks)?.find((item) => item.slug === added.slug)?.title;
    return (
      <p className={`cdp-fade-in w-full text-[13px] text-zinc-500 ${className}`}>
        ✓ Đã lưu vào {isRoute ? "lộ trình" : "sổ"}
        {title ? <> <b className="font-medium text-zinc-700">{title}</b></> : null} (lưu trên máy này, không cần đăng nhập) ·{" "}
        <Link href={`/${added.kind}/${added.slug}`} className="font-medium text-zinc-700 underline">
          {isRoute ? "Xem lộ trình" : "Xem sổ"}
        </Link>
      </p>
    );
  }

  // Nút chính (Lưu vào Sổ) dùng màu nhấn duy nhất của web (DESIGN.md §4); hai kiểu còn lại là nút viền.
  const buttonClass =
    mode === "notebook"
      ? "cdp-pressable inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-[#c8553d] px-4 text-sm font-medium text-white active:bg-[#ad4832] disabled:cursor-default disabled:opacity-60"
      : "cdp-pressable inline-flex min-h-11 w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600 disabled:cursor-default disabled:opacity-50";

  return (
    <>
      <button type="button" onClick={openMenu} disabled={busy} aria-expanded={open} className={`${buttonClass} ${className}`}>
        <BookmarkIcon size={15} />
        {MODE_LABEL[mode] ?? MODE_LABEL.both}
      </button>

      {open && (
        <div className="cdp-fade-in mt-2 max-h-[60vh] w-full overflow-y-auto rounded-lg bg-zinc-50 p-3">
          {showNotebooks && (
          <PickerSection
            label="Sổ"
            hint="Tập hợp chỗ hay, không cần thứ tự"
            items={notebooks?.map((nb) => ({
              slug: nb.slug,
              title: nb.title,
              meta: `${nb.itemCount} chỗ`,
            }))}
            busy={busy}
            onPick={pickNotebook}
            newTitle={newNotebookTitle}
            onNewTitleChange={setNewNotebookTitle}
            onCreate={createNotebook}
            placeholder="Tên sổ mới"
            createLabel="Tạo sổ"
          />
          )}

          {showRoutes && (
          <div className={showNotebooks ? "mt-3 border-t border-zinc-200 pt-3" : ""}>
            <PickerSection
              label="Lộ trình"
              hint="Đi theo thứ tự, có giờ dự kiến"
              items={routes?.map((r) => ({
                slug: r.slug,
                title: r.title,
                meta: `${r.stopCount} điểm`,
              }))}
              busy={busy}
              onPick={pickRoute}
              newTitle={newRouteTitle}
              onNewTitleChange={setNewRouteTitle}
              onCreate={createRoute}
              placeholder="Tên lộ trình mới"
              createLabel="Tạo lộ trình"
            />
          </div>
          )}
        </div>
      )}
    </>
  );
}

function PickerSection({
  label,
  hint,
  items,
  busy,
  onPick,
  newTitle,
  onNewTitleChange,
  onCreate,
  placeholder,
  createLabel,
}) {
  return (
    <div>
      <p className="text-[13px] font-medium text-zinc-700">{label}</p>
      <p className="mb-1.5 text-xs text-zinc-500">{hint}</p>
      {items?.length > 0 && (
        <div className="mb-2 flex flex-col gap-1.5">
          {items.map((item) => (
            <button
              key={item.slug}
              type="button"
              disabled={busy}
              onClick={() => onPick(item.slug)}
              className="w-full cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-700 disabled:cursor-default disabled:opacity-50"
            >
              {item.title} <span className="text-zinc-400">({item.meta})</span>
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
          placeholder={placeholder}
          maxLength={60}
          value={newTitle}
          onChange={(e) => onNewTitleChange(e.target.value)}
        />
        <button
          type="button"
          disabled={busy || !newTitle.trim()}
          onClick={onCreate}
          className="cdp-pressable shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
        >
          {createLabel}
        </button>
      </div>
    </div>
  );
}
