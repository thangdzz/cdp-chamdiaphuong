"use client";

import { useState } from "react";
import { BottomSheet } from "./BottomSheet";
import { ObjectIcon } from "./ObjectIcon";
import { reportWrongLocation } from "@/app/gameActions";
import { loadLocalContributor } from "@/app/ContributionPanel";
import { OBJECT_KIND, VERIFICATION_LABEL, objectDisplayName } from "@/lib/game/catalog";
import { formatAgo } from "@/lib/game/format";
import { confidenceLabel } from "@/lib/game/mapLayer";

export function ObjectSheet({
  open,
  onClose,
  event,
  object,
  marker,
  met,
  first,
  myHash,
  sightingCount,
  now,
  canReport,
  onReport,
}) {
  const noun = event.copy.objectNoun;
  const [flagState, setFlagState] = useState("idle");
  if (!object) return null;
  const category = event.categories.find((c) => c.id === object.category);
  const meta = [category?.label, object.ward, object.neighborhood].filter(Boolean).join(" · ");

  async function flag() {
    setFlagState("sending");
    const result = await reportWrongLocation({
      slug: event.slug,
      anonId: loadLocalContributor()?.anonId,
      sightingId: marker.id,
    });
    setFlagState(result.ok ? "sent" : "idle");
  }

  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="game-object-title">
      <div className="flex items-start gap-4 pt-2">
        <ObjectIcon object={object} categories={event.categories} size="lg" muted={!met && !marker} />
        <div className="min-w-0 flex-1 pt-1">
          <h2 id="game-object-title" className="text-xl font-medium leading-snug tracking-tight text-zinc-900">
            {objectDisplayName(object, noun)}
          </h2>
          {meta && <p className="mt-0.5 text-[13px] text-zinc-500">{meta}</p>}
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                met ? "bg-[#fbf0d9] text-[#8a5a10]" : "bg-zinc-100 text-zinc-500"
              }`}
            >
              {met ? "✓ Đã Chạm" : "Chưa gặp"}
            </span>
            {object.kind === OBJECT_KIND.MODEL && (
              <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500">
                {VERIFICATION_LABEL[object.verificationStatus]}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Luôn "được nhìn thấy ở đây X phút trước", không bao giờ "đang ở đây" (NOTE-04 §6). */}
      {marker && (
        <div className="mt-5 rounded-xl bg-[#f7f0e6] px-4 py-3">
          <p className="text-[15px] text-zinc-900">
            Được nhìn thấy ở đây <b className="font-medium">{formatAgo(marker.lastSeenAt, now)}</b>
          </p>
          <p className="mt-1 text-[13px] text-zinc-600">
            {marker.people > 1
              ? `${marker.people} người đã báo gần khu vực này`
              : "1 người đã báo gần khu vực này"}{" "}
            · {confidenceLabel(marker)}
          </p>
          {marker.conflicting && (
            <p className="mt-1 text-[13px] text-[#8a5a10]">📍 Có báo cáo khác ở chỗ xa hơn — mô hình có thể đã di chuyển.</p>
          )}
        </div>
      )}

      {object.kind === OBJECT_KIND.UNKNOWN && object.hint && (
        <p className="mt-4 text-sm text-zinc-700">Gợi ý: {object.hint}</p>
      )}
      {object.description && <p className="mt-4 text-sm leading-6 text-zinc-700">{object.description}</p>}
      {object.story && <p className="mt-3 text-sm leading-6 text-zinc-600">{object.story}</p>}

      <div className="mt-4 flex flex-col gap-1 text-[13px] text-zinc-500">
        {sightingCount > 0 && <p>Cộng đồng đã báo {sightingCount} lượt</p>}
        {first && (
          <p>
            {first.anonIdHash && first.anonIdHash === myHash
              ? "✨ Bạn là người ghi nhận đầu tiên"
              : `Ghi nhận đầu tiên bởi ${
                  first.nickname && first.nickname !== "Người ẩn danh" ? `@${first.nickname}` : "một người chơi ẩn danh"
                }`}
          </p>
        )}
      </div>

      {canReport && (
        <button
          type="button"
          onClick={() => onReport(object.id, marker)}
          className="cdp-pressable mt-5 flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-[#c8553d] text-[15px] font-medium text-white shadow-sm"
        >
          {event.copy.reportIcon} {marker ? "Tôi cũng vừa thấy" : `Tôi vừa thấy ${noun} này`}
        </button>
      )}

      {marker && (
        <div className="mt-2 text-center">
          {flagState === "sent" ? (
            <p className="py-3 text-[13px] text-zinc-500">Cảm ơn, CDP sẽ xem lại vị trí này.</p>
          ) : (
            <button
              type="button"
              disabled={flagState === "sending"}
              onClick={flag}
              className="min-h-11 cursor-pointer px-3 text-[13px] text-zinc-400 underline-offset-2 hover:underline"
            >
              Vị trí này không đúng?
            </button>
          )}
        </div>
      )}
    </BottomSheet>
  );
}
