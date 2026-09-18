import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertBookingMock = vi.fn();
const createMappingMock = vi.fn();

vi.mock("../src/lib/data/repositories", () => {
  return {
    upsertBooking: (...args: any[]) => upsertBookingMock(...args),
    createMapping: (...args: any[]) => createMappingMock(...args)
  };
});

describe("ical/sync persistence", () => {
  beforeEach(() => {
    upsertBookingMock.mockReset();
    createMappingMock.mockReset();
  });

  it("upserts booking and creates mapping for new external bookings", async () => {
    upsertBookingMock.mockResolvedValue({ id: "b1" });
    createMappingMock.mockResolvedValue({ id: "m1" });

    const { persistDecision, importedBookingId } = await import("../src/lib/ical/sync");

    await persistDecision("source-1", {
      action: "create",
      bookingUid: "local-uid",
      booking: {
        uid: "ext-1",
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-01-02T00:00:00.000Z",
        status: "confirmed"
      } as any,
      mapping: { externalUid: "ext-1", bookingUid: "local-uid", hash: "h1" }
    }, "p1");

    expect(upsertBookingMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: importedBookingId("source-1", "ext-1"), property_id: "p1"
      })
    );
    expect(createMappingMock).toHaveBeenCalledWith(
      expect.objectContaining({
        booking_id: importedBookingId("source-1", "ext-1"),
        channel_source_id: "source-1",
        external_uid: "ext-1"
      })
    );
  });

  it("upserts booking without creating mapping for updates", async () => {
    upsertBookingMock.mockResolvedValue({ id: "b1" });
    createMappingMock.mockResolvedValue({ id: "m1" });

    const { persistDecision, importedBookingId } = await import("../src/lib/ical/sync");

    await persistDecision("source-1", {
      action: "update",
      bookingUid: "b1",
      booking: {
        uid: "ext-1",
        start_date: "2025-01-01T00:00:00.000Z",
        end_date: "2025-01-02T00:00:00.000Z",
        status: "confirmed"
      } as any
    }, "p1");

    expect(upsertBookingMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "b1"
      })
    );
    expect(createMappingMock).not.toHaveBeenCalled();
  });

  it("does nothing for skipped decisions", async () => {
    const { persistDecision, importedBookingId } = await import("../src/lib/ical/sync");

    await persistDecision("source-1", { action: "skip", reason: "no_change" }, "p1");

    expect(upsertBookingMock).not.toHaveBeenCalled();
    expect(createMappingMock).not.toHaveBeenCalled();
  });
});
