import { HTTP_STATUS } from "../../../lib/constants.js";
import { jsonResponse, wrapApiHandler } from "../../../lib/api/responseHelper.js";

function unsafeGET(_request: Request): Response {
  const payload = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  return jsonResponse(payload, { status: HTTP_STATUS.OK });
}

export const GET = wrapApiHandler(unsafeGET);
