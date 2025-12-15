import { HTTP_STATUS } from "../../../../lib/constants";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { listAuditLogs } from "../../../../lib/audit/service";

function parseOptionalInt(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) return null;
  return parsed;
}

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const url = new URL(request.url);
  const limit = parseOptionalInt(url.searchParams.get("limit")) ?? 50;
  const offset = parseOptionalInt(url.searchParams.get("offset")) ?? 0;

  if (limit <= 0) return errorResponse(400, "limit must be a positive integer", "BAD_REQUEST");
  if (offset < 0) return errorResponse(400, "offset must be a non-negative integer", "BAD_REQUEST");

  const auditLogs = await listAuditLogs({ limit, offset });
  return jsonResponse({ auditLogs }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);

