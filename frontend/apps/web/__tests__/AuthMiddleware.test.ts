import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { middleware } from "@/middleware";

const createToken = (role: string, expiresAt = Math.floor(Date.now() / 1000) + 3600) => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    role,
    exp: expiresAt,
  })}.test`;
};

const runMiddleware = (
  pathname: string,
  cookies: Record<string, string> = {},
  hostname = "nightlife.test",
  proxyHeaders: Record<string, string> = {},
) => {
  const cookieHeader = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  const request = new NextRequest(`https://${hostname}${pathname}`, {
    headers: {
      ...proxyHeaders,
      ...(cookieHeader ? { cookie: cookieHeader } : {}),
    },
  });

  return middleware(request);
};

const expectBlockedRedirect = (
  response: ReturnType<typeof middleware>,
  expected: {
    pathname: string;
    requestedPortal: string;
    activeRole: string;
  },
) => {
  const location = response.headers.get("location");
  expect(location).not.toBeNull();

  const url = new URL(location || "https://nightlife.test");
  expect(url.pathname).toBe(expected.pathname);
  expect(url.searchParams.get("auth_notice")).toBe("login-blocked");
  expect(url.searchParams.get("requested_portal")).toBe(expected.requestedPortal);
  expect(url.searchParams.get("active_role")).toBe(expected.activeRole);
};

describe("auth middleware login-page redirects", () => {
  it.each([
    ["/admin/dang-nhap", "admin"],
    ["/dang-nhap-doi-tac", "partner"],
    ["/dang-nhap", "member"],
  ])("redirects an authenticated admin away from %s", (pathname, requestedPortal) => {
    const response = runMiddleware(pathname, {
      admin_auth_token: createToken("SUPER_ADMIN"),
    });

    expectBlockedRedirect(response, {
      pathname: "/admin",
      requestedPortal,
      activeRole: "SUPER_ADMIN",
    });
  });

  it("redirects an authenticated partner to the partner portal", () => {
    const response = runMiddleware("/dang-nhap-doi-tac", {
      partner_auth_token: createToken("PARTNER"),
    });

    expectBlockedRedirect(response, {
      pathname: "/partner",
      requestedPortal: "partner",
      activeRole: "PARTNER",
    });
  });

  it("blocks an authenticated partner from opening partner registration", () => {
    const response = runMiddleware("/dang-ky-doi-tac", {
      partner_auth_token: createToken("PARTNER"),
    });

    const location = response.headers.get("location");
    expect(location).not.toBeNull();

    const url = new URL(location || "https://nightlife.test");
    expect(url.pathname).toBe("/partner");
    expect(url.searchParams.get("auth_notice")).toBe("partner-registration-blocked");
    expect(url.searchParams.get("active_role")).toBe("PARTNER");
  });

  it("keeps partner registration public for visitors without a session", () => {
    const response = runMiddleware("/dang-ky-doi-tac");

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an authenticated member to the member account page", () => {
    const response = runMiddleware("/dang-nhap", {
      auth_token: createToken("USER"),
    });

    expectBlockedRedirect(response, {
      pathname: "/tai-khoan",
      requestedPortal: "member",
      activeRole: "USER",
    });
  });

  it("redirects directly to the active admin portal when another protected portal is requested", () => {
    const response = runMiddleware("/partner", {
      admin_auth_token: createToken("ADMIN"),
    });

    expectBlockedRedirect(response, {
      pathname: "/admin",
      requestedPortal: "partner",
      activeRole: "ADMIN",
    });
  });

  it("allows the login page when the stored token has expired", () => {
    const response = runMiddleware("/admin/dang-nhap", {
      admin_auth_token: createToken("ADMIN", Math.floor(Date.now() / 1000) - 60),
    });

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows the login page when the browser profile has no session", () => {
    const response = runMiddleware("/dang-nhap");

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("sends public admin routes to the dedicated admin hostname", () => {
    const response = runMiddleware("/admin/bookings", {}, "demonightlight.test9.io.vn");

    expect(response.headers.get("location")).toBe(
      "https://admin.demonightlight.test9.io.vn/admin/bookings",
    );
  });

  it("sends unauthenticated admin hostname traffic to central auth", () => {
    const response = runMiddleware("/", {}, "admin.demonightlight.test9.io.vn");
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.searchParams.get("portal")).toBe("admin");
    expect(location.searchParams.get("redirect")).toBe("/admin");
  });

  it("uses the forwarded hostname when running behind the VPS reverse proxy", () => {
    const response = runMiddleware("/", {}, "127.0.0.1", {
      host: "127.0.0.1:3009",
      "x-forwarded-host": "admin.demonightlight.test9.io.vn",
    });
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.searchParams.get("portal")).toBe("admin");
    expect(location.searchParams.get("redirect")).toBe("/admin");
  });

  it("uses the Host header when X-Forwarded-Host is unavailable", () => {
    const response = runMiddleware("/partner", {}, "127.0.0.1", {
      host: "demonightlight.test9.io.vn",
    });

    expect(response.headers.get("location")).toBe(
      "https://partner.demonightlight.test9.io.vn/partner",
    );
  });

  it("rewrites authenticated partner hostname root to the partner application", () => {
    const response = runMiddleware(
      "/",
      { partner_auth_token: createToken("STAFF") },
      "partner.demonightlight.test9.io.vn",
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://partner.demonightlight.test9.io.vn/partner",
    );
  });

  it("hands an active central auth session to the matching portal", () => {
    const response = runMiddleware(
      "/?portal=partner",
      { admin_auth_token: createToken("OPERATOR") },
      "auth.demonightlight.test9.io.vn",
    );
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.pathname).toBe("/chuyen-tiep");
    expect(location.searchParams.get("portal")).toBe("admin");
    expect(location.searchParams.get("active_role")).toBe("OPERATOR");
    expect(location.searchParams.get("requested_portal")).toBe("partner");
  });
});
