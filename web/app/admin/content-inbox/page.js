import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { TIME_PRECISION, VERIFICATION, formatEventWhen } from "@/lib/events";
import { dateTimeInputValue } from "@/lib/postEventForm";
import { getPostEvents } from "@/lib/postEvents";
import { FESTIVAL_EVENTS, POST_META } from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";
import {
  CONTENT_INBOX_STATUS,
  CONTENT_INPUT_TYPE,
  CONTENT_PROCESSING_STATUS,
  MAX_INBOX_INPUT_LENGTH,
  getContentInboxItems,
} from "@/lib/contentInbox";
import {
  analyzeWaitingContent,
  deleteContentPermanently,
  ignoreContent,
  publishContent,
  receiveContent,
  restoreContent,
  saveDraft,
} from "./actions";
import ConfirmActionButton from "./ConfirmActionButton";
import { AdminNav } from "../AdminNav";

export const dynamic = "force-dynamic";

const INPUT_LABEL = {
  [CONTENT_INPUT_TYPE.URL]: "Một đường link",
  [CONTENT_INPUT_TYPE.MULTIPLE_URLS]: "Nhiều đường link",
  [CONTENT_INPUT_TYPE.TEXT]: "Nội dung dán tay",
};

const CHANGE_LABEL = {
  new_event: "EVENT MỚI",
  possible_update: "CÓ THỂ LÀ CẬP NHẬT",
  needs_review: "CẦN XEM LẠI",
  needs_content: "CHƯA ĐỌC ĐƯỢC NỘI DUNG",
};

const TIME_LABEL = {
  [TIME_PRECISION.EXACT]: "Giờ chính xác",
  [TIME_PRECISION.MORNING]: "Buổi sáng",
  [TIME_PRECISION.AFTERNOON]: "Buổi chiều",
  [TIME_PRECISION.EVENING]: "Buổi tối",
  [TIME_PRECISION.DAY]: "Cả ngày",
  [TIME_PRECISION.UNKNOWN]: "Chưa rõ giờ",
};

const TAB_META = [
  { id: CONTENT_INBOX_STATUS.NEW, label: "Mới" },
  { id: CONTENT_INBOX_STATUS.DRAFT, label: "Bản nháp" },
  { id: CONTENT_INBOX_STATUS.PUBLISHED, label: "Đã đăng" },
  { id: CONTENT_INBOX_STATUS.IGNORED, label: "Bỏ qua" },
];

function itemStatus(item) {
  return Object.values(CONTENT_INBOX_STATUS).includes(item.status)
    ? item.status
    : CONTENT_INBOX_STATUS.NEW;
}

function formatCandidateDate(candidate) {
  if (!candidate?.date) return candidate?.dateText ?? "Chưa rõ ngày";
  const [year, month, day] = candidate.date.split("-");
  return `${Number(day)}/${Number(month)}/${year}`;
}

function formatCreatedAt(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function candidateOf(item) {
  return item.draftEvent ?? item.analysis?.candidate ?? {};
}

function candidateStartValue(candidate) {
  if (candidate.startAt) return dateTimeInputValue(candidate.startAt);
  if (candidate.date && candidate.timePrecision === TIME_PRECISION.EXACT && candidate.timeText) {
    return `${candidate.date}T${candidate.timeText}`;
  }
  return "";
}

function CandidateEditor({ item, matchedEvent }) {
  const candidate = candidateOf(item);
  const postSlug = item.draftPostSlug ?? item.analysis?.relatedPostSlug ?? "";
  const sourceUrl = candidate.source?.url ?? item.sourceUrls?.[0] ?? "";
  const sourceName = candidate.source?.name ?? candidate.sourceName ?? "";

  return (
    <details open={item.status === CONTENT_INBOX_STATUS.DRAFT} className="mt-3 rounded-lg border border-zinc-200 bg-white p-3">
      <summary className="cursor-pointer text-sm font-semibold text-zinc-900">Chỉnh sửa và xử lý kết quả</summary>
      <form className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={item.id} />
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Post nhận dữ liệu
          <select name="postSlug" defaultValue={postSlug} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900">
            <option value="">Chưa xác định</option>
            <option value={POST_META.slug}>{POST_META.title}</option>
          </select>
        </label>
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Tên sự kiện
          <input name="title" required maxLength={160} defaultValue={candidate.title ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Mô tả
          <textarea name="description" rows={3} maxLength={500} defaultValue={candidate.description ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Địa điểm
          <input name="location" maxLength={200} defaultValue={candidate.location ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700">
          Mức chính xác thời gian
          <select name="timePrecision" defaultValue={candidate.timePrecision ?? TIME_PRECISION.UNKNOWN} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900">
            {Object.entries(TIME_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="text-sm text-zinc-700">
          Ngày diễn ra
          <input type="date" name="date" defaultValue={candidate.date ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700">
          Giờ bắt đầu (khi chọn giờ chính xác)
          <input type="datetime-local" name="startAt" defaultValue={candidateStartValue(candidate)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700">
          Giờ kết thúc
          <input type="datetime-local" name="endAt" defaultValue={dateTimeInputValue(candidate.endAt)} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Chữ hiển thị khi chưa rõ ngày
          <input name="whenText" maxLength={160} defaultValue={candidate.whenText ?? ""} placeholder="Ví dụ: Trong tháng 9/2026" className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700">
          Trạng thái xác minh
          <select name="verificationStatus" defaultValue={candidate.verificationStatus ?? VERIFICATION.UPDATING} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900">
            <option value={VERIFICATION.CONFIRMED}>Đã xác nhận</option>
            <option value={VERIFICATION.TENTATIVE}>Dự kiến</option>
            <option value={VERIFICATION.UPDATING}>Đang cập nhật</option>
            <option value={VERIFICATION.CHANGED}>Đã thay đổi</option>
            <option value={VERIFICATION.CANCELLED}>Đã huỷ</option>
            <option value={VERIFICATION.CONFLICT}>Mâu thuẫn</option>
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700">
          <input type="checkbox" name="highlight" defaultChecked={candidate.highlight === true} /> Mốc nổi bật
        </label>
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Tên nguồn
          <input name="sourceName" maxLength={200} defaultValue={sourceName} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700 sm:col-span-2">
          Link nguồn
          <input type="url" name="sourceUrl" maxLength={500} defaultValue={sourceUrl} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700">
          Ngày nguồn cập nhật
          <input type="date" name="sourceUpdatedAt" defaultValue={candidate.source?.updatedAt ?? ""} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900" />
        </label>
        <label className="text-sm text-zinc-700">
          Khi Public
          <select name="publishMode" defaultValue={item.draftPublishMode ?? (matchedEvent ? "update" : "create")} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900">
            {matchedEvent && <option value="update">Cập nhật “{matchedEvent.title}”</option>}
            <option value="create">Tạo một sự kiện mới</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" formAction={saveDraft} className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700">Lưu bản nháp</button>
          <ConfirmActionButton action={publishContent} message="Public thông tin này lên lịch đang hiển thị cho khách? Thao tác sẽ được lưu lịch sử để hoàn tác." className="rounded-lg bg-green-700 px-3 py-2 text-sm font-medium text-white">Public</ConfirmActionButton>
        </div>
      </form>
    </details>
  );
}

function AnalysisPreview({ item, matchedEvent }) {
  const analysis = item.analysis;
  if (!analysis) return null;
  return (
    <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-wide text-[#c8553d]">{CHANGE_LABEL[analysis.comparison?.changeType] ?? "ĐÃ PHÂN TÍCH"}</p>
        <p className="text-xs text-zinc-500">Độ tin cậy {analysis.confidence}/100</p>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div><dt className="text-xs text-zinc-500">Loại / chủ đề</dt><dd className="font-medium text-zinc-900">{analysis.detectedType === "event" ? "Sự kiện" : "Chưa xác định"} · {analysis.topic}</dd></div>
        <div><dt className="text-xs text-zinc-500">Khu vực</dt><dd className="font-medium text-zinc-900">{analysis.region ?? "Chưa rõ"}</dd></div>
        <div><dt className="text-xs text-zinc-500">Post phù hợp</dt><dd className="font-medium text-zinc-900">{analysis.relatedPostTitle ?? "Chưa xác định"}</dd></div>
        <div><dt className="text-xs text-zinc-500">So với lịch</dt><dd className="font-medium text-zinc-900">{analysis.comparison?.note}</dd></div>
      </dl>
      {analysis.candidate && (
        <div className="mt-4 border-t border-zinc-200 pt-3">
          <p className="font-bold text-zinc-900">{analysis.candidate.title ?? "Sự kiện chưa rõ tên"}</p>
          <p className="mt-1 text-sm text-zinc-700">{formatCandidateDate(analysis.candidate)} · {analysis.candidate.timeText ?? TIME_LABEL[analysis.candidate.timePrecision]}</p>
          <p className="mt-1 text-sm text-zinc-700">{analysis.candidate.location ?? "Chưa rõ địa điểm"}</p>
          <p className="mt-1 text-sm text-zinc-500">Nguồn: {analysis.candidate.sourceName ?? "Chưa xác định"}</p>
        </div>
      )}
      {matchedEvent && (
        <div className="mt-3 grid gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm sm:grid-cols-2">
          <div><p className="text-xs font-bold text-amber-900">DỮ LIỆU ĐANG CÓ</p><p className="mt-1 font-medium text-zinc-900">{matchedEvent.title}</p><p className="text-zinc-700">{formatEventWhen(matchedEvent)}</p><p className="text-zinc-700">{matchedEvent.location ?? "Chưa rõ địa điểm"}</p></div>
          <div><p className="text-xs font-bold text-amber-900">DỮ LIỆU MỚI</p><p className="mt-1 font-medium text-zinc-900">{analysis.candidate?.title ?? "Chưa rõ tên"}</p><p className="text-zinc-700">{formatCandidateDate(analysis.candidate)} · {analysis.candidate?.timeText ?? TIME_LABEL[analysis.candidate?.timePrecision]}</p><p className="text-zinc-700">{analysis.candidate?.location ?? "Chưa rõ địa điểm"}</p></div>
        </div>
      )}
      {analysis.warnings?.length > 0 && <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-amber-800">{analysis.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}
      <p className="mt-3 text-xs text-zinc-500">Phân tích sơ bộ bằng quy tắc dữ liệu; chưa dùng dịch vụ AI và chưa tự public.</p>
      <form action={analyzeWaitingContent} className="mt-3"><input type="hidden" name="id" value={item.id} /><button type="submit" className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700">Phân tích lại</button></form>
    </div>
  );
}

export default async function ContentInboxPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");
  const [items, events, params] = await Promise.all([getContentInboxItems(), getPostEvents(POST_META.slug, FESTIVAL_EVENTS), searchParams]);
  const requestedTab = params?.tab;
  const activeTab = TAB_META.some((tab) => tab.id === requestedTab) ? requestedTab : CONTENT_INBOX_STATUS.NEW;
  const visibleItems = items.filter((item) => itemStatus(item) === activeTab);
  const eventsById = new Map(events.map((event) => [event.id, event]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <AdminNav current="/admin/content-inbox" />
      <h1 className="mt-3 text-2xl font-bold text-zinc-900">Content Inbox</h1>
      <p className="mt-1 text-sm leading-relaxed text-zinc-500">Dán nguồn mới → xem kết quả → sửa nếu cần → lưu nháp hoặc Public. Hệ thống không tự đăng khi anh chưa xác nhận.</p>
      <form action={receiveContent} className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="text-sm font-medium text-zinc-900" htmlFor="content-inbox-input">URL hoặc nội dung mới</label>
        <textarea id="content-inbox-input" name="content" required maxLength={MAX_INBOX_INPUT_LENGTH} rows={9} placeholder={"Dán một hoặc nhiều URL (mỗi dòng một link), hoặc copy nguyên nội dung bài viết/Facebook vào đây..."} className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900" />
        <button type="submit" className="mt-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white">Phân tích</button>
        {params?.analyzed === "1" && <p className="mt-2 text-sm text-green-700">✓ Đã phân tích. Xem kết quả ở thẻ bên dưới.</p>}
        {params?.removed === "1" && <p className="mt-2 text-sm text-green-700">✓ Đã gỡ khỏi danh sách Mới. Có thể khôi phục trong tab Bỏ qua.</p>}
        {params?.restored === "1" && <p className="mt-2 text-sm text-green-700">✓ Đã khôi phục nội dung.</p>}
        {params?.draftSaved === "1" && <p className="mt-2 text-sm text-green-700">✓ Đã lưu bản nháp, chưa public.</p>}
        {params?.published === "1" && <p className="mt-2 text-sm text-green-700">✓ Đã Public và lưu lịch sử hoàn tác.</p>}
        {params?.deleted === "1" && <p className="mt-2 text-sm text-green-700">✓ Đã xóa hẳn nội dung.</p>}
        {params?.error && <p className="mt-2 text-sm text-red-700">{params.error}</p>}
      </form>
      <nav className="mt-6 flex gap-2 overflow-x-auto pb-1" aria-label="Trạng thái Content Inbox">
        {TAB_META.map((tab) => {
          const count = items.filter((item) => itemStatus(item) === tab.id).length;
          return <Link key={tab.id} href={`/admin/content-inbox?tab=${tab.id}`} className={`whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${activeTab === tab.id ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"}`}>{tab.label} ({count})</Link>;
        })}
      </nav>
      <section className="mt-4">
        {visibleItems.length === 0 ? <p className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-500">Tab này chưa có nội dung.</p> : (
          <div className="flex flex-col gap-3">
            {visibleItems.map((item) => {
              const matchedEvent = eventsById.get(item.analysis?.comparison?.matchedEventId) ?? null;
              return (
                <article id={item.id} key={item.id} className="scroll-mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-zinc-900">{INPUT_LABEL[item.inputType] ?? "Nội dung"}</p><p className="text-xs text-zinc-400">{formatCreatedAt(item.createdAt)}</p></div>
                  {item.processingStatus === CONTENT_PROCESSING_STATUS.WAITING ? <form action={analyzeWaitingContent} className="mt-3 rounded-lg bg-amber-50 p-3"><input type="hidden" name="id" value={item.id} /><p className="text-sm text-amber-900">Mục cũ chưa chạy phân tích.</p><button type="submit" className="mt-2 rounded-lg bg-amber-900 px-3 py-2 text-sm font-medium text-white">Phân tích ngay</button></form> : <AnalysisPreview item={item} matchedEvent={matchedEvent} />}
                  {activeTab === CONTENT_INBOX_STATUS.PUBLISHED && item.draftEvent && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">Đã đăng: {item.draftEvent.title} · {formatEventWhen(item.draftEvent)}</p>}
                  {(activeTab === CONTENT_INBOX_STATUS.NEW || activeTab === CONTENT_INBOX_STATUS.DRAFT) && <CandidateEditor item={item} matchedEvent={matchedEvent} />}
                  <details className="mt-3"><summary className="cursor-pointer text-sm text-zinc-500">Xem nội dung gốc</summary><pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-relaxed text-zinc-700">{item.rawContent}</pre></details>
                  {item.sourceUrls?.length > 0 && <div className="mt-3 flex flex-col gap-1">{item.sourceUrls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="truncate text-sm text-[#c8553d] underline">{item.sourceUrls.length > 1 ? `Xem nguồn ${index + 1} ↗` : "Xem nguồn ↗"}</a>)}</div>}
                  {(activeTab === CONTENT_INBOX_STATUS.NEW || activeTab === CONTENT_INBOX_STATUS.DRAFT) && <form action={ignoreContent} className="mt-4 border-t border-zinc-100 pt-3"><input type="hidden" name="id" value={item.id} /><button type="submit" className="text-sm font-medium text-red-700 underline">Bỏ qua / gỡ khỏi danh sách</button></form>}
                  {activeTab === CONTENT_INBOX_STATUS.IGNORED && <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-3"><form action={restoreContent}><input type="hidden" name="id" value={item.id} /><button type="submit" className="text-sm font-medium text-zinc-700 underline">Khôi phục</button></form><form><input type="hidden" name="id" value={item.id} /><ConfirmActionButton action={deleteContentPermanently} message="Xóa hẳn nội dung này? Sau khi xóa sẽ không khôi phục được." className="text-sm font-medium text-red-700 underline">Xóa hẳn</ConfirmActionButton></form></div>}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
