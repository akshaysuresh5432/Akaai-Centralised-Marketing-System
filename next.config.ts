import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com", "*.netlify.app"],
  async redirects() {
    return [
      { source: "/clients", destination: "/companies", permanent: false },
      { source: "/clients/:id", destination: "/companies/:id", permanent: false },
      { source: "/campaigns", destination: "/", permanent: false },
      { source: "/campaigns/:id", destination: "/", permanent: false },
      { source: "/work", destination: "/", permanent: false },
      { source: "/recaps", destination: "/", permanent: false },
      { source: "/recaps/:id", destination: "/", permanent: false },
      { source: "/approvals", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
