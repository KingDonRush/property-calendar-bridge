import { wrapApiHandler } from "../../../../lib/api/responseHelper";
import { clearAdminSessionCookie } from "../../../../lib/ui-auth/session";

async function unsafePOST(request: Request): Promise<Response> {
  const headers = new Headers({
    location: new URL("/login", request.url).toString(),
    "cache-control": "no-store",
  });
  clearAdminSessionCookie(headers);
  return new Response(null, { status: 302, headers });
}

export const POST = wrapApiHandler(unsafePOST);

