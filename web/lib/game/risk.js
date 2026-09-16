import crypto from "node:crypto";

// Dấu vết rủi ro của một lượt báo (giai đoạn 1 — chốt 2026-09-16).
//
// Mục tiêu: BIẾT có ai gian lận không, KHÔNG phải chặn. anonId nằm trong localStorage nên mở
// trình duyệt khác hay ẩn danh là thành người mới — không bao giờ được coi anonId là danh tính
// thật. Ở đây gom thêm vài dấu vết phía server để nhận ra "nhiều danh tính mà trông như cùng một
// máy", rồi GẮN CỜ cho chủ dự án xem.
//
// Quy tắc đã chốt:
//  - KHÔNG chặn theo IP. Cả nhà chung wifi, cả đám dùng 4G cùng nhà mạng đều ra một IP — chặn là
//    oan người thật. IP chỉ dùng làm tín hiệu nghi ngờ.
//  - KHÔNG lưu IP thô và KHÔNG lưu chuỗi User-Agent thô. Chỉ lưu bản băm (không đọc ngược được)
//    cộng một nhãn máy thô kiểu "iOS · Safari" để chủ dự án đọc hiểu.
//  - Nhảy vị trí vô lý thì TỪ CHỐI thẳng ở store.js, không ghi rồi giấu.

// Đủ để so trùng, không đủ để suy ngược ra IP.
const HASH_LENGTH = 16;

function secret() {
  // Không thêm biến môi trường mới cho production: ADMIN_SESSION_SECRET đã có sẵn. Thiếu cả hai
  // thì vẫn băm được (chỉ mất tính bí mật) — không bao giờ làm vỡ luồng báo đèn.
  return process.env.CDP_RISK_SECRET?.trim() || process.env.ADMIN_SESSION_SECRET?.trim() || "cdp-risk";
}

function hash(...parts) {
  return crypto.createHmac("sha256", secret()).update(parts.join("|")).digest("hex").slice(0, HASH_LENGTH);
}

/** Nhãn máy thô — đủ để chủ dự án đọc, không đủ để nhận ra một người cụ thể. */
export function coarseDevice(ua = "") {
  const os = /iphone|ipad|ipod/i.test(ua)
    ? "iOS"
    : /android/i.test(ua)
      ? "Android"
      : /macintosh|mac os/i.test(ua)
        ? "Mac"
        : /windows/i.test(ua)
          ? "Windows"
          : "Khác";
  // Thứ tự quan trọng: Samsung Internet, Cốc Cốc và Edge đều mang chữ "Chrome" trong chuỗi nhận
  // dạng, phải xét trước Chrome nếu không máy Samsung sẽ bị gọi nhầm là Chrome.
  const browser = /zalo/i.test(ua)
    ? "Zalo"
    : /fban|fbav|fb_iab|instagram|messenger/i.test(ua)
      ? "Facebook"
      : /samsungbrowser/i.test(ua)
        ? "Samsung Internet"
        : /coc_coc_browser|coccoc/i.test(ua)
          ? "Cốc Cốc"
          : /edga?|edgios/i.test(ua)
            ? "Edge"
            : /opr\/|opera/i.test(ua)
              ? "Opera"
              : /crios|chrome/i.test(ua)
                ? "Chrome"
                : /fxios|firefox/i.test(ua)
                  ? "Firefox"
                  : /safari/i.test(ua)
                    ? "Safari"
                    : "Khác";
  return `${os} · ${browser}`;
}

function clientIp(headers) {
  // Vercel đặt x-forwarded-for; phần tử đầu là máy khách thật.
  const forwarded = headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || headers.get("x-real-ip")?.trim() || "";
}

/**
 * Dấu vết của MỘT lượt gửi. `riskKey` = mạng + đời trình duyệt: đổi trình duyệt hay bật ẩn danh
 * thì anonId đổi nhưng riskKey thường KHÔNG đổi — đó là chỗ để nhận ra cùng một máy.
 * @returns { ipHash, uaHash, device, riskKey }
 */
export function riskContext(headers) {
  const ip = clientIp(headers);
  const ua = headers.get("user-agent") ?? "";
  const ipHash = ip ? hash("ip", ip) : null;
  const uaHash = ua ? hash("ua", ua) : null;
  return {
    ipHash,
    uaHash,
    device: coarseDevice(ua),
    riskKey: hash("risk", ipHash ?? "-", uaHash ?? "-"),
  };
}

// Ngưỡng nằm ở ./riskLimits.js để điện thoại dùng chung được (file này có node:crypto).
export {
  ACCURACY_WARN_M,
  MANY_IDS_PER_RISK_KEY,
  MANY_IDS_PER_IP,
  BURST_PER_RISK_KEY,
  REPEAT_SAME_MODEL,
  RISK_FLAGS,
} from "./riskLimits.js";

/**
 * Khoảng cách TỐI ĐA hợp lý giữa hai lần đo của cùng một người.
 * 2 m/giây là đi bộ nhanh trong đám đông; cộng sai số của cả hai lần đo và 50 m nới tay, để một
 * lần GPS chập chờn không làm oan người thật.
 */
export function plausibleJumpMeters(secondsApart, accuracyA, accuracyB) {
  const walk = 2 * Math.max(0, secondsApart);
  const noise = (Number(accuracyA) || 0) + (Number(accuracyB) || 0);
  return walk + noise + 50;
}
