import { afterEach, describe, expect, it, vi } from "vitest";

const { apiClient } = vi.hoisted(() => ({ apiClient: vi.fn() }));

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return { ...actual, apiClient };
});

import { ApiError } from "@/lib/api/client";
import { loginPartner } from "@/lib/api/auth";

const demoPartnerCredentials = {
  email: "partner@nightlife.vn",
  password: "Str0ngPass!",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("demo login fallback", () => {
  it("never substitutes a demo token for a production authentication failure", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const error = new ApiError(401, "Email hoặc mật khẩu không đúng.");
    apiClient.mockRejectedValueOnce(error);

    await expect(loginPartner(demoPartnerCredentials)).rejects.toBe(error);
  });

  it("does not mask 401, 403, or 404 responses during local development", async () => {
    vi.stubEnv("NODE_ENV", "development");

    for (const status of [401, 403, 404]) {
      const error = new ApiError(status, `HTTP ${status}`);
      apiClient.mockRejectedValueOnce(error);

      await expect(loginPartner(demoPartnerCredentials)).rejects.toBe(error);
    }
  });

  it("allows the local demo account only while the API is unavailable", async () => {
    vi.stubEnv("NODE_ENV", "development");
    apiClient.mockRejectedValueOnce(new ApiError(503, "Service unavailable"));

    await expect(loginPartner(demoPartnerCredentials)).resolves.toMatchObject({
      accessToken: expect.stringContaining(".demo"),
      user: { role: "PARTNER" },
    });
  });
});
