import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["randomuser.me"],
  },
  experimental: {
    typedRoutes: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  output: 'standalone',
};

export default nextConfig;
