"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkRouteOwnership } from "./routeActions";
import { loadLocalContributor } from "./ContributionPanel";
import { useRouteShare } from "./useShareActions";
import { RouteShareLinkNotice } from "./RouteCardActions";

// Khối hành động ở trang xem lộ trình. Chỉ chủ lộ trình mới thấy — người khác vào bản sống này
// thì không có gì để bấm (link chia sẻ là một trang khác: /lo-trinh/xem/{token}).
//
// §P5: "Chia sẻ" là hành động ĐỘC LẬP, không bắt lưu hay đặt tên trước — lộ trình đã tồn tại
// từ lúc tạo nên bấm là chia sẻ được ngay.
export function RouteOwnerActions({ slug, stopCount = 0 }) {
  const [isOwner, setIsOwner] = useState(null); // null = chưa biết
  const { share: handleShare, shareLink, label, busy } = useRouteShare({
    slug,
    stopCount,
    idleLabel: "Chia sẻ lộ trình",
  });

  useEffect(() => {
    const local = loadLocalContributor();
    checkRouteOwnership({ anonId: local?.anonId, slug }).then((res) => setIsOwner(res.isOwner));
  }, [slug]);

  if (isOwner === null || !isOwner) return null; // đợi biết chắc mới hiện, tránh nhấp nháy

  return (
    <div className="mb-6 flex flex-col gap-2">
      <button
        type="button"
        disabled={busy || stopCount === 0}
        onClick={handleShare}
        className="cdp-pressable w-full cursor-pointer rounded-lg bg-[#c8553d] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
      >
        {label}
      </button>
      <Link
        href={`/lo-trinh/${slug}/sua`}
        className="cdp-pressable block w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
      >
        Sửa lộ trình
      </Link>

      {shareLink && <RouteShareLinkNotice url={shareLink} />}
      {stopCount === 0 && (
        <p className="text-xs text-zinc-400">Thêm ít nhất 1 điểm rồi mới chia sẻ được.</p>
      )}
    </div>
  );
}
