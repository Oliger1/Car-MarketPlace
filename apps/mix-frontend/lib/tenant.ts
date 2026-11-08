/**
 * Multi-tenant host helpers.
 * Local:  adriatik-rent.localhost:3000
 * Prod:   adriatik-rent.mix.al
 */

const RESERVED = new Set([
  "www",
  "app",
  "api",
  "admin",
  "static",
  "cdn",
  "mail",
  "m",
]);

export function rootDomain() {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost";
}

export function appPort() {
  return process.env.NEXT_PUBLIC_APP_PORT || "3000";
}

export function appProtocol() {
  return process.env.NEXT_PUBLIC_APP_PROTOCOL || (process.env.NODE_ENV === "production" ? "https" : "http");
}

/** Main marketplace origin (no tenant). */
export function mainOrigin() {
  const root = rootDomain();
  const proto = appProtocol();
  const port = root === "localhost" ? `:${appPort()}` : "";
  return `${proto}://${root}${port}`;
}

/** Company storefront origin. */
export function companyOrigin(slug: string) {
  const root = rootDomain();
  const proto = appProtocol();
  const port = root === "localhost" ? `:${appPort()}` : "";
  return `${proto}://${slug}.${root}${port}`;
}

export function companyHomeUrl(slug: string) {
  return companyOrigin(slug) + "/";
}

export function companyCarUrl(slug: string, carSlug: string) {
  return `${companyOrigin(slug)}/cars/${carSlug}`;
}

export function parseTenantSlug(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  const root = rootDomain().toLowerCase();

  if (hostname === root || hostname === `www.${root}`) return null;

  if (root === "localhost") {
    // adriatik-rent.localhost
    if (hostname.endsWith(".localhost")) {
      const sub = hostname.slice(0, -".localhost".length);
      if (!sub || sub.includes(".") || RESERVED.has(sub)) return null;
      return sub;
    }
    return null;
  }

  if (hostname.endsWith(`.${root}`)) {
    const sub = hostname.slice(0, -(root.length + 1));
    if (!sub || sub.includes(".") || RESERVED.has(sub)) return null;
    return sub;
  }

  return null;
}
