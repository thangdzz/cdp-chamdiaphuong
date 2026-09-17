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
import { ACCURACY_WARN_M } from "@/lib/game/riskLimits";

const STEP = { PICK: "pick", LOCATE: "locate", PHOTO: "photo" };
// Bản đo lấy lúc mở sheet còn dùng được trong ngần này; quá thì đo lại ở bước chọn chỗ. Người chơi
// đứng ngắm một mô hình rồi bấm báo thì trong 45 giây họ vẫn ở đúng chỗ đó — đo lại chỉ tốn thêm
// thời gian chờ. Lâu hơn thì coi như đã đi chỗ khác.
const FIX_REUSE_MS = 45_000;
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
  onLocationHelp,
}) {
  const noun = event.copy.objectNoun;
  const [step, setStep] = useState(preset?.objectId ? STEP.LOCATE : STEP.PICK);
  const [query, setQuery] = useState("");
  const [objectId, setObjectId] = useState(preset?.objectId ?? null);
  // Vị trí sẽ gửi đi. null = CHƯA ĐO ĐƯỢC → không có cách nào bấm gửi (chốt 2026-09-16).
  // Không còn điểm mặc định: tâm bản đồ lễ hội và toạ độ marker của người khác từng lọt vào đây.
  const [fix, setFix] = useState(null); // { lat, lng, accuracy, measuredAt, source: "gps"|"manual" }
  const fixRef = useRef(null); // bản sao của `fix` cho các hàm ngoài vòng render đọc tuổi bản đo
  const [acceptedWeak, setAcceptedWeak] = useState(false); // đã bấm "vẫn dùng" khi sai số lớn
  // preset.lat/lng của marker CHỈ dùng để căn khung nhìn bản đồ, không bao giờ là vị trí gửi đi.
  const [focus, setFocus] = useState(() =>
    Number.isFinite(preset?.lat) ? { lat: preset.lat, lng: preset.lng, zoom: 16 } : null
  );
  const [gps, setGps] = useState("idle"); // idle | locating | ok | denied | unavailable | timeout
  const gpsRef = useRef("idle"); // bản sao cho effect đọc, khỏi phải phụ thuộc vào state
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

  // MỘT PHÉP ĐO MỚI cho mỗi lượt báo. `maximumAge: 0` để trình duyệt không trả lại bản đo cũ —
  // trước đây nhận lại bản cũ tới 30 giây nên nhiều lượt báo dính chung một toạ độ.
  function setGpsState(next) {
    gpsRef.current = next;
    setGps(next);
  }

  function requestGps() {
    if (!("geolocation" in navigator)) {
      setGpsState("unavailable");
      return;
    }
    setAcceptedWeak(false);
    fixRef.current = null;
    setFix(null);
    setGpsState("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // KHÔNG gửi giờ theo đồng hồ máy: nhiều máy Android/iPhone chỉnh tay giờ sai cả tiếng,
        // gửi đi là server tưởng bản đo đã cũ và từ chối sạch. Gửi TUỔI của bản đo — hiệu của hai
        // mốc trên CÙNG một đồng hồ, nên đồng hồ sai bao nhiêu cũng không ảnh hưởng.
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          measuredAt: position.timestamp || Date.now(), // mốc nội bộ, chỉ dùng để tính tuổi
          source: "gps",
        };
        fixRef.current = next;
        setFix(next);
        setFocus({ lat: next.lat, lng: next.lng, zoom: 17 });
        setGpsState("ok");
      },
      (error) => {
        // 1 = người dùng từ chối · 2 = máy không định vị được · 3 = quá lâu
        setGpsState(error?.code === 1 ? "denied" : error?.code === 3 ? "timeout" : "unavailable");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }

  // Đo khi CẦN, không đo chồng: đang đo dở thì để yên, còn bản đo mới nguyên thì dùng lại.
  // Nút "Định vị lại" vẫn gọi thẳng requestGps() để ép đo lại bất kể đang có gì.
  function ensureGps() {
    if (gpsRef.current === "locating") return;
    const current = fixRef.current;
    if (current && Date.now() - current.measuredAt < FIX_REUSE_MS) return;
    requestGps();
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
    ensureGps();
  }

  // Hỏi quyền vị trí NGAY khi người chơi bấm "vừa thấy mô hình" (chốt 2026-09-17).
  //
  // Sheet này chỉ được dựng đúng lúc bấm nút, nên đo ở đây = đo ngay lúc bấm. Trước đây phải chọn
  // xong mô hình mới hỏi, người chơi đứng chờ thêm một nhịp nữa. Hỏi sớm còn cho GPS thêm chục giây
  // để bắt cho chuẩn trong lúc họ dò tên mô hình, nên sai số thường nhỏ hơn hẳn.
  //
  // TRƯỚC GIỜ RƯỚC thì KHÔNG hỏi: lượt báo thử không được ghi nhận gì cả, mà hộp thoại xin quyền
  // hiện lúc chưa có gì diễn ra rất dễ bị bấm "Không cho phép" — trên iPhone lựa chọn đó dính luôn
  // cho cả trang và chặn nốt đúng tối 18/9.
  //
  // Hoãn một nhịp: để sheet vẽ xong rồi mới đo, và để không đổi state ngay trong thân effect.
  useEffect(() => {
    if (preGame) return undefined;
    const timer = setTimeout(() => ensureGps(), 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ chạy một lần lúc mở sheet
  }, []);

  const helpLink = onLocationHelp ? (
    <button
      type="button"
      onClick={() => onLocationHelp(gps === "denied" ? "denied" : null)}
      className="cursor-pointer font-medium text-[#c8553d] underline underline-offset-2"
    >
      Cách bật vị trí
    </button>
  ) : null;

  const pickHint =
    gps === "locating" ? (
      <>📍 Đang lấy vị trí của bạn trong lúc bạn chọn…</>
    ) : gps === "denied" ? (
      <>📍 Chưa có quyền vị trí · {helpLink}</>
    ) : gps === "unavailable" || gps === "timeout" ? (
      <>📍 Chưa bắt được vị trí — chọn xong bạn ghim tay hoặc đo lại.</>
    ) : null;

  const weak = fix?.source === "gps" && fix.accuracy > ACCURACY_WARN_M;
  // Ghim tay CHỈ mở khi máy thật sự không đo được — không cho ghim bừa cho nhanh.
  const manualAllowed = gps === "denied" || gps === "unavailable" || gps === "timeout";
  const canSubmit = Boolean(fix) && (!weak || acceptedWeak);

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
    form.set("lat", String(fix.lat));
    form.set("lng", String(fix.lng));
    if (fix.accuracy) form.set("accuracy", String(Math.round(fix.accuracy)));
    form.set("locationSource", fix.source);
    // Tuổi của bản đo tính ngay lúc gửi, theo đồng hồ của chính máy này. Server tự quy ra giờ thật.
    form.set("measuredAgeMs", String(Math.max(0, Date.now() - fix.measuredAt)));
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
        // Server bắt đo lại (thiếu/cũ/nhảy xa): đưa về bước vị trí và đo mới ngay.
        if (["need_fix", "stale_fix", "jump"].includes(result.code)) {
          setStep(STEP.LOCATE);
          setError(result.error);
          requestGps();
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
    <BottomSheet open={open} onClose={onClose} labelledBy="game-report-title" expanded={step === STEP.PICK}>
      <StepDots step={step} />

      {step === STEP.PICK && (
        <div className="cdp-fade-in">
          {/* Tiêu đề + ô tìm kiếm ghim ở đầu vùng cuộn của sheet: danh sách dài cuộn bên dưới, ô tìm
              kiếm không bao giờ trôi mất (kể cả khi bàn phím đang mở). */}
          <div className="sticky top-0 z-10 -mx-5 bg-[#fffdf9] px-5 pb-2">
            <h2 id="game-report-title" className="text-xl font-medium tracking-tight text-zinc-900">
              {event.copy.reportCta}
            </h2>
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Kết quả mới luôn bắt đầu từ dòng đầu, không nằm lơ lửng ở vị trí cuộn cũ.
                const scroller = e.target.closest("[data-sheet-scroller]");
                if (scroller) scroller.scrollTop = 0;
              }}
              placeholder={`Tìm tên ${noun}…`}
              enterKeyHint="search"
              autoComplete="off"
              className="mt-3 h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 outline-none focus:border-[#c8553d] focus:ring-2 focus:ring-[#c8553d]/15"
            />
            {/* Máy hỏi quyền vị trí ngay lúc này, nên nói một câu cho người chơi hiểu vì sao bị hỏi
                giữa lúc đang dò tên mô hình. Đo xong xuôi thì im lặng. */}
            {pickHint && <p className="mt-2 text-[12px] leading-4 text-zinc-500">{pickHint}</p>}
          </div>

          <ul className="mt-1 flex flex-col gap-1.5">
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
            <LocateStatus gps={gps} fix={fix} manualAllowed={manualAllowed} helpLink={helpLink} />
          </p>
          <GameMap
            center={fix ?? event.map.center}
            zoom={focus?.zoom ?? event.map.zoom}
            focus={focus}
            picker={manualAllowed}
            // Đo bằng GPS thì vẽ chấm xanh đúng chỗ đo được. Ghim tay thì đã có cái ghim đứng giữa
            // khung rồi, thêm chấm nữa là rối.
            youAreHere={fix?.source === "gps" ? fix : null}
            venues={event.venues}
            onPick={
              manualAllowed
                ? ({ lat, lng }) =>
                    setFix({ lat, lng, accuracy: null, measuredAt: Date.now(), source: "manual" })
                : undefined
            }
            className="mt-3 h-60 rounded-xl"
          />

          {/* Sai số lớn: nói thẳng và bắt bấm thêm một lần — không bao giờ gửi lặng lẽ một điểm lệch. */}
          {weak && (
            <div className="mt-3 rounded-xl bg-[#fdf0e6] p-3 text-[13px] leading-5 text-[#8a3b28]">
              Vị trí hiện chưa đủ chính xác (sai số khoảng {Math.round(fix.accuracy)} m). Thử đứng thoáng
              hơn rồi đo lại nhé.
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
            <button type="button" className={secondaryButton} onClick={requestGps} disabled={gps === "locating"}>
              {gps === "locating" ? "Đang định vị…" : "📡 Định vị lại"}
            </button>
            {weak && !acceptedWeak ? (
              <button
                type="button"
                className={primaryButton}
                onClick={() => {
                  playGameSound("tap-soft");
                  setAcceptedWeak(true);
                }}
              >
                Vẫn dùng vị trí này
              </button>
            ) : (
              <button
                type="button"
                className={primaryButton}
                disabled={!canSubmit}
                onClick={() => {
                  playGameSound("tap-soft");
                  setStep(STEP.PHOTO);
                }}
              >
                {/* Máy không đo được thì nút này KHÔNG được nói "chờ đo" — chẳng còn gì để chờ,
                    người chơi phải tự kéo bản đồ. Nói sai chỗ này là họ ngồi đợi mãi rồi bỏ cuộc
                    (chủ dự án gặp đúng cảnh đó 17/9). Vẫn khoá nút cho tới khi họ kéo thật: tâm bản
                    đồ lúc mới mở là giữa thành phố, gửi đi là ghi sai chỗ. */}
                {canSubmit
                  ? "Dùng vị trí này"
                  : manualAllowed
                    ? "Kéo bản đồ tới chỗ bạn thấy"
                    : "Chờ đo vị trí…"}
              </button>
            )}
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

function LocateStatus({ gps, fix, manualAllowed, helpLink }) {
  if (gps === "locating") return "Đang đo vị trí của bạn…";
  if (fix?.source === "gps") {
    return `Đã đo xong (sai số khoảng ${Math.round(fix.accuracy)} m).`;
  }
  if (fix?.source === "manual") return "Đang dùng ghim bạn đặt trên bản đồ.";
  if (gps === "denied") {
    return (
      <>
        <strong>Kéo bản đồ</strong> để đặt ghim vào chỗ bạn thấy — gần đúng là được. (Máy đang chặn
        vị trí nên không tự đo được.){helpLink ? <> {helpLink}</> : null}
      </>
    );
  }
  if (gps === "timeout") {
    return (
      <>
        Đo lâu quá chưa xong. Bấm “Định vị lại”, hoặc <strong>kéo bản đồ</strong> để đặt ghim.
      </>
    );
  }
  if (manualAllowed) {
    return (
      <>
        Máy chưa định vị được. <strong>Kéo bản đồ</strong> để đặt ghim vào chỗ bạn thấy.
      </>
    );
  }
  return "Chuẩn bị đo vị trí…";
}
