import { HomeGameDock } from "./HomeGameDock";
import { badgeHtml, badgeSpec } from "@/lib/game/badge";
import { OBJECT_KIND, catalogIndex, isUnnamedSlot, mergeCatalog, objectDisplayName } from "@/lib/game/catalog";
import { computeProgress, rankMostSeen } from "@/lib/game/progress";
import { EVENT_PHASE, eventGameLiveAt, eventPhase, gameEventHref } from "@/lib/game/registry";
import { formatClock, formatCountdownTo, formatDayMonth } from "@/lib/game/format";
import { getSharedGameTeaser, loadGameEventShared } from "@/lib/game/store";

// Cổng vào game ở trang chủ (NOTE-08 §1, sửa 2026-09-16): thay cho banner từng đặt trong bài lễ hội.
// Phần này chạy ở SERVER: đọc dữ liệu qua bộ đệm 20 giây (trang chủ đông nhất — PLAN-dem-18-9 §5 B1)
// và dựng sẵn HTML huy hiệu, để trang chủ không phải tải bộ hình huy hiệu (~71KB) về trình duyệt.

function topTonightName(catalog, tonightStats) {
  const index = catalogIndex(catalog);
  const top = rankMostSeen({ catalog, objectStats: tonightStats, limit: 5 }).find(({ objectId }) => {
    const object = index.get(objectId);
    return object?.kind === OBJECT_KIND.MODEL && !isUnnamedSlot(object);
  });
  return top ? objectDisplayName(index.get(top.objectId)) : null;
}

export async function HomeGameEntry({ slug, now }) {
  const event = await loadGameEventShared(slug);
  if (!event) return null;
  const phase = eventPhase(event, now);
  // Hết mùa thì không mời ai vào chơi nữa.
  if (phase === EVENT_PHASE.ENDED) return null;

  // Redis lỗi vẫn hiện được thẻ (đếm ngược/lời mời) với danh mục seed — chỉ thiếu số cộng đồng.
  const teaser = await getSharedGameTeaser(event).catch(() => null);
  const catalog = teaser?.catalog ?? mergeCatalog(event.objects, {}, event.id).filter((o) => !o.hidden);
  const progress = computeProgress({ catalog, collection: {}, objectStats: teaser?.objectStats ?? {} });
  const tonightTotal = Object.values(teaser?.tonightStats ?? {}).reduce((sum, n) => sum + n, 0);
  const waiting = phase === EVENT_PHASE.PRE_GAME || phase === EVENT_PHASE.UPCOMING;
  const liveAt = eventGameLiveAt(event);

  // Huy hiệu đại diện = con giữa của `bannerObjectIds` (file mùa); id bị ẩn/ghép thì lấy con kế tiếp.
  const index = catalogIndex(catalog);
  const featured = (event.bannerObjectIds ?? [])
    .map((id) => index.get(id))
    .filter((object) => object && !object.hidden && !object.matchedTo);
  const hero = featured[Math.floor(featured.length / 2)] ?? null;

  let status;
  if (waiting) {
    const countdown = formatCountdownTo(liveAt, now);
    status = `Mở màn ${formatClock(liveAt)} · ${formatDayMonth(liveAt)}${countdown ? ` · ${countdown}` : ""}`;
  } else if (tonightTotal > 0) {
    const top = topTonightName(catalog, teaser.tonightStats);
    status = `🔥 ${tonightTotal} lượt thấy tối nay${top ? ` · nhiều nhất: ${top}` : ` · ${progress.communityKnown}/${progress.knownTotal} ${event.copy.objectNoun}`}`;
  } else {
    status = `Đèn đang rước — báo ${event.copy.objectNoun} đầu tiên tối nay!`;
  }

  return (
    <HomeGameDock
      href={gameEventHref(event)}
      eventId={event.id}
      title={event.name}
      cta={event.copy.bannerCta ?? "Vào chơi ngay"}
      icon={event.copy.reportIcon}
      status={status}
      heroBadge={hero ? badgeHtml(badgeSpec(hero, event), { size: 48 }) : null}
      tabBadge={hero ? badgeHtml(badgeSpec(hero, event), { size: 38 }) : null}
      tabLabel={waiting ? formatDayMonth(liveAt) : "Tối nay"}
    />
  );
}
