import { NextResponse } from "next/server";

import { nightlifeOrigins, type AuthPortal } from "@/lib/auth/hosts";

const authCookieNames = ["auth_token", "user_role", "user_email", "user_name"] as const;
const allowedOrigins = new Set([
  nightlifeOrigins.public,
  nightlifeOrigins.partner,
  nightlifeOrigins.admin,
  nightlifeOrigins.auth,
]);
const portalByOrigin = new Map<string, AuthPortal>([
  [nightlifeOrigins.public, "member"],
  [nightlifeOrigins.partner, "partner"],
  [nightlifeOrigins.admin, "admin"],
]);

const cookiePrefixForPortal = (portal: AuthPortal) => {
  if (portal === "admin") return "admin_";
  if (portal === "partner") return "partner_";
  return "";
};

const corsHeaders = (origin: string | null) => {
  const headers = new Headers({
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  });
  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  return headers;
};

export function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request.headers.get("origin")),
  });
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins.has(origin)) {
    return NextResponse.json({ message: "Nguồn yêu cầu không hợp lệ." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { portal?: unknown } | null;
  const requestedPortal = body?.portal;
  if (
    requestedPortal !== "member" &&
    requestedPortal !== "partner" &&
    requestedPortal !== "admin"
  ) {
    return NextResponse.json({ message: "Invalid login portal." }, { status: 400 });
  }

  const originPortal = origin ? portalByOrigin.get(origin) : undefined;
  if (originPortal && originPortal !== requestedPortal) {
    return NextResponse.json({ message: "Cannot clear another portal session." }, { status: 403 });
  }

  const response = NextResponse.json({ cleared: true }, { headers: corsHeaders(origin) });
  const prefix = cookiePrefixForPortal(requestedPortal);
  for (const name of authCookieNames) {
    response.cookies.set(`${prefix}${name}`, "", {
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}
