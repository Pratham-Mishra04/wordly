/** @type {import('next').NextConfig} */

const path = require('path')


const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
        {
            protocol: 'https',
            hostname: 'lh3.googleusercontent.com',
        },
    ],
  },
  optimizeFonts:true,
}

module.exports = nextConfig