/** @type {import('next').NextConfig} */
const nextConfig = {
  // Isolate review builds from another developer's running Next dev server.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
