import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    disableOptimizedLoading: true,
  },

};

export default nextConfig;
