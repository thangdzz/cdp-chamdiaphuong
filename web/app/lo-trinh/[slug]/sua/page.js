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
  addPlacesToMyRoute,
  proposePlaceForRoute,
  replaceRouteStop,
} from "@/app/routeActions";
import { PlacePicker } from "@/app/PlacePicker";
import { ProposePlaceForm } from "@/app/ProposePlaceForm";
import { StopBadge } from "@/app/StopBadge";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { SiteHeader } from "@/app/SiteHeader";
import { TRANSPORT_MODES, STOP_TYPES } from "@/lib/routes";
import { getPlaceTypeLabel } from "@/lib/placeTypes";
import { formatDurationText } from "@/lib/durationFormat";
import { PROVINCES, DEFAULT_PROVINCE } from "@/lib/provinces";

// Chỉ chủ lộ trình vào được — getRouteForEdit tự kiểm tra ở server, trang này chỉ điều hướng
// về trang xem khi không phải chủ, không tự chặn (cùng cách trang sửa Sổ làm).
export default function EditRoutePage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ok | forbidden | notFound
  const [titleInput, setTitleInput] = useState("");
  const [error, setError] = useState(null);
  // §5: "+ Thêm địa điểm" mở đúng PlacePicker dùng chung, không phải một bộ chọn riêng.
  const [pickerOpen, setPickerOpen] = useState(false);
  const [proposeName, setProposeName] = useState(null); // chuỗi = đang mở form đề xuất
  // Đang đổi chỗ cho điểm thứ mấy (null = không đổi gì). Cùng PlacePicker, chỉ khác chế độ.
  const [replacingIndex, setReplacingIndex] = useState(null);
  // Vừa đổi xong điểm nào — để nhắc xem lại ghi chú của chặng đó, vì ghi chú cũ rất có thể
  // đang nói về chỗ cũ ("đặt bàn trước ở vỉa hè").
  const [justReplaced, setJustReplaced] = useState(null);
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

  async function handleAddCustom({ title, address, province }) {
    const result = await run((anonId) =>
      addCustomStop({
        anonId,
        slug,
        customTitle: title,
        customAddress: address,
        customProvince: province,
      })
    );
    if (result?.ok) {
      setPickerOpen(false);
      await reload();
    }
    return result;
  }

  // Đổi chỗ: thay tại ĐÚNG vị trí đang sửa, thứ tự không xê dịch (anh muốn tự kéo sau nếu cần).
  async function handleReplace(places, { customStops } = {}) {
    const index = replacingIndex;
    if (index === null) return;
    const result = await run((anonId) =>
      replaceRouteStop({
        anonId,
        slug,
        index,
        place: places?.[0] ?? null,
        custom: customStops?.[0] ?? null,
      })
    );
    if (result?.ok) {
      setReplacingIndex(null);
      setJustReplaced(index);
      await reload();
    }
    return result;
  }

  async function handleAddPlaces(places) {
    const result = await run((anonId) => addPlacesToMyRoute({ anonId, slug, places }));
    if (result?.ok) {
      setPickerOpen(false);
      await reload();
    }
  }

  async function handlePropose(fields) {
    const result = await run((anonId) => proposePlaceForRoute({ anonId, slug, ...fields }));
    if (result?.ok) {
      setProposeName(null);
      setPickerOpen(false);
      await reload();
    }
    return result;
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

        <button
          type="button"
          disabled={busy}
          onClick={() => setPickerOpen(true)}
          className="cdp-pressable mt-4 w-full cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 disabled:opacity-50"
        >
          + Thêm địa điểm
        </button>

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
                onReplace={() => setReplacingIndex(index)}
                justReplaced={justReplaced === index}
              />
            ))}
          </ol>
        )}

        <button
          type="button"
          disabled={busy}
          onClick={handleDeleteRoute}
          className="mt-6 text-xs text-red-500 underline disabled:opacity-50"
        >
          Xoá lộ trình này
        </button>

        {pickerOpen && (
          <PlacePicker
            title="Thêm địa điểm"
            confirmLabel="Thêm"
            // Để bộ chọn báo "đã có trong lộ trình" — vẫn cho chọn, chỉ là nói trước.
            existingPlaceIds={route.stops.map((s) => s.placeId).filter(Boolean)}
            onConfirm={handleAddPlaces}
            onClose={() => setPickerOpen(false)}
            onAddCustomStop={handleAddCustom}
            onProposePlace={(name) => setProposeName(name)}
          />
        )}
        {replacingIndex !== null && (
          <PlacePicker
            title="Đổi chỗ"
            confirmLabel="Đổi"
            singlePick
            existingPlaceIds={route.stops.map((s) => s.placeId).filter(Boolean)}
            onConfirm={handleReplace}
            onClose={() => setReplacingIndex(null)}
          />
        )}
        {proposeName !== null && (
          <ProposePlaceForm
            initialName={proposeName}
            onSubmit={handlePropose}
            onClose={() => setProposeName(null)}
          />
        )}
      </main>
    </div>
  );
}

function StopEditor({ stop, index, total, busy, slug, onMove, onRemove, onReplace, justReplaced }) {
  const [plannedAt, setPlannedAt] = useState(stop.plannedAt ?? "");
  const [duration, setDuration] = useState(stop.durationMinutes ?? "");
  const [note, setNote] = useState(stop.note ?? "");
  const [customName, setCustomName] = useState(stop.customTitle ?? "");
  const [address, setAddress] = useState(stop.customAddress ?? "");
  // Điểm riêng có từ trước khi có ô này thì chưa mang tỉnh — hiện Tuyên Quang, đúng bằng thứ
  // hệ thống vẫn ngầm dùng trước đây, và để anh thấy mà đổi nếu chỗ đó ở tỉnh khác.
  const [province, setProvince] = useState(stop.customProvince ?? DEFAULT_PROVINCE);
  const [saved, setSaved] = useState(null); // null | "ok" | lỗi
  const savedRef = useRef({
    plannedAt: stop.plannedAt ?? "",
    duration: stop.durationMinutes ?? "",
    note: stop.note ?? "",
    customName: stop.customTitle ?? "",
    address: stop.customAddress ?? "",
    province: stop.customProvince ?? DEFAULT_PROVINCE,
  });
  const isCustom = stop.type === STOP_TYPES.CUSTOM;

  // Lưu lúc rời ô, không lưu từng ký tự — mỗi lượt lưu là một lệnh Redis.
  // `overrides` cho ô CHỌN (tỉnh/thành): chọn xong là lưu ngay, không đợi rời ô, mà state lúc
  // đó chưa kịp cập nhật nên giá trị mới phải truyền thẳng vào.
  async function save(overrides = {}) {
    const current = { plannedAt, duration, note, customName, address, province, ...overrides };
    if (JSON.stringify(current) === JSON.stringify(savedRef.current)) return;
    const result = await saveStopDetails({
      anonId: loadLocalContributor()?.anonId,
      slug,
      index,
      plannedAt: current.plannedAt,
      durationMinutes: current.duration === "" ? null : current.duration,
      note: current.note,
      ...(isCustom
        ? {
            customTitle: current.customName,
            customAddress: current.address,
            customProvince: current.province,
          }
        : {}),
    });
    if (result.ok) {
      savedRef.current = current;
      setSaved("ok");
      setTimeout(() => setSaved(null), 1800);
    } else {
      setSaved(result.error ?? "Chưa lưu được.");
    }
  }

  // Điểm riêng lấy tên từ ô đang gõ để tiêu đề đổi theo ngay, khỏi phải đợi lưu xong mới thấy.
  const title = isCustom
    ? customName.trim() || "Điểm riêng"
    : (stop.name ?? stop.nameSnapshot ?? "Điểm đã bị xoá");

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
                : [stop.typeLabel ? getPlaceTypeLabel(stop.typeLabel) : null, stop.ward]
                    .filter(Boolean)
                    .join(" · ")}
            </p>
            <StopBadge type={stop.type} />
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
            onBlur={() => save()}
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
            onBlur={() => save()}
          />
          {/* Nhập bằng phút cho gọn, nhưng nhắc lại ngay bằng tiếng để khỏi phải nhẩm:
              gõ 240 mà không thấy "4 tiếng" thì rất dễ nhầm sang 24 tiếng. */}
          {formatDurationText(duration) && (
            <span className="text-xs text-zinc-400">= {formatDurationText(duration)}</span>
          )}
        </label>
      </div>

      {/* Chỉ điểm riêng mới sửa được tên và địa chỉ tại chỗ: địa điểm CDP lấy cả hai từ danh
          bạ, muốn thay hẳn thì bấm "Đổi chỗ". */}
      {isCustom && (
        <label className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
          Tên điểm
          <input
            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
            value={customName}
            maxLength={60}
            placeholder="VD: Nhà Tuấn"
            onChange={(e) => setCustomName(e.target.value)}
            onBlur={() => save()}
          />
        </label>
      )}
      {isCustom && (
        <label className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
          Địa chỉ (để Google dẫn đúng)
          <input
            className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
            value={address}
            maxLength={120}
            placeholder="VD: 12 Trần Phú, Phan Thiết"
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => save()}
          />
          {!address.trim() && (
            <span className="text-xs text-zinc-400">
              Bỏ trống thì điểm này không nằm trong link Google Maps.
            </span>
          )}
        </label>
      )}
      {/* Tỉnh/thành phải chọn: khách từ tỉnh khác về chơi thì điểm xuất phát của họ không nằm
          ở Tuyên Quang, gắn bừa là Google dẫn sai hẳn địa phương. */}
      {isCustom && (
        <label className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
          Tỉnh/thành
          <select
            className="w-full rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900"
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              save({ province: e.target.value });
            }}
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p === DEFAULT_PROVINCE ? `${p} (tại đây)` : p}
              </option>
            ))}
          </select>
        </label>
      )}

      <label className="mt-2 flex flex-col gap-1 text-xs text-zinc-500">
        Ghi chú cho chặng này
        <input
          className="w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
          value={note}
          maxLength={140}
          placeholder="VD: Đặt bàn trước cho 6 người"
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => save()}
        />
      </label>

      {saved === "ok" && <p className="mt-1 text-xs text-emerald-700">✓ Đã lưu</p>}
      {saved && saved !== "ok" && <p className="mt-1 text-xs text-red-600">{saved}</p>}

      {/* Ghi chú chặng rất hay nói về chỗ CŨ ("đặt bàn trước ở vỉa hè") — nhắc xem lại, nhưng
          không tự ý xoá chữ người ta đã gõ. */}
      {justReplaced && note.trim() && (
        <p className="mt-2 text-xs text-amber-700">
          Đã đổi chỗ — xem lại ghi chú chặng xem còn đúng không.
        </p>
      )}

      <div className="mt-3 flex items-center gap-4">
        <button
          type="button"
          disabled={busy}
          onClick={onReplace}
          className="cdp-pressable cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50"
        >
          Đổi chỗ
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onRemove(index)}
          className="cursor-pointer text-xs text-red-500 underline disabled:opacity-50"
        >
          Bỏ khỏi lộ trình
        </button>
      </div>
    </li>
  );
}
