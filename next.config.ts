import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "platform-lookaside.fbsbx.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/workshops", destination: "/events", permanent: true },
      { source: "/pick-your-own", destination: "/events", permanent: true },
      { source: "/about", destination: "/", permanent: true },
      { source: "/gallery", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
