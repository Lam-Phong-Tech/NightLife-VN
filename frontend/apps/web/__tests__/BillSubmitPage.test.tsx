import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BillSubmitPage from "../src/app/(member)/gui-hoa-don/page";

const mocks = vi.hoisted(() => ({
  listMemberBills: vi.fn(),
  listPartnerBills: vi.fn(),
  listPartnerStores: vi.fn(),
  previewBillOcr: vi.fn(),
  submitMemberBill: vi.fn(),
  submitPartnerBill: vi.fn(),
  uploadEvidence: vi.fn(),
  listMemberBookings: vi.fn(),
  listMemberCouponIssues: vi.fn(),
  listStores: vi.fn(),
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
    translateApiMessage: vi.fn((message?: string, _status?: number, fallback?: string) => message ?? fallback ?? ""),
  };
});

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

vi.mock("@/lib/api/bookings", () => ({
  bookingApi: {
    listMemberBookings: mocks.listMemberBookings,
  },
}));

vi.mock("@/lib/api/coupons", () => ({
  couponApi: {
    listMemberCouponIssues: mocks.listMemberCouponIssues,
  },
}));

vi.mock("@/lib/api/discovery", () => ({
  discoveryApi: {
    listStores: mocks.listStores,
  },
}));

const publicStore = {
  id: "store-public",
  name: "Public Neon",
  slug: "public-neon",
  category: "CLUB",
  city: "Ha Noi",
  district: "Tay Ho",
};

const partnerStore = {
  id: "store-partner",
  name: "Partner Moon",
  slug: "partner-moon",
  category: "BAR",
  status: "ACTIVE",
  city: "Ha Noi",
  district: "Hoan Kiem",
};

describe("Bill submit page", () => {
  beforeEach(() => {
    mocks.listStores.mockResolvedValue([publicStore]);
    mocks.listMemberBookings.mockResolvedValue([]);
    mocks.listMemberCouponIssues.mockResolvedValue([]);
    mocks.listMemberBills.mockResolvedValue([]);
    mocks.listPartnerStores.mockResolvedValue([partnerStore]);
    mocks.previewBillOcr.mockResolvedValue({
      source: "HEURISTIC_OCR_AI_MVP",
      suggestions: {
        totalVnd: 1800000,
        usedAt: "2026-07-03T14:30:00.000Z",
      },
      confidence: 0.86,
      warnings: [],
      requiresManualReview: false,
    });
    mocks.listPartnerBills.mockResolvedValue([
      {
        id: "bill-partner-history",
        billNumber: "BILL-PARTNER-HISTORY",
        storeId: "store-partner",
        status: "SUBMITTED",
        submitterType: "PARTNER",
        totalVnd: 2000000,
        usedAt: "2026-07-03T09:30:00.000Z",
        store: { id: "store-partner", name: "Partner Moon", slug: "partner-moon" },
      },
    ]);
    mocks.submitMemberBill.mockResolvedValue({
      id: "bill-member-1",
      billNumber: "BILL-20260701-TEST",
      storeId: "store-public",
      status: "SUBMITTED",
      submitterType: "MEMBER",
      totalVnd: 1800000,
      usedAt: "2026-07-03T09:30:00.000Z",
      store: { id: "store-public", name: "Public Neon", slug: "public-neon" },
    });
    mocks.submitPartnerBill.mockResolvedValue({
      id: "bill-partner-1",
      billNumber: "BILL-PARTNER-1",
      storeId: "store-partner",
      status: "SUBMITTED",
      submitterType: "PARTNER",
      totalVnd: 1800000,
      usedAt: "2026-07-03T09:30:00.000Z",
      store: { id: "store-partner", name: "Partner Moon", slug: "partner-moon" },
    });
    mocks.uploadEvidence.mockResolvedValue({ id: "media-1" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads partner stores from partner scope when owner mode is selected", async () => {
    render(<BillSubmitPage />);

    await waitFor(() => {
      expect(mocks.listStores).toHaveBeenCalledWith({ city: "all", limit: 80 });
    });
    mocks.listStores.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Gui bill vai tro partner" }));

    await waitFor(() => {
      expect(mocks.listPartnerStores).toHaveBeenCalled();
    });
    expect(mocks.listStores).not.toHaveBeenCalled();
    expect((await screen.findAllByText("Partner Moon")).length).toBeGreaterThan(0);
    expect(await screen.findByText("BILL-PARTNER-HISTORY")).toBeInTheDocument();
  });

  it("prefills bill total and used time from OCR preview", async () => {
    render(<BillSubmitPage />);

    await screen.findByText("Public Neon");

    const amountInput = document.querySelector<HTMLInputElement>("#bill-total");
    const usedAtInput = document.querySelector<HTMLInputElement>("#bill-used-at");
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(amountInput).not.toBeNull();
    expect(usedAtInput).not.toBeNull();
    expect(fileInput).not.toBeNull();

    await userEvent.upload(
      fileInput!,
      new File(["Tong cong: 1.800.000 VND\nNgay: 03/07/2026 21:30"], "bill-proof.pdf", {
        type: "application/pdf",
      }),
    );
    await userEvent.click(screen.getByText(/^AI/));

    await waitFor(() => {
      expect(mocks.previewBillOcr).toHaveBeenCalledWith({
        fileName: "bill-proof.pdf",
        text: "Tong cong: 1.800.000 VND\nNgay: 03/07/2026 21:30",
      });
    });
    expect(amountInput).toHaveValue("1.800.000");
    expect(usedAtInput?.value).toMatch(/^2026-07-03T/);
    expect(screen.getByText(/86%/)).toBeInTheDocument();
  });

  it("keeps the submitted bill visible when evidence upload fails", async () => {
    mocks.uploadEvidence.mockRejectedValue(new Error("upload failed"));
    render(<BillSubmitPage />);

    await screen.findByText("Public Neon");

    const amountInput = document.querySelector<HTMLInputElement>("#bill-total");
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const form = document.querySelector<HTMLFormElement>("form.nl-bill-form");
    expect(amountInput).not.toBeNull();
    expect(fileInput).not.toBeNull();
    expect(form).not.toBeNull();

    fireEvent.change(amountInput!, { target: { value: "1800000" } });
    await userEvent.upload(
      fileInput!,
      new File(["proof"], "bill-proof.png", { type: "image/png" }),
    );
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mocks.submitMemberBill).toHaveBeenCalledWith(
        expect.objectContaining({
          storeSlug: "public-neon",
          totalVnd: 1800000,
        }),
      );
    });
    expect(mocks.uploadEvidence).toHaveBeenCalledWith("bill-member-1", expect.any(File));
    expect(await screen.findByText("BILL-20260701-TEST")).toBeInTheDocument();
    expect(screen.getByText(/chưa upload được/i)).toBeInTheDocument();
  });
});
