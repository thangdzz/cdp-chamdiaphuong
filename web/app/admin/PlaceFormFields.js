import { formatPriceText } from "@/lib/priceFormat";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { transportSubtypeGroups, VEHICLE_TYPES, vehicleTypesOf } from "@/lib/transport";
import { PickupPointsEditor } from "./PickupPointsEditor";
import { PlaceLocationEditor } from "./PlaceLocationEditor";

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
        {/* NOTE-15 §7: tên dân gian, cách nhau bằng dấu phẩy. Khách gõ tên nào cũng ra — đây
            là thứ Google không có và CDP có. Một dòng thay vì nhiều ô: một chỗ nhiều lắm vài
            cái tên, thêm ô bấm chỉ làm form dài ra. */}
        <Field
          label="Tên dân hay gọi (cách nhau bằng dấu phẩy)"
          name="searchAliases"
          defaultValue={(place.searchAliases ?? []).join(", ")}
        />
        {/* NOTE-15 §13: chỗ chỉ có trong một dịp. Hết ngày cuối thì thôi bày ra trang chủ và bộ
            chọn lộ trình, nhưng KHÔNG xoá — lộ trình cũ của khách vẫn phải xem lại được. */}
        <label className="col-span-2 flex items-center gap-2 text-[13px] text-zinc-600">
          <input type="checkbox" name="temporary" defaultChecked={place.temporary === true} />
          Chỗ tạm, chỉ có trong một dịp (bãi xe lễ hội, sân khấu tạm, điểm cấm đường...)
        </label>
        <Field label="Có từ ngày" name="validFrom" type="date" defaultValue={place.validFrom} />
        <Field label="Đến hết ngày" name="validUntil" type="date" defaultValue={place.validUntil} />
        <Field label="Giá thấp nhất" name="priceMin" type="number" defaultValue={place.priceMin} />
        <Field label="Giá cao nhất" name="priceMax" type="number" defaultValue={place.priceMax} />
        <Field label="Đơn vị (đêm, bát, ly...)" name="priceUnit" defaultValue={place.priceUnit} />
      </div>
      <p className="mt-2 text-xs text-zinc-500">
        Giá sẽ hiển thị cho khách: <span className="font-medium text-zinc-700">{preview}</span>
      </p>

      {/* Spec Location-Routing §5, §12: ghim vị trí thật cho chỗ này. Chưa ghim thì khách chỉ có
          nút "Tìm trên Google Maps". */}
      <PlaceLocationEditor place={place} />

      {/* Ô riêng cho nhóm "Đi lại" (NOTE-04 §1–§2). Chỉ hiện khi chỗ này ĐANG là Đi lại — form
          không chạy JavaScript nên đổi ô "Loại hình" sang Đi lại thì phải Lưu rồi mở lại mới
          thấy 3 ô này. Đổi loại là việc hiếm, không đáng đánh đổi bằng việc bắt cả form phải
          chạy client. */}
      {place.type === "dilai" && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Loại hình Đi lại
              <select
                name="transportSubtype"
                defaultValue={place.transportSubtype ?? ""}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
              >
                <option value="">— chưa rõ —</option>
                {/* Nhóm theo 4 family của NOTE-06 §1 — nhìn là biết loại này thuộc nhóm nào,
                    mà admin vẫn chỉ phải chọn 1 ô (family tự suy ra từ loại đã chọn). */}
                {transportSubtypeGroups().map((group) => (
                  <optgroup key={group.id} label={group.label}>
                    {group.subtypes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <Field
              label="Khu vực phục vụ (VD: TP Tuyên Quang và lân cận)"
              name="serviceArea"
              defaultValue={place.serviceArea}
            />
            <Field
              label="Tuyến chính (VD: Tuyên Quang ↔ Hà Nội)"
              name="mainRoute"
              defaultValue={place.mainRoute}
            />
          </div>

          {/* Loại xe là NHIỀU giá trị (NOTE-06 §8): một nhà xe chạy đồng thời 4 chỗ và 7 chỗ
              là chuyện thường, không được ép chọn một loại. Điền ở đây thì thôi hỏi khách. */}
          <fieldset className="mt-2">
            <legend className="text-xs text-zinc-500">Loại xe (chọn được nhiều)</legend>
            <div className="mt-1 flex flex-wrap gap-3">
              {VEHICLE_TYPES.map((v) => (
                <label key={v.id} className="flex items-center gap-1.5 text-sm text-zinc-700">
                  <input
                    type="checkbox"
                    name="vehicleTypes"
                    value={v.id}
                    defaultChecked={vehicleTypesOf(place).includes(v.id)}
                  />
                  {v.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* NOTE-14 §11: hiện cho mọi chỗ Đi lại vì form không chạy lại khi đổi ô "Loại hình Đi lại";
              server chỉ giữ điểm đón cho family pickup-service (lib/placeForm.js). */}
          <PickupPointsEditor place={place} />
        </div>
      )}

      <div className="mt-3 flex gap-2">{children}</div>
    </form>
  );
}
