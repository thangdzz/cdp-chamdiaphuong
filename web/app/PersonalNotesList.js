"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllPersonalNotes } from "@/lib/personalNotes";

const INVITE_DISMISS_KEY = "cdp_personal_notes_invite_dismissed_until";
const INVITE_MIN_NOTES = 3;
const INVITE_SNOOZE_DAYS = 14;

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("vi-VN");
  } catch {
    return "";
  }
}

// Lời mời để lại SĐT — chỉ hiện lời mời, CHƯA làm chức năng thật (việc đó là Chặng 7).
// SPEC §5: hỏi đúng lúc khách đã có thứ để mất (từ ghi chú thứ 3), không hỏi sớm hơn.
function InviteBanner({ onDismiss }) {
  const [saved, setSaved] = useState(false);

  function handleSaveClick() {
    setSaved(true);
  }

  return (
    <div className="mb-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
      {saved ? (
        <p className="text-sm text-zinc-700">Sắp có — em đang làm phần này.</p>
      ) : (
        <>
          <p className="text-sm text-zinc-700">
            Bạn đang có {INVITE_MIN_NOTES} ghi chú. Lưu lại để không mất khi đổi điện thoại?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-zinc-300 px-3 py-1 text-xs text-zinc-700"
            >
              Để sau
            </button>
            <button
              type="button"
              onClick={handleSaveClick}
              className="rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white"
            >
              Lưu lại
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function PersonalNotesList({ places }) {
  const [notes, setNotes] = useState(null); // null = đang tải
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    // Bọc qua .then() để tránh setState ngay trong thân effect (đúng cách đã dùng ở
    // CheckinButton.js/PersonalNote.js).
    Promise.resolve().then(() => {
      const store = getAllPersonalNotes();
      const placeMap = new Map(places.map((p) => [p.id, p]));
      const list = Object.entries(store)
        .map(([placeId, entry]) => ({
          placeId,
          text: entry.text,
          updatedAt: entry.updatedAt,
          place: placeMap.get(placeId) ?? null,
        }))
        .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
      setNotes(list);

      if (list.length >= INVITE_MIN_NOTES) {
        try {
          const until = window.localStorage.getItem(INVITE_DISMISS_KEY);
          setShowInvite(!until || new Date(until) <= new Date());
        } catch {
          setShowInvite(true);
        }
      }
    });
  }, [places]);

  function dismissInvite() {
    setShowInvite(false);
    try {
      const until = new Date(Date.now() + INVITE_SNOOZE_DAYS * 24 * 60 * 60 * 1000).toISOString();
      window.localStorage.setItem(INVITE_DISMISS_KEY, until);
    } catch {
      // Không lưu được cờ tạm ẩn thì lần sau hiện lại, không sao.
    }
  }

  if (notes === null) return <p className="text-sm text-zinc-500">Đang tải...</p>;

  if (notes.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        Chưa có ghi chú riêng nào. Mở 1 chỗ bất kỳ trên trang chủ, bấm &quot;+ Ghi chú
        riêng&quot; để bắt đầu.
      </p>
    );
  }

  const q = query.trim().toLowerCase();
  const filtered = q
    ? notes.filter((n) => n.text.toLowerCase().includes(q) || n.place?.name.toLowerCase().includes(q))
    : notes;

  return (
    <div>
      {showInvite && <InviteBanner onDismiss={dismissInvite} />}

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm trong ghi chú..."
        className="mb-4 w-full rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-zinc-500">Không tìm thấy ghi chú nào khớp.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((n) => (
            <li key={n.placeId} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              {n.place ? (
                <Link href={`/#${n.placeId}`} className="text-base font-semibold text-zinc-900 underline">
                  {n.place.name}
                </Link>
              ) : (
                <>
                  <p className="text-base font-semibold text-zinc-400">Chỗ đã xoá</p>
                  <p className="text-xs text-zinc-400">Chỗ này không còn trong danh bạ</p>
                </>
              )}
              <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{n.text}</p>
              <p className="mt-1 text-xs text-zinc-400">Cập nhật {formatDate(n.updatedAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
