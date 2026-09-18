import { HTTP_STATUS } from "../../../../../lib/constants.js";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../../lib/api/responseHelper.js";
import { requireAdminSession } from "../../../../../lib/ui-auth/guard.js";
import { validateBackupFile } from "../../../../../lib/data/backup.js";

async function unsafePOST(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const body = await request.text();
  if (!body || body.trim().length === 0) {
    return errorResponse(400, "Empty body", "BAD_REQUEST");
  }

  const valid = validateBackupFile(body);
  if (!valid) {
    return errorResponse(400, "Invalid backup file", "BAD_REQUEST");
  }

  return jsonResponse({ valid: true }, { status: HTTP_STATUS.OK });
}

export const POST = wrapApiHandler(unsafePOST);
