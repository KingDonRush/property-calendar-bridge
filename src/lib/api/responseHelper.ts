import { HTTP_STATUS } from "../constants.js";

export type ApiErrorBody = {
  error: true;
  message: string;
  code?: string;
};

export function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }

  return new Response(JSON.stringify(body), { ...init, headers });
}

export function errorResponse(status: number, message: string, code?: string): Response {
  const payload: ApiErrorBody = code ? { error: true, message, code } : { error: true, message };
  return jsonResponse(payload, { status });
}

export function wrapApiHandler<TArgs extends unknown[]>(
  handler: (...args: TArgs) => Response | Promise<Response>
): (...args: TArgs) => Promise<Response> {
  return async (...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(error);
      return errorResponse(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        "INTERNAL_SERVER_ERROR"
      );
    }
  };
}

