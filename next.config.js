/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // webpack: (config, { isServer }) => {
  //   // Add a rule for loading the favicon.ico file
  //   config.module.rules.push({
  //     test: /favicon.ico$/,
  //     use: {
  //       // loader: 'file-loader',
  //       options: {
  //         name: '[name].[ext]',
  //         publicPath: '/_next/static/',
  //         outputPath: 'static/',
  //       },
  //     },
  //   });

  //   return config;
  // },
};

module.exports = nextConfig;
