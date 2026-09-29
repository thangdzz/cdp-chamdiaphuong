import { getLivePlaces } from "@/lib/redis";
import { getAllLatestCheckins } from "@/lib/checkins";
import { getAllLocationConsensus } from "@/lib/locationVotes";
import { isPlaceExpired } from "@/lib/placeValidity";
import { readNow } from "@/lib/events";
import { filterPlaces, sortByReliability } from "@/lib/placeFilter";
import { toResultItem } from "@/lib/searchResults";
import { Suspense } from "react";
import { SearchResults } from "./SearchResults";

// Trang kết quả tìm kiếm — vNext bước 2 (SCOPE-vNext "Search / Khám phá"). Tách khỏi trang chủ để
// trang chủ không còn là một danh bạ dài. Đọc cùng nguồn dữ liệu như trang chủ cũ, nhưng chỉ gửi
// xuống trình duyệt bản gọn của mỗi chỗ (lib/searchResults.js).
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tìm chỗ — Chạm Địa Phương",
  description: "Tìm chỗ ăn, chơi, ngủ, đi lại ở Tuyên Quang — kèm lần gần nhất có người xác nhận còn mở.",
};

export default async function SearchPage() {
  const [livePlaces, latestCheckins, allLocationConsensus, now] = await Promise.all([
    getLivePlaces(),
    getAllLatestCheckins(),
    getAllLocationConsensus(),
    readNow(),
  ]);

  // Chỗ tạm đã hết ngày thì thôi bày (NOTE-15 §13) — cùng luật với trang chủ cũ.
  const items = sortByReliability(
    livePlaces
      .filter((p) => !isPlaceExpired(p, now))
      .map((p) => ({
        ...p,
        lastCheckinAt: latestCheckins[p.id] ?? null,
        // Vị trí khách đã cùng xác nhận quyết định nút là "Chỉ đường" hay "Tìm trên Google Maps".
        locationConsensus: allLocationConsensus[p.id] ?? null,
      }))
  );
  // Chỉ loại "xem được" mới lên danh sách (bỏ "Chỗ quen gọi") — lọc sẵn ở máy chủ cho gọn gói gửi.
  const browsable = filterPlaces(items).map(toResultItem);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-3 text-2xl font-semibold tracking-tight text-zinc-900">Tìm chỗ</h1>
        {/* SearchResults đọc bộ lọc từ URL bằng useSearchParams — Next yêu cầu bọc Suspense. */}
        <Suspense>
          <SearchResults items={browsable} now={now} />
        </Suspense>
      </main>
    </div>
  );
}
