// Nhật ký đổi ghim (NOTE-15 §19) — phần XEM. Dữ liệu đã ghi từ 20/9, đây là màn để đọc nó.
//
// Vì sao đáng có một màn riêng: ghim đè lên ghim thì toạ độ cũ biến mất khỏi hồ sơ địa điểm.
// Đổi nhầm một chỗ rồi mới nhận ra thì không có gì để lần lại — trừ khi có bảng này.
//
// Gập sẵn: ngày thường không ai cần đọc, chỉ khi nghi ngờ mới mở. Mở ra là thấy ngay lần đổi
// gần nhất ở trên cùng.

function mapsLink(lat, lng) {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

function toaDo(snapshot) {
  if (!snapshot) return "chưa có vị trí";
  if (!Number.isFinite(snapshot.lat)) return snapshot.googlePlaceId ? "chỉ có Place ID" : "chưa có vị trí";
  return `${snapshot.lat.toFixed(5)}, ${snapshot.lng.toFixed(5)}`;
}

function aiDoi(actor) {
  if (actor === "admin") return "CDP";
  if (actor === "community") return "cộng đồng";
  return actor;
}

function khiNao(at) {
  const t = Date.parse(at);
  if (!Number.isFinite(t)) return "";
  return new Date(t).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" });
}

export function LocationHistory({ changes, nameOf }) {
  if (!changes?.length) return null;

  return (
    <section className="mb-5">
      <details>
        <summary className="cursor-pointer text-sm font-medium text-zinc-900">
          Lịch sử đổi ghim ({changes.length}){" "}
          <span className="text-xs font-normal text-zinc-400">— bấm để mở</span>
        </summary>
        <p className="mt-1 text-xs text-zinc-500">
          Mỗi địa điểm giữ 20 lần đổi gần nhất. Dùng khi nghi một chỗ bị ghim nhầm và muốn biết
          trước đó nó nằm đâu.
        </p>
        <ul className="mt-2 flex flex-col gap-2">
          {changes.map((change, i) => (
            <li key={`${change.placeId}-${change.at}-${i}`} className="rounded-lg bg-white p-3 ring-1 ring-zinc-200">
              <p className="text-[13px] font-medium text-zinc-900">{nameOf(change.placeId)}</p>
              <p className="mt-0.5 text-xs text-zinc-500">
                {khiNao(change.at)} · {aiDoi(change.actor)}
                {change.reason ? ` · ${change.reason}` : ""}
              </p>
              <p className="mt-1 text-xs tabular-nums text-zinc-600">
                {toaDo(change.from)} <span className="text-zinc-400">→</span>{" "}
                {change.to && Number.isFinite(change.to.lat) ? (
                  <a
                    href={mapsLink(change.to.lat, change.to.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {toaDo(change.to)}
                  </a>
                ) : (
                  toaDo(change.to)
                )}
              </p>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
