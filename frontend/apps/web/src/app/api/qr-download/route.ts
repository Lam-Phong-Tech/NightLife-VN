import { NextRequest } from "next/server";

const qrFileName = (value: string | null) => {
  const cleaned = (value ?? "")
    .trim()
    .replace(/[^a-z0-9._-]/gi, "-")
    .replace(/-+/g, "-")
    .slice(0, 96);

  return cleaned || "nightlife-booking-qr.png";
};

export async function GET(request: NextRequest) {
  const payload = request.nextUrl.searchParams.get("data")?.trim();

  if (!payload) {
    return Response.json({ message: "QR data is required" }, { status: 400 });
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=640x640&margin=24&data=${encodeURIComponent(
    payload,
  )}`;
  const response = await fetch(qrUrl, { cache: "no-store" });

  if (!response.ok) {
    return Response.json({ message: "Cannot generate QR image" }, { status: 502 });
  }

  const body = await response.arrayBuffer();
  const fileName = qrFileName(request.nextUrl.searchParams.get("filename"));

  return new Response(body, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Type": response.headers.get("content-type") ?? "image/png",
    },
  });
}
