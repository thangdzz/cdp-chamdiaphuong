// Bộ icon nét mảnh dùng chung — thay cho emoji (SPEC-giao-dien.md §6c mục 5). Cùng viewBox,
// cùng độ dày nét (strokeWidth 2), cùng cỡ mặc định — để đồng bộ thị giác thay vì mỗi máy
// hiển thị emoji một kiểu.
function Svg({ children, size = 16, className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PinIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Svg>
  );
}

export function ClockIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </Svg>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12.5l2.5 2.5 5-5.5" />
    </Svg>
  );
}

export function DocumentIcon(props) {
  return (
    <Svg {...props}>
      <path d="M7 3.5h7l3.5 3.5v13.5h-10.5z" />
      <path d="M14 3.5v3.5h3.5" />
      <path d="M9.5 13h5M9.5 16h5" />
    </Svg>
  );
}

export function PhoneIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 4h3l1.5 4.5-2 1.5a11 11 0 0 0 5 5l1.5-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4 6.2 2 2 0 0 1 6 4z" />
    </Svg>
  );
}

export function BookmarkIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6.5 3.5h11v17l-5.5-4-5.5 4z" />
    </Svg>
  );
}

export function PencilIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 20l.8-3.6L15.6 5.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L7.6 19.2z" />
      <path d="M14 7.5l2.5 2.5" />
    </Svg>
  );
}
