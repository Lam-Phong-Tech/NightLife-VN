import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminConsole from "./AdminConsole";

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  rankingList: vi.fn(),
  rankingOptions: vi.fn(),
  rankingCreate: vi.fn(),
  rankingUpdate: vi.fn(),
  rankingDelete: vi.fn(),
  contentAdminList: vi.fn(),
  contentAdminCreate: vi.fn(),
  contentAdminUpdate: vi.fn(),
  contentAdminDelete: vi.fn(),
  bookingChangeRequests: vi.fn(),
  cancelAnalytics: vi.fn(),
  clearAuthSession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/campaign",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/components/providers/SocketProvider", () => ({
  useSocket: () => ({ socket: null, isConnected: false }),
}));

vi.mock("@/lib/api/client", () => {
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
    apiClient: mocks.apiClient,
  };
});

vi.mock("@/lib/api/admin-rankings", () => ({
  adminRankingsApi: {
    list: mocks.rankingList,
    options: mocks.rankingOptions,
    create: mocks.rankingCreate,
    update: mocks.rankingUpdate,
    delete: mocks.rankingDelete,
  },
}));

vi.mock("@/lib/api/content", () => ({
  contentApi: {
    adminList: mocks.contentAdminList,
    adminCreate: mocks.contentAdminCreate,
    adminUpdate: mocks.contentAdminUpdate,
    adminDelete: mocks.contentAdminDelete,
  },
}));

vi.mock("@/lib/api/bookings", () => ({
  bookingApi: {
    listAdminBookingChangeRequests: mocks.bookingChangeRequests,
    getAdminCancelAnalytics: mocks.cancelAnalytics,
  },
  canCancelBooking: () => true,
}));

vi.mock("@/lib/auth/session", () => ({
  clearAuthSession: mocks.clearAuthSession,
}));

const couponIssues = [
  {
    id: "issue-issued",
    code: "MEMBER-issued",
    status: "ISSUED",
    statusLabel: "Dang giu cho",
    qrPayloadHash: "hash-issued-1",
    discountPercent: 8,
    discountRuleSnapshot: { discountPercent: 8, userType: "MEMBER" },
    campaignSnapshot: {
      id: "coupon-1",
      code: "MEMBER8",
      name: "Member 8",
      storeId: "store-1",
    },
    auditLogs: [
      {
        id: "audit-1",
        action: "COUPON_ISSUE_SCANNED",
        actorId: "partner-1",
        targetId: "issue-issued",
        metadata: { source: "signed_qr" },
        createdAt: "2026-07-02T10:05:00.000Z",
        actor: { id: "partner-1", displayName: "Partner Staff", role: "PARTNER" },
      },
    ],
    expiresAt: "2026-07-03T10:00:00.000Z",
    userType: "MEMBER",
    user: { id: "user-1", displayName: "Member QA", tier: "FREE" },
    guest: null,
    coupon: {
      id: "coupon-1",
      code: "MEMBER8",
      name: "Member 8",
      store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
    },
  },
  {
    id: "issue-used",
    code: "MEMBER-used",
    status: "USED",
    statusLabel: "Da su dung",
    discountPercent: 8,
    expiresAt: "2026-07-03T10:00:00.000Z",
    usedAt: "2026-07-02T10:00:00.000Z",
    userType: "MEMBER",
    user: { id: "user-2", displayName: "Used QA", tier: "FREE" },
    guest: null,
    coupon: {
      id: "coupon-1",
      code: "MEMBER8",
      name: "Member 8",
      store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
    },
  },
  {
    id: "issue-expired",
    code: "MEMBER-expired",
    status: "EXPIRED",
    statusLabel: "Het han",
    discountPercent: 8,
    expiresAt: "2026-07-01T10:00:00.000Z",
    userType: "MEMBER",
    user: { id: "user-3", displayName: "Expired QA", tier: "FREE" },
    guest: null,
    coupon: {
      id: "coupon-1",
      code: "MEMBER8",
      name: "Member 8",
      store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
    },
  },
];

const sensitiveBills = [
  {
    id: "bill-1",
    billNumber: "BILL-20260701-ABC12345",
    status: "SUBMITTED",
    totalVnd: 1800000,
    paidVnd: 1800000,
    commissionAmountVnd: 180000,
    pointsEarned: 180,
    submittedAt: "2026-07-01T10:00:00.000Z",
    usedAt: "2026-06-30T14:00:00.000Z",
    store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
    booking: null,
    coupon: { id: "coupon-1", code: "MEMBER8", name: "Member 8" },
    couponIssue: { id: "issue-used", code: "MEMBER-used", status: "USED" },
    user: { email: "member@example.com", displayName: "Member QA", phone: "+84901234567" },
    guest: null,
  },
];

describe("AdminConsole coupon issue panel", () => {
  beforeEach(() => {
    mocks.apiClient.mockImplementation(async (path: string) => {
      if (path === "/partner/stores") return [];
      if (path === "/partner/bookings") return [];
      if (path === "/admin/sensitive-bills") return [];
      if (path === "/partner/bills") return [];
      if (path === "/admin/partner-requests") return [];
      if (path === "/admin/coupon-issues") return couponIssues;
      return [];
    });
    mocks.rankingList.mockResolvedValue([]);
    mocks.rankingOptions.mockResolvedValue([]);
    mocks.contentAdminList.mockResolvedValue([]);
    mocks.bookingChangeRequests.mockResolvedValue([]);
    mocks.cancelAnalytics.mockResolvedValue({
      meta: {
        from: "2026-06-02",
        to: "2026-07-02",
        days: 30,
        totalBookings: 0,
        cancelledBookings: 0,
        cancelRate: 0,
      },
      byStore: [],
      byCast: [],
      byChannel: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("sends booking, coupon, and coupon issue filters to the sensitive bill endpoint", async () => {
    mocks.apiClient.mockImplementation(async (path: string) => {
      if (path === "/partner/stores") return [];
      if (path === "/partner/bookings") return [];
      if (path === "/admin/sensitive-bills") return sensitiveBills;
      if (path === "/partner/bills") return sensitiveBills;
      if (path === "/admin/partner-requests") return [];
      if (path === "/admin/coupon-issues") return couponIssues;
      return [];
    });

    render(<AdminConsole section="bill" />);

    const panel = await screen.findByTestId("admin-sensitive-bills-panel");
    await within(panel).findByText("BILL-20260701-ABC12345");
    expect(within(panel).getByText(/booking/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Booking ID filter"), { target: { value: "booking-1" } });
    fireEvent.change(screen.getByLabelText("Coupon ID filter"), { target: { value: "coupon-1" } });
    fireEvent.change(screen.getByLabelText("Coupon issue ID filter"), { target: { value: "issue-used" } });
    fireEvent.click(screen.getByLabelText("Apply bill relation filters"));

    await waitFor(() => {
      expect(mocks.apiClient).toHaveBeenCalledWith(
        "/admin/sensitive-bills",
        expect.objectContaining({
          params: {
            bookingId: "booking-1",
            couponId: "coupon-1",
            couponIssueId: "issue-used",
          },
        }),
      );
    });
  });

  it("filters coupon issues by ISSUED, USED, and EXPIRED statuses", async () => {
    render(<AdminConsole section="campaign" />);

    const panel = await screen.findByTestId("admin-coupon-issues-panel");
    await within(panel).findByText("MEMBER-issued");

    const statusFilter = within(panel).getByRole("combobox");
    const statusValues = Array.from(statusFilter.querySelectorAll("option")).map((option) => option.value);
    expect(statusValues).toContain("REVOKED");
    expect(statusValues).not.toContain("CANCELLED");

    await userEvent.click(within(panel).getByLabelText("Chi tiết coupon issue MEMBER-issued"));
    const detail = within(panel).getByTestId("admin-coupon-issue-detail-issue-issued");
    expect(detail).toHaveTextContent("hash-issued-1");
    expect(detail).toHaveTextContent("MEMBER8");
    expect(detail).toHaveTextContent("COUPON_ISSUE_SCANNED");

    await userEvent.selectOptions(statusFilter, "USED");
    expect(statusFilter).toHaveValue("USED");
    await waitFor(() => {
      expect(within(panel).getByText("MEMBER-used")).toBeInTheDocument();
      expect(within(panel).queryByText("MEMBER-issued")).not.toBeInTheDocument();
      expect(within(panel).queryByText("MEMBER-expired")).not.toBeInTheDocument();
    });

    await userEvent.selectOptions(statusFilter, "EXPIRED");
    expect(statusFilter).toHaveValue("EXPIRED");
    await waitFor(() => {
      expect(within(panel).getByText("MEMBER-expired")).toBeInTheDocument();
      expect(within(panel).queryByText("MEMBER-issued")).not.toBeInTheDocument();
      expect(within(panel).queryByText("MEMBER-used")).not.toBeInTheDocument();
    });

    await userEvent.selectOptions(statusFilter, "ISSUED");
    expect(statusFilter).toHaveValue("ISSUED");
    await waitFor(() => {
      expect(within(panel).getByText("MEMBER-issued")).toBeInTheDocument();
      expect(within(panel).queryByText("MEMBER-used")).not.toBeInTheDocument();
      expect(within(panel).queryByText("MEMBER-expired")).not.toBeInTheDocument();
    });
  });
});
