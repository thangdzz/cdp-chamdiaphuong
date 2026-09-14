"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GameMap } from "./GameMap";
import { GameSummary, SoundToggle } from "./GameProgress";
import { CollectionView, HistoryList, QuestList, RecentFeed } from "./GameViews";
import { ObjectSheet } from "./ObjectSheet";
import { ReportSheet } from "./ReportSheet";
import { SuccessSheet } from "./SuccessSheet";
import { playGameSound, setSoundEnabled, useSoundEnabled } from "./gameSound";
import { loadGameSnapshot, loadPlayerState } from "@/app/gameActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { OBJECT_KIND, objectDisplayName, objectIcon } from "@/lib/game/catalog";
import { computeProgress, resolveCollection } from "@/lib/game/progress";
import { CONFIDENCE } from "@/lib/game/mapLayer";

// Không có websocket (NOTE-04 §27): làm mới nhẹ khi tab đang mở + khi quay lại tab. 2 phút là
// đủ cho mô hình diễu chậm, và giữ số lệnh Redis trong gói miễn phí.
const REFRESH_MS = 2 * 60 * 1000;
const FADE_AFTER_MINUTES = 60;

const TABS = [
  { id: "map", label: "Bản đồ tối nay", short: "Bản đồ" },
  { id: "collection", label: "Bộ sưu tập" },
  { id: "quests", label: "Nhiệm vụ" },
  { id: "history", label: "Lịch sử" },
];

const EMPTY_PLAYER = { collection: {}, history: [], anonIdHash: null };

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
  const soundOn = useSoundEnabled();
  const knownMarkerIds = useRef(new Set(initialSnapshot.markers.map((m) => m.id)));
  const [newMarkerIds, setNewMarkerIds] = useState(() => new Set());
  const reportSession = useRef(openReportOnLoad ? 1 : 0);

  const live = snapshot.phase === "live";
  const catalogById = useMemo(() => new Map(snapshot.catalog.map((o) => [o.id, o])), [snapshot.catalog]);
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

  const applySnapshot = useCallback((next) => {
    const fresh = next.markers.filter((m) => !knownMarkerIds.current.has(m.id)).map((m) => m.id);
    next.markers.forEach((m) => knownMarkerIds.current.add(m.id));
    setNewMarkerIds(new Set(fresh));
    setSnapshot(next);
    setNow(Date.now());
  }, []);

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
      loadGameSnapshot(event.slug).then((result) => {
        if (result.ok) applySnapshot(result.snapshot);
      });
    };
    const clock = window.setInterval(() => setNow(Date.now()), 30000);
    timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(clock);
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [event.slug, applySnapshot]);

  const mapMarkers = useMemo(
    () =>
      snapshot.markers.map((marker) => {
        const object = catalogById.get(marker.objectId);
        return {
          id: marker.id,
          lat: marker.lat,
          lng: marker.lng,
          icon: objectIcon(object, event.categories),
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
    [snapshot.markers, catalogById, event.categories, now, noun, newMarkerIds]
  );

  function openReport(preset = null) {
    playGameSound("tap-soft");
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
    applySnapshot(result.snapshot);
    setPlayer(result.player);
    setReport(null);
    const milestone = (result.isFirstDiscovery && catalogById.get(result.objectId)?.kind === OBJECT_KIND.MODEL) ||
      (after.completed && !before.completed);
    playGameSound(milestone ? "collection-complete" : result.isNewForUser ? "discovery-chime" : "tap-soft");
    if (result.isNewForUser) setJustUnlockedId(result.objectId);
    const marker = result.snapshot.markers.find((m) => m.objectId === result.objectId);
    if (marker) setMapFocus({ lat: marker.lat, lng: marker.lng, zoom: 16, key: result.sightingId });
    setSuccess({
      result,
      object: result.snapshot.catalog.find((o) => o.id === result.objectId),
      before,
      after,
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
          <GameSummary event={event} progress={progress} totalSightings={snapshot.totalSightings} />
          {!live && (
            <p className="rounded-xl bg-white px-4 py-3 text-sm text-zinc-600 shadow-sm">
              {snapshot.phase === "ended"
                ? "Mùa săn này đã khép lại. Bộ sưu tập và bản đồ được giữ làm kỷ niệm."
                : "Mùa săn chưa mở. Quay lại khi mô hình bắt đầu diễu diễu nhé."}
            </p>
          )}
          {live && <div className="hidden lg:block">{reportButton}</div>}
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
          className={`order-2 lg:sticky lg:top-6 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block ${
            tab === "map" ? "block" : "hidden"
          }`}
        >
          <GameMap
            center={event.map.center}
            zoom={event.map.zoom}
            markers={mapMarkers}
            onMarkerClick={openMarker}
            focus={mapFocus}
            showLocate
            // svh (không phải dvh): chiều cao KHÔNG đổi khi thanh địa chỉ Safari co/giãn lúc cuộn,
            // nên cuộn trang không kéo theo resize bản đồ (nguyên nhân nháy canvas).
            className="h-[58svh] min-h-80 rounded-2xl shadow-sm lg:h-[calc(100svh-7rem)]"
          />
        </section>

        <div className="order-3 lg:col-start-2 lg:row-start-2">
          {tab === "map" && (
            <RecentFeed
              event={event}
              markers={snapshot.markers}
              catalogById={catalogById}
              now={now}
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
              resolvedCollection={resolvedCollection}
              objectStats={snapshot.objectStats}
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
      {live && (
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
          now={now}
          canReport={live}
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
