import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoute, resolveRouteStops, stopTitle, transportModeLabel, TRANSPORT_MODES } from "@/lib/routes";
import { routeMapsUrl, stopMapsQuery } from "@/lib/mapsUrl";
import { formatStayDuration } from "@/lib/durationFormat";
import { SiteHeader } from "@/app/SiteHeader";
import { RouteOwnerActions } from "@/app/RouteOwnerActions";
import { formatPriceCompact } from "@/lib/priceFormat";
import { StopBadge } from "@/app/StopBadge";

export const dynamic = "force-dynamic";

// Trang xem lộ trình của CHÍNH chủ (bản sống, đổi theo mỗi lần sửa). Link đem đi chia sẻ là
// một trang khác hẳn: /lo-trinh/xem/{token}, đọc từ bản chụp đóng băng (CDP_P1-P8 §P6).
export const metadata = {
  title: "Lộ trình — Chạm Địa Phương",
  // Bản sống của riêng chủ, không phải thứ để bot quét và đưa lên tìm kiếm.
  robots: { index: false },
};

export default async function RouteViewPage({ params }) {
  const { slug } = await params;
  const route = await getRoute(slug);
  if (!route) notFound();

  const stops = await resolveRouteStops(route.stops);
  const mapsMode = TRANSPORT_MODES.find((m) => m.id === route.transportMode)?.mapsMode ?? "driving";
  // Điểm đề xuất cũng phải vào được link Google Maps — bỏ qua thì lộ trình mở ra thiếu chặng.
  const mapsQueries = stops.map((s) => ({ mapsQuery: stopMapsQuery(s) }));
  const maps = routeMapsUrl(mapsQueries, mapsMode);
  // Điểm riêng chưa khai địa chỉ thì Google không tra nổi, nên nó rơi khỏi link — nói thẳng
  // ra thay vì để khách mở link rồi mới phát hiện thiếu chặng.
  const missingAddress = stops.filter((s, i) => !mapsQueries[i].mapsQuery).length;

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />

        <header className="mb-4">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">{route.title}</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {[`${stops.length} điểm`, transportModeLabel(route.transportMode)].filter(Boolean).join(" · ")}
          </p>
        </header>

        <RouteOwnerActions slug={slug} stopCount={stops.length} />

        {stops.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Lộ trình chưa có điểm nào. Bấm &quot;Sửa lộ trình&quot; để thêm.
          </p>
        ) : (
          <ol className="flex flex-col gap-2">
            {stops.map((stop, index) => (
              <RouteStopRow key={index} stop={stop} index={index} />
            ))}
          </ol>
        )}

        {/* §P7 giai đoạn 1 + §P8 "CDP lo kế hoạch, Google lo đường" — CDP giữ danh sách và thứ
            tự, việc dẫn đường giao hẳn cho Google. */}
        {maps && (
          <div className="mt-5">
            <a
              href={maps.url}
              target="_blank"
              rel="noopener noreferrer"
              className="cdp-pressable block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
            >
              Mở toàn bộ lộ trình trên Google Maps
            </a>
            {maps.omitted > 0 && (
              <p className="mt-1.5 text-center text-xs text-zinc-400">
                Google Maps chỉ nhận 11 điểm — {maps.omitted} điểm giữa không nằm trong link này.
              </p>
            )}
            {missingAddress > 0 && (
              <p className="mt-1.5 text-center text-xs text-zinc-400">
                {missingAddress} điểm riêng chưa có địa chỉ nên không vào được link. Thêm địa chỉ
                ở trang sửa lộ trình.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function RouteStopRow({ stop, index }) {
  const price = stop.place ? formatPriceCompact(stop.place) : null;
  const subtitle = stop.place
    ? [stop.place.ward, price ? `${price.compact}${price.unitText}` : null].filter(Boolean).join(" · ")
    : stop.deleted
      ? "Chỗ này không còn trong danh bạ"
      : (stop.proposal?.ward ?? null);

  return (
    <li className="flex gap-3 rounded-xl bg-white px-[18px] py-4 shadow-sm">
      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-medium text-white">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {stop.plannedAt && (
            <span className="text-sm font-medium tabular-nums text-zinc-900">{stop.plannedAt}</span>
          )}
          <span className={`text-base font-medium ${stop.deleted ? "text-zinc-400" : "text-zinc-900"}`}>
            {stop.placeId && !stop.deleted ? (
              <Link href={`/dia-diem/${stop.placeId}`} className="underline decoration-zinc-300">
                {stopTitle(stop)}
              </Link>
            ) : (
              stopTitle(stop)
            )}
          </span>
        </div>
        {subtitle && <p className="mt-0.5 text-[13px] text-zinc-500">{subtitle}</p>}
        <StopBadge type={stop.type} />
        {stop.durationMinutes && (
          <p className="mt-0.5 text-[13px] text-zinc-500">{formatStayDuration(stop.durationMinutes)}</p>
        )}
        {stop.note && <p className="mt-1 text-sm text-zinc-700">💬 {stop.note}</p>}
      </div>
    </li>
  );
}
