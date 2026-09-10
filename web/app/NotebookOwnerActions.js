"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveNotebookAsMine, checkNotebookOwnership } from "./notebookActions";
import { createRouteFromNotebookAction } from "./routeActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { notebookShareUrl } from "@/lib/siteUrl";

// Khối hành động của trang xem sổ (SPEC-chang-4.md §3.2, §3.4). Từ 2026-09-09 nằm NGAY DƯỚI
// tên sổ thay vì cuối trang (NOTE-03 §6 xếp CTA ở bậc 5, trên danh sách): chủ sổ mở link ra
// chủ yếu là để gửi đi, mà nút gửi nằm cuối thì phải cuộn hết cả cuốn sổ mới thấy.
// Trước đây luôn hiện 2 nút "Lưu sổ này thành
// sổ của tôi" / "Tự tạo sổ của riêng bạn" bất kể ai xem — gây nhầm khi chính CHỦ SỔ tự xem
// sổ của mình (2 lựa chọn đó đều vô nghĩa lúc đó). Giờ chỉ hiện đúng 1 nút theo đúng người
// đang xem: chủ sổ → "Sao chép link" + "Sửa sổ này"; người khác → "Lưu sổ này thành sổ của
// tôi" (bỏ hẳn nút "Tự tạo sổ của riêng bạn" — thừa, đã có link "Sổ của tôi" trên đầu trang
// dẫn tới đúng chỗ đó rồi). checkNotebookOwnership() không lộ ai là chủ sổ thật — chỉ trả
// đúng/sai riêng cho người đang xem.
// "Sao chép link" trước đây chỉ có ở trang Sửa, chủ sổ phải bấm thêm 1 bước mới lấy được
// link — giờ thêm luôn ở đây cho tiện (2026-08-20, phản hồi thật lúc anh tự bấm thử).
export function NotebookOwnerActions({ slug, itemCount = 0 }) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(null); // null = chưa biết
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [copyLabel, setCopyLabel] = useState("Sao chép link");
  const [routeLabel, setRouteLabel] = useState("Tạo lộ trình từ sổ này");

  useEffect(() => {
    const local = loadLocalContributor();
    checkNotebookOwnership({ anonId: local?.anonId, slug }).then((res) => setIsOwner(res.isOwner));
  }, [slug]);

  async function saveAsMine() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await saveNotebookAsMine({ anonId: local?.anonId, sourceSlug: slug });
      if (result.newProfile) {
        saveLocalContributor({
          anonId: result.newProfile.anonId,
          nickname: result.newProfile.nickname,
          recoveryCode: result.newProfile.recoveryCode,
          categoryId: local?.categoryId ?? null,
        });
      }
      if (result.ok) {
        router.push(`/so/${result.slug}/sua`);
      }
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  // §P4: Sổ là bộ sưu tập, Lộ trình là chuyến đi có thứ tự. Đây là lối đi tự nhiên giữa hai
  // cái: ai đã gom sẵn một cuốn sổ thì không phải bấm lại từng chỗ. SỔ GỐC KHÔNG ĐỔI.
  async function makeRoute() {
    if (busyRef.current || itemCount === 0) return;
    busyRef.current = true;
    setBusy(true);
    setRouteLabel("Đang tạo...");
    try {
      const local = loadLocalContributor();
      const result = await createRouteFromNotebookAction({ anonId: local?.anonId, slug });
      if (result.ok) {
        router.push(`/lo-trinh/${result.slug}/sua`);
        return;
      }
      setRouteLabel(result.error ?? "Chưa tạo được");
      setTimeout(() => setRouteLabel("Tạo lộ trình từ sổ này"), 2500);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function copyLink() {
    if (itemCount === 0) return; // §9: sổ trống thì đừng cho gửi link
    const url = notebookShareUrl(slug);
    try {
      await navigator.clipboard.writeText(url);
      setCopyLabel("✓ Đã sao chép");
      setTimeout(() => setCopyLabel("Sao chép link"), 2000);
    } catch {
      setCopyLabel("Không sao chép được, tự chọn link.");
    }
  }

  if (isOwner === null) return null; // đợi biết chắc mới hiện, tránh nhấp nháy sai nút

  if (isOwner) {
    return (
      <div className="mb-6 flex flex-col gap-2">
        <button
          type="button"
          disabled={itemCount === 0}
          onClick={copyLink}
          className="cdp-pressable w-full rounded-lg bg-[#c8553d] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40"
        >
          {copyLabel}
        </button>
        <Link
          href={`/so/${slug}/sua`}
          className="cdp-pressable block w-full rounded-lg bg-zinc-100 px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
        >
          Sửa sổ này
        </Link>
        <button
          type="button"
          disabled={busy || itemCount === 0}
          onClick={makeRoute}
          className="cdp-pressable w-full cursor-pointer rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 disabled:cursor-default disabled:opacity-40"
        >
          {routeLabel}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        disabled={busy}
        onClick={saveAsMine}
        className="cdp-pressable w-full rounded-lg bg-[#c8553d] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Đang lưu..." : "Lưu sổ này thành sổ của tôi"}
      </button>
    </div>
  );
}
