"use client";

import { useEffect, useRef, useState } from "react";
import { confirmPhone, fetchPhoneStatus } from "./phoneActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { PhoneIcon } from "./Icon";
import { findPhoneOnGoogleUrl } from "@/lib/transport";
import { CallButton, PhoneLinks, phoneDisplayText } from "./CallPhone";

// Khối "Liên hệ" trong thẻ đã bung (NOTE-01 §6.2). Trước đây số điện thoại KHÔNG hề hiện dạng
// chữ ở đâu — khách chỉ có đúng 1 nút gọi, không đọc/copy được số, và không có cách nào biết
// số đó còn đúng hay không.
//
// Khác NOTE-01 §6.1 một điểm, theo quyết định của anh 2026-09-08: VẪN giữ nút Gọi kể cả khi
// chưa ai xác nhận (áp ngưỡng ngay sẽ làm 85/85 nút gọi biến mất trong khi chưa ai kịp xác
// nhận). Thay vào đó nói thật độ tin cậy bằng nhãn, và khi chưa ai xác nhận thì đưa luôn nút
// "Tìm số trên Google" để khách tự kiểm chứng.

const btnClass =
  "cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600 disabled:cursor-default disabled:opacity-50";

function statusLine(status, confirmCount) {
  if (status === "disputed") return { text: "Có báo cáo số này không đúng", tone: "warn" };
  if (status === "confirmed") {
    return { text: `${confirmCount} người đã xác nhận số này`, tone: "ok" };
  }
  return { text: "Chưa ai xác nhận số này", tone: "muted" };
}

// `part`: "all" (mặc định, như cũ) · "contact" (số + trạng thái + Gọi/Tìm số) ·
// "confirm" (chỉ Số đúng / Số sai) · "inline" (trang địa điểm, PO 30/9: số bấm gọi + "số tham
// khảo" + trạng thái + link nhỏ Tìm số này trên Google / Số đúng / Số sai — không thêm nút lớn nào).
export function PhoneBlock({ place, part = "all" }) {
  const showContact = part !== "confirm";
  const showConfirm = part !== "contact";
  const [state, setState] = useState(null); // { status, confirmCount, myVote }
  const [justAwarded, setJustAwarded] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!place.phone) return;
    const local = loadLocalContributor();
    fetchPhoneStatus({ anonId: local?.anonId ?? null, placeId: place.id, phone: place.phone }).then(
      setState
    );
  }, [place.id, place.phone]);

  if (!place.phone) return null;

  async function vote(status) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const local = loadLocalContributor();
      const result = await confirmPhone({
        anonId: local?.anonId ?? null,
        placeId: place.id,
        phone: place.phone,
        status,
      });
      if (!result.ok) return;
      if (result.newProfile) {
        saveLocalContributor({
          anonId: result.newProfile.anonId,
          nickname: result.newProfile.nickname,
          recoveryCode: result.newProfile.recoveryCode,
          categoryId: local?.categoryId ?? null,
        });
      }
      setJustAwarded(result.pointsAwarded);
      setState({ status: result.status, confirmCount: result.confirmCount, myVote: result.myVote });
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }


  const line = statusLine(state?.status, state?.confirmCount ?? 0);
  // Chưa ai xác nhận hoặc đang có báo sai -> mời khách tự kiểm chứng bằng Google (NOTE-01 §6.3).
  const showGoogle = !state || state.status === "none" || state.status === "disputed";

  if (part === "inline") {
    const smallLink =
      "cursor-pointer text-[13px] text-zinc-600 underline decoration-zinc-300 underline-offset-2 disabled:cursor-default disabled:opacity-50";
    return (
      <div className="flex items-start gap-1.5">
        <PhoneIcon size={16} className="mt-1 shrink-0 text-zinc-400" />
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2">
            {/* Ô nhiều số: mỗi số một link gọi riêng (CallPhone.js), không nối cả chuỗi vào tel:. */}
            <span>
              <PhoneLinks phone={place.phone} linkClassName="text-zinc-800 underline decoration-zinc-300 underline-offset-2" />
            </span>
            <span className="text-[13px] text-zinc-500">
              số tham khảo · {line.text.charAt(0).toLowerCase() + line.text.slice(1)}
              {justAwarded && " · +1 điểm"}
            </span>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3">
            {showGoogle && (
              <a href={findPhoneOnGoogleUrl(place)} target="_blank" rel="noopener noreferrer" className={smallLink}>
                Tìm số này trên Google
              </a>
            )}
            <button type="button" disabled={busy} onClick={() => vote("correct")} className={smallLink}>
              {state?.myVote === "correct" ? "✓ Bạn đã xác nhận đúng" : "Số đúng"}
            </button>
            <button type="button" disabled={busy} onClick={() => vote("incorrect")} className={smallLink}>
              {state?.myVote === "incorrect" ? "✓ Bạn đã báo sai" : "Số sai"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  if (!showContact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[13px] text-zinc-500">Số {phoneDisplayText(place.phone)} còn đúng không?</span>
        <button type="button" disabled={busy} onClick={() => vote("correct")} className={btnClass}>
          {state?.myVote === "correct" ? "✓ Bạn đã xác nhận đúng" : "Số đúng"}
        </button>
        <button type="button" disabled={busy} onClick={() => vote("incorrect")} className={btnClass}>
          {state?.myVote === "incorrect" ? "✓ Bạn đã báo sai" : "Số sai"}
        </button>
        {justAwarded && <span className="text-[13px] text-zinc-500">+1 điểm</span>}
      </div>
    );
  }

  return (
    <div>
      {part === "all" && <p className="mb-1.5 text-[13px] text-zinc-500">Liên hệ</p>}

      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-base tracking-tight text-zinc-900">{phoneDisplayText(place.phone)}</span>
        <span className="text-xs text-zinc-400">số tham khảo</span>
      </div>

      {/* Màu theo SPEC-giao-dien.md §4 (1 màu nhấn): xanh lá dành RIÊNG cho "Còn mở" nên
          "N người đã xác nhận" chỉ dùng xám; cảnh báo số sai dùng đỏ (giống cách báo lỗi ở
          ContributionPanel) chứ không dùng hổ phách — hổ phách quá gần cam CDP, nhìn dễ tưởng
          là màu nhấn của thương hiệu. */}
      <p
        className={`mt-1 text-[13px] ${
          line.tone === "warn" ? "text-red-700" : line.tone === "ok" ? "text-zinc-500" : "text-zinc-400"
        }`}
      >
        {line.text}
        {justAwarded && " · +1 điểm"}
      </p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <CallButton phone={place.phone} className={btnClass}>
          <PhoneIcon size={15} className="mr-1.5" />
          Gọi
        </CallButton>

        {showGoogle && (
          <a
            href={findPhoneOnGoogleUrl(place)}
            target="_blank"
            rel="noopener noreferrer"
            className={btnClass}
          >
            Tìm số trên Google
          </a>
        )}

        {showConfirm && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => vote("correct")}
              className={`${btnClass} ${state?.myVote === "correct" ? "border-zinc-400 text-zinc-900" : ""}`}
            >
              {state?.myVote === "correct" ? "✓ Bạn đã xác nhận đúng" : "Số đúng"}
            </button>

            <button
              type="button"
              disabled={busy}
              onClick={() => vote("incorrect")}
              className={`${btnClass} ${state?.myVote === "incorrect" ? "border-zinc-400 text-zinc-900" : ""}`}
            >
              {state?.myVote === "incorrect" ? "✓ Bạn đã báo sai" : "Số sai"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
