import { beforeEach, describe, expect, it, vi } from "vitest";

import { activateExclusiveAuthSession, logoutBrowserProfile } from "@/lib/api/auth";
import {
  clearAuthSession,
  getActiveBrowserAuthSession,
  getAllAuthSessionTokens,
  setAuthSession,
  type AuthResponse,
} from "@/lib/auth/session";

const cookieNames = [
  "auth_token",
  "user_role",
  "user_email",
  "user_name",
  "partner_auth_token",
  "partner_user_role",
  "partner_user_email",
  "partner_user_name",
  "admin_auth_token",
  "admin_user_role",
  "admin_user_email",
  "admin_user_name",
];

const expireAllAuthCookies = () => {
  for (const name of cookieNames) {
    document.cookie = `${name}=; path=/; max-age=0`;
  }
};

const adminSession: AuthResponse = {
  accessToken: "new-admin-token",
  user: {
    id: "admin-1",
    email: "admin@nightlife.vn",
    displayName: "Admin",
    role: "ADMIN",
  },
};

describe("exclusive browser auth session", () => {
  beforeEach(() => {
    expireAllAuthCookies();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  });

  it("replaces member, partner, and admin storage with only the new session", () => {
    document.cookie = "auth_token=old-member-token; path=/";
    document.cookie = "partner_auth_token=old-partner-token; path=/";
    document.cookie = "admin_auth_token=old-admin-token; path=/";
    window.localStorage.setItem("nightlife_user", '{"role":"USER"}');
    window.localStorage.setItem("nightlife_partner_user", '{"role":"PARTNER"}');
    window.localStorage.setItem("nightlife_admin_user", '{"role":"ADMIN"}');
    window.history.replaceState({}, "", "/admin/dang-nhap");

    setAuthSession(adminSession);

    expect(document.cookie).toContain("admin_auth_token=new-admin-token");
    expect(document.cookie).not.toContain("auth_token=old-member-token");
    expect(document.cookie).not.toContain("partner_auth_token=old-partner-token");
    expect(document.cookie).not.toContain("admin_auth_token=old-admin-token");
    expect(window.localStorage.getItem("nightlife_user")).toBeNull();
    expect(window.localStorage.getItem("nightlife_partner_user")).toBeNull();
    expect(JSON.parse(window.localStorage.getItem("nightlife_admin_user") || "{}")).toMatchObject({
      id: "admin-1",
      role: "ADMIN",
    });
  });

  it("clears every scoped session when logging out from any portal", () => {
    document.cookie = "auth_token=member-token; path=/";
    document.cookie = "partner_auth_token=partner-token; path=/";
    document.cookie = "admin_auth_token=admin-token; path=/";
    window.localStorage.setItem("nightlife_user", "{}");
    window.localStorage.setItem("nightlife_partner_user", "{}");
    window.localStorage.setItem("nightlife_admin_user", "{}");
    window.history.replaceState({}, "", "/partner");

    clearAuthSession();

    expect(getAllAuthSessionTokens()).toEqual([]);
    expect(window.localStorage.getItem("nightlife_user")).toBeNull();
    expect(window.localStorage.getItem("nightlife_partner_user")).toBeNull();
    expect(window.localStorage.getItem("nightlife_admin_user")).toBeNull();
  });

  it("stores the session in the scope dictated by its role, not the current URL", () => {
    window.history.replaceState({}, "", "/admin/dang-nhap");

    setAuthSession({
      accessToken: "member-token",
      user: {
        id: "member-1",
        email: "member@nightlife.vn",
        displayName: "Member",
        role: "USER",
      },
    });

    expect(document.cookie).toContain("auth_token=member-token");
    expect(document.cookie).not.toContain("admin_auth_token=member-token");
    expect(window.localStorage.getItem("nightlife_user")).toContain('"role":"USER"');
    expect(window.localStorage.getItem("nightlife_admin_user")).toBeNull();
  });

  it("detects the active identity across portal URLs for the client-side login guard", () => {
    setAuthSession(adminSession);
    window.history.replaceState({}, "", "/dang-nhap-doi-tac");

    expect(getActiveBrowserAuthSession()).toEqual({
      role: "ADMIN",
      homePath: "/admin",
    });
  });

  it("revokes all previous tokens before completing an identity switch", async () => {
    document.cookie = "auth_token=old-member-token; path=/";
    document.cookie = "partner_auth_token=old-partner-token; path=/";
    window.history.replaceState({}, "", "/admin/dang-nhap");
    let finishRevocation: (() => void) | undefined;
    const revocationPending = new Promise<Response>((resolve) => {
      finishRevocation = () => resolve(new Response("{}", { status: 201 }));
    });
    const fetchMock = vi.spyOn(globalThis, "fetch").mockReturnValue(revocationPending);

    const activation = activateExclusiveAuthSession(adminSession);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getAllAuthSessionTokens()).toEqual(["old-member-token", "old-partner-token"]);
    expect(
      fetchMock.mock.calls.map(
        ([, options]) => (options?.headers as Record<string, string>).Authorization,
      ),
    ).toEqual(expect.arrayContaining(["Bearer old-member-token", "Bearer old-partner-token"]));

    finishRevocation?.();
    await activation;

    expect(getAllAuthSessionTokens()).toEqual(["new-admin-token"]);
  });

  it("revokes and removes every legacy scoped token on profile logout", async () => {
    document.cookie = "auth_token=member-token; path=/";
    document.cookie = "partner_auth_token=partner-token; path=/";
    document.cookie = "admin_auth_token=admin-token; path=/";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("{}", { status: 201 }));

    await logoutBrowserProfile();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getAllAuthSessionTokens()).toEqual([]);
  });
});
