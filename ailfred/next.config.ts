/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "fs": false,
      "net": false,
      "tls": false,
      "async_hooks": false,
      "crypto": false,
      "stream": false,
      "http": false,
      "https": false,
      "zlib": false,
      "path": false,
      "os": false,
      "util": false,
      "process": false,
      "buffer": false,
      "url": false,
      "node:async_hooks": false,
      "node:fs": false,
      "node:util": false,
      "node:buffer": false,
      "node:path": false,
      "node:process": false,
      "node:url": false,
    };
    return config;
  },
  env: {
    NEXT_PUBLIC_CDP_API_KEY_NAME: process.env.CDP_API_KEY_NAME,
    NEXT_PUBLIC_CDP_API_KEY_PRIVATE_KEY: process.env.CDP_API_KEY_PRIVATE_KEY,
    NEXT_PUBLIC_NETWORK_ID: process.env.NETWORK_ID,
  },
};

module.exports = nextConfig; 