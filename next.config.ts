import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '%.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'www.sarabsanjhadarbar.com',
      },
      {
        protocol: 'https',
        hostname: 'sarabsanjhadarbar.com',
      },
    ],
  },
};

export default nextConfig;
