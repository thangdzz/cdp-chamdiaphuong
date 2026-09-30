"use client";

import { useEffect, useRef, useState } from "react";
import { checkin, getCheckinStatus } from "./checkinActions";
import { ContributionPanel, loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// Xác nhận trạng thái HAI BƯỚC (Product Owner duyệt 30/9) — thay cho nút "Vẫn mở" một chạm ở đầu
// trang địa điểm, để khách không hiểu "bấm là mặc định xác nhận còn mở":
//
//   Bước 1 — "Bạn vừa ghé chỗ này?" [Đúng, mình vừa ghé] [Không]
//            Chỉ là câu hỏi mở đường (visit confirmation). KHÔNG ghi gì, không gửi gì lên máy chủ.
//   Bước 2 — "Chỗ này vẫn mở chứ?" [Vẫn mở] [Đã đóng cửa] [Không rõ]
//            Chỉ tới đây mới ghi (place confirmation), và chỉ đúng thứ khách chọn:
//              Vẫn mở     → lượt xác nhận "vẫn mở" sẵn có (lib/checkins.js, +1 điểm như cũ)
//              Đã đóng cửa → form báo đóng cửa sẵn có (ContributionPanel), ghi khi khách GỬI, luôn qua duyệt
//              Không rõ   → đóng lại, không ghi gì
//
// Không dùng định vị: "thiết bị ở gần" (presence) chưa làm trong vNext — xem INBOX.

const linkClass = "cursor-pointer text-[13px] font-medium text-[#c8553d] underline decoration-[#c8553d]/30 underline-offset-2";
const choiceClass =
  "cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 bg-white px-3 text-[13px] font-medium text-zinc-700 disabled:cursor-default disabled:opacity-50";

export function VisitConfirm({ place, onCheckedIn }) {
  // idle → askVisit → askStatus → (thanks | closedForm) ; "done" = đã xác nhận hôm nay
  const [step, setStep] = useState("idle");
  const [awarded, setAwarded] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  // Hôm nay người này đã xác nhận rồi thì không hỏi lại (cùng luật với nút "Vẫn mở" cũ).
  useEffect(() => {
    const local = loadLocalContributor();
    if (!local?.anonId) return;
    getCheckinStatus({ anonId: local.anonId, placeId: place.id }).then((res) => {
      if (res.checkedIn) setStep("done");
    });
  }, [place.id]);

  async function confirmOpen() {
    if (busyRef.current) return;
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
      setAwarded(Boolean(result.pointsAwarded));
      setStep("thanks");
      if (!result.alreadyCheckedIn && result.at) onCheckedIn?.(result.at);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  if (step === "done") {
    return <span className="text-[13px] text-zinc-400">✓ Bạn đã xác nhận hôm nay</span>;
  }
  if (step === "thanks") {
    return <span className="cdp-fade-in text-[13px] font-medium text-zinc-500">✓ Cảm ơn bạn{awarded ? " · +1 điểm" : ""}</span>;
  }
  if (step === "idle") {
    return (
      <button type="button" onClick={() => setStep("askVisit")} className={linkClass}>
        Bạn vừa ghé chỗ này?
      </button>
    );
  }

  return (
    <div className="cdp-fade-in mt-2 w-full rounded-lg bg-zinc-50 p-3">
      {step === "askVisit" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-full text-sm text-zinc-700">Bạn vừa ghé chỗ này?</span>
          <button type="button" onClick={() => setStep("askStatus")} className={choiceClass}>
            Đúng, mình vừa ghé
          </button>
          <button type="button" onClick={() => setStep("idle")} className={choiceClass}>
            Không
          </button>
        </div>
      )}
      {step === "askStatus" && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-full text-sm text-zinc-700">Chỗ này vẫn mở chứ?</span>
          <button type="button" disabled={busy} onClick={confirmOpen} className={choiceClass}>
            {busy ? "Đang gửi..." : "Vẫn mở"}
          </button>
          <button type="button" disabled={busy} onClick={() => setStep("closedForm")} className={choiceClass}>
            Đã đóng cửa
          </button>
          <button type="button" disabled={busy} onClick={() => setStep("idle")} className={choiceClass}>
            Không rõ
          </button>
        </div>
      )}
      {step === "closedForm" && (
        <ContributionPanel place={place} entry="closed" startOpen onDone={() => setStep("idle")} />
      )}
    </div>
  );
}
