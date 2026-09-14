// Ảnh "bảng giá" theo ngữ cảnh (chốt 2026-09-14, xem DECISIONS).
//
// Dữ liệu vẫn dùng role `menu` cho mọi nhóm — nghĩa thật là "ảnh chụp giá/dịch vụ có ghi ngày
// chụp", không riêng quán ăn. Chỉ CHỮ hiển thị đổi theo nhóm/loại, nên ảnh menu cũ của quán ăn
// giữ nguyên và không phải migration. Mọi nơi hiện nút gửi, tiêu đề ảnh hoặc lời mời ảnh cũ
// phải lấy chữ từ đây để khách và Admin thấy cùng một tên.

const EAT = { name: "Menu", generalHint: "món ăn, không gian..." };

const BY_TYPE = {
  an: EAT,
  choi: { name: "Bảng giá vé", generalHint: "cảnh quan, trò chơi, lối vào..." },
  ngu: { name: "Bảng giá phòng", generalHint: "phòng, sảnh, view..." },
};

const TRANSPORT_HINT = "xe, quầy vé, điểm đón...";

// Điểm đón/trả không có bảng giá nên không có nút ảnh riêng (null).
const BY_TRANSPORT_SUBTYPE = {
  "xe-khach": "Lịch chạy & giá vé",
  "xe-buyt": "Lịch chạy & giá vé",
  "ben-xe": "Lịch chạy & giá vé",
  taxi: "Bảng giá",
  "xe-ghep": "Bảng giá",
  "thue-xe-co-lai": "Bảng giá",
  "thue-o-to": "Bảng giá thuê",
  "thue-xe-may": "Bảng giá thuê",
  "thue-xe": "Bảng giá thuê",
  "bai-xe": "Bảng giá gửi xe",
  "diem-don-tra": null,
};

/**
 * @returns {{ name: string|null, generalHint: string }} `name` là tên loại ảnh bảng giá
 *   ("Menu", "Bảng giá phòng"...), null khi chỗ này không có loại ảnh đó.
 */
export function priceListPhotoContext(place) {
  if (place?.type === "dilai") {
    const subtype = place.transportSubtype;
    const name = subtype in BY_TRANSPORT_SUBTYPE ? BY_TRANSPORT_SUBTYPE[subtype] : "Bảng giá";
    return { name, generalHint: TRANSPORT_HINT };
  }
  return BY_TYPE[place?.type] ?? { name: "Bảng giá", generalHint: "không gian, lối vào..." };
}

/** "Ảnh menu", "Ảnh bảng giá phòng"... — chữ thường sau "Ảnh" trừ khi là từ ghép riêng. */
export function priceListPhotoTitle(name) {
  return `Ảnh ${name.charAt(0).toLowerCase()}${name.slice(1)}`;
}

/** Nhãn chung cho chỗ không biết địa điểm (Admin, bộ lọc role). */
export const PRICE_LIST_ROLE_LABEL = "Menu / bảng giá";
