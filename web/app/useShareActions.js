"use client";

import { useRef, useState } from "react";
import { shareRoute } from "./routeActions";
import { loadLocalContributor } from "./ContributionPanel";
import { SITE_URL, notebookShareUrl } from "@/lib/siteUrl";

// Điện thoại mở bảng chia sẻ của máy (Zalo, Messenger...), máy tính không có thì chép link.
// Trả "cancelled" khi khách tự đóng bảng chia sẻ — không phải lỗi.
async function shareOrCopy({ title, url }) {
  try {
    if (navigator.share) await navigator.share({ title, url });
    else await navigator.clipboard.writeText(url);
    return navigator.share ? "shared" : "copied";
  } catch (error) {
    return error?.name === "AbortError" ? "cancelled" : "failed";
  }
}

/**
 * Chia sẻ lộ trình = tạo BẢN CHỤP mới (lib/routeShare.js). Dùng chung cho trang xem lộ trình và
 * thẻ trong "Lộ trình của tôi" để hai chỗ luôn cùng một hành vi.
 */
export function useRouteShare({ slug, stopCount, idleLabel }) {
  const [shareLink, setShareLink] = useState(null);
  const [label, setLabel] = useState(idleLabel);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  async function share() {
    if (busyRef.current || stopCount === 0) return;
    busyRef.current = true;
    setBusy(true);
    setLabel("Đang tạo link...");
    try {
      const local = loadLocalContributor();
      const result = await shareRoute({ anonId: local?.anonId, slug });
      if (!result.ok) {
        setLabel(result.error ?? "Chưa tạo được link");
        setTimeout(() => setLabel(idleLabel), 2500);
        return;
      }
      const url = `${SITE_URL}/lo-trinh/xem/${result.token}`;
      setShareLink(url);
      // Khách huỷ bảng chia sẻ thì link vẫn hiện bên dưới để tự chép.
      await shareOrCopy({ title: "Lộ trình", url });
      setLabel("✓ Đã tạo link chia sẻ");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  return { share, shareLink, label, busy };
}

/** Chia sẻ sổ = gửi link SỐNG /so/{slug} (khác lộ trình: sửa sổ thì người nhận thấy ngay). */
export function useNotebookShare({ slug, itemCount, idleLabel }) {
  const [label, setLabel] = useState(idleLabel);

  async function share() {
    if (itemCount === 0) return; // SPEC-chang-4 §9: sổ trống thì đừng cho gửi link
    const outcome = await shareOrCopy({ title: "Sổ", url: notebookShareUrl(slug) });
    if (outcome === "cancelled") return;
    setLabel(
      { shared: "✓ Đã chia sẻ", copied: "✓ Đã sao chép link", failed: "Chưa chia sẻ được" }[outcome]
    );
    setTimeout(() => setLabel(idleLabel), 2000);
  }

  return { share, label };
}
