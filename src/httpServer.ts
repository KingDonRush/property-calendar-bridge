import http from "node:http";

import { GET as healthGet } from "./app/api/health/route";
import { GET as icalGet } from "./app/api/ical/[secret]/master.ics/route";
import { POST as authLoginPost } from "./app/api/auth/login/route";
import { POST as authLogoutPost } from "./app/api/auth/logout/route";
import { GET as adminSourcesGet, POST as adminSourcesPost } from "./app/api/admin/sources/route";
import { DELETE as adminSourcesIdDelete, PUT as adminSourcesIdPut } from "./app/api/admin/sources/[id]/route";
import { POST as adminSourcesTestPost } from "./app/api/admin/sources/test/route";
import { GET as adminSyncRunsGet } from "./app/api/admin/sync-runs/route";
import { GET as adminBookingsGet } from "./app/api/admin/bookings/route";
import { POST as jobsSyncPost } from "./app/api/jobs/sync/route";
import { requireAdminSession } from "./lib/ui-auth/guard";
import { renderLoginPage } from "./ui/pages/login";
import { MAIN_CSS } from "./ui/styles/mainCss";
import { renderLayout } from "./ui/components/Layout";
import { renderDashboardPage } from "./ui/pages/Dashboard";
import { renderSourcesPage } from "./ui/pages/sources";

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

async function readBody(nodeRequest: http.IncomingMessage): Promise<Buffer | undefined> {
  const method = (nodeRequest.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    nodeRequest.on("data", (chunk) => {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    });
    nodeRequest.on("end", () => {
      const body = Buffer.concat(chunks);
      resolve(body.length > 0 ? body : undefined);
    });
    nodeRequest.on("error", reject);
  });
}

async function sendResponse(nodeResponse: http.ServerResponse, response: Response): Promise<void> {
  nodeResponse.statusCode = response.status;
  response.headers.forEach((value, key) => nodeResponse.setHeader(key, value));

  const body = Buffer.from(await response.arrayBuffer());
  nodeResponse.end(body);
}

export async function handler(
  nodeRequest: http.IncomingMessage,
  nodeResponse: http.ServerResponse
): Promise<void> {
  const host = nodeRequest.headers.host ?? "localhost";
  const url = new URL(nodeRequest.url ?? "/", `http://${host}`);
  const method = (nodeRequest.method ?? "GET").toUpperCase();

  const body = await readBody(nodeRequest);
  const request = new Request(url.toString(), {
    method,
    headers: normalizeHeaders(nodeRequest.headers),
    body,
  });

  if (method === "GET" && url.pathname === "/login") {
    return sendResponse(
      nodeResponse,
      new Response(renderLoginPage(), {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (method === "GET" && url.pathname === "/assets/main.css") {
    return sendResponse(
      nodeResponse,
      new Response(MAIN_CSS, {
        status: 200,
        headers: { "content-type": "text/css; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    const authResponse = requireAdminSession(request);
    if (authResponse) return sendResponse(nodeResponse, authResponse);

    let title = "Dashboard";
    let activePath = "/admin";
    let content = renderDashboardPage();

    if (url.pathname === "/admin/sources") {
      title = "Fontes";
      activePath = "/admin/sources";
      content = await renderSourcesPage();
    }

    const html = renderLayout({ title, activePath, content });

    return sendResponse(
      nodeResponse,
      new Response(html, {
        status: 200,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
      })
    );
  }

  if (method === "POST" && url.pathname === "/api/auth/login") {
    return sendResponse(nodeResponse, await authLoginPost(request));
  }

  if (method === "POST" && url.pathname === "/api/auth/logout") {
    return sendResponse(nodeResponse, await authLogoutPost(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/sources") {
    return sendResponse(nodeResponse, await adminSourcesGet(request));
  }
  if (method === "POST" && url.pathname === "/api/admin/sources") {
    return sendResponse(nodeResponse, await adminSourcesPost(request));
  }

  if (method === "POST" && url.pathname === "/api/admin/sources/test") {
    return sendResponse(nodeResponse, await adminSourcesTestPost(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/sync-runs") {
    return sendResponse(nodeResponse, await adminSyncRunsGet(request));
  }

  if (method === "GET" && url.pathname === "/api/admin/bookings") {
    return sendResponse(nodeResponse, await adminBookingsGet(request));
  }

  const adminSourcesIdMatch = url.pathname.match(/^\/api\/admin\/sources\/([^/]+)$/);
  if (adminSourcesIdMatch) {
    const id = adminSourcesIdMatch[1] ?? "";
    if (method === "PUT") {
      return sendResponse(nodeResponse, await adminSourcesIdPut(request, { params: { id } }));
    }
    if (method === "DELETE") {
      return sendResponse(nodeResponse, await adminSourcesIdDelete(request, { params: { id } }));
    }
  }

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

export function createHttpServer(): http.Server {
  return http.createServer((req, res) => {
    void handler(req, res);
  });
}
