import { HTTP_STATUS } from "../../../../lib/constants";
import { getCronSecretToken } from "../../../../lib/env";
import { runSyncJob } from "../../../../lib/jobs/sync";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireJobsAuth } from "../../../../lib/api/auth";

async function unsafePOST(request: Request): Promise<Response> {
  const expectedToken = getCronSecretToken();
  const authError = requireJobsAuth(request, expectedToken);
  if (authError) return authError;

  const result = await runSyncJob();
  return jsonResponse(result, { status: HTTP_STATUS.OK });
}

export const POST = wrapApiHandler(unsafePOST);
