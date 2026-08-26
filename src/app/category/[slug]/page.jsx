import Pagination from '@/components/Common/Pagination';
import ProductCard from '@/components/Common/ProductCard';
import Footer from '@/components/user/HomePage/Footer';
import { Header } from '@/components/user/HomePage/Header';
import { BreadCrumb } from '@/features/products/components/BreadCrumb';
import FilterLayout from '@/features/products/components/filters/FilterLayout';
import {
  hasGranularFilters,
  readFilterParams,
  toApiFilters,
} from '@/features/products/components/filters/filterConfig';
import { getSingleCategory } from '@/lib/apis/public/category';
import { getProductFilters, getProducts } from '@/lib/apis/public/products';
import {
  capitalize,
  preserveParagraphLineBreaks,
} from '@/utils/functions/page';
import { marked } from 'marked';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params, searchParams }) {
  try {
    const response = await getSingleCategory(params?.slug);
    const category = response?.data;
    const baseUrl = `https://embroidize.com/category/${category.slug}`;
    // Paginated pages self-canonicalize (page 2 → page 2) so products that only
    // appear on deeper pages still get indexed. Page 1 uses the clean URL.
    const page = parseInt(searchParams?.page) || 1;
    const canonicalUrl = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;

    // Sidebar-filtered views are near-duplicates of the category page, so they
    // stay out of the index while still being crawlable through to products.
    const isFiltered = hasGranularFilters(readFilterParams(searchParams));

    return {
      title: category?.meta_title || category?.name,
      description:
        category?.meta_description ||
        'Download high-quality embroidery machine designs for free.',
      ...(isFiltered && { robots: { index: false, follow: true } }),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: category?.meta_title || category?.name,
        description:
          category?.meta_description ||
          'Download high-quality embroidery machine designs for free.',
        images: [
          {
            url:
              category?.image?.url || 'https://embroidize.com/home-banner.jpg',
            width: 1200,
            height: 630,
            alt: category?.name || 'Embroidery Design',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: category?.meta_title || category?.name,
        description: category?.meta_description || category?.description,
        images: [
          category?.image?.url || 'https://embroidize.com/og-banner.jpg',
        ],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
  }
}

export default async function CategoryProducts({ params, searchParams }) {
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;

  // The category is fixed by the route, so it is locked into the API call and
  // hidden from the sidebar — everything else (subcategory, tier, collection,
  // date, sort) filters within it.
  const filterState = readFilterParams(searchParams);
  const apiFilters = toApiFilters({ ...filterState, category: [params?.slug] });

  const [productData, facets, singleCategoryData] = await Promise.all([
    getProducts('', currentPage, perPageData, apiFilters),
    getProductFilters('', apiFilters),
    getSingleCategory(params?.slug),
  ]);

  const {
    products: allProducts,
    totalCount,
    totalPages,
  } = productData;

  if (params?.slug !== singleCategoryData?.data?.slug) {
    redirect(`/${singleCategoryData?.data?.slug}`);
  }

  if (!singleCategoryData?.data) {
    return (
      <div className='text-center py-12'>
        <p>category not found.</p>
      </div>
    );
  }

  const rawMarkup = marked(singleCategoryData?.data?.description || '');
  const formattedMarkup = preserveParagraphLineBreaks(rawMarkup);

  return (
    <div className='bg-[#f4f4f4]'>
      <Header />
      <div className='container mx-auto flex flex-col gap-2 mt-4'>
        <h1 className='capitalize text-3xl'>
          {singleCategoryData?.data?.name}
          {/* Embroidery Designs */}
        </h1>
        <BreadCrumb

          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: `${capitalize(singleCategoryData?.data?.name)}`,
              href: `/category/${singleCategoryData?.data?.slug}`,
            },
          ]}
        />
        <div className='flex items-center gap-3 flex-wrap'>
          {singleCategoryData?.data?.subcategories?.map((sub) => (
            <Link
              key={sub?._id}
              href={`/${singleCategoryData?.data?.slug}/${sub?.slug}`}
              prefetch={false}
              className='bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium capitalize hover:bg-black hover:text-white transition shadow-2xl'
            >
              {sub?.name.replace(/embroidery designs/gi, '').trim()}
            </Link>
          ))}
        </div>
      </div>
      <div className='flex flex-col justify-between'>
        <section className='text-black mb-8 mt-4 border-b-2'>
          <div className='container mx-auto px-4'>
            <FilterLayout
              facets={facets}
              total={totalCount}
              locked={['category']}
            >
              {allProducts.length === 0 ? (
                <div className='rounded-xl border border-gray-200 bg-white py-16 text-center'>
                  <p className='text-lg font-semibold'>
                    No designs match these filters
                  </p>
                  <p className='mt-2 text-sm text-gray-500'>
                    Try removing a filter to see more of this category.
                  </p>
                  <Link
                    href={`/category/${singleCategoryData?.data?.slug}`}
                    prefetch={false}
                    className='mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white'
                  >
                    Clear all filters
                  </Link>
                </div>
              ) : (
                <>
                  <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {allProducts.map((item, index) => (
                      <ProductCard key={item._id} item={item} index={index} />
                    ))}
                  </div>
                  <div className='flex items-center justify-center mt-6'>
                    <Pagination perPageData={perPageData} totalPages={totalPages} />
                  </div>
                </>
              )}
            </FilterLayout>
          </div>
        </section>
        <div className='container'>
          <div
            dangerouslySetInnerHTML={{ __html: formattedMarkup }}
            className='custom-blog-content break-words text-black'
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
