import { getAllBundlesForDashboard } from '@/lib/apis/protected/bundles';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

    const { bundles } = await getAllBundlesForDashboard();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/bundles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${bundles
    .map(
      (bundle) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/bundles/${bundle.slug}`)}</loc>
    <lastmod>${bundle.updatedAt ? new Date(bundle.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error('Bundles sitemap generation failed:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
