import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    proxyClientMaxBodySize: "600mb",
    serverActions: {
      bodySizeLimit: "600mb",
    },
  },
};

export default nextConfig;
