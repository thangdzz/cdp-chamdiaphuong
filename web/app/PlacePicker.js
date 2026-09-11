"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { matchesSearchQuery, normalizeForSearch, placeSearchHaystack } from "@/lib/placeTextSearch";
import { fetchPickerPlaces } from "./routeActions";

// Bộ chọn địa điểm DÙNG CHUNG (NOTE-07 §3) — cùng một component cho:
//   1. "Tạo lộ trình từ đây" trên thẻ địa điểm và trang địa điểm
//   2. "+ Thêm địa điểm" trong trang sửa lộ trình
// Không tách thành 2 picker riêng: khác nhau mỗi chỗ thì sửa 1 chỗ quên chỗ kia, mà khách gõ
// cùng một từ ở 2 màn lại ra kết quả khác nhau là tưởng web hỏng.
//
// Danh sách địa điểm tải MỘT LẦN lúc mở (1 lệnh Redis), rồi lọc ngay trên máy khách. Gọi máy
// chủ theo từng ký tự gõ vừa chậm vừa tốn lệnh, mà cả danh bạ rút gọn chỉ ~20KB.
//
// SELECTION GIỮ NGUYÊN khi đổi ô tìm hoặc đổi bộ lọc (§13) — chọn xong 3 chỗ rồi gõ tìm chỗ
// thứ 4 mà mất sạch 3 cái trước thì không ai dùng nổi. Vì vậy `selected` là một Map riêng,
// không phải suy ra từ danh sách đang hiện.
// `onAddCustomStop` / `onProposePlace` là chế độ CÓ SẴN LỘ TRÌNH (màn sửa): thêm phát nào ăn
// ngay phát đó. Không truyền thì picker chuyển sang chế độ GIỮ TẠM (màn tạo mới): chưa có lộ
// trình nào để gắn vào, nên gom lại rồi trả hết một lượt qua onConfirm — §13 đòi cả 2 lối
// thoát này phải có ở MỌI màn có picker, không riêng màn sửa.
export function PlacePicker({
  title,
  confirmLabel,
  initialSelected = [],
  onConfirm,
  onClose,
  onAddCustomStop,
  onProposePlace,
}) {
  const [places, setPlaces] = useState(null);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  // Map<placeId, place> — nguồn sự thật của "đang chọn những gì", độc lập với danh sách hiện ra.
  const [selected, setSelected] = useState(() => new Map(initialSelected.map((p) => [p.id, p])));
  const [busy, setBusy] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  // Chế độ giữ tạm (màn tạo mới) — điểm riêng gom ở đây tới lúc bấm nút cuối.
  const [pendingCustom, setPendingCustom] = useState([]);
  const searchRef = useRef(null);
  const holdsLocally = !onAddCustomStop;

  useEffect(() => {
    fetchPickerPlaces().then(setPlaces);
  }, []);

  // Khoá cuộn trang phía sau khi bộ chọn đang mở. Không khoá thì trên iPhone vuốt trong bộ
  // chọn tới cuối danh sách là trang chủ phía dưới cuộn theo, đóng lại thì đứng ở chỗ khác hẳn.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!places) return [];
    const q = normalizeForSearch(query).trim();
    return places.filter((p) => {
      if (type !== "all" && p.type !== type) return false;
      if (q && !matchesSearchQuery(placeSearchHaystack(p), q)) return false;
      return true;
    });
  }, [places, query, type]);

  function toggle(place) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(place.id)) next.delete(place.id);
      else next.set(place.id, place);
      return next;
    });
  }

  const totalPicked = selected.size + pendingCustom.length;

  async function handleConfirm() {
    if (totalPicked === 0 || busy) return;
    setBusy(true);
    try {
      await onConfirm([...selected.values()], { customStops: pendingCustom });
    } finally {
      setBusy(false);
    }
  }

  async function handleAddCustom() {
    const title = customTitle.trim();
    if (!title || busy) return;
    if (holdsLocally) {
      setPendingCustom((prev) => [...prev, title]);
      setCustomTitle("");
      return;
    }
    setBusy(true);
    try {
      await onAddCustomStop(title);
      setCustomTitle("");
    } finally {
      setBusy(false);
    }
  }

  const selectedList = [...selected.values()];
  const noResults = places !== null && filtered.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-zinc-50">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3">
        <h2 className="text-base font-medium text-zinc-900">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="cdp-pressable min-h-11 cursor-pointer px-2 text-sm text-zinc-500"
        >
          Đóng
        </button>
      </header>

      <div className="border-b border-zinc-200 bg-white px-4 pb-3">
        <input
          ref={searchRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm địa điểm..."
          className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[{ id: "all", label: "Tất cả" }, ...PLACE_TYPES].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setType(opt.id)}
              className={`cdp-pressable cursor-pointer rounded-full border px-3 py-1 text-[13px] ${
                type === opt.id
                  ? "border-zinc-400 bg-zinc-100 font-medium text-zinc-900"
                  : "border-zinc-200 text-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Khối "Đã chọn" nằm TRÊN kết quả để thấy ngay là chọn vẫn còn nguyên dù vừa đổi ô
            tìm hay bộ lọc — thứ đang chọn mà biến mất khỏi màn hình thì khách tưởng mất. */}
        {(selectedList.length > 0 || pendingCustom.length > 0) && (
          <div className="mb-4">
            <p className="mb-1.5 text-[13px] text-zinc-500">Đã chọn</p>
            <div className="flex flex-col gap-1.5">
              {pendingCustom.map((title, i) => (
                <button
                  key={`custom-${i}`}
                  type="button"
                  onClick={() => setPendingCustom((prev) => prev.filter((_, j) => j !== i))}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-dashed border-zinc-400 bg-white px-3 py-2 text-left"
                >
                  <span className="min-w-0 text-sm text-zinc-900">
                    {title} <span className="text-xs text-zinc-400">· điểm riêng</span>
                  </span>
                  <span className="shrink-0 text-xs text-zinc-400">Bỏ</span>
                </button>
              ))}
              {selectedList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-zinc-400 bg-white px-3 py-2 text-left"
                >
                  <span className="min-w-0 text-sm font-medium text-zinc-900">{p.name}</span>
                  <span className="shrink-0 text-xs text-zinc-400">Bỏ</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {places === null && <p className="text-sm text-zinc-500">Đang tải danh sách...</p>}

        {places !== null && (
          <div className="flex flex-col gap-1.5">
            {filtered
              .filter((p) => !selected.has(p.id))
              .map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggle(p)}
                  className="w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left"
                >
                  <span className="block text-sm text-zinc-900">{p.name}</span>
                  <span className="block text-xs text-zinc-500">
                    {[PLACE_TYPES.find((t) => t.id === p.type)?.label, p.ward].filter(Boolean).join(" · ")}
                  </span>
                </button>
              ))}
          </div>
        )}

        {/* §13: không có kết quả -> đưa ra 2 lối thoát, và 2 cái này KHÁC NGHĨA nhau, phải nói
            rõ để khách chọn đúng. */}
        {noResults && (
          <p className="mb-3 text-sm text-zinc-500">Không tìm thấy chỗ nào khớp.</p>
        )}

        <div className="mt-5 flex flex-col gap-3 border-t border-zinc-200 pt-4">
          <div>
            <p className="text-[13px] font-medium text-zinc-700">Không thấy chỗ bạn cần?</p>
            <p className="mb-1.5 text-xs text-zinc-500">
              Đề xuất để CDP xem xét đưa vào danh bạ. Chỗ này vào lộ trình của bạn ngay, kèm
              nhãn chưa xác minh.
            </p>
            {onProposePlace ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => onProposePlace(query)}
                className="cdp-pressable cursor-pointer rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
              >
                + Đề xuất địa điểm mới
              </button>
            ) : (
              // Đề xuất phải gắn vào một lộ trình có thật. Nói thẳng thay vì giấu nút đi —
              // giấu thì khách tưởng CDP không cho đề xuất.
              <p className="text-xs text-zinc-400">
                Tạo lộ trình xong, bấm &quot;+ Thêm địa điểm&quot; là đề xuất được.
              </p>
            )}
          </div>

          <div>
              <p className="text-[13px] font-medium text-zinc-700">Điểm riêng của bạn</p>
              <p className="mb-1.5 text-xs text-zinc-500">
                Chỗ chỉ mình bạn cần — nhà bạn bè, điểm hẹn. Không gửi CDP, không vào danh bạ.
              </p>
              <div className="flex gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-900"
                  value={customTitle}
                  maxLength={60}
                  placeholder="VD: Nhà Tuấn"
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
                <button
                  type="button"
                  disabled={busy || !customTitle.trim()}
                  onClick={handleAddCustom}
                  className="cdp-pressable shrink-0 cursor-pointer rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
                >
                  Thêm
                </button>
              </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-3">
        <button
          type="button"
          disabled={totalPicked === 0 || busy}
          onClick={handleConfirm}
          className="cdp-pressable w-full cursor-pointer rounded-lg bg-[#c8553d] px-4 py-3 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
        >
          {busy ? "Đang lưu..." : `${confirmLabel}${totalPicked > 0 ? ` · ${totalPicked} điểm` : ""}`}
        </button>
      </div>
    </div>
  );
}
