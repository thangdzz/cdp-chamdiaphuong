import { notFound } from "next/navigation";
import { getLivePlaces } from "@/lib/redis";
import { getAllLatestCheckins } from "@/lib/checkins";
import { getAllConsensus } from "@/lib/answers";
import { getAllPublishedNotes, filterVisibleNotes } from "@/lib/notes";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { PlaceDetail } from "@/app/PlaceDetail";
import { SiteHeader } from "@/app/SiteHeader";

export const dynamic = "force-dynamic";

const SITE_NAME = "Chạm Địa Phương";
const FALLBACK_OG_IMAGE = "/images/le-hoi-thanh-tuyen-2026.jpg";

// Share MỘT địa điểm phải mở đúng trang địa điểm, không được mượn trang Sổ giả làm sổ 1 chỗ
// (NOTE-02 §1). Dùng thẳng `id` làm đường dẫn — chưa có slug cho địa điểm, và NOTE-02 §11 nói
// rõ không đổi schema lớn chỉ để có URL đẹp.
async function loadPlace(id) {
  const places = await getLivePlaces();
  return places.find((p) => p.id === id) ?? null;
}

function subtitleOf(place) {
  const type = PLACE_TYPES.find((t) => t.id === place.type)?.label ?? null;
  return [type, place.ward].filter(Boolean).join(" · ");
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const place = await loadPlace(id);
  if (!place) return { title: `Không tìm thấy địa điểm — ${SITE_NAME}` };

  // NOTE-02 §3: preview chỉ gồm tên, loại + khu vực, ảnh, thương hiệu. KHÔNG đưa số điện
  // thoại, mô tả dài, hay field chưa chắc chắn vào preview.
  const subtitle = subtitleOf(place);
  const cover = place.photos?.[0] ?? place.menuPhotos?.[0]?.url ?? FALLBACK_OG_IMAGE;
  const description = [subtitle, SITE_NAME].filter(Boolean).join(" · ");

  return {
    title: `${place.name} — ${SITE_NAME}`,
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
  const [place, latestCheckins, allConsensus, allNotes] = await Promise.all([
    loadPlace(id),
    getAllLatestCheckins(),
    getAllConsensus(),
    getAllPublishedNotes(),
  ]);
  if (!place) notFound();

  const resolved = {
    ...place,
    lastCheckinAt: latestCheckins[place.id] ?? null,
    consensus: allConsensus[place.id] ?? null,
    notes: filterVisibleNotes(allNotes[place.id] ?? []),
  };

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        {/* NOTE-02 §9: người nhận link cần hiểu ĐỊA ĐIỂM trước, nên các nút cá nhân
            ("Ghi chú của tôi" / "Sổ của tôi") hạ cấp thị giác ở trang này — vẫn giữ, không xoá. */}
        <SiteHeader quiet />
        <PlaceDetail place={resolved} />
      </main>
    </div>
  );
}
