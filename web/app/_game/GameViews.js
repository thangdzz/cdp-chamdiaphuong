"use client";

import { ObjectIcon } from "./ObjectIcon";
import { OBJECT_KIND, knownModels, objectDisplayName, openMysteries } from "@/lib/game/catalog";
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

/** "Vừa được nhìn thấy" — danh sách marker tối nay, bấm để bay tới trên bản đồ. */
export function RecentFeed({ event, markers, catalogById, now, onOpen }) {
  const noun = event.copy.objectNoun;
  if (markers.length === 0) {
    return (
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
                <ObjectIcon object={object} categories={event.categories} size="sm" />
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

function CollectionCard({ event, object, met, count, highlight, onOpen }) {
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
      <span className={highlight ? "cdp-game-unlock" : ""}>
        <ObjectIcon object={object} categories={event.categories} size="md" muted={!met} />
      </span>
      <span
        className={`mt-2 line-clamp-2 text-sm font-medium leading-snug ${met ? "text-zinc-900" : "text-zinc-500"}`}
      >
        {mystery ? `${noun.charAt(0).toUpperCase()}${noun.slice(1)} chưa biết` : objectDisplayName(object, noun)}
      </span>
      {mystery && object.hint && <span className="mt-0.5 line-clamp-2 text-xs text-zinc-400">Gợi ý: {object.hint}</span>}
      {!mystery && object.ward && <span className="mt-0.5 truncate text-xs text-zinc-400">{object.ward}</span>}
      <span className={`mt-2 text-xs font-medium ${met ? "text-[#a8741a]" : "text-zinc-400"}`}>
        {met ? "✓ Đã Chạm" : count > 0 ? `${count} lượt báo` : "Chưa gặp"}
      </span>
    </button>
  );
}

export function CollectionView({ event, catalog, resolvedCollection, objectStats, justUnlockedId, onOpen }) {
  const noun = event.copy.objectNoun;
  const models = knownModels(catalog);
  // Bí ẩn mình đã gặp đứng trước, sau đó tới bí ẩn cộng đồng vừa báo (NOTE-04 §12 "Mystery").
  const mysteries = openMysteries(catalog)
    .filter((o) => resolvedCollection[o.id] || objectStats[o.id] > 0)
    .sort((a, b) => Number(Boolean(resolvedCollection[b.id])) - Number(Boolean(resolvedCollection[a.id])))
    .slice(0, MAX_MYSTERY_CARDS);
  const metAny = Object.keys(resolvedCollection).length > 0;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-medium tracking-tight text-zinc-900">{event.copy.collectionTitle}</h2>
      {!metAny && (
        <EmptyState title="Bộ sưu tập của bạn đang trống." body={`Ra ngoài và Chạm ${noun} đầu tiên.`} />
      )}
      {models.length > 0 && (
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {models.map((object) => (
            <li key={object.id}>
              <CollectionCard
                event={event}
                object={object}
                met={Boolean(resolvedCollection[object.id])}
                count={objectStats[object.id] ?? 0}
                highlight={object.id === justUnlockedId}
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
                  count={objectStats[object.id] ?? 0}
                  highlight={object.id === justUnlockedId}
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
              <ObjectIcon object={catalogById.get(quest.objectId)} categories={event.categories} size="sm" />
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
                <ObjectIcon object={object} categories={event.categories} size="sm" />
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
