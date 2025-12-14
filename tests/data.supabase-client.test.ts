import { beforeEach, describe, expect, it, vi } from "vitest";

const createClientMock = vi.fn(() => ({ __client: true }));

vi.mock("@supabase/supabase-js", () => {
  return { createClient: createClientMock };
});

describe("data/supabase", () => {
  beforeEach(() => {
    createClientMock.mockClear();
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon_key";
  });

  it("creates a singleton client using env vars", async () => {
    const mod = await import("../src/lib/data/supabase");
    const c1 = mod.getSupabaseClient();
    const c2 = mod.getSupabaseClient();

    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon_key"
    );
    expect(c1).toBe(c2);
  });

  it("throws if env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const mod = await import("../src/lib/data/supabase");
    expect(() => mod.getSupabaseClient()).toThrow(/SUPABASE_URL/i);
  });
});

