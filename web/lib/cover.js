// Ảnh bìa — tách rõ 2 khái niệm khác nhau, trước đây cả hai đều lấy đại `photos[0]`:
//
//   placeCover(place)          -> ảnh đại diện của MỘT địa điểm
//   notebookCover(nb, items)   -> ảnh đại diện của MỘT CUỐN SỔ (nhiều địa điểm)
//
// Gom về đây để mọi nơi (thẻ, trang địa điểm, Open Graph, trang Sổ) dùng chung một thứ tự ưu
// tiên — trước đây mỗi chỗ tự chọn ảnh theo cách riêng nên preview khi chia sẻ có thể ra ảnh
// khác với ảnh khách đang nhìn thấy trên thẻ.

export const FALLBACK_COVER = "/images/le-hoi-thanh-tuyen-2026.jpg";

/**
 * Ảnh bìa của một địa điểm.
 * Ưu tiên `coverPhoto` — ảnh do admin/CDP tự chọn — vì `photos[0]` chỉ là "ảnh khách gửi lên
 * sớm nhất", không có gì đảm bảo nó đại diện tốt cho chỗ đó (có thể là ảnh tối, chụp lệch,
 * hoặc ảnh món ăn trong khi cần ảnh mặt tiền).
 * @returns {string|null} null nếu chỗ chưa có ảnh nào — nơi gọi tự quyết định ẩn hay dùng ảnh
 *   mặc định, vì "thẻ không có ảnh" và "preview không có ảnh" cần xử lý khác nhau.
 */
export function placeCover(place) {
  if (!place) return null;
  return place.coverPhoto ?? place.photos?.[0] ?? place.menuPhotos?.[0]?.url ?? null;
}

/**
 * Ảnh bìa của một cuốn sổ, theo thứ tự: cover riêng của sổ → collage 3 địa điểm đầu → cover
 * của địa điểm đầu tiên → ảnh mặc định.
 * @returns {{ mode: "single"|"collage", photos: string[] }} `photos` luôn có ít nhất 1 ảnh.
 */
export function notebookCover(notebook, items) {
  if (notebook?.cover) return { mode: "single", photos: [notebook.cover] };

  const covers = (items ?? [])
    .map((item) => placeCover(item.place))
    .filter(Boolean);

  // Sổ nhiều chỗ: collage cho thấy ngay đây là một TẬP HỢP, không phải một địa điểm đơn lẻ
  // (NOTE-03 §5). Chỉ 1 ảnh thì collage vô nghĩa, dùng thẳng ảnh đó.
  if (covers.length >= 2) return { mode: "collage", photos: covers.slice(0, 3) };
  if (covers.length === 1) return { mode: "single", photos: [covers[0]] };
  return { mode: "single", photos: [FALLBACK_COVER] };
}
