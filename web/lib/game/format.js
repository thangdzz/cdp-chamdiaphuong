// Chữ hiển thị thời gian cho game layer. Luôn nói "được nhìn thấy X phút trước", không bao giờ
// nói "đang ở đây" — mô hình đèn di chuyển (NOTE-04 §6).

// Tìm "rong vang" ra "Rồng vàng" — khách gõ không dấu giữa phố đông.
export function foldText(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function formatAgo(iso, now) {
  const at = new Date(iso).getTime();
  if (!Number.isFinite(at)) return "";
  const minutes = Math.max(0, Math.floor((now - at) / 60000));
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return formatDayMonth(iso);
}

const VN_TIME = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  hour: "2-digit",
  minute: "2-digit",
});

const VN_DAY = new Intl.DateTimeFormat("vi-VN", {
  timeZone: "Asia/Ho_Chi_Minh",
  day: "numeric",
  month: "numeric",
});

export function formatClock(iso) {
  return VN_TIME.format(new Date(iso));
}

export function formatDayMonth(iso) {
  return VN_DAY.format(new Date(iso));
}

// "còn 2 ngày 5 giờ" / "còn 3 giờ 20 phút" / "còn 12 phút" — đếm ngược tới giờ mở game.
export function formatCountdownTo(iso, now) {
  const ms = new Date(iso).getTime() - now;
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const minutes = Math.ceil(ms / 60000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = minutes % 60;
  if (days > 0) return `còn ${days} ngày${hours > 0 ? ` ${hours} giờ` : ""}`;
  if (hours > 0) return `còn ${hours} giờ${mins > 0 ? ` ${mins} phút` : ""}`;
  return `còn ${mins} phút`;
}
