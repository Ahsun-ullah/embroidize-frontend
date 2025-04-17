import ProductCard from '@/components/Common/ProductCard';
import { getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';
import { use } from 'react';

const RecentProductsSection = ({ searchParams }) => {
  const currentPage = parseInt(searchParams?.page || '0', 10);
  const perPageData = 40;
  const { products: allProducts, totalCount } = use(
    getProducts(currentPage, perPageData),
  );

  return (
    <>
      <section className='bg-blue-50 text-black my-8 py-6 mx-2'>
        <div className='flex items-center justify-center'>
          <h1 className='text-3xl font-bold text-center'>
            Recent Approved Products
          </h1>
        </div>
        <div className='flex items-center justify-center mt-4'>
          <h3 className='font-semibold text-center'>
            Design for every Budget & every Project.
          </h3>
        </div>
      </section>
      <section className='text-black my-8 py-6'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
            {allProducts?.length > 0 &&
              allProducts.map((item, index) => (
                <ProductCard key={index} item={item} />
              ))}
          </div>
          <div className='flex justify-center items-center mt-14'>
            <Link
              href={'/user/products'}
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
