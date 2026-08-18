import type { NextConfig } from "next";

const API_PROXY_TARGET =
  process.env.API_PROXY_TARGET ?? "http://localhost:8080";

// ponytail: server backend punya no CORS + CSRF double-submit butuh cookie
// same-origin (PRD §C.1, §S.14). Proxy semua group route backend lewat origin
// frontend; ganti API_PROXY_TARGET bila backend pindah.
const apiRoutes = [
  "/auth/:path*",
  "/users/:path*",
  "/admin/:path*",
  "/products/:path*",
  "/categories/:path*",
  "/wishlist/:path*",
  "/cart/:path*",
  "/addresses/:path*",
  "/orders/:path*",
  "/payments/:path*",
];

const nextConfig: NextConfig = {
  rewrites: async () =>
    apiRoutes.map((source) => ({
      source,
      destination: `${API_PROXY_TARGET}${source}`,
    })),
};

export default nextConfig;
