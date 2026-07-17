import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PartnerPage from "../src/app/partner/page";
import { SystemFeedbackProvider } from "../src/components/ui/SystemFeedback";

const mocks = vi.hoisted(() => ({
  apiClient: vi.fn(),
  listMemberBills: vi.fn(),
  listPartnerBills: vi.fn(),
  listPartnerStores: vi.fn(),
  previewBillOcr: vi.fn(),
  submitMemberBill: vi.fn(),
  submitPartnerBill: vi.fn(),
  uploadEvidence: vi.fn(),
  listStores: vi.fn(),
  searchParams: "panel=bill",
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
    ApiError,
    translateApiMessage: vi.fn((message?: string, _status?: number, fallback?: string) => message ?? fallback ?? ""),
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("react-quill-new", async () => {
  const React = await import("react");

  return {
    default: function MockReactQuill({
      value = "",
      onChange,
    }: {
      value?: string;
      onChange?: (value: string) => void;
    }) {
      React.useEffect(() => {
        if (onChange && value && !value.startsWith("<p>")) {
          onChange(`<p>${value}</p>`);
        }
      }, [onChange, value]);

      return React.createElement("div", { "data-testid": "mock-react-quill" }, value);
    },
  };
});

vi.mock("@/lib/auth/session", () => ({
  clearAuthSession: vi.fn(),
  getAuthUser: () => ({ role: "PARTNER", displayName: "Partner Demo" }),
}));

vi.mock("@/lib/api/bills", () => ({
  billApi: {
    listMemberBills: mocks.listMemberBills,
    listPartnerBills: mocks.listPartnerBills,
    listPartnerStores: mocks.listPartnerStores,
    previewBillOcr: mocks.previewBillOcr,
    submitMemberBill: mocks.submitMemberBill,
    submitPartnerBill: mocks.submitPartnerBill,
    uploadEvidence: mocks.uploadEvidence,
  },
}));

vi.mock("@/lib/api/discovery", () => ({
  discoveryApi: {
    listStores: mocks.listStores,
  },
}));

const toDatetimeLocalValue = (date: Date) => {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
};

const partnerStores = [
  {
    id: "store-neon",
    name: "Neon Club",
    slug: "neon-club",
    category: "CLUB",
    status: "ACTIVE",
    city: "Ho Chi Minh City",
    district: "District 1",
  },
  {
    id: "store-velvet",
    name: "Velvet Club",
    slug: "velvet-club",
    category: "CLUB",
    status: "ACTIVE",
    city: "Ho Chi Minh City",
    district: "District 3",
  },
];

const partnerBills = [
  {
    id: "bill-neon",
    storeId: "store-neon",
    billNumber: "BILL-NEON",
    status: "SUBMITTED",
    submitterType: "PARTNER",
    totalVnd: 1800000,
    usedAt: "2026-07-03T14:00:00.000Z",
    submittedAt: "2026-07-03T15:00:00.000Z",
    store: { id: "store-neon", name: "Neon Club", slug: "neon-club" },
    media: [],
  },
  {
    id: "bill-velvet",
    storeId: "store-velvet",
    billNumber: "BILL-VELVET",
    status: "VERIFIED",
    submitterType: "PARTNER",
    totalVnd: 2200000,
    usedAt: "2026-07-03T16:00:00.000Z",
    submittedAt: "2026-07-03T17:00:00.000Z",
    store: { id: "store-velvet", name: "Velvet Club", slug: "velvet-club" },
    media: [
      {
        id: "media-1",
        storageKey: "proof.png",
        originalName: "proof.png",
        mimeType: "image/png",
        access: "PROTECTED",
        url: "/storage/files/proof.png",
      },
    ],
  },
];

const dashboardLite = {
  period: "seven",
  from: "2026-07-03T00:00:00.000Z",
  to: "2026-07-10T23:59:59.999Z",
  bookingCount: 0,
  profileViewCount: 0,
  customerArrivalCount: 0,
  customerArrivalSource: "QR_USED",
  qrUsedCount: 0,
  billApprovedCount: 0,
  storeCount: 2,
  stores: [],
  weeklyBookings: [],
  privacy: { customerDetailVisible: false, note: "masked" },
};

const listingDraftResponse = {
  contentId: null,
  savedAt: null,
  publishedAt: null,
  review: null,
  draft: {},
  message: "Draft loaded",
};

describe("Partner bill submit page", () => {
  beforeEach(() => {
    mocks.searchParams = "panel=bill";
    mocks.apiClient.mockImplementation((path: string) => {
      if (path === "/partner/stores") return Promise.resolve(partnerStores);
      if (path === "/partner/coupons") return Promise.resolve([]);
      if (path === "/partner/bookings") return Promise.resolve([]);
      if (path === "/partner/bills") return Promise.resolve(partnerBills);
      if (path.startsWith("/partner/dashboard-lite")) return Promise.resolve(dashboardLite);
      if (path.startsWith("/partner/listing-draft/")) return Promise.resolve(listingDraftResponse);
      return Promise.reject(new Error(`Unhandled apiClient path ${path}`));
    });
    mocks.listPartnerStores.mockResolvedValue(partnerStores);
    mocks.listPartnerBills.mockResolvedValue(partnerBills);
    mocks.submitPartnerBill.mockResolvedValue({
      id: "bill-partner-1",
      storeId: "store-neon",
      billNumber: "BILL-PARTNER-001",
      status: "SUBMITTED",
      submitterType: "PARTNER",
      totalVnd: 1800000,
      usedAt: "2026-07-03T14:00:00.000Z",
      submittedAt: "2026-07-04T05:00:00.000Z",
      store: { id: "store-neon", name: "Neon Club", slug: "neon-club" },
      media: [],
    });
    mocks.uploadEvidence.mockResolvedValue({ id: "media-uploaded" });
    mocks.previewBillOcr.mockResolvedValue({
      source: "HEURISTIC_OCR_AI_MVP",
      suggestions: { totalVnd: 1800000, usedAt: "2026-07-03T14:00:00.000Z" },
      confidence: 0.8,
      warnings: [],
      requiresManualReview: false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders inside the partner shell and submits through the partner bill API", async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerPage />
      </SystemFeedbackProvider>,
    );

    await screen.findByText("2 quán trong scope");
    expect(mocks.apiClient).toHaveBeenCalledWith("/partner/stores");
    expect(mocks.listPartnerStores).not.toHaveBeenCalled();
    expect(mocks.listStores).not.toHaveBeenCalled();

    const amountInput = screen.getByLabelText("Tổng tiền bill gốc *") as HTMLInputElement;
    const usedAtInput = screen.getByLabelText("Thời gian sử dụng *") as HTMLInputElement;
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const form = amountInput.closest("form") as HTMLFormElement | null;
    expect(fileInput).not.toBeNull();
    expect(form).not.toBeNull();

    fireEvent.change(amountInput, { target: { value: "1800000" } });
    fireEvent.change(usedAtInput, {
      target: { value: toDatetimeLocalValue(new Date()) },
    });
    await waitFor(() => {
      expect(amountInput).toHaveValue("1.800.000");
    });
    fireEvent.change(fileInput!, {
      target: { files: [new File(["proof"], "bill-proof.png", { type: "image/png" })] },
    });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mocks.submitPartnerBill).toHaveBeenCalledWith(
        expect.objectContaining({
          storeId: "store-neon",
          totalVnd: 1800000,
        }),
      );
    });
    expect(mocks.submitMemberBill).not.toHaveBeenCalled();
    expect(mocks.uploadEvidence).toHaveBeenCalledWith("bill-partner-1", expect.any(File));
  });

  it("shows partner bill table filtered by store and fills the form from a selected bill", async () => {
    render(
      <SystemFeedbackProvider>
        <PartnerPage />
      </SystemFeedbackProvider>,
    );

    await screen.findByText("BILL-NEON");
    expect(screen.queryByText("BILL-VELVET")).not.toBeInTheDocument();

    const storeSelect = screen.getByLabelText("Quán thuộc partner *") as HTMLSelectElement;
    fireEvent.change(storeSelect, { target: { value: "store-velvet" } });

    await waitFor(() => {
      expect(screen.getByText("BILL-VELVET")).toBeInTheDocument();
    });
    expect(screen.queryByText("BILL-NEON")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("BILL-VELVET"));
    expect(screen.getByLabelText("Tổng tiền bill gốc *")).toHaveValue("2.200.000");
  });

  it("renders the Go Live description without mounting the editable Quill or overwriting the draft", async () => {
    mocks.searchParams = "panel=listing";
    const listingWithLive = {
      ...listingDraftResponse,
      draft: {
        storeName: "Velvet draft",
        description: "Draft description",
      },
      live: {
        storeName: "Velvet live",
        description: "Live description",
      },
    };

    mocks.apiClient.mockImplementation((path: string) => {
      if (path === "/partner/stores") return Promise.resolve(partnerStores);
      if (path === "/partner/coupons") return Promise.resolve([]);
      if (path === "/partner/bookings") return Promise.resolve([]);
      if (path === "/partner/bills") return Promise.resolve(partnerBills);
      if (path.startsWith("/partner/dashboard-lite")) return Promise.resolve(dashboardLite);
      if (path.startsWith("/partner/listing-draft/")) return Promise.resolve(listingWithLive);
      return Promise.reject(new Error(`Unhandled apiClient path ${path}`));
    });

    render(
      <SystemFeedbackProvider>
        <PartnerPage />
      </SystemFeedbackProvider>,
    );

    expect(await screen.findByTestId("mock-react-quill")).toHaveTextContent("Draft description");

    fireEvent.click(screen.getByRole("button", { name: /Xem bản đang Go Live/i }));

    await waitFor(() => {
      expect(screen.queryByTestId("mock-react-quill")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("partner-live-description")).toHaveTextContent("Live description");

    fireEvent.click(screen.getByRole("button", { name: /Xem bản chỉnh sửa/i }));

    expect(await screen.findByTestId("mock-react-quill")).toHaveTextContent("Draft description");
    expect(screen.getByTestId("mock-react-quill")).not.toHaveTextContent("Live description");
  }, 20_000);
});
