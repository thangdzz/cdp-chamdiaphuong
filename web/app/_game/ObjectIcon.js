"use client";

import Image from "next/image";
import { useState } from "react";
import { badgeHtml, badgeSpec } from "@/lib/game/badge";

const BLOB_URL = /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i;

const SIZE_PX = { xs: 28, sm: 40, md: 64, lg: 96 };

/**
 * Mode A — chỉ huy hiệu (NOTE-07 §5): lưới bộ sưu tập, popup mở khoá, nhiệm vụ, danh sách chọn.
 * state: "locked" (chưa gặp) · "met" (đã gặp, dấu ✓) · "unlocked" (vừa mở: bật lên + phát sáng) ·
 *        "plain" (không trạng thái). HTML dựng từ dữ liệu tĩnh của mùa (emoji admin gõ đã được escape).
 */
export function ObjectIcon({ object, event, size = "md", state = "plain", className = "" }) {
  const px = typeof size === "number" ? size : (SIZE_PX[size] ?? SIZE_PX.md);
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 ${className}`}
      dangerouslySetInnerHTML={{ __html: badgeHtml(badgeSpec(object, event), { size: px, state }) }}
    />
  );
}

/**
 * Mode C — ảnh thật + huy hiệu nhỏ góc trên trái (NOTE-07 §5). Chưa có ảnh hoặc ảnh lỗi thì hiện
 * `fallback` (thường là huy hiệu Mode A). Không bao giờ hiện ảnh vỡ (NOTE-04 §23).
 */
export function ObjectMedia({ object, event, state = "plain", sizes = "(max-width: 640px) 50vw, 240px", className = "", fallback = null }) {
  const [broken, setBroken] = useState(false);
  // next/image chỉ nhận host đã khai báo (Vercel Blob) — URL lạ dùng huy hiệu luôn.
  if (!BLOB_URL.test(object?.photoUrl ?? "") || broken) return fallback;
  return (
    <span className={`relative block overflow-hidden rounded-xl bg-zinc-100 ${className}`}>
      <Image
        src={object.photoUrl}
        alt=""
        fill
        sizes={sizes}
        className={`object-cover transition-[filter] duration-300 ${state === "locked" ? "grayscale" : ""}`}
        onError={() => setBroken(true)}
      />
      {/* Nền tối nhẹ + viền trắng mỏng để huy hiệu không chìm vào ảnh sáng. */}
      <span className="absolute left-1.5 top-1.5 flex rounded-full bg-black/30 p-0.5 ring-1 ring-white/70">
        <ObjectIcon object={object} event={event} size={36} state={state === "locked" ? "locked" : "plain"} />
      </span>
    </span>
  );
}
