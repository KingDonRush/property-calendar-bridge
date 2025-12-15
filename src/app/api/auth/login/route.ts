import { HTTP_STATUS } from "../../../../lib/constants";
import { wrapApiHandler } from "../../../../lib/api/responseHelper";
import { isValidToken, setAdminSessionCookie } from "../../../../lib/ui-auth/session";
import { renderLoginPage } from "../../../../ui/pages/login";

async function readLoginToken(request: Request): Promise<string | null> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload: unknown = await request.json();
    if (typeof payload === "object" && payload !== null && "token" in payload) {
      const token = (payload as { token?: unknown }).token;
      return typeof token === "string" && token !== "" ? token : null;
    }
    return null;
  }

  const body = await request.text();
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(body);
    const token = params.get("token");
    return token && token !== "" ? token : null;
  }

  const params = new URLSearchParams(body);
  const token = params.get("token");
  return token && token !== "" ? token : null;
}

async function unsafePOST(request: Request): Promise<Response> {
  const token = await readLoginToken(request);
  const ok = token ? isValidToken(token) : false;

  if (!ok) {
    return new Response(renderLoginPage("Token inválido"), {
      status: HTTP_STATUS.UNAUTHORIZED,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  }

  const headers = new Headers({
    location: new URL("/admin", request.url).toString(),
    "cache-control": "no-store",
  });
  setAdminSessionCookie(headers);
  return new Response(null, { status: 302, headers });
}

export const POST = wrapApiHandler(unsafePOST);

