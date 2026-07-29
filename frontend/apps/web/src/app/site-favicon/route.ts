import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_FAVICON_URL } from "@/lib/appearance-favicon";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PUBLIC_STORAGE_PATHS = [
  "/api/backend/storage/public/",
  "/storage/public/",
];

const isSupportedImage = (contentType: string | null) =>
  Boolean(contentType?.toLowerCase().startsWith("image/"));

const configuredFaviconUrl = (value: unknown, origin: string) => {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const candidate = new URL(value.trim(), origin);
    const publicStoragePrefix = PUBLIC_STORAGE_PATHS.find((prefix) =>
      candidate.pathname.startsWith(prefix),
    );
    if (!publicStoragePrefix) return null;

    const pathname = publicStoragePrefix === "/storage/public/"
      ? `/api/backend${candidate.pathname}`
      : candidate.pathname;
    return new URL(`${pathname}${candidate.search}`, origin);
  } catch {
    return null;
  }
};

const loadConfiguredFavicon = async (request: NextRequest) => {
  try {
    const configUrl = new URL(
      "/api/backend/system-config/appearance",
      request.nextUrl.origin,
    );
    const configResponse = await fetch(configUrl, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!configResponse.ok) return null;

    const payload = await configResponse.json() as {
      data?: { brand?: { faviconUrl?: unknown } };
    };
    return configuredFaviconUrl(
      payload.data?.brand?.faviconUrl,
      request.nextUrl.origin,
    );
  } catch {
    return null;
  }
};

const loadImage = async (url: URL) => {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok || !isSupportedImage(response.headers.get("content-type"))) {
      return null;
    }
    return response;
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  const configuredUrl = await loadConfiguredFavicon(request);
  const configuredImage = configuredUrl
    ? await loadImage(configuredUrl)
    : null;
  const fallbackUrl = new URL(DEFAULT_FAVICON_URL, request.nextUrl.origin);
  const image = configuredImage ?? await loadImage(fallbackUrl);

  if (!image) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(await image.arrayBuffer(), {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=0, must-revalidate",
      "Content-Type": image.headers.get("content-type") || "image/svg+xml",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
