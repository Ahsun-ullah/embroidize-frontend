import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import FilterLayout from '@/features/products/components/filters/FilterLayout';
import {
  hasGranularFilters,
  readFilterParams,
  toApiFilters,
} from '@/features/products/components/filters/filterConfig';
import { getProductFilters, getProducts } from '@/lib/apis/public/products';
import Link from 'next/link';
import ProductUpdates from './ProductUpdates';

export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const filter = searchParams?.filter;
  const isPopular = filter === 'popular';
  const isAdminChoice = filter === 'embroidize-choice';
  const isMostFavourited = filter === 'most-favourited';

  const baseTitle = 'Machine Embroidery Designs';
  const baseDescription =
    'Welcome to our premium collection of machine embroidery designs, fully compatible with all embroidery machines. Instantly download high-quality embroidery files in CND, DST, EXP, HUS, JEF, PES, VP3, and XXX formats.';

  const popularTitle = 'Popular Embroidery Designs - Top Downloads';
  const popularDescription =
    'Explore our most downloaded and loved machine embroidery designs. Popular formats like DST, PES, JEF, and more available for instant download.';

  const adminChoiceTitle = 'Embroidize Choice - Premium Embroidery Designs';
  const adminChoiceDescription =
    'Discover our curated selection of premium embroidery designs, handpicked by our team for quality and uniqueness.';

  const mostFavouritedTitle = 'Most Favourited Embroidery Designs - Community Picks';
  const mostFavouritedDescription =
    'Browse the embroidery designs our community favourites the most. Saved by thousands and ready for instant download.';

  const pickTitle = isPopular
    ? popularTitle
    : isAdminChoice
      ? adminChoiceTitle
      : isMostFavourited
        ? mostFavouritedTitle
        : baseTitle;

  const pickDescription = isPopular
    ? popularDescription
    : isAdminChoice
      ? adminChoiceDescription
      : isMostFavourited
        ? mostFavouritedDescription
        : baseDescription;

  const canonicalPath = isPopular
    ? '/products?filter=popular'
    : isAdminChoice
      ? '/products?filter=embroidize-choice'
      : isMostFavourited
        ? '/products?filter=most-favourited'
        : '/products';

  // Faceted URLs are combinatorial — thousands of category×tier×sort permutations
  // would otherwise land in the index as near-duplicates of each other. The four
  // tab views stay indexable exactly as before; anything the sidebar produces is
  // noindex,follow so crawlers still walk through to the products themselves.
  const isFiltered = hasGranularFilters(readFilterParams(searchParams));

  return {
    title: pickTitle,
    description: pickDescription,
    ...(isFiltered && { robots: { index: false, follow: true } }),
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
  const isMostFavourited = filter === 'most-favourited';

  // The tab views are no longer separate endpoints — they expand into the same
  // filter vocabulary the sidebar writes, so "Embroidize Choice" and "Free" can
  // finally be combined instead of being mutually exclusive pages.
  const filterState = readFilterParams(searchParams);
  const apiFilters = toApiFilters(filterState);

  const [productData, facets] = await Promise.all([
    getProducts('', currentPage, perPageData, apiFilters),
    getProductFilters('', apiFilters),
  ]);

  const { products, totalCount, totalPages } = productData;

  return (
    <div className='bg-[#f4f4f4]'>
      <Header />
      {/* listens for new-product events and re-runs this SSR page */}
      <ProductUpdates />
      <div className='container flex flex-col justify-between'>
        <h1 className='text-2xl font-bold my-4 text-gray-900'>
          Browse All Digital Embroidery Designs from Embroidize
        </h1>
        <section className='text-black mb-8'>
          <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 '>
            {/* Filter Buttons Container: Scrolls on mobile, wraps on tablet, flex on desktop */}
            <div className='flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar'>
              <Link
                href='/products'
                prefetch={false}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
                  !isPopular && !isAdminChoice && !isMostFavourited
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
                href='/products?filter=most-favourited'
                prefetch={false}
                className={`px-4 py-2 text-sm whitespace-nowrap rounded transition-colors ${
                  isMostFavourited
                    ? 'bg-black text-white'
                    : 'border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Most Favourited
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
          </div>

          <FilterLayout facets={facets} total={totalCount}>
            {products.length > 0 ? (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {products.map((item, index) => (
                    <ProductCard key={item._id} item={item} index={index} />
                  ))}
                </div>
                <div className='flex items-center justify-center mt-8'>
                  <Pagination totalPages={totalPages} perPageData={perPageData} />
                </div>
              </>
            ) : (
              <div className='rounded-xl border border-gray-200 bg-white py-16 text-center'>
                <p className='text-lg font-semibold'>No designs match these filters</p>
                <p className='mt-2 text-sm text-gray-500'>
                  Try removing a filter, or clear them all to see the full catalogue.
                </p>
                <Link
                  href='/products'
                  prefetch={false}
                  className='mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white'
                >
                  Clear all filters
                </Link>
              </div>
            )}
          </FilterLayout>
        </section>
      </div>
      <Footer />
    </div>
  );
}
