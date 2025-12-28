import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
