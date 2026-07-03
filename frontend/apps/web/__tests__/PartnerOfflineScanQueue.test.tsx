import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
      if (endpoint === "/partner/coupon-issues/scan") {
        return Promise.resolve({
          id: "issue-queued",
          code: "BOOKING-QR-OFFLINE",
          status: "ISSUED",
          statusLabel: "Issued",
          coupon: {
            id: "coupon-1",
            code: "WELCOME5",
            name: "Welcome 5",
            store: { id: "store-1", name: "Moonlight Bar", slug: "moonlight-bar" },
          },
        });
      }
      if (endpoint === "/partner/dashboard-lite") {
        return Promise.resolve({
          period: "seven",
          from: "2026-06-27T00:00:00.000Z",
          to: "2026-07-03T10:00:00.000Z",
          bookingCount: 0,
          profileViewCount: 0,
          customerArrivalCount: 0,
          customerArrivalSource: "QR_USED",
          qrUsedCount: 0,
          billApprovedCount: 0,
          storeCount: 0,
          stores: [],
          weeklyBookings: [],
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

type OfflineQueueItem = {
  payload: string;
  queuedAt: string;
  attempts: number;
  lastError: string | null;
};

const queueKey = "nightlife:offline-coupon-scans";

const setOnline = (online: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    value: online,
  });
};

const readQueue = () =>
  JSON.parse(window.localStorage.getItem(queueKey) ?? "[]") as OfflineQueueItem[];

describe("Partner offline scan queue", () => {
  beforeEach(() => {
    window.localStorage.clear();
    setOnline(true);
    vi.mocked(apiClient).mockClear();
  });

  afterEach(() => {
    setOnline(true);
    window.localStorage.clear();
  });

  it("queues signed QR payloads while offline and replays them with the offline flag", async () => {
    render(<PartnerPage />);

    fireEvent.click(screen.getByRole("button", { name: /MVP P0 Scan/i }));

    const scanInput = screen.getByPlaceholderText(/scanToken/i);
    setOnline(false);
    fireEvent.change(scanInput, { target: { value: "queued-token.signature" } });
    fireEvent.submit(scanInput.closest("form")!);

    await waitFor(() => {
      expect(readQueue()).toEqual([
        expect.objectContaining({
          payload: "queued-token.signature",
          attempts: 0,
          lastError: null,
        }),
      ]);
    });
    expect(screen.getByText("1 offline")).toBeTruthy();

    setOnline(true);
    fireEvent.click(screen.getByRole("button", { name: /Gửi offline/i }));

    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith("/partner/coupon-issues/scan", {
        data: {
          payload: "queued-token.signature",
          offline: true,
        },
      });
    });
    await waitFor(() => {
      expect(readQueue()).toEqual([]);
    });
  }, 15000);
});
