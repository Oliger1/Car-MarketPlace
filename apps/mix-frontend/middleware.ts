import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { mainOrigin, parseTenantSlug, rootDomain } from "@/lib/tenant";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname, search } = request.nextUrl;
  const tenant = parseTenantSlug(host);
  const token = request.cookies.get("access_token")?.value;

  // --- Tenant subdomain: adriatik-rent.localhost ---
  if (tenant) {
    // Auth / dashboard always on apex
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/register") ||
      pathname.startsWith("/forgot-password") ||
      pathname.startsWith("/reset-password") ||
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/companies") ||
      pathname === "/cars"
    ) {
      const url = new URL(`${mainOrigin()}${pathname}${search}`);
      return NextResponse.redirect(url);
    }

    let rewritePath = pathname;
    if (pathname === "/" || pathname === "") {
      rewritePath = `/companies/${tenant}`;
    } else if (pathname.startsWith("/cars/")) {
      const carSlug = pathname.slice("/cars/".length).split("/")[0];
      if (carSlug) rewritePath = `/companies/${tenant}/cars/${carSlug}`;
    }

    const url = request.nextUrl.clone();
    url.pathname = rewritePath;
    const res = NextResponse.rewrite(url);
    res.headers.set("x-tenant-slug", tenant);
    return res;
  }

  // --- Apex: redirect /companies/:slug → subdomain ---
  const companyMatch = pathname.match(/^\/companies\/([^/]+)\/?$/);
  if (companyMatch) {
    const slug = companyMatch[1];
    const proto = request.nextUrl.protocol.replace(":", "") || "http";
    const port = host.includes(":") ? `:${host.split(":")[1]}` : rootDomain() === "localhost" ? ":3000" : "";
    const target = `${proto}://${slug}.${rootDomain()}${port}/${search}`;
    return NextResponse.redirect(target, 308);
  }

  const carMatch = pathname.match(/^\/companies\/([^/]+)\/cars\/([^/]+)\/?$/);
  if (carMatch) {
    const [, slug, carSlug] = carMatch;
    const proto = request.nextUrl.protocol.replace(":", "") || "http";
    const port = host.includes(":") ? `:${host.split(":")[1]}` : rootDomain() === "localhost" ? ":3000" : "";
    const target = `${proto}://${slug}.${rootDomain()}${port}/cars/${carSlug}${search}`;
    return NextResponse.redirect(target, 308);
  }

  // --- Auth gates on apex ---
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuth = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (isDashboard && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isAuth && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
