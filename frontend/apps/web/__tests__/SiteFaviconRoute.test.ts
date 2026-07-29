import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/site-favicon/route";

describe("site favicon route", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("serves the configured public favicon through a stable same-origin URL", async () => {
    const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47]);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          brand: {
            faviconUrl:
              "https://demonightlight.test9.io.vn/api/backend/storage/public/favicon-id",
          },
        },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(png, {
        status: 200,
        headers: { "content-type": "image/png" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("https://vietyoru.com/site-favicon"),
    );

    expect(fetchMock.mock.calls[0]?.[0].toString()).toBe(
      "https://vietyoru.com/api/backend/system-config/appearance",
    );
    expect(fetchMock.mock.calls[1]?.[0].toString()).toBe(
      "https://vietyoru.com/api/backend/storage/public/favicon-id",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/png");
    expect(response.headers.get("cache-control")).toContain("must-revalidate");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(png);
  });

  it("falls back to the bundled SVG when no custom favicon is configured", async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: { brand: { faviconUrl: "" } },
      }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(svg, {
        status: 200,
        headers: { "content-type": "image/svg+xml" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(
      new NextRequest("https://vietyoru.com/site-favicon"),
    );

    expect(fetchMock.mock.calls[1]?.[0].toString()).toBe(
      "https://vietyoru.com/favicon.svg",
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(await response.text()).toBe(svg);
  });
});
