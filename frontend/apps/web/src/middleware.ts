import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  authLoginUrl,
  getNightlifeHostKind,
  nightlifeOrigins,
  portalForRole,
  portalHomePath,
  portalOrigin,
  type AuthPortal,
} from "@/lib/auth/hosts";

type JwtPayload = {
  role?: unknown;
  exp?: unknown;
};

const loginPaths = new Set(["/dang-nhap", "/dang-nhap-doi-tac", "/admin/dang-nhap"]);
const portalSessions = [
  {
    prefix: "admin_",
    roles: ["OPERATOR", "ADMIN", "SUPER_ADMIN"],
    homePath: "/admin",
  },
  {
    prefix: "partner_",
    roles: ["PARTNER", "STAFF"],
    homePath: "/partner",
  },
  {
    prefix: "",
    roles: ["USER"],
    homePath: "/tai-khoan",
  },
] as const;

function getRequestHostname(request: NextRequest) {
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || request.headers.get("host") || request.nextUrl.hostname;

  return host.replace(/:\d+$/, "").toLowerCase();
}

/**
 * Dummy function to parse JWT payload without external dependencies in Edge Runtime.
 * In a real app, use `jose` to verify the signature as well.
 */
function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

function getSessionRole(request: NextRequest, token: string, prefix: string) {
  const payload = parseJwtPayload(token);
  if (typeof payload?.exp === "number" && payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  if (payload?.role) {
    return String(payload.role).toUpperCase();
  }

  // Fallback for local demo sessions whose token is not a signed JWT.
  return (request.cookies.get(`${prefix}user_role`)?.value || "PUBLIC").toUpperCase();
}

function getAuthenticatedHomePath(request: NextRequest) {
  for (const session of portalSessions) {
    const token = request.cookies.get(`${session.prefix}auth_token`)?.value;
    if (!token) continue;

    const role = getSessionRole(request, token, session.prefix);
    if (role && session.roles.some((allowedRole) => allowedRole === role)) {
      return {
        homePath: session.homePath,
        role,
      };
    }
  }

  return null;
}

function getRequestedPortal(pathname: string): AuthPortal {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/partner") || pathname === "/dang-nhap-doi-tac") return "partner";
  return "member";
}

function getRequestedPortalForNotice(request: NextRequest, pathname: string): AuthPortal {
  const portal = request.nextUrl.searchParams.get("portal");
  if (portal === "admin" || portal === "partner" || portal === "member") {
    return portal;
  }

  return getRequestedPortal(pathname);
}

function externalPortalUrl(request: NextRequest, portal: AuthPortal, pathname: string) {
  const origin =
    getNightlifeHostKind(getRequestHostname(request)) === "local"
      ? request.nextUrl.origin
      : portalOrigin(portal);
  const url = new URL(pathname, origin);
  url.search = request.nextUrl.search;
  return url;
}

function centralLoginUrl(request: NextRequest, portal: AuthPortal, redirectPath: string) {
  if (getNightlifeHostKind(getRequestHostname(request)) === "local") {
    const localLoginPath =
      portal === "admin"
        ? "/admin/dang-nhap"
        : portal === "partner"
          ? "/dang-nhap-doi-tac"
          : "/dang-nhap";
    const url = new URL(localLoginPath, request.url);
    url.searchParams.set("redirect", redirectPath);
    return url;
  }

  return authLoginUrl(portal, redirectPath);
}

function redirectActiveSession(
  request: NextRequest,
  session: NonNullable<ReturnType<typeof getAuthenticatedHomePath>>,
  requestedPathname: string,
) {
  const portal = portalForRole(session.role);
  const requestedPortal = getRequestedPortalForNotice(request, requestedPathname);
  if (getNightlifeHostKind(getRequestHostname(request)) === "auth") {
    const handoffUrl = new URL("/chuyen-tiep", nightlifeOrigins.auth);
    handoffUrl.searchParams.set("portal", portal);
    handoffUrl.searchParams.set("redirect", portalHomePath(portal));
    handoffUrl.searchParams.set("auth_notice", "login-blocked");
    handoffUrl.searchParams.set("requested_portal", requestedPortal);
    handoffUrl.searchParams.set("active_role", session.role);
    return NextResponse.redirect(handoffUrl);
  }

  const redirectUrl = externalPortalUrl(request, portal, session.homePath);
  redirectUrl.searchParams.set("auth_notice", "login-blocked");
  redirectUrl.searchParams.set("requested_portal", requestedPortal);
  redirectUrl.searchParams.set("active_role", session.role);
  return NextResponse.redirect(redirectUrl);
}

function redirectPartnerRegistration(request: NextRequest) {
  const redirectUrl = externalPortalUrl(request, "partner", "/partner");
  redirectUrl.searchParams.set("auth_notice", "partner-registration-blocked");
  redirectUrl.searchParams.set("active_role", "PARTNER");
  return NextResponse.redirect(redirectUrl);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostKind = getNightlifeHostKind(getRequestHostname(request));
  const memberPaths = ["/tai-khoan", "/bao-mat-tai-khoan", "/da-luu", "/gui-hoa-don", "/vi-uu-dai"];
  const isMemberPath = memberPaths.some((p) => pathname.startsWith(p));
  const isPartnerPath = pathname.startsWith("/partner");
  const isAdminLoginPath = pathname === "/admin/dang-nhap";
  const isAdminPath = pathname.startsWith("/admin") && !isAdminLoginPath;

  if (hostKind === "auth") {
    if (pathname === "/chuyen-tiep") {
      return NextResponse.next();
    }

    const authenticatedSession = getAuthenticatedHomePath(request);
    if (authenticatedSession) {
      return redirectActiveSession(request, authenticatedSession, pathname);
    }

    if (pathname === "/") {
      const portalParam = request.nextUrl.searchParams.get("portal");
      const portal: AuthPortal =
        portalParam === "admin" || portalParam === "partner" ? portalParam : "member";
      const loginPath =
        portal === "admin"
          ? "/admin/dang-nhap"
          : portal === "partner"
            ? "/dang-nhap-doi-tac"
            : "/dang-nhap";
      return NextResponse.rewrite(new URL(loginPath + request.nextUrl.search, request.url));
    }

    if (!loginPaths.has(pathname)) {
      const publicUrl = new URL(pathname + request.nextUrl.search, nightlifeOrigins.public);
      return NextResponse.redirect(publicUrl);
    }
  }

  if (hostKind !== "local" && hostKind !== "unknown" && hostKind !== "auth") {
    if (loginPaths.has(pathname)) {
      const authenticatedSession = getAuthenticatedHomePath(request);
      if (authenticatedSession) {
        return redirectActiveSession(request, authenticatedSession, pathname);
      }
      const portal = getRequestedPortal(pathname);
      const requestedRedirect =
        request.nextUrl.searchParams.get("redirect") || portalHomePath(portal);
      return NextResponse.redirect(centralLoginUrl(request, portal, requestedRedirect));
    }

    if (hostKind === "public" && isAdminPath) {
      return NextResponse.redirect(externalPortalUrl(request, "admin", pathname));
    }
    if (hostKind === "public" && isPartnerPath) {
      return NextResponse.redirect(externalPortalUrl(request, "partner", pathname));
    }
    if (hostKind === "admin" && pathname === "/") {
      const adminToken = request.cookies.get("admin_auth_token")?.value;
      const adminRole = adminToken ? getSessionRole(request, adminToken, "admin_") : null;
      if (!adminRole || !["OPERATOR", "ADMIN", "SUPER_ADMIN"].includes(adminRole)) {
        return NextResponse.redirect(centralLoginUrl(request, "admin", "/admin"));
      }
      return NextResponse.rewrite(new URL("/admin" + request.nextUrl.search, request.url));
    }
    if (hostKind === "partner" && pathname === "/") {
      const partnerToken = request.cookies.get("partner_auth_token")?.value;
      const partnerRole = partnerToken ? getSessionRole(request, partnerToken, "partner_") : null;
      if (!partnerRole || !["PARTNER", "STAFF"].includes(partnerRole)) {
        return NextResponse.redirect(centralLoginUrl(request, "partner", "/partner"));
      }
      return NextResponse.rewrite(new URL("/partner" + request.nextUrl.search, request.url));
    }
    if (hostKind === "admin" && isPartnerPath) {
      return NextResponse.redirect(externalPortalUrl(request, "partner", pathname));
    }
    if (hostKind === "partner" && isAdminPath) {
      return NextResponse.redirect(externalPortalUrl(request, "admin", pathname));
    }
  }

  if (loginPaths.has(pathname)) {
    const authenticatedSession = getAuthenticatedHomePath(request);
    if (authenticatedSession) {
      return redirectActiveSession(request, authenticatedSession, pathname);
    }
  }

  if (pathname === "/dang-ky-doi-tac") {
    const authenticatedSession = getAuthenticatedHomePath(request);
    if (authenticatedSession?.role === "PARTNER") {
      return redirectPartnerRegistration(request);
    }
  }

  const prefix = pathname.startsWith("/admin")
    ? "admin_"
    : pathname.startsWith("/partner")
      ? "partner_"
      : "";

  // Extract token from standard authorization or cookie
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : request.cookies.get(`${prefix}auth_token`)?.value;

  const userRole = token ? getSessionRole(request, token, prefix) : null;

  // Protect paths requiring authentication
  if ((isMemberPath || isPartnerPath || isAdminPath) && (!token || !userRole)) {
    const authenticatedSession = getAuthenticatedHomePath(request);
    if (authenticatedSession) {
      return redirectActiveSession(request, authenticatedSession, pathname);
    }

    const portal: AuthPortal = isPartnerPath ? "partner" : isAdminPath ? "admin" : "member";
    const loginUrl = centralLoginUrl(request, portal, pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (
    isAdminPath &&
    userRole !== "OPERATOR" &&
    userRole !== "ADMIN" &&
    userRole !== "SUPER_ADMIN"
  ) {
    return NextResponse.redirect(new URL("/", nightlifeOrigins.public));
  }

  // Protect partner routes
  if (isPartnerPath && userRole !== "PARTNER" && userRole !== "STAFF") {
    return NextResponse.redirect(new URL("/", nightlifeOrigins.public));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - SVG, icons (public assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|SVG|icons).*)",
  ],
};
