import Link from "next/link";
import { PageTitle } from "@/app/AppShell";
import { getAboutPageContent } from "@/lib/aboutPage";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chạm Địa Phương là gì? | CDP",
  description:
    "Chạm Địa Phương giúp bạn gom địa điểm ăn, chơi, ngủ, đi lại thành Sổ hoặc Lộ trình để lưu và chia sẻ dễ dàng.",
};

function Copy({ children, className = "" }) {
  return (
    <p className={`whitespace-pre-line text-sm leading-6 text-zinc-700 ${className}`}>
      {children}
    </p>
  );
}

function SectionCard({ id, title, children, className = "" }) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm lg:p-6 ${className}`}
    >
      <h2 className="text-lg font-medium text-zinc-900">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

export default async function AboutPage() {
  const content = await getAboutPageContent();

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mt-2 border-b border-[#c8553d]/25 pb-7 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-end lg:gap-12 lg:pb-10">
          <div>
            <p className="inline-flex rounded-full bg-[#c8553d]/10 px-3 py-1 text-sm font-medium text-[#a83f2b]">{content.hero.label}</p>
            <PageTitle
              pageKey="about"
              fallback={content.hero.title}
              className="mt-3 max-w-xl text-2xl font-medium tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl"
            />
          </div>
          <div className="mt-4 lg:mt-0">
            <p className="text-lg font-medium text-zinc-900 sm:text-xl">{content.hero.slogan}</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-500">
              {content.hero.subheadline}
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:mt-8 lg:gap-6">
          <SectionCard id="cdp-la-gi" title={content.what.title}>
            <Copy>{content.what.body}</Copy>
          </SectionCard>
          <SectionCard id="vi-sao" title={content.why.title}>
            <Copy>{content.why.body}</Copy>
          </SectionCard>
        </div>

        <section id="cach-hoat-dong" className="scroll-mt-20 pt-8 lg:pt-10">
          <h2 className="text-lg font-medium text-zinc-900 sm:text-xl">{content.how.title}</h2>
          <ol className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3 lg:gap-4">
            {content.how.steps.map((step, index) => (
              <li key={index} className="rounded-2xl border-t-2 border-[#c8553d]/55 bg-white p-5 shadow-sm lg:p-6">
                <p className="text-sm font-medium text-zinc-900">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#c8553d]/10 text-xs text-[#a83f2b]">{index + 1}</span>
                  {step.title}
                </p>
                <Copy className="mt-1 text-zinc-600">{step.body}</Copy>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:mt-10 lg:gap-6">
          <SectionCard id="khong-phai" title={content.not.title}>
            <Copy>{content.not.body}</Copy>
          </SectionCard>
          <SectionCard id="so-lo-trinh" title={content.ownership.title}>
            <Copy className="font-medium text-zinc-900">{content.ownership.highlight}</Copy>
            <Copy className="mt-2">{content.ownership.body}</Copy>
          </SectionCard>
        </div>

        <section id="du-lieu" className="scroll-mt-20 pt-8 lg:pt-10">
          <h2 className="text-lg font-medium text-zinc-900 sm:text-xl">{content.sources.title}</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2 lg:gap-6">
            <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm lg:p-6">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-700">
                {content.sources.items.map((source, index) => (
                  <li key={index} className="whitespace-pre-line">{source}</li>
                ))}
              </ul>
            </div>

            <div id="do-moi" className="scroll-mt-20 rounded-2xl bg-white p-5 shadow-sm lg:p-6">
              <h3 className="text-base font-medium text-zinc-900">{content.freshness.title}</h3>
              <Copy className="mt-2">{content.freshness.body}</Copy>
              <Copy className="mt-3 text-zinc-600">{content.freshness.detail}</Copy>
            </div>
          </div>
        </section>

        <div className="mt-8 mb-4 flex flex-col gap-2 border-t border-zinc-200 pt-6 sm:flex-row sm:justify-end lg:mt-10">
          <Link
            href="/so"
            className="cdp-pressable rounded-lg bg-[#c8553d] px-4 py-2.5 text-center text-sm font-medium text-white"
          >
            {content.ctas.primaryLabel}
          </Link>
          <Link
            href="/#dia-diem"
            className="cdp-pressable rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-center text-sm font-medium text-zinc-700"
          >
            {content.ctas.secondaryLabel}
          </Link>
        </div>
      </main>
    </div>
  );
}
