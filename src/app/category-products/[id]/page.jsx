import ProductCard from '@/components/Common/ProductCard';

import Pagination from '@/components/Common/Pagination';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { getSingleCategory } from '@/lib/apis/public/category';
import { getProducts } from '@/lib/apis/public/products';
import { use } from 'react';

export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    const response = await getSingleCategory(id);
    const category = response?.data;

    console.log(category);

    return {
      title: category?.meta_title || category?.name,
      description:
        category?.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      openGraph: {
        title: category?.meta_title || category?.name,
        description:
          category?.meta_description ||
          'Download high-quality embroidery machine designs for free.',
        images: [
          {
            url:
              category?.image?.url ||
              'https://embro-id.vercel.app/home-banner.jpg',
            width: 1200,
            height: 630,
            alt: category?.name || 'Embroidery Design',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: category?.meta_title || category?.name,
        description: category?.meta_description || category?.description,
        images: [
          category?.image?.url || 'https://embro-id.vercel.app/og-banner.jpg',
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

export default function CategoryProducts({ searchParams }) {
  const currentPage = parseInt(searchParams?.page || '0', 10);
  const perPageData = 40;
  const { products: allProducts, totalCount } = use(
    getProducts(currentPage, perPageData),
  );

  return (
    <>
      <Header />
      <div className='min-h-screen flex flex-col justify-between'>
        <section className='text-black my-8 py-6 border-b-2'>
          <div className='container mx-auto px-4'>
            {allProducts.length === 0 ? (
              <p className='text-center text-gray-600'>
                No products found in this category.
              </p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
                {allProducts.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className='flex items-center justify-center mt-6'>
            <Pagination data={allProducts} currentPage={0} perPageData={10} />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
