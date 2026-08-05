import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PartnerPage from "../src/app/partner/page";
import PartnerBillSubmitPage from "../src/app/partner/gui-hoa-don/page";
import { SystemFeedbackProvider } from "../src/components/ui/SystemFeedback";

const mockReplace = vi.fn();
const mockPush = vi.fn();
const mockRedirect = vi.fn();
let mockSearchParamsStr = "panel=bill";

vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mockSearchParamsStr),
  useRouter: () => ({ push: mockPush, replace: mockReplace, back: vi.fn() }),
  redirect: (url: string) => mockRedirect(url),
}));

vi.mock("@/lib/auth/session", () => ({
  clearAuthSession: vi.fn(),
  getAuthUser: () => ({ role: "PARTNER", displayName: "Partner Demo" }),
}));

vi.mock("@/lib/api/client", () => ({
  apiClient: vi.fn().mockImplementation((path: string) => {
    if (path === "/partner/stores") return Promise.resolve([]);
    return Promise.resolve([]);
  }),
  apiFormDataClient: vi.fn(),
  getAuthToken: vi.fn(() => "mock-token"),
  resolveClientUrl: vi.fn((url: string) => url),
  ApiError: class ApiError extends Error {},
  translateApiMessage: vi.fn(),
}));

describe("Partner legacy bill submit redirects", () => {
  beforeEach(() => {
    mockSearchParamsStr = "panel=bill";
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("1. Legacy /partner/gui-hoa-don route redirects to /partner/activity/new-bill", () => {
    PartnerBillSubmitPage();
    expect(mockRedirect).toHaveBeenCalledWith("/partner/activity/new-bill");
  });

  it("2. Partner page with ?panel=bill replaces route with /partner/activity/new-bill", async () => {
    mockSearchParamsStr = "panel=bill";
    render(
      <SystemFeedbackProvider>
        <PartnerPage />
      </SystemFeedbackProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/partner/activity/new-bill");
    });
  });

  it("3. Partner page with ?panel=activity replaces route with /partner/activity", async () => {
    mockSearchParamsStr = "panel=activity";
    render(
      <SystemFeedbackProvider>
        <PartnerPage />
      </SystemFeedbackProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/partner/activity");
    });
  });
});
