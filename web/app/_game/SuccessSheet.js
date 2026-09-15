"use client";

import { useRef, useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { ObjectIcon } from "./ObjectIcon";
import { AnimatedNumber, ProgressBar } from "./GameProgress";
import { addPhotoToSighting } from "@/app/gameActions";
import { track } from "@/app/analytics";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { compressImageForUpload } from "@/lib/clientImageCompression";
import { OBJECT_KIND, objectDisplayName } from "@/lib/game/catalog";

// Hạt toả tròn, tiết chế, không phủ kín màn hình (NOTE-04 §9–§10). Combo/mốc lớn thêm một vòng
// hạt xa hơn — "mạnh hơn bình thường" nhưng vẫn gọn trong khung icon (NOTE-05 §11).
function makeParticles(count, baseDistance) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2 + 0.3;
    const distance = baseDistance + (i % 3) * 14;
    return {
      dx: `${Math.round(Math.cos(angle) * distance)}px`,
      dy: `${Math.round(Math.sin(angle) * distance)}px`,
      color: ["#e0a526", "#c8553d", "#f2c14e"][i % 3],
      delay: `${(i % 4) * 40}ms`,
    };
  });
}
const PARTICLES = makeParticles(8, 62);
const BIG_PARTICLES = [...PARTICLES, ...makeParticles(12, 96)];

// Trình tự NOTE-05 §16: icon xuất hiện → âm thanh → tiến độ chạy → lời nhắn.
const MESSAGE_DELAY = "450ms";
const EXTRAS_DELAY = "750ms";

function successCopy({ result, object, noun }) {
  const name = objectDisplayName(object, noun);
  if (object?.kind === OBJECT_KIND.UNKNOWN && result.isNewForUser) {
    return {
      title: "Đã Chạm một bí ẩn!",
      body: `CDP sẽ cùng cộng đồng xác định tên ${noun} này. Dấu vết khám phá vẫn là của bạn.`,
    };
  }
  if (result.isNewForUser) return { title: `Đã Chạm: ${name}`, body: null };
  return { title: "Đã ghi nhận vị trí mới", body: "Cảm ơn bạn đã cập nhật bản đồ tối nay." };
}

/**
 * before/after: trạng thái bộ chính ({ met, total, ratio }) · diff: collections.diffCollections()
 * myCount: số lần người này đã gặp mô hình (sau lượt báo)
 */
export function SuccessSheet({
  open,
  onClose,
  event,
  result,
  object,
  before,
  after,
  diff,
  myCount,
  playerName,
  onViewMap,
  onPlayerUpdate,
}) {
  const noun = event.copy.objectNoun;
  const copy = successCopy({ result, object, noun });
  const showFirst = result.isFirstDiscovery && object?.kind === OBJECT_KIND.MODEL;
  const big = Boolean(diff?.milestone || diff?.completed.some((c) => c.combo));
  const [photoState, setPhotoState] = useState(result.hasPhoto ? "sent" : "idle");
  const [photoError, setPhotoError] = useState(result.photoError ?? null);
  const inputRef = useRef(null);

  async function attach(fileList) {
    const file = fileList?.[0];
    if (!file) return;
    setPhotoState("sending");
    setPhotoError(null);
    const form = new FormData();
    form.set("slug", event.slug);
    form.set("anonId", loadLocalContributor()?.anonId ?? "");
    form.set("sightingId", result.sightingId);
    form.set("photo", await compressImageForUpload(file));
    try {
      const response = await addPhotoToSighting(form);
      if (!response.ok) throw new Error(response.error);
      onPlayerUpdate?.(response.player);
      setPhotoState("sent");
      track("photo_upload");
    } catch (error) {
      setPhotoError(error?.message || "Chưa gửi được ảnh.");
      setPhotoState("idle");
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="game-success-title">
      <div className="flex flex-col items-center pt-4 text-center">
        <div className="relative flex h-32 w-32 items-center justify-center">
          <span className="cdp-game-glow absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(242,193,78,0.75)_0%,rgba(224,165,38,0.25)_45%,transparent_70%)]" />
          {big && (
            <span className="cdp-game-ring absolute -inset-4 rounded-full border-4 border-dashed border-[#e0a526]/70" />
          )}
          {(big ? BIG_PARTICLES : PARTICLES).map((p, i) => (
            <span
              key={i}
              className="cdp-game-particle absolute left-1/2 top-1/2 -ml-1 -mt-1 h-2 w-2 rounded-full"
              style={{ "--dx": p.dx, "--dy": p.dy, background: p.color, animationDelay: p.delay }}
            />
          ))}
          <ObjectIcon
            object={object}
            event={event}
            size="lg"
            state={result.isNewForUser ? "unlocked" : "met"}
          />
        </div>

        <div className="cdp-fade-in" style={{ animationDelay: MESSAGE_DELAY }}>
          <h2 id="game-success-title" className="mt-3 text-2xl font-medium leading-tight tracking-tight text-zinc-900">
            {copy.title}
          </h2>
          {copy.body && <p className="mx-auto mt-1 max-w-xs text-[15px] leading-6 text-zinc-600">{copy.body}</p>}
          {!result.isNewForUser && myCount > 1 && (
            <p className="mt-1 text-[13px] text-zinc-500">Bạn đã gặp {noun} này {myCount} lần.</p>
          )}
        </div>

        {showFirst && (
          <p className="cdp-fade-in mt-3 rounded-full bg-[#fbf0d9] px-4 py-2 text-sm font-medium text-[#8a5a10]" style={{ animationDelay: MESSAGE_DELAY }}>
            ✨ {playerName ? <b className="font-medium">{playerName}</b> : "Bạn"} là người đầu tiên ghi nhận {noun} này trên CDP.
          </p>
        )}

        {after.knownTotal > 0 && (
          <div className="mt-5 w-full rounded-xl bg-[#f7f0e6] px-4 py-3 text-left">
            <div className="flex items-baseline justify-between text-sm text-zinc-600">
              <span>Bộ sưu tập</span>
              <span className="text-lg font-medium text-zinc-900">
                <AnimatedNumber value={after.metKnown} duration={900} />
                <span className="text-zinc-400"> / {after.knownTotal}</span>
              </span>
            </div>
            <ProgressBar from={before.ratio} ratio={after.ratio} delayMs={300} className="mt-2" />
          </div>
        )}

        {/* Bộ ẩn / combo / mốc (NOTE-05 §7, §8, §11) — xuất hiện sau cùng. */}
        {diff?.milestone && (
          <div className="cdp-fade-in mt-3 w-full rounded-xl bg-gradient-to-br from-[#fff4d6] to-[#fde3c8] px-4 py-3 text-left" style={{ animationDelay: EXTRAS_DELAY }}>
            <p className="text-base font-medium text-[#7a3d12]">🏆 {diff.milestone.title}</p>
            <p className="mt-0.5 text-sm text-[#8a5a10]">{diff.milestone.body}</p>
          </div>
        )}
        {diff?.unlocked.map((collection) => (
          <div key={`u-${collection.id}`} className="cdp-fade-in mt-3 w-full rounded-xl bg-[#efe9fb] px-4 py-3 text-left" style={{ animationDelay: EXTRAS_DELAY }}>
            <p className="text-sm font-medium text-[#4b2f93]">
              ✨ Bạn vừa mở bộ sưu tập mới: {collection.icon} {collection.title}
            </p>
            <p className="mt-0.5 text-[13px] text-[#5b3fa6]">
              {collection.complete ? `${collection.met} / ${collection.total}` : `${collection.met} / ?`} — còn bao nhiêu nữa thì… tự đi tìm nhé.
            </p>
          </div>
        ))}
        {diff?.completed.map((collection) => (
          <div key={`c-${collection.id}`} className="cdp-fade-in mt-3 w-full rounded-xl bg-[#e8f2e0] px-4 py-3 text-left" style={{ animationDelay: EXTRAS_DELAY }}>
            <p className="text-sm font-medium text-[#2f5a1c]">
              🎉 {collection.combo ? "Combo hoàn thành" : "Hoàn thành bộ"}: {collection.icon} {collection.title} {collection.met}/{collection.total}
            </p>
          </div>
        ))}

        <div className="mt-4 w-full">
          {photoState === "sent" ? (
            <p className="text-[13px] text-zinc-500">📷 Ảnh đã gửi — CDP duyệt trước khi hiện công khai.</p>
          ) : (
            <div className="rounded-xl border border-dashed border-[#e3d4bd] px-4 py-3 text-left">
              <p className="text-sm text-zinc-700">Thêm ảnh để giúp cộng đồng nhận diện và xác minh?</p>
              <button
                type="button"
                disabled={photoState === "sending"}
                onClick={() => inputRef.current?.click()}
                className="cdp-pressable mt-2 min-h-11 cursor-pointer rounded-lg bg-white px-4 text-sm font-medium text-zinc-800 shadow-sm disabled:opacity-60"
              >
                {photoState === "sending" ? "Đang gửi ảnh…" : "📷 Thêm ảnh"}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => attach(e.target.files)}
              />
            </div>
          )}
          {photoError && <p className="mt-2 text-[13px] text-red-600">{photoError}</p>}
        </div>

        <div className="mt-5 grid w-full grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onViewMap}
            className="cdp-pressable min-h-12 cursor-pointer rounded-xl bg-[#f3ece2] text-[15px] font-medium text-zinc-800"
          >
            Xem bản đồ
          </button>
          <button
            type="button"
            onClick={onClose}
            className="cdp-pressable min-h-12 cursor-pointer rounded-xl bg-[#c8553d] text-[15px] font-medium text-white"
          >
            Tiếp tục săn
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}
