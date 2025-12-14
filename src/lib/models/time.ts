export type DateInput = Date | string;

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function parseDateInput(input: DateInput): Date {
  if (input instanceof Date) {
    if (!isValidDate(input)) {
      throw new Error("Invalid Date input");
    }
    return input;
  }

  if (typeof input !== "string") {
    throw new Error("Invalid date input type");
  }

  const dateOnlyMatch = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const date = new Date(`${input}T00:00:00.000Z`);
    if (!isValidDate(date)) {
      throw new Error("Invalid date-only input");
    }
    return date;
  }

  const date = new Date(input);
  if (!isValidDate(date)) {
    throw new Error("Invalid date string input");
  }
  return date;
}

function isDateOnlyString(input: DateInput): input is string {
  return typeof input === "string" && /^(\d{4})-(\d{2})-(\d{2})$/.test(input);
}

export function toUtcISOString(input: DateInput): string {
  return parseDateInput(input).toISOString();
}

export type NormalizedDateRange = {
  start: string;
  end: string;
};

export function normalizeDateRange(
  startInput: DateInput,
  endInput: DateInput,
  isAllDay: boolean
): NormalizedDateRange {
  const start = parseDateInput(startInput);
  const end = parseDateInput(endInput);

  if (isDateOnlyString(startInput)) {
    start.setUTCHours(14, 0, 0, 0);
  }

  if (isDateOnlyString(endInput)) {
    end.setUTCHours(11, 0, 0, 0);
  }

  if (!(end.getTime() > start.getTime())) {
    throw new Error("Invalid date range: end must be after start");
  }

  return { start: start.toISOString(), end: end.toISOString() };
}
