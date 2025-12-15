import { beforeEach, describe, expect, it, vi } from "vitest";

const getAllSourcesMock = vi.fn();
const getAllBookingsMock = vi.fn();
const getAllMappingsMock = vi.fn();

vi.mock("../src/lib/data/repositories", () => {
  return {
    getAllSources: (...args: any[]) => getAllSourcesMock(...args),
    getAllBookings: (...args: any[]) => getAllBookingsMock(...args),
    getAllMappings: (...args: any[]) => getAllMappingsMock(...args)
  };
});

describe("data/backup generateBackupJSON", () => {
  beforeEach(() => {
    getAllSourcesMock.mockReset();
    getAllBookingsMock.mockReset();
    getAllMappingsMock.mockReset();
    vi.resetModules();
  });

  it("returns versioned JSON containing system state", async () => {
    getAllSourcesMock.mockResolvedValue([{ id: "s1" }]);
    getAllBookingsMock.mockResolvedValue([{ id: "b1" }]);
    getAllMappingsMock.mockResolvedValue([{ id: "m1" }]);

    const { generateBackupJSON } = await import("../src/lib/data/backup");
    const json = await generateBackupJSON({ appVersion: "0.0.0-test", now: () => new Date("2025-01-01T00:00:00.000Z") });

    const parsed = JSON.parse(json);
    expect(parsed).toEqual(
      expect.objectContaining({
        meta: {
          schemaVersion: 1,
          appVersion: "0.0.0-test",
          createdAt: "2025-01-01T00:00:00.000Z"
        },
        data: {
          sources: [{ id: "s1" }],
          bookings: [{ id: "b1" }],
          mappings: [{ id: "m1" }]
        }
      })
    );
  });
});
