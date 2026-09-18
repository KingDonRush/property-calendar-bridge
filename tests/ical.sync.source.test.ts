import { beforeEach, describe, expect, it, vi } from "vitest";

const getSourceByIdMock = vi.fn();
const createSyncRunMock = vi.fn();
const updateSyncRunMock = vi.fn();
const getMappingByExternalIdMock = vi.fn();
const getBookingByIdMock = vi.fn();
const updateMappingMock = vi.fn();
const upsertBookingMock = vi.fn();
const createMappingMock = vi.fn();

vi.mock("../src/lib/data/repositories", () => {
  return {
    getSourceById: (...args: any[]) => getSourceByIdMock(...args),
    createSyncRun: (...args: any[]) => createSyncRunMock(...args),
    updateSyncRun: (...args: any[]) => updateSyncRunMock(...args),
    getMappingByExternalId: (...args: any[]) => getMappingByExternalIdMock(...args),
    getBookingById: (...args: any[]) => getBookingByIdMock(...args),
    updateMapping: (...args: any[]) => updateMappingMock(...args),
    upsertBooking: (...args: any[]) => upsertBookingMock(...args),
    createMapping: (...args: any[]) => createMappingMock(...args)
  };
});

describe("ical/sync syncSource", () => {
  beforeEach(() => {
    getSourceByIdMock.mockReset();
    createSyncRunMock.mockReset();
    updateSyncRunMock.mockReset();
    getMappingByExternalIdMock.mockReset();
    getBookingByIdMock.mockReset();
    updateMappingMock.mockReset();
    upsertBookingMock.mockReset();
    createMappingMock.mockReset();
  });

  it("creates a SyncRun, imports events, and finishes with success", async () => {
    getSourceByIdMock.mockResolvedValue({ id: "source-1", property_id: "p1", source_url: "https://example.com/calendar.ics" });
    createSyncRunMock.mockResolvedValue({ id: "run-1" });
    updateSyncRunMock.mockResolvedValue({ id: "run-1" });
    getMappingByExternalIdMock.mockResolvedValue(null);
    upsertBookingMock.mockResolvedValue({ id: "b1" });
    createMappingMock.mockResolvedValue({ id: "m1" });

    const fetchFn = vi.fn(async (..._args: unknown[]) => {
      const ics = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "BEGIN:VEVENT",
        "UID:ext-1",
        "DTSTART:20251210T150000Z",
        "DTEND:20251212T110000Z",
        "SUMMARY:Reservation",
        "END:VEVENT",
        "END:VCALENDAR"
      ].join("\n");
      return new Response(ics, { status: 200 });
    });

    const { syncSource } = await import("../src/lib/ical/sync");
    const result = await syncSource("source-1", { fetchFn });

    expect(createSyncRunMock).toHaveBeenCalledWith(expect.objectContaining({ channel_source_id: "source-1" }));
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(createMappingMock).toHaveBeenCalled();
    expect(updateSyncRunMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "success"
      })
    );
    expect(result.imported).toBe(1);
  });

  it("finishes SyncRun with failed on errors", async () => {
    getSourceByIdMock.mockResolvedValue({ id: "source-1", property_id: "p1", source_url: "https://example.com/calendar.ics" });
    createSyncRunMock.mockResolvedValue({ id: "run-1" });
    updateSyncRunMock.mockResolvedValue({ id: "run-1" });

    const fetchFn = vi.fn(async (..._args: unknown[]) => new Response("nope", { status: 500, statusText: "Server Error" }));

    const { syncSource } = await import("../src/lib/ical/sync");
    await expect(syncSource("source-1", { fetchFn })).rejects.toThrow();

    expect(updateSyncRunMock).toHaveBeenCalledWith(
      "run-1",
      expect.objectContaining({
        status: "failed"
      })
    );
  });
});

