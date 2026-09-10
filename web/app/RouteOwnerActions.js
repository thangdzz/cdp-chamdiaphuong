"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { checkRouteOwnership, shareRoute } from "./routeActions";
import { loadLocalContributor } from "./ContributionPanel";
import { SITE_URL } from "@/lib/siteUrl";

// Khối hành động ở trang xem lộ trình. Chỉ chủ lộ trình mới thấy — người khác vào bản sống này
// thì không có gì để bấm (link chia sẻ là một trang khác: /lo-trinh/xem/{token}).
//
// §P5: "Chia sẻ" là hành động ĐỘC LẬP, không bắt lưu hay đặt tên trước — lộ trình đã tồn tại
// từ lúc tạo nên bấm là chia sẻ được ngay.
export function RouteOwnerActions({ slug, stopCount = 0 }) {
  const [isOwner, setIsOwner] = useState(null); // null = chưa biết
  const [shareLink, setShareLink] = useState(null);
  const [label, setLabel] = useState("Chia sẻ lộ trình");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const local = loadLocalContributor();
    checkRouteOwnership({ anonId: local?.anonId, slug }).then((res) => setIsOwner(res.isOwner));
  }, [slug]);

  async function handleShare() {
    if (busyRef.current || stopCount === 0) return;
    busyRef.current = true;
    setBusy(true);
    setLabel("Đang tạo link...");
    try {
      const local = loadLocalContributor();
      const result = await shareRoute({ anonId: local?.anonId, slug });
      if (!result.ok) {
        setLabel(result.error ?? "Chưa tạo được link");
        setTimeout(() => setLabel("Chia sẻ lộ trình"), 2500);
        return;
      }
      const url = `${SITE_URL}/lo-trinh/xem/${result.token}`;
      setShareLink(url);
      try {
        if (navigator.share) await navigator.share({ title: "Lộ trình", url });
        else await navigator.clipboard.writeText(url);
        setLabel("✓ Đã tạo link chia sẻ");
      } catch {
        setLabel("✓ Đã tạo link chia sẻ"); // khách huỷ hộp chia sẻ — link vẫn hiện bên dưới
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

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

      {shareLink && (
        <div className="cdp-fade-in rounded-lg border border-zinc-200 bg-white p-3">
          <p className="break-all text-[13px] text-zinc-700">{shareLink}</p>
          {/* Nói thật cơ chế bản chụp: sửa xong phải bấm lại mới có link mới. Im lặng chuyện
              này thì chủ lộ trình tưởng link cũ tự cập nhật theo. */}
          <p className="mt-1.5 text-xs text-zinc-500">
            Link này giữ nguyên nội dung lúc bạn vừa bấm. Sửa lộ trình xong, bấm &quot;Chia sẻ&quot;
            lần nữa để có link mới.
          </p>
        </div>
      )}
      {stopCount === 0 && (
        <p className="text-xs text-zinc-400">Thêm ít nhất 1 điểm rồi mới chia sẻ được.</p>
      )}
    </div>
  );
}
