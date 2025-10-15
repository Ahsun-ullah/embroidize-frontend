export const dynamic = 'force-static';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import { getAllProductsByCategory } from '@/lib/apis/public/category';
import {
  getPopularProducts,
  getSingleProduct,
} from '@/lib/apis/public/products';
import { getAllProductsBySubCategory } from '@/lib/apis/public/subcategory';
import { notFound } from 'next/navigation';

// ✅ This is a pure server component – do NOT add "use client"

export async function generateMetadata({ params }) {
  const response = await getSingleProduct(params.slug);
  const product = response?.data;
  if (!product) return {};

  const canonicalUrl = `https://embroidize.com/product/${params.slug}`;

  return {
    title: product.meta_title,
    description: product.meta_description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: product.meta_title,
      description: product.meta_description,
      images: [
        {
          url: product.image?.url || 'https://embroidize.com/og-banner.jpg',
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.meta_title,
      description: product.meta_description,
      images: [product.image?.url || 'https://embroidize.com/og-banner.jpg'],
      alt: product.name,
    },
  };
}

export default async function ProductDetails({ params }) {
  const slug = params.slug;
  const response = await getSingleProduct(slug);
  const product = response?.data;
  if (!product) return notFound();

  const hasSubCategory = !!product?.sub_category?.slug;
  const [productListResponse, popularProductsResponse] = await Promise.all([
    hasSubCategory
      ? getAllProductsBySubCategory(product.sub_category.slug, 1, 6)
      : getAllProductsByCategory(product.category?.slug, 1, 6),
    getPopularProducts('', 1, 4),
  ]);

  const allProducts = productListResponse?.products ?? [];
  const popularProducts = popularProductsResponse?.products ?? [];

  // ---- Schema (SSR-safe JSON) ----
  const today = new Date();
  const priceValidUntil = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  )
    .toISOString()
    .split('T')[0];

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    description: product.meta_description,
    sku: product.sku || product._id,
    image: product.image?.url,
    brand: { '@type': 'Brand', name: 'Embroidize' },
    offers: {
      '@type': 'Offer',
      url: `https://embroidize.com/product/${product.slug}`,
      priceCurrency: 'USD',
      price: Number(product.price || 0).toFixed(2),
      availability: 'https://schema.org/InStock',
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: 'Embroidize' },
    },
  };

  if (product.rating && product.reviews?.length > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating.average || 5.0,
      reviewCount: product.reviews.length,
    };
  }

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://embroidize.com/',
      },
      ...(product.category
        ? [
            {
              '@type': 'ListItem',
              position: 2,
              name: product.category.name,
              item: `https://embroidize.com/${product.category.slug}`,
            },
          ]
        : []),
      ...(product.sub_category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: product.sub_category.name,
              item: `https://embroidize.com/${product.category.slug}/${product.sub_category.slug}`,
            },
          ]
        : []),
      {
        '@type': 'ListItem',
        position: product.sub_category ? 4 : 3,
        name: product.name,
        item: `https://embroidize.com/product/${product.slug}`,
      },
    ],
  };

  // ---- Return HTML (server-rendered JSON-LD included) ----
  return (
    <>
      {/* ✅ These scripts render server-side and are visible in page source */}
      <script
        id='product-schema'
        type='application/ld+json'
        strategy='beforeInteractive'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <script
        id='breadcrumb-schema'
        type='application/ld+json'
        strategy='beforeInteractive'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <Header />
      <SingleProductComponent
        singleProductData={product}
        allProductData={allProducts}
        popularProducts={popularProducts}
      />
      <Footer />
    </>
  );
}
