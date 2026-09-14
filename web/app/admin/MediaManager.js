"use client";

import { useState } from "react";
import { MediaImage } from "@/app/MediaImage";
import { MEDIA_ROLES, mediaHasRole, placeMedia } from "@/lib/media";
import {
  ADMIN_UPLOAD_LIMIT,
  compressImageForUpload,
} from "@/lib/clientImageCompression";
import { removePlaceMedia, savePlaceMedia, uploadPlaceMedia } from "./mediaActions";

function formatBytes(bytes) {
  if (!bytes) return "Ảnh cũ · chưa có dung lượng";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function MediaManager({ place }) {
  const [items, setItems] = useState(() => placeMedia(place));
  const [initialRole, setInitialRole] = useState("general");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);

  function move(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= items.length) return;
    setItems((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next.map((item, order) => ({ ...item, order }));
    });
    setMessage(null);
  }

  function updateItem(id, updates) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    setMessage(null);
  }

  function setPrimaryRole(id, role) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const special = item.roles.filter((value) => value === "cover" || value === "navigation");
        return { ...item, roles: [...new Set([role, ...special])] };
      }),
    );
    setMessage(null);
  }

  function toggleUniqueRole(id, role) {
    setItems((current) => {
      const selected = current.find((item) => item.id === id)?.roles.includes(role);
      return current.map((item) => ({
        ...item,
        roles:
          item.id === id && !selected
            ? [...new Set([...item.roles.filter((value) => value !== role), role])]
            : item.roles.filter((value) => value !== role),
      }));
    });
    setMessage(null);
  }

  async function handleUpload(event) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selected.length || busy) return;
    if (selected.length > ADMIN_UPLOAD_LIMIT) {
      setMessage({ type: "error", text: `Admin tải tối đa ${ADMIN_UPLOAD_LIMIT} ảnh mỗi lần.` });
      return;
    }
    setBusy(true);
    setMessage({ type: "info", text: `Đang nén và tải ${selected.length} ảnh...` });
    try {
      const compressed = await Promise.all(selected.map((file) => compressImageForUpload(file)));
      const formData = new FormData();
      formData.set("placeId", place.id);
      formData.set("initialRole", initialRole);
      compressed.forEach((file) => formData.append("media", file));
      const result = await uploadPlaceMedia(formData);
      if (!result?.ok) {
        setMessage({ type: "error", text: result?.error || "Chưa tải được ảnh." });
        return;
      }
      setItems(result.media);
      setMessage({ type: "success", text: `Đã tải ${selected.length} ảnh và tối ưu sang WebP.` });
    } catch {
      setMessage({ type: "error", text: "Chưa tải được ảnh. Thử lại sau." });
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (busy) return;
    setBusy(true);
    setMessage({ type: "info", text: "Đang lưu thứ tự và vai trò ảnh..." });
    try {
      const result = await savePlaceMedia({ placeId: place.id, items });
      if (!result?.ok) {
        setMessage({ type: "error", text: result?.error || "Chưa lưu được ảnh." });
        return;
      }
      setItems(result.media);
      setMessage({ type: "success", text: "Đã lưu ảnh địa điểm." });
    } catch {
      setMessage({ type: "error", text: "Chưa lưu được ảnh. Thử lại sau." });
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove(item) {
    if (busy || !window.confirm("Gỡ ảnh này khỏi địa điểm? File chỉ được dọn sau khi chắc chắn không còn link chia sẻ dùng tới.")) return;
    setBusy(true);
    setMessage({ type: "info", text: "Đang gỡ ảnh..." });
    try {
      const result = await removePlaceMedia({ placeId: place.id, mediaId: item.id });
      if (!result?.ok) {
        setMessage({ type: "error", text: result?.error || "Chưa gỡ được ảnh." });
        return;
      }
      setItems(result.media);
      setMessage({ type: "success", text: "Đã gỡ ảnh khỏi địa điểm." });
    } catch {
      setMessage({ type: "error", text: "Chưa gỡ được ảnh. Thử lại sau." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Ảnh địa điểm</h3>
          <p className="mt-0.5 text-xs leading-5 text-zinc-500">
            Tải tối đa {ADMIN_UPLOAD_LIMIT} ảnh/lần. Ảnh được resize, nén WebP; dùng nút lên/xuống để sắp xếp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={initialRole}
            onChange={(event) => setInitialRole(event.target.value)}
            disabled={busy}
            aria-label="Loại ảnh tải lên"
            className="rounded-lg border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-700"
          >
            {MEDIA_ROLES.map((role) => (
              <option key={role.id} value={role.id}>{role.label}</option>
            ))}
          </select>
          <label className={`rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white ${busy ? "opacity-50" : "cursor-pointer"}`}>
            {busy ? "Đang xử lý..." : "+ Tải nhiều ảnh"}
            <input type="file" accept="image/*" multiple disabled={busy} onChange={handleUpload} className="hidden" />
          </label>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-3 rounded-lg bg-white px-3 py-4 text-center text-sm text-zinc-400">Chưa có ảnh.</p>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {items.map((item, index) => {
            const primaryRole = item.roles.find((role) => !["cover", "navigation"].includes(role)) ?? "general";
            return (
              <article key={item.id} className="rounded-xl border border-zinc-200 bg-white p-3">
                <div className="flex gap-3">
                  <MediaImage media={item} className="h-24 w-24 shrink-0 rounded-lg bg-zinc-100" sizes="96px" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-zinc-400">#{index + 1} · {formatBytes(item.bytes)}</p>
                    <select
                      value={primaryRole}
                      onChange={(event) => setPrimaryRole(item.id, event.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-700"
                    >
                      {MEDIA_ROLES.map((role) => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </select>
                    <input
                      value={item.caption ?? ""}
                      onChange={(event) => updateItem(item.id, { caption: event.target.value.slice(0, 160) })}
                      maxLength={160}
                      placeholder="Chú thích (tuỳ chọn)"
                      className="mt-1.5 w-full rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-700"
                    />
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <button type="button" onClick={() => move(index, -1)} disabled={busy || index === 0} className="rounded-lg border border-zinc-200 px-2 py-1.5 disabled:opacity-30">↑ Lên</button>
                  <button type="button" onClick={() => move(index, 1)} disabled={busy || index === items.length - 1} className="rounded-lg border border-zinc-200 px-2 py-1.5 disabled:opacity-30">↓ Xuống</button>
                  <label className="flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1.5 text-orange-800">
                    <input type="checkbox" checked={mediaHasRole(item, "cover")} onChange={() => toggleUniqueRole(item.id, "cover")} /> Bìa
                  </label>
                  <label className="flex items-center gap-1 rounded-lg bg-sky-50 px-2 py-1.5 text-sky-800">
                    <input type="checkbox" checked={mediaHasRole(item, "navigation")} onChange={() => toggleUniqueRole(item.id, "navigation")} /> Dẫn đường
                  </label>
                  <button type="button" onClick={() => handleRemove(item)} disabled={busy} className="ml-auto text-red-600 underline disabled:opacity-40">Gỡ ảnh</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {items.length > 0 && (
          <button type="button" onClick={handleSave} disabled={busy} className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">
            Lưu thứ tự và vai trò
          </button>
        )}
        {message && (
          <p className={`text-xs ${message.type === "error" ? "text-red-600" : message.type === "success" ? "text-green-700" : "text-zinc-500"}`}>
            {message.text}
          </p>
        )}
      </div>
    </section>
  );
}
