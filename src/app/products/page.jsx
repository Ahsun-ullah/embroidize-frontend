import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import {
  getAdminChoiceProducts,
  getMostLikedProducts,
  getPopularProducts,
  getProducts,
} from '@/lib/apis/public/products';
import Link from 'next/link';
import ProductUpdates from './ProductUpdates';

export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const filter = searchParams?.filter;
  const isPopular = filter === 'popular';
  const isAdminChoice = filter === 'embroidize-choice';
  const isMostLiked = filter === 'most-liked';

  const baseTitle = 'Machine Embroidery Designs';
  const baseDescription =
    'Welcome to our premium collection of machine embroidery designs, fully compatible with all embroidery machines. Instantly download high-quality embroidery files in CND, DST, EXP, HUS, JEF, PES, VP3, and XXX formats.';

  const popularTitle = 'Popular Embroidery Designs - Top Downloads';
  const popularDescription =
    'Explore our most downloaded and loved machine embroidery designs. Popular formats like DST, PES, JEF, and more available for instant download.';

  const adminChoiceTitle = 'Embroidize Choice - Premium Embroidery Designs';
  const adminChoiceDescription =
    'Discover our curated selection of premium embroidery designs, handpicked by our team for quality and uniqueness.';

  const mostLikedTitle = 'Most Liked Embroidery Designs - Community Picks';
  const mostLikedDescription =
    'Browse the embroidery designs our community loves the most. Liked by thousands and ready for instant download.';

  const pickTitle = isPopular
    ? popularTitle
    : isAdminChoice
      ? adminChoiceTitle
      : isMostLiked
        ? mostLikedTitle
        : baseTitle;

  const pickDescription = isPopular
    ? popularDescription
    : isAdminChoice
      ? adminChoiceDescription
      : isMostLiked
        ? mostLikedDescription
        : baseDescription;

  const canonicalPath = isPopular
    ? '/products?filter=popular'
    : isAdminChoice
      ? '/products?filter=embroidize-choice'
      : isMostLiked
        ? '/products?filter=most-liked'
        : '/products';

  return {
    title: pickTitle,
    description: pickDescription,
    alternates: { canonical: `https://embroidize.com${canonicalPath}` },
    openGraph: {
      title: pickTitle,
      description: pickDescription,
      url: `https://embroidize.com${canonicalPath}`,
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
      title: pickTitle,
      description: pickDescription,
      images: ['https://embroidize.com/og-banner.jpg'],
    },
  };
}

export default async function AllProductsPage({ searchParams }) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;
  const filter = searchParams?.filter;
  const isPopular = filter === 'popular';
  const isAdminChoice = filter === 'embroidize-choice';
  const isMostLiked = filter === 'most-liked';

  const productData = isPopular
    ? await getPopularProducts('', currentPage, perPageData)
    : isAdminChoice
      ? await getAdminChoiceProducts('', currentPage, perPageData)
      : isMostLiked
        ? await getMostLikedProducts('', currentPage, perPageData)
        : await getProducts('', currentPage, perPageData);

  const { products, totalCount, totalPages } = {
    ...productData,
    totalCount: productData.totalCount,
    totalPages: productData.totalPages,
  };

  return (
    <div className='bg-[#f4f4f4]'>
      <Header />
      {/* listens for new-product events and re-runs this SSR page */}
      <ProductUpdates />
      <div className='container flex flex-col justify-between'>
        <h1 className='text-3xl font-bold my-6 text-gray-900'>
          Browse All Digital Embroidery Designs from Embroidize
        </h1>
        <section className='text-black mb-8 py-6'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8'>
            {/* Filter Buttons Container: Scrolls on mobile, wraps on tablet, flex on desktop */}
            <div className='flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar'>
              <Link
                href='/products'
                prefetch={false}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
                  !isPopular && !isAdminChoice && !isMostLiked
                    ? 'bg-black text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                All
              </Link>
              <Link
                href='/products?filter=popular'
                prefetch={false}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
                  isPopular
                    ? 'bg-black text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Popular
              </Link>
              <Link
                href='/products?filter=most-liked'
                prefetch={false}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
                  isMostLiked
                    ? 'bg-black text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Most Liked
              </Link>
              <Link
                href='/products?filter=embroidize-choice'
                prefetch={false}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
                  isAdminChoice
                    ? 'bg-black text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Embroidize Choice
              </Link>
            </div>

            {/* Result Count: Stays full width on mobile, auto width on desktop */}
            <div className='w-full md:w-auto px-4 py-2 border rounded bg-slate-50 text-sm text-center md:text-left text-gray-600 font-medium'>
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
    </div>
  );
}
