import { notFound } from "next/navigation";
import Link from "next/link";
import { getRoute, resolveRouteStops, stopFullAddress, stopTitle, transportModeLabel, STOP_TYPES, TRANSPORT_MODES } from "@/lib/routes";
import { REQUIRE_VERIFIED_LOCATION, routeMapsUrl, stopRouteTarget, stopTextTarget } from "@/lib/mapsUrl";
import { isPickupService, pickupSelectionLabel, stopNeedsPickupSelection } from "@/lib/pickupPoints";
import { formatStayDuration } from "@/lib/durationFormat";
import { RouteOwnerActions } from "@/app/RouteOwnerActions";
import { OwnerBackLink } from "@/app/OwnerBackLink";
import { formatPriceCompact } from "@/lib/priceFormat";
import { StopBadge } from "@/app/StopBadge";
import { MediaImage } from "@/app/MediaImage";
import { placeNavigationMedia } from "@/lib/media";

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
  // Spec Location-Routing §3, §10: chỉ điểm ĐÃ XÁC MINH vị trí mới là định danh dẫn đường. Điểm chưa
  // xác minh tạm vào link bằng chữ (REQUIRE_VERIFIED_LOCATION) nhưng phải được kể tên bên dưới —
  // không bao giờ im lặng bỏ điểm.
  const targets = stops.map(stopRouteTarget);
  const points = stops.map((stop, i) =>
    targets[i] ?? (REQUIRE_VERIFIED_LOCATION ? null : stopTextTarget(stop))
  );
  // NOTE-14 §17: còn dịch vụ đón khách chưa chọn điểm đón thì KHÔNG đưa link Maps — mở ra sẽ thiếu đúng
  // chặng lên xe. Chặn lại và dẫn thẳng tới chỗ chọn.
  const missingPickupIndex = stops.findIndex(stopNeedsPickupSelection);
  const maps = missingPickupIndex === -1 ? routeMapsUrl(points, mapsMode) : null;
  // Ba mức, nói rõ từng mức thay vì gộp thành một câu chung chung:
  const unverified = stops
    .map((stop, i) => ({ stop, i }))
    .filter(({ stop, i }) => !targets[i] && !stopNeedsPickupSelection(stop) && !stop.deleted);
  const unroutable = unverified.filter(({ i }) => !points[i]);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <OwnerBackLink kind="route" slug={slug} />

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

        {missingPickupIndex !== -1 && (
          <div role="alert" className="mt-5 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
            <p className="text-sm font-medium text-amber-900">
              Chọn điểm đón cho {stopTitle(stops[missingPickupIndex])} trước khi mở Google Maps.
            </p>
            <Link
              href={`/lo-trinh/${slug}/sua#stop-${missingPickupIndex + 1}`}
              className="cdp-pressable mt-2 inline-flex min-h-11 items-center rounded-lg bg-[#c8553d] px-4 text-sm font-medium text-white"
            >
              Chọn điểm đón
            </Link>
          </div>
        )}

        {/* §P7 giai đoạn 1 + §P8 "CDP lo kế hoạch, Google lo đường" — CDP giữ danh sách và thứ
            tự, việc dẫn đường giao hẳn cho Google. */}
        {maps && (
          <div className="mt-5 flex flex-col gap-2">
            {/* §11: lộ trình dài hơn sức chứa của một link Maps thì chia chặng nối đuôi nhau,
                điểm cuối chặng trước là điểm đầu chặng sau — không hụt đoạn nào. */}
            {maps.legs.length === 1 ? (
              <a
                href={maps.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cdp-pressable block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
              >
                Mở toàn bộ lộ trình trên Google Maps
              </a>
            ) : (
              <>
                <p className="text-center text-xs text-zinc-500">
                  Lộ trình dài hơn sức chứa của một link Google Maps — chia thành {maps.legs.length} chặng.
                </p>
                {maps.legs.map((leg, index) => (
                  <a
                    key={index}
                    href={leg.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cdp-pressable block w-full rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
                  >
                    Mở chặng {index + 1} trên Google Maps (điểm {leg.from + 1} → {leg.to + 1})
                  </a>
                ))}
              </>
            )}
          </div>
        )}

        {/* Spec §10: KHÔNG im lặng bỏ điểm. Kể tên từng chỗ chưa chắc vị trí, kèm đường đi sửa. */}
        {unverified.length > 0 && (
          <div className="mt-3 rounded-xl bg-amber-50 px-4 py-3 ring-1 ring-amber-200">
            <p className="text-sm font-medium text-amber-900">
              {unverified.length} điểm chưa xác nhận vị trí chính xác
            </p>
            <ul className="mt-1 list-inside list-disc text-[13px] text-amber-900">
              {unverified.map(({ stop, i }) => (
                <li key={i}>
                  {i + 1}. {stopTitle(stop)}
                  {!points[i] && " — chưa đủ dữ liệu, không nằm trong link"}
                </li>
              ))}
            </ul>
            <p className="mt-1 text-xs text-amber-800">
              {unroutable.length === unverified.length
                ? "Google Maps chưa dẫn tới được những chỗ này."
                : "Google Maps đang tự đoán những chỗ này theo tên và địa chỉ, có thể lệch."}{" "}
              Ghim đúng vị trí ở trang sửa lộ trình để dẫn đường chính xác.
            </p>
            <Link
              href={`/lo-trinh/${slug}/sua#stop-${unverified[0].i + 1}`}
              className="cdp-pressable mt-2 inline-flex min-h-11 items-center rounded-lg bg-[#c8553d] px-4 text-sm font-medium text-white"
            >
              Xác nhận vị trí
            </Link>
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
  const address = stopFullAddress(stop);
  const navigationMedia = stop.place ? placeNavigationMedia(stop.place) : null;

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
        {/* Điểm riêng hiện địa chỉ đầy đủ ngay dưới tên, cùng kiểu với dòng "Đón tại" của dịch vụ
            đón khách: đó là thứ Google sẽ nhận, nhìn thấy mới biết nó đúng hay sai. */}
        {stop.type === STOP_TYPES.CUSTOM && (
          <p className={`mt-0.5 text-[13px] ${address ? "text-zinc-700" : "font-medium text-amber-700"}`}>
            {address
              ? `📍 ${address}`
              : stop.customProvince
                ? `Chưa có địa chỉ — Google Maps chỉ tìm theo tên trong ${stop.customProvince}`
                : "Chưa có địa chỉ và tỉnh/thành — chưa mở đường đi tới đây được"}
          </p>
        )}
        {/* NOTE-14 §12: dịch vụ đón khách hiện điểm đón thật, không để khách tưởng xe đón ở địa chỉ service. */}
        {stop.place && isPickupService(stop.place) && (
          <p className={`mt-0.5 text-[13px] ${stop.pickupSelection ? "text-zinc-700" : "font-medium text-amber-700"}`}>
            {stop.pickupSelection ? `📍 Đón tại: ${pickupSelectionLabel(stop.pickupSelection)}` : "Chưa chọn điểm đón"}
          </p>
        )}
        <StopBadge type={stop.type} />
        {stop.durationMinutes && (
          <p className="mt-0.5 text-[13px] text-zinc-500">{formatStayDuration(stop.durationMinutes)}</p>
        )}
        {stop.note && <p className="mt-1 text-sm text-zinc-700">💬 {stop.note}</p>}
      </div>
      {navigationMedia && (
        <MediaImage
          media={navigationMedia}
          className="h-16 w-16 shrink-0 rounded-lg bg-zinc-100 sm:h-20 sm:w-20"
          sizes="(max-width: 639px) 64px, 80px"
        />
      )}
    </li>
  );
}
