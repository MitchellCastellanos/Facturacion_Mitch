import type { NextConfig } from "next";
import { BRAND } from "./src/config/brand";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@react-pdf/renderer", "googleapis", "canvas", "sharp", "pdf-lib"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  async redirects() {
    const legacyHostRedirects = BRAND.legacyHosts.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${BRAND.appUrl}/:path*`,
      permanent: true,
    }));

    const legacyAppPaths = [
      "/login",
      "/dashboard",
      "/clients",
      "/invoices",
      "/quotes",
      "/appointments",
      "/reminders",
      "/accounting",
      "/settings",
      "/vehicles",
    ].map((path) => ({
      source: `${path}/:path*`,
      destination: `/admin${path}/:path*`,
      permanent: true,
    }));

    const legacyAppRoots = legacyAppPaths.map((p) => ({
      source: p.source.replace("/:path*", ""),
      destination: p.destination.replace("/:path*", ""),
      permanent: true,
    }));

    const agencyDisabledPaths = [
      { source: "/book/:path*", destination: "/", permanent: false },
      { source: "/admin/appointments", destination: "/admin/dashboard", permanent: false },
      { source: "/admin/appointments/:path*", destination: "/admin/dashboard", permanent: false },
      { source: "/admin/reminders", destination: "/admin/dashboard", permanent: false },
      { source: "/admin/reminders/:path*", destination: "/admin/dashboard", permanent: false },
      { source: "/admin/vehicles/:path*", destination: "/admin/clients", permanent: false },
    ];

    return [...legacyHostRedirects, ...legacyAppRoots, ...legacyAppPaths, ...agencyDisabledPaths];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
