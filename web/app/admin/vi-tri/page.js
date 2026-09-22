import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces } from "@/lib/redis";
import { getPlaceTypeLabel } from "@/lib/placeTypes";
import { coordinatesOf } from "@/lib/coordinates";
import { isAdminVerified, isLocationVerified, locationOf } from "@/lib/placeLocation";
import {
  getAllLocationConsensus,
  distanceMeters,
  LOCATION_CONSENSUS_RADIUS_METERS,
} from "@/lib/locationVotes";
import { LocationQueue } from "./LocationQueue";
import { LocationSuggestions } from "./LocationSuggestions";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

export const metadata = { title: "Vị trí địa điểm — Admin" };

// Bảng xác minh vị trí (spec Location-Routing §13). Lối vào duy nhất để 234 địa điểm cũ có toạ độ
// thật mà không phải mở form sửa của từng chỗ.
export default async function PlaceLocationsPage() {
  const cookieStore = await cookies();
  if (!verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value)) redirect("/admin");

  const [rawPlaces, locationConsensus] = await Promise.all([getLivePlaces(), getAllLocationConsensus()]);
  const live = rawPlaces.map((place) => ({ ...place, locationConsensus: locationConsensus[place.id] ?? null }));
  const verified = live.filter(isLocationVerified);

  // Chỗ khách đã ghim giúp (spec Consensus §15). Gồm cả chỗ CDP đã chốt mà khách báo chỗ khác —
  // đó chính là tín hiệu "vị trí đang dùng có thể sai", không được im lặng bỏ qua.
  const suggestions = live
    .map((place) => {
      const consensus = place.locationConsensus;
      if (!consensus?.clusters?.length) return null;
      const current = isAdminVerified(place) ? coordinatesOf(place) : null;
      const movedAway =
        current && Math.round(distanceMeters(current, { lat: consensus.lat, lng: consensus.lng }));
      // CDP đã chốt và khách cũng chỉ đúng chỗ đó → không có gì để xem lại.
      if (current && movedAway <= LOCATION_CONSENSUS_RADIUS_METERS) return null;
      return {
        id: place.id,
        name: place.name,
        address: place.address ?? null,
        ward: place.ward ?? null,
        typeLabel: getPlaceTypeLabel(place.type),
        clusters: consensus.clusters,
        status: consensus.status,
        conflict: consensus.conflict === true,
        voters: consensus.voters ?? 0,
        movedAwayMeters: current ? movedAway : null,
      };
    })
    .filter(Boolean)
    .sort((a, b) => Number(b.conflict) - Number(a.conflict) || b.voters - a.voters);
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
        <AdminNav current="/admin/vi-tri" />
        <h1 className="mt-3 text-xl font-medium tracking-tight text-zinc-900">Vị trí địa điểm</h1>
        <p className="mt-1 text-[13px] text-zinc-500">
          Ghim đúng chỗ trên bản đồ để khách bấm &quot;Chỉ đường&quot; là tới nơi, thay vì để Google
          đoán theo tên.
        </p>

        <div className="mt-4">
          <LocationSuggestions items={suggestions} />
          <LocationQueue places={pending} verifiedCount={verified.length} />
        </div>
      </main>
    </div>
  );
}
