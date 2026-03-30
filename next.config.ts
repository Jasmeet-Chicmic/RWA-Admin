import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const nextConfig: NextConfig = {
  basePath: "/admin-portal",
  async redirects() {
    return [
      {
        source: "/",
        destination: "/admin-portal",
        basePath: false,
        permanent: false,
      },
      {
        source: "/login",
        destination: "/admin-portal/login",
        basePath: false,
        permanent: false,
      },
      {
        source: "/forgot-password",
        destination: "/admin-portal/forgot-password",
        basePath: false,
        permanent: false,
      },
    ];
  },
  output: "standalone",
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    domains: [
      "192.180.3.86",
      "via.placeholder.com",
      "admin-boilerplate-lqny.onrender.com",
      "picsum.photos",
      "flagcdn.com",
      "dummyimage.com",
      "e314f619d45a.ngrok-free.app",
      "images.unsplash.com",
      "raypto.onrender.com",
      "flagcdn.com",
      "raypto-prod.onrender.com",
      "dev.sixthhive.com",
      "assets.dev.sixthhive.com",
      "d2csf5wg03xttg.cloudfront.net",
      "img.youtube.com",
    ],
  },
};
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);
