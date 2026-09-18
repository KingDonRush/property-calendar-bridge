import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const listAuditLogsMock = vi.fn(async (..._args: unknown[]) => [{ id: "a1" }]);

vi.mock("../src/lib/audit/service", () => {
  return {
    listAuditLogs: (...args: any[]) => listAuditLogsMock(...args),
  };
});

const generateBackupJSONMock = vi.fn(async (..._args: unknown[]) => "{\"ok\":true}");
vi.mock("../src/lib/data/backup", async (importOriginal) => {
  const original = (await importOriginal()) as any;
  return {
    ...original,
    generateBackupJSON: (...args: any[]) => generateBackupJSONMock(...args),
  };
});

function setRequiredEnv(): void {
  process.env.SUPABASE_URL = "https://example.supabase.co";
  process.env.SUPABASE_KEY = "key";
  process.env.ICAL_MASTER_SECRET = "ical";
  process.env.CRON_SECRET_TOKEN = "token";
  process.env.ADMIN_UI_TOKEN = "admin";
}

describe("integration: admin audit + backup endpoints", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    listAuditLogsMock.mockClear();
    generateBackupJSONMock.mockClear();
    vi.resetModules();
    setRequiredEnv();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  async function withServer<T>(fn: (baseUrl: string) => Promise<T>): Promise<T> {
    const { createHttpServer } = await import("../src/httpServer");
    const server = createHttpServer();
    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const baseUrl = `http://localhost:${port}`;

    try {
      return await fn(baseUrl);
    } finally {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  }

  async function loginAndGetCookie(baseUrl: string): Promise<string> {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: "token=admin",
    });
    expect(response.status).toBe(302);
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toContain("admin_session=");
    return setCookie;
  }

  it("blocks unauthenticated access with 401", async () => {
    await withServer(async (baseUrl) => {
      expect((await fetch(`${baseUrl}/api/admin/audit`)).status).toBe(401);
      expect((await fetch(`${baseUrl}/api/admin/backup/export`)).status).toBe(401);
      expect(
        (
          await fetch(`${baseUrl}/api/admin/backup/validate`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: "{}",
          })
        ).status
      ).toBe(401);
    });
  });

  it("allows authenticated access and supports backup export/validate", async () => {
    await withServer(async (baseUrl) => {
      const cookie = await loginAndGetCookie(baseUrl);

      const auditResponse = await fetch(`${baseUrl}/api/admin/audit`, { headers: { cookie } });
      expect(auditResponse.status).toBe(200);
      expect(await auditResponse.json()).toEqual({ auditLogs: [{ id: "a1" }] });
      expect(listAuditLogsMock).toHaveBeenCalledTimes(1);

      const exportResponse = await fetch(`${baseUrl}/api/admin/backup/export`, { headers: { cookie } });
      expect(exportResponse.status).toBe(200);
      expect(exportResponse.headers.get("content-disposition")).toContain("attachment");
      expect(await exportResponse.text()).toBe("{\"ok\":true}");

      const validBackup = {
        meta: { schemaVersion: 1, appVersion: "0.0.0", createdAt: "2025-01-01T00:00:00.000Z" },
        data: { sources: [], bookings: [], mappings: [] },
      };

      const validateOk = await fetch(`${baseUrl}/api/admin/backup/validate`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify(validBackup),
      });
      expect(validateOk.status).toBe(200);
      expect(await validateOk.json()).toEqual({ valid: true });

      const validateBad = await fetch(`${baseUrl}/api/admin/backup/validate`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie },
        body: JSON.stringify({ meta: { schemaVersion: 999 }, data: {} }),
      });
      expect(validateBad.status).toBe(400);
    });
  });
});

