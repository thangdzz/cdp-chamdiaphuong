"use client";

import { use, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getRouteForEdit,
  renameRoute,
  setTransportMode,
  saveStopDetails,
  removeStop,
  addCustomStop,
  reorderRouteStops,
  deleteMyRoute,
} from "@/app/routeActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { SiteHeader } from "@/app/SiteHeader";
import { TRANSPORT_MODES } from "@/lib/routes";
import { getPlaceTypeLabel } from "@/lib/placeTypes";

// Chỉ chủ lộ trình vào được — getRouteForEdit tự kiểm tra ở server, trang này chỉ điều hướng
// về trang xem khi không phải chủ, không tự chặn (cùng cách trang sửa Sổ làm).
export default function EditRoutePage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | forbidden | notFound
  const [titleInput, setTitleInput] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [error, setError] = useState(null);
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const local = loadLocalContributor();
    getRouteForEdit({ anonId: local?.anonId, slug }).then((result) => {
      if (!result.ok) {
        setStatus(result.notFound ? "notFound" : "forbidden");
        if (result.forbidden) router.replace(`/lo-trinh/${slug}`);
        return;
      }
      setRoute(result.route);
      setTitleInput(result.route.title);
      setStatus("ok");
    });
  }, [slug, router]);

  // Tải lại từ máy chủ sau các thao tác đổi cấu trúc (thêm/bớt/đảo chỗ) — rẻ hơn nhiều so với
  // tự dựng lại state phía khách rồi lệch với dữ liệu thật.
  async function reload() {
    const local = loadLocalContributor();
    const result = await getRouteForEdit({ anonId: local?.anonId, slug });
    if (result.ok) setRoute(result.route);
  }

  async function run(fn) {
    if (busyRef.current) return { ok: false };
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await fn(loadLocalContributor()?.anonId);
      if (result && !result.ok && result.error) setError(result.error);
      return result;
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function saveTitle() {
    if (!titleInput.trim() || titleInput === route.title) return;
    const result = await run((anonId) => renameRoute({ anonId, slug, title: titleInput }));
    if (result?.ok) setRoute((r) => ({ ...r, title: titleInput }));
  }

  async function changeMode(transportMode) {
    if (transportMode === route.transportMode) return;
    const previous = route.transportMode;
    setRoute((r) => ({ ...r, transportMode }));
    const result = await run((anonId) => setTransportMode({ anonId, slug, transportMode }));
    if (!result?.ok) setRoute((r) => ({ ...r, transportMode: previous }));
  }

  async function move(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= route.stops.length) return;
    const order = route.stops.map((_, i) => i);
    [order[index], order[target]] = [order[target], order[index]];
    const result = await run((anonId) => reorderRouteStops({ anonId, slug, order }));
    if (result?.ok) await reload();
  }

  async function handleRemove(index) {
    const result = await run((anonId) => removeStop({ anonId, slug, index }));
    if (result?.ok) await reload();
  }

  async function handleAddCustom() {
    if (!customTitle.trim()) return;
    const result = await run((anonId) => addCustomStop({ anonId, slug, customTitle }));
    if (result?.ok) {
      setCustomTitle("");
      await reload();
    }
  }

  async function handleDeleteRoute() {
    const result = await run((anonId) => deleteMyRoute({ anonId, slug }));
    if (result?.ok) router.replace("/lo-trinh");
  }

  if (status === "loading") return <main className="p-6 text-sm text-zinc-500">Đang tải...</main>;
  if (status === "notFound") {
    return <main className="p-6 text-sm text-zinc-500">Không tìm thấy lộ trình này.</main>;
  }
  if (status === "forbidden") return null; // đang điều hướng về trang xem

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />
        <Link href={`/lo-trinh/${slug}`} className="text-sm text-zinc-400 underline">
          ← Xem lộ trình
        </Link>

        <input
          className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base font-medium text-zinc-900"
          value={titleInput}
          maxLength={60}
          onChange={(e) => setTitleInput(e.target.value)}
          onBlur={saveTitle}
        />

        <div className="mt-4">
          <p className="mb-1.5 text-[13px] text-zinc-500">Đi bằng gì?</p>
          <div className="flex flex-wrap gap-1.5">
            {TRANSPORT_MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                disabled={busy}
                onClick={() => changeMode(m.id)}
                className={`cdp-pressable cursor-pointer rounded-full border px-3 py-1.5 text-sm disabled:opacity-50 ${
                  route.transportMode === m.id
                    ? "border-zinc-400 bg-zinc-100 font-medium text-zinc-900"
                    : "border-zinc-200 text-zinc-600"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {route.stops.length === 0 ? (
          <p className="mt-5 text-sm text-zinc-500">
            Lộ trình chưa có điểm nào. Về trang chủ bấm &quot;+ Vào sổ&quot; trên một chỗ để thêm
            vào lộ trình, hoặc tự thêm một điểm ở dưới.
          </p>
        ) : (
          <ol className="mt-5 flex flex-col gap-3">
            {route.stops.map((stop, index) => (
              <StopEditor
                key={`${index}-${stop.placeId ?? stop.customTitle}`}
                stop={stop}
                index={index}
                total={route.stops.length}
                busy={busy}
                slug={slug}
                onMove={move}
                onRemove={handleRemove}
              />
            ))}
          </ol>
        )}

        {/* Điểm tự đặt tên: "Khách sạn của tôi", "Nhà bạn Nam" — lộ trình thật hay bắt đầu từ
            chỗ không có trong danh bạ CDP. */}
        <div className="mt-5 rounded-xl border border-dashed border-zinc-300 p-3">
          <p className="mb-1.5 text-[13px] text-zinc-500">Thêm điểm tự đặt tên</p>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
              value={customTitle}
              maxLength={60}
              placeholder="VD: Khách sạn của tôi"
              onChange={(e) => setCustomTitle(e.target.value)}
            />
            <button
              type="button"
              disabled={busy || !customTitle.trim()}
              onClick={handleAddCustom}
              className="cdp-pressable shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
            >
              Thêm
            </button>
          </div>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={handleDeleteRoute}
          className="mt-6 text-xs text-red-500 underline disabled:opacity-50"
        >
          Xoá lộ trình này
        </button>
      </main>
    </div>
  );
}

function StopEditor({ stop, index, total, busy, slug, onMove, onRemove }) {
  const [plannedAt, setPlannedAt] = useState(stop.plannedAt ?? "");
  const [duration, setDuration] = useState(stop.durationMinutes ?? "");
  const [note, setNote] = useState(stop.note ?? "");
  const [saved, setSaved] = useState(null); // null | "ok" | lỗi
  const savedRef = useRef({ plannedAt: stop.plannedAt ?? "", duration: stop.durationMinutes ?? "", note: stop.note ?? "" });

  // Lưu lúc rời ô, không lưu từng ký tự — mỗi lượt lưu là một lệnh Redis.
  async function save() {
    const current = { plannedAt, duration, note };
    if (JSON.stringify(current) === JSON.stringify(savedRef.current)) return;
    const result = await saveStopDetails({
      anonId: loadLocalContributor()?.anonId,
      slug,
      index,
      plannedAt,
      durationMinutes: duration === "" ? null : duration,
      note,
    });
    if (result.ok) {
      savedRef.current = current;
      setSaved("ok");
      setTimeout(() => setSaved(null), 1800);
    } else {
      setSaved(result.error ?? "Chưa lưu được.");
    }
  }

  const title = stop.customTitle ?? stop.name ?? stop.nameSnapshot ?? "Điểm đã bị xoá";

  return (
    <li className="rounded-xl bg-white px-[18px] py-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className={`text-base font-medium ${stop.deleted ? "text-zinc-400" : "text-zinc-900"}`}>
              {title}
            </p>
            <p className="text-[13px] text-zinc-500">
              {stop.deleted
                ? "Chỗ này không còn trong danh bạ"
                : stop.customTitle
                  ? "Điểm tự thêm"
                  : [getPlaceTypeLabel(stop.typeLabel), stop.ward].filter(Boolean).join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            disabled={busy || index === 0}
            onClick={() => onMove(index, -1)}
            className="cdp-pressable cursor-pointer rounded-lg px-2 py-1 text-xs text-zinc-500 disabled:cursor-default disabled:opacity-30"
            aria-label="Lên"
          >
            ↑
          </button>
          <button
            type="button"
            disabled={busy || index === total - 1}
            onClick={() => onMove(index, 1)}
            className="cdp-pressable cursor-pointer rounded-lg px-2 py-1 text-xs text-zinc-500 disabled:cursor-default disabled:opacity-30"
            aria-label="Xuống"
          >
            ↓
          </button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Mấy giờ
          <input
            className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm tabular-nums text-zinc-900"
            value={plannedAt}
            placeholder="17:30"
            maxLength={5}
            onChange={(e) => setPlannedAt(e.target.value)}
            onBlur={save}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Ở lại (phút)
          <input
            type="number"
            className="w-24 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
            value={duration}
            placeholder="60"
            onChange={(e) => setDuration(e.target.value)}
            onBlur={save}
          />
        </label>
      </div>

      <label className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
        Ghi chú cho chặng này
        <input
          className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
          value={note}
          maxLength={140}
          placeholder="VD: Đặt bàn trước cho 6 người"
          onChange={(e) => setNote(e.target.value)}
          onBlur={save}
        />
      </label>

      {saved === "ok" && <p className="mt-1 text-xs text-emerald-700">✓ Đã lưu</p>}
      {saved && saved !== "ok" && <p className="mt-1 text-xs text-red-600">{saved}</p>}

      <button
        type="button"
        disabled={busy}
        onClick={() => onRemove(index)}
        className="mt-2 cursor-pointer text-xs text-red-500 underline disabled:opacity-50"
      >
        Bỏ khỏi lộ trình
      </button>
    </li>
  );
}
