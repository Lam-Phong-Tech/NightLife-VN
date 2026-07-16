import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Page from "../src/app/(member)/lich-su-dat-cho/page";
import { rememberLastBooking, type BookingRecord } from "@/lib/api/bookings";

const mocks = vi.hoisted(() => ({
  bookingApi: {
    listMemberBookings: vi.fn(),
  },
  router: {
    replace: vi.fn(),
  },
  socket: {
    emit: vi.fn(),
    off: vi.fn(),
    on: vi.fn(),
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
  useSearchParams: () => new URLSearchParams("bookingId=e19330dd-707d-4247-8a07-fd727da9265f"),
}));

vi.mock("@/lib/auth/session", () => ({
  getAuthUser: () => ({
    id: "member-1",
    displayName: "NightLife Member",
    role: "USER",
    tier: "GOLD",
  }),
}));

vi.mock("@/components/providers/SocketProvider", () => ({
  useSocket: () => ({ socket: mocks.socket }),
}));

vi.mock("@/lib/api/bookings", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/bookings")>("@/lib/api/bookings");

  return {
    ...actual,
    bookingApi: {
      ...actual.bookingApi,
      listMemberBookings: mocks.bookingApi.listMemberBookings,
    },
  };
});

const booking = (overrides: Partial<BookingRecord>): BookingRecord => ({
  id: overrides.id ?? "booking-1",
  bookingCode: overrides.bookingCode ?? "BK-X7B9K2",
  status: overrides.status ?? "REQUESTED",
  scheduledAt: overrides.scheduledAt ?? "2030-07-09T14:00:00.000Z",
  partySize: overrides.partySize ?? 4,
  createdAt: overrides.createdAt,
  user: overrides.user ?? { id: "member-1", displayName: "NightLife Member", tier: "GOLD" },
  store:
    overrides.store ??
    ({
      id: "store-1",
      name: "Star KTV",
      slug: "star-ktv",
      media: [],
    } as BookingRecord["store"]),
  cast: overrides.cast,
  coupon: overrides.coupon,
  couponIssue: overrides.couponIssue,
  note: overrides.note,
  tour: overrides.tour,
});

describe("BookingHistoryPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.pushState(
      {},
      "",
      "/lich-su-dat-cho?bookingId=e19330dd-707d-4247-8a07-fd727da9265f",
    );
    mocks.bookingApi.listMemberBookings.mockReset();
    mocks.router.replace.mockReset();
    mocks.socket.emit.mockClear();
    mocks.socket.off.mockClear();
    mocks.socket.on.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("keeps the newest booking first even when the URL still has an older booking id", async () => {
    const erikaBooking = booking({
      id: "e19330dd-707d-4247-8a07-fd727da9265f",
      createdAt: "2026-07-09T06:00:00.000Z",
      store: {
        id: "star-ktv",
        name: "Star KTV",
        slug: "star-ktv",
        media: [],
      } as BookingRecord["store"],
      cast: {
        id: "erika",
        slug: "erika",
        stageName: "Erika",
        publicAlias: "Erika",
        media: [],
      },
    });
    const kotoneBooking = booking({
      id: "4e648024-2222-4444-8888-123456789abc",
      createdAt: "2026-07-09T07:00:00.000Z",
      store: {
        id: "tokyo-kitchen",
        name: "Tokyo Kitchen",
        slug: "tokyo-kitchen",
        media: [],
      } as BookingRecord["store"],
      cast: {
        id: "kotone",
        slug: "kotone",
        stageName: "Kotone",
        publicAlias: "Kotone",
        media: [],
      },
    });

    rememberLastBooking(kotoneBooking);
    mocks.bookingApi.listMemberBookings.mockResolvedValue([erikaBooking, kotoneBooking]);

    render(<Page />);

    await waitFor(() => expect(screen.getByText("Kotone @ Tokyo Kitchen")).toBeInTheDocument());

    expect(
      screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(["Kotone @ Tokyo Kitchen", "Erika @ Star KTV"]);
  });

  it("links completed bookings to the member bill form with booking context", async () => {
    const completedBooking = booking({
      id: "550e8400-e29b-41d4-a716-446655440010",
      status: "COMPLETED",
      scheduledAt: "2026-07-09T14:00:00.000Z",
      store: {
        id: "tokyo-kitchen",
        name: "Tokyo Kitchen",
        slug: "tokyo-kitchen",
        media: [],
      } as BookingRecord["store"],
      couponIssue: {
        id: "coupon-issue-1",
        code: "COUPON-QR",
        status: "USED",
      },
    });

    mocks.bookingApi.listMemberBookings.mockResolvedValue([completedBooking]);

    render(<Page />);

    await waitFor(() =>
      expect(
        Array.from(document.querySelectorAll("a")).find(
          (link) =>
            link.getAttribute("href") ===
            "/gui-hoa-don?bookingId=550e8400-e29b-41d4-a716-446655440010&storeSlug=tokyo-kitchen&couponIssueId=coupon-issue-1",
        ),
      ).toBeInTheDocument(),
    );
  });

  it("renders tour bookings with tour actions instead of restaurant rebooking actions", async () => {
    const apiBooking = booking({
      id: "tour-booking-1",
      bookingCode: "BK-TOUR1",
      status: "COMPLETED",
      scheduledAt: "2026-07-09T14:00:00.000Z",
      store: {
        id: "tokyo-kitchen",
        name: "Tokyo Kitchen",
        slug: "tokyo-kitchen",
        media: [],
      } as BookingRecord["store"],
    });
    const localTourBooking = booking({
      ...apiBooking,
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
    });

    rememberLastBooking(localTourBooking, { history: true });
    window.sessionStorage.clear();
    mocks.bookingApi.listMemberBookings.mockResolvedValue([apiBooking]);

    render(<Page />);

    await waitFor(() => expect(screen.getByText("Busy Night Tour")).toBeInTheDocument());

    expect(screen.getByText("Tour")).toBeInTheDocument();
    expect(screen.getByText(/2 điểm dừng/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Xem yêu cầu tour/i })).toHaveAttribute(
      "href",
      "/xac-nhan?bookingId=tour-booking-1",
    );
    expect(screen.getByRole("link", { name: /Chi tiết tour/i })).toHaveAttribute(
      "href",
      "/tour/tour-1",
    );
    expect(screen.queryByRole("link", { name: /Gửi hóa đơn/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /^Đặt lại$/i })).not.toBeInTheDocument();
  });
});
