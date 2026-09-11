import { STOP_TYPES } from "@/lib/routes";

// Nhãn loại điểm dừng (NOTE-07 §9). Cố ý KHÔNG dùng cảnh báo đỏ nặng nề — đây không phải lỗi,
// chỉ là "CDP chưa kiểm chứng chỗ này". Nền trung tính, chữ nhỏ, đủ để người nhận link biết
// điểm nào là địa điểm chính thức của CDP và điểm nào không.
// Địa điểm chính thức thì KHÔNG gắn nhãn gì — đó là mặc định, gắn nhãn cho mọi thứ là nhiễu.
export function StopBadge({ type }) {
  if (type === STOP_TYPES.PROPOSED) {
    return (
      <span className="mt-1 inline-block rounded border border-dashed border-zinc-300 bg-zinc-50 px-1.5 py-0.5 text-xs text-zinc-500">
        Người tạo đề xuất · CDP chưa xác minh
      </span>
    );
  }
  if (type === STOP_TYPES.CUSTOM) {
    return (
      <span className="mt-1 inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
        Điểm riêng
      </span>
    );
  }
  return null;
}
