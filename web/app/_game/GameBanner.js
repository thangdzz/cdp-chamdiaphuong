import Link from "next/link";
import { ObjectIcon } from "./ObjectIcon";
import { computeProgress, rankMostSeen } from "@/lib/game/progress";
import { catalogIndex, isUnnamedSlot, objectDisplayName, OBJECT_KIND } from "@/lib/game/catalog";
import { EVENT_PHASE } from "@/lib/game/registry";
import { formatClock, formatCountdownTo, formatDayMonth } from "@/lib/game/format";

// Cỡ huy hiệu theo vị trí: giữa to nhất, hai bên nhỏ dần — đọc như một vòng cung, không phải hàng icon.
const BADGE_SIZES = [44, 56, 76, 56, 44];
const BADGE_LIFT = [0, 10, 18, 10, 0];

function featuredObjects(event, catalog) {
  const index = catalogIndex(catalog);
  const picked = (event.bannerObjectIds ?? [])
    .map((id) => index.get(id))
    .filter((object) => object && !object.hidden && !object.matchedTo);
  return picked.slice(0, BADGE_SIZES.length);
}

function mostSeenTonight(catalog, tonightStats) {
  const index = catalogIndex(catalog);
  // Slot chưa có tên hay bí ẩn thì "được thấy nhiều nhất: Mô hình chưa xác định #37" không kéo ai vào.
  const top = rankMostSeen({ catalog, objectStats: tonightStats, limit: 5 }).find(({ objectId }) => {
    const object = index.get(objectId);
    return object?.kind === OBJECT_KIND.MODEL && !isUnnamedSlot(object);
  });
  return top ? { name: objectDisplayName(index.get(top.objectId)), count: top.count } : null;
}

function StatTile({ value, label }) {
  return (
    <div className="rounded-lg bg-white/[0.07] px-3 py-2.5 ring-1 ring-white/10">
      <p className="text-xl font-medium tabular-nums leading-tight text-[#fff6dd]">{value}</p>
      <p className="mt-0.5 text-[13px] leading-snug text-white/65">{label}</p>
    </div>
  );
}

/**
 * Banner "cổng vào game" dưới phần đầu bài lễ hội (NOTE-08 §1). Khác GameEntryCard (tiến độ RIÊNG
 * của khách): banner nói chuyện CỘNG ĐỒNG đang chơi tới đâu để kéo người chưa chơi vào. Cả khối là
 * một link — bấm chỗ nào cũng vào game. Số liệu lấy từ teaser, không đọc thêm Redis.
 */
export function GameBanner({ event, href, teaser, phase, now }) {
  const noun = event.copy.objectNoun;
  const waiting = phase === EVENT_PHASE.PRE_GAME || phase === EVENT_PHASE.UPCOMING;
  const ended = phase === EVENT_PHASE.ENDED;
  const progress = computeProgress({ catalog: teaser.catalog, collection: {}, objectStats: teaser.objectStats });
  const tonightTotal = Object.values(teaser.tonightStats ?? {}).reduce((sum, n) => sum + n, 0);
  const topTonight = waiting ? null : mostSeenTonight(teaser.catalog, teaser.tonightStats ?? {});
  const badges = featuredObjects(event, teaser.catalog);
  const countdown = waiting ? formatCountdownTo(event.gameLiveAt, now) : null;

  return (
    <Link
      href={href}
      className="cdp-pressable relative mt-4 block overflow-hidden rounded-xl bg-[linear-gradient(165deg,#1b1733_0%,#2a1d3c_58%,#3a2230_100%)] px-4 pb-4 pt-5 shadow-sm"
    >
      {/* Vầng trăng sau lưng huy hiệu: thở chậm, chỉ opacity; tắt theo prefers-reduced-motion. */}
      <span
        aria-hidden="true"
        className="cdp-game-banner-halo pointer-events-none absolute left-1/2 top-2 h-40 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,206,120,0.42),rgba(255,206,120,0.12)_60%,transparent)]"
      />

      {badges.length > 0 && (
        <div aria-hidden="true" className="relative flex h-24 items-end justify-center gap-1.5">
          {badges.map((object, i) => {
            const slot = badges.length === BADGE_SIZES.length ? i : i + Math.floor((BADGE_SIZES.length - badges.length) / 2);
            return (
              <span key={object.id} style={{ marginBottom: BADGE_LIFT[slot] ?? 0 }} className="flex">
                <ObjectIcon object={object} event={event} size={BADGE_SIZES[slot] ?? 44} />
              </span>
            );
          })}
        </div>
      )}

      <div className="relative mt-3 text-center">
        <p className="text-[13px] font-medium text-[#f3c77a]">{event.copy.reportIcon} Game của lễ hội</p>
        <h2 className="mt-0.5 text-xl font-medium tracking-tight text-[#fff6dd]">{event.name}</h2>
        <p className="mt-1 text-sm text-white/75">{event.copy.bannerTagline ?? event.copy.tagline}</p>
      </div>

      <div className="relative mt-4">
        {waiting ? (
          <div className="rounded-lg bg-white/[0.07] px-3 py-2.5 text-center ring-1 ring-white/10">
            <p className="text-[15px] font-medium text-[#fff6dd]">
              Mở màn {formatClock(event.gameLiveAt)} · {formatDayMonth(event.gameLiveAt)}
              {countdown ? ` · ${countdown}` : ""}
            </p>
            {progress.knownTotal > 0 && (
              <p className="mt-0.5 text-[13px] text-white/65">
                {progress.knownTotal} {noun} đang chờ được tìm thấy
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatTile
                value={progress.knownTotal > 0 ? `${progress.communityKnown} / ${progress.knownTotal}` : progress.communityKnown}
                label={`${noun} đã được ghi nhận`}
              />
              <StatTile
                value={tonightTotal}
                label={ended ? "lượt nhìn thấy hôm nay" : "lượt nhìn thấy tối nay"}
              />
            </div>
            {topTonight ? (
              <p className="mt-2 text-center text-[13px] text-white/70">
                Được thấy nhiều nhất tối nay: <span className="font-medium text-[#fff6dd]">{topTonight.name}</span>
              </p>
            ) : (
              !ended && (
                <p className="mt-2 text-center text-[13px] text-white/70">
                  Chưa ai báo tối nay — bạn mở màn nhé
                </p>
              )
            )}
          </>
        )}
      </div>

      <span className="relative mt-4 flex min-h-12 items-center justify-center gap-1.5 rounded-lg bg-[#c8553d] text-[15px] font-medium text-white shadow-[0_6px_18px_-6px_rgba(200,85,61,0.7)]">
        {ended ? "Xem lại bộ sưu tập" : `${event.copy.reportIcon} ${event.copy.bannerCta ?? "Vào chơi ngay"}`}
      </span>
    </Link>
  );
}
