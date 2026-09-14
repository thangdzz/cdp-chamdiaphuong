"use client";

import { useState } from "react";
import { TIME_PRECISION, VERIFICATION, timePrecisionOf } from "@/lib/events";
import { dateTimeInputValue, eventDateInputValue } from "@/lib/postEventForm";
import {
  addFestivalEvent,
  rollbackFestivalEvent,
  updateFestivalEvent,
} from "./festivalEventActions";

const STATUS_OPTIONS = [
  { value: VERIFICATION.CONFIRMED, label: "Đã xác nhận" },
  { value: VERIFICATION.TENTATIVE, label: "Dự kiến" },
  { value: VERIFICATION.UPDATING, label: "Đang cập nhật lịch" },
  { value: VERIFICATION.CHANGED, label: "Có thay đổi" },
  { value: VERIFICATION.CANCELLED, label: "Đã huỷ" },
  { value: VERIFICATION.CONFLICT, label: "Đang xác minh (nguồn mâu thuẫn)" },
];

const TIME_OPTIONS = [
  { value: TIME_PRECISION.EXACT, label: "Có giờ chính xác" },
  { value: TIME_PRECISION.MORNING, label: "Chỉ biết buổi sáng" },
  { value: TIME_PRECISION.AFTERNOON, label: "Chỉ biết buổi chiều" },
  { value: TIME_PRECISION.EVENING, label: "Chỉ biết buổi tối" },
  { value: TIME_PRECISION.DAY, label: "Chỉ biết ngày / cả ngày" },
  { value: TIME_PRECISION.UNKNOWN, label: "Chưa rõ ngày giờ" },
];

function verificationInputValue(value) {
  return value === VERIFICATION.EXPECTED ? VERIFICATION.TENTATIVE : value;
}

function EventFields({ event = {} }) {
  const [timePrecision, setTimePrecision] = useState(timePrecisionOf(event));
  const hasExactTime = timePrecision === TIME_PRECISION.EXACT;

  return (
    <>
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
        Tiêu đề
        <input
          name="title"
          defaultValue={event.title ?? ""}
          required
          maxLength={160}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Trạng thái
        <select
          name="verificationStatus"
          defaultValue={verificationInputValue(event.verificationStatus) ?? VERIFICATION.TENTATIVE}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
        Nguồn nói thời gian chính xác đến đâu?
        <select
          name="timePrecision"
          value={timePrecision}
          onChange={(e) => setTimePrecision(e.target.value)}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      {hasExactTime ? (
        <>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Bắt đầu (giờ Việt Nam)
            <input
              type="datetime-local"
              name="startAt"
              required
              defaultValue={dateTimeInputValue(event.startAt)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Kết thúc (giờ Việt Nam)
            <input
              type="datetime-local"
              name="endAt"
              defaultValue={dateTimeInputValue(event.endAt)}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
            />
          </label>
        </>
      ) : (
        <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
          Ngày diễn ra (để trống nếu chưa rõ ngày)
          <input
            type="date"
            name="date"
            defaultValue={eventDateInputValue(event)}
            className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
        Chữ hiển thị khi chưa có ngày
        <input
          name="whenText"
          defaultValue={event.whenText ?? ""}
          placeholder="VD: Trong tháng 9/2026 — chưa có ngày cụ thể"
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
        Địa điểm
        <input
          name="location"
          defaultValue={event.location ?? ""}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-3">
        Mô tả ngắn
        <textarea
          name="description"
          defaultValue={event.description ?? ""}
          rows={2}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-2">
        Tên nguồn
        <input
          name="sourceName"
          defaultValue={event.source?.name ?? ""}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Ngày nguồn cập nhật
        <input
          type="date"
          name="sourceUpdatedAt"
          defaultValue={event.source?.updatedAt ?? ""}
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-zinc-500 sm:col-span-3">
        Link nguồn
        <input
          type="url"
          name="sourceUrl"
          defaultValue={event.source?.url ?? ""}
          placeholder="https://..."
          className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
        />
      </label>
      <div className="flex flex-wrap gap-4 text-sm text-zinc-700 sm:col-span-3">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="highlight" defaultChecked={event.highlight === true} />
          Mốc chính
        </label>
      </div>
    </>
  );
}

function revisionLabel(revision) {
  if (revision.changeType === "created") return "Đã thêm";
  if (revision.changeType === "rollback") return "Đã hoàn tác";
  return "Đã sửa";
}

function revisionTime(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function FestivalEventsManager({ events, revisions, saved, error }) {
  return (
    <section id="festival-events" className="mb-8 scroll-mt-4">
      <h2 className="mb-1 text-lg font-bold text-zinc-900">Lịch Lễ hội Thành Tuyên</h2>
      <p className="mb-3 text-sm text-zinc-500">
        Lưu ở đây là trang chủ và trang lễ hội đổi ngay, không cần deploy. Không xoá mốc cũ;
        nếu lịch bị huỷ, chuyển trạng thái sang “Đã huỷ”.
      </p>
      {saved && <p className="mb-3 text-sm text-green-700">✓ Đã lưu lịch.</p>}
      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

      <div className="flex flex-col gap-3">
        {events.map((event) => (
          <details key={event.id} className="rounded-xl border border-zinc-200 bg-white p-3">
            <summary className="cursor-pointer text-sm font-medium text-zinc-900">
              {event.title}
            </summary>
            <form action={updateFestivalEvent} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input type="hidden" name="id" value={event.id} />
              <EventFields event={event} />
              <button
                type="submit"
                className="mt-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white sm:col-span-3 sm:justify-self-start"
              >
                Lưu mốc này
              </button>
            </form>
          </details>
        ))}
      </div>

      <details className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-zinc-900">+ Thêm mốc mới</summary>
        <form action={addFestivalEvent} className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <EventFields />
          <button
            type="submit"
            className="mt-1 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white sm:col-span-3 sm:justify-self-start"
          >
            Thêm vào lịch
          </button>
        </form>
      </details>

      <details className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-zinc-900">
          Lịch sử thay đổi ({revisions.length})
        </summary>
        {revisions.length === 0 ? (
          <p className="mt-2 text-xs text-zinc-500">
            Chưa có thay đổi nào từ màn này. Lịch sử bắt đầu được lưu từ lần sửa tiếp theo.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {revisions.slice(0, 10).map((revision) => (
              <div key={revision.id} className="flex items-center justify-between gap-3 border-t border-zinc-200 pt-2 first:border-0 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm text-zinc-800">
                    {revisionLabel(revision)} · {revision.newEvent?.title ?? revision.oldEvent?.title ?? "Mốc lịch"}
                  </p>
                  <p className="text-xs text-zinc-500">{revisionTime(revision.publishedAt)}</p>
                </div>
                {revision.changeType !== "rollback" && (
                  <form
                    action={rollbackFestivalEvent}
                    onSubmit={(event) => {
                      if (!window.confirm("Hoàn tác mốc này về nội dung trước lần sửa?")) {
                        event.preventDefault();
                      }
                    }}
                  >
                    <input type="hidden" name="revisionId" value={revision.id} />
                    <button type="submit" className="whitespace-nowrap text-xs font-medium text-zinc-600 underline">
                      Hoàn tác
                    </button>
                  </form>
                )}
              </div>
            ))}
          </div>
        )}
      </details>
    </section>
  );
}
