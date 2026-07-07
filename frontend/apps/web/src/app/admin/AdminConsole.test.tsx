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
    submitterType: "PARTNER",
    subtotalVnd: 2000000,
    discountVnd: 160000,
    serviceChargeVnd: 100000,
    taxVnd: 50000,
    grossRevenueVnd: 2000000,
    netRevenueVnd: 1840000,
    payableVnd: 1990000,
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
    media: [{ id: "media-1", storageKey: "bill.png", originalName: "bill.png", mimeType: "image/png", access: "PROTECTED", url: "/storage/files/bill.png" }],
    fraudWarnings: [{ code: "POSSIBLE_DUPLICATE_BILL", severity: "HIGH", message: "Có bill nghi trùng." }],
    user: { email: "member@example.com", displayName: "Member QA", phone: "+84901234567" },
    guest: null,
  },
];

const partnerBills = [
  ...sensitiveBills,
  {
    id: "bill-verified-1",
    billNumber: "BILL-20260701-VERIFIED",
    status: "VERIFIED",
    totalVnd: 1800000,
    paidVnd: 1800000,
    commissionAmountVnd: 180000,
    pointsEarned: 18,
    submittedAt: "2026-07-01T10:00:00.000Z",
    usedAt: "2026-07-01T10:00:00.000Z",
    store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
    booking: null,
    coupon: { id: "coupon-1", code: "WELCOME20", name: "Welcome 20%" },
    couponIssue: { id: "issue-used", code: "MEMBER-used", status: "USED" },
    media: [{ id: "media-2", storageKey: "verified.png", originalName: "verified.png", mimeType: "image/png", access: "PROTECTED", url: "/storage/files/verified.png" }],
    fraudWarnings: [{ code: "POSSIBLE_DUPLICATE_BILL", severity: "HIGH", message: "Có bill nghi trùng." }],
    user: { email: "member@example.com", displayName: "Member QA", phone: "+84901234567" },
    guest: null,
  },
];

const adminStores = [{ id: "store-1", name: "Neon Club", slug: "neon-club" }];

const adminCasts = [
  {
    id: "cast-1",
    stageName: "Mika",
    storeId: "store-1",
    status: "ACTIVE",
    isPublic: true,
    zodiacSign: "Leo",
    languages: ["VN", "EN"],
    tags: ["host"],
    store: { id: "store-1", name: "Neon Club" },
  },
  {
    id: "cast-2",
    stageName: "Airi",
    storeId: "store-1",
    status: "DRAFT",
    isPublic: false,
    languages: ["JP"],
    tags: ["new"],
    store: { id: "store-1", name: "Neon Club" },
  },
];

const revenueReport = {
  filters: {
    from: "2026-06-30T17:00:00.000Z",
    to: "2026-07-02T16:59:59.999Z",
    fromDate: "2026-07-01",
    toDate: "2026-07-02",
    timezone: "Asia/Ho_Chi_Minh",
    dateField: "usedAt",
    statusIn: ["VERIFIED", "PAID"],
    billStatusIncluded: ["VERIFIED", "PAID"],
    storeId: null,
    couponId: null,
    partnerAccountId: null,
    areaId: null,
    castId: null,
    exportEnabled: false,
    exportFormats: [],
  },
  meta: {
    billStatusIncluded: ["VERIFIED", "PAID"],
    timezone: "Asia/Ho_Chi_Minh",
    generatedAt: "2026-07-03T10:00:00.000Z",
    exportEnabled: false,
    exportFormats: [],
    formula: {
      grossVnd: "subtotalVnd",
      discountVnd: "discountVnd",
      netVnd: "subtotalVnd - discountVnd",
      commissionVnd: "commissionAmountVnd",
    },
  },
  totals: {
    billCount: 2,
    grossVnd: 3000000,
    discountVnd: 200000,
    netVnd: 2800000,
    commissionVnd: 280000,
  },
  days: [
    {
      date: "2026-07-01",
      billCount: 2,
      grossVnd: 3000000,
      discountVnd: 200000,
      netVnd: 2800000,
      commissionVnd: 280000,
      stores: [
        {
          store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
          billCount: 2,
          grossVnd: 3000000,
          discountVnd: 200000,
          netVnd: 2800000,
          commissionVnd: 280000,
          coupons: [
            {
              coupon: { id: "coupon-1", code: "WELCOME20", name: "Welcome 20%" },
              billCount: 2,
              grossVnd: 3000000,
              discountVnd: 200000,
              netVnd: 2800000,
              commissionVnd: 280000,
              bills: [
                {
                  id: "bill-verified-1",
                  billNumber: "BILL-20260701-VERIFIED",
                  status: "VERIFIED",
                  usedAt: "2026-07-01T10:00:00.000Z",
                  billCount: 1,
                  grossVnd: 2000000,
                  discountVnd: 200000,
                  netVnd: 1800000,
                  commissionVnd: 180000,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  breakdowns: {
    partners: [
      {
        id: "partner-1",
        code: "ACTIVE",
        name: "Neon Partner",
        secondary: "ACTIVE",
        billCount: 2,
        grossVnd: 3000000,
        discountVnd: 200000,
        netVnd: 2800000,
        commissionVnd: 280000,
      },
    ],
    campaigns: [
      {
        id: "coupon-1",
        code: "WELCOME20",
        name: "Welcome 20%",
        secondary: null,
        billCount: 2,
        grossVnd: 3000000,
        discountVnd: 200000,
        netVnd: 2800000,
        commissionVnd: 280000,
      },
    ],
    areas: [
      {
        id: "area-1",
        code: "D1",
        name: "District 1",
        secondary: "Ho Chi Minh City",
        billCount: 2,
        grossVnd: 3000000,
        discountVnd: 200000,
        netVnd: 2800000,
        commissionVnd: 280000,
      },
    ],
    casts: [
      {
        id: "cast-1",
        code: "mika",
        name: "Mika",
        secondary: null,
        billCount: 1,
        grossVnd: 2000000,
        discountVnd: 200000,
        netVnd: 1800000,
        commissionVnd: 180000,
      },
    ],
  },
  funnel: [
    { key: "coupon_qr", label: "Coupon/QR", count: 3, rateFromPrevious: null },
    { key: "qr_scan", label: "QR scan", count: 2, rateFromPrevious: 66.67 },
    { key: "confirm_used", label: "Confirm USED", count: 2, rateFromPrevious: 100 },
    { key: "bill_submitted", label: "Bill submitted", count: 2, rateFromPrevious: 100 },
    { key: "bill_approved", label: "Bill approved", count: 2, rateFromPrevious: 100 },
    { key: "commission", label: "Commission", count: 280000, commissionVnd: 280000, rateFromPrevious: null },
  ],
  comparison: {
    previousPeriod: {
      from: "2026-06-28T17:00:00.000Z",
      to: "2026-06-30T16:59:59.999Z",
      fromDate: "2026-06-29",
      toDate: "2026-06-30",
    },
    totals: {
      billCount: { current: 2, previous: 1, delta: 1, deltaPercent: 100 },
      grossVnd: { current: 3000000, previous: 1000000, delta: 2000000, deltaPercent: 200 },
      discountVnd: { current: 200000, previous: 0, delta: 200000, deltaPercent: null },
      netVnd: { current: 2800000, previous: 1000000, delta: 1800000, deltaPercent: 180 },
      commissionVnd: { current: 280000, previous: 100000, delta: 180000, deltaPercent: 180 },
    },
  },
};

describe("AdminConsole coupon issue panel", () => {
  beforeEach(() => {
    mocks.apiClient.mockImplementation(async (path: string) => {
      if (path === "/partner/stores") return adminStores;
      if (path === "/admin/casts") return { data: adminCasts, total: adminCasts.length, page: 1, limit: 100 };
      if (path === "/partner/bookings") return [];
      if (path === "/admin/sensitive-bills") return [];
      if (path === "/partner/bills") return partnerBills;
      if (path === "/admin/reports/revenue") return revenueReport;
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

  it("renders the cast section from the admin casts backend endpoint", async () => {
    render(<AdminConsole section="cast" />);

    await screen.findByText(/^Mika/);

    expect(mocks.apiClient).toHaveBeenCalledWith("/admin/casts", { params: { limit: 100 } });
    expect(screen.getByText(/^Airi/)).toBeInTheDocument();
    expect(screen.getAllByText("Neon Club").length).toBeGreaterThan(0);
    expect(screen.getByText("VN · EN · host")).toBeInTheDocument();
    expect(screen.queryByText(/Michi/)).not.toBeInTheDocument();
  });

  it("sends booking, coupon, and coupon issue filters to the sensitive bill endpoint", async () => {
    mocks.apiClient.mockImplementation(async (path: string) => {
      if (path === "/partner/stores") return adminStores;
      if (path === "/admin/casts") return { data: adminCasts, total: adminCasts.length, page: 1, limit: 100 };
      if (path === "/partner/bookings") return [];
      if (path === "/admin/sensitive-bills") return sensitiveBills;
      if (path === "/partner/bills") return partnerBills;
      if (path === "/admin/reports/revenue") return revenueReport;
      if (path === "/admin/partner-requests") return [];
      if (path === "/admin/coupon-issues") return couponIssues;
      return [];
    });

    render(<AdminConsole section="bill" />);

    const panel = await screen.findByTestId("admin-sensitive-bills-panel");
    await within(panel).findByText("BILL-20260701-ABC12345");
    expect(within(panel).getByText(/booking/i)).toBeInTheDocument();
    expect(within(panel).getByText("Gross 2.000.000đ")).toBeInTheDocument();
    expect(within(panel).getByText("Net 1.840.000đ")).toBeInTheDocument();
    expect(within(panel).getByText("Payable 1.990.000đ")).toBeInTheDocument();
    expect(within(panel).getByText("Chủ quán")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Booking ID filter"), {
      target: { value: "booking-1" },
    });
    fireEvent.change(screen.getByLabelText("Coupon ID filter"), { target: { value: "coupon-1" } });
    fireEvent.change(screen.getByLabelText("Coupon issue ID filter"), {
      target: { value: "issue-used" },
    });
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
    const statusValues = Array.from(statusFilter.querySelectorAll("option")).map(
      (option) => option.value,
    );
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

  it("renders the P0 revenue report by used date, store, and coupon", async () => {
    render(<AdminConsole section="reports" />);

    const panel = await screen.findByTestId("admin-revenue-report-panel");
    expect(within(panel).getByText("Report P0: ngày -> quán -> mã giảm giá")).toBeInTheDocument();
    expect(within(panel).getByText("2026-07-01")).toBeInTheDocument();
    expect(within(panel).getAllByText("Neon Club").length).toBeGreaterThan(0);
    expect(within(panel).getByText("WELCOME20")).toBeInTheDocument();
    expect(within(panel).getByText("Welcome 20%")).toBeInTheDocument();
    expect(within(panel).getByText(/grossVnd = subtotalVnd \/ bill g.c/)).toBeInTheDocument();
    expect(within(panel).getByText(/netVnd = subtotalVnd - discountVnd/)).toBeInTheDocument();
    expect(screen.getByLabelText("Revenue report status filter")).toHaveValue("VERIFIED / PAID");
    expect(screen.queryByText("Export CSV")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Export revenue report Excel")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Export revenue report PDF")).not.toBeInTheDocument();
    expect(screen.queryByTestId("admin-revenue-p2-dashboard")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Coupon/QR")).not.toBeInTheDocument();
    expect(within(panel).queryByText("QR scan")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Confirm USED")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Bill submitted")).not.toBeInTheDocument();
    expect(within(panel).queryByText("Bill approved")).not.toBeInTheDocument();
    expect(within(panel).queryByTestId("admin-bill-reversal-panel")).not.toBeInTheDocument();
    expect(within(panel).queryByLabelText("Auto reverse high-risk bills")).not.toBeInTheDocument();
    expect(within(panel).queryByLabelText("Reverse bill BILL-20260701-VERIFIED")).not.toBeInTheDocument();
    expect(within(panel).queryByText(/Neon Partner/)).not.toBeInTheDocument();
    expect(within(panel).queryByText(/Mika/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Revenue report from date"), {
      target: { value: "2026-07-01" },
    });
    fireEvent.change(screen.getByLabelText("Revenue report to date"), {
      target: { value: "2026-07-02" },
    });
    fireEvent.change(screen.getByLabelText("Revenue report store filter"), {
      target: { value: "store-1" },
    });
    fireEvent.change(screen.getByLabelText("Revenue report coupon filter"), {
      target: { value: "coupon-1" },
    });
    fireEvent.click(screen.getByLabelText("Apply revenue report date filters"));

    await waitFor(() => {
      expect(mocks.apiClient).toHaveBeenCalledWith(
        "/admin/reports/revenue",
        expect.objectContaining({
          params: {
            fromDate: "2026-07-01",
            toDate: "2026-07-02",
            timezone: "Asia/Ho_Chi_Minh",
            storeId: "store-1",
            couponId: "coupon-1",
          },
        }),
      );
    });

    fireEvent.change(screen.getByLabelText("Revenue report commission flag"), {
      target: { value: "NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED" },
    });
    fireEvent.click(screen.getByLabelText("Apply revenue report date filters"));

    await waitFor(() => {
      expect(mocks.apiClient).toHaveBeenCalledWith(
        "/admin/reports/revenue",
        expect.objectContaining({
          params: expect.objectContaining({
            flag: "NEGATIVE_COMMISSION_PM_BA_CONFIRMATION_REQUIRED",
          }),
        }),
      );
    });

    fireEvent.change(screen.getByLabelText("Revenue report commission flag"), {
      target: { value: "MISSING_ACTIVE_COMMISSION_CONFIG" },
    });
    fireEvent.click(screen.getByLabelText("Apply revenue report date filters"));

    await waitFor(() => {
      expect(mocks.apiClient).toHaveBeenCalledWith(
        "/admin/reports/revenue",
        expect.objectContaining({
          params: expect.objectContaining({
            flag: "MISSING_ACTIVE_COMMISSION_CONFIG",
          }),
        }),
      );
    });

    fireEvent.click(screen.getByLabelText("Revenue coupon drilldown WELCOME20"));
    expect(within(panel).getAllByText("BILL-20260701-VERIFIED").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByLabelText("Revenue quick range seven"));
    await waitFor(() => {
      expect(mocks.apiClient).toHaveBeenCalledWith(
        "/admin/reports/revenue",
        expect.objectContaining({
          params: expect.objectContaining({
            timezone: "Asia/Ho_Chi_Minh",
            storeId: "store-1",
            couponId: "coupon-1",
          }),
        }),
      );
    });
  });
});
