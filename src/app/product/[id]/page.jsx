import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import { getProducts, getSingleProduct } from '@/lib/apis/public/products';
import { use } from 'react';

export async function generateMetadata({ searchParams }) {
  const { id } = await searchParams;

  try {
    const response = await getSingleProduct(id);
    const product = response?.data;

    if (!product) return {};

    return {
      title: product.meta_title || product.title,
      description:
        product.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      openGraph: {
        title: product.meta_title || product.title,
        description: product.meta_description,
        images: [
          {
            url:
              product.image?.url || 'https://embro-id.vercel.app/og-banner.jpg',
            width: 1200,
            height: 630,
            alt: product.title || 'Embroidery Design',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product.meta_title || product.title,
        description: product.meta_description || product.description,
        images: [
          product.image?.url || 'https://embro-id.vercel.app/home-banner.jpg',
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

export default function ProductDetails({ searchParams }) {
  const { id } = use(searchParams);

  const response = use(getSingleProduct(id));
  const { products } = use(getProducts('', 0, 10));
  const product = response?.data;

  if (!product) return notFound();

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
              url: `https://embro-id.vercel.app/product/${product.name.split(' ').join('-')}?id=${product?._id}`,
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
        allProductData={products}
      />
      <Footer />
    </>
  );
}
