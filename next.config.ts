import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/dashboard', destination: '/hub', permanent: false },
      { source: '/dashboard/project', destination: '/hub/project', permanent: false },
      { source: '/submit', destination: '/register', permanent: false },
      { source: '/rankings', destination: '/tiers', permanent: false },
      { source: '/leaderboard', destination: '/index', permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: '/hub', destination: '/dashboard' },
      { source: '/hub/project', destination: '/dashboard/project' },
      { source: '/register', destination: '/submit' },
      { source: '/tiers', destination: '/rankings' },
      { source: '/index', destination: '/leaderboard' },
    ];
  },
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
