import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/rankings', destination: '/registry', permanent: false },
      { source: '/leaderboard', destination: '/registry', permanent: false },
      { source: '/index', destination: '/registry', permanent: false },
      { source: '/dashboard', destination: '/issuer-hub', permanent: false },
      { source: '/dashboard/project', destination: '/issuer-hub/project', permanent: false },
      { source: '/hub', destination: '/issuer-hub', permanent: false },
      { source: '/register', destination: '/submit', permanent: false },
      { source: '/tiers', destination: '/verification-levels', permanent: false },
      { source: '/analytics', destination: '/signals', permanent: false },
      { source: '/project/:projectId', destination: '/dossier/:projectId', permanent: false },
    ];
  },
  async rewrites() {
    return [];
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
