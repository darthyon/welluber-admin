/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig = {
  serverExternalPackages: ['lightningcss'],
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/.claude/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
