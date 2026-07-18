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
  lantern: (
    <>
      <path d="M12 3v2.3 M9 5.3h6l1.3 2.7-1.3 9.7H9L7.7 8z" />
      <path d="M9.4 9h5.2 M9.6 12.2h4.8" />
      <path d="M10.5 17.7h3v2h-3z" />
    </>
  ),
  chip: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <path d="M9.5 7V4 M12 7V4 M14.5 7V4 M9.5 20v-3 M12 20v-3 M14.5 20v-3 M7 9.5H4 M7 12H4 M7 14.5H4 M20 9.5h-3 M20 12h-3 M20 14.5h-3" />
    </>
  ),
  handshake: (
    <>
      <path d="M3 12 7 8l4 3-2 2z" />
      <path d="M21 12 17 8l-4 3 2 2z" />
      <path d="M11 11l2 2 3-3" />
      <path d="M7 11l3 3 1-1" />
    </>
  ),
};

export function BadgeIcon({ icon, tierIndex = 0, size = 40 }) {
  const color = TIER_COLORS[tierIndex] ?? TIER_COLORS[0];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
