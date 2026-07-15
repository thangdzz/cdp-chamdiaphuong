import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Lễ hội Thành Tuyên 2026 — Chạm Địa Phương",
  description:
    "Thời gian, địa điểm và các hoạt động chính của Lễ hội Thành Tuyên 2026 tại Tuyên Quang.",
};

function InfoRow({ date, title, place }) {
  return (
    <li className="rounded-xl border border-zinc-200 bg-white p-3">
      <p className="text-sm font-semibold text-zinc-900">{date}</p>
      <p className="mt-0.5 text-sm text-zinc-700">{title}</p>
      {place && <p className="mt-0.5 text-xs text-zinc-500">{place}</p>}
    </li>
  );
}

export default function LeHoiThanhTuyenPage() {
  return (
    <div className="flex flex-1 justify-center">
      <main className="w-full max-w-xl px-4 py-6 sm:px-6">
        <Link href="/" className="text-sm text-zinc-500">
          ← Về trang chủ
        </Link>

        <div className="relative mt-3 h-48 w-full overflow-hidden rounded-2xl sm:h-64">
          <Image
            src="/images/le-hoi-thanh-tuyen-2026.jpg"
            alt="Lễ hội Thành Tuyên 2026"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
          />
        </div>

        <h1 className="mt-4 text-2xl font-bold text-zinc-900">
          Lễ hội Thành Tuyên 2026
        </h1>
        <p className="mt-1 text-sm text-zinc-500">19 – 25/9/2026 · TP Tuyên Quang</p>

        <section className="mt-5">
          <h2 className="text-lg font-bold text-zinc-900">
            Lễ hội Thành Tuyên là gì?
          </h2>
          <p className="mt-2 text-sm leading-6 text-zinc-700">
            Lễ hội Thành Tuyên là lễ hội Trung Thu đặc trưng của Tuyên Quang,
            nổi tiếng với những mô hình đèn Trung thu khổng lồ do chính người
            dân các phường tự thiết kế, diễu diễu khắp phố. Năm 2026, lễ hội
            tổ chức ở quy mô cấp tỉnh.
          </p>
        </section>

        <section className="mt-5">
          <h2 className="text-lg font-bold text-zinc-900">Thời gian</h2>

          <h3 className="mt-3 text-sm font-semibold text-zinc-800">
            Trước lễ hội — diễu diễu mô hình đèn
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            <InfoRow
              date="21/8 – 4/9/2026"
              title="Diễu diễu hằng ngày, 19h30 – 22h"
            />
            <InfoRow
              date="5/9 – 27/9/2026"
              title="Chỉ diễu diễu tối thứ Sáu và thứ Bảy hằng tuần"
            />
          </ul>

          <h3 className="mt-4 text-sm font-semibold text-zinc-800">
            Tuần lễ hội chính: 19 – 25/9/2026
          </h3>
          <ul className="mt-2 flex flex-col gap-2">
            <InfoRow
              date="19/9 (thứ Bảy)"
              title="Đêm hội trăng rằm, thắp sáng ước mơ thiếu nhi Tuyên Quang"
              place="Quảng trường 26/3, phường Hà Giang 1"
            />
            <InfoRow
              date="20/9 (chủ nhật)"
              title={
                'Đêm hội Thành Tuyên — sự kiện lớn nhất, khai mạc 20h00, chủ đề "Lung linh đêm hội trăng rằm", 40 mô hình đèn tiêu biểu diễn diễu, truyền hình trực tiếp'
              }
              place="Quảng trường Nguyễn Tất Thành, phường Minh Xuân"
            />
            <InfoRow
              date="19 – 25/9"
              title="Không gian ẩm thực & Lễ hội Bia + Hội chợ Nông sản OCOP (~30 gian hàng)"
              place="Đường Chiến thắng Sông Lô, phường Minh Xuân"
            />
            <InfoRow
              date="25/9 (rằm Trung Thu, 15/8 âm lịch)"
              title="Đêm trăng rằm chính"
            />
          </ul>
        </section>

        <section className="mt-5">
          <h2 className="text-lg font-bold text-zinc-900">Địa điểm chính</h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-zinc-700">
            <li>Quảng trường Nguyễn Tất Thành, phường Minh Xuân</li>
            <li>Quảng trường 26/3, phường Hà Giang 1</li>
            <li>
              Đường Chiến thắng Sông Lô, phường Minh Xuân (khu ẩm thực, hội
              chợ)
            </li>
          </ul>
        </section>

        <section className="mt-5 mb-8">
          <h2 className="text-lg font-bold text-zinc-900">Lưu ý cho khách</h2>
          <ul className="mt-2 list-disc pl-5 text-sm leading-6 text-zinc-700">
            <li>
              Muốn xem mô hình đèn diễu diễu vào ngày thường (không phải cuối
              tuần), chỉ có thể xem trong khoảng 21/8 – 4/9; sau đó chỉ diễu
              diễu tối thứ Sáu/thứ Bảy.
            </li>
            <li>
              Đêm hội chính 20/9 và rằm 25/9 là hai đêm đông khách nhất — nên
              đặt chỗ ngủ sớm.
            </li>
            <li>
              Có dịch vụ cho khách trải nghiệm ngồi trên xe mô hình đèn tham
              quan (do các phường/hộ tự tổ chức, không phải dịch vụ của Chạm
              Địa Phương).
            </li>
          </ul>

          <p className="mt-4 text-xs text-zinc-400">
            Nguồn: Kế hoạch số 246/KH-UBND, UBND tỉnh Tuyên Quang, 27/6/2026.
          </p>
        </section>
      </main>
    </div>
  );
}
