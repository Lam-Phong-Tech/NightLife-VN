import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PartnerPage from "../src/app/partner/page";
import { apiClient } from "../src/lib/api/client";

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../src/lib/auth/session", () => ({
  clearAuthSession: vi.fn(),
}));

vi.mock("../src/lib/api/client", () => {
  class ApiError extends Error {
    constructor(
      public status: number,
      message: string,
    ) {
      super(message);
      this.name = "ApiError";
    }
  }

  return {
    ApiError,
    apiClient: vi.fn((endpoint: string) => {
      if (endpoint === "/partner/stores") {
        return Promise.resolve([
          {
            id: "store-1",
            name: "Moonlight Bar",
            slug: "moonlight-bar",
            status: "ACTIVE",
          },
        ]);
      }
      if (endpoint === "/partner/coupons") {
        return Promise.resolve([
          {
            id: "coupon-1",
            code: "WELCOME5",
            name: "Welcome 5",
            status: "ACTIVE",
            usedCount: 8,
            usageLimit: null,
          },
        ]);
      }
      if (endpoint === "/partner/bills") {
        return Promise.resolve([]);
      }
      if (endpoint.startsWith("/partner/dashboard-lite")) {
        return Promise.resolve({
          period: "seven",
          from: "2026-06-27T00:00:00.000Z",
          to: "2026-07-03T10:00:00.000Z",
          bookingCount: 17,
          profileViewCount: 321,
          customerArrivalCount: 11,
          customerArrivalSource: "QR_USED",
          qrUsedCount: 11,
          billApprovedCount: 6,
          storeCount: 1,
          stores: [
            {
              id: "store-1",
              name: "Moonlight Bar",
              slug: "moonlight-bar",
              bookingCount: 17,
              profileViewCount: 321,
              customerArrivalCount: 11,
            },
          ],
          weeklyBookings: [
            { label: "T2", date: "2026-06-29", count: 1 },
            { label: "T3", date: "2026-06-30", count: 2 },
            { label: "T4", date: "2026-07-01", count: 3 },
            { label: "T5", date: "2026-07-02", count: 4 },
            { label: "T6", date: "2026-07-03", count: 7 },
            { label: "T7", date: "2026-07-04", count: 0 },
            { label: "CN", date: "2026-07-05", count: 0 },
          ],
          privacy: {
            customerDetailVisible: false,
            note: "Partner dashboard returns aggregate metrics only.",
          },
        });
      }

      return Promise.resolve([]);
    }),
  };
});

describe("Partner lite dashboard", () => {
  beforeEach(() => {
    vi.mocked(apiClient).mockClear();
  });

  it("renders aggregate-only partner metrics without loading detailed bookings", async () => {
    render(<PartnerPage />);

    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(expect.stringContaining("/partner/dashboard-lite"));
    });

    expect(apiClient).not.toHaveBeenCalledWith("/partner/bookings");

    fireEvent.click(screen.getByRole("button", { name: /Tổng quan/i }));

    await waitFor(() => {
      expect(screen.getAllByText("17").length).toBeGreaterThan(0);
      expect(screen.getAllByText("321").length).toBeGreaterThan(0);
      expect(screen.getAllByText("11").length).toBeGreaterThan(0);
    });
    expect(screen.getByText(/Partner dashboard returns aggregate metrics only/i)).toBeTruthy();
    expect(screen.getByText(/Source: QR used\. Stores: 1\./i)).toBeTruthy();
    expect(screen.queryByText(/customer@example\.com/i)).toBeNull();
    expect(screen.queryByText(/0901234567/)).toBeNull();
  }, 15000);
});
