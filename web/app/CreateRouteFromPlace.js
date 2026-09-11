"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlacePicker } from "./PlacePicker";
import { createRouteWithPlaces } from "./routeActions";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";

// "Tạo lộ trình từ đây" (NOTE-07 §4) — mở PlacePicker với CHÍNH chỗ đang xem đã chọn sẵn, để
// khách gom tiếp mấy chỗ nữa ngay tại đó. Trước đây muốn dựng lộ trình phải quay về trang chủ
// bấm từng chỗ một, hoặc gom sổ trước rồi mới chuyển thành lộ trình.
//
// Dùng chung PlacePicker với trang sửa lộ trình — không có bộ chọn riêng cho màn này (§3).
export function CreateRouteFromPlace({ place }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleConfirm(places, { customStops } = {}) {
    const local = loadLocalContributor();
    const result = await createRouteWithPlaces({
      anonId: local?.anonId,
      // Tên mặc định lấy theo chỗ khách bắt đầu — đổi được ngay ở trang sửa.
      title: `Lộ trình từ ${place.name}`,
      places,
      customStops,
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
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cdp-pressable inline-flex min-h-11 w-fit cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
      >
        Tạo lộ trình từ đây
      </button>

      {open && (
        <PlacePicker
          title="Tạo lộ trình"
          confirmLabel="Tạo lộ trình"
          // Chỗ đang xem được chọn sẵn — đó là lý do khách bấm nút này (§4).
          initialSelected={[{ id: place.id, name: place.name, type: place.type, ward: place.ward ?? null }]}
          onConfirm={handleConfirm}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
