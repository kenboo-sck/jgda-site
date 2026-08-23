import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.microcms-assets.io'],
  },
  allowedDevOrigins: ['localhost', '127.0.0.1'],
};

export default nextConfig;
