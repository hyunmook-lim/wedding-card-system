import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/default',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
