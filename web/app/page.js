import Image from "next/image";
import Link from "next/link";
import { getLivePlaces } from "@/lib/redis";
import PlaceExplorer from "./PlaceExplorer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const places = await getLivePlaces();

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-zinc-900">
            Chạm Địa Phương
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Chỗ ăn, chỗ ngủ đáng tin ở TP Tuyên Quang — bản thử nghiệm.
          </p>
        </header>

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
