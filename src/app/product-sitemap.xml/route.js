import { getProductsForSitemap } from '@/lib/apis/public/products';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

    const url = new URL(req.url);
    const idParam = url.searchParams.get('id') ?? '0';
    const pageNum = Number.isNaN(parseInt(idParam, 10))
      ? 0
      : parseInt(idParam, 10);

    const limit = 2000;
    const skip = pageNum * limit;

    // IMPORTANT: pass skip & limit to backend
    const { products } = await getProductsForSitemap(skip, limit);

    if (!products || products.length === 0) {
      return new Response('Not Found', { status: 404 });
    }

    const escapeXml = (str) =>
      str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
  .map(
    (product) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/product/${product.slug}`)}</loc>
    <lastmod>${
      product.updatedAt
        ? new Date(product.updatedAt).toISOString()
        : new Date().toISOString()
    }</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=7200, s-maxage=14400',
      },
    });
  } catch (error) {
    console.error('Product sitemap generation failed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
