import Image from "next/image";
import Link from "next/link";
import { HOME_TITLE_DEFAULT } from "@/lib/homeTitle";
import { getLivePlaces } from "@/lib/redis";
import { isPlaceExpired } from "@/lib/placeValidity";
import { BROWSABLE_PLACE_TYPES } from "@/lib/placeTypes";
import { EVENT_STATUS, eventStatus, groupEvents, formatEventWhen, readNow } from "@/lib/events";
import { FESTIVAL_EVENTS, POST_META } from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";
import { getPostEvents } from "@/lib/postEvents";
import { PageTitle } from "./AppShell";
import { HomeSearchForm, HomeCategoryLink } from "./HomeLinks";
import { LegacyHashRedirect } from "./LegacyHashRedirect";
import { HomeGameEntry } from "./_game/HomeGameEntry";

// Mùa game đang mời khách từ trang chủ (NOTE-08 §1). Mùa sau chỉ đổi slug. Hết mùa thì tự ẩn.
const HOME_GAME_SLUG = "san-den-thanh-tuyen-2026"; // phải khớp `slug` trong lib/game/seasons/*.js

// Trang chủ B, chế độ Cơ bản (DESIGN §7, SPEC-A4): khẩu hiệu → H1 → câu dẫn → ô tìm → 4 nhóm → thẻ người mới →
// nội dung theo mùa (chỉ khi còn hiệu lực). Khối “CDP giúp bạn” (3 hành động, 29/9) đã bỏ theo PM Q2 A4: ý
// Tìm → Lưu → Lộ trình chuyển vào thẻ “Bắt đầu Sổ đầu tiên”; “CDP là gì?” vẫn ở Menu.

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
  // nói khác nhau. Còn mốc sắp tới/đang diễn ra = mùa còn hiệu lực → hiện card. Hết mùa thì KHÔNG hiện gì
  // (DESIGN §7, A4); trang lưu trữ vẫn mở từ Menu “Lễ hội (lưu trữ)”. Test: tests/homeTitle.test.js.
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
        {/* Khẩu hiệu đứng trên H1 (DESIGN §7). H1 do Admin sửa, tối đa 60 ký tự khi lưu; bản lưu cũ dài hơn vẫn hiện
            đủ — xuống dòng, không cắt, không thu chữ. */}
        <p className="text-[0.9375rem] font-medium text-ink-2">Gom chỗ hay. Chia sẻ dễ dàng.</p>
        <PageTitle
          pageKey="explore"
          fallback={HOME_TITLE_DEFAULT}
          className="mt-1 text-[1.625rem] font-semibold leading-tight tracking-tight text-ink [overflow-wrap:anywhere] [text-wrap:balance] lg:text-[1.875rem]"
        />
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-2">
          Ăn · Chơi · Ngủ · Đi lại — tất cả trong một cuốn sổ địa phương.
        </p>

        <HomeSearchForm />

        <nav aria-label="Chọn nhóm" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {BROWSABLE_PLACE_TYPES.map((t) => (
            <HomeCategoryLink
              key={t.id}
              href={`/tim?loai=${t.id}`}
              type={t.id}
              label={t.label}
              count={countByType[t.id]}
            />
          ))}
        </nav>

        {festivalActive && (
          <section aria-label="Theo mùa" className="mt-8">
            <Link
              href="/le-hoi-thanh-tuyen"
              className="block overflow-hidden rounded-xl shadow-card"
            >
              <div className="relative h-40 w-full sm:h-52">
                <Image
                  src="/images/le-hoi-thanh-tuyen-2026.jpg"
                  alt={POST_META.title}
                  fill
                  sizes="(max-width: 1023px) 100vw, 672px"
                  className="object-cover"
                />
                {/* Lớp phủ phải đủ đậm tới giữa ảnh: chữ 2 dòng đè lên vùng sáng của mô hình đèn. */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-medium tracking-tight text-white">{POST_META.title}</p>
                  {/* Dòng dưới lấy thẳng mốc sắp tới từ dữ liệu nên không bao giờ lệch với trang trong. */}
                  <p className="text-sm text-white/90">
                    {`${nextFestivalPrefix}: ${nextFestivalEvent.title} · ${formatEventWhen(nextFestivalEvent)} →`}
                  </p>
                </div>
              </div>
            </Link>
          </section>
        )}
      </main>

      {/* NOTE-08 §1: cổng vào game là thẻ nổi bám mép phải. Hết mùa thì tự ẩn (pha `ended`). */}
      <HomeGameEntry slug={HOME_GAME_SLUG} now={now} />
    </div>
  );
}
