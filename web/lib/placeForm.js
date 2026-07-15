import { formatPriceText } from "./priceFormat.js";

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

  return {
    name: (formData.get("name") ?? "").toString().trim(),
    type: formData.get("type") === "an" ? "an" : "ngu",
    address: (formData.get("address") ?? "").toString().trim(),
    ward: toTextOrNull(formData.get("ward")?.toString()),
    priceMin,
    priceMax,
    priceUnit,
    // priceText luôn tự tính từ priceMin/priceMax/priceUnit — không nhận gõ tay, để
    // tránh lệch định dạng (ví dụ "35000" so với "35.000 đ").
    priceText: formatPriceText({ priceMin, priceMax, priceUnit }),
  };
}
