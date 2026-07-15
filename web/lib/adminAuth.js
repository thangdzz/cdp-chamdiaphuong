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
