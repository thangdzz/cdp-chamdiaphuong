import { notFound } from "next/navigation";
import Link from "next/link";
import { getShareSnapshot } from "@/lib/routeShare";
import { routeMapsUrl } from "@/lib/mapsUrl";
import { TRANSPORT_MODES, transportModeLabel } from "@/lib/routes";
import { SiteHeader } from "@/app/SiteHeader";
import { FALLBACK_COVER } from "@/lib/cover";
import { StopBadge } from "@/app/StopBadge";

export const dynamic = "force-dynamic";

const SITE_NAME = "Chạm Địa Phương";

// Trang MỞ TỪ LINK CHIA SẺ — đọc hoàn toàn từ bản chụp (CDP_P1-P8 §P6), KHÔNG tra lại lộ trình
// gốc hay places:live. Nhờ vậy chủ lộ trình sửa/xoá gì về sau thì người đã nhận link vẫn xem
// được đúng thứ được gửi.
export async function generateMetadata({ params }) {
  const { token } = await params;
  const shared = await getShareSnapshot(token);
  if (!shared) return { title: `Không tìm thấy lộ trình — ${SITE_NAME}` };

  const { snapshot } = shared;
  const description = [`${snapshot.stops.length} điểm`, transportModeLabel(snapshot.transportMode), SITE_NAME]
    .filter(Boolean)
    .join(" · ");
  return {
    title: `${snapshot.title} — ${SITE_NAME}`,
    description,
    openGraph: { title: snapshot.title, description, images: [FALLBACK_COVER] },
  };
}

export default async function SharedRoutePage({ params }) {
  const { token } = await params;
  const shared = await getShareSnapshot(token);
  if (!shared) notFound();

  const { snapshot } = shared;
  const mapsMode = TRANSPORT_MODES.find((m) => m.id === snapshot.transportMode)?.mapsMode ?? "driving";
  const maps = routeMapsUrl(snapshot.stops, mapsMode);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        {/* Người nhận link cần hiểu LỘ TRÌNH trước, nên các nút cá nhân hạ cấp thị giác —
            cùng cách trang địa điểm làm (NOTE-02 §9). */}
        <SiteHeader quiet />

        <header className="mb-5">
          <h1 className="text-2xl font-semibold tracking-tight leading-snug text-zinc-900">
            {snapshot.title}
          </h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {[`${snapshot.stops.length} điểm`, transportModeLabel(snapshot.transportMode)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </header>

        <ol className="flex flex-col gap-2">
          {snapshot.stops.map((stop, index) => (
            <li key={index} className="flex gap-3 rounded-xl bg-white px-[18px] py-4 shadow-sm">
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  {stop.plannedAt && (
                    <span className="text-sm font-medium tabular-nums text-zinc-900">{stop.plannedAt}</span>
                  )}
                  <span className="text-base font-medium text-zinc-900">
                    {stop.placeId ? (
                      <Link href={`/dia-diem/${stop.placeId}`} className="underline decoration-zinc-300">
                        {stop.title}
                      </Link>
                    ) : (
                      stop.title
                    )}
                  </span>
                </div>
                {stop.subtitle && <p className="mt-0.5 text-[13px] text-zinc-500">{stop.subtitle}</p>}
                <StopBadge type={stop.type} />
                {stop.durationMinutes && (
                  <p className="mt-0.5 text-[13px] text-zinc-500">Khoảng {stop.durationMinutes} phút</p>
                )}
                {stop.note && <p className="mt-1 text-sm text-zinc-700">💬 {stop.note}</p>}
              </div>
            </li>
          ))}
        </ol>

        {maps && (
          <div className="mt-5">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cdp-pressable block w-full rounded-lg bg-[#c8553d] px-4 py-2.5 text-center text-sm font-medium text-white"
            >
              Mở toàn bộ lộ trình trên Google Maps
            </a>
            {maps.omitted > 0 && (
              <p className="mt-1.5 text-center text-xs text-zinc-400">
                Google Maps chỉ nhận 11 điểm — {maps.omitted} điểm giữa không nằm trong link này.
              </p>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-zinc-400">
          Lộ trình được chia sẻ qua <Link href="/" className="underline">Chạm Địa Phương</Link>
        </p>
      </main>
    </div>
  );
}
