"use client";

import { useState } from "react";
import { LocationConfirm } from "./LocationConfirm";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { voteLocation } from "./locationVoteActions";
import { confirmStopLocation } from "./routeActions";
import { locationOf, LOCATION_STATUS } from "@/lib/placeLocation";
import { DEFAULT_PROVINCE } from "@/lib/provinces";

// Ghim vị trí cho một ĐỊA ĐIỂM CDP nằm trong lộ trình (spec Consensus §6, quyết định 16/9).
//
// Trước đây chỗ này trống: trang sửa chỉ cho ghim "điểm riêng", còn địa điểm trong danh bạ thì
// không có nút nào — mà cảnh báo "chưa xác nhận vị trí" lại dẫn thẳng tới đây.
//
// Một lần ghim làm hai việc:
//   1. Sửa ĐÚNG lộ trình này ngay (toạ độ lưu trên điểm dừng) — chủ lộ trình đang cần đi.
//   2. Gửi một phiếu cho danh bạ — đủ 2 người đồng ý thì mọi khách khác cũng được nhờ.
// Danh bạ KHÔNG bị sửa ngang: phiếu chỉ thành vị trí chính thức khi đủ đồng thuận, hoặc khi CDP
// chốt ở /admin/vi-tri.

export function StopPlaceLocation({ stop, index, slug, disabled = false }) {
  const place = stop.place;
  const [pin, setPin] = useState(stop.coordinates ?? null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  if (!place) return null;

  // Lộ trình này đã ghim chưa (ghim riêng của điểm dừng thắng), và danh bạ đang ở mức nào.
  const pinnedHere = pin?.confirmed === true;
  const directory = locationOf(place);

  async function handleConfirm(next) {
    setError(null);
    const anonId = loadLocalContributor()?.anonId;
    const saved = await confirmStopLocation({
      anonId,
      slug,
      index,
      coordinates: next,
      googlePlaceId: next.googlePlaceId,
    });
    if (!saved?.ok) {
      setError(saved?.error ?? "Chưa lưu được vị trí.");
      return saved;
    }
    setPin(next);

    // Phiếu cho danh bạ là việc phụ: hỏng (VD hết trần phiếu trong ngày) cũng không được làm
    // hỏng việc chính là sửa lộ trình.
    const vote = await voteLocation({
      anonId,
      placeId: place.id,
      lat: next.lat,
      lng: next.lng,
      googlePlaceId: next.googlePlaceId,
    });
    if (vote?.newProfile) {
      saveLocalContributor({
        anonId: vote.newProfile.anonId,
        nickname: vote.newProfile.nickname,
        recoveryCode: vote.newProfile.recoveryCode,
        categoryId: loadLocalContributor()?.categoryId ?? null,
      });
    }
    setMessage(
      vote?.ok && vote.status === "community_verified"
        ? `Đã ghim. Chỗ này giờ đủ ${vote.voters} người xác nhận, cả CDP dùng chung.`
        : "Đã ghim cho lộ trình này. CDP cũng ghi nhận — thêm một người nữa xác nhận là cả danh bạ được nhờ."
    );
    return saved;
  }

  return (
    <div className="mt-2">
      <p className="text-xs text-zinc-500">
        {pinnedHere
          ? "✓ Lộ trình này dẫn tới đúng ghim của bạn."
          : directory.status === LOCATION_STATUS.ADMIN_VERIFIED
            ? "Vị trí chỗ này do CDP xác nhận. Nếu bạn biết chỗ chính xác hơn, ghim lại cho lộ trình của mình."
            : directory.status === LOCATION_STATUS.COMMUNITY_VERIFIED
              ? `Vị trí do ${directory.voters} khách cùng xác nhận. Thấy chưa đúng thì ghim lại.`
              : "Chỗ này chưa ai xác nhận vị trí — Google Maps đang đoán theo tên. Ghim đúng chỗ để lộ trình dẫn tới nơi."}
      </p>
      {message && <p className="mt-1 text-xs text-emerald-700">{message}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <LocationConfirm
        name={place.name}
        addressLine={place.address || place.name}
        wardOrDistrict={place.ward}
        province={DEFAULT_PROVINCE}
        label="vị trí"
        pinSource="user_pin"
        value={pin ?? place.coordinates}
        disabled={disabled}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
