import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiClient } from "@/lib/api/client";
import {
  SESSION_REPLACED_EVENT,
  sessionReplacedNoticeKey,
} from "@/lib/auth/session-replaced-notice";

const originalFetch = global.fetch;

describe("apiClient session replacement handling", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    document.cookie = "auth_token=test-token; path=/";
    document.cookie = "user_role=USER; path=/";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    document.cookie = "auth_token=; path=/; max-age=0";
    document.cookie = "user_role=; path=/; max-age=0";
  });

  it("threads the SESSION_REPLACED code into ApiError and records the notice", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        code: "SESSION_REPLACED",
        message: "Tài khoản đã được đăng nhập trên trình duyệt hoặc thiết bị khác.",
      }),
    }) as unknown as typeof fetch;

    const eventListener = vi.fn();
    window.addEventListener(SESSION_REPLACED_EVENT, eventListener);

    let caught: unknown;
    try {
      await apiClient("/bookings");
    } catch (error) {
      caught = error;
    } finally {
      window.removeEventListener(SESSION_REPLACED_EVENT, eventListener);
    }

    expect(caught).toBeInstanceOf(ApiError);
    expect((caught as ApiError).status).toBe(401);
    expect((caught as ApiError).code).toBe("SESSION_REPLACED");
    expect(eventListener).toHaveBeenCalledTimes(1);
    // recordSessionReplacedNotice persists a copy for the post-redirect warning.
    expect(window.sessionStorage.getItem(sessionReplacedNoticeKey)).not.toBeNull();
  });

  it("does not record a notice for a generic 401", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({ message: "Unauthorized" }),
    }) as unknown as typeof fetch;

    await expect(apiClient("/bookings")).rejects.toBeInstanceOf(ApiError);
    expect(window.sessionStorage.getItem(sessionReplacedNoticeKey)).toBeNull();
  });

  it("keeps the session for an incorrect current password", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: vi.fn().mockResolvedValue({
        message: "Mật khẩu cũ không chính xác",
      }),
    }) as unknown as typeof fetch;

    await expect(apiClient("/users/change-password", {
      method: "POST",
      data: { oldPassword: "wrong", newPassword: "NewPassword123!" },
    })).rejects.toBeInstanceOf(ApiError);

    expect(document.cookie).toContain("auth_token=test-token");
  });
});
