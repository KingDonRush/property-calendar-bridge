import { HTTP_STATUS } from "../../../../lib/constants";
import { jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { listSyncRuns } from "../../../../lib/data/repositories";

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const syncRuns = await listSyncRuns();
  return jsonResponse({ syncRuns }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);

