import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3006',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'flyspirits.online',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
