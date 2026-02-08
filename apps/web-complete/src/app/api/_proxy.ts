import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:8000";

function copySetCookieHeaders(from: Response, to: NextResponse) {
  // Node/Next exposes multiple Set-Cookie via getSetCookie()
  const headers = from.headers as Headers & { getSetCookie?: () => string[] };
  const cookies = headers.getSetCookie?.();
  if (cookies?.length) {
    for (const c of cookies) to.headers.append("set-cookie", c);
  } else {
    const single = from.headers.get("set-cookie");
    if (single) to.headers.set("set-cookie", single);
  }
}

export async function forward(req: NextRequest, targetPath: string) {
  const url = new URL(req.url);
  const target = new URL(API_URL + targetPath);

  // keep query string
  target.search = url.search;

  const headers = new Headers(req.headers);
  headers.delete("host");

  // Forward body for non-GET
  const init: RequestInit = {
    method: req.method,
    headers,
    // IMPORTANT: include cookies coming from browser automatically via req.headers
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: "manual",
  };

  const upstream = await fetch(target, init);

  const contentType = upstream.headers.get("content-type") ?? "";
  const raw = await upstream.arrayBuffer();

  const res = new NextResponse(raw, {
    status: upstream.status,
    headers: {
      "content-type": contentType || "application/octet-stream",
    },
  });

  // copy cookies + cache hints
  copySetCookieHeaders(upstream, res);
  const cc = upstream.headers.get("cache-control");
  if (cc) res.headers.set("cache-control", cc);

  return res;
}
