import Image from "next/image";
import Link from "next/link";
import { getLivePlaces } from "@/lib/redis";
import { isPlaceExpired } from "@/lib/placeValidity";
import { BROWSABLE_PLACE_TYPES } from "@/lib/placeTypes";
import { EVENT_STATUS, eventStatus, groupEvents, formatEventWhen, readNow } from "@/lib/events";
import { FESTIVAL_EVENTS } from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";
import { POST_META } from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";
import { getPostEvents } from "@/lib/postEvents";
import { PageTitle } from "./AppShell";
import { HomeSearchForm, HomeCategoryLink } from "./HomeLinks";
import { LegacyHashRedirect } from "./LegacyHashRedirect";
import { HomeGameEntry } from "./_game/HomeGameEntry";

// Mùa game đang mời khách từ trang chủ (NOTE-08 §1). Mùa sau chỉ đổi slug. Hết mùa thì tự ẩn.
const HOME_GAME_SLUG = "san-den-thanh-tuyen-2026"; // phải khớp `slug` trong lib/game/seasons/*.js

// vNext (SCOPE-vNext "Home"): trang chủ nói CDP dùng để làm gì và dẫn vào đúng nhu cầu — ô tìm,
// 4 nhóm, 3 hành động — thay vì bày cả danh bạ 280+ chỗ. Danh sách nằm ở trang kết quả /tim.
const MAIN_ACTIONS = [
  {
    href: "/tim",
    title: "Tìm chỗ",
    text: "Ăn, chơi, ngủ, đi lại — kèm lần gần nhất có người xác nhận còn mở.",
  },
  {
    href: "/so",
    title: "Lưu vào Sổ",
    text: "Gom chỗ hay thành một Sổ để tự dùng hoặc gửi một link cho người khác.",
  },
  {
    href: "/lo-trinh",
    title: "Lên Lộ trình",
    text: "Xếp các chỗ theo thứ tự đi, mở chỉ đường từng chặng trên Google Maps.",
  },
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [livePlaces, festivalEvents, now] = await Promise.all([
    getLivePlaces(),
    getPostEvents(POST_META.slug, FESTIVAL_EVENTS),
    readNow(),
  ]);
  // Chỉ đếm số chỗ mỗi nhóm cho 4 ô — không đọc câu trả lời, mẹo, xác nhận như trang chủ cũ
  // (những thứ đó giờ nằm ở /tim và trang chi tiết). Chỗ tạm đã hết ngày không tính (NOTE-15 §13).
  const current = livePlaces.filter((p) => !isPlaceExpired(p, now));
  const countByType = Object.fromEntries(
    BROWSABLE_PLACE_TYPES.map((t) => [t.id, current.filter((p) => p.type === t.id).length])
  );

  // Card lễ hội lấy mốc sắp tới từ ĐÚNG nguồn dữ liệu của trang lễ hội — hai nơi không bao giờ
  // nói khác nhau. Còn mốc sắp tới/đang diễn ra = mùa đang "active" → giữ banner lớn; hết rồi thì
  // thu về một thẻ nhỏ (Product Owner duyệt 29/9: nội dung theo mùa không chiếm vai trò lõi).
  const { next: nextFestivalEvent } = groupEvents(festivalEvents, now);
  const nextFestivalStatus = nextFestivalEvent ? eventStatus(nextFestivalEvent, now) : null;
  const nextFestivalPrefix = nextFestivalStatus === EVENT_STATUS.LIVE
    ? "Đang diễn ra"
    : nextFestivalStatus === EVENT_STATUS.TODAY
      ? "Hôm nay"
      : "Sắp tới";
  const festivalActive = Boolean(nextFestivalEvent);

  return (
    <div className="flex flex-1 justify-center">
      <LegacyHashRedirect />
      <main className="w-full max-w-2xl px-4 py-6 sm:px-6 lg:py-8">
        {/* Đầu trang nói bằng nhu cầu thật thay vì mô tả sản phẩm (NOTE-01 §2) — câu chữ do
            anh chốt 2026-09-08, giữ nguyên. */}
        <PageTitle
          pageKey="explore"
          fallback="Khám phá Tuyên Quang"
          className="text-2xl font-semibold tracking-tight text-zinc-900 lg:text-3xl"
        />
        <p className="mt-2 text-base font-medium text-zinc-700">Gom chỗ hay. Chia sẻ dễ dàng.</p>
        <p className="mt-1 text-sm leading-relaxed text-zinc-500">
          Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.
        </p>

        <HomeSearchForm />

        <nav aria-label="Chọn nhóm" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BROWSABLE_PLACE_TYPES.map((t) => (
            <HomeCategoryLink
              key={t.id}
              href={`/tim?loai=${t.id}`}
              label={t.label}
              count={countByType[t.id]}
            />
          ))}
        </nav>

        <section aria-labelledby="home-actions-title" className="mt-8">
          <h2 id="home-actions-title" className="text-[13px] text-zinc-500">
            CDP giúp bạn
          </h2>
          <ol className="mt-3 flex flex-col gap-3">
            {MAIN_ACTIONS.map((action, i) => (
              <li key={action.href}>
                <Link
                  href={action.href}
                  className="cdp-pressable flex items-start gap-3 rounded-xl bg-white px-[18px] py-4 shadow-sm"
                >
                  <span className="mt-0.5 text-sm font-medium text-[#c8553d]">{i + 1}</span>
                  <span>
                    <span className="block text-base font-medium text-zinc-900">{action.title}</span>
                    <span className="mt-0.5 block text-sm text-zinc-500">{action.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <Link
            href="/gioi-thieu#cach-hoat-dong"
            className="mt-3 inline-block text-sm font-medium text-[#c8553d] underline decoration-[#c8553d]/30 underline-offset-2"
          >
            CDP hoạt động thế nào →
          </Link>
        </section>

        <section aria-label="Theo mùa" className="mt-8">
          {festivalActive ? (
            <Link
              href="/le-hoi-thanh-tuyen"
              className="mb-6 block overflow-hidden rounded-xl shadow-sm"
            >
              <div className="relative h-40 w-full sm:h-52">
                <Image
                  src="/images/le-hoi-thanh-tuyen-2026.jpg"
                  alt="Lễ hội Thành Tuyên 2026"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 672px"
                  className="object-cover"
                />
                {/* Lớp phủ phải đủ đậm tới giữa ảnh: chữ giờ 2 dòng (NOTE-01 §4.2 đổi sang câu
                    theo nhu cầu thật), dòng dưới từng đè lên vùng sáng của mô hình đèn nên khó đọc. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-medium tracking-tight text-white">
                    Lễ hội Thành Tuyên 2026
                  </p>
                  {/* §P2: card phải nói đúng thứ nằm bên trong. Câu cũ hứa "chỗ gửi xe, ăn tối,
                      cafe nghỉ chân và chỗ ngủ" trong khi trang bên trong là LỊCH lễ hội.
                      Dòng dưới lấy thẳng mốc sắp tới từ dữ liệu nên không bao giờ lệch với trang
                      trong, và tự hết hạn — không phải nhớ đi sửa câu quảng cáo sau lễ hội. */}
                  <p className="text-sm text-white/90">
                    {nextFestivalEvent
                      ? `${nextFestivalPrefix}: ${nextFestivalEvent.title} · ${formatEventWhen(nextFestivalEvent)} →`
                      : "Lịch thi đèn các phường, Đêm hội 20/9 và các hoạt động quanh lễ hội →"}
                  </p>
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/le-hoi-thanh-tuyen"
              className="cdp-pressable flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm"
            >
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src="/images/le-hoi-thanh-tuyen-2026.jpg"
                  alt=""
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] text-zinc-500">Theo mùa · đã diễn ra</span>
                <span className="block text-sm font-medium text-zinc-900">{POST_META.title}</span>
                <span className="block text-[13px] text-zinc-500">{POST_META.subtitle} · xem lại lịch →</span>
              </span>
            </Link>
          )}
        </section>
      </main>

      {/* NOTE-08 §1: cổng vào game là thẻ nổi bám mép phải. Hết mùa thì tự ẩn (pha `ended`). */}
      <HomeGameEntry slug={HOME_GAME_SLUG} now={now} />
    </div>
  );
}
