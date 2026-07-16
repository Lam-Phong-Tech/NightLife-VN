import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminConsole from "../src/app/admin/AdminConsole";
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
  usePathname: () => "/admin/campaign",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../src/components/providers/SocketProvider", () => ({
  useSocket: () => ({ socket: null }),
}));

vi.mock("../src/lib/auth/session", () => ({
  clearAuthSession: vi.fn(),
}));

vi.mock("../src/lib/api/admin-rankings", () => ({
  adminRankingsApi: {
    list: vi.fn().mockResolvedValue([]),
    options: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../src/lib/api/content", () => ({
  contentApi: {
    adminList: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock("../src/lib/api/bookings", () => ({
  bookingApi: {
    listAdminBookingChangeRequests: vi.fn().mockResolvedValue([]),
    getAdminCancelAnalytics: vi.fn().mockResolvedValue({
      meta: {
        from: "2026-07-01",
        to: "2026-07-31",
        days: 30,
        totalBookings: 0,
        cancelledBookings: 0,
        cancelRate: 0,
      },
      byStore: [],
      byCast: [],
      byChannel: [],
    }),
  },
}));

vi.mock("../src/lib/api/client", async () => {
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
      if (endpoint === "/admin/coupon-issues") {
        return Promise.resolve([
          {
            id: "issue-1",
            code: "BOOKING-QR-1",
            status: "ISSUED",
            statusLabel: "Issued",
            qrPayloadHash: "hash-booking-qr-123",
            discountPercent: 5,
            campaignSnapshot: {
              id: "coupon-1",
              code: "WELCOME5",
              name: "Welcome 5",
              storeId: "store-1",
            },
            auditLogs: [
              {
                id: "audit-1",
                action: "COUPON_ISSUE_BOOKING_QR_ISSUED",
                actorId: null,
                targetId: "issue-1",
                createdAt: "2026-07-03T10:00:00.000Z",
              },
            ],
            coupon: {
              id: "coupon-1",
              code: "WELCOME5",
              name: "Welcome 5",
              store: { id: "store-1", name: "Moonlight Bar", slug: "moonlight-bar" },
            },
          },
        ]);
      }

      if (endpoint === "/admin/coupon-issues/issue-1/rotate-qr") {
        return Promise.resolve({
          id: "issue-1",
          code: "BOOKING-QR-1",
          status: "ISSUED",
          statusLabel: "Issued",
          qrPayloadHash: "hash-booking-qr-rotated",
          discountPercent: 5,
          campaignSnapshot: {
            id: "coupon-1",
            code: "WELCOME5",
            name: "Welcome 5",
            storeId: "store-1",
          },
          auditLogs: [
            {
              id: "audit-rotate",
              action: "COUPON_QR_TOKEN_ROTATED",
              actorId: "admin-1",
              targetId: "issue-1",
              createdAt: "2026-07-03T10:10:00.000Z",
            },
          ],
          coupon: {
            id: "coupon-1",
            code: "WELCOME5",
            name: "Welcome 5",
            store: { id: "store-1", name: "Moonlight Bar", slug: "moonlight-bar" },
          },
        });
      }

      if (endpoint === "/admin/coupon-issues/issue-1/revoke-qr") {
        return Promise.resolve({
          id: "issue-1",
          code: "BOOKING-QR-1",
          status: "REVOKED",
          statusLabel: "Revoked",
          qrPayloadHash: "hash-booking-qr-rotated",
          revokedAt: "2026-07-03T10:15:00.000Z",
          discountPercent: 5,
          campaignSnapshot: {
            id: "coupon-1",
            code: "WELCOME5",
            name: "Welcome 5",
            storeId: "store-1",
          },
          auditLogs: [
            {
              id: "audit-revoke",
              action: "COUPON_QR_TOKEN_REVOKED",
              actorId: "admin-1",
              targetId: "issue-1",
              createdAt: "2026-07-03T10:15:00.000Z",
            },
          ],
          coupon: {
            id: "coupon-1",
            code: "WELCOME5",
            name: "Welcome 5",
            store: { id: "store-1", name: "Moonlight Bar", slug: "moonlight-bar" },
          },
        });
      }

      if (endpoint === "/partner/stores") return Promise.resolve([]);
      if (endpoint === "/partner/bookings") return Promise.resolve([]);
      if (endpoint === "/admin/sensitive-bills") return Promise.resolve([]);
      if (endpoint === "/admin/partner-requests") return Promise.resolve([]);

      return Promise.resolve([]);
    }),
  };
});

describe("Admin coupon issue detail", () => {
  it("shows qrPayloadHash, campaignSnapshot, auditLogs, REVOKED filter, and QR token actions", async () => {
    render(<AdminConsole section="campaign" />);

    const comboboxes = screen.getAllByRole("combobox");
    const statusFilter = (comboboxes.find((select) =>
      Array.from(select.querySelectorAll("option")).some((opt) => opt.value === "REVOKED")
    ) || comboboxes[0]) as HTMLElement | undefined;
    const statusOptions = statusFilter
      ? Array.from(statusFilter.querySelectorAll("option")).map((option) => option.value)
      : [];
    expect(statusOptions).toContain("REVOKED");
    expect(statusOptions).not.toContain("CANCELLED");

    await waitFor(() => {
      expect(screen.getByText("BOOKING-QR-1")).toBeTruthy();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /Chi tiết coupon issue BOOKING-QR-1/i,
      }),
    );

    expect(screen.getByTestId("admin-coupon-issue-detail-issue-1")).toBeTruthy();
    expect(screen.getByTestId("admin-coupon-lifecycle-metrics")).toBeTruthy();
    expect(screen.getByText("hash-booking-qr-123")).toBeTruthy();
    expect(screen.getAllByText("WELCOME5").length).toBeGreaterThan(0);
    expect(screen.getByText("COUPON_ISSUE_BOOKING_QR_ISSUED")).toBeTruthy();
    expect(apiClient).toHaveBeenCalledWith("/admin/coupon-issues");

    fireEvent.click(screen.getByRole("button", { name: /Rotate QR token BOOKING-QR-1/i }));
    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith("/admin/coupon-issues/issue-1/rotate-qr", {
        method: "POST",
      });
    });
    expect(screen.getByText("hash-booking-qr-rotated")).toBeTruthy();
    expect(screen.getByText("COUPON_QR_TOKEN_ROTATED")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /Revoke QR token BOOKING-QR-1/i }));
    await waitFor(() => {
      expect(apiClient).toHaveBeenCalledWith("/admin/coupon-issues/issue-1/revoke-qr", {
        method: "PATCH",
      });
    });
    expect(screen.getByText("COUPON_QR_TOKEN_REVOKED")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Export coupon QR lifecycle report/i })).toBeTruthy();
  });
});
