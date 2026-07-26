import { describe, expect, it } from "vitest";

import { POST } from "./route";

const clearRequest = (portal: "member" | "partner" | "admin", origin: string) =>
  new Request("https://auth.demonightlight.test9.io.vn/api/auth/clear-session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify({ portal }),
  });

describe("central auth scoped session cleanup", () => {
  it("clears only the member cookie scope for the public portal", async () => {
    const response = await POST(clearRequest("member", "https://demonightlight.test9.io.vn"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("auth_token")?.value).toBe("");
    expect(response.cookies.get("admin_auth_token")).toBeUndefined();
    expect(response.cookies.get("partner_auth_token")).toBeUndefined();
  });

  it("clears only the admin cookie scope for the admin portal", async () => {
    const response = await POST(clearRequest("admin", "https://admin.demonightlight.test9.io.vn"));

    expect(response.status).toBe(200);
    expect(response.cookies.get("admin_auth_token")?.value).toBe("");
    expect(response.cookies.get("auth_token")).toBeUndefined();
    expect(response.cookies.get("partner_auth_token")).toBeUndefined();
  });

  it("prevents one portal origin from clearing another portal session", async () => {
    const response = await POST(clearRequest("admin", "https://demonightlight.test9.io.vn"));

    expect(response.status).toBe(403);
  });
});
