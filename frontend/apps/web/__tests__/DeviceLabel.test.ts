import { describe, expect, it } from "vitest";

import { formatDeviceLabel, unknownDeviceLabel } from "@/lib/auth/device-label";

describe("formatDeviceLabel", () => {
  it("labels Chrome on Windows", () => {
    expect(
      formatDeviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      ),
    ).toBe("Chrome trên Windows");
  });

  it("does not mistake Edge for Chrome", () => {
    expect(
      formatDeviceLabel(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
      ),
    ).toBe("Edge trên Windows");
  });

  it("labels Safari on iOS before matching macOS", () => {
    expect(
      formatDeviceLabel(
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
      ),
    ).toBe("Safari trên iOS");
  });

  it("labels Firefox on macOS", () => {
    expect(
      formatDeviceLabel(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:128.0) Gecko/20100101 Firefox/128.0",
      ),
    ).toBe("Firefox trên macOS");
  });

  it("falls back for empty user agents", () => {
    expect(formatDeviceLabel(null)).toBe(unknownDeviceLabel);
    expect(formatDeviceLabel("   ")).toBe(unknownDeviceLabel);
  });
});
