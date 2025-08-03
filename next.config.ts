import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["randomuser.me"],
  },
  experimental: {
  typedRoutes: true,
},
};


export default nextConfig;
