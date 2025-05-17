import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getPopularProducts, getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';
import ProductUpdates from './ProductUpdates';
export const dynamic = 'force-dynamic';

export default async function AllProductsPage({ searchParams }) {
  const currentPage = parseInt(searchParams?.page || '0', 10);
  const perPageData = 20;
  const isPopular = searchParams?.filter === 'popular';

  const productData = isPopular
    ? await getPopularProducts('', currentPage || 0, perPageData)
    : await getProducts('', currentPage || 0, perPageData);

  const { products, totalCount, totalPages } = {
    ...productData,
    totalCount: productData.totalCount,
    totalPages: productData.totalPages,
  };

  return (
    <>
      <Header />
      {/* listens for new-product events and re-runs this SSR page */}
      <ProductUpdates />
      <div className='container flex flex-col justify-between'>
        <section className='text-black my-8 py-6 border-b-2'>
          <div className='flex justify-start gap-4 mb-8'>
            <Link
              href='/products'
              className={`px-4 py-2 rounded ${!isPopular ? 'bg-black text-white' : 'border'}`}
            >
              All Products
            </Link>
            <Link
              href='/products?filter=popular'
              className={`px-4 py-2 rounded ${isPopular ? 'bg-black text-white' : 'border'}`}
            >
              Popular Products
            </Link>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((item) => (
              <ProductCard key={item._id} item={item} />
            ))}
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
