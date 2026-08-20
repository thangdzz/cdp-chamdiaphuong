import { notFound } from "next/navigation";
import { getNotebook, resolveNotebookItems } from "@/lib/notebooks";
import { getAllPublishedNotes, filterVisibleNotes } from "@/lib/notes";
import { NotebookViewTracker } from "@/app/NotebookViewTracker";
import { NotebookOwnerActions } from "@/app/NotebookOwnerActions";
import { NotebookPlaceCard } from "@/app/NotebookPlaceCard";
import { SiteHeader } from "@/app/SiteHeader";

export const dynamic = "force-dynamic";

const SITE_NAME = "Chạm Địa Phương";
const FALLBACK_OG_IMAGE = "/images/le-hoi-thanh-tuyen-2026.jpg";

function ogDescription(itemCount) {
  return `${itemCount} chỗ · Cuốn sổ ăn/chơi/ngủ/đi lại Tuyên Quang — ${SITE_NAME}`;
}

// Bắt buộc trang này chạy được không cần đăng nhập, không cần localStorage — người nhận link
// lần đầu chưa có gì trong máy (SPEC-chang-4.md §3.2).
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const notebook = await getNotebook(slug);
  if (!notebook) return { title: `Không tìm thấy sổ — ${SITE_NAME}` };

  const items = await resolveNotebookItems(notebook.items);
  const firstPhoto = items.find((it) => it.place?.photos?.length)?.place.photos[0];
  const description = ogDescription(notebook.items.length);

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

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <NotebookViewTracker slug={slug} />
        <SiteHeader />

        <header className="mb-6">
          <h1 className="text-xl font-medium tracking-tight text-zinc-900">{notebook.title}</h1>
          <p className="mt-1 text-[13px] text-zinc-500">
            {itemsWithNotes.length} chỗ · cập nhật {formatRelativeDays(notebook.updatedAt)}
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
