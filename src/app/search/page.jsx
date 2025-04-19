import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getProducts } from '@/lib/apis/public/products';
import { use } from 'react';

export default function SearchPage({ searchParams }) {
  const searchQuery = searchParams.searchQuery || '';
  const currentPage = searchParams.page ? parseInt(searchParams.page, 10) : 0;
  const perPageData = 40;
  const { products, totalCount } = use(getProducts(currentPage, perPageData));

  return (
    <>
      <Header />
      <div className='container mx-auto py-8'>
        <h1 className='text-2xl font-bold mb-4'>Search Results</h1>
        <p>
          You searched for: <span className='font-medium'>{searchQuery}</span>
        </p>

        <div className='min-h-screen flex flex-col justify-between'>
          <section className='text-black my-8 py-6 border-b-2'>
            <div className='container mx-auto px-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10'>
                {products.map((item, index) => (
                  <ProductCard key={index} item={item} />
                ))}
              </div>
            </div>
            <div className='flex items-center justify-center mt-6'>
              <Pagination
                data={products}
                currentPage={currentPage}
                perPageData={perPageData}
                totalCount={totalCount}
              />
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
