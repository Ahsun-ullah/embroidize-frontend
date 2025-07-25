import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import { getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';
import { Suspense, use } from 'react';

const RecentProductsSection = () => {
  const { products: allProducts } = use(getProducts('', 1, 8));

  return (
    <>
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            <Suspense fallback={<LoadingSpinner />}>
              {allProducts?.length > 0 &&
                allProducts.map((item, index) => (
                  <ProductCard key={item._id || index} item={item} />
                ))}
            </Suspense>
          </div>
          <div className='flex justify-center items-center mt-14'>
            <Link
              href={'/products'}
              className='bg-black rounded-full hover:bg-blue-400 text-white font-medium px-6 py-2'
            >
              View All
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentProductsSection;
