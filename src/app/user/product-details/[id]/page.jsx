import { SingleProductComponent } from '@/features/products/components/SingleProductComponent';
import { getSingleProduct } from '@/lib/apis/public/products';

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const response = await getSingleProduct(id);
    const product = response?.data;
    console.log(product);

    return {
      title: product?.meta_title || product?.title,
      description:
        product?.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      openGraph: {
        title: product?.meta_title || product?.title,
        description: product?.meta_description,
        images: [
          {
            url:
              product?.image?.url ||
              'https://embro-id.vercel.app/home-banner.jpg',
            width: 1200,
            height: 630,
            alt: product?.title || 'Embroidery Design',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: product?.meta_title || product?.title,
        description: product?.meta_description || product?.description,
        images: [
          product?.image?.url || 'https://embro-id.vercel.app/home-banner.jpg',
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
  return (
    <>
      <SingleProductComponent params={params} />
    </>
  );
}
