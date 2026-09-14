// Primitive "Quest" (NOTE-03 §2.2: "mọi khoảng trống trong dữ liệu có thể trở thành một nhiệm
// vụ"). MVP1 chỉ sinh 3 loại từ data gap (NOTE-04 §14), không thưởng gì. Thêm loại mới = thêm
// một rule vào QUEST_RULES, không đụng UI.

import { knownModels, openMysteries, objectDisplayName } from "./catalog.js";

export const QUEST_TYPE = {
  MISSING_PHOTO: "missing_photo",
  VERIFY_LOCATION: "verify_location",
  UNIDENTIFIED: "unidentified",
};

const MAX_PER_RULE = 5;

const QUEST_RULES = [
  // Object đã có người gặp nhưng chưa có ảnh rõ — người đang ở gần là người giúp được nhất.
  ({ catalog, objectStats, photoCounts, noun }) =>
    knownModels(catalog)
      .filter((o) => !o.photoUrl && objectStats[o.id] > 0 && !(photoCounts[o.id] > 0))
      .sort((a, b) => objectStats[b.id] - objectStats[a.id])
      .slice(0, MAX_PER_RULE)
      .map((o) => ({
        id: `${QUEST_TYPE.MISSING_PHOTO}:${o.id}`,
        type: QUEST_TYPE.MISSING_PHOTO,
        objectId: o.id,
        icon: "📷",
        title: `${objectDisplayName(o, noun)} chưa có ảnh rõ`,
        detail: "Gặp thì chụp một tấm để cộng đồng dễ nhận ra hơn.",
      })),

  // Cùng một object bị báo ở các chỗ cách xa nhau trong tối nay.
  ({ catalog, markers, noun }) => {
    const conflicted = new Set(markers.filter((m) => m.conflicting).map((m) => m.objectId));
    return catalog
      .filter((o) => conflicted.has(o.id))
      .slice(0, MAX_PER_RULE)
      .map((o) => ({
        id: `${QUEST_TYPE.VERIFY_LOCATION}:${o.id}`,
        type: QUEST_TYPE.VERIFY_LOCATION,
        objectId: o.id,
        icon: "📍",
        title: "Có nhiều báo cáo khác nhau về vị trí",
        detail: `${objectDisplayName(o, noun)} đang được báo ở vài nơi. Bạn thấy ở đâu?`,
      }));
  },

  // Bí ẩn đã có ảnh (đang chờ duyệt) nhưng chưa ai biết tên.
  ({ catalog, photoCounts, noun }) =>
    openMysteries(catalog)
      .filter((o) => photoCounts[o.id] > 0)
      .slice(0, MAX_PER_RULE)
      .map((o) => ({
        id: `${QUEST_TYPE.UNIDENTIFIED}:${o.id}`,
        type: QUEST_TYPE.UNIDENTIFIED,
        objectId: o.id,
        icon: "❓",
        title: `Có ảnh nhưng chưa biết tên ${noun}`,
        detail: `${objectDisplayName(o, noun)} — gặp thì báo thêm để CDP sớm xác định tên.`,
      })),
];

export function generateQuests({ catalog, objectStats, photoCounts, markers, noun }) {
  const context = {
    catalog,
    objectStats: objectStats ?? {},
    photoCounts: photoCounts ?? {},
    markers: markers ?? [],
    noun,
  };
  return QUEST_RULES.flatMap((rule) => rule(context));
}
