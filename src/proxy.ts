import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE_NAME, isValidAdminSessionCookieValue } from "./lib/ui-auth/session.js";

export function proxy(request: NextRequest) {
  const value = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;
  const authenticated = !!value && isValidAdminSessionCookieValue(value);
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin") && !authenticated) return NextResponse.redirect(new URL("/login", request.url));
  if (pathname === "/login" && authenticated) return NextResponse.redirect(new URL("/admin", request.url));
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/login"] };
