import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BillSubmitPage from "../src/app/(member)/gui-hoa-don/page";

const mocks = vi.hoisted(() => ({
  listMemberBills: vi.fn(),
  previewBillOcr: vi.fn(),
  submitMemberBill: vi.fn(),
  uploadEvidence: vi.fn(),
  listMemberBookings: vi.fn(),
  listMemberCouponIssues: vi.fn(),
  searchParams: "",
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
    previewBillOcr: mocks.previewBillOcr,
    submitMemberBill: mocks.submitMemberBill,
    uploadEvidence: mocks.uploadEvidence,
  },
}));

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mocks.searchParams),
}));

vi.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const imageProps = { ...props };
    delete imageProps.unoptimized;
    return React.createElement("img", imageProps);
  },
}));

vi.mock("@/lib/api/bookings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/bookings")>("@/lib/api/bookings");

  return {
    ...actual,
    bookingApi: {
      ...actual.bookingApi,
      listMemberBookings: mocks.listMemberBookings,
    },
  };
});

vi.mock("@/lib/api/coupons", () => ({
  couponApi: {
    listMemberCouponIssues: mocks.listMemberCouponIssues,
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

const defaultBooking = {
  id: "550e8400-e29b-41d4-a716-446655440020",
  bookingCode: "BK-PUBLIC",
  status: "COMPLETED",
  scheduledAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  confirmedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  partySize: 4,
  store: publicStore,
  user: { id: "member-1", displayName: "Minh Tu", tier: "GOLD" },
};

describe("Bill submit page", () => {
  beforeEach(() => {
    mocks.searchParams = "";
    mocks.listMemberBookings.mockResolvedValue([defaultBooking]);
    mocks.listMemberCouponIssues.mockResolvedValue([]);
    mocks.listMemberBills.mockResolvedValue([]);
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
    mocks.uploadEvidence.mockResolvedValue({ id: "media-1" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the member bill page scoped to member submission only", async () => {
    render(<BillSubmitPage />);

    await waitFor(() => {
      expect(mocks.listMemberBookings).toHaveBeenCalled();
    });
    expect(screen.queryByText("Chủ quán")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Gui bill vai tro partner" })).not.toBeInTheDocument();
  });

  it("prefills bill total and used time from OCR preview", async () => {
    render(<BillSubmitPage />);

    await screen.findAllByText("Public Neon");

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
    await waitFor(() => {
      expect(amountInput).toHaveValue("1.800.000");
      expect(screen.getByText("03/07/2026 21:30")).toBeInTheDocument();
      expect(screen.getByText(/86%/)).toBeInTheDocument();
    });
  });

  it("prefills store, booking, QR summary, and used time from bookingId in the URL", async () => {
    const bookingId = "550e8400-e29b-41d4-a716-446655440010";
    const scheduledAt = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    mocks.searchParams = `bookingId=${bookingId}&storeSlug=public-neon`;
    mocks.listMemberBookings.mockResolvedValue([
      {
        id: bookingId,
        bookingCode: "BK-550E8400",
        status: "COMPLETED",
        scheduledAt,
        confirmedAt: scheduledAt,
        partySize: 4,
        store: publicStore,
        user: { id: "member-1", displayName: "Minh Tú", tier: "GOLD" },
        couponIssue: {
          id: "issue-1",
          code: "COUPON-QR",
          status: "USED",
          qrPayload: "coupon-payload",
        },
      },
    ]);

    render(<BillSubmitPage />);

    await screen.findByText("Đơn hàng đang liên kết");

    const bookingSelect = document.querySelector<HTMLSelectElement>("#bill-booking");
    const amountInput = document.querySelector<HTMLInputElement>("#bill-total");
    const form = document.querySelector<HTMLFormElement>("form.nl-bill-form");
    expect(bookingSelect).not.toBeNull();
    expect(amountInput).not.toBeNull();
    expect(form).not.toBeNull();
    expect(bookingSelect).toHaveValue(bookingId);
    expect(screen.getAllByText("#BK-550E8400").length).toBeGreaterThan(0);
    expect(screen.getAllByText("COUPON-QR").length).toBeGreaterThan(0);

    fireEvent.change(amountInput!, { target: { value: "1800000" } });
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mocks.submitMemberBill).toHaveBeenCalledWith(
        expect.objectContaining({
          bookingId,
          totalVnd: 1800000,
        }),
      );
    });
  });

  it("keeps the submitted bill visible when evidence upload fails", async () => {
    mocks.uploadEvidence.mockRejectedValue(new Error("upload failed"));
    render(<BillSubmitPage />);

    await screen.findAllByText("Public Neon");

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
    expect(await screen.findByText(/BILL-20260701-TEST/)).toBeInTheDocument();
    expect(screen.getByText(/chưa upload được/i)).toBeInTheDocument();
  });
});
