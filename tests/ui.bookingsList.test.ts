import { beforeEach, describe, expect, it, vi } from "vitest";

const listBookingsMock = vi.fn(async (..._args: unknown[]) => [
  {
    id: "b1",
    property_id: "p1",
    guest_name: "Alice",
    start_date: "2025-01-10T14:00:00.000Z",
    end_date: "2025-01-12T11:00:00.000Z",
    status: "confirmed",
    ignored_field: "x",
  },
]);

vi.mock("../src/lib/data/repositories", () => {
  return {
    listBookings: (...args: any[]) => listBookingsMock(...args),
  };
});

describe("ui bookings service", () => {
  beforeEach(() => {
    listBookingsMock.mockClear();
    vi.resetModules();
  });

  it("normalizes bookings output", async () => {
    const { getBookings } = await import("../src/lib/ui/bookings");
    const bookings = await getBookings({ rangeStart: "2025-01-01", rangeEnd: "2025-02-01" });

    expect(bookings).toHaveLength(1);
    expect(bookings[0]).toEqual({
      id: "b1",
      propertyId: "p1",
      guestName: "Alice",
      startDate: "2025-01-10T14:00:00.000Z",
      endDate: "2025-01-12T11:00:00.000Z",
      status: "confirmed",
    });
  });

  it("returns empty on repository failure", async () => {
    listBookingsMock.mockRejectedValueOnce(new Error("boom"));
    const { getBookings } = await import("../src/lib/ui/bookings");
    const bookings = await getBookings({ rangeStart: "2025-01-01", rangeEnd: "2025-02-01" });
    expect(bookings).toEqual([]);
  });
});

