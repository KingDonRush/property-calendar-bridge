import { IcsParseError, parseIcs, type ParsedIcsEvent } from "./parse";

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

