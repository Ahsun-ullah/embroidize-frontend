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
      {
        protocol: 'https',
        hostname: 'embroidize.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tan-dogfish-413907.hostingersite.com',
        pathname: '/**',
      },
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
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },

  experimental: {
    optimizeCss: true,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.embroidize.com',
          },
        ],
        destination: 'https://embroidize.com/:path*',
        permanent: true,
      },
      {
        source:
          '/blog/10-free-christmas-machine-embroidery-designs-for-your-holiday-projects',
        destination: '/blog/free-christmas-machine-embroidery-designs',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
