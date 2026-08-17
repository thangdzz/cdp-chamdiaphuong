import { notFound } from "next/navigation";
import { getNotebook, resolveNotebookItems } from "@/lib/notebooks";
import { getPlaceTypeLabel } from "@/lib/placeTypes";
import { mapsUrl } from "@/lib/mapsUrl";
import { NotebookViewTracker } from "@/app/NotebookViewTracker";
import { NotebookOwnerActions } from "@/app/NotebookOwnerActions";

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

  const items = await resolveNotebookItems(notebook.items);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <NotebookViewTracker slug={slug} />

        <header className="mb-6">
          <h1 className="text-xl font-bold text-zinc-900">{notebook.title}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {items.length} chỗ · cập nhật {formatRelativeDays(notebook.updatedAt)}
          </p>
        </header>

        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">Sổ này chưa có chỗ nào.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) =>
              item.deleted ? (
                <li
                  key={item.placeId}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 opacity-60 shadow-sm"
                >
                  <p className="text-base font-semibold text-zinc-500">
                    {item.nameSnapshot ?? "Chỗ đã bị xoá"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">Chỗ này không còn trong danh bạ</p>
                  {item.note && <p className="mt-2 text-sm text-zinc-500">💬 {item.note}</p>}
                </li>
              ) : (
                <li
                  key={item.placeId}
                  className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">{item.place.name}</h3>
                    <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {getPlaceTypeLabel(item.place.type)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600">
                    {item.place.priceText ?? "Chưa cập nhật giá"}
                    {item.place.ward ? ` · ${item.place.ward}` : ""}
                  </p>
                  {item.note && <p className="mt-2 text-sm text-zinc-700">💬 {item.note}</p>}
                  <a
                    href={mapsUrl(item.place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white active:bg-zinc-700"
                  >
                    Chỉ đường
                  </a>
                </li>
              )
            )}
          </ul>
        )}

        <NotebookOwnerActions slug={slug} />
      </main>
    </div>
  );
}
