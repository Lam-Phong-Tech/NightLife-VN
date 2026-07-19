import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "./route";

const token = [
  "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0",
  Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: "ADMIN",
    }),
  ).toString("base64url"),
  "test",
].join(".");

const portalRequest = () => {
  const body = new URLSearchParams({
    access_token: token,
    portal: "admin",
    redirect: "/admin",
  });

  return new Request("http://localhost:3009/api/auth/portal-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Host: "localhost:3009",
      Origin: "https://auth.demonightlight.test9.io.vn",
      "X-Forwarded-Host": "admin.demonightlight.test9.io.vn",
      "X-Forwarded-Proto": "https",
    },
    body,
  });
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("portal session handoff", () => {
  it("redirects to the public portal hostname behind the VPS reverse proxy", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          email: "admin@nightlife.vn",
          displayName: "Admin",
          role: "ADMIN",
        }),
      ),
    );

    const response = await POST(portalRequest());

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("https://admin.demonightlight.test9.io.vn/admin");
    expect(response.cookies.get("admin_auth_token")?.value).toBe(token);
  });
});
