import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'monogamy-revoke-treble.ngrok-free.dev',
    '192.168.100.3',
    'monogamy-revoke-treble.ngrok-free.dev',
  ],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};
export default nextConfig;