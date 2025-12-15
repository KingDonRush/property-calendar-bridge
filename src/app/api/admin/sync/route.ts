import { jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { runSyncJob } from "../../../../lib/jobs/sync";

async function unsafePOST(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const result = await runSyncJob();
  return jsonResponse(result, { status: 202 });
}

export const POST = wrapApiHandler(unsafePOST);

