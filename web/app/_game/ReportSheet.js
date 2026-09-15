"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { GameMap } from "./GameMap";
import { ObjectIcon } from "./ObjectIcon";
import { playGameSound, prefetchObjectSound } from "./gameSound";
import { reportSighting } from "@/app/gameActions";
import { loadLocalContributor, saveLocalContributor } from "@/app/ContributionPanel";
import { clearDraftName, readDraftName } from "./playerName";
import { compressImageForUpload } from "@/lib/clientImageCompression";
import { OBJECT_KIND, UNKNOWN_ICON, isUnnamedSlot, objectDisplayName } from "@/lib/game/catalog";
import { foldText, formatAgo } from "@/lib/game/format";

const STEP = { PICK: "pick", LOCATE: "locate", PHOTO: "photo" };
const MAX_MYSTERIES_IN_PICKER = 4;

const primaryButton =
  "cdp-pressable flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#c8553d] px-4 text-[15px] font-medium text-white shadow-sm disabled:cursor-default disabled:opacity-60";
const secondaryButton =
  "cdp-pressable flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#f3ece2] px-4 text-[15px] font-medium text-zinc-800";

/**
 * Luồng báo "vừa thấy" (NOTE-04 §8). Parent gắn `key` mới mỗi lần mở để state luôn bắt đầu từ
 * preset — không cần effect reset.
 * preset: { objectId?, lat?, lng? } — từ nút "Tôi cũng vừa thấy" trên marker.
 */
export function ReportSheet({
  open,
  onClose,
  event,
  snapshot,
  resolvedCollection,
  preset,
  now,
  onSubmitted,
  preGame = false,
  onPreGameAttempt,
}) {
  const noun = event.copy.objectNoun;
  const [step, setStep] = useState(preset?.objectId ? STEP.LOCATE : STEP.PICK);
  const [query, setQuery] = useState("");
  const [objectId, setObjectId] = useState(preset?.objectId ?? null);
  const [point, setPoint] = useState(() =>
    Number.isFinite(preset?.lat)
      ? { lat: preset.lat, lng: preset.lng, accuracy: null, source: "marker" }
      : { ...event.map.center, accuracy: null, source: "map" }
  );
  const [focus, setFocus] = useState(() =>
    Number.isFinite(preset?.lat) ? { lat: preset.lat, lng: preset.lng, zoom: 16 } : null
  );
  const [gps, setGps] = useState("idle"); // idle | locating | ok | denied
  const [photo, setPhoto] = useState(null); // { file, previewUrl }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const byId = useMemo(() => new Map(snapshot.catalog.map((o) => [o.id, o])), [snapshot.catalog]);
  const selected = objectId === "unknown" ? null : byId.get(objectId);

  const models = useMemo(() => {
    const q = foldText(query);
    return snapshot.catalog
      .filter((o) => o.kind === OBJECT_KIND.MODEL && !o.matchedTo && !isUnnamedSlot(o))
      .filter((o) => !q || foldText(`${o.name ?? ""} ${o.ward ?? ""}`).includes(q));
  }, [snapshot.catalog, query]);

  // Bí ẩn vừa được báo tối nay: người thứ hai gặp cùng "con chưa biết tên" chọn lại được, thay
  // vì đẻ thêm một bí ẩn trùng (NOTE-04 §16).
  const recentMysteries = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const marker of snapshot.markers) {
      const object = byId.get(marker.objectId);
      if (object?.kind !== OBJECT_KIND.UNKNOWN || seen.has(object.id)) continue;
      seen.add(object.id);
      list.push({ object, marker });
    }
    return list.slice(0, MAX_MYSTERIES_IN_PICKER);
  }, [snapshot.markers, byId]);

  function requestGps() {
    if (!("geolocation" in navigator)) {
      setGps("denied");
      return;
    }
    setGps("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          source: "gps",
        };
        setPoint(next);
        setFocus({ lat: next.lat, lng: next.lng, zoom: 17 });
        setGps("ok");
      },
      () => setGps("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    );
  }

  function choose(id) {
    // Trước giờ rước (NOTE-05 §2): chọn mô hình như thường rồi dừng ở câu đùa — không hỏi GPS,
    // không gọi server, không có gì được ghi.
    if (preGame) {
      onPreGameAttempt?.(id);
      return;
    }
    playGameSound("tap-soft");
    // Tải trước đúng tiếng của mô hình vừa chọn (vài chục KB) để lúc báo xong phát kịp, không tải cả thư viện.
    prefetchObjectSound(id === "unknown" ? { kind: OBJECT_KIND.UNKNOWN } : byId.get(id), event);
    setObjectId(id);
    setStep(STEP.LOCATE);
    setError(null);
    if (gps === "idle") requestGps();
  }

  // Mở từ "Tôi cũng vừa thấy" thì đã qua bước chọn — vẫn phải hỏi GPS, nhưng chỉ khi người chơi
  // bấm (trình duyệt hỏi quyền ngay khi mở trang là trải nghiệm tệ).
  const needsGpsPrompt = step === STEP.LOCATE && gps === "idle";

  async function pickPhoto(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    const compressed = await compressImageForUpload(file);
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const previewUrl = URL.createObjectURL(compressed);
    previewRef.current = previewUrl;
    setPhoto({ file: compressed, previewUrl });
  }

  async function submit(withPhoto) {
    if (busy) return;
    setBusy(true);
    setError(null);
    prefetchObjectSound(selected ?? { kind: OBJECT_KIND.UNKNOWN }, event);
    const local = loadLocalContributor();
    const form = new FormData();
    form.set("slug", event.slug);
    if (local?.anonId) form.set("anonId", local.anonId);
    else form.set("nickname", readDraftName() ?? "");
    form.set("objectId", objectId);
    form.set("lat", String(point.lat));
    form.set("lng", String(point.lng));
    if (point.accuracy) form.set("accuracy", String(point.accuracy));
    form.set("locationSource", point.source);
    if (withPhoto && photo?.file) form.set("photo", photo.file);

    try {
      const result = await reportSighting(form);
      if (!result.ok) {
        // Máy này tưởng game đã live (tab mở trước khi admin đổi giờ) nhưng server vẫn pre-game:
        // xử lý như lượt báo thử — câu đùa, không báo lỗi. Server không ghi gì.
        if (result.code === "pre_game" && onPreGameAttempt) {
          onPreGameAttempt(objectId);
          return;
        }
        setError(result.error);
        return;
      }
      if (result.newProfile) {
        saveLocalContributor({ ...result.newProfile, categoryId: local?.categoryId ?? null });
        clearDraftName();
      }
      onSubmitted(result);
    } catch {
      setError("Chưa gửi được. Kiểm tra mạng rồi thử lại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="game-report-title">
      <StepDots step={step} />

      {step === STEP.PICK && (
        <div className="cdp-fade-in">
          <h2 id="game-report-title" className="text-xl font-medium tracking-tight text-zinc-900">
            {event.copy.reportCta}
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Tìm tên ${noun}…`}
            className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-[#c8553d] focus:ring-2 focus:ring-[#c8553d]/15"
          />

          <ul className="mt-3 flex flex-col gap-1.5">
            {/* "Không biết tên" LUÔN có, không bị ô tìm kiếm lọc mất (NOTE-04 §8 step 1). */}
            <li>
              <PickRow
                icon={<span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-[22px]">{UNKNOWN_ICON}</span>}
                title="Không biết tên"
                meta={`Vẫn báo được — CDP sẽ cùng xác định ${noun} sau`}
                onClick={() => choose("unknown")}
              />
            </li>
            {recentMysteries.map(({ object, marker }) => (
              <li key={object.id}>
                <PickRow
                  icon={<ObjectIcon object={object} event={event} size="sm" />}
                  title={objectDisplayName(object, noun)}
                  meta={`Được báo ${formatAgo(marker.lastSeenAt, now)}`}
                  onClick={() => choose(object.id)}
                />
              </li>
            ))}
            {models.map((object) => (
              <li key={object.id}>
                <PickRow
                  icon={
                    <ObjectIcon
                      object={object}
                      event={event}
                      size="sm"
                      state={resolvedCollection[object.id] ? "met" : "plain"}
                    />
                  }
                  title={objectDisplayName(object, noun)}
                  meta={object.ward ?? null}
                  done={Boolean(resolvedCollection[object.id])}
                  onClick={() => choose(object.id)}
                />
              </li>
            ))}
          </ul>
          {models.length === 0 && query && (
            <p className="mt-3 text-sm text-zinc-500">
              Chưa có {noun} nào khớp “{query}”. Chọn <b className="font-medium">Không biết tên</b> để vẫn báo được.
            </p>
          )}
        </div>
      )}

      {step === STEP.LOCATE && (
        <div className="cdp-fade-in">
          <SelectedHeader
            object={selected}
            unknown={objectId === "unknown"}
            event={event}
            onChange={() => setStep(STEP.PICK)}
          />
          <h2 id="game-report-title" className="mt-4 text-lg font-medium tracking-tight text-zinc-900">
            Bạn thấy ở đâu?
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-zinc-500">
            <LocateStatus gps={gps} point={point} />
          </p>
          <GameMap
            center={point}
            zoom={focus?.zoom ?? event.map.zoom}
            focus={focus}
            picker
            venues={event.venues}
            onPick={({ lat, lng }) => setPoint({ lat, lng, accuracy: null, source: "map" })}
            className="mt-3 h-60 rounded-xl"
          />
          <div className="mt-4 flex flex-col gap-2">
            {needsGpsPrompt && (
              <button
                type="button"
                className={secondaryButton}
                onClick={requestGps}
              >
                📡 Lấy vị trí của tôi
              </button>
            )}
            <button
              type="button"
              className={primaryButton}
              onClick={() => {
                playGameSound("tap-soft");
                setStep(STEP.PHOTO);
              }}
            >
              Dùng vị trí này
            </button>
          </div>
        </div>
      )}

      {step === STEP.PHOTO && (
        <div className="cdp-fade-in">
          <SelectedHeader
            object={selected}
            unknown={objectId === "unknown"}
            event={event}
            onChange={() => setStep(STEP.PICK)}
          />
          <h2 id="game-report-title" className="mt-4 text-lg font-medium tracking-tight text-zinc-900">
            Thêm ảnh?
          </h2>
          <p className="mt-1 text-[13px] leading-5 text-zinc-500">
            Giúp nhận diện {noun} và xác minh vị trí nhanh hơn. Không bắt buộc.
          </p>

          {photo ? (
            <div className="mt-3 overflow-hidden rounded-xl bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- ảnh xem trước blob: cục bộ, next/image không tối ưu được */}
              <img src={photo.previewUrl} alt="Ảnh vừa chọn" className="max-h-64 w-full object-cover" />
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className={secondaryButton} onClick={() => cameraRef.current?.click()}>
                📷 Chụp ảnh
              </button>
              <button type="button" className={secondaryButton} onClick={() => galleryRef.current?.click()}>
                🖼️ Chọn từ máy
              </button>
            </div>
          )}
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => pickPhoto(e.target.files)}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => pickPhoto(e.target.files)}
          />

          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-2">
            {photo ? (
              <>
                <button type="button" className={primaryButton} disabled={busy} onClick={() => submit(true)}>
                  {busy ? "Đang gửi…" : `${event.copy.reportIcon} Gửi ghi nhận`}
                </button>
                <button
                  type="button"
                  className="min-h-11 cursor-pointer text-sm text-zinc-500"
                  disabled={busy}
                  onClick={() => setPhoto(null)}
                >
                  Bỏ ảnh này
                </button>
              </>
            ) : (
              <button type="button" className={primaryButton} disabled={busy} onClick={() => submit(false)}>
                {busy ? "Đang gửi…" : "Bỏ qua, gửi luôn"}
              </button>
            )}
          </div>
          <p className="mt-3 text-center text-xs leading-5 text-zinc-400">
            Bản đồ công khai chỉ hiện {noun} được thấy ở đâu, không hiện ai đã báo.
          </p>
        </div>
      )}
    </BottomSheet>
  );
}

function StepDots({ step }) {
  const order = [STEP.PICK, STEP.LOCATE, STEP.PHOTO];
  const current = order.indexOf(step);
  return (
    <div className="mb-3 flex gap-1.5" aria-hidden="true">
      {order.map((s, i) => (
        <span
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i <= current ? "bg-[#c8553d]" : "bg-zinc-200"}`}
        />
      ))}
    </div>
  );
}

function PickRow({ icon, title, meta, done = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cdp-pressable flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-1.5 text-left hover:bg-[#f7f0e6]"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-zinc-900">{title}</span>
        {meta && <span className="block truncate text-[13px] text-zinc-500">{meta}</span>}
      </span>
      {done && <span className="shrink-0 text-xs font-medium text-[#a8741a]">✓ Đã Chạm</span>}
    </button>
  );
}

function SelectedHeader({ object, unknown, event, onChange }) {
  const noun = event.copy.objectNoun;
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#f7f0e6] px-3 py-2">
      {unknown ? (
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[22px]">{UNKNOWN_ICON}</span>
      ) : (
        <ObjectIcon object={object} event={event} size="sm" />
      )}
      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-zinc-900">
        {unknown ? `${noun.charAt(0).toUpperCase()}${noun.slice(1)} chưa biết tên` : objectDisplayName(object, noun)}
      </span>
      <button type="button" onClick={onChange} className="min-h-11 shrink-0 cursor-pointer px-2 text-sm text-zinc-500">
        Đổi
      </button>
    </div>
  );
}

function LocateStatus({ gps, point }) {
  if (gps === "locating") return "Đang lấy vị trí của bạn…";
  if (point.source === "gps") {
    return `Đã lấy vị trí${point.accuracy ? ` (sai số khoảng ${Math.round(point.accuracy)} m)` : ""}. Kéo bản đồ nếu cần chỉnh.`;
  }
  if (gps === "denied") return "Không lấy được vị trí. Kéo bản đồ để đặt ghim vào chỗ bạn thấy — gần đúng là được.";
  if (point.source === "marker") return "Đặt sẵn ở chỗ vừa được báo. Kéo bản đồ nếu bạn thấy ở chỗ khác.";
  return "Kéo bản đồ để đặt ghim vào chỗ bạn thấy.";
}
