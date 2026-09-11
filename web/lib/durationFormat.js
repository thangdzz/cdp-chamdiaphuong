// Viết thời lượng theo cách người đọc nhẩm được ngay.
//
// Trước 2026-09-11 lộ trình hiện thẳng số phút đã lưu: "Khoảng 240 phút". Số lớn thì không ai
// nhẩm ra 4 tiếng giữa lúc đang đi chơi, mà câu đó còn KHÔNG NÓI RÕ 240 phút là ở lại đó hay
// đi đường mất chừng ấy. Nên tách hẳn hai câu, mỗi câu tự nói nó là loại thời gian nào.
//
// Vẫn LƯU bằng phút (một con số duy nhất, dễ cộng dồn cho timeline sau này) — chỗ đổi chỉ là
// lúc hiển thị.

/** "4 tiếng" · "1 tiếng 30 phút" · "40 phút". Trả null khi không có số hợp lệ. */
export function formatDurationText(minutes) {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) return null;
  const rounded = Math.round(total);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hours === 0) return `${mins} phút`;
  if (mins === 0) return `${hours} tiếng`;
  return `${hours} tiếng ${mins} phút`;
}

/** Thời gian DỪNG LẠI tại một điểm: "Ở đây khoảng 4 tiếng". */
export function formatStayDuration(minutes) {
  const text = formatDurationText(minutes);
  return text ? `Ở đây khoảng ${text}` : null;
}

/**
 * Thời gian ĐI ĐƯỜNG giữa hai điểm: "Di chuyển khoảng 25 phút".
 * Chưa dùng tới — số liệu thật cần toạ độ địa điểm (0/210 chỗ có), xem NOTE-07 P2. Để sẵn đây
 * để hai loại thời gian không bao giờ dùng chung một câu chữ mập mờ như trước.
 */
export function formatTravelDuration(minutes) {
  const text = formatDurationText(minutes);
  return text ? `Di chuyển khoảng ${text}` : null;
}
