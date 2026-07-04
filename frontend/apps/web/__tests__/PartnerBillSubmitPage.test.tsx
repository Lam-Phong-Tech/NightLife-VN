import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PartnerBillSubmitPage from "../src/app/partner/gui-hoa-don/page";

const mocks = vi.hoisted(() => ({
  listMemberBills: vi.fn(),
  listPartnerBills: vi.fn(),
  listPartnerStores: vi.fn(),
  previewBillOcr: vi.fn(),
  submitMemberBill: vi.fn(),
  submitPartnerBill: vi.fn(),
  uploadEvidence: vi.fn(),
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
    media: [{ id: "media-1", storageKey: "proof.png", originalName: "proof.png", mimeType: "image/png", access: "PROTECTED", url: "/storage/files/proof.png" }],
  },
];

describe("Partner bill submit page", () => {
  beforeEach(() => {
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

  it("loads partner stores only and submits through the partner bill API", async () => {
    render(<PartnerBillSubmitPage />);

    await screen.findByText("2 quán thuộc partner");
    expect(mocks.listPartnerStores).toHaveBeenCalledTimes(1);
    expect(mocks.listStores).not.toHaveBeenCalled();

    const amountInput = document.querySelector<HTMLInputElement>("#partner-bill-total");
    const usedAtInput = document.querySelector<HTMLInputElement>("#partner-bill-used-at");
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    const form = document.querySelector<HTMLFormElement>("form.partner-bill-form");
    expect(amountInput).not.toBeNull();
    expect(usedAtInput).not.toBeNull();
    expect(fileInput).not.toBeNull();
    expect(form).not.toBeNull();

    fireEvent.change(amountInput!, { target: { value: "1800000" } });
    fireEvent.change(usedAtInput!, {
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
          storeSlug: "neon-club",
          totalVnd: 1800000,
        }),
      );
    });
    expect(mocks.submitMemberBill).not.toHaveBeenCalled();
    expect(mocks.uploadEvidence).toHaveBeenCalledWith("bill-partner-1", expect.any(File));
  });

  it("shows partner bill history filtered by the selected store scope", async () => {
    render(<PartnerBillSubmitPage />);

    await screen.findByText("BILL-NEON");
    expect(screen.queryByText("BILL-VELVET")).not.toBeInTheDocument();

    const storeSelect = document.querySelector<HTMLSelectElement>("#partner-bill-store");
    expect(storeSelect).not.toBeNull();
    fireEvent.change(storeSelect!, { target: { value: "velvet-club" } });

    await waitFor(() => {
      expect(screen.getByText("BILL-VELVET")).toBeInTheDocument();
    });
    expect(screen.queryByText("BILL-NEON")).not.toBeInTheDocument();
  });
});
