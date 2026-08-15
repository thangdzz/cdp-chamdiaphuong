"use client";

import { useEffect, useRef, useState } from "react";
import { checkin, getCheckinStatus } from "./checkinActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

export function CheckinButton({ place, onCheckedIn }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    const local = loadLocalContributor();
    if (!local?.anonId) return;
    getCheckinStatus({ anonId: local.anonId, placeId: place.id }).then((res) => {
      if (res.checkedIn) setCheckedIn(true);
    });
  }, [place.id]);

  async function handleClick() {
    if (busyRef.current || checkedIn) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await checkin({ anonId: local?.anonId, placeId: place.id });
      if (result.newProfile) {
        saveLocalContributor({
          anonId: result.newProfile.anonId,
          nickname: result.newProfile.nickname,
          recoveryCode: result.newProfile.recoveryCode,
          categoryId: local?.categoryId ?? null,
        });
      }
      setJustConfirmed(result.pointsAwarded);
      setCheckedIn(true);
      if (!result.alreadyCheckedIn && result.at) onCheckedIn?.(result.at);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  if (checkedIn) {
    return (
      <div className="mt-2 flex flex-col gap-0.5">
        <span className="inline-flex w-fit items-center gap-1 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400">
          ✓ Cảm ơn bạn{justConfirmed ? " · +1 điểm" : ""}
        </span>
        {!justConfirmed && <p className="text-xs text-zinc-400">Bạn đã xác nhận hôm nay</p>}
      </div>
    );
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-50"
      >
        {busy ? "Đang gửi..." : "Tôi vừa đến, vẫn mở"}
      </button>
    </div>
  );
}
