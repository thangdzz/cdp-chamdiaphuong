import { TIER_COLORS } from "@/lib/badges";

// Icon vẽ tay bằng SVG (không có công cụ tạo ảnh) — mỗi lĩnh vực 1 biểu tượng nhỏ, đặt
// trên nền hình đèn lồng tô màu theo bậc (mộc/đồng/bạc/vàng/ánh trăng).
const ICONS = {
  map: (
    <path d="M4 6.5 9 5l6 1.5 5-1.5v13l-5 1.5-6-1.5-5 1.5z M9 5v13 M15 6.5v13" />
  ),
  camera: (
    <>
      <rect x="4.5" y="8.5" width="15" height="10" rx="2" />
      <path d="M9 8.5 10 6h4l1 2.5" />
      <circle cx="12" cy="13.5" r="3" />
    </>
  ),
  bowl: (
    <>
      <path d="M4 12h16a8 6 0 0 1-16 0z" />
      <path d="M9 12V8.5 M12 12V7 M15 12V8.5" />
    </>
  ),
  suitcase: (
    <>
      <rect x="4" y="9" width="16" height="10" rx="2" />
      <path d="M9 9V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M4 13.5h16" />
    </>
  ),
  graduationCap: (
    <>
      <path d="M2 9 12 5l10 4-10 4z" />
      <path d="M6 11v4c0 1.5 3 3 6 3s6-1.5 6-3v-4" />
      <path d="M22 9v5" />
    </>
  ),
  motorbike: (
    <>
      <circle cx="6.5" cy="17" r="2.3" />
      <circle cx="17.5" cy="17" r="2.3" />
      <path d="M6.5 17 10 10h4l4 4h2.5" />
      <path d="M10 10 8.5 7h-2" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  // Cây đa Tân Trào — tán lá rộng nhiều cụm (không phải 1 khối tròn đơn) + nhiều thân/rễ
  // phụ toả xuống, đúng đặc trưng nhận diện của cây đa (khác cây thường chỉ 1 thân).
  banyanTree: (
    <>
      <circle cx="8" cy="8" r="3.2" />
      <circle cx="13" cy="6.3" r="3.6" />
      <circle cx="17" cy="9" r="3" />
      <path d="M9 13v6 M12.5 12v7 M16 13v6" />
      <path d="M6 19h12" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9.5 7V4 M12 7V4 M14.5 7V4 M9.5 20v-3 M12 20v-3 M14.5 20v-3 M7 9.5H4 M7 12H4 M7 14.5H4 M20 9.5h-3 M20 12h-3 M20 14.5h-3" />
    </>
  ),
  // Cửa hàng có mái hiên xếp nếp — hình ảnh gắn liền với "kinh doanh" rõ hơn bắt tay.
  storefront: (
    <>
      <path d="M5 10 6 5h12l1 5" />
      <path d="M5 10a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0" />
      <path d="M5.5 10v9h13v-9" />
      <rect x="10" y="14" width="4" height="5" />
    </>
  ),
};

// Sao nhỏ toả xung quanh, chỉ dành riêng bậc 5 "Huyền thoại" — cảm giác ăn mừng cho bậc
// cao nhất, đặt phía sau vòng tròn chính.
const SPARKLE_POSITIONS = [
  { x: 3, y: 4, s: 0.55, r: -12 },
  { x: 21, y: 3.5, s: 0.4, r: 20 },
  { x: 22, y: 15, s: 0.5, r: 8 },
  { x: 2, y: 17, s: 0.42, r: -18 },
  { x: 12, y: 0.5, s: 0.32, r: 0 },
];
const SPARKLE_PATH = "M0 -6 L1.3 -1.3 L6 0 L1.3 1.3 L0 6 L-1.3 1.3 L-6 0 L-1.3 -1.3 Z";

export function BadgeIcon({ icon, tierIndex = 0, size = 40 }) {
  const color = TIER_COLORS[tierIndex] ?? TIER_COLORS[0];
  const isLegendary = tierIndex === 4;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {isLegendary && (
        <g fill={color} opacity="0.55">
          {SPARKLE_POSITIONS.map((p, i) => (
            <path
              key={i}
              d={SPARKLE_PATH}
              transform={`translate(${p.x} ${p.y}) rotate(${p.r}) scale(${p.s})`}
            />
          ))}
        </g>
      )}
      <circle cx="12" cy="12" r="11.5" fill={color} />
      <g
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.95"
      >
        {ICONS[icon] ?? ICONS.map}
      </g>
    </svg>
  );
}
