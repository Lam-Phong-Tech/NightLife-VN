import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthRedirectNotice } from "@/components/auth/AuthRedirectNotice";

const feedbackMocks = vi.hoisted(() => ({
  showToast: vi.fn(),
}));

vi.mock("@/components/ui/SystemFeedback", () => ({
  useSystemFeedback: () => ({
    showToast: feedbackMocks.showToast,
  }),
}));

describe("auth redirect notice", () => {
  beforeEach(() => {
    feedbackMocks.showToast.mockReset();
    window.history.replaceState(
      {},
      "",
      "/admin?auth_notice=login-blocked&requested_portal=partner&active_role=SUPER_ADMIN",
    );
  });

  it("explains that the current identity must log out before changing portal", async () => {
    render(<AuthRedirectNotice />);

    await waitFor(() => {
      expect(feedbackMocks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "warning",
          title: "Bạn đang đăng nhập với quyền Super Admin.",
          description: "Vui lòng đăng xuất trước khi đăng nhập Partner.",
        }),
      );
    });

    expect(window.location.pathname).toBe("/admin");
    expect(window.location.search).toBe("");
  });

  it("explains why an authenticated partner cannot submit another registration", async () => {
    window.history.replaceState(
      {},
      "",
      "/partner?auth_notice=partner-registration-blocked&active_role=PARTNER",
    );

    render(<AuthRedirectNotice />);

    await waitFor(() => {
      expect(feedbackMocks.showToast).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: "warning",
          title: "Tài khoản Partner đã được kích hoạt.",
          description: "Tài khoản Partner hiện tại không thể đăng ký thêm đối tác mới.",
        }),
      );
    });

    expect(window.location.pathname).toBe("/partner");
    expect(window.location.search).toBe("");
  });
});
