import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PartnerPage from "../src/app/partner/page";
import { SystemFeedbackProvider } from "../src/components/ui/SystemFeedback";

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  listMemberBills: vi.fn(),
  listPartnerBills: vi.fn(),
  listPartnerStores: vi.fn(),
  searchParams: "panel=settlement",
}));

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
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("@/lib/auth/session", () => ({
  __esModule: true,
  clearAuthSession: vi.fn(),
  getAuthUser: () => ({ role: "PARTNER", displayName: "Partner Demo" }),
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
    apiClient: mocks.apiClient,
    apiFormDataClient: vi.fn(),
    getAuthToken: vi.fn(() => "mock-token"),
    resolveClientUrl: vi.fn((url: string) => url),
    ApiError,
    translateApiMessage: vi.fn((message?: string, _status?: number, fallback?: string) => message ?? fallback ?? ""),
  };
});

vi.mock("@/lib/api/bills", () => ({
  billApi: {
    listMemberBills: mocks.listMemberBills,
    listPartnerBills: mocks.listPartnerBills,
    listPartnerStores: mocks.listPartnerStores,
    previewBillOcr: vi.fn(),
    submitMemberBill: vi.fn(),
    submitPartnerBill: vi.fn(),
    uploadEvidence: vi.fn(),
  },
}));

vi.mock("react-quill-new", async () => {
  const React = await import("react");
  return {
    default: function MockReactQuill({ value = "" }: { value?: string }) {
      return React.createElement("div", { "data-testid": "mock-react-quill" }, value);
    },
  };
});

describe("PartnerSettlementMoney", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.searchParams = "panel=settlement";
  });

  afterEach(() => {
    cleanup();
  });

  it(
    "renders 'Giảm giá: Chưa xác định' when discountVnd is null and does not render -totalVnd",
    async () => {
      const mockBillWithNullDiscount = {
        id: "bill-null-discount-12345",
        storeId: "store-1",
        billNumber: "BILL-NULL-001",
        status: "SUBMITTED",
        submitterType: "PARTNER",
        subtotalVnd: 2000000,
        discountVnd: null,
        totalVnd: 1800000,
        submittedAt: "2026-07-03T15:00:00.000Z",
        usedAt: "2026-07-03T14:00:00.000Z",
        store: { id: "store-1", name: "Neon Club", slug: "neon-club" },
        coupon: { id: "coupon-1", code: "PROMO", name: "Giảm Giá Đặc Biệt" },
      };

      mocks.listPartnerBills.mockResolvedValue([mockBillWithNullDiscount]);
      mocks.listPartnerStores.mockResolvedValue([
        { id: "store-1", name: "Neon Club", slug: "neon-club" },
      ]);

      mocks.apiClient.mockImplementation((endpoint: string) => {
        if (endpoint === "/partner/stores") {
          return Promise.resolve([{ id: "store-1", name: "Neon Club", slug: "neon-club" }]);
        }
        if (endpoint === "/partner/coupons") {
          return Promise.resolve([]);
        }
        if (endpoint === "/partner/bookings") {
          return Promise.resolve([]);
        }
        if (endpoint.startsWith("/partner/bills")) {
          return Promise.resolve([mockBillWithNullDiscount]);
        }
        if (endpoint.startsWith("/partner/dashboard-lite")) {
          return Promise.resolve({
            period: "seven",
            from: "2026-06-27T00:00:00.000Z",
            to: "2026-07-03T23:59:59.999Z",
            metrics: {
              bookingCount: 0,
              profileViews: 0,
              customerArrivals: 0,
              pendingSettlementCount: 1,
              completedBookings: 0,
              activeCoupons: 0,
            },
            timeSeries: [],
          });
        }
        if (endpoint.startsWith("/partner/listing-draft/")) {
          return Promise.resolve({
            contentId: null,
            savedAt: null,
            publishedAt: null,
            review: null,
            draft: {},
            message: "Draft loaded",
          });
        }
        if (endpoint.startsWith("/partner/notifications")) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });

      render(
        <SystemFeedbackProvider>
          <PartnerPage />
        </SystemFeedbackProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("BILL-NULL-001")).toBeInTheDocument();
      });

      // Should display "Giảm giá: Chưa xác định"
      expect(screen.getAllByText("Giảm giá: Chưa xác định").length).toBeGreaterThan(0);

      // Ensure -1.800.000đ or -1.800.000 VND (-totalVnd) is NEVER rendered as discount
      expect(screen.queryByText("-1.800.000đ")).toBeNull();
      expect(screen.queryByText("-1.800.000 VND")).toBeNull();
    },
    15000
  );
});
