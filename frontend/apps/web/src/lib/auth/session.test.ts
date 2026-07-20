import { afterEach, describe, expect, it } from "vitest";

import { getAuthUser } from "./session";

const createToken = (payload: Record<string, unknown>) =>
  [
    "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0",
    Buffer.from(JSON.stringify(payload)).toString("base64url"),
    "test",
  ].join(".");

const clearCookies = () => {
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0]?.trim();
    if (name) {
      document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  }
};

afterEach(() => {
  clearCookies();
  localStorage.clear();
  window.history.replaceState({}, "", "/");
});

describe("getAuthUser", () => {
  it("restores the user id from the JWT after a portal subdomain handoff", () => {
    window.history.replaceState({}, "", "/admin");
    const token = createToken({
      sub: "45bd2214-bb58-4f3e-8bd5-e466cacbf254",
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    document.cookie = `admin_auth_token=${token}; path=/`;
    document.cookie = "admin_user_role=ADMIN; path=/";
    document.cookie = "admin_user_email=admin%40nightlife.vn; path=/";
    document.cookie = "admin_user_name=Nightlife%20Admin; path=/";

    expect(getAuthUser()).toEqual({
      id: "45bd2214-bb58-4f3e-8bd5-e466cacbf254",
      email: "admin@nightlife.vn",
      displayName: "Nightlife Admin",
      role: "ADMIN",
    });
  });

  it("rejects a portal token that does not contain a user id", () => {
    window.history.replaceState({}, "", "/admin");
    const token = createToken({
      role: "ADMIN",
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    document.cookie = `admin_auth_token=${token}; path=/`;
    document.cookie = "admin_user_role=ADMIN; path=/";
    document.cookie = "admin_user_email=admin%40nightlife.vn; path=/";

    expect(getAuthUser()).toBeNull();
  });
});
