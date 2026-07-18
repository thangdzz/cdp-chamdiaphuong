"use client";

import { useRef, useState } from "react";
import {
  startContributorProfile,
  recoverContributorProfile,
  chooseContributorCategory,
  getContributorStanding,
  submitCorrection,
  submitPhotos,
} from "./contributionActions";
import { CATEGORIES } from "@/lib/badges";
import { BadgeIcon } from "./BadgeIcon";

const STORAGE_KEY = "cdp_contributor";

function loadLocalContributor() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocalContributor(data) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

const inputClass = "rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900";
const btnPrimary = "rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50";
const btnGhost = "rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-700";

export function ContributionPanel({ place, onDone }) {
  const [mode, setMode] = useState("idle");
  const [fields, setFields] = useState({ address: "", phone: "", priceMin: "", priceMax: "", priceUnit: "", closed: false });
  const [note, setNote] = useState("");
  const [nicknameInput, setNicknameInput] = useState("");
  const [recoverCodeInput, setRecoverCodeInput] = useState("");
  const [recoverError, setRecoverError] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [revealCode, setRevealCode] = useState(null);
  const [standing, setStanding] = useState(null);
  const [busy, setBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  // Chặn bấm 2 lần liên tiếp thật sự chắc chắn — dùng ref vì state React cập nhật có độ
  // trễ (render/commit), bấm nhanh trên mạng chậm có thể lọt qua nếu chỉ dựa vào `busy`.
  const busyRef = useRef(false);

  function close() {
    setMode("idle");
    setFields({ address: "", phone: "", priceMin: "", priceMax: "", priceUnit: "", closed: false });
    setNote("");
    setErrorMessage(null);
    onDone?.();
  }

  async function runAction(anonId, action) {
    setBusy(true);
    setErrorMessage(null);
    try {
      if (action.type === "correction") {
        await submitCorrection({
          anonId,
          placeId: place.id,
          placeName: place.name,
          fields: {
            address: action.fields.address || null,
            phone: action.fields.phone || null,
            priceMin: action.fields.priceMin ? Number(action.fields.priceMin) : null,
            priceMax: action.fields.priceMax ? Number(action.fields.priceMax) : null,
            priceUnit: action.fields.priceUnit || null,
            closed: action.fields.closed ? true : undefined,
          },
          note: action.note || null,
        });
      } else if (action.type === "photos") {
        action.formData.set("anonId", anonId);
        await submitPhotos(action.formData);
      }
      setMode("thanks");
      return true;
    } catch {
      // Không được nuốt lỗi im lặng — trước đây lỗi ở đây làm màn hình đứng im, rồi bấm
      // lần 2 lại rơi vào nhánh "không có việc gì đang chờ" nên tự reset về ban đầu, trông
      // như mất góp ý. Giờ báo rõ và giữ nguyên pendingAction để bấm lại được ngay.
      setErrorMessage("Gửi chưa thành công (có thể do mạng chậm). Bấm thử lại giúp em nhé.");
      return false;
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function ensureProfileThenRun(action) {
    if (busyRef.current) return;
    const existing = loadLocalContributor();
    if (existing?.anonId) {
      busyRef.current = true;
      await runAction(existing.anonId, action);
      return;
    }
    setPendingAction(action);
    setMode("needNickname");
  }

  async function handleCorrectionSubmit(e) {
    e.preventDefault();
    if (!fields.address && !fields.phone && !fields.priceMin && !fields.priceMax && !note && !fields.closed) {
      return;
    }
    await ensureProfileThenRun({ type: "correction", fields, note });
  }

  async function handleFilesChosen(e) {
    const files = Array.from(e.target.files ?? []).slice(0, 3);
    e.target.value = "";
    if (files.length === 0) return;
    const formData = new FormData();
    formData.set("placeId", place.id);
    formData.set("placeName", place.name);
    files.forEach((f) => formData.append("photos", f));
    await ensureProfileThenRun({ type: "photos", formData });
  }

  async function handleNicknameConfirm() {
    if (busyRef.current || !nicknameInput.trim()) return;
    busyRef.current = true;
    setBusy(true);
    setErrorMessage(null);
    try {
      const profile = await startContributorProfile(nicknameInput.trim());
      saveLocalContributor({
        anonId: profile.anonId,
        nickname: profile.nickname,
        recoveryCode: profile.recoveryCode,
        categoryId: null,
      });
      setRevealCode(profile.recoveryCode);
      setMode("recoveryReveal");
    } catch {
      setErrorMessage("Chưa tạo được hồ sơ (có thể do mạng chậm). Bấm thử lại giúp em nhé.");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function handleRecoveryContinue() {
    if (busyRef.current) return;
    const local = loadLocalContributor();
    if (pendingAction && local?.anonId) {
      busyRef.current = true;
      const ok = await runAction(local.anonId, pendingAction);
      if (ok) setPendingAction(null);
    } else {
      close();
    }
  }

  async function handleRecoverSubmit(e) {
    e.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setRecoverError(null);
    try {
      const result = await recoverContributorProfile(recoverCodeInput.trim());
      if (!result.ok) {
        setRecoverError(result.error);
        return;
      }
      saveLocalContributor({
        anonId: result.anonId,
        nickname: result.nickname,
        recoveryCode: result.recoveryCode,
        categoryId: result.categoryId,
      });
      if (pendingAction) {
        busyRef.current = false; // để runAction bên dưới tự khoá lại từ đầu
        const ok = await runAction(result.anonId, pendingAction);
        if (ok) setPendingAction(null);
        return;
      }
      close();
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function handleThanksContinue() {
    if (busyRef.current) return;
    const local = loadLocalContributor();
    if (!local?.anonId) {
      close();
      return;
    }
    if (!local.categoryId) {
      setMode("categoryPicker");
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      const data = await getContributorStanding(local.anonId);
      setStanding(data);
      setMode("standing");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  async function handleCategoryPick(categoryId) {
    if (busyRef.current) return;
    const local = loadLocalContributor();
    if (!local?.anonId) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await chooseContributorCategory(local.anonId, categoryId);
      saveLocalContributor({ ...local, categoryId });
      const data = await getContributorStanding(local.anonId);
      setStanding(data);
      setMode("standing");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  if (mode === "idle") {
    return (
      <div className="mt-2 flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("correctionForm")}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600"
          >
            Báo sai
          </button>
          <label
            className={`inline-flex items-center gap-1 rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 ${
              busy ? "opacity-50" : "cursor-pointer"
            }`}
          >
            {busy ? "Đang gửi..." : "Bổ sung ảnh"}
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={busy}
              className="hidden"
              onChange={handleFilesChosen}
            />
          </label>
          <button
            type="button"
            onClick={() => setMode("recoverForm")}
            className="text-xs text-zinc-400 underline"
          >
            Đã góp ý trước đây? Khôi phục
          </button>
        </div>
        {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      {mode === "correctionForm" && (
        <form onSubmit={handleCorrectionSubmit} className="flex flex-col gap-2">
          <p className="text-xs font-medium text-zinc-600">Sửa thông tin cho &quot;{place.name}&quot;</p>
          <div className="grid grid-cols-2 gap-2">
            <input
              className={inputClass}
              placeholder="Địa chỉ đúng"
              value={fields.address}
              onChange={(e) => setFields((f) => ({ ...f, address: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="SĐT đúng"
              value={fields.phone}
              onChange={(e) => setFields((f) => ({ ...f, phone: e.target.value }))}
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Giá thấp nhất"
              value={fields.priceMin}
              onChange={(e) => setFields((f) => ({ ...f, priceMin: e.target.value }))}
            />
            <input
              className={inputClass}
              type="number"
              placeholder="Giá cao nhất"
              value={fields.priceMax}
              onChange={(e) => setFields((f) => ({ ...f, priceMax: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="Đơn vị (đêm, bát...)"
              value={fields.priceUnit}
              onChange={(e) => setFields((f) => ({ ...f, priceUnit: e.target.value }))}
            />
          </div>
          <textarea
            className={inputClass}
            placeholder="Ghi chú thêm (tuỳ chọn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
          />
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={fields.closed}
              onChange={(e) => setFields((f) => ({ ...f, closed: e.target.checked }))}
            />
            Chỗ này đã đóng cửa / không còn hoạt động
          </label>
          {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={btnPrimary}>
              {busy ? "Đang gửi..." : "Gửi góp ý"}
            </button>
            <button type="button" onClick={close} className={btnGhost}>
              Huỷ
            </button>
          </div>
        </form>
      )}

      {mode === "needNickname" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-700">Biệt danh hoặc tên của bạn là gì?</p>
          <input
            className={inputClass}
            placeholder="Ví dụ: Bạn yêu Tuyên Quang"
            value={nicknameInput}
            onChange={(e) => setNicknameInput(e.target.value)}
          />
          {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          <div className="flex gap-2">
            <button type="button" disabled={busy} onClick={handleNicknameConfirm} className={btnPrimary}>
              {busy ? "Đang gửi..." : "Xác nhận"}
            </button>
            <button type="button" onClick={() => setMode("recoverForm")} className={btnGhost}>
              Đã góp ý trước đây?
            </button>
          </div>
        </div>
      )}

      {mode === "recoverForm" && (
        <form onSubmit={handleRecoverSubmit} className="flex flex-col gap-2">
          <p className="text-sm text-zinc-700">Nhập mã khôi phục (6 số) đã lưu lần trước:</p>
          <input
            className={inputClass}
            placeholder="Ví dụ: 482913"
            value={recoverCodeInput}
            onChange={(e) => setRecoverCodeInput(e.target.value)}
          />
          {recoverError && <p className="text-xs text-red-600">{recoverError}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className={btnPrimary}>
              Khôi phục
            </button>
            <button type="button" onClick={close} className={btnGhost}>
              Huỷ
            </button>
          </div>
        </form>
      )}

      {mode === "recoveryReveal" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-zinc-800">
            Mã khôi phục của bạn: <span className="text-lg tracking-wider">{revealCode}</span>
          </p>
          <p className="text-xs text-zinc-600">
            Lưu lại mã này! Nếu sau này bạn góp ý từ máy hoặc điện thoại khác, bấm &quot;Đã góp
            ý trước đây? Khôi phục&quot; và nhập đúng mã này để giữ lại điểm/huy hiệu của bạn.
            Mất mã này thì không lấy lại được (không có cách khôi phục nào khác).
          </p>
          {errorMessage && <p className="text-xs text-red-600">{errorMessage}</p>}
          <button type="button" disabled={busy} onClick={handleRecoveryContinue} className={btnPrimary}>
            {busy ? "Đang gửi..." : "Đã lưu, tiếp tục"}
          </button>
        </div>
      )}

      {mode === "thanks" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-700">
            Cảm ơn bạn đã góp ý cho &quot;{place.name}&quot;! Góp ý sẽ được kiểm tra sớm.
          </p>
          <button type="button" disabled={busy} onClick={handleThanksContinue} className={btnPrimary}>
            Tiếp tục
          </button>
        </div>
      )}

      {mode === "categoryPicker" && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-700">Bạn quan tâm lĩnh vực gì? (chọn 1)</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                disabled={busy}
                onClick={() => handleCategoryPick(c.id)}
                className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-left text-xs font-medium text-zinc-700"
              >
                {c.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={close} className="text-xs text-zinc-400 underline">
            Bỏ qua
          </button>
        </div>
      )}

      {mode === "standing" && standing?.badge && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <BadgeIcon icon={standing.badge.icon} tierIndex={standing.badge.tierIndex} size={44} />
            <div>
              <p className="text-sm font-semibold text-zinc-800">{standing.badge.tierName}</p>
              <p className="text-xs text-zinc-500">{standing.badge.categoryLabel}</p>
            </div>
          </div>
          {standing.standing?.nearby?.length > 0 && (
            <ul className="flex flex-col gap-0.5 text-xs text-zinc-600">
              {standing.standing.nearby.map((c) => (
                <li key={c.anonId} className={c.isYou ? "font-semibold text-zinc-900" : ""}>
                  {c.isYou ? "Bạn" : c.nickname} — {c.points} điểm
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={close} className={btnGhost}>
            Đóng
          </button>
        </div>
      )}
    </div>
  );
}
