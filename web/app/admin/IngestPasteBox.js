"use client";

import { useState } from "react";
import { processIngestPaste } from "./ingestPasteActions";

const SUMMARY_LABELS = [
  ["newPlacesPublished", "chỗ mới lên thẳng web"],
  ["changedPlacesApplied", "chỗ được cập nhật thông tin"],
  ["lowConfidencePublished", "chỗ tin cậy thấp (vẫn lên thẳng, hiển thị rõ độ tin cậy)"],
  ["duplicateCandidatesForReview", "chỗ nghi trùng/mâu thuẫn — chờ duyệt ở mục bên dưới"],
  ["updatedExistingPending", "mục đang chờ duyệt được bổ sung thêm thông tin"],
  ["skippedNoChange", "bản ghi trùng y hệt dữ liệu đã có — bỏ qua"],
];

export function IngestPasteBox() {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (busy || !text.trim()) return;
    setBusy(true);
    setError(null);
    setSummary(null);
    try {
      const result = await processIngestPaste(text);
      if (!result.ok) {
        setError(result.error);
      } else {
        setSummary(result.summary);
        setText("");
      }
    } catch {
      setError("Xử lý chưa thành công. Bấm thử lại giúp em nhé.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-200 bg-white p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder="Dán nguyên báo cáo routine vào đây (cả đoạn JSON lẫn phần tóm tắt đều được — hệ thống tự tách lấy đúng đoạn JSON)..."
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900"
      />
      <button
        type="submit"
        disabled={busy || !text.trim()}
        className="mt-2 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Đang xử lý..." : "Xử lý báo cáo"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {summary && (
        <div className="mt-3 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-700">
          <p className="font-medium text-zinc-900">
            Đã xử lý {summary.recordsFetched} bản ghi:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {SUMMARY_LABELS.filter(([key]) => summary[key] > 0).map(([key, label]) => (
              <li key={key}>
                {summary[key]} {label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
