import { EVENT_STATUS, VERIFICATION, formatEventTime, formatEventWhen } from "@/lib/events";

// Một mốc trong timeline (CDP_P1-P8 §"Dynamic Timeline"). Trạng thái do máy chủ tính theo giờ
// thật, KHÔNG phải màu do admin sửa tay — 19/9 tới là mốc "Đêm hội trăng rằm thiếu nhi" tự
// chuyển sang "đang diễn ra" mà không ai phải đụng vào code.
export function EventCard({ event, status, grouped = false }) {
  const isPast = status === EVENT_STATUS.PAST;
  const isLive = status === EVENT_STATUS.LIVE;
  const isToday = status === EVENT_STATUS.TODAY;
  const isCancelled = event.verificationStatus === VERIFICATION.CANCELLED;
  const isSubdued = isPast || isCancelled;
  const verificationLabel = {
    [VERIFICATION.EXPECTED]: "Dự kiến",
    [VERIFICATION.TENTATIVE]: "Dự kiến",
    [VERIFICATION.UPDATING]: "Đang cập nhật lịch",
    [VERIFICATION.CHANGED]: "Có thay đổi",
    [VERIFICATION.CANCELLED]: "Đã huỷ",
    [VERIFICATION.CONFLICT]: "Đang xác minh ngày",
  }[event.verificationStatus];

  return (
    <li
      className={`${grouped ? "py-3 first:pt-0 last:pb-0" : "rounded-xl border p-3"} ${
        grouped
          ? ""
          : isCancelled
            ? "border-zinc-200 bg-zinc-50"
          : isLive
          ? "border-[#c8553d]/40 bg-[#c8553d]/5"
          : isPast
            ? "border-zinc-200 bg-zinc-50"
            : event.highlight
              ? "border-zinc-300 bg-white shadow-sm"
              : "border-zinc-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className={`text-sm font-semibold ${isSubdued ? "text-zinc-400" : "text-zinc-900"}`}>
          {grouped ? formatEventTime(event) : formatEventWhen(event)}
        </p>
        {isLive && (
          <span className="rounded-full bg-[#c8553d] px-2 py-0.5 text-[11px] font-medium text-white">
            Đang diễn ra
          </span>
        )}
        {isToday && (
          <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
            Hôm nay
          </span>
        )}
        {/* Trạng thái này thuộc độ tin cậy của NGUỒN, độc lập với việc mốc đã qua hay chưa. */}
        {verificationLabel && (
          <span className="rounded-full border border-zinc-300 px-2 py-0.5 text-[11px] text-zinc-500">
            {verificationLabel}
          </span>
        )}
      </div>

      <p className={`mt-0.5 text-sm ${isSubdued ? "text-zinc-400" : "text-zinc-800"}`}>
        {event.highlight && !isSubdued ? (
          <span className="font-medium">{event.title}</span>
        ) : (
          event.title
        )}
      </p>
      {event.description && !isSubdued && (
        <p className="mt-0.5 text-[13px] leading-relaxed text-zinc-600">{event.description}</p>
      )}
      {event.location && (
        <p className={`mt-0.5 text-xs ${isSubdued ? "text-zinc-400" : "text-zinc-500"}`}>
          {event.location}
        </p>
      )}
    </li>
  );
}
