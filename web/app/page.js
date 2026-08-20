import Image from "next/image";
import Link from "next/link";
import { getLivePlaces } from "@/lib/redis";
import { getAllLatestCheckins } from "@/lib/checkins";
import { getAllConsensus } from "@/lib/answers";
import { getAllPublishedNotes, filterVisibleNotes } from "@/lib/notes";
import PlaceExplorer from "./PlaceExplorer";
import { SiteHeader } from "./SiteHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [livePlaces, latestCheckins, allConsensus, allNotes] = await Promise.all([
    getLivePlaces(),
    getAllLatestCheckins(),
    getAllConsensus(),
    getAllPublishedNotes(),
  ]);
  const places = livePlaces.map((p) => ({
    ...p,
    lastCheckinAt: latestCheckins[p.id] ?? null,
    consensus: allConsensus[p.id] ?? null,
    notes: filterVisibleNotes(allNotes[p.id] ?? []),
  }));

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />
        <p className="mb-6 text-sm text-zinc-500">
          Chỗ ăn, chỗ ngủ đáng tin ở TP Tuyên Quang — bản thử nghiệm.
        </p>

        <Link
          href="/le-hoi-thanh-tuyen"
          className="mb-6 block overflow-hidden rounded-2xl shadow-sm"
        >
          <div className="relative h-40 w-full sm:h-52">
            <Image
              src="/images/le-hoi-thanh-tuyen-2026.jpg"
              alt="Lễ hội Thành Tuyên 2026"
              fill
              priority
              sizes="(max-width: 640px) 100vw, 576px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-lg font-bold text-white">
                Lễ hội Thành Tuyên 2026
              </p>
              <p className="text-sm text-white/90">
                19 – 25/9/2026 · Xem chi tiết lễ hội →
              </p>
            </div>
          </div>
        </Link>

        <PlaceExplorer places={places} />
      </main>
    </div>
  );
}
