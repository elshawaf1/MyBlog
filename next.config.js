/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Project site: https://elshawaf1.github.io/MyBlog/
  basePath: '/MyBlog',
  assetPrefix: '/MyBlog/',
};

module.exports = nextConfig;
