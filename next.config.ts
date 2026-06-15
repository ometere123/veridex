import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    workerThreads: false,
  },
};

export default nextConfig;
