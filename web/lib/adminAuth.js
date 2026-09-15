import crypto from "crypto";

export const ADMIN_COOKIE_NAME = "cdp_admin_session";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("Thiếu biến môi trường ADMIN_SESSION_SECRET");
  return secret;
}

function sign(value) {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

export function createSessionToken() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;

  return Number(payload) > Date.now();
}

export function checkPassword(input) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real || !input) return false;
  const inputBuf = Buffer.from(input);
  const realBuf = Buffer.from(real);
  if (inputBuf.length !== realBuf.length) return false;
  return crypto.timingSafeEqual(inputBuf, realBuf);
}

// Cờ `secure` của cookie phiên theo giao thức THẬT của request, không theo NODE_ENV. Trước đây
// `next start` (production) mở qua http://192.168… trong mạng nhà thì trình duyệt từ chối lưu
// cookie secure → đăng nhập xong bấm sang trang admin khác lại bị hỏi mật khẩu. Trên Vercel
// request luôn là https (header do Vercel đặt, http tự chuyển sang https) nên vẫn là secure.
// Next.js tự điền `x-forwarded-proto` theo kết nối khi không có proxy phía trước.
export function isHttpsRequest(forwardedProto) {
  if (!forwardedProto) return process.env.NODE_ENV === "production";
  return forwardedProto.split(",")[0].trim().toLowerCase() === "https";
}
