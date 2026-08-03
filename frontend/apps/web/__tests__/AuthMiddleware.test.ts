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

describe("auth middleware login-page redirects", () => {
  it.each([
    ["/stores", "/ja/stores"],
    ["/casts", "/ja/casts"],
    ["/stores/moonlight-bar", "/ja/stores/moonlight-bar"],
    ["/casts/abc", "/ja/casts/abc"],
  ])("keeps the stored public language when localizing %s", async (pathname, expectedPath) => {
    const response = await runMiddleware(
      pathname,
      { vietyoru_shared_language: "ja" },
      "demonightlight.test9.io.vn",
    );

    expect(new URL(response.headers.get("location") || "https://invalid.test").pathname).toBe(
      expectedPath,
    );
    expect(response.status).toBe(308);
  });

  it.each([
    ["/admin/dang-nhap", "admin_auth_token", "SUPER_ADMIN"],
    ["/dang-nhap-doi-tac", "partner_auth_token", "PARTNER"],
    ["/dang-nhap", "auth_token", "USER"],
  ])(
    "lets %s validate its own stored session against the backend",
    async (pathname, cookieName, role) => {
      const response = await runMiddleware(pathname, {
        [cookieName]: createToken(role),
      });

      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    },
  );

  it.each(["/dang-nhap-doi-tac", "/dang-nhap"])(
    "allows an authenticated admin to open the independent login page %s",
    async (pathname) => {
      const response = await runMiddleware(pathname, {
        admin_auth_token: createToken("SUPER_ADMIN"),
      });

      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    },
  );

  it("blocks an authenticated partner from opening partner registration", async () => {
    const response = await runMiddleware("/dang-ky-doi-tac", {
      partner_auth_token: createToken("PARTNER"),
    });

    const location = response.headers.get("location");
    expect(location).not.toBeNull();

    const url = new URL(location || "https://nightlife.test");
    expect(url.pathname).toBe("/partner");
    expect(url.searchParams.get("auth_notice")).toBe("partner-registration-blocked");
    expect(url.searchParams.get("active_role")).toBe("PARTNER");
  });

  it("keeps partner registration public for visitors without a session", async () => {
    const response = await runMiddleware("/dang-ky-doi-tac");

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("requests a partner login instead of redirecting to another active portal", async () => {
    const response = await runMiddleware("/partner", {
      admin_auth_token: createToken("ADMIN"),
    });
    const location = new URL(response.headers.get("location") || "https://nightlife.test");

    expect(location.pathname).toBe("/");
    expect(location.searchParams.get("portal")).toBe("partner");
    expect(location.searchParams.get("redirect")).toBe("/partner");
  });

  it("allows the login page when the stored token has expired", async () => {
    const response = await runMiddleware("/admin/dang-nhap", {
      admin_auth_token: createToken("ADMIN", Math.floor(Date.now() / 1000) - 60),
    });

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows the login page when the browser profile has no session", async () => {
    const response = await runMiddleware("/dang-nhap");

    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("sends public admin routes to the dedicated admin hostname", async () => {
    const response = await runMiddleware("/admin/bookings", {}, "demonightlight.test9.io.vn");

    expect(response.headers.get("location")).toBe(
      "https://admin.demonightlight.test9.io.vn/admin/bookings",
    );
  });

  it("sends unauthenticated admin hostname traffic to central auth", async () => {
    const response = await runMiddleware("/", {}, "admin.demonightlight.test9.io.vn");
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.searchParams.get("portal")).toBe("admin");
    expect(location.searchParams.get("redirect")).toBe("/admin");
  });

  it("uses the forwarded hostname when running behind the VPS reverse proxy", async () => {
    const response = await runMiddleware("/", {}, "127.0.0.1", {
      host: "127.0.0.1:3009",
      "x-forwarded-host": "admin.demonightlight.test9.io.vn",
    });
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.searchParams.get("portal")).toBe("admin");
    expect(location.searchParams.get("redirect")).toBe("/admin");
  });

  it("uses the Host header when X-Forwarded-Host is unavailable", async () => {
    const response = await runMiddleware("/partner", {}, "127.0.0.1", {
      host: "demonightlight.test9.io.vn",
    });

    expect(response.headers.get("location")).toBe(
      "https://partner.demonightlight.test9.io.vn/partner",
    );
  });

  it.each([
    ["admin", "/admin", "/admin/dang-nhap"],
    ["partner", "/partner", "/dang-nhap-doi-tac"],
    ["member", "/tai-khoan", "/dang-nhap"],
  ])(
    "redirects the central auth root to the visible %s login path",
    async (portal, redirectPath, expectedLoginPath) => {
      const response = await runMiddleware(
        `/?portal=${portal}&redirect=${encodeURIComponent(redirectPath)}`,
        {},
        "127.0.0.1",
        {
          host: "127.0.0.1:3009",
          "x-forwarded-host": "auth.demonightlight.test9.io.vn",
        },
      );
      const location = new URL(response.headers.get("location") || "https://invalid.test");

      expect(response.headers.get("x-middleware-rewrite")).toBeNull();
      expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
      expect(location.pathname).toBe(expectedLoginPath);
      expect(location.searchParams.get("portal")).toBe(portal);
      expect(location.searchParams.get("redirect")).toBe(redirectPath);
    },
  );

  it("rewrites authenticated partner hostname root to the partner application", async () => {
    const response = await runMiddleware(
      "/",
      { partner_auth_token: createToken("STAFF") },
      "partner.demonightlight.test9.io.vn",
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://partner.demonightlight.test9.io.vn/partner",
    );
  });

  it("opens the matching login page so the client can validate a central session", async () => {
    const response = await runMiddleware(
      "/?portal=partner",
      { partner_auth_token: createToken("STAFF") },
      "auth.demonightlight.test9.io.vn",
    );
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.pathname).toBe("/dang-nhap-doi-tac");
    expect(location.searchParams.get("portal")).toBe("partner");
  });

  it("keeps the central login validation on the public auth hostname behind the reverse proxy", async () => {
    const response = await runMiddleware(
      "/?portal=partner",
      { partner_auth_token: createToken("PARTNER") },
      "127.0.0.1",
      {
        host: "127.0.0.1:3009",
        "x-forwarded-host": "auth.demonightlight.test9.io.vn",
      },
    );
    const location = new URL(response.headers.get("location") || "https://invalid.test");

    expect(location.origin).toBe("https://auth.demonightlight.test9.io.vn");
    expect(location.pathname).toBe("/dang-nhap-doi-tac");
    expect(location.searchParams.get("portal")).toBe("partner");
  });
});
