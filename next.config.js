// eslint-disable-next-line @typescript-eslint/no-require-imports
const redirectsMap = require('./redirects.map.json');

const redirectsFromMap = Object.entries(redirectsMap).map(([source, destination]) => ({
  source,
  destination,
  permanent: true,
}));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compress: true,

  images: {
    domains: [
      'www.embroidize.com',
      'embroidize-assets.nyc3.cdn.digitaloceanspaces.com',
    ],
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'embroidize.com', pathname: '/**' },
      { protocol: 'https', hostname: 'tan-dogfish-413907.hostingersite.com', pathname: '/**' },
      { protocol: 'https', hostname: 'embroidize-assets.nyc3.cdn.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'embroidize-assets.nyc3.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
    ],
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
      ...redirectsFromMap,
    ];
  },
};

module.exports = nextConfig;
