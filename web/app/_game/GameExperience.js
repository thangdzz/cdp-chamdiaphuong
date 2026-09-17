"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameMap } from "./GameMap";
import { GameSummary, SoundToggle } from "./GameProgress";
import { LocationHelpSheet } from "./LocationHelpSheet";
import { CollectionView, HistoryList, NightHighlights, QuestList, RecentFeed } from "./GameViews";
import { ObjectSheet } from "./ObjectSheet";
import { PreGameSheet, bumpPreGameAttempts } from "./PreGameSheet";
import { ReportSheet } from "./ReportSheet";
import { SuccessSheet } from "./SuccessSheet";
import {
  playCelebrationAfter,
  playGameSound,
  playSeenAgainSound,
  playUnlockSound,
  setSoundEnabled,
  unlockSoundDurationMs,
  useSoundEnabled,
} from "./gameSound";
import { loadGameSnapshot, loadPlayerState } from "@/app/gameActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { PlayerNameCard, PlayerNameSheet } from "./PlayerNameSheet";
import { track } from "@/app/analytics";
import { ensureDraftName, saveLocalNickname, usePlayerName } from "./playerName";
import {
  OBJECT_KIND,
  catalogIndex,
  objectDisplayName,
  resolveObjectId,
} from "@/lib/game/catalog";
import { badgeSpec } from "@/lib/game/badge";
import { computeCollections, diffCollections } from "@/lib/game/collections";
import { formatCountdownTo, formatDayMonth } from "@/lib/game/format";
import { computeProgress, resolveCollection, resolveObjectStats } from "@/lib/game/progress";
import { CONFIDENCE } from "@/lib/game/mapLayer";
import { EVENT_PHASE, livePhaseAt } from "@/lib/game/registry";

// Không có websocket (NOTE-04 §27): làm mới nhẹ khi tab đang mở + khi quay lại tab. 2 phút là
// đủ cho mô hình diễu chậm, và giữ số lệnh Redis trong gói miễn phí.
const REFRESH_MS = 2 * 60 * 1000;
const RETURN_REFRESH_MIN_MS = 30 * 1000;
const FADE_AFTER_MINUTES = 60;

const TABS = [
  { id: "map", label: "Bản đồ tối nay", short: "Bản đồ" },
  { id: "collection", label: "Bộ sưu tập" },
  { id: "quests", label: "Nhiệm vụ" },
  { id: "history", label: "Lịch sử" },
];

const EMPTY_PLAYER = { collection: {}, counts: {}, history: [], anonIdHash: null, displayName: null };

// Chọn MỘT lớp ăn mừng phía sau tiếng mở khoá — mốc > combo > hoàn thành bộ > mở bộ ẩn > người
// đầu tiên. Không chồng nhiều tiếng lên nhau (NOTE-05 §17, §19).
function celebrationSound({ diff, firstDiscovery }) {
  // Trọn bộ có tiếng riêng: trống hội + đám đông + chuông hoàn thành (NOTE-06 §8).
  if (diff.milestone?.count === "complete") return "grand-complete";
  if (diff.milestone) return "milestone";
  if (diff.completed.some((c) => c.combo)) return "combo";
  if (diff.completed.length > 0) return "collection-complete";
  if (diff.unlocked.length > 0) return "secret-reveal";
  if (firstDiscovery) return "collection-complete";
  return null;
}

export function GameExperience({ event, initialSnapshot, openReportOnLoad = false }) {
  const noun = event.copy.objectNoun;
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [player, setPlayer] = useState(EMPTY_PLAYER);
  const [now, setNow] = useState(() => Date.parse(initialSnapshot.generatedAt));
  const [tab, setTab] = useState("map");
  const [report, setReport] = useState(() => (openReportOnLoad ? { session: 1, preset: null } : null));
  const [detail, setDetail] = useState(null); // { objectId, markerId }
  const [success, setSuccess] = useState(null);
  const [mapFocus, setMapFocus] = useState(null);
  const [justUnlockedId, setJustUnlockedId] = useState(null);
  const [troll, setTroll] = useState(null); // { session, attempt }
  const [liveBanner, setLiveBanner] = useState(false);
  const [locationHelp, setLocationHelp] = useState(false);
  const [nameSheet, setNameSheet] = useState(0); // 0 = đóng; số tăng = mở phiên mới (reset ô nhập)
  const playerName = usePlayerName();
  const snapshotRef = useRef(initialSnapshot);
  const lastTickRef = useRef(Date.parse(initialSnapshot.generatedAt));
  const soundOn = useSoundEnabled();
  const knownMarkerIds = useRef(new Set(initialSnapshot.markers.map((m) => m.id)));
  const [newMarkerIds, setNewMarkerIds] = useState(() => new Set());
  const reportSession = useRef(openReportOnLoad ? 1 : 0);

  const phase = livePhaseAt(snapshot, now);
  const live = phase === EVENT_PHASE.LIVE;
  const preGame = phase === EVENT_PHASE.PRE_GAME;
  const canReport = live || preGame;
  const catalogById = useMemo(() => new Map(snapshot.catalog.map((o) => [o.id, o])), [snapshot.catalog]);
  const modelNames = useMemo(() => snapshot.catalog.map((o) => o.name).filter(Boolean), [snapshot.catalog]);
  const resolvedCollection = useMemo(
    () => resolveCollection(player.collection, snapshot.catalog),
    [player.collection, snapshot.catalog]
  );
  const progress = useMemo(
    () =>
      computeProgress({
        catalog: snapshot.catalog,
        collection: player.collection,
        objectStats: snapshot.objectStats,
      }),
    [snapshot.catalog, snapshot.objectStats, player.collection]
  );

  const collections = useMemo(
    () => computeCollections({ collections: event.collections, catalog: snapshot.catalog, resolvedCollection }),
    [event.collections, snapshot.catalog, resolvedCollection]
  );
  const myCounts = useMemo(() => resolveObjectStats(player.counts, snapshot.catalog), [player.counts, snapshot.catalog]);
  // Độ hiếm chỉ bật khi game live (NOTE-05 §21).
  const rarity = live ? snapshot.rarity ?? null : null;
  // "Bạn gặp X nhiều nhất tối nay" — từ lịch sử riêng trong ngày (NOTE-05 §10).
  const myTonight = useMemo(() => {
    const today = formatDayMonth(new Date(now).toISOString());
    const index = catalogIndex(snapshot.catalog);
    const counts = new Map();
    for (const item of player.history) {
      if (formatDayMonth(item.createdAt) !== today) continue;
      const id = resolveObjectId(item.objectId, index);
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    const [objectId, count] = [...counts].sort((a, b) => b[1] - a[1])[0] ?? [];
    return objectId ? { objectId, count } : null;
  }, [player.history, snapshot.catalog, now]);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const applySnapshot = useCallback((next) => {
    // Snapshot dùng chung 20 giây (PLAN-dem-18-9 §5 B1) có thể CŨ hơn bản đang có — VD vừa báo xong
    // (server trả bản mới) thì tới lượt tự làm mới nhận bản tạo trước lượt báo: marker của chính mình
    // biến mất tới 2 phút. Bản cũ hơn thì bỏ qua.
    if (Date.parse(next.generatedAt) < Date.parse(snapshotRef.current.generatedAt)) return;
    snapshotRef.current = next; // cập nhật ngay, không đợi effect — phản hồi tới sát nhau vẫn so đúng
    const fresh = next.markers.filter((m) => !knownMarkerIds.current.has(m.id)).map((m) => m.id);
    next.markers.forEach((m) => knownMarkerIds.current.add(m.id));
    setNewMarkerIds(new Set(fresh));
    setSnapshot(next);
    setNow(Date.now());
  }, []);

  // Hỏi lại server trạng thái mới nhất (pha game, marker…). Gọi định kỳ, khi quay lại tab, và mỗi
  // lần người chơi mở luồng báo — để máy này không giữ pha cũ khi admin vừa đổi giờ mở game.
  // Trang vừa render từ server = vừa có snapshot mới; quay lại tab ngay sau đó không cần hỏi lại.
  const lastSyncRef = useRef(Date.parse(initialSnapshot.generatedAt));
  const syncSnapshot = useCallback(() => {
    lastSyncRef.current = Date.now();
    return loadGameSnapshot(event.slug).then((result) => {
      if (result.ok) applySnapshot(result.snapshot);
    });
  }, [event.slug, applySnapshot]);

  // Vào game là có tên ngay (NOTE-08 §10) — tên nháp trên máy, chưa ghi server.
  const initialModelNames = useRef(modelNames);
  useEffect(() => {
    ensureDraftName(initialModelNames.current);
    track("game_open");
  }, []);

  // Mọi đường mở thẻ mô hình (bản đồ, bộ sưu tập, tin gần đây, nhiệm vụ) đều đi qua `detail`.
  const detailKey = detail ? `${detail.objectId}:${detail.markerId ?? ""}` : null;
  useEffect(() => {
    if (detailKey) track("model_open");
  }, [detailKey]);

  // Tên theo server thắng tên trên máy: đổi tên ở máy khác, hoặc hồ sơ cũ "Người ẩn danh" (NOTE-08 §4).
  useEffect(() => {
    if (player.displayName) saveLocalNickname(player.displayName);
  }, [player.displayName]);

  // Bộ sưu tập riêng cần anonId trong localStorage nên chỉ tải được ở trình duyệt.
  useEffect(() => {
    const anonId = loadLocalContributor()?.anonId;
    if (!anonId) return;
    loadPlayerState({ slug: event.slug, anonId }).then((result) => {
      if (result.ok) setPlayer(result.player);
    });
  }, [event.slug]);

  useEffect(() => {
    let timer = null;
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      syncSnapshot();
    };
    const clock = window.setInterval(() => {
      const t = Date.now();
      // Trang đang mở đúng lúc tới giờ rước: chuyển sang live tại chỗ, báo + làm mới dữ liệu.
      const before = livePhaseAt(snapshotRef.current, lastTickRef.current);
      const after = livePhaseAt(snapshotRef.current, t);
      lastTickRef.current = t;
      if (before === EVENT_PHASE.PRE_GAME && after === EVENT_PHASE.LIVE) {
        setLiveBanner(true);
        playGameSound("game-live");
        refresh();
      }
      setNow(t);
    }, 30000);
    // Mở khoá màn hình/quay lại tab liên tục giữa phố: chỉ hỏi lại server nếu lần gần nhất đã quá
    // 30 giây (PLAN-dem-18-9 §5 B3) — mỗi lần hỏi là ~11 lệnh Redis.
    const refreshOnReturn = () => {
      if (Date.now() - lastSyncRef.current < RETURN_REFRESH_MIN_MS) return;
      refresh();
    };
    timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refreshOnReturn);
    };
  }, [syncSnapshot]);

  const mapMarkers = useMemo(
    () =>
      snapshot.markers.map((marker) => {
        const object = catalogById.get(marker.objectId);
        return {
          id: marker.id,
          lat: marker.lat,
          lng: marker.lng,
          icon: badgeSpec(object, event),
          tone:
            object?.kind === OBJECT_KIND.UNKNOWN
              ? "mystery"
              : marker.confidence === CONFIDENCE.HIGH
                ? "high"
                : "normal",
          faded: now - Date.parse(marker.lastSeenAt) > FADE_AFTER_MINUTES * 60000,
          label: objectDisplayName(object, noun),
          count: marker.reports,
          isNew: newMarkerIds.has(marker.id),
        };
      }),
    [snapshot.markers, catalogById, event, now, noun, newMarkerIds]
  );

  function showTroll() {
    syncSnapshot();
    setReport(null);
    setDetail(null);
    reportSession.current += 1;
    setTroll({ session: reportSession.current, attempt: bumpPreGameAttempts(event.id) });
  }

  function openReport(preset = null) {
    track("sighting_start");
    // Pre-game từ thẻ mô hình ("Tôi vừa thấy mô hình này"): đã chọn mô hình rồi → câu đùa luôn.
    if (preGame && preset?.objectId) {
      showTroll();
      return;
    }
    playGameSound("tap-soft");
    // Trong lúc người chơi còn đang tìm mô hình trong danh sách, pha game đã kịp cập nhật.
    syncSnapshot();
    reportSession.current += 1;
    setDetail(null);
    setReport({ session: reportSession.current, preset });
  }

  function openMarker(markerId) {
    const marker = snapshot.markers.find((m) => m.id === markerId);
    if (!marker) return;
    setDetail({ objectId: marker.objectId, markerId });
  }

  function openObject(objectId) {
    // Có marker tối nay thì mở kèm marker mới nhất để người chơi biết đi đâu tìm.
    const marker = snapshot.markers.find((m) => m.objectId === objectId);
    setDetail({ objectId, markerId: marker?.id ?? null });
  }

  function handleSubmitted(result) {
    const before = progress;
    const after = computeProgress({
      catalog: result.snapshot.catalog,
      collection: result.player.collection,
      objectStats: result.snapshot.objectStats,
    });
    const afterCollections = computeCollections({
      collections: event.collections,
      catalog: result.snapshot.catalog,
      resolvedCollection: resolveCollection(result.player.collection, result.snapshot.catalog),
    });
    const diff = diffCollections({ before: collections, after: afterCollections, milestones: event.milestones });
    const object = result.snapshot.catalog.find((o) => o.id === result.objectId);

    applySnapshot(result.snapshot);
    setPlayer(result.player);
    setReport(null);
    track("sighting_submit");
    if (result.isNewForUser) track("collection_unlock");
    if (result.hasPhoto) track("photo_upload");

    // Icon + tiếng "nhân vật" xuất hiện cùng nhau; gặp lại chỉ có tiếng xác nhận ngắn. Lớp ăn mừng
    // (nếu có) chờ tiếng mở khoá gần hết mới phát, không chồng lên nhau (NOTE-05 §16, NOTE-06 §7).
    if (result.isNewForUser) playUnlockSound(object, event);
    else playSeenAgainSound();
    playCelebrationAfter(
      celebrationSound({ diff, firstDiscovery: result.isFirstDiscovery && object?.kind === OBJECT_KIND.MODEL }),
      result.isNewForUser ? Math.min(2000, Math.max(700, unlockSoundDurationMs(object, event) - 250)) : 350
    );

    if (result.isNewForUser) setJustUnlockedId(result.objectId);
    const marker = result.snapshot.markers.find((m) => m.objectId === result.objectId);
    if (marker) setMapFocus({ lat: marker.lat, lng: marker.lng, zoom: 16, key: result.sightingId });
    setSuccess({
      result,
      object,
      before,
      after,
      diff,
      myCount: resolveObjectStats(result.player.counts, result.snapshot.catalog)[result.objectId] ?? 0,
    });
  }

  const detailObject = detail ? catalogById.get(detail.objectId) : null;
  const detailMarker = detail?.markerId ? snapshot.markers.find((m) => m.id === detail.markerId) : null;

  const reportButton = (
    <button
      type="button"
      onClick={() => openReport()}
      className="cdp-pressable flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#c8553d] px-5 text-base font-medium text-white shadow-[0_8px_24px_-8px_rgba(200,85,61,0.7)]"
    >
      <span className="text-xl" aria-hidden="true">{event.copy.reportIcon}</span>
      {event.copy.reportCta}
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-6xl bg-[#faf6f0] px-4 pb-36 pt-4 sm:px-6 lg:bg-transparent lg:pb-12">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link href={event.postHref} transitionTypes={["nav-back"]} className="text-sm text-zinc-500">
            ← {event.postTitle}
          </Link>
          <h1 className="mt-0.5 text-[22px] font-medium tracking-tight text-zinc-900 sm:text-2xl">{event.shortName}</h1>
          <p className="text-[13px] text-zinc-500">{event.copy.tagline}</p>
        </div>
        <SoundToggle
          enabled={soundOn}
          onToggle={() => {
            setSoundEnabled(!soundOn);
            if (!soundOn) playGameSound("tap-soft");
          }}
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-6 lg:gap-y-4">
        <div className="order-1 flex flex-col gap-3 lg:col-start-2 lg:row-start-1">
          <PlayerNameCard name={playerName} onEdit={() => setNameSheet((n) => n + 1)} />
          <GameSummary event={event} progress={progress} totalSightings={snapshot.totalSightings} />
          {preGame && (
            <div className="rounded-2xl bg-[#fff4de] px-4 py-3 shadow-sm ring-1 ring-[#f1d9a8]">
              <p className="text-[15px] font-medium text-[#7a4a0c]">
                🏮 {event.copy.preGameBanner}
                {formatCountdownTo(snapshot.gameLiveAt, now) ? (
                  <span className="font-normal text-[#a06a1c]"> · {formatCountdownTo(snapshot.gameLiveAt, now)}</span>
                ) : null}
              </p>
              <p className="mt-0.5 text-[13px] leading-5 text-[#8a5a10]">{event.copy.preGameHint}</p>
            </div>
          )}
          {liveBanner && live && (
            <button
              type="button"
              onClick={() => setLiveBanner(false)}
              className="cdp-game-icon-unlock w-full cursor-pointer rounded-2xl bg-[#c8553d] px-4 py-3 text-left text-[15px] font-medium text-white shadow-sm"
            >
              🎉 {event.copy.liveBanner}
            </button>
          )}
          {(phase === EVENT_PHASE.ENDED || phase === EVENT_PHASE.UPCOMING) && (
            <p className="rounded-xl bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
              {phase === EVENT_PHASE.ENDED
                ? "Mùa săn này đã khép lại. Bộ sưu tập và bản đồ được giữ làm kỷ niệm."
                : "Mùa săn chưa mở. Quay lại khi mô hình bắt đầu diễu diễu nhé."}
            </p>
          )}
          {canReport && <div className="hidden lg:block">{reportButton}</div>}
          <nav aria-label="Các phần của trò chơi">
            <div className="flex w-full gap-0.5 rounded-full bg-[#efe6d8] p-1">
              {TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  aria-current={tab === item.id ? "page" : undefined}
                  className={`min-h-10 flex-1 cursor-pointer whitespace-nowrap rounded-full px-2 text-[13px] transition-colors duration-200 sm:px-3.5 sm:text-sm lg:px-2 lg:text-[13px] ${
                    tab === item.id ? "bg-white font-medium text-zinc-900 shadow-sm" : "text-zinc-600"
                  }`}
                >
                  {item.short ? (
                    <>
                      {/* Cột phải desktop hẹp như điện thoại nên cũng dùng nhãn ngắn. */}
                      <span className="sm:hidden lg:inline">{item.short}</span>
                      <span className="hidden sm:inline lg:hidden">{item.label}</span>
                    </>
                  ) : (
                    item.label
                  )}
                  {item.id === "quests" && snapshot.quests.length > 0 && (
                    <span className="ml-1 rounded-full bg-[#c8553d] px-1.5 text-[11px] font-medium text-white">
                      {snapshot.quests.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Một bản đồ duy nhất: mobile chỉ hiện ở tab bản đồ, desktop luôn hiện bên trái
            (NOTE-04 §24). Ẩn bằng CSS để không dựng lại MapLibre mỗi lần đổi tab. */}
        <section
          className={`relative order-2 lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block ${
            tab === "map" ? "block" : "hidden"
          }`}
        >
          <GameMap
            center={event.map.center}
            zoom={event.map.zoom}
            markers={mapMarkers}
            onMarkerClick={openMarker}
            focus={mapFocus}
            venues={event.venues}
            showLocate
            // Trạng thái DỮ LIỆU game, tách khỏi trạng thái GPS — GameMap xếp hai dòng chồng nhau
            // ở mép trên, không dòng nào đè lên marker hay nhãn tuyến.
            statusNote={preGame ? event.copy.preGameMap : null}
            // Màn báo đèn tự đo vị trí riêng — bản đồ nhường cảm biến trong lúc đó.
            pauseLocate={Boolean(report)}
            onLocationHelp={() => setLocationHelp(true)}
            // svh (không phải dvh): chiều cao KHÔNG đổi khi thanh địa chỉ Safari co/giãn lúc cuộn,
            // nên cuộn trang không kéo theo resize bản đồ (nguyên nhân nháy canvas).
            className="h-[58svh] min-h-80 rounded-2xl shadow-sm lg:h-[calc(100svh-7rem)]"
          />
        </section>

        <div className="order-3 lg:col-start-2 lg:row-start-2">
          {tab === "map" && live && (
            <NightHighlights
              event={event}
              night={snapshot.night ?? {}}
              catalogById={catalogById}
              myTonight={myTonight}
              onOpen={openObject}
            />
          )}
          {tab === "map" && (
            <RecentFeed
              event={event}
              markers={snapshot.markers}
              catalogById={catalogById}
              now={now}
              preGame={preGame}
              onOpen={(marker) => {
                setMapFocus({ lat: marker.lat, lng: marker.lng, zoom: 16, key: marker.id });
                setDetail({ objectId: marker.objectId, markerId: marker.id });
              }}
            />
          )}
          {tab === "collection" && (
            <CollectionView
              event={event}
              catalog={snapshot.catalog}
              collections={collections}
              resolvedCollection={resolvedCollection}
              objectStats={snapshot.objectStats}
              myCounts={myCounts}
              rarity={rarity}
              justUnlockedId={justUnlockedId}
              onOpen={openObject}
            />
          )}
          {tab === "quests" && (
            <QuestList event={event} quests={snapshot.quests} catalogById={catalogById} onOpen={openObject} />
          )}
          {tab === "history" && (
            <HistoryList
              event={event}
              history={player.history}
              catalogById={catalogById}
              now={now}
              onOpen={openObject}
            />
          )}
        </div>
      </div>

      {/* CTA quan trọng nhất luôn trong tầm ngón cái (NOTE-04 §7). */}
      {canReport && (
        <div
          // Gradient sRGB viết tay: bản Tailwind (oklab + color-mix) bị WebKit pha màu trong suốt
          // thành dải xám phía trên nút.
          style={{ background: "linear-gradient(to top, #faf6f0 0%, rgba(250,246,240,0.92) 55%, rgba(250,246,240,0) 100%)" }}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 lg:hidden"
        >
          <div className="pointer-events-auto mx-auto max-w-lg">{reportButton}</div>
        </div>
      )}

      {report && (
        <ReportSheet
          key={report.session}
          open
          onClose={() => setReport(null)}
          event={event}
          snapshot={snapshot}
          resolvedCollection={resolvedCollection}
          preset={report.preset}
          now={now}
          onSubmitted={handleSubmitted}
          preGame={preGame}
          onPreGameAttempt={showTroll}
          onLocationHelp={() => setLocationHelp(true)}
        />
      )}

      <LocationHelpSheet open={locationHelp} onClose={() => setLocationHelp(false)} />

      {nameSheet > 0 && (
        <PlayerNameSheet
          key={nameSheet}
          open
          onClose={() => setNameSheet(0)}
          currentName={playerName}
          avoidNames={modelNames}
        />
      )}

      {troll && (
        <PreGameSheet
          key={troll.session}
          open
          onClose={() => setTroll(null)}
          event={{ ...event, gameLiveAt: snapshot.gameLiveAt ?? event.gameLiveAt }}
          attempt={troll.attempt}
          now={now}
        />
      )}

      {detailObject && (
        <ObjectSheet
          key={`${detail.objectId}:${detail.markerId ?? ""}`}
          open
          onClose={() => setDetail(null)}
          event={event}
          object={detailObject}
          marker={detailMarker}
          met={Boolean(resolvedCollection[detailObject.id])}
          first={snapshot.firsts[detailObject.id] ?? null}
          myHash={player.anonIdHash}
          sightingCount={snapshot.objectStats[detailObject.id] ?? 0}
          tonight={snapshot.tonight?.[detailObject.id] ?? null}
          myCount={myCounts[detailObject.id] ?? 0}
          rarity={rarity?.[detailObject.id] ?? null}
          now={now}
          canReport={canReport}
          onReport={(objectId, marker) =>
            openReport({ objectId, lat: marker?.lat, lng: marker?.lng })
          }
        />
      )}

      {success && (
        <SuccessSheet
          key={success.result.sightingId}
          open
          onClose={() => setSuccess(null)}
          event={event}
          result={success.result}
          object={success.object}
          before={success.before}
          after={success.after}
          diff={success.diff}
          myCount={success.myCount}
          playerName={playerName}
          onPlayerUpdate={setPlayer}
          onViewMap={() => {
            setSuccess(null);
            setTab("map");
          }}
        />
      )}
    </main>
  );
}
