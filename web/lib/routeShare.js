// Chia sẻ lộ trình bằng BẢN CHỤP (CDP_P1-P8 §P6).
//
// Bấm chia sẻ -> đóng băng toàn bộ nội dung lộ trình tại đúng thời điểm đó vào một khoá riêng
// `route_share:{token}`. Sau đó chủ lộ trình sửa gì, xoá điểm nào, thậm chí xoá cả lộ trình,
// thì link đã gửi đi VẪN mở ra đúng thứ người nhận được gửi.
//
// Vì sao chọn bản chụp thay vì link tới bản gốc:
//   - Người nhận không bao giờ mở ra thấy một thứ khác hẳn thứ được gửi, hoặc thấy trang lỗi.
//   - Không phải giữ lịch sử phiên bản cho mọi lộ trình chỉ vì một lần chia sẻ.
//   - Dễ hiểu, dễ dò lỗi: 1 khoá = 1 nội dung, không phụ thuộc trạng thái nào khác.
// Đánh đổi: chủ sửa lộ trình rồi thì phải bấm chia sẻ lại để có link mới. Nói rõ trên giao diện.
//
// Bản chụp phải TỰ ĐỦ: chép sẵn tên, địa chỉ, khu vực, giá của từng điểm — không tra lại
// places:live lúc mở. Chỗ bị xoá khỏi danh bạ sau đó thì link cũ vẫn hiện đúng như lúc chia sẻ.

import { redis } from "./redis.js";
import { stopTitle, STOP_TYPES } from "./routes.js";

const SHARE_CHARS = "23456789abcdefghjkmnpqrstuvwxyz";
const TOKEN_LENGTH = 10; // dài hơn slug lộ trình: link này đi ra ngoài, đừng để đoán được

function shareKey(token) {
  return `route_share:${token}`;
}

function randomToken() {
  let s = "";
  for (let i = 0; i < TOKEN_LENGTH; i++) {
    s += SHARE_CHARS[Math.floor(Math.random() * SHARE_CHARS.length)];
  }
  return s;
}

/**
 * Đóng băng một lộ trình thành bản chụp chia sẻ được.
 * @param {object} route bản ghi route:{slug}
 * @param {object[]} resolvedStops kết quả resolveRouteStops() — đã có dữ liệu địa điểm mới nhất
 */
export async function createShareSnapshot({ route, resolvedStops }) {
  if (!route) return { ok: false, error: "Không tìm thấy lộ trình." };
  if ((resolvedStops ?? []).length === 0) {
    return { ok: false, error: "Lộ trình chưa có điểm nào để chia sẻ." };
  }

  const snapshot = {
    title: route.title,
    transportMode: route.transportMode,
    stops: resolvedStops.map((stop) => ({
      title: stopTitle(stop),
      // Người nhận link phải thấy rõ điểm nào CDP chưa xác minh (§9). Chép cả `type` vào bản
      // chụp: link đã gửi đi thì đóng băng luôn trạng thái lúc đó, đúng tinh thần §P6.
      type: stop.type ?? (stop.placeId ? STOP_TYPES.CDP_PLACE : STOP_TYPES.CUSTOM),
      // `mapsQuery` chép sẵn để nút "Mở trên Google Maps" của người nhận vẫn chạy kể cả khi
      // chỗ đó về sau bị xoá khỏi danh bạ.
      mapsQuery: stop.place
        ? `${stop.place.name}, ${stop.place.address}`
        : (stop.proposal
            ? [stop.proposal.name, stop.proposal.address ?? stop.proposal.ward].filter(Boolean).join(", ")
            : (stop.customTitle ?? null)),
      subtitle: stop.place
        ? [stop.place.ward, stop.place.priceText].filter(Boolean).join(" · ") || null
        : (stop.proposal?.ward ?? null),
      address: stop.place?.address ?? null,
      placeId: stop.placeId ?? null, // chỉ để dựng link tới trang địa điểm, không dùng đọc dữ liệu
      plannedAt: stop.plannedAt ?? null,
      durationMinutes: stop.durationMinutes ?? null,
      note: stop.note ?? null,
    })),
  };

  for (let attempt = 0; attempt < 5; attempt++) {
    const token = randomToken();
    const created = await redis.set(
      shareKey(token),
      { token, routeSlug: route.slug, snapshot, createdAt: new Date().toISOString() },
      { nx: true }
    );
    if (created) return { ok: true, token };
  }
  return { ok: false, error: "Không tạo được link chia sẻ, thử lại nhé." };
}

export async function getShareSnapshot(token) {
  if (!token) return null;
  return (await redis.get(shareKey(token))) ?? null;
}
