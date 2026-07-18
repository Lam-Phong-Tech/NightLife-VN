import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../src/app/(member)/xac-nhan/page";
import { rememberLastBooking, type BookingRecord } from "@/lib/api/bookings";

const mocks = vi.hoisted(() => ({
  bookingApi: {
    getGuestBookingByCode: vi.fn(),
    listMemberBookings: vi.fn(),
  },
}));

vi.mock("@/lib/api/bookings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/bookings")>("@/lib/api/bookings");

  return {
    ...actual,
    bookingApi: {
      ...actual.bookingApi,
      getGuestBookingByCode: mocks.bookingApi.getGuestBookingByCode,
      listMemberBookings: mocks.bookingApi.listMemberBookings,
    },
  };
});

const tourBooking: BookingRecord = {
  id: "tour-confirm-1",
  bookingCode: "BK-TOUR1",
  status: "REQUESTED",
  scheduledAt: "2030-07-09T14:00:00.000Z",
  partySize: 4,
  store: {
    id: "tokyo-kitchen",
    name: "Tokyo Kitchen",
    slug: "tokyo-kitchen",
    media: [],
  },
  guest: {
    id: "guest-1",
    displayName: "Minh Tu",
    email: "minh@example.com",
  },
  tour: {
    id: "tour-1",
    title: "Busy Night Tour",
    stops: [
      {
        order: 1,
        storeId: "tokyo-kitchen",
        storeSlug: "tokyo-kitchen",
        storeName: "Tokyo Kitchen",
        casts: [],
      },
      {
        order: 2,
        storeId: "crimson-bar",
        storeSlug: "crimson-bar",
        storeName: "Crimson Bar",
        casts: [],
      },
    ],
  },
};

describe("BookingConfirmTour", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.pushState({}, "", "/xac-nhan?bookingId=tour-confirm-1");
    mocks.bookingApi.getGuestBookingByCode.mockReset();
    mocks.bookingApi.listMemberBookings.mockReset();
    mocks.bookingApi.getGuestBookingByCode.mockRejectedValue(new Error("guest lookup unavailable"));
    mocks.bookingApi.listMemberBookings.mockRejectedValue(new Error("member lookup unavailable"));
  });

  afterEach(() => {
    cleanup();
  });

  it("shows tour summary with the booking QR panel", async () => {
    rememberLastBooking(tourBooking);

    render(<Page />);

    expect(await screen.findByText("Busy Night Tour")).toBeInTheDocument();
    expect(screen.getByText("Tokyo Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Crimson Bar")).toBeInTheDocument();
    expect(await screen.findByRole("img")).toBeInTheDocument();
  });

  it("refreshes cached confirmation details from the latest member booking data", async () => {
    const cachedBooking: BookingRecord = {
      ...tourBooking,
      id: "booking-refresh-1",
      bookingCode: "BK-OLD17",
      status: "REQUESTED",
      scheduledAt: "2030-07-17T14:00:00.000Z",
      tour: undefined,
    };
    const latestBooking: BookingRecord = {
      ...cachedBooking,
      bookingCode: "BK-NEW21",
      status: "CONFIRMED",
      scheduledAt: "2030-07-21T14:00:00.000Z",
      couponIssue: {
        id: "coupon-issue-1",
        code: "MEMBER-8",
        status: "ISSUED",
        usedAt: null,
      },
    };

    window.history.pushState({}, "", "/xac-nhan?bookingId=booking-refresh-1");
    rememberLastBooking(cachedBooking);
    mocks.bookingApi.listMemberBookings.mockResolvedValue([latestBooking]);

    render(<Page />);

    await waitFor(() => expect(screen.getByText("BK-NEW21")).toBeInTheDocument());
    expect(mocks.bookingApi.listMemberBookings).toHaveBeenCalled();
    expect(screen.queryByText("BK-OLD17")).not.toBeInTheDocument();
    expect(document.body.textContent ?? "").toMatch(/(?:21.*2030|2030.*21)/);
    expect(document.body.textContent ?? "").not.toMatch(/(?:17.*2030|2030.*17)/);
  });
});
