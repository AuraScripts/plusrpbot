import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Don't fail the build because of ESLint errors on Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Don't fail the build because of type errors on Vercel (for now)
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.discordapp.com" },
      { protocol: "https", hostname: "*.discord.com" },
    ],
  },
};

export default nextConfig;
