
import { getProductsForSitemap } from '@/lib/apis/public/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

    // Get dynamic count of products
    const { total } = await getProductsForSitemap(0, 1);
    const productsPerSitemap = 2000;
    const numProductSitemaps = Math.ceil(total / productsPerSitemap);

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap-static.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-categories.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-blog.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/sitemap-bundles.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  ${Array.from(
    { length: numProductSitemaps },
    (_, i) => `
  <sitemap>
    <loc>${baseUrl}/product-sitemap.xml?id=${i}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`,
  ).join('')}
</sitemapindex>`;

    return new Response(sitemapIndex, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=7200',
      },
    });
  } catch (error) {
    console.error('Sitemap index generation failed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
