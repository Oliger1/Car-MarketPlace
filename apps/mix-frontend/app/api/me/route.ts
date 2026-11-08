import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL || "http://127.0.0.1:8000";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie") || "";
  const upstream = await fetch(`${API}/api/me/`, {
    headers: { Cookie: cookie, Accept: "application/json" },
    cache: "no-store",
  });
  const text = await upstream.text();
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
}
