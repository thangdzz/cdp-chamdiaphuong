import { formatPriceText } from "./priceFormat.js";
import { assertValidPlaceType } from "./placeTypes.js";
import { isValidTransportSubtype } from "./transport.js";

// Đọc dữ liệu địa điểm từ 1 <form> (dùng chung cho "Đang công khai", "Chờ duyệt" thủ công,
// và "Hàng chờ duyệt tự động" — cả 3 nơi đều sửa/nhập theo đúng field này).
export function placeFromFormData(formData) {
  const toNumberOrNull = (value) => {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };
  const toTextOrNull = (value) => (value && value.trim() !== "" ? value.trim() : null);

  const priceMin = toNumberOrNull(formData.get("priceMin")?.toString());
  const priceMax = toNumberOrNull(formData.get("priceMax")?.toString());
  const priceUnit = toTextOrNull(formData.get("priceUnit")?.toString());

  // Loại hình Đi lại (NOTE-04 §1). Giá trị lạ -> null chứ không ném lỗi như assertValidPlaceType:
  // đây là trường phụ, sai thì coi như chưa chọn, không đáng làm hỏng cả lượt lưu.
  const subtypeRaw = toTextOrNull(formData.get("transportSubtype")?.toString());
  const transportSubtype = isValidTransportSubtype(subtypeRaw) ? subtypeRaw : null;

  return {
    name: (formData.get("name") ?? "").toString().trim(),
    type: assertValidPlaceType(formData.get("type")?.toString()),
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
    // Ảnh bìa do admin chọn (lib/cover.js ưu tiên trường này hơn photos[0]). Rỗng = để web
    // tự chọn, KHÔNG phải xoá ảnh — ảnh vẫn nằm nguyên trong `photos`.
    coverPhoto: toTextOrNull(formData.get("coverPhoto")?.toString()),
    transportSubtype,
    // 2 thông tin cố định của nhà xe, admin điền (anh chốt 2026-09-09) — thứ khách đi rồi mới
    // biết thì để bấm chọn, xem lib/transport.js.
    vehicleSeats: toTextOrNull(formData.get("vehicleSeats")?.toString()),
    mainRoute: toTextOrNull(formData.get("mainRoute")?.toString()),
  };
}
