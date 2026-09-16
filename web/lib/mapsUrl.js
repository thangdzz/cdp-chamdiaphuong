import { normalizeForSearch } from "./placeTextSearch.js";
import { DEFAULT_PROVINCE, isValidProvince } from "./provinces.js";
import { cleanCoordinates, coordinatesOf, coordinatesQuery } from "./coordinates.js";
import { isPickupService, pickupSelectionMapsQuery } from "./pickupPoints.js";
import { locationOf } from "./placeLocation.js";

// Chuỗi đem tra Google Maps. Các việc nhỏ dưới đây đều là lỗi thật đã gặp:
//
//  1. Địa điểm CDP gửi TÊN + KHU VỰC + TỈNH, không gửi nguyên trường địa chỉ. Trường này có
//     thể chứa cả chỉ dẫn dài; ghép hết từng làm Google nhận cả đoạn văn như từ khoá.
//  2. Điểm riêng/đề xuất vẫn cần địa chỉ, nhưng bỏ phần chú thích trong ngoặc và giới hạn số
//     cụm địa chỉ để câu dẫn đường không biến thành đoạn mô tả.
//  3. Luôn kèm TỈNH/THÀNH khi chuỗi chưa có — địa chỉ hay ghi kiểu "12 Trần Phú", trùng tên
//     với hàng trăm phố Trần Phú khắp nước.
//  4. Bỏ phần rỗng thay vì nối bừa: chỗ chưa có địa chỉ trước đây thành "Tên quán, " —
//     dấu phẩy cụt làm Google đoán lung tung.
//
// Tỉnh nào thì tuỳ loại điểm: địa điểm trong danh bạ CDP luôn ở Tuyên Quang, còn ĐIỂM RIÊNG
// của khách thì nằm ở đâu cũng được — khách từ Hà Nội về Tuyên Quang chơi thì nhà họ ở Hà Nội.
// Gắn cứng "Tuyên Quang" cho điểm riêng (như bản 2026-09-11 sáng) là dẫn sai đường.
const AREA_HINT = DEFAULT_PROVINCE;

function withAreaHint(query, areaHint) {
  if (!query) return null;
  if (!areaHint) return query;
  const hasArea = normalizeForSearch(query).includes(normalizeForSearch(areaHint));
  return hasArea ? query : `${query}, ${areaHint}`;
}

function buildQuery(parts, areaHint = AREA_HINT) {
  const query = parts.filter(Boolean).join(", ").trim();
  return withAreaHint(query || null, areaHint);
}

function cleanPart(value) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

/** Địa chỉ nhập tay có thể lẫn cả đoạn "nếu đi từ... thì rẽ trái" — không gửi phần đó sang Maps. */
export function compactMapsAddress(value, maxParts = 3) {
  const text = cleanPart(value).split("(")[0].trim().replace(/[;,]+$/, "");
  if (!text) return null;
  const parts = text.split(",").map(cleanPart).filter(Boolean).slice(0, maxParts);
  return parts.join(", ") || null;
}

/**
 * Chuỗi để TÌM KIẾM một địa điểm CDP trên Google — KHÔNG phải định danh để dẫn đường
 * (spec Google-Maps-Location-Routing §6B, §7). Cùng một cái tên có ở nhiều huyện; đây chỉ là
 * câu tra để người ta tìm ra và xác nhận lại.
 */
export function placeSearchQuery(place) {
  const name = cleanPart(place?.name);
  if (!name) return null;
  // Tên chính thức đã tự nói rõ tỉnh thì thêm phường/địa chỉ chỉ làm câu tìm kiếm dài hơn.
  if (normalizeForSearch(name).includes(normalizeForSearch(AREA_HINT))) return name;
  return buildQuery([name, cleanPart(place?.ward)]);
}

/** Link "Tìm trên Google Maps" — mở ô tìm kiếm, KHÔNG phải chỉ đường. */
export function mapsSearchUrl(place) {
  const query = placeSearchQuery(place);
  if (!query) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Điểm đến ĐỦ TIN để dẫn đường, theo thứ tự ưu tiên của spec §3:
 *   1. Google Place ID  2. toạ độ đã có người xác nhận  3. không đủ dữ liệu → null.
 * Trả null nghĩa là KHÔNG được hiện nút "Chỉ đường" — hiện "Tìm trên Google Maps" thay vào đó.
 * @returns {{placeId: string|null, lat: number|null, lng: number|null, label: string|null}|null}
 */
export function placeRouteTarget(place) {
  if (!place) return null;
  const location = locationOf(place);
  if (!location.verified) return null;
  return {
    placeId: location.googlePlaceId,
    lat: location.lat,
    lng: location.lng,
    label: cleanPart(place.name) || null,
  };
}

/** Một điểm đã resolve thành chuỗi Google nhận được: toạ độ nếu có, không thì tên (đi kèm placeId). */
function targetQuery(target) {
  if (!target) return null;
  if (Number.isFinite(target.lat) && Number.isFinite(target.lng)) return `${target.lat},${target.lng}`;
  // Chỉ xảy ra khi có Place ID mà chưa có toạ độ: Google bắt buộc có phần chữ đi kèm place_id.
  return target.label ?? null;
}

/**
 * Nút bản đồ của một địa điểm (spec §6): "Chỉ đường" CHỈ khi vị trí đã xác minh; chưa thì
 * "Tìm trên Google Maps" — tra theo chữ để người dùng tự tìm và xác nhận, không giả vờ là đã đúng.
 * @returns {{kind: "directions"|"search", href: string, label: string}|null}
 */
export function placeMapAction(place) {
  const directions = mapsDirectionsUrl(placeRouteTarget(place));
  if (directions) return { kind: "directions", href: directions, label: "Chỉ đường" };
  const search = mapsSearchUrl(place);
  return search ? { kind: "search", href: search, label: "Tìm trên Google Maps" } : null;
}

/** Link CHỈ ĐƯỜNG tới một điểm đã xác minh. `null` khi chưa đủ dữ liệu — nơi gọi phải xử lý. */
export function mapsDirectionsUrl(target, mapsMode = "driving") {
  const destination = targetQuery(target);
  if (!destination) return null;
  const params = new URLSearchParams({ api: "1", destination, travelmode: mapsMode });
  if (target.placeId) params.set("destination_place_id", target.placeId);
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Chuỗi tra cứu của MỘT ĐIỂM DỪNG trong lộ trình — dùng chung cho trang lộ trình và cho bản
 * chụp chia sẻ (trước đây mỗi nơi tự ghép một kiểu, sửa một chỗ là chỗ kia lệch).
 *
 * Điểm riêng ưu tiên ĐỊA CHỈ + TỈNH KHÁCH CHỌN. Nếu không nhập địa chỉ thì dùng TÊN + TỈNH:
 * chỗ công cộng như "Winmart Hàng Bún, Hà Nội" vẫn đủ để Google nhận ra mà người dùng không
 * phải gõ cùng một tên hai lần. Tên riêng kiểu "Nhà Tuấn" nên có địa chỉ để dẫn chính xác.
 *
 * @param {object} stop điểm đã qua resolveRouteStops()
 * @returns {string|null}
 */
/**
 * Điểm dừng lộ trình → điểm đến ĐỦ TIN để dẫn đường, hoặc null khi chưa xác minh (spec §9, §10).
 * Dịch vụ đón khách dẫn tới ĐIỂM ĐÓN đã chọn, không bao giờ tới địa chỉ của service (NOTE-14 §12).
 * @returns {{placeId, lat, lng, label}|null}
 */
export function stopRouteTarget(stop) {
  if (!stop) return null;
  if (stop.place && isPickupService(stop.place)) {
    const pickup = stop.pickupSelection;
    if (!pickup || pickup.locationConfirmed !== true) return null;
    const coords = cleanCoordinates({ lat: pickup.lat, lng: pickup.lng });
    if (!coords) return null;
    return { placeId: null, lat: coords.lat, lng: coords.lng, label: pickup.name ?? null };
  }
  if (stop.place) return placeRouteTarget(stop.place);
  // Điểm riêng và đề xuất: chỉ ghim đã xác nhận mới tính (§3 Priority 2).
  const location = locationOf(stop);
  if (!location.verified) return null;
  return {
    placeId: location.googlePlaceId,
    lat: location.lat,
    lng: location.lng,
    label: cleanPart(stop.customTitle ?? stop.proposal?.name) || null,
  };
}

/**
 * GIAI ĐOẠN CHUYỂN TIẾP (16/9/2026). Spec §3/§10 muốn: chưa xác minh vị trí thì KHÔNG mở lộ trình.
 * Nhưng lúc làm, 0/234 địa điểm trong danh bạ có toạ độ — bật khoá cứng ngay là cả 7 lộ trình đang
 * có đứng im. Nên tạm thời điểm chưa xác minh vẫn vào link bằng CHỮ, và giao diện nói thẳng chỗ nào
 * chưa chắc. Ghim xong phần lớn danh bạ thì đổi hằng số này thành `true` — mọi nơi theo ngay.
 */
export const REQUIRE_VERIFIED_LOCATION = false;

/**
 * Điểm dừng dưới dạng CHỮ, để dùng tạm khi chưa xác minh vị trí (xem hằng số trên).
 * @returns {{placeId: null, lat: null, lng: null, label: string}|null}
 */
export function stopTextTarget(stop) {
  const query = stopMapsQuery(stop);
  return query ? { placeId: null, lat: null, lng: null, label: query } : null;
}

/**
 * Chuỗi CHỮ của một điểm dừng — chỉ để TÌM KIẾM và cho tương thích ngược (link chia sẻ cũ đã đóng
 * băng chuỗi này). KHÔNG dùng làm định danh dẫn đường cho điểm đã xác minh: `stopRouteTarget` lo việc đó.
 */
export function stopMapsQuery(stop) {
  if (!stop) return null;
  if (stop.place) {
    // NOTE-14 §12, §16: dịch vụ đón khách KHÔNG phải điểm địa lý — dẫn tới điểm đón khách đã chọn, không
    // bao giờ tới tên/địa chỉ của service ("Xe ghép Anh Huy, Tuyên Quang" dẫn sai hẳn tỉnh). Chưa
    // chọn → null, trang lộ trình chặn mở Maps và bắt chọn (§17).
    if (isPickupService(stop.place)) return pickupSelectionMapsQuery(stop.pickupSelection);
    // Có toạ độ thì dẫn đúng ghim; chưa có (hầu hết dữ liệu hiện tại) thì giữ cách tra theo tên.
    return coordinatesQuery(coordinatesOf(stop.place)) ?? placeSearchQuery(stop.place);
  }
  if (stop.proposal) {
    // Đề xuất là chỗ xin đưa vào danh bạ CDP, mà danh bạ chỉ nhận Tuyên Quang.
    return buildQuery([
      cleanPart(stop.proposal.name),
      compactMapsAddress(stop.proposal.address || stop.proposal.ward),
    ]);
  }
  // Ghim người dùng đã xác nhận trên bản đồ thắng mọi cách ghép chữ (2026-09-16): địa chỉ chữ ở
  // Việt Nam hay bị Google gán sang số nhà khác trên cùng con đường.
  const pinned = coordinatesQuery(coordinatesOf(stop));
  if (pinned) return pinned;
  // Điểm ngoài danh bạ không được tự rơi về Tuyên Quang. Dữ liệu cũ thiếu tỉnh tạm không
  // đưa vào link của chủ cho tới khi họ mở màn sửa và chọn đúng tỉnh/thành.
  if (!isValidProvince(stop.customProvince)) return null;
  return buildQuery(
    [compactMapsAddress(stop.customAddress, 4) || cleanPart(stop.customTitle)],
    stop.customProvince
  );
}

// Mở CẢ lộ trình trên Google Maps (CDP_P1-P8 §P7 giai đoạn 1) — "CDP lo kế hoạch, Google lo
// đường".
//
// Giới hạn điểm giữa: tài liệu Google Maps URLs ghi tối đa 9 điểm giữa (cộng đầu + cuối là 11).
// Spec Location-Routing §11 cho rằng trình duyệt trên điện thoại có thể chỉ nhận 3 — CHƯA kiểm
// chứng được con số đó, nên để thành hằng số ở đây: đổi một chỗ là cả lộ trình lẫn phần chia chặng
// theo ngay, sau khi thử trên máy thật.
const MAX_WAYPOINTS = 9;

function pointParams(target) {
  return { query: targetQuery(target), placeId: target?.placeId ?? null };
}

/**
 * Ghép một link chỉ đường từ danh sách điểm ĐÃ XÁC MINH (đầu → giữa → cuối).
 * Place ID chỉ gắn cho điểm đầu và điểm cuối: `waypoint_place_ids` bắt buộc khớp số lượng và thứ
 * tự với `waypoints`, mà lộ trình thật hay lẫn chỗ có ID và chỗ chỉ có toạ độ — toạ độ thì đã đủ
 * rõ nghĩa rồi, không cần ID để Google hiểu đúng.
 * @returns {string|null}
 */
function buildDirectionsUrl(targets, mapsMode) {
  const points = targets.map(pointParams).filter((p) => p.query);
  if (points.length < 2) return null;
  const origin = points[0];
  const destination = points[points.length - 1];
  const middle = points.slice(1, -1);

  const params = new URLSearchParams({
    api: "1",
    origin: origin.query,
    destination: destination.query,
    travelmode: mapsMode,
  });
  if (origin.placeId) params.set("origin_place_id", origin.placeId);
  if (destination.placeId) params.set("destination_place_id", destination.placeId);
  if (middle.length > 0) params.set("waypoints", middle.map((p) => p.query).join("|"));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/**
 * Cắt lộ trình dài thành từng chặng nối đuôi nhau (spec §11 phương án 1): A→…→E, rồi E→…→H.
 * Điểm cuối chặng trước là điểm đầu chặng sau, nên không hụt đoạn đường nào.
 * @returns {number[][]} các nhóm CHỈ SỐ trong mảng gốc
 */
export function splitRouteLegs(count, maxWaypoints = MAX_WAYPOINTS) {
  const perLeg = maxWaypoints + 2; // đầu + giữa + cuối
  if (count <= perLeg) return [Array.from({ length: count }, (_, i) => i)];
  const legs = [];
  for (let start = 0; start < count - 1; start += perLeg - 1) {
    const end = Math.min(start + perLeg - 1, count - 1);
    legs.push(Array.from({ length: end - start + 1 }, (_, i) => start + i));
  }
  return legs;
}

/**
 * Link Google Maps cho cả lộ trình. Nhận điểm ĐÃ XÁC MINH; điểm chưa xác minh phải được nơi gọi
 * lọc ra và nói rõ với người dùng TRƯỚC (spec §10: không im lặng bỏ điểm).
 *
 * @param {({placeId,lat,lng,label}|null)[]} targets điểm đã resolve, theo đúng thứ tự lộ trình
 * @param {string} mapsMode driving | walking (xem TRANSPORT_MODES ở lib/routes.js)
 * @returns {{url: string, legs: {url: string, from: number, to: number}[]}|null} null khi chưa đủ 2 điểm
 */
export function routeMapsUrl(targets, mapsMode = "driving") {
  const usable = (targets ?? []).filter((t) => targetQuery(t));
  if (usable.length < 2) return null;
  const legs = splitRouteLegs(usable.length)
    .map((indexes) => ({
      url: buildDirectionsUrl(indexes.map((i) => usable[i]), mapsMode),
      from: indexes[0],
      to: indexes[indexes.length - 1],
    }))
    .filter((leg) => leg.url);
  if (legs.length === 0) return null;
  return { url: legs[0].url, legs };
}
