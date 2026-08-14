import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: '/user/22018057/proxy/3001',
  assetPrefix: '/user/22018057/proxy/3001',
  typescript: { ignoreBuildErrors: true },
  turbopack: { root: __dirname },
};

export default nextConfig;
