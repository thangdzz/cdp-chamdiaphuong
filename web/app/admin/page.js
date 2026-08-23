import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getLivePlaces, getPendingPlaces } from "@/lib/redis";
import { formatPriceText, parsePriceRangeText } from "@/lib/priceFormat";
import { getReviewQueue } from "@/lib/ingestion/store";
import { REVIEW_STATUS } from "@/lib/ingestion/schema";
import { getSuggestions } from "@/lib/suggestions";
import { PLACE_TYPES } from "@/lib/placeTypes";
import { getAdminNotebookStats } from "@/lib/notebooks";
import { getNoteQueue } from "@/lib/notes";
import {
  login,
  logout,
  addPending,
  approvePending,
  rejectPending,
} from "./actions";
import { approveReviewItem, rejectReviewItem } from "./reviewActions";
import { approveSuggestion, rejectSuggestion } from "./suggestionActions";
import { approveNoteAction, rejectNoteAction } from "./noteActions";
import { IngestPasteBox } from "./IngestPasteBox";
import { MergeDuplicatePanel } from "./MergeDuplicatePanel";
import { Field, PlaceForm } from "./PlaceFormFields";
import { LivePlacesManager } from "./LivePlacesManager";

const NOTE_QUESTION_LABEL = { tip: "Bạn có mẹo gì cho chỗ này không?" };

const SUGGESTION_FIELD_LABEL = {
  address: "Địa chỉ",
  localArea: "Khu vực",
  phone: "SĐT",
  priceMin: "Giá thấp nhất",
  priceMax: "Giá cao nhất",
  priceUnit: "Đơn vị giá",
  duplicateOfName: "Nghi trùng với",
};

const REVIEW_TYPE_LABEL = {
  new_place: "Địa điểm mới",
  changed_place: "Có thay đổi",
  conflict_detected: "Mâu thuẫn dữ liệu",
  duplicate_candidate: "Nghi trùng lặp",
  stale_place: "Lâu chưa xác nhận",
  low_confidence_place: "Độ tin cậy thấp",
};

const REVIEW_ACTION_LABELS = {
  new_place: { approve: "Duyệt (đăng công khai)", reject: "Từ chối" },
  low_confidence_place: { approve: "Duyệt (đăng công khai)", reject: "Từ chối" },
  changed_place: { approve: "Áp dụng thay đổi", reject: "Giữ nguyên, bỏ qua" },
  duplicate_candidate: { approve: "Đúng là trùng lặp", reject: "Không trùng, sửa thành chỗ mới" },
  stale_place: { approve: "Vẫn hoạt động", reject: "Gỡ khỏi công khai" },
  conflict_detected: { approve: "Đã xử lý xong", reject: "Bỏ qua" },
};

export const dynamic = "force-dynamic";

function LoginForm({ hasError }) {
  return (
    <div className="mx-auto mt-20 max-w-sm px-4">
      <h1 className="text-xl font-bold text-zinc-900">Đăng nhập quản trị</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Chạm Địa Phương — trang duyệt dữ liệu (nội bộ).
      </p>
      <form action={login} className="mt-4 flex flex-col gap-3">
        <input
          type="password"
          name="password"
          placeholder="Mật khẩu"
          required
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        {hasError && (
          <p className="text-sm text-red-600">Sai mật khẩu, thử lại.</p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}

function ReviewItemCard({ item }) {
  const labels = REVIEW_ACTION_LABELS[item.type] ?? { approve: "Duyệt", reject: "Từ chối" };
  const c = item.candidate;
  const parsedPrice = c ? parsePriceRangeText(c.price_range_text) : null;
  const editable = {
    name: c?.name,
    type: c?.category_primary,
    address: c?.address_text,
    ward: c?.area_preset,
    priceMin: parsedPrice?.priceMin,
    priceMax: parsedPrice?.priceMax,
    priceUnit: parsedPrice?.priceUnit,
  };
  const preview = c ? formatPriceText(editable) ?? "Chưa có giá" : null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-amber-200 px-2 py-0.5 text-xs font-medium text-amber-900">
          {REVIEW_TYPE_LABEL[item.type] ?? item.type}
        </span>
        <span className="text-xs text-zinc-500">
          Độ tin cậy: {Math.round(item.confidence_score * 100)}%
        </span>
      </div>

      <form>
        <input type="hidden" name="id" value={item.id} />
        {c ? (
          <>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Field label="Tên" name="name" defaultValue={editable.name} />
              <label className="flex flex-col gap-1 text-xs text-zinc-500">
                Loại hình
                <select
                  name="type"
                  defaultValue={editable.type}
                  className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
                >
                  {PLACE_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <Field label="Địa chỉ" name="address" defaultValue={editable.address} />
              <Field label="Khu vực (phường)" name="ward" defaultValue={editable.ward} />
              <Field label="Giá thấp nhất" name="priceMin" type="number" defaultValue={editable.priceMin} />
              <Field label="Giá cao nhất" name="priceMax" type="number" defaultValue={editable.priceMax} />
              <Field label="Đơn vị (đêm, bát, ly...)" name="priceUnit" defaultValue={editable.priceUnit} />
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Giá sẽ hiển thị cho khách: <span className="font-medium text-zinc-700">{preview}</span>
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-zinc-600">
            Địa điểm đã công khai (id: {item.matchedLivePlaceId}) — không có dữ liệu mới, chỉ
            cần xác nhận còn hoạt động hay không.
          </p>
        )}

        {item.conflicts?.length > 0 && (
          <div className="mt-2 rounded-lg border border-red-300 bg-red-50 p-2">
            <p className="text-xs font-semibold text-red-800">
              ⚠ 2 lần quét cho thông tin khác nhau — đang giữ giá trị cũ, anh kiểm tra và tự
              sửa field bên trên nếu giá trị mới đúng hơn:
            </p>
            <ul className="mt-1 list-disc pl-5 text-xs text-red-700">
              {item.conflicts.map((c, idx) => (
                <li key={idx}>
                  {c.field}: đang lưu &quot;{c.oldValue}&quot;, lần quét sau ghi &quot;
                  {c.newValue}&quot;
                </li>
              ))}
            </ul>
          </div>
        )}

        {item.diff?.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-xs text-zinc-600">
            {item.diff.map((d, idx) => (
              <li key={idx}>
                {d.field}: &quot;{d.oldValue ?? "(trống)"}&quot; → &quot;{d.newValue}&quot;
              </li>
            ))}
          </ul>
        )}

        {item.reasons?.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-xs text-zinc-500">
            {item.reasons.map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        )}

        <div className="mt-3 flex gap-2">
          <button
            formAction={approveReviewItem}
            className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white"
          >
            {labels.approve}
          </button>
          <button
            formAction={rejectReviewItem}
            className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700"
          >
            {labels.reject}
          </button>
        </div>
      </form>

      {item.type === "duplicate_candidate" && item.duplicateOfCandidates?.length > 0 && (
        <MergeDuplicatePanel mode="reviewItem" reviewItem={item} />
      )}
    </div>
  );
}

// Ghi chú công khai bằng chữ (SPEC-chang-5.md §6) — loại nội dung duy nhất luôn phải qua
// duyệt. item.reported = true là mục vừa bị 2 người báo sai, tự ẩn, quay lại đây (lớp 5).
function NoteCard({ item, placeName }) {
  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-violet-200 px-2 py-0.5 text-xs font-medium text-violet-900">
          {item.reported ? "Bị báo sai — chờ duyệt lại" : "Ghi chú mới"}
        </span>
        <span className="text-xs text-zinc-500">AI: {item.aiVerdict ?? "—"}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-zinc-800">{placeName}</p>
      <p className="mt-1 text-xs text-zinc-500">
        {NOTE_QUESTION_LABEL[item.questionId] ?? item.questionId ?? "Mẹo tự do"}
      </p>
      <p className="mt-1 text-sm text-zinc-700">💬 {item.text}</p>
      {item.festivalOnly && (
        <p className="mt-1 text-xs text-amber-700">Chỉ đúng dịp lễ hội — tự ẩn sau 25/09</p>
      )}

      <form className="mt-3 flex gap-2">
        <input type="hidden" name="id" value={item.id} />
        <button
          formAction={approveNoteAction}
          className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white"
        >
          Duyệt
        </button>
        <button
          formAction={rejectNoteAction}
          className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700"
        >
          Bỏ
        </button>
      </form>
    </div>
  );
}

function SuggestionCard({ item }) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-sky-200 px-2 py-0.5 text-xs font-medium text-sky-900">
          {item.type === "photo" ? "Ảnh góp ý" : "Báo sai / đề xuất sửa"}
        </span>
        <span className="text-xs text-zinc-500">Từ: {item.contributorNickname}</span>
      </div>

      <p className="mt-2 text-sm font-medium text-zinc-800">{item.placeName}</p>

      {item.type === "photo" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.photoUrl}
          alt=""
          className="mt-2 h-32 w-32 rounded-lg object-cover"
        />
      ) : (
        <>
          {item.fields?.closed ? (
            <p className="mt-2 text-sm font-semibold text-red-700">
              ⚠ Báo là chỗ này đã đóng cửa — duyệt sẽ gỡ khỏi công khai.
            </p>
          ) : item.fields?.duplicateOfName ? (
            <>
              <p className="mt-2 text-sm font-semibold text-amber-700">
                ⚠ Nghi trùng với &quot;{item.fields.duplicateOfName}&quot;
              </p>
              <MergeDuplicatePanel mode="suggestion" suggestion={item} />
            </>
          ) : (
            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700">
              {Object.entries(item.fields ?? {}).map(([field, value]) => (
                <li key={field}>
                  {SUGGESTION_FIELD_LABEL[field] ?? field}:{" "}
                  <span className="font-medium">{String(value)}</span>
                </li>
              ))}
            </ul>
          )}
          {item.note && (
            <p className="mt-1 text-xs text-zinc-500">Ghi chú: {item.note}</p>
          )}
        </>
      )}

      {/* Báo trùng lặp KHÔNG được có đường tắt "Duyệt, áp dụng" — nút đó chỉ biết áp dụng
          field thường (địa chỉ/SĐT/giá...), không biết gộp/xoá chỗ. Bấm nhầm nút này cho loại
          báo cáo trùng lặp sẽ đánh dấu "đã duyệt" mà KHÔNG hề gộp gì — đúng lỗi thật gặp phải
          2026-08-18 và lặp lại 2026-08-21. Loại này bắt buộc đi qua MergeDuplicatePanel ở
          trên, có sẵn cả 2 lối ra ("Gộp" và "Không trùng — nhớ luôn, đừng hỏi lại"). */}
      {!item.fields?.duplicateOfName && (
        <form className="mt-3 flex gap-2">
          <input type="hidden" name="id" value={item.id} />
          <button
            formAction={approveSuggestion}
            className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white"
          >
            Duyệt, áp dụng
          </button>
          <button
            formAction={rejectSuggestion}
            className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700"
          >
            Từ chối
          </button>
        </form>
      )}
    </div>
  );
}

function AdminDashboard({ live, pending, reviewQueue, suggestions, notebookStats, noteQueue }) {
  const placeNameById = (id) => live.find((p) => p.id === id)?.name ?? "(chỗ không rõ, có thể đã bị xoá)";
  const pendingNotes = noteQueue.filter((n) => !n.reported);
  const reportedNotes = noteQueue.filter((n) => n.reported);
  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Trang duyệt dữ liệu</h1>
          <p className="text-sm text-zinc-500">Chạm Địa Phương — nội bộ</p>
        </div>
        <form action={logout}>
          <button className="text-sm text-zinc-500 underline">Đăng xuất</button>
        </form>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Sổ chia sẻ (Chặng 4) — đo lường, không hiện cho khách
        </h2>
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-zinc-200 bg-white p-4">
          <div>
            <p className="text-2xl font-bold text-zinc-900">{notebookStats.totalNotebooks}</p>
            <p className="text-xs text-zinc-500">Sổ đã tạo</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{notebookStats.totalViews}</p>
            <p className="text-xs text-zinc-500">Lượt mở</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900">{notebookStats.totalCopies}</p>
            <p className="text-xs text-zinc-500">Lượt được lưu lại</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Thêm địa điểm mới (vào hàng chờ duyệt)
        </h2>
        <form action={addPending} className="rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Field label="Tên" name="name" />
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Loại hình
              <select
                name="type"
                defaultValue={PLACE_TYPES[0].id}
                className="rounded-lg border border-zinc-300 px-2 py-1 text-sm text-zinc-900"
              >
                {PLACE_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Địa chỉ" name="address" />
            <Field label="Khu (VD: Khu 80 gian, Khu cổng lấp...)" name="localArea" />
            <Field label="Phường" name="ward" />
            <Field label="Giá thấp nhất" name="priceMin" type="number" />
            <Field label="Giá cao nhất" name="priceMax" type="number" />
            <Field label="Đơn vị (đêm, bát, ly...)" name="priceUnit" />
          </div>
          <button
            type="submit"
            className="mt-3 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
          >
            Thêm vào hàng chờ duyệt
          </button>
        </form>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Xử lý báo cáo quét dữ liệu (dán từ Routine)
        </h2>
        <p className="mb-3 text-sm text-zinc-500">
          Dán báo cáo từ claude.ai/code/routines vào đây — không cần mở chat với Claude Code,
          làm được ngay trên điện thoại. Vẫn tự lọc trùng/mâu thuẫn như khi xử lý qua chat.
        </p>
        <IngestPasteBox />
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Hàng chờ duyệt tự động — AI quét ({reviewQueue.length})
        </h2>
        {reviewQueue.length === 0 && (
          <p className="text-sm text-zinc-500">Chưa có gì từ đợt quét dữ liệu tự động.</p>
        )}
        <div className="flex flex-col gap-3">
          {reviewQueue.map((item) => (
            <ReviewItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Ghi chú chờ duyệt ({pendingNotes.length})
        </h2>
        {pendingNotes.length === 0 && (
          <p className="text-sm text-zinc-500">Chưa có ghi chú mới nào chờ duyệt.</p>
        )}
        <div className="flex flex-col gap-3">
          {pendingNotes.map((item) => (
            <NoteCard key={item.id} item={item} placeName={placeNameById(item.placeId)} />
          ))}
        </div>
      </section>

      {reportedNotes.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-bold text-zinc-900">
            Ghi chú bị báo sai ({reportedNotes.length})
          </h2>
          <div className="flex flex-col gap-3">
            {reportedNotes.map((item) => (
              <NoteCard key={item.id} item={item} placeName={placeNameById(item.placeId)} />
            ))}
          </div>
        </section>
      )}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Góp ý từ khách ({suggestions.length})
        </h2>
        {suggestions.length === 0 && (
          <p className="text-sm text-zinc-500">Chưa có góp ý nào từ khách.</p>
        )}
        <div className="flex flex-col gap-3">
          {suggestions.map((item) => (
            <SuggestionCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Chờ duyệt ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-sm text-zinc-500">Không có gì đang chờ duyệt.</p>
        )}
        <div className="flex flex-col gap-3">
          {pending.map((place) => (
            <PlaceForm key={place.id} place={place}>
              <button
                formAction={approvePending}
                className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-medium text-white"
              >
                Duyệt
              </button>
              <button
                formAction={rejectPending}
                className="rounded-full bg-red-100 px-4 py-1.5 text-sm font-medium text-red-700"
              >
                Từ chối
              </button>
            </PlaceForm>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-zinc-900">
          Đang công khai ({live.length})
        </h2>
        <LivePlacesManager live={live} />
      </section>
    </div>
  );
}

export default async function AdminPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthed = verifySessionToken(token);

  if (!isAuthed) {
    const params = await searchParams;
    return <LoginForm hasError={params?.error === "1"} />;
  }

  const [live, pending, allReviewItems, allSuggestions, notebookStats, noteQueue] = await Promise.all([
    getLivePlaces(),
    getPendingPlaces(),
    getReviewQueue(),
    getSuggestions(),
    getAdminNotebookStats(),
    getNoteQueue(),
  ]);
  const reviewQueue = allReviewItems.filter((i) => i.status === REVIEW_STATUS.PENDING);
  const suggestions = allSuggestions.filter((s) => s.status === "pending");
  return (
    <AdminDashboard
      live={live}
      pending={pending}
      reviewQueue={reviewQueue}
      suggestions={suggestions}
      notebookStats={notebookStats}
      noteQueue={noteQueue}
    />
  );
}
