import crypto from "node:crypto";
import { cookies } from "next/headers";

export type LineSession = {
  sub: string; // LINE userId
  iat: number; // issued-at (unix seconds)
};

const COOKIE_NAME = "line_session";

function b64url(input: Buffer | string) {
  const buf = typeof input === "string" ? Buffer.from(input, "utf-8") : input;
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlJson(obj: unknown) {
  return b64url(JSON.stringify(obj));
}

function hmac(payload: string, secret: string) {
  return b64url(crypto.createHmac("sha256", secret).update(payload).digest());
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing SESSION_SECRET");
  return secret;
}

export function signSessionCookie(session: LineSession) {
  const secret = getSecret();
  const payload = b64urlJson(session);
  const sig = hmac(payload, secret);
  return `${payload}.${sig}`;
}

export function verifySessionCookie(token: string): LineSession | null {
  const secret = getSecret();
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = hmac(payload, secret);

  // constant-time compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;

  try {
    const json = Buffer.from(payload.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    const parsed = JSON.parse(json) as LineSession;
    if (!parsed?.sub || typeof parsed.sub !== "string") return null;
    if (!parsed?.iat || typeof parsed.iat !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getLineSession(): Promise<LineSession | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionCookie(token);
}

export async function setLineSessionCookie(session: LineSession) {
  const jar = await cookies();
  const value = signSessionCookie(session);
  const isProd = process.env.NODE_ENV === "production";
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
}

export async function clearLineSessionCookie() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

