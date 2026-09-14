"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { saveSharedRouteAsMine } from "./routeActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

export function SharedRouteSaveAction({ token }) {
  const [busy, setBusy] = useState(false);
  const [savedSlug, setSavedSlug] = useState(null);
  const [error, setError] = useState(null);
  const busyRef = useRef(false);

  async function saveCopy() {
    if (busyRef.current || savedSlug) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    try {
      const local = loadLocalContributor();
      const result = await saveSharedRouteAsMine({ anonId: local?.anonId, token });
      if (result.newProfile) {
        saveLocalContributor({
          anonId: result.newProfile.anonId,
          nickname: result.newProfile.nickname,
          recoveryCode: result.newProfile.recoveryCode,
          categoryId: local?.categoryId ?? null,
        });
      }
      if (!result.ok) {
        setError(result.error ?? "Chưa lưu được lộ trình. Thử lại nhé.");
        return;
      }
      setSavedSlug(result.slug);
    } catch {
      setError("Chưa lưu được lộ trình. Thử lại nhé.");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  return (
    <div className="mb-5 rounded-xl border border-orange-100 bg-orange-50 p-3">
      <p className="text-sm text-zinc-700">
        Bạn đang xem lộ trình do người khác chia sẻ. Lưu một bản để chỉnh theo ý mình.
      </p>
      {savedSlug ? (
        <>
          <p className="mt-2 text-sm font-medium text-emerald-700">✓ Đã lưu thành lộ trình của bạn.</p>
          <Link
            href={`/lo-trinh/${savedSlug}/sua`}
            className="cdp-pressable mt-2 block w-full rounded-lg bg-[#c8553d] px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            Sửa lộ trình của tôi
          </Link>
        </>
      ) : (
        <button
          type="button"
          disabled={busy}
          onClick={saveCopy}
          className="cdp-pressable mt-2 w-full cursor-pointer rounded-lg bg-[#c8553d] px-4 py-2.5 text-sm font-medium text-white disabled:cursor-default disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Lưu lộ trình này"}
        </button>
      )}
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
