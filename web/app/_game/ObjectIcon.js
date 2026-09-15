"use client";

import Image from "next/image";
import { useState } from "react";
import { objectIconSpec } from "@/lib/game/catalog";

const BLOB_URL = /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i;

const SIZES = {
  sm: { box: "h-10 w-10 text-[22px]", badge: "h-4 w-4 text-[10px] -bottom-0.5 -right-0.5", check: "h-3.5 w-3.5 text-[8px]", px: 40 },
  md: { box: "h-16 w-16 text-[36px]", badge: "h-6 w-6 text-[14px] -bottom-0.5 -right-0.5", check: "h-5 w-5 text-[11px]", px: 64 },
  lg: { box: "h-24 w-24 text-[56px]", badge: "h-9 w-9 text-[20px] bottom-0 right-0", check: "h-7 w-7 text-sm", px: 96 },
};

/**
 * Icon mô hình (NOTE-05 §12–§13). Ảnh thật thay dần icon; ảnh lỗi thì quay về icon — không bao giờ
 * hiện ảnh vỡ (NOTE-04 §23).
 * state: "locked" (chưa gặp: xám, mờ) · "met" (đã gặp: đủ màu, viền sáng, dấu ✓) ·
 *        "unlocked" (vừa mở: bật lên + phát sáng) · "plain" (không trạng thái)
 */
export function ObjectIcon({ object, event, size = "md", state = "plain", className = "" }) {
  const [broken, setBroken] = useState(false);
  const spec = SIZES[size] ?? SIZES.md;
  const icon = objectIconSpec(object, event);
  // next/image chỉ nhận host đã khai báo trong next.config.mjs (Vercel Blob). URL lạ thì dùng
  // icon luôn thay vì để trang báo lỗi.
  const showPhoto = BLOB_URL.test(object?.photoUrl ?? "") && !broken;
  const locked = state === "locked";
  const met = state === "met" || state === "unlocked";

  return (
    <span
      className={`relative inline-flex shrink-0 ${state === "unlocked" ? "cdp-game-icon-unlock" : ""} ${className}`}
      aria-hidden="true"
    >
      <span
        style={{ backgroundColor: icon.tint }}
        className={`relative inline-flex items-center justify-center overflow-hidden rounded-full leading-none transition-[filter,opacity] duration-300 ${spec.box} ${
          locked ? "opacity-45 grayscale" : ""
        } ${met ? "shadow-[0_0_0_3px_rgba(224,165,38,0.35),0_4px_14px_-4px_rgba(224,165,38,0.6)]" : ""}`}
      >
        {showPhoto ? (
          <Image
            src={object.photoUrl}
            alt=""
            width={spec.px}
            height={spec.px}
            sizes={`${spec.px}px`}
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span>{icon.glyph}</span>
        )}
      </span>
      {icon.badge && !showPhoto && (
        <span
          className={`absolute flex items-center justify-center rounded-full bg-white leading-none shadow-sm ${spec.badge} ${
            locked ? "opacity-45 grayscale" : ""
          }`}
        >
          {icon.badge}
        </span>
      )}
      {met && (
        <span
          className={`absolute -left-0.5 -top-0.5 flex items-center justify-center rounded-full bg-[#e0a526] font-bold leading-none text-white ring-2 ring-white ${spec.check}`}
        >
          ✓
        </span>
      )}
    </span>
  );
}
