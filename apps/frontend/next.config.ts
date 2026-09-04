import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Disable static optimization for dynamic data
  output: 'standalone',
  
  // Empty turbopack config to silence webpack warning
  turbopack: {},
};

export default nextConfig;
