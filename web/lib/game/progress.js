// Primitive "Progress" (NOTE-03 §2.4.A, NOTE-04 §5 + §18). Một lượt báo cập nhật nhiều tiến
// độ khác nhau; file này chỉ ĐỌC ra các con số, việc ghi nằm ở store.js.

import {
  OBJECT_KIND,
  catalogIndex,
  knownModels,
  openMysteries,
  resolveObjectId,
} from "./catalog.js";

// collection: { objectId thô: firstSeenAt } của một người. Object đã ghép được quy về object
// đích rồi mới đếm — gặp "bí ẩn #A1" rồi admin ghép vào Rồng vàng thì Rồng vàng tự sáng lên,
// không đếm hai lần (NOTE-04 §16, §18).
export function resolveCollection(collection, catalog) {
  const index = catalogIndex(catalog);
  const resolved = {};
  for (const [rawId, firstSeenAt] of Object.entries(collection ?? {})) {
    const id = resolveObjectId(rawId, index);
    if (!index.has(id)) continue;
    if (!resolved[id] || String(firstSeenAt) < String(resolved[id])) resolved[id] = firstSeenAt;
  }
  return resolved;
}

// objectStats: { objectId thô: số lượt báo } — cộng dồn alias về object đích.
export function resolveObjectStats(objectStats, catalog) {
  const index = catalogIndex(catalog);
  const totals = {};
  for (const [rawId, count] of Object.entries(objectStats ?? {})) {
    const id = resolveObjectId(rawId, index);
    totals[id] = (totals[id] ?? 0) + (Number(count) || 0);
  }
  return totals;
}

export function computeProgress({ catalog, collection, objectStats }) {
  const known = knownModels(catalog);
  const mysteries = openMysteries(catalog);
  const mine = resolveCollection(collection, catalog);
  const counts = resolveObjectStats(objectStats, catalog);

  const metKnown = known.filter((object) => mine[object.id]).length;
  const metMysteries = mysteries.filter((object) => mine[object.id]).length;

  return {
    knownTotal: known.length,
    metKnown,
    metMysteries,
    ratio: known.length > 0 ? metKnown / known.length : 0,
    communityKnown: known.filter((object) => counts[object.id] > 0).length,
    communityMysteries: mysteries.filter((object) => counts[object.id] > 0).length,
    completed: known.length > 0 && metKnown === known.length,
  };
}

/**
 * Xếp object theo số lượt được nhìn thấy (đã quy alias, bỏ object ẩn/đã ghép). Chưa có UI —
 * chuẩn bị cho thống kê "mô hình được nhìn thấy nhiều nhất". `objectStats` có thể là cả mùa
 * (`object-stats`) hoặc một ngày (`object-stats:day:{YYYY-MM-DD}`), xem store.readObjectSightingStats.
 */
export function rankMostSeen({ catalog, objectStats, limit = 10 }) {
  const counts = resolveObjectStats(objectStats, catalog);
  return catalog
    .filter((object) => !object.hidden && !object.matchedTo && counts[object.id] > 0)
    .map((object) => ({ objectId: object.id, count: counts[object.id] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function hasMet(objectId, resolvedCollection) {
  return Boolean(resolvedCollection?.[objectId]);
}

export function isMystery(object) {
  return object?.kind === OBJECT_KIND.UNKNOWN;
}
