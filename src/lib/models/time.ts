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

export function toUtcISOString(input: DateInput): string {
  return parseDateInput(input).toISOString();
}

