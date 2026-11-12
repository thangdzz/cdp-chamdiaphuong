// Ảnh của một địa điểm khi hiển thị (A3, DESIGN §5): ảnh thật phù hợp → minh họa theo nhóm.
// Hàm thuần, dùng được ở máy chủ lẫn trình duyệt; test ở tests/placeImage.test.js.
//
// - Ảnh thật: đúng một quy tắc chọn, nằm ở placeCoverMedia() (lib/media.js) — bìa hợp lệ → ảnh thường đầu tiên,
//   KHÔNG BAO GIỜ ảnh menu. Mọi nơi (thẻ tìm, Chi tiết, Sổ, ảnh xem trước chia sẻ) dùng chung.
// - Minh họa: 5 SVG trong public/minh-hoa/ (bản đã duyệt ở docs/design/minh-hoa/). Minh họa không bao giờ được
//   trình bày như ảnh chụp thật: luôn có alt “Hình minh họa…”, và màn hiển thị gắn dấu ✎ / nhãn (A5, A6).
// - Quyền dùng ảnh (PM Q4 A3): đây chỉ là phần kỹ thuật. Trước khi hiện ảnh thật ở bề mặt MỚI (thẻ tìm A5,
//   A6–A8) phải qua cổng xác minh nguồn/quyền; ảnh chưa xác minh dùng minh họa (BACKLOG §6).

import { placeCoverMedia } from "./media.js";

const ILLUSTRATIONS = {
  an: { src: "/minh-hoa/an.svg", alt: "Hình minh họa nhóm Ăn, chưa có ảnh thực tế" },
  choi: { src: "/minh-hoa/choi.svg", alt: "Hình minh họa nhóm Chơi, chưa có ảnh thực tế" },
  ngu: { src: "/minh-hoa/ngu.svg", alt: "Hình minh họa nhóm Ngủ, chưa có ảnh thực tế" },
  dilai: { src: "/minh-hoa/dilai.svg", alt: "Hình minh họa nhóm Đi lại, chưa có ảnh thực tế" },
};
// Chỗ quen gọi (`moc`), nhóm lạ hay thiếu nhóm.
const FALLBACK_ILLUSTRATION = { src: "/minh-hoa/khac.svg", alt: "Hình minh họa, chưa có ảnh thực tế" };

// Câu chữ cố định theo DESIGN §5 — màn nào gắn nhãn thì lấy từ đây, không tự viết lại.
export const ILLUSTRATION_LABEL = "Hình minh họa · Chưa có ảnh thực tế"; // Chi tiết (A6)
export const ILLUSTRATION_MARK = "✎"; // góc ảnh ở thẻ tìm (A5)
export const ILLUSTRATION_LEGEND = "✎ = hình minh họa, chưa có ảnh thực tế"; // một lần đầu danh sách (A5)
export const PHOTO_ERROR_LABEL = "Ảnh chưa tải được · đang hiện minh họa"; // ảnh thật lỗi (A6)

/**
 * Ảnh thật đại diện, gọn cho dữ liệu gửi xuống trình duyệt: chỉ url + kích thước (null nếu không ghi).
 * Không gửi vai trò, người tải, nguồn hay dung lượng.
 * @returns {{ url: string, width: number|null, height: number|null } | null}
 */
export function placePhoto(place) {
  const media = placeCoverMedia(place);
  if (!media?.url) return null;
  return { url: media.url, width: media.width ?? null, height: media.height ?? null };
}

/**
 * Minh họa theo nhóm.
 * @returns {{ src: string, alt: string }}
 */
export function placeIllustration(type) {
  return ILLUSTRATIONS[type] ?? FALLBACK_ILLUSTRATION;
}

/**
 * Alt mặc định cho ảnh thật khi ảnh đứng riêng (Chi tiết): “Ảnh {tên địa điểm}”. Ở thẻ nhỏ có tên ngay cạnh
 * trong cùng liên kết thì dùng alt rỗng (PM Q3 A3), không gọi hàm này.
 */
export function placePhotoAlt(name) {
  const text = typeof name === "string" ? name.trim() : "";
  return text ? `Ảnh ${text}` : "Ảnh địa điểm";
}
