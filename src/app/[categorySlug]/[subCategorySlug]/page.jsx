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
import { getProductFilters, getProducts } from '@/lib/apis/public/products';
import { getSingleSubCategory } from '@/lib/apis/public/subcategory';
import { capitalize, preserveParagraphLineBreaks } from '@/utils/functions/page';
import { marked } from 'marked';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export async function generateMetadata({ params, searchParams }) {
  try {
    const response = await getSingleSubCategory(params.subCategorySlug);
    const subcategory = response?.data;
    const baseUrl = `https://embroidize.com/${subcategory?.category?.slug}/${subcategory?.slug}`;
    // Paginated pages self-canonicalize (page 2 → page 2) so products that only
    // appear on deeper pages still get indexed. Page 1 uses the clean URL.
    const page = parseInt(searchParams?.page) || 1;
    const canonicalUrl = page > 1 ? `${baseUrl}?page=${page}` : baseUrl;

    // Sidebar-filtered views are near-duplicates of this page — crawlable
    // through to the products, but kept out of the index themselves.
    const isFiltered = hasGranularFilters(readFilterParams(searchParams));

    return {
      title: subcategory?.meta_title,
      description: subcategory?.meta_description,
      ...(isFiltered && { robots: { index: false, follow: true } }),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: subcategory?.meta_title,
        description: subcategory?.meta_description,
        images: [
          {
            url:
              subcategory?.image?.url ||
              'https://embroidize.com/og-banner.jpg ',
            width: 1200,
            height: 630,
            alt: subcategory?.name,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: subcategory?.meta_title,
        description: subcategory?.meta_description,
        images: [
          subcategory?.image?.url || 'https://embroidize.com/og-banner.jpg',
        ],
      },
    };
  } catch (error) {
    console.error('Metadata fetch failed:', error);
  }
}

export default async function SubCategoryProducts({ params, searchParams }) {
  const categorySlug = params.categorySlug;
  const subCategorySlug = params.subCategorySlug;
  const currentPage = parseInt(searchParams?.page) || 1;
  const perPageData = parseInt(searchParams?.limit) || 20;

  // Both category and subcategory are fixed by the route, so both groups are
  // locked out of the sidebar; tier, collection, date and sort still apply.
  const filterState = readFilterParams(searchParams);
  const apiFilters = toApiFilters({
    ...filterState,
    category: [categorySlug],
    sub_category: [subCategorySlug],
  });

  const [productData, facets, subCategoryData] = await Promise.all([
    getProducts('', currentPage, perPageData, apiFilters),
    getProductFilters('', apiFilters),
    getSingleSubCategory(subCategorySlug),
  ]);

  const { products, totalCount, totalPages } = productData;
  const subCategory = subCategoryData?.data;

  if (
    categorySlug !== subCategory?.category?.slug ||
    subCategorySlug !== subCategory?.slug
  ) {
    redirect(`/${subCategory?.category?.slug}/${subCategory?.slug}`);
  }

  if (!subCategory) {
    return (
      <div className='text-center py-12'>
        <p>Subcategory not found.</p>
      </div>
    );
  }

  const rawMarkup = marked(subCategory?.description || '');
  const formattedMarkup = preserveParagraphLineBreaks(rawMarkup);

  return (
    <div className='bg-[#f4f4f4]'>
      <Header />
      <div className='container mx-auto px-4 py-6 flex flex-col gap-4'>
        <h1 className='capitalize text-3xl'>
          {subCategory?.name}
          {/* Embroidery Designs */}
        </h1>

        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: capitalize(subCategory?.category?.name),
              href: `/category/${subCategory?.category?.slug}`,
            },
            {
              label: capitalize(subCategory?.name),
              href: `/${subCategory?.category?.slug}/${subCategory?.slug}`,
            },
          ]}
        />

        <FilterLayout
          facets={facets}
          total={totalCount}
          locked={['category', 'sub_category']}
        >
          {products.length === 0 ? (
            <div className='rounded-xl border border-gray-200 bg-white py-16 text-center'>
              <p className='text-lg font-semibold'>No designs match these filters</p>
              <p className='mt-2 text-sm text-gray-500'>
                Try removing a filter to see more of this subcategory.
              </p>
              <Link
                href={`/${categorySlug}/${subCategorySlug}`}
                prefetch={false}
                className='mt-6 inline-block rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white'
              >
                Clear all filters
              </Link>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
                {products.map((item, index) => (
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

      <div className='container'>
        <div
          dangerouslySetInnerHTML={{ __html: formattedMarkup }}
          className='custom-blog-content break-words text-black'
        />
      </div>

      <Footer />
    </div>
  );
}
