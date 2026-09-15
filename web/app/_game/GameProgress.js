"use client";

import { useEffect, useRef, useState } from "react";

// Số đếm chạy từ giá trị cũ sang giá trị mới (7 → 8) thay vì nhảy cóc — NOTE-04 §10 "Progress".
export function AnimatedNumber({ value, duration = 700 }) {
  const [shown, setShown] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    if (from === value) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const start = performance.now();
    const tick = (time) => {
      const t = reduce ? 1 : Math.min(1, (time - start) / duration);
      const eased = 1 - (1 - t) ** 3;
      setShown(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      fromRef.current = value;
    };
  }, [value, duration]);

  return <span className="tabular-nums">{shown}</span>;
}

// Thanh tiến độ chỉ đổi transform (NOTE-04 §10 "Performance"). `from` cho phép màn thành công
// bắt đầu ở giá trị cũ rồi mới chạy tới giá trị mới.
export function ProgressBar({ ratio, from, delayMs = 0, className = "" }) {
  const [current, setCurrent] = useState(from ?? ratio);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCurrent(ratio));
    return () => cancelAnimationFrame(frame);
  }, [ratio]);

  return (
    <div className={`h-2.5 overflow-hidden rounded-full bg-[#efe4d3] ${className}`}>
      <div
        className="h-full origin-left rounded-full bg-gradient-to-r from-[#e0a526] to-[#c8553d] transition-transform duration-[900ms] ease-out"
        style={{ transform: `scaleX(${Math.max(0, Math.min(1, current))})`, transitionDelay: `${delayMs}ms` }}
      />
    </div>
  );
}

export function SoundToggle({ enabled, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Tắt âm thanh" : "Bật âm thanh"}
      className="cdp-pressable flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white text-lg shadow-sm"
    >
      {enabled ? "🔊" : "🔇"}
    </button>
  );
}

export function GameSummary({ event, progress, totalSightings }) {
  const noun = event.copy.objectNoun;
  return (
    <section className="rounded-2xl bg-white px-4 py-3.5 shadow-sm">
      <p className="text-[13px] text-zinc-500">Bộ sưu tập của bạn</p>
      {/* Mẫu số là số mô hình CDP ĐANG BIẾT, không phải tổng chính thức (NOTE-04 §5). Chưa biết
          mô hình nào thì chỉ nói "đã gặp N". */}
      {progress.knownTotal > 0 ? (
        <>
          <p className="mt-0.5 flex items-baseline gap-1.5 text-zinc-900">
            <span className="text-3xl font-medium tracking-tight">
              <AnimatedNumber value={progress.metKnown} />
              <span className="text-zinc-300"> / </span>
              <AnimatedNumber value={progress.knownTotal} />
            </span>
            <span className="text-[13px] text-zinc-500">{noun} đã biết</span>
          </p>
          <ProgressBar ratio={progress.ratio} className="mt-2" />
        </>
      ) : (
        <p className="mt-0.5 text-2xl font-medium tracking-tight text-zinc-900">
          Bạn đã gặp <AnimatedNumber value={progress.metKnown + progress.metMysteries} /> {noun}
        </p>
      )}
      {progress.metMysteries > 0 && (
        <p className="mt-2 text-[13px] text-zinc-500">
          + {progress.metMysteries} {noun} bí ẩn đang chờ xác định tên
        </p>
      )}
      <p className="mt-2.5 text-[13px] leading-5 text-zinc-600">
        Cộng đồng đã ghi nhận{" "}
        <b className="font-medium text-zinc-900">
          <AnimatedNumber value={progress.communityKnown} /> {noun} khác nhau
        </b>
        {progress.communityMysteries > 0 ? ` · ${progress.communityMysteries} chưa rõ tên` : ""}
        {totalSightings > 0 ? ` · ${totalSightings} lượt báo` : ""}
      </p>
    </section>
  );
}
