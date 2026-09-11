"use client";

import { useEffect, useState } from "react";
import { PLACE_TYPES } from "@/lib/placeTypes";

// Form đề xuất một địa điểm chưa có trong danh bạ (NOTE-07 §6.B).
//
// Nói rõ ngay trên form chuyện gì sẽ xảy ra: chỗ này vào lộ trình NGAY, nhưng CHƯA vào danh bạ
// CDP cho tới khi được duyệt. Không nói thì khách tưởng vừa đăng một địa điểm công khai
// (đúng nguyên tắc §8: "Lộ trình thuộc về người tạo; danh bạ thuộc về CDP").
export function ProposePlaceForm({ initialName = "", onSubmit, onClose }) {
  const [name, setName] = useState(initialName);
  const [type, setType] = useState(PLACE_TYPES[0].id);
  const [ward, setWard] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  // Cùng lý do với PlacePicker: khoá cuộn trang phía sau khi form đang mở.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function handleSubmit() {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await onSubmit({ name, type, ward, address, note });
      if (result && !result.ok) setError(result.error ?? "Chưa gửi được, thử lại sau.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-zinc-50">
      <header className="flex items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-3">
        <h2 className="text-base font-medium text-zinc-900">Đề xuất địa điểm mới</h2>
        <button
          type="button"
          onClick={onClose}
          className="cdp-pressable min-h-11 cursor-pointer px-2 text-sm text-zinc-500"
        >
          Đóng
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mb-4 rounded-lg bg-white p-3 text-[13px] leading-relaxed text-zinc-600">
          Chỗ này vào <span className="font-medium text-zinc-900">lộ trình của bạn ngay</span>, kèm
          nhãn &quot;CDP chưa xác minh&quot;. CDP sẽ xem lại rồi mới quyết định có đưa vào danh bạ
          chung hay không — chưa duyệt thì người khác không tìm thấy nó trên web.
        </p>

        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-[13px] text-zinc-500">
            Tên địa điểm
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={name}
              maxLength={80}
              placeholder="VD: Quán bún ốc cô Hoa"
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-zinc-500">
            Loại
            <select
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {PLACE_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-zinc-500">
            Khu vực / phường
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={ward}
              maxLength={120}
              placeholder="VD: Phan Thiết"
              onChange={(e) => setWard(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-zinc-500">
            Địa chỉ (nếu biết)
            <input
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={address}
              maxLength={120}
              placeholder="VD: 12 Trần Phú"
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1 text-[13px] text-zinc-500">
            Còn biết gì thêm không?
            <textarea
              className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
              value={note}
              rows={2}
              maxLength={200}
              placeholder="VD: Mở buổi sáng, bán tới trưa là hết"
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-3">
        <button
          type="button"
          disabled={busy || !name.trim()}
          onClick={handleSubmit}
          className="cdp-pressable w-full cursor-pointer rounded-lg bg-[#c8553d] px-4 py-3 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
        >
          {busy ? "Đang gửi..." : "Thêm vào lộ trình & gửi CDP"}
        </button>
      </div>
    </div>
  );
}
