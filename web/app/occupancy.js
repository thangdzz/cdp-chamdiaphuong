const PEAK_START = new Date("2026-09-19T00:00:00+07:00");
const PEAK_END = new Date("2026-09-25T23:59:59+07:00");
const PARADE_START = new Date("2026-08-21T00:00:00+07:00");
const PARADE_END = new Date("2026-09-27T23:59:59+07:00");

export const OCCUPANCY_LABEL = {
  "con-cho": { text: "Có khả năng còn chỗ", className: "bg-green-100 text-green-800" },
  "het-cho-cao": { text: "Khả năng hết chỗ cao", className: "bg-amber-100 text-amber-800" },
  "chua-du-du-lieu": { text: "Chưa đủ dữ liệu", className: "bg-zinc-100 text-zinc-500" },
};

export function getOccupancyStatus(place, now = new Date()) {
  if (!place.ward) return "chua-du-du-lieu";

  if (now >= PEAK_START && now <= PEAK_END) return "het-cho-cao";

  const isFriOrSat = now.getDay() === 5 || now.getDay() === 6;
  if (isFriOrSat && now >= PARADE_START && now <= PARADE_END) {
    return "het-cho-cao";
  }

  return "con-cho";
}
