import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SupportChatWidget } from "@/components/layout/SupportChatWidget";
import type { AuthUser } from "@/lib/auth/session";

const { getAuthSessionTokenMock, ioMock } = vi.hoisted(() => ({
  getAuthSessionTokenMock: vi.fn(),
  ioMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("socket.io-client", () => ({
  io: ioMock,
}));

vi.mock("@/lib/auth/session", () => ({
  getAuthSessionToken: getAuthSessionTokenMock,
}));

vi.mock("@/lib/i18n/client-translations", () => ({
  translateText: (text: string) => text,
}));

vi.mock("@/lib/i18n/use-active-language", () => ({
  intlLocaleByLanguage: { vi: "vi-VN" },
  useActiveLanguage: () => "vi",
}));

vi.mock("@/lib/socket-config", () => ({
  getApiBaseUrl: () => "https://api.example.com",
  getSupportSocketConfig: () => ({
    host: "https://api.example.com",
    path: "/socket.io",
  }),
}));

describe("support chat identity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(HTMLElement.prototype, "scrollTo", {
      configurable: true,
      value: vi.fn(),
    });
    localStorage.clear();
    localStorage.setItem("vy_guest_session_id", "guest-session-1");
    localStorage.setItem("vy_support_ticket_id", "ticket-1");
    getAuthSessionTokenMock.mockReturnValue("member-token");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          ticket: { id: "ticket-1" },
        }),
      }),
    );
  });

  it("merges the existing guest session when the customer logs in", async () => {
    const onOpenChange = vi.fn();
    const member: AuthUser = {
      id: "user-1",
      email: "quang@example.com",
      displayName: "Quang Duc",
      role: "USER",
    };
    const { rerender } = render(
      <SupportChatWidget
        isMobile={false}
        isOpen={false}
        currentUser={null}
        onOpenChange={onOpenChange}
      />,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/support/history?ticketId=ticket-1",
      );
    });
    vi.mocked(fetch).mockClear();

    rerender(
      <SupportChatWidget
        isMobile={false}
        isOpen={false}
        currentUser={member}
        onOpenChange={onOpenChange}
      />,
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "https://api.example.com/api/support/merge",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer member-token",
          },
          body: JSON.stringify({ guestSessionId: "guest-session-1" }),
        }),
      );
    });
  });

  it("clears the customer history when an admin closes the ticket", async () => {
    const socketHandlers = new Map<string, (payload: unknown) => void>();
    const socketMock = {
      connected: true,
      io: { opts: {} as { query?: { ticketId: string } } },
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      close: vi.fn(),
    };
    socketMock.on.mockImplementation(
      (event: string, handler: (payload: unknown) => void) => {
        socketHandlers.set(event, handler);
        return socketMock;
      },
    );
    socketMock.off.mockImplementation(() => socketMock);
    ioMock.mockReturnValue(socketMock);
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url.includes("ticketId=ticket-1")) {
        return {
          ok: true,
          json: vi.fn().mockResolvedValue([
            {
              id: "message-1",
              ticketId: "ticket-1",
              senderType: "GUEST",
              content: "Tin nhắn cũ",
              createdAt: "2026-07-24T10:00:00.000Z",
            },
          ]),
        } as unknown as Response;
      }

      return {
        ok: true,
        json: vi.fn().mockResolvedValue({ ticket: null, messages: [] }),
      } as unknown as Response;
    });

    render(
      <SupportChatWidget
        isMobile={false}
        isOpen
        currentUser={null}
        onOpenChange={vi.fn()}
      />,
    );

    expect(await screen.findByText("Tin nhắn cũ")).toBeInTheDocument();
    await waitFor(() => {
      expect(socketHandlers.has("ticket_closed")).toBe(true);
    });

    act(() => {
      socketHandlers.get("ticket_closed")?.({ ticketId: "ticket-1" });
    });

    expect(screen.queryByText("Tin nhắn cũ")).not.toBeInTheDocument();
    expect(localStorage.getItem("vy_support_ticket_id")).toBeNull();
  });
});
