import { HTTP_STATUS } from "../../../../lib/constants.js";
import { getCronSecretToken } from "../../../../lib/env.js";
import { runSyncJob } from "../../../../lib/jobs/sync.js";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper.js";
import { requireJobsAuth } from "../../../../lib/api/auth.js";

async function unsafePOST(request: Request): Promise<Response> {
  const expectedToken = getCronSecretToken();
  const authError = requireJobsAuth(request, expectedToken);
  if (authError) return authError;

  const result = await runSyncJob();
  return jsonResponse(result, { status: HTTP_STATUS.OK });
}

export const POST = wrapApiHandler(unsafePOST);
