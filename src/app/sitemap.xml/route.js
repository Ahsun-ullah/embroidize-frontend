import { getBlogs } from '@/lib/apis/public/blog';
import { getCategories } from '@/lib/apis/public/category';
import { getProducts } from '@/lib/apis/public/products';
import { getSubCategories } from '@/lib/apis/public/subcategory';

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_CLIENT;

    const { blogs } = await getBlogs();
    const { products } = await getProducts();
    const { categories } = await getCategories();
    const { subCategories } = await getSubCategories();

    const routes = [
      '',
      '/about-us',
      '/privacy-policy',
      '/terms-and-conditions',
      '/products',
      ...products.map(
        (product) =>
          `/product/${product.name.split(' ').join('-')}?id=${product._id}`,
      ),
      ...categories.map(
        (category) =>
          `/category/${category.name.split(' ').join('-')}?id=${category._id}`,
      ),
      ...subCategories.map(
        (subCategory) =>
          `/${subCategory?.category?.name.split(' ').join('-')}/${subCategory.name.split(' ').join('-')}?id=${subCategory._id}`,
      ),
      '/blog',
      ...blogs.map(
        (blog) => `/blog/${blog.title.split(' ').join('-')}?id=${blog._id}`,
      ),
    ];

    function escapeXml(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${routes
        .map(
          (route) => `
        <url>
          <loc>${escapeXml(`${baseUrl}${route}`)}</loc>
          <changefreq>weekly</changefreq>
          <priority>${route === '' ? '1.0' : '0.8'}</priority>
          <lastmod>${new Date().toISOString()}</lastmod>
        </url>`,
        )
        .join('')}
    </urlset>`;

    return new Response(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=0, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation failed:', error);

    return new Response('Internal Server Error', { status: 500 });
  }
}
