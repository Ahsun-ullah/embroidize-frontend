/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  compress: true,
  images: {
    // Optimization ON: Next serves resized AVIF/WebP sized to each slot, so a
    // 1.5 MB source PNG becomes a ~15-30 KB thumbnail on a card while full
    // quality is preserved on detail pages. (Was unoptimized:true, which
    // shipped the full-size original everywhere — the main cause of slow loads.)
    formats: ['image/avif', 'image/webp'],
    // Cache optimized variants for 31 days (sources are immutable — the key
    // changes on re-upload), so repeat views don't re-optimize.
    minimumCacheTTL: 2678400,
    // Allowed `quality` values used across the app's <Image> components.
    qualities: [50, 75, 78, 85, 100],
    remotePatterns: [
      { protocol: 'https', hostname: 'www.embroidize.com', pathname: '/**' },
      { protocol: 'https', hostname: 'embroidize.com', pathname: '/**' },
      { protocol: 'https', hostname: 'embroidize-assets.nyc3.cdn.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'embroidize-assets.nyc3.digitaloceanspaces.com', pathname: '/**' },
      { protocol: 'https', hostname: 'tan-dogfish-413907.hostingersite.com', pathname: '/**' },
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