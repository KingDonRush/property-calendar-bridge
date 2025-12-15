import { HTTP_STATUS } from "../../../../lib/constants";
import { getCronSecretToken } from "../../../../lib/env";
import { runSyncJob } from "../../../../lib/jobs/sync";
import { errorResponse, jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (!authorization) return null;

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function unsafePOST(request: Request): Promise<Response> {
  const expectedToken = getCronSecretToken();
  const providedToken = getBearerToken(request);

  if (!providedToken || providedToken !== expectedToken) {
    return errorResponse(HTTP_STATUS.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED");
  }

  const result = await runSyncJob();
  return jsonResponse(result, { status: HTTP_STATUS.OK });
}

export const POST = wrapApiHandler(unsafePOST);
