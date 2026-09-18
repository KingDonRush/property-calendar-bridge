import { beforeEach, describe, expect, it, vi } from "vitest";

const getBookingsMock = vi.fn(async (_range: { rangeStart: string; rangeEnd: string }) => [
    {
        id: "bk-1",
        guest_name: "John Doe",
        property_id: "prop-1",
        start_date: "2025-01-10",
        end_date: "2025-01-15",
        status: "confirmed",
    },
]);

vi.mock("../src/lib/data/repositories", () => {
    return {
        listBookings: getBookingsMock,
    };
});

describe("ui/pages/bookings", () => {
    beforeEach(() => {
        getBookingsMock.mockClear();
        vi.resetModules();
    });

    it("renders the bookings table and defaults to current month", async () => {
        const { renderBookingsPage } = await import("../src/ui/pages/bookings");
        const params = new URLSearchParams();
        const html = await renderBookingsPage(params);

        expect(html).toContain("Reservas");
        expect(html).toContain("John Doe");
        expect(html).toContain("prop-1");
        expect(html).toContain("confirmed");

        expect(getBookingsMock).toHaveBeenCalled();
        const args = getBookingsMock.mock.calls[0][0];
        // Should default to current month (just checking it passed a range)
        expect(args.rangeStart).toBeDefined();
        expect(args.rangeEnd).toBeDefined();
    });

    it("respects explicit date range query params", async () => {
        const { renderBookingsPage } = await import("../src/ui/pages/bookings");
        const params = new URLSearchParams("start=2023-12-01&end=2023-12-31");
        await renderBookingsPage(params);

        const args = getBookingsMock.mock.calls[0][0];
        expect(args.rangeStart).toContain("2023-12-01");
        expect(args.rangeEnd).toContain("2023-12-31");
    });
});
