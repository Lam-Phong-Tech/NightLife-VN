export const runtime = "nodejs";
export const revalidate = 86400;

const cacheHeaders = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

const allowedGoogleMapHosts = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return (
    host === "maps.app.goo.gl" ||
    host === "goo.gl" ||
    host === "g.co" ||
    host === "google.com" ||
    host === "maps.google.com" ||
    host.endsWith(".google.com") ||
    host.startsWith("maps.google.")
  );
};

const mapQueryEmbedUrl = (query: string) =>
  query.trim()
    ? `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&z=15&output=embed`
    : "";

const redirectTo = (targetUrl: string) =>
  new Response(null, {
    status: 302,
    headers: {
      ...cacheHeaders,
      Location: targetUrl,
    },
  });

const safeFallbackUrl = (value: string | null) => {
  if (!value) return "";

  try {
    const parsed = new URL(value);
    return allowedGoogleMapHosts(parsed.hostname) && value.includes("output=embed") ? value : "";
  } catch {
    return "";
  }
};

const firstUsefulPathSegment = (parsed: URL) =>
  parsed.pathname
    .split("/")
    .map((part) => decodeURIComponent(part.replace(/\+/g, " ")).trim())
    .filter((part) => part && !["maps", "place", "search", "dir"].includes(part))
    .find((part) => !part.startsWith("@")) ?? "";

const googleMapEmbedFromUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    if (!allowedGoogleMapHosts(parsed.hostname)) return "";

    const decodedHref = decodeURIComponent(parsed.href);
    const coordinateMatch =
      decodedHref.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/) ??
      decodedHref.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);

    if (coordinateMatch) {
      return mapQueryEmbedUrl(`${coordinateMatch[1]},${coordinateMatch[2]}`);
    }

    const query =
      parsed.searchParams.get("q") ||
      parsed.searchParams.get("query") ||
      parsed.searchParams.get("destination") ||
      parsed.searchParams.get("daddr") ||
      firstUsefulPathSegment(parsed);

    return mapQueryEmbedUrl(query);
  } catch {
    return "";
  }
};

const resolveGoogleMapUrl = async (mapUrl: string) => {
  const parsed = new URL(mapUrl);
  if (!allowedGoogleMapHosts(parsed.hostname)) return mapUrl;

  try {
    const response = await fetch(mapUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "Mozilla/5.0 VietyoruMapResolver/1.0",
      },
      signal: AbortSignal.timeout(4500),
    });

    return response.url || mapUrl;
  } catch {
    return mapUrl;
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mapUrl = searchParams.get("url")?.trim() ?? "";
  const fallbackUrl = safeFallbackUrl(searchParams.get("fallback"));

  if (!mapUrl) {
    return fallbackUrl ? redirectTo(fallbackUrl) : new Response("Missing map url", { status: 400 });
  }

  try {
    const parsed = new URL(mapUrl);
    if (!allowedGoogleMapHosts(parsed.hostname)) {
      return fallbackUrl
        ? redirectTo(fallbackUrl)
        : new Response("Unsupported map url", { status: 400 });
    }

    const resolvedUrl = await resolveGoogleMapUrl(mapUrl);
    const embedUrl =
      googleMapEmbedFromUrl(resolvedUrl) || googleMapEmbedFromUrl(mapUrl) || fallbackUrl;

    if (!embedUrl) {
      return new Response("Cannot resolve map url", { status: 422 });
    }

    return redirectTo(embedUrl);
  } catch {
    return fallbackUrl ? redirectTo(fallbackUrl) : new Response("Invalid map url", { status: 400 });
  }
}
