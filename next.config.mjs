/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['lightningcss'],
  turbopack: { root: import.meta.dirname },
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.git/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
