import Link from "next/link";

// Thanh đi ngang giữa các trang quản trị — MỘT nguồn duy nhất cho danh sách trang admin.
//
// Vì sao cần: trước đây chỉ `/admin` có link đi các trang con, còn các trang con chỉ có "← Về
// trang quản trị". Từ /admin/vi-tri muốn sang /admin/game phải quay về giữa rồi tìm lại link
// trong 5 cái thẻ to xếp dọc. Thêm trang admin mới cũng phải nhớ sửa link ở mấy chỗ.
//
// Chưa đổi đường dẫn nào (`navigation` sửa menu TRANG KHÁCH chứ không phải menu admin — dễ hiểu
// nhầm, nên nhãn ở đây gọi thẳng là "Menu trang khách"). Đổi đường dẫn để lại đợt sau: link cũ
// chủ dự án đã lưu sẽ hỏng, phải làm chuyển hướng như lần sửa đường dẫn game.
export const ADMIN_PAGES = [
  { href: "/admin", label: "Duyệt dữ liệu" },
  { href: "/admin/vi-tri", label: "Vị trí" },
  { href: "/admin/content-inbox", label: "Content Inbox" },
  { href: "/admin/game", label: "Game" },
  { href: "/admin/gioi-thieu", label: "Giới thiệu CDP" },
  { href: "/admin/navigation", label: "Menu trang khách" },
];

/** @param current đường dẫn trang đang mở, để không tự link về chính nó. */
export function AdminNav({ current }) {
  return (
    <nav aria-label="Trang quản trị" className="mb-5 flex flex-wrap gap-1.5">
      {ADMIN_PAGES.map((page) => {
        const here = page.href === current;
        return here ? (
          <span
            key={page.href}
            aria-current="page"
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-[13px] font-medium text-white"
          >
            {page.label}
          </span>
        ) : (
          <Link
            key={page.href}
            href={page.href}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[13px] text-zinc-600"
          >
            {page.label}
          </Link>
        );
      })}
    </nav>
  );
}
