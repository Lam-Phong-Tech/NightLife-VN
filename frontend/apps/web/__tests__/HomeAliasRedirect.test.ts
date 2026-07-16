import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

describe("home alias redirects", () => {
  it("redirects only /v back to the homepage", async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          source: "/v",
          destination: "/",
          permanent: false,
        }),
      ]),
    );
    expect(redirects?.some((rule) => rule.source === "/v/:path*")).toBe(false);
  });
});
