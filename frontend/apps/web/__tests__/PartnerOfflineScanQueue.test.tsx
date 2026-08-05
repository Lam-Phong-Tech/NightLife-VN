import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PartnerScanClient from "../src/app/partner/scan/PartnerScanClient";
import { PartnerProviders } from "../src/app/partner/PartnerProviders";
import { SystemFeedbackProvider } from "../src/components/ui/SystemFeedback";
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
  usePathname: () => "/partner/scan",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock("../src/lib/auth/session", () => ({
  clearAuthSession: vi.fn(),
  getAuthUser: () => ({ role: "PARTNER", displayName: "Partner Manager" }),
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
          { id: "store-1", name: "Moonlight Bar", slug: "moonlight-bar", status: "ACTIVE" },
        ]);
      }
      if (endpoint === "/partner/coupon-issues/scan") {
        return Promise.resolve({
          scanType: "COUPON_ISSUE",
          id: "issue-queued",
          code: "BOOKING-QR-OFFLINE",
          title: "Welcome 5",
          status: "ISSUED",
          statusLabel: "Issued",
        });
      }
      if (endpoint === "/partner/booking-qrs/scan") {
        return Promise.resolve({
          scanType: "BOOKING_QR",
          id: "booking-1",
          code: "BK-BOOKING",
          title: "Booking hợp lệ",
          status: "ISSUED",
          statusLabel: "Booking hợp lệ",
        });
      }
      return Promise.resolve([]);
    }),
  };
});

type OfflineQueueItem = {
  id: string;
  scannedAt: string;
  payload: string;
  storeId: string;
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

  it("queues signed QR payloads while offline and replays them with sync action", async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerScanClient />
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    const scanInput = screen.getByPlaceholderText(/Dán link QR hoặc nhập mã code/i);
    setOnline(false);
    fireEvent.change(scanInput, { target: { value: "queued-token.signature" } });
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(readQueue()).toEqual([
        expect.objectContaining({
          payload: "queued-token.signature",
        }),
      ]);
    });
    expect(screen.getByText(/Có 1 mã đã quét offline chưa đồng bộ/i)).toBeInTheDocument();

    setOnline(true);
    fireEvent.click(screen.getByRole("button", { name: /Đồng bộ ngay/i }));

    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith(expect.stringMatching(/\/partner\/(booking-qrs|coupon-issues)\/scan/), expect.objectContaining({
        method: "POST",
        data: expect.objectContaining({
          token: "queued-token.signature",
        }),
      }));
    });
    await waitFor(() => {
      expect(readQueue()).toEqual([]);
    });
  }, 15000);

  it("routes booking QR payloads to the partner booking QR scanner", async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerScanClient />
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    const bookingPayload =
      "NLBOOKING|550e8400-e29b-41d4-a716-446655440000|BK-550E8400|moonlight-bar|2026-07-04T14:00:00.000Z";
    const scanInput = screen.getByPlaceholderText(/Dán link QR hoặc nhập mã code/i);
    fireEvent.change(scanInput, { target: { value: bookingPayload } });
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith("/partner/booking-qrs/scan", expect.objectContaining({
        method: "POST",
        data: expect.objectContaining({
          token: bookingPayload,
        }),
      }));
    });
  }, 15000);

  it("scans booking orders and displays results", async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerProviders>
          <PartnerScanClient />
        </PartnerProviders>
      </SystemFeedbackProvider>,
    );

    const bookingPayload =
      "NLBOOKING|550e8400-e29b-41d4-a716-446655440000|BK-550E8400|moonlight-bar|2026-07-04T14:00:00.000Z";
    const scanInput = screen.getByPlaceholderText(/Dán link QR hoặc nhập mã code/i);
    fireEvent.change(scanInput, { target: { value: bookingPayload } });
    fireEvent.click(screen.getByRole("button", { name: /Kiểm tra/i }));

    await waitFor(() => {
      expect(screen.getAllByText("Booking hợp lệ").length).toBeGreaterThan(0);
    });
  }, 15000);
});
