import { EVENT_STATUS, VERIFICATION, formatEventWhen } from "@/lib/events";

// Một mốc trong timeline (CDP_P1-P8 §"Dynamic Timeline"). Trạng thái do máy chủ tính theo giờ
// thật, KHÔNG phải màu do admin sửa tay — 19/9 tới là mốc "Đêm hội trăng rằm thiếu nhi" tự
// chuyển sang "đang diễn ra" mà không ai phải đụng vào code.
export function EventCard({ event, status }) {
  const isPast = status === EVENT_STATUS.PAST;
  const isLive = status === EVENT_STATUS.LIVE;
  const expected = event.verificationStatus === VERIFICATION.EXPECTED;

  return (
    <li
      className={`rounded-xl border p-3 ${
        isLive
          ? "border-[#c8553d]/40 bg-[#c8553d]/5"
          : isPast
            ? "border-zinc-200 bg-zinc-50"
            : event.highlight
              ? "border-zinc-300 bg-white shadow-sm"
              : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className={`text-sm font-semibold ${isPast ? "text-zinc-400" : "text-zinc-900"}`}>
          {formatEventWhen(event)}
        </p>
        {isLive && (
          <span className="rounded-full bg-[#c8553d] px-2 py-0.5 text-[11px] font-medium text-white">
            Đang diễn ra
          </span>
        )}
        {/* "Dự kiến" nói thật là nguồn chưa chốt — khách đi xa mấy trăm cây số cần biết mốc nào
            chắc, mốc nào còn có thể đổi. */}
        {expected && !isPast && (
          <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-500">
            Dự kiến
          </span>
        )}
      </div>

      <p className={`mt-0.5 text-sm ${isPast ? "text-zinc-400" : "text-zinc-800"}`}>
        {event.highlight && !isPast ? (
          <span className="font-medium">{event.title}</span>
        ) : (
          event.title
        )}
      </p>
      {event.description && !isPast && (
        <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-600">{event.description}</p>
      )}
      {event.location && (
        <p className={`mt-0.5 text-xs ${isPast ? "text-zinc-400" : "text-zinc-500"}`}>
          {event.location}
        </p>
      )}
    </li>
  );
}
