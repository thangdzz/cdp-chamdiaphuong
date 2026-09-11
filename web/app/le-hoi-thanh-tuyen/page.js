import Image from "next/image";
import Link from "next/link";
import {
  EVENT_STATUS,
  eventStatus,
  groupEvents,
  formatEventWhen,
  formatCountdown,
  readNow,
} from "@/lib/events";
import { FESTIVAL_EVENTS, POST_META, PLAN_TEMPLATE } from "@/lib/postEvents/le-hoi-thanh-tuyen-2026";
import { InteractivePlan } from "@/app/InteractivePlan";
import { EventCard } from "./EventCard";

// Trạng thái mốc lịch tính lúc MỞ TRANG, không phải lúc build (CDP_P1-P8 §"Dynamic Timeline":
// "không cần deploy code mỗi khi thời gian chuyển trạng thái"). Trang này trước đây là trang
// tĩnh — để nguyên thì "Đang diễn ra" đóng băng ở thời điểm deploy gần nhất.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lễ hội Thành Tuyên 2026 — Chạm Địa Phương",
  description:
    "Lịch Lễ hội Thành Tuyên 2026: thi đèn các phường, Đêm hội 20/9 và các hoạt động quanh lễ hội.",
};

export default async function LeHoiThanhTuyenPage() {
  const now = await readNow();
  const { live, upcoming, past, undated, next } = groupEvents(FESTIVAL_EVENTS, now);
  const countdown = formatCountdown(next, now);

  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <Link href="/" className="text-sm text-zinc-500">
          ← Về trang chủ
        </Link>

        <div className="relative mt-3 h-48 w-full overflow-hidden rounded-xl sm:h-64">
          <Image
            src={POST_META.cover}
            alt={POST_META.title}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
          />
        </div>

        <h1 className="mt-4 text-2xl font-bold text-zinc-900">{POST_META.title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{POST_META.subtitle}</p>

        {/* §"Phần 2 — Sắp diễn ra gần nhất": mở trang ra là thấy ngay cái sắp tới, không phải
            tự dò trong danh sách xem hôm nay đến lượt gì. */}
        {next && (
          <section className="mt-4 rounded-xl border border-zinc-300 bg-white p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Sắp diễn ra{countdown ? ` · ${countdown}` : ""}
            </p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">{formatEventWhen(next)}</p>
            <p className="mt-0.5 text-sm text-zinc-800">{next.title}</p>
            {next.location && <p className="mt-0.5 text-xs text-zinc-500">{next.location}</p>}
          </section>
        )}

        <section className="mt-5">
          <h2 className="text-lg font-bold text-zinc-900">Lễ hội Thành Tuyên là gì?</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            Lễ hội Thành Tuyên là lễ hội Trung Thu đặc trưng của Tuyên Quang, nổi tiếng với những
            mô hình đèn Trung thu khổng lồ do chính người dân các phường tự thiết kế, diễu diễu
            khắp phố. Năm 2026, lễ hội tổ chức ở quy mô cấp tỉnh.
          </p>
        </section>

        <section className="mt-5">
          <h2 className="text-lg font-bold text-zinc-900">Lịch hoạt động</h2>

          {/* Mốc đã qua GOM LẠI, mở ra xem được — bày hết ra thì phần đang tới bị đẩy xuống
              dưới, mà đó mới là thứ khách cần (§"Dynamic Timeline"). <details> là thẻ sẵn của
              trình duyệt: không cần JavaScript, bấm là mở. */}
          {past.length > 0 && (
            <details className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
              <summary className="cursor-pointer text-sm text-zinc-500">
                ✓ {past.length} hoạt động đã diễn ra — xem lại
              </summary>
              <ul className="mt-3 flex flex-col gap-2">
                {past.map((event) => (
                  <EventCard key={event.id} event={event} status={EVENT_STATUS.PAST} />
                ))}
              </ul>
            </details>
          )}

          {(live.length > 0 || upcoming.length > 0) && (
            <ul className="mt-3 flex flex-col gap-2">
              {[...live, ...upcoming].map((event) => (
                <EventCard key={event.id} event={event} status={eventStatus(event, now)} />
              ))}
            </ul>
          )}

          {undated.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-semibold text-zinc-800">Chưa có ngày cụ thể</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {undated.map((event) => (
                  <EventCard key={event.id} event={event} status={EVENT_STATUS.UNDATED} />
                ))}
              </ul>
            </>
          )}

          {live.length === 0 && upcoming.length === 0 && undated.length === 0 && (
            <p className="mt-3 text-sm text-zinc-500">
              Lễ hội năm nay đã kết thúc. Hẹn gặp lại mùa sau.
            </p>
          )}
        </section>

        {/* §P3: ngay sau lịch là chỗ khách bắt tay xếp buổi tối của mình — đọc xong không
            dừng ở "đọc rồi thoát". */}
        <InteractivePlan template={PLAN_TEMPLATE} />

        <section className="mt-5">
          <h2 className="text-lg font-bold text-zinc-900">Địa điểm chính</h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-zinc-700">
            <li>Quảng trường Nguyễn Tất Thành, phường Minh Xuân</li>
            <li>Quảng trường 26/3, phường Hà Giang 1</li>
            <li>Đường Chiến thắng Sông Lô, phường Minh Xuân (khu ẩm thực, hội chợ)</li>
            <li>Tuyến phố đi bộ, phường Minh Xuân (văn nghệ, trò chơi dân gian)</li>
          </ul>
        </section>

        <section className="mt-5 mb-8">
          <h2 className="text-lg font-bold text-zinc-900">Lưu ý cho khách</h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-zinc-700">
            <li>
              Muốn xem mô hình đèn diễu diễu vào ngày thường (không phải cuối tuần), chỉ có thể
              xem trong khoảng 21/8 – 4/9; sau đó chỉ diễu diễu tối thứ Sáu/thứ Bảy.
            </li>
            <li>
              Đêm hội chính 20/9 và rằm 25/9 là hai đêm đông khách nhất — nên đặt chỗ ngủ sớm.
            </li>
            <li>
              Có dịch vụ cho khách trải nghiệm ngồi trên xe mô hình đèn tham quan (do các
              phường/hộ tự tổ chức, không phải dịch vụ của Chạm Địa Phương).
            </li>
          </ul>

          <p className="mt-4 text-xs text-zinc-400">
            Nguồn: Kế hoạch số 246/KH-UBND, UBND tỉnh Tuyên Quang, 27/6/2026; Kế hoạch UBND
            phường Minh Xuân, tháng 7/2026.
          </p>
        </section>
      </main>
    </div>
  );
}
