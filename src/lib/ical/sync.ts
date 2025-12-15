import { createHash } from "node:crypto";

import { IcsParseError, parseIcs, type ParsedIcsEvent } from "./parse";
import { BookingStatus, type Booking } from "../models/types";

export type FetchAndParseIcsOptions = {
  timeoutMs?: number;
  fetchFn?: typeof fetch;
};

export class FetchIcsError extends Error {
  cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "FetchIcsError";
    this.cause = cause;
  }
}

export function bookingHash(booking: Pick<Booking, "uid" | "start_date" | "end_date" | "status">): string {
  const payload = `${booking.uid}|${booking.start_date}|${booking.end_date}|${booking.status}`;
  return createHash("sha256").update(payload).digest("hex");
}

export type ExternalBookingMapping = {
  bookingUid: string;
  lastHash?: string | null;
};

export type ReconcileDecision =
  | { action: "skip"; reason: "no_change" | "protected_local" }
  | { action: "update"; bookingUid: string; booking: Pick<Booking, "uid" | "start_date" | "end_date" | "status"> }
  | {
      action: "create";
      bookingUid: string;
      booking: Pick<Booking, "uid" | "start_date" | "end_date" | "status">;
      mapping: { externalUid: string; bookingUid: string; hash: string };
    };

export function reconcileExternalBooking(args: {
  incoming: Pick<Booking, "uid" | "start_date" | "end_date" | "status">;
  existingBooking?: Pick<Booking, "uid" | "start_date" | "end_date" | "status"> | null;
  existingMapping?: ExternalBookingMapping | null;
}): ReconcileDecision {
  const incomingHash = bookingHash(args.incoming);

  if (args.existingMapping && args.existingMapping.lastHash === incomingHash) {
    return { action: "skip", reason: "no_change" };
  }

  if (args.existingMapping) {
    return { action: "update", bookingUid: args.existingMapping.bookingUid, booking: args.incoming };
  }

  if (
    args.existingBooking &&
    args.existingBooking.uid === args.incoming.uid &&
    args.existingBooking.status === BookingStatus.Blocked
  ) {
    return { action: "skip", reason: "protected_local" };
  }

  if (args.existingBooking && args.existingBooking.uid === args.incoming.uid) {
    return { action: "update", bookingUid: args.existingBooking.uid, booking: args.incoming };
  }

  return {
    action: "create",
    bookingUid: args.incoming.uid,
    booking: args.incoming,
    mapping: { externalUid: args.incoming.uid, bookingUid: args.incoming.uid, hash: incomingHash }
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export async function fetchAndParseIcs(url: string, options: FetchAndParseIcsOptions = {}): Promise<ParsedIcsEvent[]> {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const fetchFn = options.fetchFn ?? globalThis.fetch;
  if (!fetchFn) {
    throw new FetchIcsError("fetch is not available in this environment");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchFn(url, { signal: controller.signal });
    if (!response.ok) {
      throw new FetchIcsError(`Failed to fetch ICS: ${response.status} ${response.statusText}`);
    }

    const ics = await response.text();
    return parseIcs(ics);
  } catch (error) {
    if (controller.signal.aborted || isAbortError(error)) {
      throw new FetchIcsError("Fetch timeout", error);
    }
    if (error instanceof FetchIcsError || error instanceof IcsParseError) {
      throw error;
    }
    throw new FetchIcsError("Failed to fetch ICS", error);
  } finally {
    clearTimeout(timeoutId);
  }
}
