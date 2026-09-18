import { HTTP_STATUS } from "../constants.js";
import { errorResponse } from "../api/responseHelper.js";

import { ADMIN_SESSION_COOKIE_NAME, isValidAdminSessionCookieValue } from "./session.js";

function parseCookies(headerValue: string | null): Record<string, string> {
  if (!headerValue) return {};

  const entries = headerValue
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((cookie) => {
      const index = cookie.indexOf("=");
      if (index === -1) return null;
      const name = cookie.slice(0, index).trim();
      const value = cookie.slice(index + 1).trim();
      if (!name) return null;
      try { return [name, decodeURIComponent(value)] as const; } catch { return null; }
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

function expectsJson(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  if (accept.toLowerCase().includes("application/json")) return true;

  try {
    const url = new URL(request.url);
    return url.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

export function requireAdminSession(request: Request): Response | null {
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionValue = cookies[ADMIN_SESSION_COOKIE_NAME];

  if (sessionValue && isValidAdminSessionCookieValue(sessionValue)) {
    return null;
  }

  if (expectsJson(request)) {
    return errorResponse(HTTP_STATUS.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED");
  }

  const url = new URL(request.url);
  return Response.redirect(new URL("/login", url), 302);
}

