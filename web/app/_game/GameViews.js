"use client";

import { useState } from "react";
import { ObjectIcon } from "./ObjectIcon";
import { OBJECT_KIND, objectDisplayName, openMysteries } from "@/lib/game/catalog";
import { RARITY, RARITY_LABEL, nightHighlights } from "@/lib/game/collections";
import { formatAgo, formatClock, formatDayMonth } from "@/lib/game/format";
import { confidenceLabel } from "@/lib/game/mapLayer";

const MAX_MYSTERY_CARDS = 12;

export function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl bg-white px-5 py-6 text-center shadow-sm">
      <p className="text-[15px] font-medium text-zinc-900">{title}</p>
      {body && <p className="mt-1 text-sm leading-6 text-zinc-500">{body}</p>}
    </div>
  );
}

const RARITY_TONE = {
  [RARITY.COMMON]: "bg-zinc-100 text-zinc-600",
  [RARITY.UNCOMMON]: "bg-[#e8f2e0] text-[#3f6b2a]",
  [RARITY.RARE]: "bg-[#efe9fb] text-[#5b3fa6]",
  [RARITY.SEEN]: "bg-zinc-100 text-zinc-600",
  [RARITY.UNSEEN]: "bg-[#fbf0d9] text-[#8a5a10]",
};

export function RarityChip({ rarity, className = "" }) {
  if (!rarity) return null;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${RARITY_TONE[rarity] ?? ""} ${className}`}>
      {RARITY_LABEL[rarity]}
    </span>
  );
}

/** "Vừa được nhìn thấy" — danh sách marker tối nay, bấm để bay tới trên bản đồ. */
export function RecentFeed({ event, markers, catalogById, now, onOpen, preGame = false }) {
  const noun = event.copy.objectNoun;
  if (markers.length === 0) {
    return preGame ? (
      <EmptyState title={event.copy.preGameMap} body={event.copy.preGameHint} />
    ) : (
      <EmptyState
        title={`Tối nay chưa ai báo vị trí ${noun}.`}
        body={`Nếu bạn gặp một ${noun} ngoài đường, hãy là người đầu tiên ghi nhận.`}
      />
    );
  }
  return (
    <section>
      <h2 className="mb-2 text-[13px] font-medium text-zinc-500">Vừa được nhìn thấy</h2>
      <ul className="flex flex-col gap-2">
        {markers.slice(0, 20).map((marker) => {
          const object = catalogById.get(marker.objectId);
          return (
            <li key={marker.id}>
              <button
                type="button"
                onClick={() => onOpen(marker)}
                className="cdp-pressable flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm"
              >
                <ObjectIcon object={object} event={event} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-zinc-900">
                    {objectDisplayName(object, noun)}
                  </span>
                  <span className="block truncate text-[13px] text-zinc-500">
                    Được nhìn thấy {formatAgo(marker.lastSeenAt, now)} · {confidenceLabel(marker)}
                  </span>
                </span>
                <span className="text-zinc-300" aria-hidden="true">›</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * "Tối nay có gì" — nội dung tự sinh từ lượt báo trong đêm (NOTE-05 §10). Không bảng xếp hạng người.
 * myTonight: { objectId, count } — mô hình người này gặp nhiều nhất tối nay (tính từ lịch sử riêng).
 */
export function NightHighlights({ event, night, catalogById, myTonight, onOpen }) {
  const { mostSeen, hardest, mostTraveled } = nightHighlights(night);
  const rows = [
    mostSeen && { key: "most", icon: "🥇", label: "Được nhìn thấy nhiều nhất", ...mostSeen, suffix: `${mostSeen.value} lượt` },
    hardest && { key: "hard", icon: "👀", label: "Khó gặp nhất tối nay", ...hardest, suffix: `${hardest.value} lượt` },
    mostTraveled && { key: "travel", icon: "🗺️", label: "Đi nhiều nơi nhất", ...mostTraveled, suffix: `báo tại ${mostTraveled.value} khu vực` },
    myTonight && myTonight.count > 1 && {
      key: "mine",
      icon: "🙋",
      label: "Bạn gặp nhiều nhất",
      objectId: myTonight.objectId,
      suffix: `${myTonight.count} lần tối nay`,
    },
  ].filter(Boolean);
  if (rows.length === 0) return null;

  return (
    <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="text-[13px] font-medium text-zinc-500">Tối nay có gì</h2>
      <ul className="mt-2 flex flex-col">
        {rows.map((row) => {
          const object = catalogById.get(row.objectId);
          return (
            <li key={row.key}>
              <button
                type="button"
                onClick={() => onOpen(row.objectId)}
                className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-lg py-1.5 text-left"
              >
                <span className="w-6 text-center text-lg" aria-hidden="true">{row.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-zinc-400">{row.label}</span>
                  <span className="block truncate text-sm text-zinc-900">
                    <b className="font-medium">{objectDisplayName(object, event.copy.objectNoun)}</b>
                    <span className="text-zinc-500"> — {row.suffix}</span>
                  </span>
                </span>
                <ObjectIcon object={object} event={event} size="sm" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CollectionCard({ event, object, met, highlight, myCount, communityCount, rarity, onOpen }) {
  const noun = event.copy.objectNoun;
  const mystery = object.kind === OBJECT_KIND.UNKNOWN;
  return (
    <button
      type="button"
      onClick={() => onOpen(object.id)}
      className={`cdp-pressable flex h-full w-full cursor-pointer flex-col items-center rounded-2xl px-2 pb-3 pt-4 text-center shadow-sm transition-colors ${
        met ? "bg-white" : "bg-white/60"
      } ${highlight ? "cdp-game-card-glow" : ""}`}
    >
      <ObjectIcon object={object} event={event} size="md" state={highlight ? "unlocked" : met ? "met" : "locked"} />
      <span
        className={`mt-2 line-clamp-2 text-sm font-medium leading-snug ${met ? "text-zinc-900" : "text-zinc-500"}`}
      >
        {mystery ? `${noun.charAt(0).toUpperCase()}${noun.slice(1)} chưa biết` : objectDisplayName(object, noun)}
      </span>
      {mystery && object.hint && <span className="mt-0.5 line-clamp-2 text-xs text-zinc-400">Gợi ý: {object.hint}</span>}
      <span className={`mt-1.5 text-xs font-medium ${met ? "text-[#a8741a]" : "text-zinc-400"}`}>
        {met ? (myCount > 1 ? `✓ Đã Chạm · ${myCount} lần` : "✓ Đã Chạm") : "Chưa gặp"}
      </span>
      {(rarity || communityCount > 0) && (
        <span className="mt-1.5 flex flex-wrap items-center justify-center gap-1">
          <RarityChip rarity={rarity} />
          {communityCount > 0 && <span className="text-[11px] text-zinc-400">{communityCount} lượt</span>}
        </span>
      )}
    </button>
  );
}

function collectionProgressText(state) {
  // Bộ ẩn giữ bí mật mẫu số tới khi hoàn thành (NOTE-05 §7: "3 / ?").
  if (state.hidden && !state.complete) return `${state.met} / ?`;
  return `${state.met} / ${state.total}`;
}

export function CollectionView({
  event,
  catalog,
  collections,
  resolvedCollection,
  objectStats,
  myCounts,
  rarity,
  justUnlockedId,
  onOpen,
}) {
  const noun = event.copy.objectNoun;
  const visible = collections.filter((state) => state.visible);
  const lockedHidden = collections.filter((state) => state.hidden && !state.unlocked).length;
  const [selectedId, setSelectedId] = useState(visible[0]?.id ?? null);
  const selected = visible.find((state) => state.id === selectedId) ?? visible[0] ?? null;
  const byId = new Map(catalog.map((object) => [object.id, object]));
  const models = (selected?.memberIds ?? []).map((id) => byId.get(id)).filter(Boolean);
  // Bí ẩn mình đã gặp đứng trước, sau đó tới bí ẩn cộng đồng vừa báo (NOTE-04 §12 "Mystery").
  const mysteries = openMysteries(catalog)
    .filter((o) => resolvedCollection[o.id] || objectStats[o.id] > 0)
    .sort((a, b) => Number(Boolean(resolvedCollection[b.id])) - Number(Boolean(resolvedCollection[a.id])))
    .slice(0, MAX_MYSTERY_CARDS);
  const metAny = Object.keys(resolvedCollection).length > 0;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-medium tracking-tight text-zinc-900">{event.copy.collectionTitle}</h2>
      {!metAny && <EmptyState title="Bộ sưu tập của bạn đang trống." body={`Ra ngoài và Chạm ${noun} đầu tiên.`} />}

      {visible.length > 1 && (
        <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          <div className="flex w-max gap-2">
            {visible.map((state) => (
              <button
                key={state.id}
                type="button"
                onClick={() => setSelectedId(state.id)}
                aria-pressed={selected?.id === state.id}
                className={`flex min-h-11 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[13px] transition-colors ${
                  selected?.id === state.id ? "bg-zinc-900 text-white" : "bg-white text-zinc-700 shadow-sm"
                }`}
              >
                <span aria-hidden="true">{state.icon}</span>
                {state.title}
                <span className={selected?.id === state.id ? "text-white/70" : "text-zinc-400"}>
                  {collectionProgressText(state)}
                </span>
                {state.complete && <span aria-label="Đã hoàn thành">✓</span>}
                {state.hidden && <span aria-hidden="true">✨</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {lockedHidden > 0 && (
        <p className="-mt-1 text-[13px] text-zinc-500">
          🔒 Còn {lockedHidden} bộ sưu tập ẩn chưa lộ diện — cứ Chạm tiếp, biết đâu mở ra.
        </p>
      )}

      {selected?.combo && (
        <p className="-mt-1 text-[13px] text-[#8a5a10]">
          Combo {selected.title}: gặp đủ {selected.hidden && !selected.complete ? "cả bộ" : selected.total} {noun} để hoàn thành.
        </p>
      )}

      {models.length > 0 && (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {models.map((object) => (
            <li key={object.id}>
              <CollectionCard
                event={event}
                object={object}
                met={Boolean(resolvedCollection[object.id])}
                highlight={object.id === justUnlockedId}
                myCount={myCounts[object.id] ?? 0}
                communityCount={objectStats[object.id] ?? 0}
                rarity={rarity?.[object.id] ?? null}
                onOpen={onOpen}
              />
            </li>
          ))}
        </ul>
      )}
      {mysteries.length > 0 && (
        <>
          <h3 className="mt-2 text-[13px] font-medium text-zinc-500">{noun.charAt(0).toUpperCase()}{noun.slice(1)} bí ẩn — chưa rõ tên</h3>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {mysteries.map((object) => (
              <li key={object.id}>
                <CollectionCard
                  event={event}
                  object={object}
                  met={Boolean(resolvedCollection[object.id])}
                  highlight={object.id === justUnlockedId}
                  myCount={myCounts[object.id] ?? 0}
                  communityCount={objectStats[object.id] ?? 0}
                  rarity={null}
                  onOpen={onOpen}
                />
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="text-xs leading-5 text-zinc-400">
        Danh sách {noun} mở rộng dần khi cộng đồng ghi nhận thêm. Tên chưa xác minh có thể được CDP sửa lại.
        {event.catalogNote ? ` ${event.catalogNote.text} Nguồn: ${event.catalogNote.source}.` : ""}
      </p>
    </section>
  );
}

export function QuestList({ event, quests, catalogById, onOpen }) {
  if (quests.length === 0) {
    return (
      <EmptyState
        title="Chưa có nhiệm vụ nào lúc này."
        body={`Cứ Chạm thêm ${event.copy.objectNoun} — chỗ nào còn thiếu dữ liệu sẽ tự thành nhiệm vụ mới.`}
      />
    );
  }
  return (
    <section>
      <h2 className="mb-2 text-lg font-medium tracking-tight text-zinc-900">Nhiệm vụ</h2>
      <ul className="flex flex-col gap-2">
        {quests.map((quest) => (
          <li key={quest.id}>
            <button
              type="button"
              onClick={() => onOpen(quest.objectId)}
              className="cdp-pressable flex w-full cursor-pointer items-start gap-3 rounded-2xl bg-white px-4 py-3.5 text-left shadow-sm"
            >
              <span className="text-2xl leading-none" aria-hidden="true">{quest.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium text-zinc-900">{quest.title}</span>
                <span className="mt-0.5 block text-[13px] leading-5 text-zinc-500">{quest.detail}</span>
              </span>
              <ObjectIcon object={catalogById.get(quest.objectId)} event={event} size="sm" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function HistoryList({ event, history, catalogById, now, onOpen }) {
  const noun = event.copy.objectNoun;
  if (history.length === 0) {
    return <EmptyState title="Bạn chưa báo lượt nào." body={`Gặp ${noun} ngoài phố thì bấm nút cam ở dưới nhé.`} />;
  }
  return (
    <section>
      <h2 className="mb-1 text-lg font-medium tracking-tight text-zinc-900">Lịch sử của bạn</h2>
      <p className="mb-3 text-xs leading-5 text-zinc-400">
        Chỉ bạn thấy trang này. Bản đồ công khai không hiện ai đã báo.
      </p>
      <ul className="flex flex-col gap-2">
        {history.map((item) => {
          const object = catalogById.get(item.objectId);
          const sameDay = formatDayMonth(item.createdAt) === formatDayMonth(new Date(now).toISOString());
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onOpen(item.objectId)}
                className="cdp-pressable flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-left shadow-sm"
              >
                <ObjectIcon object={object} event={event} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium text-zinc-900">
                    {objectDisplayName(object, noun)}
                  </span>
                  <span className="block text-[13px] text-zinc-500">
                    {formatClock(item.createdAt)} · {sameDay ? "hôm nay" : formatDayMonth(item.createdAt)}
                    {item.photoStatus === "pending" ? " · ảnh chờ duyệt" : ""}
                    {item.photoStatus === "approved" ? " · ảnh đã duyệt" : ""}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
