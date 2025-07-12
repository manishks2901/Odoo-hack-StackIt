import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  serverExternalPackages: ['next-auth'],
  // Skip prerendering for dynamic routes to avoid SSR issues with auth
  trailingSlash: false,
  skipMiddlewareUrlNormalize: false,
};

export default nextConfig;
