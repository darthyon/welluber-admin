/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['lightningcss'],
  turbopack: {},
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.claude/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
