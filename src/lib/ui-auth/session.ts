import crypto from "node:crypto";

import { getAuthConfig } from "../config.js";

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";
export const DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function safeEqualString(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signAdminSessionPayload(payload: string): string {
  const { adminUiSessionSecret } = getAuthConfig();
  return crypto.createHmac("sha256", adminUiSessionSecret).update(payload).digest("hex");
}

export function isValidToken(inputToken: string): boolean {
  const { adminUiToken } = getAuthConfig();
  return safeEqualString(inputToken, adminUiToken);
}

export function createAdminSessionCookieValue(): string {
  const payload = `${Math.floor(Date.now() / 1000)}:${crypto.randomBytes(18).toString("hex")}`;
  const signature = signAdminSessionPayload(payload);
  return `${payload}.${signature}`;
}

export function isValidAdminSessionCookieValue(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;
  if (!payload || !signature) return false;

  if (!/^\d{10}:[a-f0-9]{36}$/.test(payload) || !/^[a-f0-9]{64}$/.test(signature)) return false;
  const issuedAt = Number(payload.split(":")[0]);
  const age = Math.floor(Date.now() / 1000) - issuedAt;
  if (age < 0 || age >= DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS) return false;
  const expectedSignature = signAdminSessionPayload(payload);
  return safeEqualString(signature, expectedSignature);
}

function serializeCookie(
  name: string,
  value: string,
  options: {
    httpOnly?: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    path?: string;
    maxAgeSeconds?: number;
  }
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];

  if (typeof options.maxAgeSeconds === "number") {
    parts.push(`Max-Age=${options.maxAgeSeconds}`);
  }
  if (options.path) {
    parts.push(`Path=${options.path}`);
  }
  if (options.httpOnly) {
    parts.push("HttpOnly");
  }
  if (options.sameSite) {
    parts.push(`SameSite=${options.sameSite}`);
  }

  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function setAdminSessionCookie(headers: Headers): void {
  const value = createAdminSessionCookieValue();
  headers.set(
    "set-cookie",
    serializeCookie(ADMIN_SESSION_COOKIE_NAME, value, {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAgeSeconds: DEFAULT_ADMIN_SESSION_MAX_AGE_SECONDS,
    })
  );
}

export function clearAdminSessionCookie(headers: Headers): void {
  headers.set(
    "set-cookie",
    serializeCookie(ADMIN_SESSION_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "Strict",
      path: "/",
      maxAgeSeconds: 0,
    })
  );
}

