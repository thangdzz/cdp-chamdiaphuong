// Ghi chú riêng (SPEC-chang-6.md) — lưu HOÀN TOÀN trong localStorage, không gửi lên máy chủ,
// không phải Server Action. Cố ý tách hẳn key khỏi mọi thứ ở Redis (§4: "Chặng 5 và 6 không
// dùng chung chỗ lưu nào").
const STORAGE_KEY = "cdp_personal_notes";
export const PERSONAL_NOTE_MAX_LENGTH = 500;

function readStore() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeStore(store) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getAllPersonalNotes() {
  return readStore();
}

export function getPersonalNote(placeId) {
  return readStore()[placeId] ?? null;
}

// Trả {ok:true} hoặc {ok:false, error} — không im lặng mất dữ liệu khi bộ nhớ trình duyệt
// đầy hoặc bị chặn ghi (VD Safari chế độ riêng tư ném lỗi ngay khi setItem) — SPEC §4
// "Chỗ dễ sai".
export function savePersonalNote(placeId, text) {
  const trimmed = (text ?? "").trim();
  const store = readStore();
  if (!trimmed) {
    delete store[placeId];
  } else {
    store[placeId] = {
      text: trimmed.slice(0, PERSONAL_NOTE_MAX_LENGTH),
      updatedAt: new Date().toISOString(),
    };
  }
  try {
    writeStore(store);
    return { ok: true };
  } catch {
    return { ok: false, error: "Không lưu được ghi chú, bộ nhớ trình duyệt đã đầy." };
  }
}

export function deletePersonalNote(placeId) {
  const store = readStore();
  delete store[placeId];
  try {
    writeStore(store);
    return { ok: true };
  } catch {
    return { ok: false, error: "Chưa xoá được, thử lại sau." };
  }
}
