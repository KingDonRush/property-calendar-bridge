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

describe("data/backup fetchAllSystemState", () => {
  beforeEach(() => {
    getAllSourcesMock.mockReset();
    getAllBookingsMock.mockReset();
    getAllMappingsMock.mockReset();
    vi.resetModules();
  });

  it("aggregates sources, bookings, and mappings", async () => {
    getAllSourcesMock.mockResolvedValue([{ id: "s1" }]);
    getAllBookingsMock.mockResolvedValue([{ id: "b1" }]);
    getAllMappingsMock.mockResolvedValue([{ id: "m1" }]);

    const { fetchAllSystemState } = await import("../src/lib/data/backup");
    const state = await fetchAllSystemState();

    expect(getAllSourcesMock).toHaveBeenCalledOnce();
    expect(getAllBookingsMock).toHaveBeenCalledOnce();
    expect(getAllMappingsMock).toHaveBeenCalledOnce();
    expect(state).toEqual({
      sources: [{ id: "s1" }],
      bookings: [{ id: "b1" }],
      mappings: [{ id: "m1" }]
    });
  });
});

