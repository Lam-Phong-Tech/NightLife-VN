import { act, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SessionSecurityWatcher } from "@/components/auth/SessionSecurityWatcher";
import {
  SESSION_REPLACED_EVENT,
  sessionReplacedBroadcastKey,
  sessionReplacedNoticeKey,
} from "@/lib/auth/session-replaced-notice";

const feedbackMocks = vi.hoisted(() => ({
  showModal: vi.fn(),
  showToast: vi.fn(),
}));

const socketMocks = vi.hoisted(() => {
  const handlers = new Map<string, (payload: unknown) => void>();
  return {
    handlers,
    socket: {
      on: vi.fn((event: string, handler: (payload: unknown) => void) => {
        handlers.set(event, handler);
      }),
      off: vi.fn((event: string) => {
        handlers.delete(event);
      }),
    },
  };
});

const sessionMocks = vi.hoisted(() => ({
  clearAuthSession: vi.fn(),
  clearAuthSessionForRole: vi.fn(),
}));

vi.mock("@/components/ui/SystemFeedback", () => ({
  useSystemFeedback: () => feedbackMocks,
}));

vi.mock("@/components/providers/SocketProvider", () => ({
  useSocket: () => ({ socket: socketMocks.socket, isConnected: true }),
}));

vi.mock("@/lib/auth/session", () => ({
  clearAuthSession: sessionMocks.clearAuthSession,
  clearAuthSessionForRole: sessionMocks.clearAuthSessionForRole,
}));

describe("session security watcher", () => {
  beforeEach(() => {
    feedbackMocks.showModal.mockReset();
    feedbackMocks.showToast.mockReset();
    sessionMocks.clearAuthSession.mockReset();
    sessionMocks.clearAuthSessionForRole.mockReset();
    socketMocks.handlers.clear();
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("shows the takeover modal and signs out when the socket reports a replaced session", async () => {
    render(<SessionSecurityWatcher />);

    const handler = socketMocks.handlers.get("session_replaced");
    expect(handler).toBeTypeOf("function");

    act(() => {
      handler?.({
        reason: "LOGIN_FROM_ANOTHER_BROWSER",
        role: "ADMIN",
        newDevice: {
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
          ipAddress: "203.113.131.xxx",
          at: "2026-07-26T08:04:00.000Z",
        },
      });
    });

    await waitFor(() => {
      expect(feedbackMocks.showModal).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "error",
          title: "Tài khoản vừa được đăng nhập trên thiết bị khác",
          primaryLabel: "Đăng nhập lại",
        }),
      );
    });

    const description = feedbackMocks.showModal.mock.calls[0][0].description as string;
    expect(description).toContain("Chrome trên Windows");
    expect(description).toContain("203.113.131.xxx");
    expect(description).toContain("đổi mật khẩu");

    expect(sessionMocks.clearAuthSessionForRole).toHaveBeenCalledWith("ADMIN");
    const broadcast = window.localStorage.getItem(sessionReplacedBroadcastKey);
    expect(broadcast).toContain('"role":"ADMIN"');
    expect(broadcast).toContain("203.113.131.xxx");
  });

  it("shows a generic modal for the lazy 401 path and dedupes repeat events", async () => {
    render(<SessionSecurityWatcher />);

    act(() => {
      window.dispatchEvent(
        new CustomEvent(SESSION_REPLACED_EVENT, { detail: { role: "PARTNER" } }),
      );
      window.dispatchEvent(
        new CustomEvent(SESSION_REPLACED_EVENT, { detail: { role: "PARTNER" } }),
      );
    });

    await waitFor(() => {
      expect(feedbackMocks.showModal).toHaveBeenCalledTimes(1);
    });

    const description = feedbackMocks.showModal.mock.calls[0][0].description as string;
    expect(description).toContain("một thiết bị khác");
    expect(sessionMocks.clearAuthSessionForRole).toHaveBeenCalledWith("PARTNER");
  });

  it("drains a stored notice on mount so the warning survives a redirect", async () => {
    window.sessionStorage.setItem(
      sessionReplacedNoticeKey,
      JSON.stringify({ role: "ADMIN" }),
    );

    render(<SessionSecurityWatcher />);

    await waitFor(() => {
      expect(feedbackMocks.showModal).toHaveBeenCalledTimes(1);
    });
    expect(window.sessionStorage.getItem(sessionReplacedNoticeKey)).toBeNull();
  });

  it("reacts to the cross-tab broadcast", async () => {
    render(<SessionSecurityWatcher />);

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: sessionReplacedBroadcastKey,
          newValue: JSON.stringify({ role: "ADMIN", nonce: 1 }),
        }),
      );
    });

    await waitFor(() => {
      expect(feedbackMocks.showModal).toHaveBeenCalledTimes(1);
    });
    expect(sessionMocks.clearAuthSessionForRole).toHaveBeenCalledWith("ADMIN");
  });
});
