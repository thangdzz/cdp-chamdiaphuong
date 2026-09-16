"use client";

import { useEffect, useState } from "react";
import { LocationConfirm } from "./LocationConfirm";
import { loadLocalContributor, saveLocalContributor } from "./ContributionPanel";
import { voteLocation, getMyLocationVoteStatus } from "./locationVoteActions";
import { coordinatesOf } from "@/lib/coordinates";
import { locationOf, LOCATION_STATUS } from "@/lib/placeLocation";
import { DEFAULT_PROVINCE } from "@/lib/provinces";
import { PinIcon } from "./Icon";

// Khối "vị trí chỗ này" ở trang địa điểm (spec Consensus §6, §16).
//
// Vì sao để khách bấm: CDP có 234 chỗ, chủ dự án ghim tay không xuể. Người vừa tới quán mới là
// người biết chính xác nó nằm đâu. Hai người lạ cùng chỉ về một chỗ thì CDP tin — và từ đó nút của
// chỗ đó thành "Chỉ đường" thay vì bắt khách tự tra Google.
//
// Phiếu của khách KHÔNG ghi đè vị trí CDP đã chốt: chỗ đã chốt mà khách báo khác thì phiếu thành
// lời nhắn cho admin xem lại, chứ không tự đổi (spec §8).

export function PlaceLocationVote({ place }) {
  const location = locationOf(place);
  const coordinates = coordinatesOf(place);
  const [voted, setVoted] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const local = loadLocalContributor();
    if (!local?.anonId) return;
    getMyLocationVoteStatus({ anonId: local.anonId, placeId: place.id }).then((res) => {
      if (res.voted) setVoted(true);
    });
  }, [place.id]);

  async function sendVote({ lat, lng, googlePlaceId = null }) {
    const local = loadLocalContributor();
    const result = await voteLocation({
      anonId: local?.anonId,
      placeId: place.id,
      lat,
      lng,
      googlePlaceId,
    });
    if (result.newProfile) {
      saveLocalContributor({
        anonId: result.newProfile.anonId,
        nickname: result.newProfile.nickname,
        recoveryCode: result.newProfile.recoveryCode,
        categoryId: local?.categoryId ?? null,
      });
    }
    if (!result.ok) {
      setError(result.error ?? "Chưa gửi được, thử lại sau nhé.");
      return result;
    }
    setVoted(true);
    setError(null);
    setMessage(
      result.status === "community_verified"
        ? `Cảm ơn bạn — đã đủ ${result.voters} người xác nhận chỗ này.${result.pointsAwarded ? " +điểm" : ""}`
        : "Cảm ơn bạn. Cần thêm một người nữa xác nhận là CDP dám chỉ đường tới đây."
    );
    return result;
  }

  async function confirmCurrent() {
    if (busy || !coordinates) return;
    setBusy(true);
    await sendVote({
      lat: coordinates.lat,
      lng: coordinates.lng,
      googlePlaceId: location.googlePlaceId,
    });
    setBusy(false);
  }

  const verifiedByCdp = location.status === LOCATION_STATUS.ADMIN_VERIFIED;
  const verifiedByCommunity = location.status === LOCATION_STATUS.COMMUNITY_VERIFIED;

  return (
    <div className="flex flex-col gap-1.5">
      <p className="flex items-start gap-1.5 text-[13px] text-zinc-500">
        <PinIcon size={15} className="mt-0.5 shrink-0 text-zinc-400" />
        <span>
          {verifiedByCdp && "Vị trí do CDP xác nhận trên bản đồ."}
          {verifiedByCommunity &&
            `Vị trí đã được cộng đồng xác nhận (${location.voters} người cùng ghim một chỗ).`}
          {!location.verified &&
            "Vị trí chỗ này chưa được xác nhận — Google Maps sẽ tự đoán theo tên, có thể lệch."}
        </span>
      </p>

      {message && <p className="text-[13px] text-emerald-700">{message}</p>}
      {error && <p className="text-[13px] text-red-600">{error}</p>}

      {!openMap && !message && (
        <div className="flex flex-wrap items-center gap-2">
          {/* Chỗ chưa xác minh mà đã có sẵn toạ độ: chỉ cần một người nữa gật đầu là xong, nên để
              nút này đứng trước nút mở bản đồ. */}
          {!location.verified && coordinates && (
            <button
              type="button"
              onClick={confirmCurrent}
              disabled={busy || voted}
              className="cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600 disabled:cursor-default disabled:opacity-50"
            >
              {voted ? "Bạn đã gửi vị trí" : busy ? "Đang gửi…" : "Vị trí này đúng"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpenMap(true)}
            className="cdp-pressable inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
          >
            {location.verified ? "Vị trí sai? Ghim lại giúp CDP" : voted ? "Ghim lại chỗ khác" : "Ghim vị trí trên bản đồ"}
          </button>
        </div>
      )}

      {openMap && (
        <>
          {location.verified && (
            <p className="text-xs text-zinc-500">
              Ghim của bạn không đổi vị trí đang hiển thị ngay — CDP xem lại rồi mới chốt.
            </p>
          )}
          <LocationConfirm
            name={place.name}
            addressLine={place.address || place.name}
            wardOrDistrict={place.ward}
            province={DEFAULT_PROVINCE}
            label="vị trí"
            pinSource="user_pin"
            value={coordinates}
            onConfirm={async (next) => {
              const result = await sendVote(next);
              if (result?.ok) setOpenMap(false);
              return result;
            }}
          />
        </>
      )}
    </div>
  );
}
