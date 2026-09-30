// Cách nói về một địa điểm trên thẻ — DÙNG CHUNG cho thẻ trang chủ cũ (PlaceExplorer) và thẻ kết
// quả `/tim`. Hàm thuần: `now` truyền vào được để test, mặc định là lúc gọi.

// Rút gọn địa chỉ về "số nhà + tên đường" cho thẻ gọn — bỏ phần phường/thành phố (đã có
// mục "Khu vực" riêng). "Địa chỉ đầy đủ" ở trang chi tiết vẫn giữ nguyên chuỗi gốc.
// "Tổ 15" KHÔNG bị cắt (30/9): với địa chỉ không có số nhà, tổ dân phố là phần cụ thể nhất — cắt
// nó thì còn lại rỗng và cả chuỗi dài bị trả nguyên.
const ADDRESS_DROP_PREFIXES = ["phường", "tp", "thành phố", "xã", "huyện", "thị trấn", "tỉnh"];

export function formatShortAddress(address) {
  if (!address) return address;
  const parts = address.split(",").map((s) => s.trim());
  const kept = [];
  for (const part of parts) {
    const lower = part.toLowerCase();
    if (ADDRESS_DROP_PREFIXES.some((prefix) => lower.startsWith(prefix))) break;
    kept.push(part);
  }
  return kept.length > 0 ? kept.join(", ") : address;
}

// Dòng "Còn mở · xác nhận N ngày trước" trên thẻ — SPEC-chang-1.md §2.1. Trên 90 ngày (hoặc
// chưa ai xác nhận bao giờ) trả về null để component không hiện gì (bỏ hẳn khỏi DOM).
// Xanh lá dành riêng cho đúng 1 việc: "Còn mở" (DESIGN.md §4). Lâu chưa xác nhận chỉ là chữ xám.
export function formatCheckinAge(lastCheckinAtIso, now = Date.now()) {
  if (!lastCheckinAtIso) return null;
  const diffDays = Math.floor((now - new Date(lastCheckinAtIso).getTime()) / 86400000);
  if (!(diffDays >= 0) || diffDays > 90) return null;

  if (diffDays > 30) {
    return { text: "Lâu chưa ai xác nhận (hơn 1 tháng)", tone: "muted" };
  }
  if (diffDays >= 7) {
    const weeks = Math.min(4, Math.ceil(diffDays / 7));
    return { text: `Còn mở · xác nhận ${weeks} tuần trước`, tone: "green" };
  }
  const ago = diffDays === 0 ? "hôm nay" : diffDays === 1 ? "hôm qua" : `${diffDays} ngày trước`;
  return { text: `Còn mở · xác nhận ${ago}`, tone: "green" };
}

// Dữ liệu chưa ai kiểm lại quá chừng này ngày thì nói thẳng "có thể đã thay đổi".
export const STALE_AFTER_DAYS = 90;

/**
 * Dòng TRẠNG THÁI dùng chung cho trang địa điểm, thẻ /tim và thẻ trong Sổ (owner test 30/9).
 * Thay hẳn cho chữ "Độ tin cậy Thấp/Trung bình/Cao" ngoài giao diện khách: khách không biết làm
 * gì với một con số tin cậy, còn "xác nhận 3 ngày trước" thì biết. `confidenceScore` vẫn dùng
 * nội bộ để xếp hạng (lib/placeReliability.js), chỉ thôi hiện ra.
 * @returns {{ text: string, tone: "green" | "muted", note: string | null }}
 */
export function placeStatus(place, now = Date.now()) {
  const checkin = formatCheckinAge(place?.lastCheckinAt, now);
  const recent = checkin?.tone === "green"; // ≤ 30 ngày
  const updatedAt = place?.lastUpdatedAt ? new Date(place.lastUpdatedAt).getTime() : NaN;
  const updatedDays = Number.isFinite(updatedAt) ? Math.floor((now - updatedAt) / 86400000) : null;
  const stale = !recent && (updatedDays === null || updatedDays > STALE_AFTER_DAYS);

  let text;
  if (recent) text = checkin.text;
  else if (checkin) text = "Xác nhận gần nhất hơn 1 tháng trước";
  else text = "Chưa có xác nhận gần đây";
  return { text, tone: recent ? "green" : "muted", note: stale ? "Thông tin có thể đã thay đổi" : null };
}
