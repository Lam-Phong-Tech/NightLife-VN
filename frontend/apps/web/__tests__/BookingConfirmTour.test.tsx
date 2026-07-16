import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Page from "../src/app/(member)/xac-nhan/page";
import { rememberLastBooking, type BookingRecord } from "@/lib/api/bookings";

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
  });

  afterEach(() => {
    cleanup();
  });

  it("shows tour summary without the restaurant QR panel", async () => {
    rememberLastBooking(tourBooking);

    render(<Page />);

    expect(await screen.findByText("Busy Night Tour")).toBeInTheDocument();
    expect(screen.getByText("Tokyo Kitchen")).toBeInTheDocument();
    expect(screen.getByText("Crimson Bar")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
