import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { getPopularProducts, getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';
import ProductUpdates from './ProductUpdates';

export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const isPopular = searchParams?.filter === 'popular';

  const baseTitle = 'Machine Embroidery Designs';
  const baseDescription =
    'Welcome to our premium collection of machine embroidery designs, fully compatible with all embroidery machines. Instantly download high-quality embroidery files in CND, DST, EXP, HUS, JEF, PES, VP3, and XXX formats.';

  const popularTitle = 'Popular Embroidery Designs - Embroidize';
  const popularDescription =
    'Explore our most downloaded and loved machine embroidery designs. Popular formats like DST, PES, JEF, and more available for instant download.';

  return {
    title: isPopular ? popularTitle : baseTitle,
    description: isPopular ? popularDescription : baseDescription,
    alternates: {
      canonical: isPopular
        ? 'https://embroidize.com/products?filter=popular'
        : 'https://embroidize.com/products',
    },
    openGraph: {
      title: isPopular ? popularTitle : baseTitle,
      description: isPopular ? popularDescription : baseDescription,
      url: isPopular
        ? 'https://embroidize.com/products?filter=popular'
        : 'https://embroidize.com/products',
      siteName: 'Embroidize',
      images: [
        {
          url: 'https://embroidize.com/og-banner.jpg',
          width: 1200,
          height: 630,
          alt: 'Embroidery Machine Designs',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: isPopular ? popularTitle : baseTitle,
      description: isPopular ? popularDescription : baseDescription,
      images: ['https://embroidize.com/og-banner.jpg'],
    },
  };
}

export default async function AllProductsPage({ searchParams }) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;
  const isPopular = searchParams?.filter === 'popular';

  const productData = isPopular
    ? await getPopularProducts('', currentPage, perPageData)
    : await getProducts('', currentPage, perPageData);

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
        <h1 className='text-3xl font-bold my-6 text-gray-900'>
          Browse All Digital Embroidery Designs from Embroidize
        </h1>
        <section className='text-black mb-8 py-6 border-b-2'>
          <div className='flex justify-between gap-4 mb-8'>
            <div className='flex justify-between gap-4'>
              <Link
                href='/products'
                prefetch={false}
                className={`px-4 py-2 rounded ${!isPopular ? 'bg-black text-white' : 'border'}`}
              >
                All Products
              </Link>
              <Link
                href='/products?filter=popular'
                prefetch={false}
                className={`px-4 py-2 rounded ${isPopular ? 'bg-black text-white' : 'border'}`}
              >
                Popular Products
              </Link>
            </div>

            <div className='px-4 py-2 border rounded bg-slate-50'>{totalCount}  Results Found</div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((item, index) => (
              // <ProductCard key={item._id} item={item} />
              <ProductCard key={item._id} item={item} index={index} />
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
