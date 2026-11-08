import type { NextConfig } from "next";

const API = process.env.API_URL || "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  output: "standalone",
  // Keep /api/me/ etc. so FastAPI trailing-slash routes work through rewrites
  skipTrailingSlashRedirect: true,
  // Faster local nav; public pages revalidate via fetch cache
  experimental: {
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },
  async rewrites() {
    return [
      // Auth login/logout are App Router handlers (set cookies on this origin).
      { source: "/api/:path*", destination: `${API}/api/:path*` },
      { source: "/uploads/:path*", destination: `${API}/uploads/:path*` },
    ];
  },
};

export default nextConfig;
