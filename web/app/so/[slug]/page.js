import { notFound } from "next/navigation";
import { getNotebook, resolveNotebookItems } from "@/lib/notebooks";
import { getAllPublishedNotes, filterVisibleNotes } from "@/lib/notes";
import { NotebookViewTracker } from "@/app/NotebookViewTracker";
import { NotebookOwnerActions } from "@/app/NotebookOwnerActions";
import { NotebookPlaceCard } from "@/app/NotebookPlaceCard";
import { SiteHeader } from "@/app/SiteHeader";
import { PLACE_TYPES } from "@/lib/placeTypes";

export const dynamic = "force-dynamic";

const SITE_NAME = "Chạm Địa Phương";
const FALLBACK_OG_IMAGE = "/images/le-hoi-thanh-tuyen-2026.jpg";

// NOTE-03 §5: preview phải cho người nhận hiểu đây là một tập hợp CÓ CHỦ ĐÍCH ("5 địa điểm ·
// Cafe"), không phải mô tả chung chung về sản phẩm. Nhóm chính = loại xuất hiện nhiều nhất
// trong sổ; sổ trộn nhiều loại thì bỏ hẳn phần loại thay vì liệt kê dài.
function dominantTypeLabel(items) {
  const counts = {};
  for (const it of items) {
    const type = it.place?.type;
    if (type) counts[type] = (counts[type] ?? 0) + 1;
  }
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!top) return null;
  const [type, count] = top;
  if (count / items.length < 0.5) return null; // trộn quá nhiều loại -> không gán nhãn
  return PLACE_TYPES.find((t) => t.id === type)?.label ?? null;
}

function notebookSummary(items) {
  return [`${items.length} địa điểm`, dominantTypeLabel(items)].filter(Boolean).join(" · ");
}

function ogDescription(items) {
  return `${notebookSummary(items)} · ${SITE_NAME}`;
}

// Bắt buộc trang này chạy được không cần đăng nhập, không cần localStorage — người nhận link
// lần đầu chưa có gì trong máy (SPEC-chang-4.md §3.2).
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const notebook = await getNotebook(slug);
  if (!notebook) return { title: `Không tìm thấy sổ — ${SITE_NAME}` };

  const items = await resolveNotebookItems(notebook.items);
  const firstPhoto = items.find((it) => it.place?.photos?.length)?.place.photos[0];
  const description = ogDescription(items);

  return {
    title: `${notebook.title} — ${SITE_NAME}`,
    description,
    openGraph: {
      title: notebook.title,
      description,
      images: [firstPhoto ?? FALLBACK_OG_IMAGE],
    },
  };
}

function formatRelativeDays(iso) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "hôm nay";
  if (days === 1) return "hôm qua";
  if (days < 7) return `${days} ngày trước`;
  if (days < 30) return `${Math.floor(days / 7)} tuần trước`;
  return "hơn 1 tháng trước";
}

export default async function NotebookViewPage({ params }) {
  const { slug } = await params;
  const notebook = await getNotebook(slug);
  if (!notebook) notFound();

  const [items, allNotes] = await Promise.all([
    resolveNotebookItems(notebook.items),
    getAllPublishedNotes(),
  ]);
  const itemsWithNotes = items.map((item) =>
    item.deleted ? item : { ...item, place: { ...item.place, notes: filterVisibleNotes(allNotes[item.placeId] ?? []) } }
  );

  const collagePhotos = itemsWithNotes
    .map((it) => it.place?.photos?.[0])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <NotebookViewTracker slug={slug} />
        <SiteHeader />

        {/* NOTE-03 §6 + §13: cover dạng collage 3 ảnh đầu (chưa có trường cover riêng — đó là
            P1), rồi mới tới tên sổ và metadata "N địa điểm · Nhóm chính". */}
        {collagePhotos.length > 0 && (
          <div className="mb-3 flex gap-1 overflow-hidden rounded-xl">
            {collagePhotos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={src}
                alt=""
                className={`h-32 object-cover ${collagePhotos.length === 1 ? "w-full" : "flex-1"}`}
              />
            ))}
          </div>
        )}

        <header className="mb-6">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">{notebook.title}</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {notebookSummary(itemsWithNotes)} · cập nhật {formatRelativeDays(notebook.updatedAt)}
          </p>
        </header>

        {itemsWithNotes.length === 0 ? (
          <p className="text-sm text-zinc-500">Sổ này chưa có chỗ nào.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {itemsWithNotes.map((item) =>
              item.deleted ? (
                <li
                  key={item.placeId}
                  className="rounded-xl bg-white px-[18px] py-5 opacity-60 shadow-sm"
                >
                  <p className="text-lg font-medium tracking-tight text-zinc-500">
                    {item.nameSnapshot ?? "Chỗ đã bị xoá"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">Chỗ này không còn trong danh bạ</p>
                  {item.note && <p className="mt-2 text-sm text-zinc-500">💬 {item.note}</p>}
                </li>
              ) : (
                <NotebookPlaceCard key={item.placeId} item={item} />
              )
            )}
          </ul>
        )}

        <NotebookOwnerActions slug={slug} itemCount={items.length} />
      </main>
    </div>
  );
}
