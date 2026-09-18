import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE_NAME, isValidAdminSessionCookieValue } from "./session.js";

/** Every server action authenticates independently of page/layout rendering. */
export async function requireAdminAction(): Promise<void> {
  const value = (await cookies()).get(ADMIN_SESSION_COOKIE_NAME)?.value;
  if (!value || !isValidAdminSessionCookieValue(value)) throw new Error("Unauthorized");
}
