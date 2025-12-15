import { HTTP_STATUS } from "../../../../lib/constants";
import { jsonResponse, wrapApiHandler } from "../../../../lib/api/responseHelper";
import { requireAdminSession } from "../../../../lib/ui-auth/guard";
import { getAllSources } from "../../../../lib/data/repositories";

async function unsafeGET(request: Request): Promise<Response> {
  const authResponse = requireAdminSession(request);
  if (authResponse) return authResponse;

  const sources = await getAllSources();
  return jsonResponse({ sources }, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);
