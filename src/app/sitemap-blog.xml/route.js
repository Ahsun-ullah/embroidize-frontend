import { getBlogs, getResources } from '@/lib/apis/public/blog';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

    const { blogs } = await getBlogs();
    const { resources } = await getResources();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/blog</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${blogs
    .map(
      (blog) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/blog/${blog.slug}`)}</loc>
    <lastmod>${blog.updatedAt ? new Date(blog.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join('')}
  <url>
    <loc>${baseUrl}/resources</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ${resources
    .map(
      (resource) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/resources/${resource.slug}`)}</loc>
    <lastmod>${resource.updatedAt ? new Date(resource.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join('')}
</urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=14400, s-maxage=28800',
      },
    });
  } catch (error) {
    console.error('Blog sitemap generation failed:', error);
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
