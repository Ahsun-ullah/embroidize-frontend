import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import Header from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import FilterLayout from '@/features/products/components/filters/FilterLayout';
import {
  readFilterParams,
  toApiFilters,
} from '@/features/products/components/filters/filterConfig';
import { getProductFilters, getProducts } from '@/lib/apis/public/products';
import { capitalize } from '@/utils/functions/page';
import Link from 'next/link';

export async function generateMetadata({ searchParams }) {
  // Next 15: searchParams is async and must be awaited before property access.
  const params = await searchParams;
  const searchQuery = params.searchQuery || '';
  try {
    return {
      title: `${searchQuery}`,
      description: `Browse the latest ${searchQuery} designs—perfect for your next sewing project. Each file is tested for machine embroidery design compatibility and comes in DST, PES, EXP, HUS, VP3, JEF, XXX, and CND formats.`,
      robots: 'noindex, follow',
      alternates: {
        canonical: `https://embroidize.com/search?searchQuery=${encodeURIComponent(searchQuery)}`,
      },

      openGraph: {
        title: `${searchQuery}`,
        description: `Browse the latest ${searchQuery} designs—perfect for your next sewing project. Each file is tested for machine embroidery design compatibility and comes in DST, PES, EXP, HUS, VP3, JEF, XXX, and CND formats.`,
        images: [
          {
            url: 'https://embroidize.com/og-banner.jpg',
            width: 1200,
            height: 630,
            alt: `${searchQuery}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${searchQuery}`,
        description: `Browse the latest ${searchQuery} designs—perfect for your next sewing project. Each file is tested for machine embroidery design compatibility and comes in DST, PES, EXP, HUS, VP3, JEF, XXX, and CND formats.`,
        images: ['https://embroidize.com/home-banner.jpg'],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
  }
}

export default async function SearchPage({ searchParams }) {
  // Next 15: searchParams is async and must be awaited before property access.
  const params = await searchParams;
  const searchQuery = params.searchQuery || '';
  const currentPage = parseInt(params?.page) || 1;
  const perPageData = parseInt(params?.limit) || 20;

  // Filters narrow the search results rather than replacing them, so the
  // relevance ranking (and the exact title/serial/SKU pin) still applies
  // inside whatever category or tier is selected.
  const filterState = readFilterParams(params);
  const apiFilters = toApiFilters(filterState);

  const [productData, facets] = await Promise.all([
    getProducts(searchQuery, currentPage || 0, perPageData, apiFilters),
    getProductFilters(searchQuery, apiFilters),
  ]);

  const { products, totalCount, totalPages } = productData;

  return (
    <div className='bg-[#fafafa]'>
      <Header />
      <div className='container pt-4 pb-8'>
        <h1 className='text-2xl font-bold'>
          Search Results: <span className='font-medium'>{searchQuery}</span>
        </h1>

        <div className='font-medium'>
          <BreadCrumb
            items={[
              { label: 'Home', href: '/' },
              {
                label: `Search: ${capitalize(searchQuery)}`,
                href: `/search?searchQuery=${encodeURIComponent(searchQuery)}`,
              },
            ]}
          />
        </div>

        <div className=' flex flex-col justify-between'>
          <section className='text-black border-b-2'>
            <FilterLayout facets={facets} total={totalCount} context='search'>
              {products?.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                  {products.map((item, index) => (
                    <ProductCard key={item._id} item={item} index={index} />
                  ))}
                </div>
              ) : (
                <div className='mx-auto max-w-md py-16 text-center'>
                  <p className='text-lg font-semibold'>
                    No designs found for &ldquo;{searchQuery}&rdquo;
                  </p>
                  <p className='mt-2 text-sm text-gray-500'>
                    Try a shorter or more general term — small typos are okay,
                    we handle those automatically. If you have filters on, try
                    clearing them too.
                  </p>
                  <Link
                    href='/products'
                    className='mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white'
                  >
                    Browse all designs
                  </Link>
                </div>
              )}
              {totalPages > 1 && (
                <div className='flex items-center justify-center my-6'>
                  <Pagination
                    currentPage={currentPage}
                    perPageData={perPageData}
                    totalPages={totalPages}
                  />
                </div>
              )}
            </FilterLayout>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
