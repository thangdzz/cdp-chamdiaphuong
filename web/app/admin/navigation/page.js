import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { getNavigationConfig, NAVIGATION_LIMITS } from "@/lib/navigation";
import { saveNavigation } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#c8553d] focus:ring-2 focus:ring-[#c8553d]/15";

export default async function NavigationAdminPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");

  const [navigation, params] = await Promise.all([getNavigationConfig(), searchParams]);
  const errorMessage =
    params?.error === "invalid"
      ? "Có nhãn hoặc tiêu đề không hợp lệ, hoặc thứ tự đang bị trùng. Cấu hình cũ chưa bị thay đổi."
      : params?.error === "save"
        ? "Chưa lưu được do lỗi kết nối dữ liệu. Cấu hình cũ vẫn được giữ nguyên."
        : null;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-zinc-500 underline">
            ← Trang duyệt dữ liệu
          </Link>
          <h1 className="mt-2 text-2xl font-medium text-zinc-900">Nội dung hệ thống · Menu &amp; tên trang</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Chỉnh chữ hiển thị và thứ tự. Key cùng đường dẫn được khóa trong code để không làm hỏng liên kết cũ.
          </p>
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-700"
        >
          Mở website ↗
        </Link>
      </header>

      {params?.saved === "1" && (
        <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Đã lưu. Menu desktop, menu mobile và tiêu đề trang đã dùng cấu hình mới.
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form action={saveNavigation} className="mt-6">
        <div className="grid gap-4">
          {navigation.map((item) => (
            <fieldset key={item.key} className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
              <legend className="px-1 text-base font-medium text-zinc-900">{item.navLabel}</legend>

              <div className="mb-4 grid gap-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500 sm:grid-cols-2">
                <p><span className="font-medium text-zinc-700">Key:</span> {item.key}</p>
                <p><span className="font-medium text-zinc-700">Đường dẫn:</span> {item.href}</p>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_110px_130px] lg:items-end">
                <label className="block text-sm font-medium text-zinc-700">
                  Tên trong menu
                  <input
                    name={`navLabel_${item.key}`}
                    defaultValue={item.navLabel}
                    maxLength={NAVIGATION_LIMITS.navLabel}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Tiêu đề trang
                  <input
                    name={`pageTitle_${item.key}`}
                    defaultValue={item.pageTitle}
                    maxLength={NAVIGATION_LIMITS.pageTitle}
                    required
                    className={inputClass}
                  />
                </label>
                <label className="block text-sm font-medium text-zinc-700">
                  Thứ tự
                  <select name={`order_${item.key}`} defaultValue={item.order} className={inputClass}>
                    {navigation.map((_, index) => (
                      <option key={index + 1} value={index + 1}>{index + 1}</option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm font-medium text-zinc-700">
                  <input
                    type="checkbox"
                    name={`enabled_${item.key}`}
                    defaultChecked={item.enabled}
                    className="h-4 w-4 accent-[#c8553d]"
                  />
                  Hiện trong menu
                </label>
              </div>
            </fieldset>
          ))}
        </div>

        <div className="sticky bottom-0 mt-6 border-t border-zinc-200 bg-zinc-50/95 py-4 backdrop-blur">
          <button
            type="submit"
            className="cdp-pressable min-h-11 rounded-lg bg-zinc-900 px-5 text-sm font-medium text-white"
          >
            Lưu menu &amp; tên trang
          </button>
        </div>
      </form>
    </main>
  );
}
