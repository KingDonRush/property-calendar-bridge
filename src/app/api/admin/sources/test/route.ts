import { HTTP_STATUS } from "../../../../../lib/constants";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../../lib/ui-auth/guard";
import { fetchAndParseIcs } from "../../../../../lib/ical/sync";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

async function unsafePOST(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const payload: unknown = await request.json();
  if (typeof payload !== "object" || payload === null) {
    return errorResponse(400, "Invalid JSON body", "BAD_REQUEST");
  }

  const body = payload as Record<string, unknown>;
  const url = body.url;

  if (!isNonEmptyString(url) || !isValidHttpUrl(url)) {
    return errorResponse(400, "url must be a valid http(s) URL", "BAD_REQUEST");
  }

  try {
    const events = await fetchAndParseIcs(url, { timeoutMs: 5_000 });
    return jsonResponse({ valid: true, eventCount: events.length }, { status: HTTP_STATUS.OK });
  } catch (error) {
    return errorResponse(
      400,
      error instanceof Error ? error.message : "Failed to fetch/parse ICS",
      "BAD_REQUEST"
    );
  }
}

export const POST = wrapApiHandler(unsafePOST);

