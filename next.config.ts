import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // Permite CUALQUIER hostname
      },
      {
        protocol: "http", // Opcional: si también usas http
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
