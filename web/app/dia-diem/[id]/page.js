import { notFound } from "next/navigation";
import { getLivePlaces } from "@/lib/redis";
import { getAllLatestCheckins } from "@/lib/checkins";
import { getAllConsensus } from "@/lib/answers";
import { getAllPublishedNotes, filterVisibleNotes } from "@/lib/notes";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { placeCover, FALLBACK_COVER } from "@/lib/cover";
import { PlaceDetail } from "@/app/PlaceDetail";
import { getClosedPlace } from "@/lib/closedPlaces";

export const dynamic = "force-dynamic";

const SITE_NAME = "Chạm Địa Phương";

// Share MỘT địa điểm phải mở đúng trang địa điểm, không được mượn trang Sổ giả làm sổ 1 chỗ
// (NOTE-02 §1). Dùng thẳng `id` làm đường dẫn — chưa có slug cho địa điểm, và NOTE-02 §11 nói
// rõ không đổi schema lớn chỉ để có URL đẹp.
async function loadPlaceRecord(id) {
  const places = await getLivePlaces();
  const livePlace = places.find((place) => place.id === id);
  if (livePlace) return { place: livePlace, closed: false, replacement: null };

  const closedPlace = await getClosedPlace(id);
  if (!closedPlace) return null;
  const replacement =
    places.find((place) => place.id === closedPlace.replacedByPlaceId) ??
    places.find((place) => place.replacesPlaceId === id) ??
    null;
  return { place: closedPlace, closed: true, replacement };
}

function subtitleOf(place) {
  const type = PLACE_TYPES.find((t) => t.id === place.type)?.label ?? null;
  return [type, place.ward].filter(Boolean).join(" · ");
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const record = await loadPlaceRecord(id);
  if (!record) return { title: `Không tìm thấy địa điểm — ${SITE_NAME}` };
  const { place, closed } = record;

  // NOTE-02 §3: preview chỉ gồm tên, loại + khu vực, ảnh, thương hiệu. KHÔNG đưa số điện
  // thoại, mô tả dài, hay field chưa chắc chắn vào preview.
  const subtitle = subtitleOf(place);
  const cover = placeCover(place) ?? FALLBACK_COVER;
  const description = [subtitle, SITE_NAME].filter(Boolean).join(" · ");

  return {
    title: `${place.name}${closed ? " (đã đóng cửa)" : ""} — ${SITE_NAME}`,
    description,
    openGraph: {
      title: place.name,
      description,
      images: [cover],
    },
  };
}

export default async function PlacePage({ params }) {
  const { id } = await params;
  const record = await loadPlaceRecord(id);
  if (!record) notFound();
  if (record.closed) {
    return (
      <div className="flex flex-1 justify-center">
        <main className="w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          <PlaceDetail place={record.place} closed replacement={record.replacement} />
        </main>
      </div>
    );
  }

  const [latestCheckins, allConsensus, allNotes] = await Promise.all([
    getAllLatestCheckins(),
    getAllConsensus(),
    getAllPublishedNotes(),
  ]);
  const place = record.place;

  const resolved = {
    ...place,
    lastCheckinAt: latestCheckins[place.id] ?? null,
    consensus: allConsensus[place.id] ?? null,
    notes: filterVisibleNotes(allNotes[place.id] ?? []),
  };

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <PlaceDetail place={resolved} />
      </main>
    </div>
  );
}
