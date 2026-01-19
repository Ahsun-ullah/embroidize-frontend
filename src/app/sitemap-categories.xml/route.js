import { getCategories } from '@/lib/apis/public/category';
import { getSubCategories } from '@/lib/apis/public/subcategory';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

    const { categories } = await getCategories();
    const { subCategories } = await getSubCategories();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories
    .map(
      (category) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/category/${category.slug}`)}</loc>
    <lastmod>${category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
    )
    .join('')}
  ${subCategories
    .map(
      (subCategory) => `
  <url>
    <loc>${escapeXml(`${baseUrl}/${subCategory?.category?.slug}/${subCategory.slug}`)}</loc>
    <lastmod>${subCategory.updatedAt ? new Date(subCategory.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
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
    console.error('Categories sitemap generation failed:', error);
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
