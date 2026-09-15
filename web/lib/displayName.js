// Tên hiển thị ẩn danh của CDP (NOTE-08 §2–§3). File thuần — dùng chung ở server (tạo hồ sơ, đổi
// tên) và trình duyệt (tên nháp khi khách mới mở game, kiểm tra tên trước khi gửi).
//
// Tên sinh theo khuôn [tiền tố] + [hành động/vai] (NOTE-08 §2). Chỉ ghép những cặp đọc xuôi tai —
// "Thợ Đi Đêm" hay "Kẻ Cầm Đèn" nghe gượng nên không tự nhân chéo mọi tiền tố với mọi vế sau.

const NAME_GROUPS = [
  {
    prefixes: ["Kẻ", "Người"],
    roles: [
      "Săn Trăng",
      "Đi Đêm",
      "Canh Phố",
      "Gác Trăng",
      "Đuổi Theo Đèn",
      "Lang Thang Thành Tuyên",
      "Săn Tiếng Trống",
      "Đi Qua Ngã Tám",
      "Ngắm Trăng Rằm",
      "Theo Dấu Đèn",
      "Thức Cùng Phố",
      "Đếm Đèn Lồng",
      "Lạc Giữa Đêm Hội",
      "Nhặt Ánh Trăng",
      "Săn Ánh Đèn",
      "Chờ Đèn Rước",
    ],
  },
  {
    prefixes: ["Thợ"],
    roles: ["Săn Ánh Sáng", "Săn Đèn", "Săn Trăng", "Bắt Sáng Đêm Hội"],
  },
  {
    prefixes: ["Tay"],
    roles: ["Săn Đèn Phố Tuyên", "Chơi Đêm Hội", "Lướt Phố Đêm"],
  },
  {
    prefixes: [""],
    roles: [
      "Chú Bé Cầm Đèn",
      "Cô Gái Ngắm Trăng",
      "Đứa Hay Đi Lang Thang",
      "Cú Đêm Thành Tuyên",
      "Mắt Cú Phố Đêm",
      "Thám Tử Đèn Lồng",
      "Lữ Khách Đêm Rằm",
      "Hiệp Sĩ Phố Đêm",
    ],
  },
];

export const GENERATED_NAMES = NAME_GROUPS.flatMap(({ prefixes, roles }) =>
  prefixes.flatMap((prefix) => roles.map((role) => `${prefix} ${role}`.trim()))
);

// Hồ sơ cũ tạo im lặng trước NOTE-08 mang tên này — coi như "chưa có tên", suy ra tên lúc đọc.
export const LEGACY_ANONYMOUS_NAME = "Người ẩn danh";

export const DISPLAY_NAME_MIN = 3;
export const DISPLAY_NAME_MAX = 30;

function fold(text) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// "Không trùng tên mô hình" (NOTE-08 §2): bằng nhau, hoặc tên này chứa trọn tên mô hình (VD
// "Kẻ Săn Rồng vàng khổng lồ"). Tên mô hình quá ngắn (< 4 ký tự) không xét chứa để khỏi bắt nhầm.
function collidesWithAny(name, avoidNames) {
  const folded = fold(name);
  return avoidNames.some((other) => {
    const target = fold(other);
    if (!target) return false;
    return folded === target || (target.length >= 4 && folded.includes(target));
  });
}

function pool(avoidNames = []) {
  const usable = GENERATED_NAMES.filter((name) => !collidesWithAny(name, avoidNames));
  return usable.length > 0 ? usable : GENERATED_NAMES;
}

/** Tên ngẫu nhiên, khác `exclude` (tên đang dùng — để nút "Tên khác" luôn ra tên mới). */
export function generateDisplayName({ avoidNames = [], exclude = null } = {}) {
  const names = pool(avoidNames).filter((name) => name !== exclude);
  const list = names.length > 0 ? names : GENERATED_NAMES;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Tên cố định suy từ anonId — cho hồ sơ cũ chưa có tên thật. Không ghi lại vào Redis: lần nào đọc
 * cũng ra cùng một tên (AGENTS §3.6 "suy ra lúc đọc", không migration).
 */
export function derivedDisplayName(anonId, avoidNames = []) {
  const names = pool(avoidNames);
  let hash = 2166136261;
  for (const char of String(anonId ?? "")) {
    hash ^= char.codePointAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return names[hash % names.length];
}

/** Tên để hiện cho một hồ sơ: tên đã lưu nếu có, không thì tên suy ra. */
export function resolveDisplayName({ anonId, nickname }, avoidNames = []) {
  const clean = normalizeDisplayName(nickname);
  if (clean && clean !== LEGACY_ANONYMOUS_NAME) return clean;
  return derivedDisplayName(anonId, avoidNames);
}

export function normalizeDisplayName(value) {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

// Lọc bậy mức cơ bản (NOTE-08 §3). Từ có dấu so trên chữ gốc — bỏ dấu thì "lồn" thành "lon" trùng
// "lớn", "cặc" thành "cac" trùng "các". Viết tắt/không dấu mà không nhập nhằng thì so trên chữ đã bỏ dấu.
const PROFANE_WITH_MARKS = ["lồn", "cặc", "buồi", "địt", "đụ", "đéo", "đĩ", "cứt", "đm", "đcm", "đmm", "óc chó"];
const PROFANE_FOLDED = ["dit me", "du ma", "dmm", "dcm", "vcl", "vkl", "clm", "cmm", "cc", "fuck", "shit", "bitch", "dick"];

function hasWord(text, word) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${word.replace(/\s+/g, "\\s+")}($|[^\\p{L}\\p{N}])`, "u").test(text);
}

// Không giả làm người vận hành (NOTE-08 §3). So trên chữ bỏ dấu, bỏ hết khoảng trắng/dấu câu để bắt
// cả kiểu "A d m i n", "C.D.P".
const IMPERSONATION = ["admin", "cdp", "chamdiaphuong", "quantrivien", "banquantri", "moderator", "chamdia"];

const LINK_OR_PHONE = /(https?:\/\/|www\.|\.(com|vn|net|org)\b|\d[\d\s.-]{6,}\d)/i;

/**
 * Kiểm tra tên người dùng tự đặt. Không cần duy nhất (NOTE-08 §3).
 * @returns {{ ok: true, name: string } | { ok: false, error: string }}
 */
export function validateDisplayName(value, { avoidNames = [] } = {}) {
  const name = normalizeDisplayName(value);
  const length = [...name].length;
  if (length < DISPLAY_NAME_MIN || length > DISPLAY_NAME_MAX) {
    return { ok: false, error: `Tên cần dài ${DISPLAY_NAME_MIN}–${DISPLAY_NAME_MAX} ký tự.` };
  }
  if (!/^[\p{L}\p{M}\p{N} .'_-]+$/u.test(name) || !/\p{L}/u.test(name)) {
    return { ok: false, error: "Tên chỉ dùng chữ, số và khoảng trắng nhé." };
  }
  if (LINK_OR_PHONE.test(name)) {
    return { ok: false, error: "Tên không được chứa số điện thoại hay đường link." };
  }
  const lower = name.toLowerCase();
  const folded = fold(name);
  if (PROFANE_WITH_MARKS.some((word) => hasWord(lower, word)) || PROFANE_FOLDED.some((word) => hasWord(folded, word))) {
    return { ok: false, error: "Tên này chưa lịch sự lắm, chọn tên khác nhé." };
  }
  const squashed = folded.replace(/[^a-z0-9]/g, "");
  if (IMPERSONATION.some((word) => squashed.includes(word))) {
    return { ok: false, error: "Tên không được giống Admin hay CDP." };
  }
  if (name.toLowerCase() === LEGACY_ANONYMOUS_NAME.toLowerCase()) {
    return { ok: false, error: "Đặt một cái tên riêng cho oách nhé." };
  }
  if (avoidNames.some((other) => fold(other) === folded)) {
    return { ok: false, error: "Tên này trùng tên một mô hình, chọn tên khác nhé." };
  }
  return { ok: true, name };
}
