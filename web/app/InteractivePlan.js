"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlacePicker } from "./PlacePicker";
import { createRouteFromPlan } from "./routeActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// "Bạn định đi thế nào?" (CDP_P1-P8 §P3) — khung giờ bỏ trống, khách bấm điền chỗ của mình.
//
// Đây là chỗ nối Post với Lộ trình: đọc lịch xong thì bắt tay vào xếp buổi tối của mình ngay
// tại đó, thay vì phải nhớ tên quán rồi tự mò về trang chủ tìm lại từng chỗ một.
//
// KHÔNG có bộ chọn riêng cho màn này — vẫn là PlacePicker dùng chung, chỉ khác ở chỗ mở sẵn
// đúng nhóm (bấm "Chọn chỗ ăn" thì mở sẵn nhóm Ăn) và chọn một chỗ là xong.
export function InteractivePlan({ template }) {
  const router = useRouter();
  // { [slotId]: {id, name, type, ward} } — chỗ khách đã chọn cho từng khung giờ.
  const [picked, setPicked] = useState({});
  const [openSlot, setOpenSlot] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const chosenCount = Object.keys(picked).length;

  function handlePick(slotId, places) {
    const place = places?.[0];
    if (place) setPicked((prev) => ({ ...prev, [slotId]: place }));
    setOpenSlot(null);
  }

  async function createRoute() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      // Ô khách bỏ trống thì BỎ HẲN khỏi lộ trình, không thêm một điểm rỗng để đó: khung này
      // là gợi ý, không phải biểu mẫu bắt điền đủ.
      const stops = template.slots
        .map((slot) => {
          const place = picked[slot.id];
          if (place) {
            return {
              placeId: place.id,
              name: place.name,
              plannedAt: slot.plannedAt,
              durationMinutes: slot.durationMinutes,
            };
          }
          if (slot.fixed) {
            return {
              customTitle: slot.fixed.title,
              customAddress: slot.fixed.address,
              customProvince: slot.fixed.province,
              plannedAt: slot.plannedAt,
              durationMinutes: slot.durationMinutes,
            };
          }
          return null;
        })
        .filter(Boolean);

      const local = loadLocalContributor();
      const result = await createRouteFromPlan({
        anonId: local?.anonId,
        title: template.routeTitle,
        stops,
      });
      if (result.newProfile) {
        saveLocalContributor({
          anonId: result.newProfile.anonId,
          nickname: result.newProfile.nickname,
          recoveryCode: result.newProfile.recoveryCode,
          categoryId: local?.categoryId ?? null,
        });
      }
      if (result.ok && result.slug) router.push(`/lo-trinh/${result.slug}/sua`);
      else setError(result.error ?? "Chưa tạo được lộ trình, thử lại nhé.");
    } finally {
      setBusy(false);
    }
  }

  const activeSlot = template.slots.find((s) => s.id === openSlot);

  return (
    <section className="mt-5">
      <h2 className="text-lg font-bold text-zinc-900">{template.heading}</h2>
      <p className="mt-1 text-[13px] text-zinc-500">
        Chọn chỗ cho từng khung giờ — giờ giấc sửa lại được sau.
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {template.slots.map((slot) => {
          const place = picked[slot.id];
          return (
            <li
              key={slot.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium tabular-nums text-zinc-900">
                  {slot.plannedAt ?? slot.whenText}
                </p>
                <p className="text-sm text-zinc-700">{slot.label}</p>
                {place && <p className="mt-0.5 text-[13px] text-zinc-500">{place.name}</p>}
              </div>

              {slot.fixed ? (
                <span className="shrink-0 text-xs text-zinc-400">Đã có trong lịch</span>
              ) : (
                <button
                  type="button"
                  onClick={() => setOpenSlot(slot.id)}
                  className="cdp-pressable shrink-0 cursor-pointer rounded-lg border border-zinc-300 px-3 py-1.5 text-[13px] font-medium text-zinc-700"
                >
                  {place ? "Đổi chỗ" : `+ ${slot.cta}`}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={busy || chosenCount === 0}
        onClick={createRoute}
        className="cdp-pressable mt-3 w-full cursor-pointer rounded-lg bg-[#c8553d] px-4 py-3 text-sm font-medium text-white disabled:cursor-default disabled:opacity-40"
      >
        {busy ? "Đang tạo..." : "Tạo lộ trình"}
      </button>
      {chosenCount === 0 && (
        <p className="mt-1.5 text-center text-xs text-zinc-400">
          Chọn ít nhất một chỗ để tạo lộ trình.
        </p>
      )}

      {activeSlot && (
        <PlacePicker
          title={activeSlot.cta}
          confirmLabel="Chọn"
          singlePick
          initialType={activeSlot.placeType}
          onConfirm={(places) => handlePick(activeSlot.id, places)}
          onClose={() => setOpenSlot(null)}
        />
      )}
    </section>
  );
}
