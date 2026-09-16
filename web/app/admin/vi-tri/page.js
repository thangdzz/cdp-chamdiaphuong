import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces } from "@/lib/redis";
import { getPlaceTypeLabel } from "@/lib/placeTypes";
import { coordinatesOf } from "@/lib/coordinates";
import { isLocationVerified, locationOf } from "@/lib/placeLocation";
import { LocationQueue } from "./LocationQueue";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vị trí địa điểm — Admin" };

// Bảng xác minh vị trí (spec Location-Routing §13). Lối vào duy nhất để 234 địa điểm cũ có toạ độ
// thật mà không phải mở form sửa của từng chỗ.
export default async function PlaceLocationsPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) redirect("/admin");

  const live = await getLivePlaces();
  const verified = live.filter(isLocationVerified);
  // Chỗ đã có sẵn toạ độ (nguồn nhập, link Maps) nhưng chưa ai xác nhận lên trước: chỉ cần liếc
  // bản đồ là xong, nhanh hơn chỗ chưa có gì.
  const pending = live
    .filter((place) => !isLocationVerified(place))
    .map((place) => {
      const coordinates = coordinatesOf(place);
      return {
        id: place.id,
        name: place.name,
        address: place.address ?? null,
        ward: place.ward ?? null,
        typeLabel: getPlaceTypeLabel(place.type),
        coordinates,
        hasCoordinates: Boolean(coordinates),
        locationSource: locationOf(place).source,
      };
    })
    .sort((a, b) => Number(b.hasCoordinates) - Number(a.hasCoordinates) || a.name.localeCompare(b.name, "vi"));

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-2xl px-4 py-6 sm:px-6">
        <Link href="/admin" className="text-sm text-zinc-400 underline">
          ← Trang quản trị
        </Link>
        <h1 className="mt-3 text-xl font-medium tracking-tight text-zinc-900">Vị trí địa điểm</h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Ghim đúng chỗ trên bản đồ để khách bấm &quot;Chỉ đường&quot; là tới nơi, thay vì để Google
          đoán theo tên.
        </p>

        <div className="mt-4">
          <LocationQueue places={pending} verifiedCount={verified.length} />
        </div>
      </main>
    </div>
  );
}
