import Link from "next/link";
import { placeMapAction } from "@/lib/mapsUrl";
import { formatPriceCompact } from "@/lib/priceFormat";
import { PLACE_TYPES, placeTypeAsksStatus } from "@/lib/placeTypes";
import { placeValidityLabel } from "@/lib/placeValidity";
import { transportSummary, transportDetailLine } from "@/lib/transport";
import { placeCoverMedia } from "@/lib/media";
import { MediaImage } from "./MediaImage";
import { PinIcon } from "./Icon";
import { PlaceStatusLine } from "./PlaceStatusLine";

// Thẻ chỗ trong trang Xem sổ (/so/{slug}). Owner test 30/9: thẻ phải đủ để NHẬN RA và SO SÁNH
// các chỗ đã lưu, và đi CÙNG THỨ TỰ với phần tóm tắt đầu trang chi tiết (PlaceDetail) để lưu xong
// vào Sổ thấy liền mạch: tên → loại · khu vực → (chỗ tạm) → trạng thái + lần xác nhận → giá →
// địa chỉ → một dòng nổi bật — kèm Xem chi tiết và Chỉ đường/Tìm trên Maps. Không chép cả trang
// chi tiết (ảnh, mẹo, sửa giúp…): muốn biết hết thì bấm Xem chi tiết.
//
// Ảnh nhỏ bên phải để nhận diện (NOTE-03 §3), cố ý không bấm được — ảnh bìa có thể là ảnh menu
// (lib/cover.js), bấm vào mở gallery sẽ nhảy sang ảnh khác hẳn.
export function NotebookPlaceCard({ item, now }) {
  const place = item.place;
  const href = `/dia-diem/${place.id}`;
  const mapAction = placeMapAction(place);
  const price = formatPriceCompact(place);
  const typeLabel = PLACE_TYPES.find((t) => t.id === place.type)?.label ?? null;
  // Chỗ "Đi lại" đã chọn loại thì nói rõ "Xe ghép · 7 chỗ" thay vì chỉ "Đi lại" (NOTE-04 §2).
  const kind = [transportSummary(place) ?? typeLabel, place.ward].filter(Boolean).join(" · ");
  // Một dòng thông tin ngắn có ích nhất theo loại: món đặc trưng (Ăn) hoặc tuyến/khu vực (Đi lại).
  const dishes = place.type === "an" ? (place.signatureDishes ?? []).slice(0, 3) : [];
  // Không có thì lấy mẹo đầu tiên — cũng là dòng 💡 đầu tiên trong "Cần biết" ở trang chi tiết.
  const hint =
    dishes.length > 0
      ? `🍜 Món đặc trưng: ${dishes.join(", ")}`
      : transportDetailLine(place)
        ? `🚐 ${transportDetailLine(place)}`
        : place.notes?.[0]?.text
          ? `💡 ${place.notes[0].text}`
          : null;
  const validityLabel = placeValidityLabel(place, now);
  const cover = placeCoverMedia(place);

  return (
    <li className="rounded-xl bg-white px-[18px] py-5 shadow-sm">
      <div className="flex gap-3">
        <Link href={href} className="min-w-0 flex-1">
          <h3 className="text-lg font-medium leading-snug tracking-tight text-zinc-900">{place.name}</h3>
          {kind && <p className="mt-0.5 text-[13px] text-zinc-500">{kind}</p>}
          {validityLabel && (
            <p className="mt-1.5 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-800">{validityLabel}</p>
          )}
          {placeTypeAsksStatus(place.type) && <PlaceStatusLine place={place} now={now} className="mt-1.5" />}
          {price && (
            <p className="mt-2 flex items-baseline gap-1">
              <span className="text-xl font-medium tracking-tight text-zinc-900">{price.compact}</span>
              <span className="text-xs text-zinc-500">{price.unitText}</span>
            </p>
          )}
          {place.address && (
            <p className="mt-1.5 flex items-start gap-1.5 text-sm text-zinc-800">
              <PinIcon size={14} className="mt-[3px] shrink-0 text-zinc-400" />
              <span className="line-clamp-2">{place.address}</span>
            </p>
          )}
          {hint && <p className="mt-1.5 line-clamp-2 text-sm text-zinc-700">{hint}</p>}
        </Link>
        {cover && <MediaImage media={cover} className="h-20 w-20 shrink-0 rounded-lg bg-zinc-100" sizes="80px" />}
      </div>

      {/* Ghi chú chủ sổ viết cho chỗ này — lý do chỗ này có trong sổ, giữ nguyên như cũ. */}
      {item.note && <p className="mt-3 text-sm text-zinc-700">💬 {item.note}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={href}
          className="cdp-pressable inline-flex min-h-11 items-center rounded-lg bg-[#c8553d] px-4 text-sm font-medium text-white active:bg-[#ad4832]"
        >
          Xem chi tiết
        </Link>
        {/* Spec Location-Routing §6: chỗ chưa xác nhận vị trí thì đây là nút TÌM, không phải chỉ đường. */}
        {mapAction && (
          <a
            href={mapAction.href}
            target="_blank"
            rel="noopener noreferrer"
            className="cdp-pressable inline-flex min-h-11 items-center rounded-lg border border-zinc-200 px-3 text-[13px] font-medium text-zinc-600"
          >
            {mapAction.label}
          </a>
        )}
      </div>
    </li>
  );
}
