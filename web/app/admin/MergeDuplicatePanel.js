"use client";

import { useEffect, useRef, useState } from "react";
import {
  getPlaceById,
  searchDuplicateCandidates,
  mergeDuplicatePlaces,
  confirmSuggestionNotDuplicate,
  getReviewCandidateForMerge,
  mergeReviewCandidate,
} from "./mergeActions";
import { PLACE_TYPES } from "@/lib/placeTypes";

const inputClass = "w-full rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900";

function MergeField({ label, valueA, valueB, value, onChange }) {
  return (
    <div className="mb-2">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <div className="mb-1 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => onChange(valueA ?? "")}
          className="cursor-pointer rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-xs text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100"
        >
          A: {valueA || "(trống)"}
        </button>
        <button
          type="button"
          onClick={() => onChange(valueB ?? "")}
          className="cursor-pointer rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-xs text-zinc-600 hover:border-zinc-400 hover:bg-zinc-100"
        >
          B: {valueB || "(trống)"}
        </button>
      </div>
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// Công cụ so sánh & gộp 2 chỗ trùng lặp — dùng chung cho 2 nguồn:
// - mode="suggestion": khách tự báo "trùng với chỗ khác" (gõ tên tự do) — cả 2 chỗ ĐÃ công
//   khai, cần bước tìm chỗ B, gộp xong phải XOÁ 1 trong 2 chỗ khỏi places:live.
// - mode="reviewItem": AI quét tự phát hiện nghi trùng — chỗ A (candidate) CHƯA từng lên
//   web, máy đã biết sẵn ID chỗ B nên bỏ qua bước tìm kiếm, gộp xong chỉ CẬP NHẬT chỗ B,
//   không có gì để xoá.
// Xoá dữ liệu thật đã công khai (mode="suggestion") LUÔN cần admin tự bấm xác nhận, không
// có đường tự động.
export function MergeDuplicatePanel({ mode, suggestion, reviewItem }) {
  const [placeA, setPlaceA] = useState(null);
  const [step, setStep] = useState("collapsed"); // collapsed | loading | search | compare | notfound
  const [query, setQuery] = useState(suggestion?.fields?.duplicateOfName ?? "");
  const [candidates, setCandidates] = useState([]);
  const [placeB, setPlaceB] = useState(null);
  const [keepSide, setKeepSide] = useState("A");
  const [fields, setFields] = useState(null);
  const [keepPhotos, setKeepPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  const sourceId = mode === "suggestion" ? suggestion.placeId : reviewItem.id;

  // Ưu tiên giá trị của bên đang được GIỮ, thiếu ô nào mới lấy bên còn lại — "primary" là bên
  // giữ, "secondary" là bên bị xoá/không giữ. Trước đây luôn ưu tiên A bất kể chọn giữ bên
  // nào, nên chỗ sống sót mang đúng id của bên được giữ nhưng NỘI DUNG lại của bên kia (lỗi
  // nặng, làm hỏng dữ liệu thật đã công khai — xem STATUS.md "L3").
  function initFields(primary, secondary) {
    setFields({
      name: primary.name || secondary.name || "",
      type: primary.type || secondary.type,
      address: primary.address || secondary.address || "",
      ward: primary.ward || secondary.ward || "",
      localArea: primary.localArea || secondary.localArea || "",
      phone: primary.phone || secondary.phone || "",
      priceMin: primary.priceMin ?? secondary.priceMin ?? "",
      priceMax: primary.priceMax ?? secondary.priceMax ?? "",
      priceUnit: primary.priceUnit || secondary.priceUnit || "",
    });
    setKeepPhotos([...new Set([...(primary.photos ?? []), ...(secondary.photos ?? [])])]);
  }

  function expand() {
    setStep("loading");
    if (mode === "suggestion") {
      getPlaceById(suggestion.placeId).then((p) => {
        setPlaceA(p);
        setStep(p ? "search" : "notfound");
      });
    } else {
      getReviewCandidateForMerge(reviewItem.id).then(({ placeA: a, placeB: b }) => {
        setPlaceA(a);
        if (a && b) {
          setPlaceB(b);
          setStep("compare");
        } else {
          setStep("notfound");
        }
      });
    }
  }

  // Nguồn duy nhất quyết định lúc nào điền lại các ô — chạy lại mỗi khi đổi "Giữ bản ghi
  // của" (mode="suggestion") để ô điền sẵn luôn khớp đúng bên đang chọn giữ. Phụ thuộc vào
  // id (không phải cả object placeA/placeB) — tránh tự điền lại ngoài ý muốn nếu object đổi
  // tham chiếu nhưng nội dung không đổi, làm mất các ô admin đã sửa tay.
  useEffect(() => {
    if (!placeA || !placeB) return;
    // Bọc qua .then() để tránh setState ngay trong thân effect (đúng cách đã dùng ở
    // CheckinButton.js/PersonalNote.js).
    Promise.resolve().then(() => {
      // mode="reviewItem" luôn giữ B (chỗ đã công khai) — ưu tiên B mặc định, thiếu ô nào
      // mới lấy A (bản mới quét). Đổi hành vi có chủ đích, không phải sửa lỗi — xem
      // DECISIONS.md 2026-08-21.
      if ((mode === "suggestion" && keepSide === "B") || mode === "reviewItem") {
        initFields(placeB, placeA);
      } else {
        initFields(placeA, placeB);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keepSide, placeA?.id, placeB?.id, mode]);

  async function runSearch() {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const results = await searchDuplicateCandidates({ query, excludePlaceId: sourceId });
      setCandidates(results);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  useEffect(() => {
    if (step === "search" && query.trim()) runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  function pickCandidate(place) {
    setPlaceB(place);
    setStep("compare");
  }

  function setField(key, value) {
    setFields((f) => ({ ...f, [key]: value }));
  }

  function togglePhoto(url) {
    setKeepPhotos((list) => (list.includes(url) ? list.filter((u) => u !== url) : [...list, url]));
  }

  async function runAction(action, formData) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await action(formData);
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  }

  if (step === "collapsed") {
    return (
      <button
        type="button"
        onClick={expand}
        className="mt-2 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-800"
      >
        So sánh &amp; gộp
      </button>
    );
  }

  if (step === "loading") {
    return <p className="mt-2 text-xs text-zinc-400">Đang tải dữ liệu...</p>;
  }

  if (step === "notfound") {
    return (
      <p className="mt-2 text-xs text-red-600">
        {mode === "suggestion"
          ? "Không tìm thấy chỗ bị báo trong danh sách đang công khai — có thể đã bị xoá trước đó."
          : "Không tìm thấy chỗ nghi trùng trong danh sách đang công khai — có thể đã bị xoá, xử lý qua 2 nút bên dưới như bình thường."}
      </p>
    );
  }

  if (step === "search") {
    return (
      <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-3">
        <p className="mb-2 text-xs font-medium text-zinc-600">
          Tìm chỗ nghi trùng với &quot;{placeA.name}&quot;
        </p>
        <div className="flex gap-2">
          <input
            className={inputClass}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Gõ tên chỗ để tìm"
          />
          <button
            type="button"
            onClick={runSearch}
            disabled={busy}
            className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 disabled:opacity-50"
          >
            Tìm
          </button>
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {busy && <p className="text-xs text-zinc-400">Đang tìm...</p>}
          {!busy && candidates.length === 0 && (
            <p className="text-xs text-zinc-400">
              Chưa tìm ra chỗ nào khớp — thử gõ tên khác hoặc sửa/xoá tay như bình thường.
            </p>
          )}
          {candidates.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCandidate(c)}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-sm text-zinc-700"
            >
              <span className="font-medium">{c.name}</span>{" "}
              <span className="text-zinc-400">— {c.address}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // step === "compare" — fields được điền qua effect (bọc .then() để tránh setState ngay
  // trong thân effect), nên có 1 nhịp render fields còn null trước khi effect kịp chạy. Chờ
  // thay vì đọc fields.* lúc còn null (vỡ trang — lỗi thật gặp khi test UI thật).
  if (!fields) {
    return <p className="mt-2 text-xs text-zinc-400">Đang tải dữ liệu...</p>;
  }

  const keepId = mode === "reviewItem" ? placeB.id : keepSide === "A" ? placeA.id : placeB.id;
  const deleteId = mode === "reviewItem" ? null : keepSide === "A" ? placeB.id : placeA.id;
  const mergeAction = mode === "suggestion" ? mergeDuplicatePlaces : mergeReviewCandidate;

  const hiddenFieldInputs = (
    <>
      <input type="hidden" name="name" value={fields.name} />
      <input type="hidden" name="type" value={fields.type} />
      <input type="hidden" name="address" value={fields.address} />
      <input type="hidden" name="ward" value={fields.ward} />
      <input type="hidden" name="localArea" value={fields.localArea} />
      <input type="hidden" name="phone" value={fields.phone} />
      <input type="hidden" name="priceMin" value={fields.priceMin} />
      <input type="hidden" name="priceMax" value={fields.priceMax} />
      <input type="hidden" name="priceUnit" value={fields.priceUnit} />
      {keepPhotos.map((url) => (
        <input key={url} type="hidden" name="keepPhoto" value={url} />
      ))}
    </>
  );

  return (
    <div className="mt-2 rounded-xl border border-zinc-200 bg-white p-3">
      <p className="mb-2 text-xs font-medium text-zinc-600">
        So sánh &quot;{placeA.name}&quot; (A) và &quot;{placeB.name}&quot; (B)
        {mode === "reviewItem" && " — A là bản ghi mới quét, chưa từng lên web"}
      </p>

      {mode === "suggestion" && (
        <div className="mb-3 flex items-center gap-3 rounded-lg bg-zinc-50 p-2">
          <span className="text-xs font-medium text-zinc-600">Giữ bản ghi của:</span>
          <label className="flex items-center gap-1 text-xs text-zinc-700">
            <input type="radio" checked={keepSide === "A"} onChange={() => setKeepSide("A")} /> Chỗ A
          </label>
          <label className="flex items-center gap-1 text-xs text-zinc-700">
            <input type="radio" checked={keepSide === "B"} onChange={() => setKeepSide("B")} /> Chỗ B
          </label>
        </div>
      )}

      <MergeField label="Tên" valueA={placeA.name} valueB={placeB.name} value={fields.name} onChange={(v) => setField("name", v)} />

      <div className="mb-2">
        <p className="text-xs font-medium text-zinc-500">Loại hình</p>
        <select
          value={fields.type}
          onChange={(e) => setField("type", e.target.value)}
          className={inputClass}
        >
          {PLACE_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <MergeField label="Địa chỉ" valueA={placeA.address} valueB={placeB.address} value={fields.address} onChange={(v) => setField("address", v)} />
      <MergeField label="Phường" valueA={placeA.ward} valueB={placeB.ward} value={fields.ward} onChange={(v) => setField("ward", v)} />
      <MergeField label="Khu vực" valueA={placeA.localArea} valueB={placeB.localArea} value={fields.localArea} onChange={(v) => setField("localArea", v)} />
      <MergeField label="SĐT" valueA={placeA.phone} valueB={placeB.phone} value={fields.phone} onChange={(v) => setField("phone", v)} />
      <MergeField label="Giá thấp nhất" valueA={placeA.priceMin} valueB={placeB.priceMin} value={fields.priceMin} onChange={(v) => setField("priceMin", v)} />
      <MergeField label="Giá cao nhất" valueA={placeA.priceMax} valueB={placeB.priceMax} value={fields.priceMax} onChange={(v) => setField("priceMax", v)} />
      <MergeField label="Đơn vị giá" valueA={placeA.priceUnit} valueB={placeB.priceUnit} value={fields.priceUnit} onChange={(v) => setField("priceUnit", v)} />

      {(placeA.photos?.length > 0 || placeB.photos?.length > 0) && (
        <div className="mb-2">
          <p className="mb-1 text-xs font-medium text-zinc-500">Ảnh giữ lại (bỏ tick để không giữ)</p>
          <div className="flex flex-wrap gap-2">
            {[...new Set([...(placeA.photos ?? []), ...(placeB.photos ?? [])])].map((url) => (
              <label key={url} className="relative">
                <input
                  type="checkbox"
                  checked={keepPhotos.includes(url)}
                  onChange={() => togglePhoto(url)}
                  className="absolute right-1 top-1 h-4 w-4"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover" />
              </label>
            ))}
          </div>
        </div>
      )}

      <form action={(fd) => runAction(mergeAction, fd)}>
        {mode === "suggestion" ? (
          <>
            <input type="hidden" name="suggestionId" value={suggestion.id} />
            <input type="hidden" name="keepId" value={keepId} />
            <input type="hidden" name="deleteId" value={deleteId} />
          </>
        ) : (
          <>
            <input type="hidden" name="reviewItemId" value={reviewItem.id} />
            <input type="hidden" name="keepId" value={keepId} />
          </>
        )}
        {hiddenFieldInputs}
        <button
          type="submit"
          disabled={busy}
          className="mt-2 w-full rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {busy
            ? "Đang gộp..."
            : mode === "reviewItem"
              ? "Gộp vào chỗ B"
              : `Gộp — giữ chỗ ${keepSide}, xoá chỗ ${keepSide === "A" ? "B" : "A"}`}
        </button>
      </form>

      {mode === "suggestion" && (
        <form action={(fd) => runAction(confirmSuggestionNotDuplicate, fd)}>
          <input type="hidden" name="suggestionId" value={suggestion.id} />
          <input type="hidden" name="placeAId" value={placeA.id} />
          <input type="hidden" name="placeBId" value={placeB.id} />
          <button
            type="submit"
            disabled={busy}
            className="mt-2 w-full rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 disabled:opacity-50"
          >
            Không trùng — nhớ luôn, đừng hỏi lại
          </button>
        </form>
      )}
    </div>
  );
}
