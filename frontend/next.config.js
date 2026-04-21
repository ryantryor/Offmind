/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Proxy /api/* to the FastAPI backend so the browser only talks to one host.
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    return [
      { source: '/api/:path*', destination: `${backend}/api/:path*` },
    ];
  },
};
module.exports = nextConfig;
