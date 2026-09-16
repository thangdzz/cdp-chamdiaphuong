import { formatPriceText } from "./priceFormat.js";
import { assertValidPlaceType } from "./placeTypes.js";
import { familyOfSubtype, isValidTransportSubtype, VEHICLE_TYPES } from "./transport.js";
import { cleanPickupPoints, isValidPickupMode } from "./pickupPoints.js";
import { cleanCoordinates } from "./coordinates.js";

// Điểm đón (NOTE-14 §8–§11) chỉ đọc khi form THẬT SỰ có khối điểm đón — thẻ hàng chờ tự động không có
// khối này, nếu cứ trả [] thì lưu từ đó sẽ xoá sạch điểm đón đang có.
function pickupFieldsFromFormData(formData, transportSubtype) {
  if (!formData.has("pickupPointsJson")) return {};
  if (familyOfSubtype(transportSubtype) !== "pickup-service") return {};
  let raw = [];
  try {
    raw = JSON.parse(formData.get("pickupPointsJson")?.toString() || "[]");
  } catch {
    // Ô ẩn hỏng: không đoán — giữ nguyên dữ liệu cũ bằng cách không trả field nào.
    return {};
  }
  const mode = formData.get("pickupMode")?.toString();
  return {
    pickupMode: isValidPickupMode(mode) ? mode : null,
    pickupPoints: cleanPickupPoints(raw),
  };
}

// Vị trí ghim trên bản đồ (spec Location-Routing §5). Cũng chỉ đọc khi form THẬT SỰ có khối này —
// thẻ hàng chờ tự động không có, trả null từ đó sẽ xoá mất vị trí admin đã ghim.
function locationFieldsFromFormData(formData) {
  if (!formData.has("placeLocationJson")) return {};
  try {
    const raw = JSON.parse(formData.get("placeLocationJson")?.toString() || "null");
    return { coordinates: cleanCoordinates(raw) };
  } catch {
    return {}; // ô ẩn hỏng: giữ nguyên vị trí cũ
  }
}

// Đọc dữ liệu địa điểm từ 1 <form> (dùng chung cho "Đang công khai", "Chờ duyệt" thủ công,
// và "Hàng chờ duyệt tự động" — cả 3 nơi đều sửa/nhập theo đúng field này).
export function placeFromFormData(formData) {
  const toNumberOrNull = (value) => {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const toTextOrNull = (value) => (value && value.trim() !== "" ? value.trim() : null);

  const type = assertValidPlaceType(formData.get("type")?.toString());
  const priceMin = toNumberOrNull(formData.get("priceMin")?.toString());
  const priceMax = toNumberOrNull(formData.get("priceMax")?.toString());
  const priceUnit = toTextOrNull(formData.get("priceUnit")?.toString());

  // Loại hình Đi lại (NOTE-04 §1). Giá trị lạ -> null chứ không ném lỗi như assertValidPlaceType:
  // đây là trường phụ, sai thì coi như chưa chọn, không đáng làm hỏng cả lượt lưu.
  const subtypeRaw = toTextOrNull(formData.get("transportSubtype")?.toString());
  const transportSubtype = isValidTransportSubtype(subtypeRaw) ? subtypeRaw : null;

  // Loại xe: NHIỀU ô tích, không phải 1 lựa chọn (NOTE-06 §8). getAll() vì cùng tên `name`.
  const validVehicleIds = new Set(VEHICLE_TYPES.map((v) => v.id));
  const vehicleTypes = formData
    .getAll("vehicleTypes")
    .map((v) => v.toString())
    .filter((v) => validVehicleIds.has(v));

  return {
    name: (formData.get("name") ?? "").toString().trim(),
    type,
    address: (formData.get("address") ?? "").toString().trim(),
    ward: toTextOrNull(formData.get("ward")?.toString()),
    // Tên khu dân cư/khu vực theo cách gọi của người địa phương (VD "Khu 80 gian", "Khu
    // cổng lấp") — khác "ward" (tên phường hành chính), hiển thị kèm nhau khi có cả 2.
    localArea: toTextOrNull(formData.get("localArea")?.toString()),
    priceMin,
    priceMax,
    priceUnit,
    // priceText luôn tự tính từ priceMin/priceMax/priceUnit — không nhận gõ tay, để
    // tránh lệch định dạng (ví dụ "35000" so với "35.000 đ").
    priceText: formatPriceText({ priceMin, priceMax, priceUnit }),
    // Thông tin cố định của nhà xe, admin điền (anh chốt 2026-09-09) — thứ khách đi rồi mới
    // biết thì để bấm chọn, xem lib/transport.js. Chỉ ghi cho chỗ Đi lại: form cũng chỉ hiện
    // mấy ô này cho Đi lại, ghi cho quán ăn là thêm field rỗng vô nghĩa.
    ...(type === "dilai"
      ? {
          transportSubtype,
          vehicleTypes,
          mainRoute: toTextOrNull(formData.get("mainRoute")?.toString()),
          serviceArea: toTextOrNull(formData.get("serviceArea")?.toString()),
          // `vehicleSeats` là ô CHỮ TỰ DO của bản trước, nay đã thay bằng nhóm ô tích. Lưu
          // một chỗ Đi lại là dọn luôn giá trị cũ của nó — chuyển dần, không cần script sửa
          // dữ liệu, và không để 2 nguồn cùng nói về một thứ. vehicleTypesOf() vẫn đọc được
          // giá trị cũ của những chỗ chưa ai mở ra lưu lại.
          vehicleSeats: null,
          ...pickupFieldsFromFormData(formData, transportSubtype),
        }
      : {}),
    // Vị trí ghim: mọi loại hình đều cần, không riêng Đi lại.
    ...locationFieldsFromFormData(formData),
  };
}
