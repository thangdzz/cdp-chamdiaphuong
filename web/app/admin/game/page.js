import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { EVENT_PHASE, eventGameLiveAt, eventPhase, listGameEvents, gameEventHref } from "@/lib/game/registry";
import {
  OBJECT_KIND,
  VERIFICATION_LABEL,
  VERIFICATION_STATUSES,
  catalogIndex,
  isUnnamedSlot,
  objectDisplayName,
  objectIcon,
  resolveObjectId,
} from "@/lib/game/catalog";
import { resolveObjectStats } from "@/lib/game/progress";
import { HIDE_AFTER_FLAGS } from "@/lib/game/mapLayer";
import { RISK_FLAGS } from "@/lib/game/riskLimits";
import { adminReadEverything, loadGameEvent } from "@/lib/game/store";
import { formatClock, formatDayMonth } from "@/lib/game/format";
import { EVENT_SOUND_RECIPES, SOUND_SAMPLES, eventSoundRecipe, soundFamilyOf, soundRecipeFor } from "@/lib/game/sounds";
import { MediaImage } from "@/app/MediaImage";
import { SoundPreviewList } from "./SoundPreviewList";
import { IconPreview } from "./IconPreview";
import { badgeHtml, badgeSpec } from "@/lib/game/badge";
import {
  deleteGameSighting,
  matchGameObject,
  reviewSightingPhoto,
  saveGameObject,
  saveGameLiveAt,
  unmatchGameObject,
} from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#c8553d]";
const buttonClass = "cursor-pointer rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white";
const ghostClass = "cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700";

function when(iso) {
  return `${formatClock(iso)} ${formatDayMonth(iso)}`;
}

const SOUND_FAMILIES = ["animal", "history", "folklore", "technology", "traditional", "mystery"];

// "2026-09-18T19:00" theo giờ VN cho ô datetime-local.
function toVnInputValue(iso) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

function ObjectFields({ event, object }) {
  const listId = `icon-keys-${object?.id ?? "new"}`;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm text-zinc-600">
        Tên
        <input name="name" defaultValue={object?.name ?? ""} className={inputClass} />
      </label>
      <label className="text-sm text-zinc-600">
        Icon (khoá trong bộ icon, hoặc gõ emoji)
        <input name="icon" list={listId} defaultValue={object?.icon ?? ""} className={inputClass} />
        <datalist id={listId}>
          {Object.entries(event.iconSet ?? {}).map(([key, spec]) => (
            <option key={key} value={key}>
              {spec.emoji ?? ""} {spec.art}
            </option>
          ))}
        </datalist>
      </label>
      <label className="text-sm text-zinc-600 sm:col-span-2">
        Tag (cách nhau dấu phẩy — sinh bộ sưu tập: animal, dragon, water, history, folklore, legend, culture, technology, sponsor…)
        <input name="tags" defaultValue={(object?.tags ?? []).join(", ")} className={inputClass} />
      </label>
      <label className="text-sm text-zinc-600">
        Nhóm âm thanh
        <select name="soundFamily" defaultValue={object?.soundFamily ?? ""} className={inputClass}>
          <option value="">—</option>
          {SOUND_FAMILIES.map((family) => (
            <option key={family} value={family}>
              {family}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-zinc-600">
        Tiếng mở khoá (nghe thử ở mục &quot;Nghe thử âm thanh&quot;)
        <select name="soundKey" defaultValue={object?.soundKey ?? ""} className={inputClass}>
          <option value="">— theo nhóm âm thanh</option>
          {Object.entries(event.soundSet ?? {}).map(([key, recipe]) => (
            <option key={key} value={key}>
              {recipe.label}
            </option>
          ))}
          {object?.soundKey && !event.soundSet?.[object.soundKey] && (
            <option value={object.soundKey}>{object.soundKey} (không còn trong bộ âm — sẽ dùng tiếng nhóm)</option>
          )}
        </select>
      </label>
      <label className="text-sm text-zinc-600">
        Nhóm
        <select name="category" defaultValue={object?.category ?? ""} className={inputClass}>
          <option value="">—</option>
          {event.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-zinc-600">
        Xác minh
        <select name="verificationStatus" defaultValue={object?.verificationStatus ?? "admin_verified"} className={inputClass}>
          {VERIFICATION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {VERIFICATION_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-zinc-600">
        Phường
        <input name="ward" defaultValue={object?.ward ?? ""} className={inputClass} />
      </label>
      <label className="text-sm text-zinc-600">
        Tổ / khu
        <input name="neighborhood" defaultValue={object?.neighborhood ?? ""} className={inputClass} />
      </label>
      <label className="text-sm text-zinc-600 sm:col-span-2">
        Mô tả ngắn
        <input name="description" defaultValue={object?.description ?? ""} className={inputClass} />
      </label>
      <label className="text-sm text-zinc-600 sm:col-span-2">
        Câu chuyện
        <textarea name="story" rows={2} defaultValue={object?.story ?? ""} className={inputClass} />
      </label>
      <label className="flex items-center gap-2 text-sm text-zinc-600">
        <input type="checkbox" name="hidden" defaultChecked={object?.hidden ?? false} /> Ẩn khỏi game
      </label>
    </div>
  );
}

export default async function GameAdminPage({ searchParams }) {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) redirect("/admin");

  const params = await searchParams;
  const event = (await loadGameEvent(params?.event ?? "")) ?? (await loadGameEvent(listGameEvents()[0].slug));
  const liveAt = eventGameLiveAt(event);
  const phase = eventPhase(event);
  const { catalog, sightings, objectStats, flags } = await adminReadEverything(event);
  const index = catalogIndex(catalog);
  const counts = resolveObjectStats(objectStats, catalog);
  const noun = event.copy.objectNoun;

  const models = catalog.filter((o) => o.kind === OBJECT_KIND.MODEL && !o.matchedTo);
  const unnamedSlots = models.filter((o) => isUnnamedSlot(o));
  const previewItems = models
    .filter((object) => !object.hidden)
    .map((object) => ({
      id: object.id,
      name: objectDisplayName(object, noun),
      badge: badgeHtml(badgeSpec(object, event), { size: 36 }),
      soundFamily: soundFamilyOf(object),
      recipe: soundRecipeFor(object, event),
    }));
  const mysteries = catalog.filter((o) => o.kind === OBJECT_KIND.UNKNOWN && !o.matchedTo && !o.hidden);
  const matched = catalog.filter((o) => o.matchedTo);
  const photosByObject = new Map();
  for (const s of sightings) {
    if (!s.photo || s.photo.status === "rejected") continue;
    const id = resolveObjectId(s.objectId, index);
    photosByObject.set(id, [...(photosByObject.get(id) ?? []), s]);
  }
  const pendingPhotos = sightings.filter((s) => s.photo?.status === "pending");
  const flagged = sightings.filter((s) => Number(flags[s.id]) > 0);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Link href="/admin" className="text-sm text-zinc-500 underline">
        ← Trang duyệt dữ liệu
      </Link>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium text-zinc-900">Game layer · {event.name}</h1>
          <p className="text-sm text-zinc-500">
            {sightings.length} lượt báo · {models.length} slot {noun} ({models.length - unnamedSlots.length} có tên,{" "}
            {unnamedSlots.length} chưa xác định) · {mysteries.length} bí ẩn chưa ghép
          </p>
        </div>
        <Link href={gameEventHref(event)} target="_blank" className={ghostClass}>
          Mở game ↗
        </Link>
      </div>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-900">Giờ mở game thật (NOTE-05)</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Trước giờ này là pre-game: khách chơi thử, bấm báo chỉ ra câu đùa, không ghi dữ liệu. Hiện tại:{" "}
          <b className="font-medium text-zinc-800">
            {phase === EVENT_PHASE.PRE_GAME ? "pre-game" : phase === EVENT_PHASE.LIVE ? "đang live" : phase}
          </b>{" "}
          · mở lúc {when(liveAt)} {event.runtime?.gameLiveAt ? "(admin đã đổi)" : "(mặc định trong code)"}
        </p>
        <form action={saveGameLiveAt} className="mt-3 flex flex-wrap items-end gap-2">
          <input type="hidden" name="slug" value={event.slug} />
          <label className="text-sm text-zinc-600">
            Giờ Việt Nam
            <input type="datetime-local" name="gameLiveAt" defaultValue={toVnInputValue(liveAt)} className={inputClass} />
          </label>
          <button name="mode" value="set" className={buttonClass}>Lưu giờ mở</button>
          <button name="mode" value="now" className={ghostClass}>Mở game ngay</button>
          {event.runtime?.gameLiveAt && (
            <button name="mode" value="reset" className={ghostClass}>Về giờ mặc định</button>
          )}
        </form>
      </section>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-900">Nghe thử âm thanh</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Người chơi nghe tiếng riêng khi Chạm một {noun}{" "}lần đầu; gặp lại chỉ có tiếng xác nhận ngắn. iPhone đang gạt
          chế độ im lặng thì trình duyệt không phát tiếng. Đổi tiếng/nhóm/icon: bấm &quot;Sửa&quot; ở từng dòng.
        </p>
        <SoundPreviewList
          models={previewItems}
          compareGroups={(event.soundCompareGroups ?? []).map((group) => ({
            label: group.label,
            items: group.objectIds.map((id) => previewItems.find((item) => item.id === id)).filter(Boolean),
          }))}
          eventSounds={Object.keys(EVENT_SOUND_RECIPES)
            .filter((name) => name !== "tap-soft")
            .map((name) => ({ id: `event-${name}`, label: EVENT_SOUND_RECIPES[name].label, recipe: eventSoundRecipe(name) }))}
        />
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-zinc-600">
            Nguồn {Object.keys(SOUND_SAMPLES).length} âm thanh thật (đều CC0 — dùng tự do, không cần ghi công)
          </summary>
          <ul className="mt-2 grid gap-1 text-xs text-zinc-500 sm:grid-cols-2">
            {Object.entries(SOUND_SAMPLES).map(([key, sample]) => (
              <li key={key}>
                <b className="font-medium text-zinc-700">{key}</b> ·{" "}
                <a href={sample.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                  {sample.originalFilename}
                </a>{" "}
                · {sample.author} · {sample.license} · tải {sample.downloadedAt}
              </li>
            ))}
          </ul>
        </details>
      </section>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-medium text-zinc-900">Xem trước bộ huy hiệu</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Mỗi {noun}{" "}một hình chính; khung + màu theo nhóm. Đổi hình: bấm &quot;Sửa&quot; ở danh sách âm thanh → ô Icon.
        </p>
        <IconPreview event={event} models={models.filter((object) => !object.hidden)} />
      </section>

      {params?.saved === "1" && <p className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">Đã lưu.</p>}
      {params?.error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{params.error}</p>}

      <section className="mt-8">
        <h2 className="text-lg font-medium text-zinc-900">Ảnh chờ duyệt ({pendingPhotos.length})</h2>
        <p className="text-sm text-zinc-500">Ảnh khách chỉ lên công khai sau khi dùng làm ảnh {noun}.</p>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {pendingPhotos.map((s) => {
            const object = index.get(resolveObjectId(s.objectId, index));
            return (
              <li key={s.id} className="rounded-xl bg-white p-3 shadow-sm">
                <MediaImage src={s.photo.url} alt="" sizes="360px" className="aspect-[4/3] w-full rounded-lg bg-zinc-100" />
                <p className="mt-2 text-sm text-zinc-900">
                  {objectIcon(object, event)} {objectDisplayName(object, noun)}
                </p>
                <p className="text-xs text-zinc-500">{when(s.createdAt)}</p>
                <form action={reviewSightingPhoto} className="mt-2 flex flex-wrap gap-2">
                  <input type="hidden" name="slug" value={event.slug} />
                  <input type="hidden" name="sightingId" value={s.id} />
                  <button name="decision" value="cover" className={buttonClass}>Dùng làm ảnh {noun}</button>
                  <button name="decision" value="approve" className={ghostClass}>Duyệt, chưa dùng</button>
                  <button name="decision" value="reject" className={ghostClass}>Từ chối</button>
                </form>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Bí ẩn chưa ghép ({mysteries.length})</h2>
        <p className="text-sm text-zinc-500">
          Ghép vào {noun} có sẵn, hoặc đặt tên để biến thành {noun} mới. Không sửa sighting cũ — ghép nhầm thì bỏ ghép.
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {mysteries.map((object) => (
            <li key={object.id} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm font-medium text-zinc-900">
                ❓ {objectDisplayName(object, noun)} · {counts[object.id] ?? 0} lượt báo
                {object.createdAt ? ` · tạo ${when(object.createdAt)}` : ""}
              </p>
              {(photosByObject.get(object.id) ?? []).length > 0 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {photosByObject.get(object.id).slice(0, 6).map((s) => (
                    <MediaImage key={s.id} src={s.photo.url} alt="" sizes="96px" className="h-20 w-20 shrink-0 rounded-lg bg-zinc-100" />
                  ))}
                </div>
              )}
              <form action={matchGameObject} className="mt-3 flex flex-wrap items-end gap-2">
                <input type="hidden" name="slug" value={event.slug} />
                <input type="hidden" name="sourceId" value={object.id} />
                <label className="min-w-48 flex-1 text-sm text-zinc-600">
                  Là {noun} nào?
                  <select name="targetId" className={inputClass} defaultValue="">
                    <option value="" disabled>Chọn…</option>
                    {models.map((m) => (
                      <option key={m.id} value={m.id}>{objectIcon(m, event)} {objectDisplayName(m, noun)}</option>
                    ))}
                  </select>
                </label>
                <button className={buttonClass}>Ghép</button>
              </form>
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-zinc-600">Đặt tên thành {noun} mới / thêm gợi ý</summary>
                <form action={saveGameObject} className="mt-3 flex flex-col gap-3">
                  <input type="hidden" name="slug" value={event.slug} />
                  <input type="hidden" name="id" value={object.id} />
                  <input type="hidden" name="kind" value={OBJECT_KIND.UNKNOWN} />
                  <label className="text-sm text-zinc-600">
                    Gợi ý hiển thị khi chưa có tên (VD: Minh Xuân · chủ đề cổ tích)
                    <input name="hint" defaultValue={object.hint ?? ""} className={inputClass} />
                  </label>
                  <ObjectFields event={event} object={object} />
                  <button className={`${buttonClass} self-start`}>Lưu</button>
                </form>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">
          {noun.charAt(0).toUpperCase() + noun.slice(1)} ({models.length} slot)
        </h2>
        <p className="text-sm text-zinc-500">
          Slot &quot;chưa xác định&quot; vẫn tính vào tổng. Biết tên thì mở slot đó, điền tên + icon + tag + tiếng rồi Lưu —
          lượt báo và tiến độ cũ giữ nguyên.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {models.map((object) => (
            <li key={object.id} id={`object-${object.id}`} className="scroll-mt-4 rounded-xl bg-white p-3 shadow-sm">
              <details>
                <summary className="cursor-pointer text-sm text-zinc-900">
                  {objectIcon(object, event)} {objectDisplayName(object, noun)} · {counts[object.id] ?? 0} lượt ·{" "}
                  {VERIFICATION_LABEL[object.verificationStatus]}
                  {object.hidden ? " · đang ẩn" : ""}
                  {object.source === "cdp_seed_placeholder" ? " · tên tạm" : ""}
                  {isUnnamedSlot(object) ? " · slot chờ tên" : ""}
                </summary>
                <form action={saveGameObject} className="mt-3 flex flex-col gap-3">
                  <input type="hidden" name="slug" value={event.slug} />
                  <input type="hidden" name="id" value={object.id} />
                  <ObjectFields event={event} object={object} />
                  <button className={`${buttonClass} self-start`}>Lưu</button>
                </form>
              </details>
            </li>
          ))}
        </ul>
        <details className="mt-3 rounded-xl bg-white p-4 shadow-sm">
          <summary className="cursor-pointer text-sm font-medium text-zinc-900">+ Thêm {noun}</summary>
          <form action={saveGameObject} className="mt-3 flex flex-col gap-3">
            <input type="hidden" name="slug" value={event.slug} />
            <ObjectFields event={event} object={null} />
            <button className={`${buttonClass} self-start`}>Thêm</button>
          </form>
        </details>
      </section>

      {matched.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-medium text-zinc-900">Đã ghép ({matched.length})</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {matched.map((object) => (
              <li key={object.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white p-3 text-sm shadow-sm">
                <span>
                  {objectDisplayName(object, noun)} → {objectDisplayName(index.get(object.matchedTo), noun)}
                </span>
                <form action={unmatchGameObject}>
                  <input type="hidden" name="slug" value={event.slug} />
                  <input type="hidden" name="id" value={object.id} />
                  <button className={ghostClass}>Bỏ ghép</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-medium text-zinc-900">Lượt báo bị báo sai ({flagged.length})</h2>
        <p className="text-sm text-zinc-500">Từ {HIDE_AFTER_FLAGS} lượt báo sai trở lên thì marker tự ẩn khỏi bản đồ.</p>
        <SightingTable event={event} sightings={flagged} index={index} flags={flags} noun={noun} />
      </section>

      <section className="mt-10 mb-12">
        <h2 className="text-lg font-medium text-zinc-900">50 lượt báo gần nhất</h2>
        <SightingTable event={event} sightings={sightings.slice(0, 50)} index={index} flags={flags} noun={noun} />
      </section>
    </main>
  );
}

function SightingTable({ event, sightings, index, flags, noun }) {
  if (sightings.length === 0) return <p className="mt-3 text-sm text-zinc-400">Không có.</p>;
  return (
    <div className="mt-3 overflow-x-auto rounded-xl bg-white shadow-sm">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="text-xs text-zinc-500">
          <tr>
            <th className="px-3 py-2 font-normal">Lúc</th>
            <th className="px-3 py-2 font-normal">{noun}</th>
            <th className="px-3 py-2 font-normal">Vị trí</th>
            <th className="px-3 py-2 font-normal">Người báo</th>
            <th className="px-3 py-2 font-normal" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {sightings.map((s) => {
            const object = index.get(resolveObjectId(s.objectId, index));
            return (
              <tr key={s.id}>
                <td className="px-3 py-2 text-zinc-500">{when(s.createdAt)}</td>
                <td className="px-3 py-2">
                  {objectIcon(object, event)} {objectDisplayName(object, noun)}
                  {Number(flags[s.id]) > 0 ? ` · ⚑ ${flags[s.id]}` : ""}
                  {s.photo ? " · 📷" : ""}
                </td>
                <td className="px-3 py-2">
                  <a
                    className="text-zinc-600 underline"
                    target="_blank"
                    rel="noreferrer"
                    href={`https://www.openstreetmap.org/?mlat=${s.lat}&mlon=${s.lng}#map=18/${s.lat}/${s.lng}`}
                  >
                    {s.lat.toFixed(4)}, {s.lng.toFixed(4)}
                  </a>
                  <span className="text-xs text-zinc-400">
                    {" "}
                    · {s.locationSource === "manual" ? "ghim tay" : "GPS"}
                    {s.accuracy ? ` ±${s.accuracy}m` : ""}
                    {/* Giờ ĐO trên máy người chơi — lệch nhiều so với "Lúc" là dấu hiệu bất thường. */}
                    {s.measuredAt ? ` · đo ${when(s.measuredAt)}` : " · chưa có giờ đo"}
                  </span>
                </td>
                <td className="px-3 py-2 text-xs text-zinc-400">
                  {s.anonId.slice(0, 10)}…
                  {s.device ? <span className="block">{s.device}</span> : null}
                  {/* Dấu máy/mạng: nhiều danh tính khác nhau mà TRÙNG dấu này là đáng nhìn. */}
                  {s.riskKey ? <span className="block text-zinc-300">máy {s.riskKey.slice(0, 6)}</span> : null}
                  {s.riskFlags?.length ? (
                    <span className="mt-1 block text-[#8a3b28]">
                      {s.riskFlags.map((flag) => RISK_FLAGS[flag] ?? flag).join(" · ")}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2 text-right">
                  <form action={deleteGameSighting}>
                    <input type="hidden" name="slug" value={event.slug} />
                    <input type="hidden" name="sightingId" value={s.id} />
                    <button className="cursor-pointer text-xs text-red-600 underline">Xoá</button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
