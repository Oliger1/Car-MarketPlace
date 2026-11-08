import { NextRequest, NextResponse } from "next/server";

const API = process.env.API_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const upstream = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
  const text = await upstream.text();
  const res = new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") || "application/json" },
  });
  const setCookies = typeof upstream.headers.getSetCookie === "function" ? upstream.headers.getSetCookie() : [];
  if (setCookies.length) {
    for (const cookie of setCookies) res.headers.append("Set-Cookie", cookie);
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) res.headers.append("Set-Cookie", single);
  }
  return res;
}
