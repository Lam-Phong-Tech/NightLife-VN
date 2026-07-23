import { describe, expect, it } from "vitest";

import { createContentSecurityPolicy, createSecurityHeaders } from "../next.config";

describe("security headers configuration", () => {
  it("sets the required production security headers", () => {
    const headers = new Map(createSecurityHeaders(true).map(({ key, value }) => [key, value]));

    expect(headers.get("Strict-Transport-Security")).toBe(
      "max-age=31536000; includeSubDomains; preload",
    );
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Content-Security-Policy")).toContain("frame-ancestors 'none'");
  });

  it("allows required integrations while blocking plugin objects", () => {
    const policy = createContentSecurityPolicy(true);

    expect(policy).toContain("https://accounts.google.com");
    expect(policy).toContain("https://www.youtube.com");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("upgrade-insecure-requests");
    expect(policy).not.toContain("'unsafe-eval'");
  });
});
