import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import { getProducts } from '@/lib/apis/public/products';
import { capitalize } from '@/utils/functions/page';
import { use } from 'react';

export async function generateMetadata({ searchParams }) {
  const searchQuery = searchParams.searchQuery || '';
  try {
    return {
      title: `${searchQuery} - Embroidize`,
      description: `Browse the latest ${searchQuery} designs—perfect for your next sewing project. Each file is tested for machine embroidery design compatibility and comes in DST, PES, EXP, HUS, VP3, JEF, XXX, and CND formats.`,
      robots: 'noindex, follow',
      alternates: {
        canonical: `https://embroidize.com/search?searchQuery=${searchQuery}`,
      },

      openGraph: {
        title: `${searchQuery} - Embroidize`,
        description: `Browse the latest ${searchQuery} designs—perfect for your next sewing project. Each file is tested for machine embroidery design compatibility and comes in DST, PES, EXP, HUS, VP3, JEF, XXX, and CND formats.`,
        images: [
          {
            url: 'https://embroidize.com/og-banner.jpg',
            width: 1200,
            height: 630,
            alt: `${searchQuery} - Embroidize`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${searchQuery} - Embroidize`,
        description: `Browse the latest ${searchQuery} designs—perfect for your next sewing project. Each file is tested for machine embroidery design compatibility and comes in DST, PES, EXP, HUS, VP3, JEF, XXX, and CND formats.`,
        images: ['https://embroidize.com/home-banner.jpg'],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
  }
}

export default function SearchPage({ searchParams }) {
  const searchQuery = searchParams.searchQuery || '';
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;

  const { products, totalCount, totalPages } = use(
    getProducts(searchQuery, currentPage || 0, perPageData),
  );

  return (
    <>
      <Header />
      <div className='container py-8'>
        <h1 className='text-2xl font-bold mb-4'>
          Search Results: <span className='font-medium'>{searchQuery}</span>
        </h1>

        <div className='font-medium'>
          <BreadCrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Product', href: '/products' },
              {
                label: `${capitalize(searchQuery)}`,
                href: `/product/${searchQuery}`,
              },
            ]}
          />
        </div>

        <div className=' flex flex-col justify-between'>
          <section className='text-black my-8 border-b-2'>
            <div>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {products?.length > 0 ? (
                  products.map((item, index) => (
                    // <ProductCard key={index} item={item} />
                    <ProductCard key={item._id} item={item} index={index} />
                  ))
                ) : (
                  <div className='col-span-4 text-center '>
                    <p className='text-lg font-semibold'>
                      No products found for "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className='flex items-center justify-center my-6'>
              <Pagination
                currentPage={currentPage}
                perPageData={perPageData}
                totalPages={totalPages}
              />
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
