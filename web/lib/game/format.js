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
