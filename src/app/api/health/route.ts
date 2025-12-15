import { HTTP_STATUS } from "../../../lib/constants";
import { jsonResponse, wrapApiHandler } from "../../../lib/api/responseHelper";

function unsafeGET(_request: Request): Response {
  const payload = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return jsonResponse(payload, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);
