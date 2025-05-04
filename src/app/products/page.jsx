import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getProducts } from '@/lib/apis/public/products';
import { use } from 'react';

export default function AllProductsPage({ searchParams }) {
  const currentPage = parseInt(searchParams?.page || '0', 10);
  const perPageData = 20;
  const { products, totalCount, totalPages } = use(getProducts('', currentPage || 0, perPageData));

  return (
    <>
      <Header />
      <div className='flex flex-col justify-between'>
        <section className='text-black my-8 py-6 border-b-2'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
              {products.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>
          </div>
          {/* Pagination Component */}
          <div className='flex items-center justify-center mt-6'>
            <Pagination
              currentPage={currentPage}
              perPageData={perPageData}
              totalPages={totalPages}
            />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
