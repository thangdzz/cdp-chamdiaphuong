"use client";

import { useRef, useState } from "react";
import { searchGooglePlaces } from "@/app/googlePlacesActions";
import { provinceCenter } from "@/lib/geocode";
import { DEFAULT_PROVINCE } from "@/lib/provinces";

// "Lưu thành địa điểm CDP" (NOTE-15 §16) — chỗ Google ĐÃ CÓ mà danh bạ CDP chưa có.
//
// Vì sao đáng làm: gõ tay tên + địa chỉ rồi sau đó mở /admin/vi-tri ghim lại là hai lượt việc
// cho cùng một chỗ. Chọn một phát từ Google thì tên, địa chỉ, toạ độ và Place ID vào cùng lúc —
// và vì có người (admin) nhìn tận mắt rồi chọn, chỗ đó vào danh bạ đã ở mức tin cao nhất, khỏi
// phải ghim lại.
//
// KHÔNG tự đăng công khai: vẫn đi qua đúng nút "Thêm vào hàng chờ duyệt" như gõ tay (CLAUDE.md
// §6 — danh bạ thuộc về CDP). Đây chỉ là cách điền ô cho nhanh.
//
// Điền vào các ô của FORM BAO NGOÀI bằng DOM. Làm được vì mấy ô đó là ô thường, không do React
// giữ giá trị — riêng vị trí thì component này tự vẽ ô ẩn, để React quản đúng thứ nó tạo ra.
const GOOGLE_PLACES_ON = process.env.NEXT_PUBLIC_GOOGLE_PLACES === "1";
const MIN_QUERY = 3;

export function GooglePlaceFinder() {
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState(null);
  const [picked, setPicked] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const boxRef = useRef(null);

  if (!GOOGLE_PLACES_ON) return null;

  async function search() {
    const q = query.trim();
    if (q.length < MIN_QUERY || busy) return;
    setBusy(true);
    setError(null);
    const result = await searchGooglePlaces({ query: q, near: provinceCenter(DEFAULT_PROVINCE) });
    setBusy(false);
    if (!result?.ok) {
      setCandidates(null);
      setError(result?.error ?? "Không tìm được trên Google.");
      return;
    }
    setCandidates(result.candidates);
  }

  function pick(candidate) {
    setPicked(candidate);
    const form = boxRef.current?.closest("form");
    if (!form) return;
    const set = (name, value) => {
      const input = form.querySelector(`input[name="${name}"]`);
      if (input) input.value = value;
    };
    set("name", candidate.name);
    set("address", candidate.address ?? "");
  }

  return (
    <div ref={boxRef} className="mb-3 rounded-xl bg-zinc-50 p-3">
      <p className="text-xs font-medium text-zinc-700">Chỗ này Google đã có?</p>
      <p className="mb-2 text-xs text-zinc-500">
        Tìm rồi chọn một phát là có sẵn tên, địa chỉ và vị trí chuẩn — khỏi phải ghim lại ở trang
        Vị trí. Vẫn vào hàng chờ duyệt như thường.
      </p>
      <div className="flex flex-wrap gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tên chỗ cần tìm"
          className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
        />
        <button
          type="button"
          disabled={busy || query.trim().length < MIN_QUERY}
          onClick={search}
          className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-700 disabled:opacity-50"
        >
          {busy ? "Đang tìm…" : "Tìm trên Google"}
        </button>
      </div>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {candidates?.length === 0 && (
        <p className="mt-1.5 text-xs text-zinc-500">Google không có chỗ nào khớp — gõ tay bên dưới nhé.</p>
      )}

      {candidates?.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1">
          {candidates.map((candidate) => (
            <li key={candidate.placeId}>
              <button
                type="button"
                onClick={() => pick(candidate)}
                className={`w-full cursor-pointer rounded-lg border bg-white px-3 py-2 text-left ${
                  picked?.placeId === candidate.placeId ? "border-[#c8553d]" : "border-zinc-200"
                }`}
              >
                <span className="block text-sm text-zinc-900">
                  {picked?.placeId === candidate.placeId ? "● " : ""}
                  {candidate.name}
                </span>
                {candidate.address && <span className="block text-xs text-zinc-500">{candidate.address}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {picked && (
        <>
          {/* Cùng khuôn ô ẩn mà PlaceLocationEditor dùng, để lib/placeForm.js đọc được. Admin đã
              nhìn danh sách và chọn tận tay nên ghi `confirmed: true` — đúng nghĩa "có người
              nhìn bản đồ và xác nhận" (lib/placeLocation.js). */}
          <input
            type="hidden"
            name="placeLocationJson"
            value={JSON.stringify({
              coordinates: { lat: picked.lat, lng: picked.lng, source: "google_place", confirmed: true },
              googlePlaceId: picked.placeId,
            })}
          />
          <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-emerald-700">
            ✓ Đã điền tên, địa chỉ và vị trí ({picked.lat.toFixed(5)}, {picked.lng.toFixed(5)})
            <button
              type="button"
              onClick={() => setPicked(null)}
              className="cursor-pointer text-zinc-500 underline"
            >
              Bỏ vị trí này
            </button>
          </p>
        </>
      )}
    </div>
  );
}
