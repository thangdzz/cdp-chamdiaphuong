// Icon của từng mục menu, dùng chung cho sidebar desktop và menu mobile để hai nơi luôn khớp.
// Mục chưa có icon riêng dùng la bàn của "Khám phá".
export function NavigationIcon({ itemKey, size = 20 }) {
  const common = {
    viewBox: "0 0 24 24",
    width: size,
    height: size,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (itemKey === "notes") {
    return (
      <svg {...common}>
        <path d="M6 3.5h9l3 3v14H6z" />
        <path d="M15 3.5v3h3M9 11h6M9 15h5" />
      </svg>
    );
  }
  if (itemKey === "notebooks") {
    return (
      <svg {...common}>
        <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
        <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19M9 8h6" />
      </svg>
    );
  }
  if (itemKey === "routes") {
    return (
      <svg {...common}>
        <circle cx="6" cy="18" r="2" />
        <circle cx="18" cy="6" r="2" />
        <path d="M8 18h5.5a3 3 0 0 0 0-6h-3a3 3 0 0 1 0-6H16" />
      </svg>
    );
  }
  if (itemKey === "about") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 8h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m14.8 9.2-1.6 4-4 1.6 1.6-4z" />
    </svg>
  );
}
