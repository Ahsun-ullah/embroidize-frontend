import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import {
  getPopularProducts,
  getSingleProduct,
} from '@/lib/apis/public/products';
import { getAllProductsBySubCategory } from '@/lib/apis/public/subcategory';
import { use } from 'react';

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

export default function ProductDetails({ params }) {
  const { slug } = use(params);

  const response = use(getSingleProduct(slug));
  const product = response?.data;

  const { products: allProductsBuSubcategory } = use(
    getAllProductsBySubCategory(response?.data?.sub_category?.slug, 1, 6),
  );

  const popularProducts = use(getPopularProducts('', 1, 4));

  if (!product) return notFound();

  console.log(popularProducts?.products);

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Product',
            name: product.name,
            image: [product.image?.url],
            description: product.meta_description || product.description,
            offers: {
              '@type': 'Offer',
              url: `https://embroidize.com/product/${product.slug}`,
              priceCurrency: 'USD',
              price: product.price,
              availability: 'InStock',
            },
          }),
        }}
      />

      <Header />
      <SingleProductComponent
        singleProductData={product}
        allProductData={allProductsBuSubcategory}
        popularProducts={popularProducts?.products}
      />
      <Footer />
    </>
  );
}
