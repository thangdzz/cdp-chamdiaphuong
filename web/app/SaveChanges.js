"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

// Nút "Lưu thay đổi" dùng chung cho các trang sửa (owner test 30/9: sửa Sổ, sửa Lộ trình).
//
// Các ô trong trang sửa vẫn TỰ LƯU khi rời ô như cũ. Nhưng chỉ tự lưu thì khách không biết đã lưu
// chưa và phải bấm ra khoảng trắng — nên mỗi trang có thêm một thanh cuối màn hình:
//   chưa đổi gì  → nút xám, không bấm được
//   có thay đổi  → nút màu CDP "Lưu thay đổi", bấm là lưu hết các ô đang đổi dở
//   lưu xong     → "✓ Đã lưu" một lúc (cả khi lưu nhờ rời ô)
//
// Cách nối: bọc trang trong <SaveChangesProvider>, mỗi ô (hoặc cụm ô lưu cùng lúc) gọi
// useSaveField(id, dirty, save) và dùng hàm nó trả về cho onBlur; đặt <SaveChangesBar /> cuối trang.
// `save` phải trả về { ok, error? } như các Server Action sẵn có.

const SAVED_FLASH_MS = 2000;
const SaveChangesContext = createContext(null);

export function SaveChangesProvider({ children }) {
  const fieldsRef = useRef(new Map()); // id -> hàm lưu
  const [dirtyIds, setDirtyIds] = useState(() => new Set());
  const [state, setState] = useState("idle"); // idle | saving | saved | lỗi (chuỗi)
  const flashTimer = useRef(null);

  useEffect(() => () => clearTimeout(flashTimer.current), []);

  const setDirty = useCallback((id, dirty) => {
    setDirtyIds((prev) => {
      if (prev.has(id) === dirty) return prev;
      const next = new Set(prev);
      if (dirty) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const register = useCallback((id, save) => {
    fieldsRef.current.set(id, save);
    return () => {
      fieldsRef.current.delete(id);
      setDirty(id, false);
    };
  }, [setDirty]);

  const reportResult = useCallback((result) => {
    clearTimeout(flashTimer.current);
    if (result?.ok) {
      setState("saved");
      flashTimer.current = setTimeout(() => setState("idle"), SAVED_FLASH_MS);
    } else {
      setState(result?.error ?? "Chưa lưu được, thử lại nhé.");
    }
  }, []);

  const value = useMemo(
    () => ({ dirtyIds, state, setDirty, register, reportResult, setState, fieldsRef }),
    [dirtyIds, state, setDirty, register, reportResult]
  );
  return <SaveChangesContext.Provider value={value}>{children}</SaveChangesContext.Provider>;
}

/**
 * Nối một ô vào thanh "Lưu thay đổi". Trả về hàm lưu để dùng cho onBlur — hàm này không lưu khi
 * không có gì đổi, và bấm nút ngay sau khi rời ô (hai lượt lưu chồng nhau) chỉ lưu một lần.
 */
export function useSaveField(id, dirty, save) {
  const ctx = useContext(SaveChangesContext);
  // Chỉ lấy các hàm cố định của context: `ctx` đổi mỗi khi thanh đổi trạng thái, dựa vào nó thì ô
  // bị gỡ ra đăng ký lại liên tục và mất cờ "có thay đổi".
  const reportResult = ctx?.reportResult;
  const register = ctx?.register;
  const setDirty = ctx?.setDirty;
  const saveRef = useRef(save);
  const dirtyRef = useRef(dirty);
  const inflightRef = useRef(null);

  useEffect(() => {
    saveRef.current = save;
    dirtyRef.current = dirty;
  });

  const run = useCallback(async () => {
    if (inflightRef.current) return inflightRef.current;
    if (!dirtyRef.current) return { ok: true, skipped: true };
    inflightRef.current = (async () => {
      try {
        const result = (await saveRef.current()) ?? { ok: true };
        reportResult?.(result);
        return result;
      } finally {
        inflightRef.current = null;
      }
    })();
    return inflightRef.current;
  }, [reportResult]);

  useEffect(() => register?.(id, run), [register, id, run]);
  useEffect(() => setDirty?.(id, dirty), [setDirty, id, dirty]);

  return run;
}

export function SaveChangesBar() {
  const ctx = useContext(SaveChangesContext);
  const { dirtyIds, state, setState, fieldsRef } = ctx;
  const dirty = dirtyIds.size > 0;
  const saving = state === "saving";
  const error = !["idle", "saving", "saved"].includes(state) ? state : null;

  async function saveAll() {
    setState("saving");
    for (const id of [...dirtyIds]) {
      const result = await fieldsRef.current.get(id)?.();
      // Mỗi hàm lưu tự báo kết quả (reportResult); gặp lỗi thì dừng để dòng lỗi không bị ghi đè.
      if (result && !result.ok) return;
    }
  }

  const buttonLabel = saving ? "Đang lưu..." : state === "saved" && !dirty ? "✓ Đã lưu" : "Lưu thay đổi";
  const hint = error
    ? error
    : saving
      ? "Đang lưu thay đổi của bạn..."
      : dirty
        ? "Có thay đổi chưa lưu"
        : state === "saved"
          ? "Thay đổi đã được lưu"
          : "Chưa có thay đổi nào";

  return (
    <div className="sticky bottom-0 z-20 -mx-4 mt-6 border-t border-zinc-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-3">
        <p
          role="status"
          className={`min-w-0 flex-1 text-[13px] ${error ? "text-red-600" : state === "saved" && !dirty ? "text-emerald-700" : "text-zinc-500"}`}
        >
          {hint}
        </p>
        <button
          type="button"
          disabled={!dirty || saving}
          // Chạm nút không làm ô đang gõ mất focus trước — tránh lượt tự lưu khi rời ô chạy song song.
          onPointerDown={(event) => event.preventDefault()}
          onClick={saveAll}
          className={`cdp-pressable inline-flex min-h-11 shrink-0 items-center rounded-lg px-4 text-sm font-medium ${
            dirty && !saving
              ? "cursor-pointer bg-[#c8553d] text-white active:bg-[#ad4832]"
              : state === "saved" && !dirty
                ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "cursor-default border border-zinc-200 bg-zinc-50 text-zinc-400"
          }`}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * Ô tên (Sổ, Lộ trình): tự lưu khi rời ô, và nối vào thanh "Lưu thay đổi". Tên rỗng không lưu.
 * `onSave(title)` trả về { ok, error? }.
 */
export function TitleField({ id = "title", value, savedValue, onChange, onSave, className = "" }) {
  const trimmed = value.trim();
  const save = useSaveField(id, Boolean(trimmed) && trimmed !== savedValue, () => onSave(trimmed));
  return (
    <>
      <input
        aria-label="Tên"
        className={`w-full rounded-lg border border-zinc-300 px-3 py-2 text-base font-medium text-zinc-900 ${className}`}
        value={value}
        maxLength={60}
        onChange={(e) => onChange(e.target.value)}
        onBlur={save}
      />
      {!trimmed && <p className="mt-1 text-xs text-red-600">Tên không được để trống.</p>}
    </>
  );
}
