// app/product/[slug]/page.jsx
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

// Metadata
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

  // ---- Schema.org JSON-LD ----
  const today = new Date();
  const oneYearLater = new Date(
    today.getFullYear() + 1,
    today.getMonth(),
    today.getDate(),
  );
  const priceValidUntil = oneYearLater.toISOString().split('T')[0]; // "YYYY-MM-DD"

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.meta_description,
    sku: product.sku || product._id,
    image: product.image?.url ? [product.image.url] : undefined,
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

  if (product?.rating?.average && product?.reviews?.length > 0) {
    productSchema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Number(product.rating.average),
      reviewCount: Number(product.reviews.length),
    };
  }

  const breadcrumbSchema = {
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

  return (
    <>
      <Header />
      {/* JSON-LD scripts must be server-rendered and visible in page source */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <SingleProductComponent
        singleProductData={product}
        allProductData={allProducts}
        popularProducts={popularProducts}
      />
      <Footer />
    </>
  );
}
