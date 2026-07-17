const PEAK_START = new Date("2026-09-19T00:00:00+07:00");
const PEAK_END = new Date("2026-09-25T23:59:59+07:00");
const PARADE_START = new Date("2026-08-21T00:00:00+07:00");
const PARADE_END = new Date("2026-09-27T23:59:59+07:00");

// Nhãn "mềm" — chỉ nói tín hiệu, không khẳng định chắc chắn. Chữ khác nhau theo loại hình
// (chỗ cho Ăn, phòng cho Ngủ).
export function getOccupancyLabel(status, type) {
  const noun = type === "ngu" ? "phòng" : "chỗ";
  const labels = {
    "con-cho": { text: `Có tín hiệu còn ${noun}`, className: "bg-green-100 text-green-800" },
    "het-cho-cao": { text: `Tín hiệu ít ${noun} trống`, className: "bg-amber-100 text-amber-800" },
    "chua-du-du-lieu": { text: "Chưa đủ dữ liệu", className: "bg-zinc-100 text-zinc-500" },
  };
  return labels[status];
}

export function getOccupancyStatus(place, now = new Date()) {
  if (!place.ward) return "chua-du-du-lieu";

  if (now >= PEAK_START && now <= PEAK_END) return "het-cho-cao";

  const isFriOrSat = now.getDay() === 5 || now.getDay() === 6;
  if (isFriOrSat && now >= PARADE_START && now <= PARADE_END) {
    return "het-cho-cao";
  }

  return "con-cho";
}
