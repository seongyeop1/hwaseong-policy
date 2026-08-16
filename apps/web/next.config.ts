import type { NextConfig } from "next";

// JupyterHub 프록시용: .env.local 에 NEXT_PUBLIC_BASE_PATH=/user/<학번>/proxy/3001
// Vercel 배포: 환경변수 미설정(빈 값)으로 두면 루트 경로로 서빙
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined,
  typescript: { ignoreBuildErrors: true },
  turbopack: { root: __dirname },
};

export default nextConfig;
