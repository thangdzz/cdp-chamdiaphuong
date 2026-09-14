// Primitive "Map Layer" (NOTE-04 §6): biến sighting thô thành marker công khai. Chạy ở server
// để anonId không bao giờ rời máy chủ — client chỉ nhận marker đã gom, không nhận ai báo.

import { distanceMeters, roundPublicCoord } from "./geo.js";
import { resolveObjectId } from "./catalog.js";

// Hai lượt báo cùng object trong bán kính này được coi là "cùng một chỗ".
export const CLUSTER_RADIUS_M = 250;
// Cùng object nhưng các cụm cách nhau hơn mức này trong cùng cửa sổ "tối nay" => cần xác minh.
export const CONFLICT_DISTANCE_M = 600;
export const HIDE_AFTER_FLAGS = 3;

export const CONFIDENCE = {
  SINGLE: "single",
  CONFIRMED: "confirmed",
  HIGH: "high",
};

// Mức tin cậy MVP: số NGƯỜI khác nhau đã báo quanh cùng chỗ (NOTE-04 §6 "Mức tin cậy"). Không
// dùng số lượt — một người bấm 5 lần không thành 5 xác nhận.
export function confidenceOf(people) {
  if (people >= 3) return CONFIDENCE.HIGH;
  if (people >= 2) return CONFIDENCE.CONFIRMED;
  return CONFIDENCE.SINGLE;
}

export function confidenceLabel(marker) {
  if (marker.confidence === CONFIDENCE.HIGH) return "Tin cậy cao";
  if (marker.confidence === CONFIDENCE.CONFIRMED) return `${marker.people} người xác nhận`;
  return `${marker.reports} báo cáo`;
}

/**
 * @param sightings bản ghi đầy đủ (có anonId) trong cửa sổ gần đây, mới nhất trước hay sau đều được
 * @param index catalogIndex() để gom sighting của object đã ghép về object đích
 * @param flags { sightingId: số lượt báo sai }
 */
export function buildMarkers(sightings, index, flags = {}) {
  const sorted = [...sightings]
    .filter((s) => (Number(flags[s.id]) || 0) < HIDE_AFTER_FLAGS)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const clustersByObject = new Map();
  for (const sighting of sorted) {
    const objectId = resolveObjectId(sighting.objectId, index);
    if (!index.has(objectId) || index.get(objectId).hidden) continue;
    const clusters = clustersByObject.get(objectId) ?? [];
    // Mới nhất đi trước nên cụm được neo ở lượt báo MỚI NHẤT — marker hiện đúng chỗ vừa thấy.
    const cluster = clusters.find(
      (c) => distanceMeters(c.anchor, sighting) <= CLUSTER_RADIUS_M
    );
    if (cluster) {
      cluster.reports += 1;
      cluster.people.add(sighting.anonId);
    } else {
      clusters.push({ anchor: sighting, reports: 1, people: new Set([sighting.anonId]) });
    }
    clustersByObject.set(objectId, clusters);
  }

  const markers = [];
  for (const [objectId, clusters] of clustersByObject) {
    for (const cluster of clusters) {
      markers.push({
        id: cluster.anchor.id,
        objectId,
        lat: roundPublicCoord(cluster.anchor.lat),
        lng: roundPublicCoord(cluster.anchor.lng),
        lastSeenAt: cluster.anchor.createdAt,
        reports: cluster.reports,
        people: cluster.people.size,
        confidence: confidenceOf(cluster.people.size),
        conflicting: clusters.some(
          (other) =>
            other !== cluster && distanceMeters(other.anchor, cluster.anchor) > CONFLICT_DISTANCE_M
        ),
      });
    }
  }
  return markers.sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt));
}
