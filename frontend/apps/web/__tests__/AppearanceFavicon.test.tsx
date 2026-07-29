import React from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppearanceFavicon } from "@/components/seo/AppearanceFavicon";

const { getAppearanceConfigMock, getCachedAppearanceConfigMock } = vi.hoisted(() => ({
  getAppearanceConfigMock: vi.fn(),
  getCachedAppearanceConfigMock: vi.fn(),
}));

vi.mock("@/lib/api/appearance", () => ({
  getAppearanceConfig: getAppearanceConfigMock,
  getCachedAppearanceConfig: getCachedAppearanceConfigMock,
}));

vi.mock("@/lib/api/client", () => ({
  resolveClientUrl: (url?: string) => url,
}));

describe("AppearanceFavicon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.head.innerHTML = '<link rel="icon" href="/favicon.svg" type="image/svg+xml">';
    getCachedAppearanceConfigMock.mockReturnValue(null);
  });

  afterEach(() => {
    cleanup();
    document.head.innerHTML = "";
  });

  it("applies the configured favicon returned by the public appearance API", async () => {
    getAppearanceConfigMock.mockResolvedValue({
      brand: { faviconUrl: "/storage/appearance/custom.png" },
    });

    render(<AppearanceFavicon />);

    await waitFor(() => {
      const link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      expect(link?.getAttribute("href")).toBe("/storage/appearance/custom.png");
      expect(link?.type).toBe("image/png");
    });
  });

  it("falls back to the bundled favicon when no custom file is configured", async () => {
    getAppearanceConfigMock.mockResolvedValue({
      brand: { faviconUrl: "" },
    });

    render(<AppearanceFavicon />);

    await waitFor(() => {
      const link = document.head.querySelector<HTMLLinkElement>('link[rel="icon"]');
      expect(link?.getAttribute("href")).toBe("/favicon.svg");
      expect(link?.type).toBe("image/svg+xml");
    });
  });
});
