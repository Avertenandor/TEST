/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/crypto-processing.net' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/crypto-processing.net' : '',
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
