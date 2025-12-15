import { HTTP_STATUS } from "../constants";
import { errorResponse } from "./responseHelper";

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

export function getTokenFromRequest(request: Request): string | null {
  const bearer = getBearerToken(request);
  if (bearer) return bearer;

  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    return token && token !== "" ? token : null;
  } catch {
    return null;
  }
}

export function requireJobsAuth(request: Request, expectedToken: string): Response | null {
  const providedToken = getTokenFromRequest(request);

  if (!providedToken || providedToken !== expectedToken) {
    return errorResponse(HTTP_STATUS.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED");
  }

  return null;
}

