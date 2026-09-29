// Cách nói về một địa điểm trên thẻ — DÙNG CHUNG cho thẻ trang chủ cũ (PlaceExplorer) và thẻ kết
// quả `/tim`. Hàm thuần: `now` truyền vào được để test, mặc định là lúc gọi.

// Rút gọn địa chỉ về "số nhà + tên đường" cho thẻ gọn — bỏ phần phường/thành phố (đã có
// mục "Khu vực" riêng). "Địa chỉ đầy đủ" ở trang chi tiết vẫn giữ nguyên chuỗi gốc.
const ADDRESS_DROP_PREFIXES = ["phường", "tp", "thành phố", "tổ", "xã", "huyện", "thị trấn"];

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
