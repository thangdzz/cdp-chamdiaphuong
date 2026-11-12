// Icon của từng mục điều hướng, dùng chung cho thanh đáy, Menu mobile và sidebar desktop để các nơi luôn khớp.
// Mục chưa có icon riêng dùng la bàn.
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

  if (itemKey === "explore") {
    return (
      <svg {...common}>
        <path d="M4 10.5 12 4l8 6.5" />
        <path d="M6 9v10.5h12V9M10 19.5v-5h4v5" />
      </svg>
    );
  }
  if (itemKey === "search") {
    return (
      <svg {...common}>
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }
  if (itemKey === "festival") {
    return (
      <svg {...common}>
        <rect x="4" y="5.5" width="16" height="14.5" rx="2" />
        <path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" />
        <path d="m12 12.6.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2-1.45-1.4 2-.3z" />
      </svg>
    );
  }
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
