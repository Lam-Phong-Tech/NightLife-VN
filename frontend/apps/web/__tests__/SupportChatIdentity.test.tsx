import React from "react";
import { render, waitFor } from "@testing-library/react";
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
});
