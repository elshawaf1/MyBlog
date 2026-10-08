/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  // GitHub Pages project site: https://elshawaf1.github.io/MyBlog/
  basePath: '/MyBlog',
  assetPrefix: '/MyBlog/',
};

module.exports = nextConfig;
