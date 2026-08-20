import { getLivePlaces } from "@/lib/redis";
import { SiteHeader } from "@/app/SiteHeader";
import { PersonalNotesList } from "@/app/PersonalNotesList";

export const dynamic = "force-dynamic";

// Trang "Ghi chú của tôi" (SPEC-chang-6.md §3.3) — nội dung ghi chú nằm hoàn toàn trong
// localStorage của khách, trang này chỉ đọc places:live để ghép tên chỗ hiển thị (giống cách
// PlaceExplorer.js nhận cả danh sách places rồi lọc phía trình duyệt).
export default async function PersonalNotesPage() {
  const places = await getLivePlaces();

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <SiteHeader />
        <h1 className="mb-1 text-xl font-medium tracking-tight text-zinc-900">Ghi chú của tôi</h1>
        <p className="mb-4 text-[13px] text-zinc-500">
          Chỉ mình bạn thấy — lưu trên máy này, đổi máy hoặc xoá dữ liệu duyệt web sẽ mất.
        </p>
        <PersonalNotesList places={places} />
      </main>
    </div>
  );
}
