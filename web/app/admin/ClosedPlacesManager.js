import Link from "next/link";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { createReplacementProposalAction } from "./proposalActions";

const inputClass = "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900";

export function ClosedPlacesManager({ places, proposalQueue }) {
  if (places.length === 0) {
    return <p className="text-sm text-zinc-500">Chưa có địa điểm nào trong hồ sơ đóng cửa.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {places.map((place) => {
        const pending = proposalQueue.find((proposal) => proposal.replacesPlaceId === place.id);
        return (
          <div key={place.id} className="rounded-2xl border border-zinc-200 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-zinc-900">{place.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {[place.localArea, place.ward, place.address].filter(Boolean).join(" · ") ||
                    "Bản đóng cửa cũ không còn dữ liệu vị trí"}
                </p>
              </div>
              <Link href={`/dia-diem/${place.id}`} className="text-xs text-zinc-500 underline">
                Mở URL cũ
              </Link>
            </div>

            {place.replacedByPlaceId ? (
              <p className="mt-3 text-sm text-emerald-700">
                Đã nối địa điểm thay thế: {" "}
                <Link href={`/dia-diem/${place.replacedByPlaceId}`} className="font-medium underline">
                  mở địa điểm mới
                </Link>
              </p>
            ) : pending ? (
              <p className="mt-3 text-sm text-amber-700">
                Đang chờ duyệt địa điểm thay thế: <span className="font-medium">{pending.name}</span>
              </p>
            ) : (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm font-medium text-[#c8553d]">
                  Có địa điểm mới ở đây
                </summary>
                <form action={createReplacementProposalAction} className="mt-3 flex flex-col gap-3">
                  <input type="hidden" name="replacesPlaceId" value={place.id} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input className={inputClass} name="name" maxLength={80} required placeholder="Tên địa điểm mới" />
                    <select className={inputClass} name="type" defaultValue={place.type ?? PLACE_TYPES[0].id}>
                      {PLACE_TYPES.map((type) => (
                        <option key={type.id} value={type.id}>{type.label}</option>
                      ))}
                    </select>
                    <input className={inputClass} name="ward" maxLength={120} defaultValue={place.ward ?? ""} placeholder="Khu vực / phường" />
                    <input className={inputClass} name="localArea" maxLength={120} defaultValue={place.localArea ?? ""} placeholder="Khu vực nhỏ" />
                    <input className={`${inputClass} sm:col-span-2`} name="address" maxLength={120} defaultValue={place.address ?? ""} placeholder="Địa chỉ" />
                    <textarea className={`${inputClass} sm:col-span-2`} name="note" maxLength={200} rows={2} placeholder="Ghi chú để người duyệt đối chiếu" />
                  </div>
                  <p className="text-xs text-zinc-500">
                    Gửi vào hàng chờ như proposal bình thường; không đăng công khai ngay.
                  </p>
                  <button className="self-start rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
                    Gửi chỗ mới vào hàng chờ
                  </button>
                </form>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
