import { HTTP_STATUS } from "../../../../lib/constants";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { createSource, getAllSources } from "../../../../lib/data/repositories";

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

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const sources = await getAllSources();
  return jsonResponse({ sources }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);

async function unsafePOST(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const payload: unknown = await request.json();
  if (typeof payload !== "object" || payload === null) {
    return errorResponse(400, "Invalid JSON body", "BAD_REQUEST");
  }

  const body = payload as Record<string, unknown>;
  const property_id = body.property_id;
  const source_url = body.source_url;
  const source_name = body.source_name;

  if (!isNonEmptyString(property_id)) {
    return errorResponse(400, "property_id is required", "BAD_REQUEST");
  }

  if (!isNonEmptyString(source_url) || !isValidHttpUrl(source_url)) {
    return errorResponse(400, "source_url must be a valid http(s) URL", "BAD_REQUEST");
  }

  if (source_name !== undefined && source_name !== null && !isNonEmptyString(source_name)) {
    return errorResponse(400, "source_name must be a non-empty string", "BAD_REQUEST");
  }

  const created = await createSource({
    property_id,
    source_url,
    ...(isNonEmptyString(source_name) ? { source_name } : {}),
  });

  return jsonResponse({ source: created }, { status: 201 });
}

export const POST = wrapApiHandler(unsafePOST);
