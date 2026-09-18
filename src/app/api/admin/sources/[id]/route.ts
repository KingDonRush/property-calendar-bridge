import { HTTP_STATUS } from "../../../../../lib/constants.js";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../../lib/api/responseHelper.js";
import { requireAdminSession } from "../../../../../lib/ui-auth/guard.js";
import { updateSourceStatus } from "../../../../../lib/data/repositories.js";

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

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

async function unsafePUT(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const id = (await ctx.params).id;
  if (!isNonEmptyString(id)) {
    return errorResponse(400, "id is required", "BAD_REQUEST");
  }

  const payload: unknown = await request.json();
  if (typeof payload !== "object" || payload === null) {
    return errorResponse(400, "Invalid JSON body", "BAD_REQUEST");
  }

  const body = payload as Record<string, unknown>;

  const patch: Record<string, unknown> = {};

  if (body.source_name !== undefined) {
    if (body.source_name === null || !isNonEmptyString(body.source_name)) {
      return errorResponse(400, "source_name must be a non-empty string", "BAD_REQUEST");
    }
    patch.source_name = body.source_name;
  }

  if (body.source_url !== undefined) {
    if (body.source_url === null || !isNonEmptyString(body.source_url) || !isValidHttpUrl(body.source_url)) {
      return errorResponse(400, "source_url must be a valid http(s) URL", "BAD_REQUEST");
    }
    patch.source_url = body.source_url;
  }

  if (body.refresh_rate !== undefined) {
    if (!isNonNegativeInteger(body.refresh_rate)) {
      return errorResponse(400, "refresh_rate must be a non-negative integer", "BAD_REQUEST");
    }
    patch.refresh_rate = body.refresh_rate;
  }

  if (Object.keys(patch).length === 0) {
    return errorResponse(400, "No fields to update", "BAD_REQUEST");
  }

  await updateSourceStatus(id, patch);
  return jsonResponse({ ok: true }, { status: HTTP_STATUS.OK });
}

export const PUT = wrapApiHandler(unsafePUT);

async function unsafeDELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const id = (await ctx.params).id;
  if (!isNonEmptyString(id)) {
    return errorResponse(400, "id is required", "BAD_REQUEST");
  }

  await updateSourceStatus(id, { refresh_rate: 0 });
  return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
}

export const DELETE = wrapApiHandler(unsafeDELETE);
