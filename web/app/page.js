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

        {/* Đầu trang nói bằng nhu cầu thật thay vì mô tả sản phẩm (NOTE-01 §2) — câu chữ do
            anh chốt 2026-09-08. Trước đó chỉ có 1 dòng "Chỗ ăn, chỗ ngủ đáng tin... bản thử
            nghiệm", người mới vào không hiểu "sổ" là gì và dùng để làm gì. */}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Gom chỗ hay. Chia sẻ dễ dàng.
        </h1>
        <p className="mt-2 mb-6 text-sm leading-relaxed text-zinc-500">
          Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.
        </p>

        <Link
          href="/le-hoi-thanh-tuyen"
          className="mb-6 block overflow-hidden rounded-xl shadow-sm"
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
            {/* Lớp phủ phải đủ đậm tới giữa ảnh: chữ giờ 2 dòng (NOTE-01 §4.2 đổi sang câu
                theo nhu cầu thật), dòng dưới từng đè lên vùng sáng của mô hình đèn nên khó đọc. */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-lg font-medium tracking-tight text-white">
                Đi Thành Tuyên 20/9?
              </p>
              <p className="text-sm text-white/90">
                Chỗ gửi xe, ăn tối, cafe nghỉ chân và chỗ ngủ quanh khu lễ hội →
              </p>
            </div>
          </div>
        </Link>

        <PlaceExplorer places={places} />
      </main>
    </div>
  );
}
