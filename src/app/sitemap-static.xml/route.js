export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

  const staticRoutes = [
    { url: '/', priority: '1.0' },
    { url: '/about-us', priority: '0.8' },
    { url: '/contact-us', priority: '0.8' },
    { url: '/privacy-policy', priority: '0.5' },
    { url: '/terms-and-conditions', priority: '0.5' },
    { url: '/custom-embroidery-order', priority: '0.9' },
    { url: '/products', priority: '0.9' },
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map(
      (route) => `
  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
    )
    .join('')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
