// Primitive "Collection" nhiều lớp (NOTE-05 §5–§11): bộ chính, bộ theo tag, bộ ẩn, combo, mốc
// (milestone) và độ hiếm theo đêm. Tất cả sinh từ cấu hình mùa + dữ liệu thật — không có tên mô
// hình nào trong code. Thuần, client + server dùng chung.

import { knownModels } from "./catalog.js";

// ─── Bộ sưu tập theo luật ───

export function matchesRule(object, rule = {}) {
  if (rule.all) return true;
  if (Array.isArray(rule.objectIds) && rule.objectIds.includes(object.id)) return true;
  const tags = object.tags ?? [];
  if (Array.isArray(rule.anyTags) && rule.anyTags.some((tag) => tags.includes(tag))) return true;
  if (Array.isArray(rule.allTags) && rule.allTags.length > 0 && rule.allTags.every((tag) => tags.includes(tag))) {
    return true;
  }
  return false;
}

/**
 * Trạng thái mọi bộ sưu tập của một người.
 * @param resolvedCollection { objectId đích: firstSeenAt } — đã quy alias (progress.resolveCollection)
 * @returns [{ id, title, icon, kind, combo, hidden, unlocked, visible, met, total, complete, memberIds }]
 * Bộ ẩn chưa mở vẫn có trong kết quả (để so trước/sau) nhưng `visible: false`.
 */
export function computeCollections({ collections = [], catalog, resolvedCollection = {} }) {
  const models = knownModels(catalog);
  return collections.map((collection) => {
    const members = models.filter((object) => matchesRule(object, collection.rule));
    const met = members.filter((object) => resolvedCollection[object.id]).length;
    const unlockAt = collection.hidden?.unlockAt ?? 0;
    const unlocked = !collection.hidden || (met >= unlockAt && met > 0);
    return {
      id: collection.id,
      title: collection.title,
      icon: collection.icon ?? null,
      kind: collection.kind ?? "group",
      combo: collection.combo === true,
      hidden: Boolean(collection.hidden),
      unlocked,
      visible: unlocked && members.length > 0,
      met,
      total: members.length,
      complete: members.length > 0 && met === members.length,
      memberIds: members.map((object) => object.id),
    };
  });
}

// ─── Mốc bộ chính ───

export function mainCollection(states) {
  return states.find((state) => state.kind === "main") ?? null;
}

function milestoneReached(milestone, met, total) {
  if (milestone.count === "complete") return total > 0 && met >= total;
  return Number.isFinite(milestone.count) && met >= milestone.count && milestone.count <= total;
}

// Mốc CAO NHẤT vừa vượt qua giữa hai trạng thái (một lượt báo chỉ bắn một mốc).
export function crossedMilestone(milestones = [], before, after) {
  const crossed = milestones.filter(
    (milestone) =>
      milestoneReached(milestone, after?.met ?? 0, after?.total ?? 0) &&
      !milestoneReached(milestone, before?.met ?? 0, before?.total ?? 0)
  );
  return crossed.at(-1) ?? null;
}

/**
 * So trạng thái bộ sưu tập trước/sau một lượt báo: bộ ẩn vừa mở, bộ vừa hoàn thành, mốc vừa đạt.
 * UI dựa vào đây để chọn animation + âm thanh (NOTE-05 §7, §8, §11, §17).
 */
export function diffCollections({ before, after, milestones }) {
  const beforeById = new Map(before.map((state) => [state.id, state]));
  const unlocked = [];
  const completed = [];
  for (const state of after) {
    const previous = beforeById.get(state.id);
    if (state.hidden && state.unlocked && !previous?.unlocked) unlocked.push(state);
    if (state.kind !== "main" && state.complete && !previous?.complete) completed.push(state);
  }
  return {
    unlocked,
    completed,
    milestone: crossedMilestone(milestones, mainCollection(before), mainCollection(after)),
  };
}

// ─── Độ hiếm theo đêm (NOTE-05 §9) ───

export const RARITY = {
  UNSEEN: "unseen",
  SEEN: "seen",
  COMMON: "common",
  UNCOMMON: "uncommon",
  RARE: "rare",
};

export const RARITY_LABEL = {
  unseen: "Chưa ai tìm thấy",
  seen: "Đã có người thấy",
  common: "Thường gặp",
  uncommon: "Ít gặp",
  rare: "Hiếm tối nay",
};

// Dưới ngưỡng này tổng lượt báo trong đêm quá ít để gọi "hiếm/thường" cho có nghĩa — chỉ phân
// biệt "đã có người thấy" với "chưa ai tìm thấy", không bịa độ hiếm.
const MIN_REPORTS_FOR_TIERS = 8;

/**
 * Không gán độ hiếm cố định: so số lượt của mỗi mô hình TRONG ĐÊM với mô hình được thấy nhiều nhất.
 * @param tonightCounts { objectId đích: số lượt hôm nay }
 * @returns { objectId: RARITY }
 */
export function computeRarity(catalog, tonightCounts = {}) {
  const models = knownModels(catalog);
  const counts = models.map((object) => Number(tonightCounts[object.id]) || 0);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const max = Math.max(0, ...counts);
  return Object.fromEntries(
    models.map((object, i) => {
      const count = counts[i];
      if (count === 0) return [object.id, RARITY.UNSEEN];
      if (total < MIN_REPORTS_FOR_TIERS) return [object.id, RARITY.SEEN];
      const share = count / max;
      if (share >= 0.5) return [object.id, RARITY.COMMON];
      if (share >= 0.2) return [object.id, RARITY.UNCOMMON];
      return [object.id, RARITY.RARE];
    })
  );
}

// ─── Thống kê cuối đêm (NOTE-05 §10) ───

/**
 * @param tonight { objectId: { reports, areas } } — số lượt và số khu vực (~110m) khác nhau trong đêm
 * @returns { mostSeen, hardest, mostTraveled } — mỗi mục { objectId, value } hoặc null
 */
export function nightHighlights(tonight = {}) {
  const entries = Object.entries(tonight).filter(([, stat]) => stat.reports > 0);
  if (entries.length === 0) return { mostSeen: null, hardest: null, mostTraveled: null };
  const byReports = [...entries].sort((a, b) => b[1].reports - a[1].reports);
  const byAreas = [...entries].sort((a, b) => (b[1].areas ?? 0) - (a[1].areas ?? 0));
  const top = byReports[0];
  const bottom = byReports.at(-1);
  const traveled = byAreas[0];
  return {
    mostSeen: { objectId: top[0], value: top[1].reports },
    // Chỉ nói "khó gặp nhất" khi có ít nhất 2 mô hình để so, và thật sự ít hơn mô hình đứng đầu.
    hardest:
      entries.length > 1 && bottom[1].reports < top[1].reports
        ? { objectId: bottom[0], value: bottom[1].reports }
        : null,
    mostTraveled: (traveled[1].areas ?? 0) > 1 ? { objectId: traveled[0], value: traveled[1].areas } : null,
  };
}
