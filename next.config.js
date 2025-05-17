/** @type {import('next').NextConfig} */

const TARGET_SERVER_BASE_URL = process.env.SERVER_BASE_URL || 'http://localhost:8001';

const nextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/wiki_cache/:path*',
        destination: `${TARGET_SERVER_BASE_URL}/api/wiki_cache/:path*`,
      },
      {
        source: '/export/wiki/:path*',
        destination: `${TARGET_SERVER_BASE_URL}/export/wiki/:path*`,
      },
      {
        source: '/api/wiki_cache',
        destination: `${TARGET_SERVER_BASE_URL}/api/wiki_cache`,
      },
      {
        source: '/local_repo/structure',
        destination: `${TARGET_SERVER_BASE_URL}/local_repo/structure`,
      },
    ];
  },
};

module.exports = nextConfig; 