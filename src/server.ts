import http from "node:http";

import { GET as healthGet } from "./app/api/health/route";
import { GET as icalGet } from "./app/api/ical/[secret]/master.ics/route";
import { POST as jobsSyncPost } from "./app/api/jobs/sync/route";

function normalizeHeaders(headers: http.IncomingHttpHeaders): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      normalized[key] = value;
    } else if (Array.isArray(value)) {
      normalized[key] = value.join(", ");
    }
  }

  return normalized;
}

async function sendResponse(nodeResponse: http.ServerResponse, response: Response): Promise<void> {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));

  const body = Buffer.from(await response.arrayBuffer());
  nodeResponse.end(body);
}

async function handler(nodeRequest: http.IncomingMessage, nodeResponse: http.ServerResponse): Promise<void> {
  const host = nodeRequest.headers.host ?? "localhost";
  const url = new URL(nodeRequest.url ?? "/", `http://${host}`);
  const method = (nodeRequest.method ?? "GET").toUpperCase();

  const request = new Request(url.toString(), {
    method,
    headers: normalizeHeaders(nodeRequest.headers)
  });

  if (method === "GET" && url.pathname === "/api/health") {
    return sendResponse(nodeResponse, await healthGet(request));
  }

  const icalMatch = url.pathname.match(/^\/api\/ical\/([^/]+)\/master\.ics$/);
  if (method === "GET" && icalMatch) {
    const secret = icalMatch[1] ?? "";
    return sendResponse(nodeResponse, await icalGet(request, { params: { secret } }));
  }

  if (method === "POST" && url.pathname === "/api/jobs/sync") {
    return sendResponse(nodeResponse, await jobsSyncPost(request));
  }

  nodeResponse.statusCode = 404;
  nodeResponse.setHeader("content-type", "text/plain; charset=utf-8");
  nodeResponse.end("Not Found");
}

const port = Number(process.env.PORT ?? 3000);
const server = http.createServer((req, res) => {
  void handler(req, res);
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

