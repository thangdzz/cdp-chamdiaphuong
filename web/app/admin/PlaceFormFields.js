import { formatPriceText } from "@/lib/priceFormat";
import { PLACE_TYPES } from "@/lib/placeTypes";

// Tách riêng khỏi page.js (Server Component, có import next/headers) để LivePlacesManager.js
// (Client Component) dùng chung được — Client Component không được import trực tiếp từ 1
// file có next/headers, dù chỉ dùng vài hàm không liên quan.
export function Field({ label, name, defaultValue, type = "text" }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-zinc-500">
      {label}
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
      />
    </label>
  );
}

export function PlaceForm({ place, children }) {
  const preview = formatPriceText(place) ?? "Chưa cập nhật giá";
  return (
    <form className="rounded-2xl border border-zinc-200 bg-white p-4">
      <input type="hidden" name="id" value={place.id} />
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Field label="Tên" name="name" defaultValue={place.name} />
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Loại hình
          <select
            name="type"
            defaultValue={place.type}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
          >
            {PLACE_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <Field label="Địa chỉ" name="address" defaultValue={place.address} />
        <Field label="Khu (VD: Khu 80 gian, Khu cổng lấp...)" name="localArea" defaultValue={place.localArea} />
        <Field label="Phường" name="ward" defaultValue={place.ward} />
        <Field label="Giá thấp nhất" name="priceMin" type="number" defaultValue={place.priceMin} />
        <Field label="Giá cao nhất" name="priceMax" type="number" defaultValue={place.priceMax} />
        <Field label="Đơn vị (đêm, bát, ly...)" name="priceUnit" defaultValue={place.priceUnit} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Giá sẽ hiển thị cho khách: <span className="font-medium text-zinc-700">{preview}</span>
      </p>
      <div className="mt-3 flex gap-2">{children}</div>
    </form>
  );
}
