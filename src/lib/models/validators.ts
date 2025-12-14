import type { Booking, ChannelSource } from "./types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function assertValidIsoDateTime(value: unknown, fieldName: string): asserts value is string {
  if (!isNonEmptyString(value)) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date string`);
  }
}

function assertValidUrl(value: unknown, fieldName: string): asserts value is string {
  if (!isNonEmptyString(value)) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${fieldName} must be a valid URL`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${fieldName} must be http(s) URL`);
  }
}

export function validateBooking(input: Booking): Booking {
  if (!isNonEmptyString(input.uid)) {
    throw new Error("uid must be a non-empty string");
  }

  assertValidIsoDateTime(input.start_date, "start_date");
  assertValidIsoDateTime(input.end_date, "end_date");

  const start = new Date(input.start_date);
  const end = new Date(input.end_date);
  if (!(end.getTime() > start.getTime())) {
    throw new Error("end_date must be after start_date");
  }

  return input;
}

export function validateChannelSource(input: ChannelSource): ChannelSource {
  if (!isNonEmptyString(input.id)) {
    throw new Error("id must be a non-empty string");
  }
  if (!isNonEmptyString(input.property_id)) {
    throw new Error("property_id must be a non-empty string");
  }

  assertValidUrl(input.url, "url");
  return input;
}

