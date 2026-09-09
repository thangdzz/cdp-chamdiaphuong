"use client";

import { useState } from "react";

// Chia sẻ MỘT địa điểm — luôn trỏ tới trang địa điểm riêng `/dia-diem/{id}`, không bao giờ
// mượn link Sổ (NOTE-02 §1). Ưu tiên hộp chia sẻ của máy (Zalo/Messenger...), máy nào không
// hỗ trợ thì copy link — đúng cách NotebookOwnerActions.js đang làm cho Sổ.
export function SharePlaceButton({ place }) {
  const [label, setLabel] = useState("Chia sẻ");

  async function handleShare() {
    const url = `${window.location.origin}/dia-diem/${place.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: place.name, url });
        return;
      } catch {
        // Khách bấm huỷ hộp chia sẻ — không phải lỗi, rơi xuống copy link bên dưới.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setLabel("Đã sao chép link");
    } catch {
      setLabel("Không sao chép được");
    }
    setTimeout(() => setLabel("Chia sẻ"), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="cdp-pressable inline-flex min-h-11 w-fit cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
    >
      {label}
    </button>
  );
}
