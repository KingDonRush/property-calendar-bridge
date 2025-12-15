import { describe, expect, it } from "vitest";

import { HTTP_STATUS } from "../src/lib/constants";

describe("lib/constants", () => {
  it("exposes common HTTP status codes", () => {
    expect(HTTP_STATUS.OK).toBe(200);
    expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
    expect(HTTP_STATUS.FORBIDDEN).toBe(403);
    expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
  });
});

