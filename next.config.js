/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lets a production build run into a scratch directory (NEXT_DIST_DIR=.next-verify)
  // while `next dev` keeps ownership of .next — building over a running dev
  // server's .next corrupts it and 500s every route.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  output: 'standalone',
  reactStrictMode: true,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],

    minimumCacheTTL: 2678400,

    qualities: [50, 75, 78, 85, 100],
    remotePatterns: [
      { protocol: 'https', hostname: 'www.embroidize.com', pathname: '/**' },
      { protocol: 'https', hostname: 'embroidize.com', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'embroidize-assets.nyc3.cdn.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'embroidize-assets.nyc3.digitaloceanspaces.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tan-dogfish-413907.hostingersite.com',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
  },
  compiler: {
    removeConsole: process.env.NEXT_PUBLIC_NODE_ENV === 'production',
  },
  experimental: { optimizeCss: true },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.embroidize.com' }],
        destination: 'https://embroidize.com/:path*',
        permanent: true,
      },
    ];
  },
};
module.exports = nextConfig;
