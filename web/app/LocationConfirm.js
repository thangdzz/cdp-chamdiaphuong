"use client";

import { useRef, useState } from "react";
import { GameMap } from "@/app/_game/GameMap";
import { geocodeAddress } from "@/app/geocodeActions";
import { provinceCenter } from "@/lib/geocode";
import { locationOf, locationSourceLabel } from "@/lib/placeLocation";
import { searchGooglePlaces } from "@/app/googlePlacesActions";

// Bật/tắt phần chọn từ Google. Cờ CÔNG KHAI (không phải khoá): khoá thật chỉ nằm ở máy chủ
// (GOOGLE_MAPS_SERVER_KEY). Chưa bật thì cả khối Google ẩn đi, kéo ghim tay vẫn chạy như thường.
const GOOGLE_PLACES_ON = process.env.NEXT_PUBLIC_GOOGLE_PLACES === "1";

// Khối "xác nhận vị trí trên bản đồ" — dùng chung cho mọi chỗ người dùng gõ địa chỉ bằng tay
// (điểm riêng trong lộ trình, điểm đón tự nhập, điểm đón của nhà xe ở trang admin).
//
// Vì sao phải có: địa chỉ chữ KHÔNG đủ để dẫn đường ở Việt Nam. "63 Lê Duẩn, Minh Xuân, Tuyên
// Quang" bị Google đưa sang "321 Lê Duẩn" — đúng đường, sai nhà, vì số nhà đó không có trong dữ
// liệu của họ. Nên: tra ra một chỗ gần đúng → người dùng nhìn bản đồ kéo ghim tới đúng chỗ → xác
// nhận. Từ đó lộ trình dẫn bằng TOẠ ĐỘ, không để Google đoán lại theo chữ nữa.
//
// Bản đồ dùng lại GameMap chế độ `picker` (NOTE-04 §8): ghim đứng yên giữa khung, người dùng kéo
// bản đồ bên dưới. Trên điện thoại cách này dễ hơn kéo ghim — ngón tay không che mất ghim.

/** Nhãn nguồn toạ độ cho người không rành kỹ thuật. */
export function coordinateSourceLabel(coordinates) {
  // Bọc lại thành hình dạng một "chỗ" để dùng chung luật ở lib/placeLocation.js.
  return coordinates ? locationSourceLabel(locationOf({ coordinates }).source) : null;
}

export function LocationConfirm({
  name,
  addressLine,
  wardOrDistrict,
  province,
  value,
  onConfirm,
  disabled = false,
  label = "vị trí",
  // Ai đang ghim (spec Location-Routing §5): khách tự ghim trong lộ trình của họ, hay admin ghim
  // cho cả danh bạ. Lưu lại để sau còn biết vị trí này đáng tin tới đâu.
  pinSource = "user_pin",
}) {
  // Địa chỉ mà bản đồ đang mở CHO NÓ. Sửa địa chỉ là bản đồ tự đóng, vì ghim đang chỉ chỗ của địa
  // chỉ cũ. Suy ra từ state thay vì dùng effect đóng tay: không có bước render thừa.
  const addressKey = `${addressLine ?? ""}|${wardOrDistrict ?? ""}|${province ?? ""}`;
  const [openFor, setOpenFor] = useState(null);
  const open = openFor === addressKey;
  const [point, setPoint] = useState(null);
  // Lệnh "dời khung bản đồ tới đây". CHỈ đặt khi kết quả tra về, không đặt khi người dùng tự kéo —
  // nếu không, mỗi lần kéo xong bản đồ lại tự nhảy về chỗ cũ.
  const [focus, setFocus] = useState(null);
  const [moved, setMoved] = useState(false);
  const [status, setStatus] = useState(null); // null | "loading" | "found" | "notFound"
  const [foundLabel, setFoundLabel] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  // Chọn từ Google (spec §4): ứng viên đang hiện, và Place ID của cái đã chọn.
  const [candidates, setCandidates] = useState(null);
  const [searching, setSearching] = useState(false);
  const [pickedPlaceId, setPickedPlaceId] = useState(null);
  // Mỗi lần mở bản đồ là một lượt tra riêng; lượt cũ về muộn thì bỏ qua.
  const runRef = useRef(0);
  const boxRef = useRef(null);

  const ready = Boolean(addressLine?.trim()) && Boolean(province);
  const confirmed = value?.confirmed === true;

  async function openMap() {
    setOpenFor(addressKey);
    setMoved(false);
    setError(null);
    setCandidates(null);
    setPickedPlaceId(null);
    const run = ++runRef.current;
    // Đưa cả khối vào giữa màn hình: mở ở lưng chừng trang thì nút "Xác nhận vị trí" nằm lọt dưới
    // thanh ghim ở đáy. Chờ một khung hình cho bản đồ chiếm chỗ xong rồi mới cuộn.
    requestAnimationFrame(() => boxRef.current?.scrollIntoView({ block: "center", behavior: "smooth" }));

    // Đã có toạ độ rồi (mở lại để chỉnh): giữ nguyên chỗ cũ, không tra lại.
    if (Number.isFinite(value?.lat) && Number.isFinite(value?.lng)) {
      setPoint({ lat: value.lat, lng: value.lng });
      setFocus({ lat: value.lat, lng: value.lng, zoom: 17 });
      setStatus("found");
      setFoundLabel(null);
      return;
    }

    setStatus("loading");
    const center = provinceCenter(province);
    setPoint(center);
    setFocus({ ...center, zoom: 12 });
    setFoundLabel(null);
    const result = await geocodeAddress({ addressLine, wardOrDistrict, province });
    if (run !== runRef.current) return;
    if (!result?.ok) {
      setStatus("notFound");
      setError(result?.error ?? null);
      return;
    }
    setPoint({ lat: result.lat, lng: result.lng });
    // Tra ra đúng chỗ thì kéo sát vào để nhìn rõ số nhà; chỉ ra được giữa tỉnh thì để rộng.
    setFocus({ lat: result.lat, lng: result.lng, zoom: result.found ? 17 : 12 });
    setStatus(result.found ? "found" : "notFound");
    setFoundLabel(result.label ?? null);
  }

  async function searchGoogle() {
    setSearching(true);
    setError(null);
    const result = await searchGooglePlaces({
      query: [name, addressLine, wardOrDistrict, province].filter(Boolean).join(", "),
      near: point ?? provinceCenter(province),
    });
    setSearching(false);
    if (!result?.ok) {
      setCandidates(null);
      setError(result?.error ?? "Không tìm được trên Google.");
      return;
    }
    setCandidates(result.candidates);
  }

  function pickGoogle(candidate) {
    setPickedPlaceId(candidate.placeId);
    setPoint({ lat: candidate.lat, lng: candidate.lng });
    setFocus({ lat: candidate.lat, lng: candidate.lng, zoom: 18 });
    setMoved(false); // vị trí này là của Google, chưa ai chỉnh
    setError(null);
  }

  async function confirm() {
    if (!point || saving) return;
    setSaving(true);
    setError(null);
    // Có người nhìn bản đồ và bấm xác nhận → tính là đã xác minh, dù có kéo hay không (kết quả tra
    // đúng sẵn thì khỏi kéo). Nguồn ghi theo NGƯỜI ghim, không theo cách ghim.
    //
    // Chọn từ danh sách Google rồi KHÔNG kéo đi đâu → giữ nguyên Place ID và ghi nguồn `google_place`
    // (§3 Priority 1). Kéo ghim sau khi chọn nghĩa là Google chỉ sai chỗ: bỏ Place ID, lấy ý người dùng.
    const keepsGooglePick = pickedPlaceId && !moved;
    const result = await onConfirm({
      lat: point.lat,
      lng: point.lng,
      source: keepsGooglePick ? "google_place" : pinSource,
      confirmed: true,
      googlePlaceId: keepsGooglePick ? pickedPlaceId : null,
    });
    setSaving(false);
    if (result && result.ok === false) {
      setError(result.error ?? "Chưa lưu được vị trí.");
      return;
    }
    setOpenFor(null);
  }

  if (!ready) {
    return (
      <p className="mt-2 text-xs text-zinc-400">
        Nhập địa chỉ và chọn tỉnh/thành để kiểm tra {label} trên bản đồ.
      </p>
    );
  }

  return (
    <div ref={boxRef} className="mt-2">
      {!open && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <button
            type="button"
            disabled={disabled}
            onClick={openMap}
            className="cdp-pressable min-h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 disabled:opacity-50"
          >
            {confirmed ? "Chỉnh lại vị trí trên bản đồ" : "Kiểm tra vị trí trên bản đồ"}
          </button>
          <span className={`text-xs ${confirmed ? "text-emerald-700" : "text-amber-700"}`}>
            {confirmed
              ? `✓ Đã xác nhận trên bản đồ (${coordinateSourceLabel(value)})`
              : "Chưa xác nhận — Google Maps sẽ tự đoán theo địa chỉ, có thể lệch"}
          </span>
        </div>
      )}

      {open && (
        <div className="rounded-xl bg-white p-2 ring-1 ring-zinc-200">
          <p className="text-sm font-medium text-zinc-900">Kiểm tra vị trí trên bản đồ</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {status === "loading"
              ? "Đang tìm địa chỉ này trên bản đồ…"
              : status === "notFound"
                ? `Không tìm thấy đúng địa chỉ này. Bản đồ đang mở ở giữa ${province} — kéo ghim tới đúng vị trí.`
                : "Kéo bản đồ để đưa ghim tới đúng vị trí nếu cần."}
          </p>
          {status === "found" && foundLabel && (
            <p className="mt-0.5 text-xs text-zinc-500">Tìm thấy: {foundLabel}</p>
          )}

          {/* §4: chỗ nào Google đã có thì chọn thẳng — chính xác hơn kéo tay, và có Place ID. */}
          {GOOGLE_PLACES_ON && (
            <div className="mt-2">
              <button
                type="button"
                disabled={searching}
                onClick={searchGoogle}
                className="cdp-pressable min-h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700 disabled:opacity-50"
              >
                {searching ? "Đang tìm trên Google…" : "Tìm chỗ này trên Google"}
              </button>
              {candidates?.length === 0 && (
                <p className="mt-1 text-xs text-zinc-500">Google không có chỗ nào khớp — kéo ghim tay nhé.</p>
              )}
              {candidates?.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1">
                  {candidates.map((candidate) => (
                    <li key={candidate.placeId}>
                      <button
                        type="button"
                        onClick={() => pickGoogle(candidate)}
                        className={`cdp-pressable flex w-full cursor-pointer flex-col items-start rounded-lg border px-3 py-2 text-left ${
                          pickedPlaceId === candidate.placeId ? "border-[#c8553d] bg-white" : "border-zinc-200 bg-white"
                        }`}
                      >
                        <span className="text-sm font-medium text-zinc-900">
                          {pickedPlaceId === candidate.placeId ? "● " : "○ "}
                          {candidate.name}
                        </span>
                        {candidate.address && <span className="text-xs text-zinc-500">{candidate.address}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {point && (
            <GameMap
              center={point}
              zoom={focus?.zoom ?? 13}
              focus={focus}
              picker
              showLocate
              onPick={({ lat, lng }) => {
                setPoint({ lat, lng });
                setMoved(true);
              }}
              className="mt-2 h-56 rounded-xl sm:h-64"
            />
          )}

          <p className="mt-1.5 text-xs tabular-nums text-zinc-400">
            {point ? `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}` : ""}
            {moved ? " · bạn đã chỉnh" : ""}
          </p>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={!point || saving}
              onClick={confirm}
              className="cdp-pressable min-h-11 flex-1 cursor-pointer rounded-lg bg-[#c8553d] px-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving ? "Đang lưu…" : "Xác nhận vị trí"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setOpenFor(null)}
              className="cdp-pressable min-h-11 cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-600 disabled:opacity-50"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
