import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import {
  getAdminChoiceProducts,
  getPopularProducts,
  getProducts,
} from '@/lib/apis/public/products';
import Link from 'next/link';
import ProductUpdates from './ProductUpdates';

export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const isPopular = searchParams?.filter === 'popular';
  const isAdminChoice = searchParams?.filter === 'embroidize-choice';

  const baseTitle = 'Machine Embroidery Designs';
  const baseDescription =
    'Welcome to our premium collection of machine embroidery designs, fully compatible with all embroidery machines. Instantly download high-quality embroidery files in CND, DST, EXP, HUS, JEF, PES, VP3, and XXX formats.';

  const popularTitle = 'Popular Embroidery Designs - Top Downloads';
  const popularDescription =
    'Explore our most downloaded and loved machine embroidery designs. Popular formats like DST, PES, JEF, and more available for instant download.';

  const adminChoiceTitle = 'Embroidize Choice - Premium Embroidery Designs';
  const adminChoiceDescription =
    'Discover our curated selection of premium embroidery designs, handpicked by our team for quality and uniqueness.';

  return {
    title: isPopular
      ? popularTitle
      : isAdminChoice
        ? adminChoiceTitle
        : baseTitle,
    description: isPopular
      ? popularDescription
      : isAdminChoice
        ? adminChoiceDescription
        : baseDescription,
    alternates: {
      canonical: isPopular
        ? 'https://embroidize.com/products?filter=popular'
        : isAdminChoice
          ? 'https://embroidize.com/products?filter=embroidize-choice'
          : 'https://embroidize.com/products',
    },
    openGraph: {
      title: isPopular
        ? popularTitle
        : isAdminChoice
          ? adminChoiceTitle
          : baseTitle,
      description: isPopular
        ? popularDescription
        : isAdminChoice
          ? adminChoiceDescription
          : baseDescription,
      url: isPopular
        ? 'https://embroidize.com/products?filter=popular'
        : isAdminChoice
          ? 'https://embroidize.com/products?filter=embroidize-choice'
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
      title: isPopular
        ? popularTitle
        : isAdminChoice
          ? adminChoiceTitle
          : baseTitle,
      description: isPopular
        ? popularDescription
        : isAdminChoice
          ? adminChoiceDescription
          : baseDescription,
      images: ['https://embroidize.com/og-banner.jpg'],
    },
  };
}

export default async function AllProductsPage({ searchParams }) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;
  const isPopular = searchParams?.filter === 'popular';
  const isAdminChoice = searchParams?.filter === 'embroidize-choice';

  const productData = isPopular
    ? await getPopularProducts('', currentPage, perPageData)
    : isAdminChoice
      ? await getAdminChoiceProducts('', currentPage, perPageData)
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
        <section className='text-black mb-8 py-6'>
          <div className='flex justify-between gap-4 mb-8'>
            <div className='flex justify-between gap-4'>
              <Link
                href='/products'
                prefetch={false}
                className={`px-4 py-2 rounded ${!isPopular && !isAdminChoice ? 'bg-black text-white' : 'border'}`}
              >
                All
              </Link>
              <Link
                href='/products?filter=popular'
                prefetch={false}
                className={`px-4 py-2 rounded ${isPopular ? 'bg-black text-white' : 'border'}`}
              >
                Popular
              </Link>
              <Link
                href='/products?filter=embroidize-choice'
                prefetch={false}
                className={`px-4 py-2 rounded ${isAdminChoice ? 'bg-black text-white' : 'border'}`}
              >
                Embroidize Choice
              </Link>
            </div>

            <div className='px-4 py-2 border rounded bg-slate-50'>
              {totalCount} Results Found
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
            {products.map((item, index) => (
              // <ProductCard key={item._id} item={item} />
              <ProductCard key={item._id} item={item} index={index} />
            ))}
          </div>
          {/* Pagination Component */}
          <div className='flex items-center justify-center mt-8'>
            <Pagination totalPages={totalPages} perPageData={perPageData} />
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
