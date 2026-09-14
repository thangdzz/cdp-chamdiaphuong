import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/adminAuth";
import { ABOUT_PAGE_LIMITS, getAboutPageContent } from "@/lib/aboutPage";
import { saveAboutPage } from "./actions";

export const dynamic = "force-dynamic";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-[#c8553d] focus:ring-2 focus:ring-[#c8553d]/15";

function TextInput({ label, name, defaultValue, maxLength = ABOUT_PAGE_LIMITS.title }) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required
        className={inputClass}
      />
    </label>
  );
}

function TextArea({ label, name, defaultValue, maxLength = ABOUT_PAGE_LIMITS.body, rows = 4 }) {
  return (
    <label className="block text-sm font-medium text-zinc-700">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue}
        maxLength={maxLength}
        required
        rows={rows}
        className={`${inputClass} resize-y leading-6`}
      />
    </label>
  );
}

function EditorSection({ title, description, children }) {
  return (
    <fieldset className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
      <legend className="px-1 text-base font-medium text-zinc-900">{title}</legend>
      {description && <p className="mb-4 text-sm leading-6 text-zinc-500">{description}</p>}
      <div className="grid gap-4">{children}</div>
    </fieldset>
  );
}

export default async function AboutAdminPage({ searchParams }) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!verifySessionToken(token)) redirect("/admin");

  const [content, params] = await Promise.all([getAboutPageContent(), searchParams]);
  const errorMessage =
    params?.error === "invalid"
      ? "Có ô đang để trống hoặc nội dung dài quá giới hạn. Nội dung cũ chưa bị thay đổi."
      : params?.error === "save"
        ? "Chưa lưu được do lỗi kết nối dữ liệu. Nội dung cũ vẫn được giữ nguyên."
        : null;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/admin" className="text-sm text-zinc-500 underline">
            ← Trang duyệt dữ liệu
          </Link>
          <h1 className="mt-2 text-2xl font-medium text-zinc-900">Nội dung hệ thống · Giới thiệu CDP</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
            Chỉnh các phần cố định của trang Giới thiệu. Nội dung được lưu và hiển thị dưới
            dạng chữ thuần; không hỗ trợ HTML.
          </p>
        </div>
        <Link
          href="/gioi-thieu"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-center text-sm font-medium text-zinc-700"
        >
          Mở trang công khai ↗
        </Link>
      </header>

      {params?.saved === "1" && (
        <p role="status" className="mt-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">
          Đã lưu. Trang công khai đã dùng nội dung mới.
        </p>
      )}
      {errorMessage && (
        <p role="alert" className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form action={saveAboutPage} className="mt-6 grid gap-5">
        <EditorSection
          title="Hero"
          description={
            <>
              Phần mở đầu ở đầu trang. Tiêu đề chính được quản lý tại{" "}
              <Link href="/admin/navigation" className="underline">Menu &amp; tên trang</Link>
              {" "}để không có hai nơi cùng sửa một H1.
            </>
          }
        >
          {/* Giữ field cũ trong schema NOTE-09 làm fallback, nhưng không tạo ô sửa trùng với
              pageTitle của NOTE-10. Dữ liệu đã lưu trước đây vì vậy vẫn tương thích. */}
          <input type="hidden" name="heroTitle" value={content.hero.title} />
          <TextInput label="Nhãn nhỏ" name="heroLabel" defaultValue={content.hero.label} maxLength={ABOUT_PAGE_LIMITS.label} />
          <TextInput label="Slogan" name="heroSlogan" defaultValue={content.hero.slogan} maxLength={ABOUT_PAGE_LIMITS.short} />
          <TextInput label="Dòng mô tả ngắn" name="heroSubheadline" defaultValue={content.hero.subheadline} maxLength={ABOUT_PAGE_LIMITS.short} />
        </EditorSection>

        <div className="grid gap-5 lg:grid-cols-2">
          <EditorSection title="CDP là gì?">
            <TextInput label="Tiêu đề" name="whatTitle" defaultValue={content.what.title} />
            <TextArea label="Nội dung" name="whatBody" defaultValue={content.what.body} />
          </EditorSection>
          <EditorSection title="Vì sao CDP tồn tại?">
            <TextInput label="Tiêu đề" name="whyTitle" defaultValue={content.why.title} />
            <TextArea label="Nội dung" name="whyBody" defaultValue={content.why.body} />
          </EditorSection>
        </div>

        <EditorSection title="CDP hoạt động như thế nào?" description="P0 giữ cố định 3 bước; chưa có kéo thả hoặc đổi thứ tự.">
          <TextInput label="Tiêu đề phần" name="howTitle" defaultValue={content.how.title} />
          <div className="grid gap-4 lg:grid-cols-3">
            {content.how.steps.map((step, index) => (
              <div key={index} className="grid gap-3 rounded-xl bg-zinc-50 p-3">
                <TextInput label={`Bước ${index + 1} · Tiêu đề`} name={`step${index + 1}Title`} defaultValue={step.title} />
                <TextArea label="Nội dung" name={`step${index + 1}Body`} defaultValue={step.body} rows={5} />
              </div>
            ))}
          </div>
        </EditorSection>

        <EditorSection title="CDP không phải gì?">
          <TextInput label="Tiêu đề" name="notTitle" defaultValue={content.not.title} />
          <TextArea label="Nội dung" name="notBody" defaultValue={content.not.body} />
        </EditorSection>

        <EditorSection title="Dữ liệu CDP đến từ đâu?" description="P0 giữ cố định 5 dòng nguồn dữ liệu.">
          <TextInput label="Tiêu đề" name="sourcesTitle" defaultValue={content.sources.title} />
          <div className="grid gap-3 md:grid-cols-2">
            {content.sources.items.map((item, index) => (
              <TextArea
                key={index}
                label={`Nguồn ${index + 1}`}
                name={`source${index + 1}`}
                defaultValue={item}
                maxLength={ABOUT_PAGE_LIMITS.source}
                rows={3}
              />
            ))}
          </div>
        </EditorSection>

        <EditorSection title="Độ mới và độ trễ">
          <TextInput label="Tiêu đề" name="freshnessTitle" defaultValue={content.freshness.title} />
          <TextArea label="Nội dung chính" name="freshnessBody" defaultValue={content.freshness.body} />
          <TextArea label="Giải thích thêm" name="freshnessDetail" defaultValue={content.freshness.detail} />
        </EditorSection>

        <EditorSection title="Sổ, Lộ trình và danh bạ">
          <TextInput label="Tiêu đề" name="ownershipTitle" defaultValue={content.ownership.title} />
          <TextArea label="Câu chốt" name="ownershipHighlight" defaultValue={content.ownership.highlight} maxLength={ABOUT_PAGE_LIMITS.short} rows={2} />
          <TextArea label="Nội dung" name="ownershipBody" defaultValue={content.ownership.body} />
        </EditorSection>

        <EditorSection title="CTA cuối trang" description="Đích đến được khóa an toàn: Sổ của tôi và danh sách địa điểm.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput label="Nút chính" name="primaryCtaLabel" defaultValue={content.ctas.primaryLabel} maxLength={ABOUT_PAGE_LIMITS.label} />
            <TextInput label="Nút phụ" name="secondaryCtaLabel" defaultValue={content.ctas.secondaryLabel} maxLength={ABOUT_PAGE_LIMITS.label} />
          </div>
        </EditorSection>

        <div className="sticky bottom-3 z-10 flex justify-end rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <button
            type="submit"
            className="rounded-lg bg-[#c8553d] px-5 py-2.5 text-sm font-medium text-white"
          >
            Lưu trang Giới thiệu
          </button>
        </div>
      </form>
    </main>
  );
}
