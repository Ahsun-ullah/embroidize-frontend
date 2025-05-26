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

export async function generateMetadata({ params }) {
  try {
    const response = await getSingleProduct(params.slug);
    const product = response?.data;

    if (!product) return {};

    return {
      title: product.meta_title,
      description: product.meta_description,
      openGraph: {
        title: product.meta_title,
        description: product.meta_description,
        images: [
          {
            url: product.image?.url || 'https://embroidize.com/og-banner.jpg',
            width: 1200,
            height: 630,
            alt: product.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.meta_title,
        description: product.meta_description,
        images: [
          product.image?.url || 'https://embroidize.com/home-banner.jpg',
        ],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
    return {
      title: 'Free Embroidery Machine Design',
      description:
        'Download free embroidery machine designs with high-quality patterns for various fabric types. Get creative with our exclusive free collection of embroidery designs.',
    };
  }
}

export default async function ProductDetails({ params }) {
  const slug = params.slug;

  const response = await getSingleProduct(slug);
  const product = response?.data;

  if (!product) return notFound();

  const hasSubCategory = !!product?.sub_category?.slug;

  const productListResponse = hasSubCategory
    ? await getAllProductsBySubCategory(product.sub_category.slug, 1, 6)
    : await getAllProductsByCategory(product.category?.slug, 1, 6);

  const allProducts = productListResponse?.products ?? [];
  const popularProducts = (await getPopularProducts('', 1, 4))?.products ?? [];

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.name,
    image: [product.image?.url],
    description: product.meta_description,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Embroidize',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating?.average || 4.5,
      reviewCount: product.rating?.count || 100,
    },
    review: product.reviews?.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.author || 'Anonymous',
      },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating || 4,
        bestRating: 5,
        worstRating: 1,
      },
      reviewBody: review.comment || '',
    })),
    offers: {
      '@type': 'Offer',
      url: `https://embroidize.com/product/${product.slug}`,
      priceCurrency: 'USD',
      price: product.price === 0 ? 'Free' : product.price.toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <>
      <head>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>

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
