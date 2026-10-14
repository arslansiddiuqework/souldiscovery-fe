/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  skipMiddlewareUrlNormalize: true,

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  reactStrictMode: false,

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },

  pageExtensions: ["tsx", "ts", "jsx", "js"].filter(
    (ext) => !ext.includes("spec")
  ),

  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      canvas$: false,
    };
    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
