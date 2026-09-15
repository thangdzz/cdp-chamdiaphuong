import { BADGE_FRAMES, ICON_ART_LICENSE, artCredit, badgeHtml, badgeSpec } from "@/lib/game/badge";
import { OBJECT_KIND, objectDisplayName } from "@/lib/game/catalog";

// Duyệt bộ huy hiệu trước deploy (NOTE-07 §12): 45 icon ở 32/48/64px, các trạng thái, và chế độ
// ảnh thật + icon góc trên trái. Render phía server, không cần JS.

function Badge({ spec, size, state = "plain", shape, className = "" }) {
  return (
    <span
      className={`inline-flex ${className}`}
      dangerouslySetInnerHTML={{ __html: badgeHtml(spec, { size, state, shape }) }}
    />
  );
}

export function IconPreview({ event, models }) {
  const noun = event.copy.objectNoun;
  const mysterySpec = badgeSpec({ kind: OBJECT_KIND.UNKNOWN }, event);
  const credits = new Map();
  for (const object of models) {
    const spec = badgeSpec(object, event);
    const credit = spec.art ? artCredit(spec.art) : null;
    if (credit?.url) credits.set(spec.art, credit);
  }

  return (
    <div className="mt-3 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-medium text-zinc-700">Khung theo nhóm + bí ẩn</h3>
        <ul className="mt-2 flex flex-wrap gap-3">
          {event.categories.map((category) => {
            const sample = models.find((object) => object.category === category.id) ?? { category: category.id };
            return (
              <li key={category.id} className="flex w-28 flex-col items-center gap-1 text-center text-xs text-zinc-500">
                <Badge spec={badgeSpec(sample, event)} size={56} state="met" />
                <span>{category.label}</span>
                <span className="text-[11px] text-zinc-400">{BADGE_FRAMES[category.frame]?.label ?? "—"}</span>
              </li>
            );
          })}
          <li className="flex w-28 flex-col items-center gap-1 text-center text-xs text-zinc-500">
            <Badge spec={mysterySpec} size={56} />
            <span>{noun} người chơi báo &quot;không biết tên&quot;</span>
          </li>
          <li className="flex w-28 flex-col items-center gap-1 text-center text-xs text-zinc-500">
            <span className="flex h-14 items-center">
              <Badge spec={badgeSpec(models[0], event)} size={44} shape="circle" />
            </span>
            <span>Marker bản đồ (tròn)</span>
          </li>
        </ul>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((object) => {
          const spec = badgeSpec(object, event);
          return (
            <li key={object.id} className="rounded-xl bg-zinc-50 p-3">
              <p className="truncate text-sm font-medium text-zinc-800">{objectDisplayName(object, noun)}</p>
              <p className="truncate text-[11px] text-zinc-400">
                {object.icon ?? "—"} · {spec.art ?? `emoji ${spec.emoji}`}
              </p>
              <div className="mt-2 flex items-end gap-2" title="32 / 48 / 64 px">
                <Badge spec={spec} size={32} state="met" />
                <Badge spec={spec} size={48} state="met" />
                <Badge spec={spec} size={64} state="met" />
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-zinc-400">
                <span className="flex flex-col items-center gap-0.5">
                  <Badge spec={spec} size={40} state="locked" />
                  chưa gặp
                </span>
                <span className="flex flex-col items-center gap-0.5">
                  <Badge spec={spec} size={40} state="met" />
                  đã gặp
                </span>
                <span className="flex flex-col items-center gap-0.5">
                  <Badge spec={spec} size={40} state="met" className="cdp-badge--preview-glow" />
                  vừa mở
                </span>
                {/* Ảnh mẫu (chưa có ảnh thật) để xem icon đè góc trên trái có rõ không. */}
                <span className="flex flex-col items-center gap-0.5">
                  <span className="relative block h-10 w-14 overflow-hidden rounded-md bg-[linear-gradient(135deg,#3b2a1a_0%,#c8753d_45%,#f2c14e_70%,#2a1d3a_100%)]">
                    <span className="absolute left-0.5 top-0.5 flex rounded-full bg-black/30 p-px ring-1 ring-white/70">
                      <Badge spec={spec} size={20} />
                    </span>
                  </span>
                  ảnh + icon
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      <details>
        <summary className="cursor-pointer text-sm text-zinc-600">
          Nguồn hình ({credits.size} hình từ {ICON_ART_LICENSE.source}, {ICON_ART_LICENSE.name} — bắt buộc ghi công)
        </summary>
        <ul className="mt-2 grid gap-1 text-xs text-zinc-500 sm:grid-cols-2">
          {[...credits.entries()].map(([name, credit]) => (
            <li key={name}>
              <a href={credit.url} target="_blank" rel="noreferrer" className="underline">
                {name}
              </a>{" "}
              · {credit.author}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
