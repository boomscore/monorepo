import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
        port: '',
        pathname: '/**',
      },
      // Add other common sports image sources
      {
        protocol: 'https',
        hostname: 'logos.api-sports.io',
        port: '',
        pathname: '/**',
      },
      // For local development images
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
