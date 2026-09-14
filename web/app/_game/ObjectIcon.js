"use client";

import Image from "next/image";
import { useState } from "react";
import { objectIcon } from "@/lib/game/catalog";

const BLOB_URL = /^https:\/\/[a-z0-9.-]+\.public\.blob\.vercel-storage\.com\//i;

const SIZES = {
  sm: { box: "h-10 w-10 text-[22px]", px: 40 },
  md: { box: "h-16 w-16 text-[36px]", px: 64 },
  lg: { box: "h-24 w-24 text-[56px]", px: 96 },
};

// Ảnh thật thay dần icon (NOTE-04 §2): có ảnh thì dùng ảnh, ảnh lỗi thì quay về emoji theo
// object/category — không bao giờ hiện ảnh vỡ (NOTE-04 §23).
export function ObjectIcon({ object, categories, size = "md", muted = false, className = "" }) {
  const [broken, setBroken] = useState(false);
  const spec = SIZES[size] ?? SIZES.md;
  // next/image chỉ nhận host đã khai báo trong next.config.mjs (Vercel Blob). URL lạ thì dùng
  // icon luôn thay vì để trang báo lỗi.
  const showPhoto = BLOB_URL.test(object?.photoUrl ?? "") && !broken;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#fbf3e6] leading-none ${spec.box} ${
        muted ? "opacity-45 grayscale" : ""
      } ${className}`}
      aria-hidden="true"
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
        <span>{objectIcon(object, categories)}</span>
      )}
    </span>
  );
}
