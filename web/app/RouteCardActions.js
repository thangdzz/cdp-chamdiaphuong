"use client";

import Link from "next/link";
import { useRouteShare } from "./useShareActions";

// Nói thật cơ chế bản chụp: sửa xong phải bấm lại mới có link mới. Im lặng chuyện này thì chủ
// lộ trình tưởng link cũ tự cập nhật theo.
export function RouteShareLinkNotice({ url }) {
  return (
    <div className="cdp-fade-in rounded-lg border border-zinc-200 bg-white p-3">
      <p className="break-all text-[13px] text-zinc-700">{url}</p>
      <p className="mt-1.5 text-xs text-zinc-500">
        Link này giữ nguyên nội dung lúc bạn vừa bấm. Sửa lộ trình xong, bấm &quot;Chia sẻ&quot;
        lần nữa để có link mới.
      </p>
    </div>
  );
}

// Hàng nút của một thẻ trong "Lộ trình của tôi": Xem · Sửa · Chia sẻ. Chia sẻ dùng đúng hook
// của trang xem lộ trình nên hai chỗ tạo cùng một loại link.
export function RouteCardActions({ slug, stopCount }) {
  const { share, shareLink, label, busy } = useRouteShare({ slug, stopCount, idleLabel: "Chia sẻ" });

  return (
    <>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/lo-trinh/${slug}`}
          className="cdp-pressable rounded-lg bg-zinc-100 px-4 py-1.5 text-sm font-medium text-zinc-700"
        >
          Xem
        </Link>
        <Link
          href={`/lo-trinh/${slug}/sua`}
          className="cdp-pressable rounded-lg bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white"
        >
          Sửa
        </Link>
        <button
          type="button"
          disabled={busy || stopCount === 0}
          onClick={share}
          className="cdp-pressable cursor-pointer rounded-lg bg-[#c8553d] px-4 py-1.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
        >
          {label}
        </button>
      </div>
      {shareLink && (
        <div className="mt-3">
          <RouteShareLinkNotice url={shareLink} />
        </div>
      )}
    </>
  );
}
