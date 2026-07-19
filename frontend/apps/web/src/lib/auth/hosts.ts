export type AuthPortal = "member" | "partner" | "admin";

const defaultOrigins: Record<"public" | "partner" | "admin" | "auth", string> = {
  public: "https://demonightlight.test9.io.vn",
  partner: "https://partner.demonightlight.test9.io.vn",
  admin: "https://admin.demonightlight.test9.io.vn",
  auth: "https://auth.demonightlight.test9.io.vn",
};

const normalizeOrigin = (value: string) => value.replace(/\/+$/, "");

export const nightlifeOrigins = {
  public: normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL || defaultOrigins.public),
  partner: normalizeOrigin(process.env.NEXT_PUBLIC_PARTNER_APP_URL || defaultOrigins.partner),
  admin: normalizeOrigin(process.env.NEXT_PUBLIC_ADMIN_APP_URL || defaultOrigins.admin),
  auth: normalizeOrigin(process.env.NEXT_PUBLIC_AUTH_APP_URL || defaultOrigins.auth),
} as const;

const hostnameFromOrigin = (origin: string) => {
  try {
    return new URL(origin).hostname.toLowerCase();
  } catch {
    return "";
  }
};

export const nightlifeHostnames = {
  public: hostnameFromOrigin(nightlifeOrigins.public),
  partner: hostnameFromOrigin(nightlifeOrigins.partner),
  admin: hostnameFromOrigin(nightlifeOrigins.admin),
  auth: hostnameFromOrigin(nightlifeOrigins.auth),
} as const;

export type NightlifeHostKind = keyof typeof nightlifeHostnames | "local" | "unknown";

export const getNightlifeHostKind = (hostname: string): NightlifeHostKind => {
  const normalized = hostname.toLowerCase().split(":")[0] || "";
  if (normalized === "localhost" || normalized === "127.0.0.1") return "local";
  if (normalized === nightlifeHostnames.public) return "public";
  if (normalized === nightlifeHostnames.partner) return "partner";
  if (normalized === nightlifeHostnames.admin) return "admin";
  if (normalized === nightlifeHostnames.auth) return "auth";
  return "unknown";
};

export const portalForRole = (role: string): AuthPortal => {
  const normalized = role.toUpperCase();
  if (["ADMIN", "SUPER_ADMIN", "OPERATOR"].includes(normalized)) return "admin";
  if (["PARTNER", "STAFF"].includes(normalized)) return "partner";
  return "member";
};

export const portalHomePath = (portal: AuthPortal) => {
  if (portal === "admin") return "/admin";
  if (portal === "partner") return "/partner";
  return "/tai-khoan";
};

export const portalOrigin = (portal: AuthPortal) => {
  if (portal === "admin") return nightlifeOrigins.admin;
  if (portal === "partner") return nightlifeOrigins.partner;
  return nightlifeOrigins.public;
};

export const portalRoles = (portal: AuthPortal) => {
  if (portal === "admin") return ["OPERATOR", "ADMIN", "SUPER_ADMIN"];
  if (portal === "partner") return ["PARTNER", "STAFF"];
  return ["USER"];
};

export const isSafePortalRedirect = (portal: AuthPortal, value: string | null) => {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return false;
  if (portal === "admin") {
    return value === "/admin" || value.startsWith("/admin/") || value.startsWith("/admin?");
  }
  if (portal === "partner") {
    return (
      value === "/partner" ||
      value.startsWith("/partner/") ||
      value.startsWith("/partner?")
    );
  }
  return !value.startsWith("/admin") && !value.startsWith("/partner");
};

export const authLoginUrl = (portal: AuthPortal, redirectPath = portalHomePath(portal)) => {
  const url = new URL("/", nightlifeOrigins.auth);
  url.searchParams.set("portal", portal);
  url.searchParams.set(
    "redirect",
    isSafePortalRedirect(portal, redirectPath) ? redirectPath : portalHomePath(portal),
  );
  return url;
};

export const runtimePortalOrigin = (portal: AuthPortal) => {
  if (typeof window === "undefined") return portalOrigin(portal);
  const kind = getNightlifeHostKind(window.location.hostname);
  return kind === "local" || kind === "unknown" ? window.location.origin : portalOrigin(portal);
};
