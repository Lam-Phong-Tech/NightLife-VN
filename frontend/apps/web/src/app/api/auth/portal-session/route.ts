import { NextResponse } from "next/server";

import {
  getNightlifeHostKind,
  isSafePortalRedirect,
  nightlifeOrigins,
  portalHomePath,
  portalOrigin,
  portalRoles,
  type AuthPortal,
} from "@/lib/auth/hosts";

type PublicUser = {
  email: string;
  displayName?: string | null;
  role: string;
};

const authCookieNames = ["auth_token", "user_role", "user_email", "user_name"] as const;
const authCookiePrefixes = ["", "partner_", "admin_"] as const;

const backendBaseUrl = () =>
  (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === "production" ? "http://127.0.0.1:3012" : "http://127.0.0.1:3001")
  ).replace(/\/+$/, "");

const cookiePrefixForPortal = (portal: AuthPortal) => {
  if (portal === "admin") return "admin_";
  if (portal === "partner") return "partner_";
  return "";
};

const tokenMaxAge = (token: string) => {
  try {
    const payload = token.split(".")[1];
    if (!payload) return 60 * 60 * 24;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const decoded = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      exp?: unknown;
    };
    if (typeof decoded.exp !== "number") return 60 * 60 * 24;
    return Math.max(1, Math.min(60 * 60 * 24, decoded.exp - Math.floor(Date.now() / 1000)));
  } catch {
    return 60 * 60 * 24;
  }
};

const clearPortalCookies = (response: NextResponse) => {
  for (const prefix of authCookiePrefixes) {
    for (const name of authCookieNames) {
      response.cookies.set(`${prefix}${name}`, "", {
        expires: new Date(0),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }
  }
};

export async function POST(request: Request) {
  const requestUrl = new URL(request.url);
  const hostKind = getNightlifeHostKind(requestUrl.hostname);
  const origin = request.headers.get("origin");

  if (hostKind !== "local" && origin !== nightlifeOrigins.auth && origin !== requestUrl.origin) {
    return NextResponse.json({ message: "Nguồn đăng nhập không hợp lệ." }, { status: 403 });
  }

  const formData = await request.formData();
  const accessToken = String(formData.get("access_token") || "");
  const requestedPortal = String(formData.get("portal") || "");
  const portal: AuthPortal =
    requestedPortal === "admin" || requestedPortal === "partner" ? requestedPortal : "member";
  const expectedHostKind = portal === "member" ? "public" : portal;

  if (hostKind !== "local" && hostKind !== "unknown" && hostKind !== expectedHostKind) {
    return NextResponse.json(
      { message: "Phiên đăng nhập không đúng cổng truy cập." },
      { status: 403 },
    );
  }

  if (!accessToken) {
    return NextResponse.json({ message: "Thiếu phiên đăng nhập." }, { status: 400 });
  }

  const profileResponse = await fetch(`${backendBaseUrl()}/auth/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!profileResponse.ok) {
    return NextResponse.json({ message: "Phiên đăng nhập không còn hợp lệ." }, { status: 401 });
  }

  const user = (await profileResponse.json()) as PublicUser;
  const normalizedRole = String(user.role || "").toUpperCase();
  if (!portalRoles(portal).includes(normalizedRole)) {
    return NextResponse.json(
      { message: "Tài khoản không có quyền truy cập cổng này." },
      { status: 403 },
    );
  }

  const requestedRedirect = String(formData.get("redirect") || "");
  const redirectPath = isSafePortalRedirect(portal, requestedRedirect)
    ? requestedRedirect
    : portalHomePath(portal);
  const redirectOrigin =
    hostKind === "local" || hostKind === "unknown"
      ? requestUrl.origin
      : portalOrigin(portal);
  const response = NextResponse.redirect(new URL(redirectPath, redirectOrigin), 303);
  clearPortalCookies(response);

  const prefix = cookiePrefixForPortal(portal);
  const maxAge = tokenMaxAge(accessToken);
  const sharedOptions = {
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  response.cookies.set(`${prefix}auth_token`, accessToken, sharedOptions);
  response.cookies.set(`${prefix}user_role`, normalizedRole, sharedOptions);
  response.cookies.set(`${prefix}user_email`, user.email, sharedOptions);
  response.cookies.set(`${prefix}user_name`, user.displayName || user.email, sharedOptions);

  return response;
}
