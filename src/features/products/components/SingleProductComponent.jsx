import LoadingSpinner from '@/components/Common/LoadingSpinner';
import ProductCard from '@/components/Common/ProductCard';
import { capitalize } from '@/utils/functions/page';
import { marked } from 'marked';
import Link from 'next/link';
import { Suspense } from 'react';
import { BreadCrumb } from './BreadCrumb';
import ProductDownloadCard from './ProductDownloadCard';
import { SingleProductImageCard } from './SingleProductImageCard';

export const SingleProductComponent = async ({
  singleProductData,
  allProductData,
  popularProducts,
}) => {
  // console.log(singleProductData);
  const rawMarkup = marked(singleProductData?.description || '');
  return (
    <main className='container mx-auto px-4'>
      {/* Breadcrumb */}
      <div className='mb-6 font-medium'>
        <BreadCrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Product', href: '/products' },
            {
              label: capitalize(singleProductData?.category?.name),
              href: `/category/${singleProductData?.category?.slug}`,
            },
            ...(singleProductData?.sub_category?._id
              ? [
                  {
                    label: capitalize(singleProductData.sub_category.name),
                    href: `/${singleProductData.category.slug}/${singleProductData.sub_category.slug}`,
                  },
                ]
              : []),
            {
              label: capitalize(singleProductData?.name),
              href: '#',
            },
          ]}
        />
      </div>

      {/* Product Image & Download Section */}
      <div className='flex flex-col lg:flex-row gap-10'>
        <div>
          <Suspense fallback={<LoadingSpinner />}>
            <SingleProductImageCard data={singleProductData} />
          </Suspense>
        </div>

        <div className='flex flex-col gap-10 w-full'>
          <ProductDownloadCard data={singleProductData} />
          <div className='bg-white py-10 px-4 md:px-8 rounded-2xl shadow-lg'>
            <div className='max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center text-gray-800'>
              <div className='flex flex-col items-center'>
                <svg
                  className='w-10 h-10 text-black mb-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M10 0C8.895 0 8 0.895 8 2v7H5l5 5 5-5h-3V2c0-1.105-.895-2-2-2zm-6 18v2h12v-2H4z' />
                </svg>
                <h3 className='font-bold text-sm uppercase'>
                  Including
                  <br />
                  Commercial License
                </h3>
              </div>

              <div className='flex flex-col items-center'>
                <svg
                  className='w-10 h-10 text-black mb-4'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M10 0C4.486 0 0 4.486 0 10s4.486 10 10 10 10-4.486 10-10S15.514 0 10 0zm0 3a2 2 0 110 4 2 2 0 010-4zm0 14c-2.485 0-4.675-1.28-6-3.25.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1C14.675 15.72 12.485 17 10 17z' />
                </svg>
                <h3 className='font-bold text-sm uppercase'>
                  Premium
                  <br />
                  Technical Support
                </h3>
              </div>

              <div className='flex flex-col items-center'>
                <svg
                  className='w-10 h-10 text-black mb-4'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12 0c-1.1 0-2 .9-2 2v4h-2V2c0-1.1-.9-2-2-2S4 0.9 4 2v4H2c-1.1 0-2 .9-2 2v2h24V8c0-1.1-.9-2-2-2h-2V2c0-1.1-.9-2-2-2s-2 .9-2 2v4h-2V2c0-1.1-.9-2-2-2zM0 12v10c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2V12H0zm6 2h12v2H6v-2z' />
                </svg>
                <h3 className='font-bold text-sm uppercase'>
                  Embroidery
                  <br />
                  Machine Friendly
                </h3>
              </div>
            </div>

            <p className='text-center mt-8 text-gray-600'>
              This design is an embroidery design, optimized for embroidery
              machines.
            </p>
          </div>
        </div>
      </div>

      {/* Details & Related Section */}
      <div className='flex flex-col lg:flex-row gap-10 my-12'>
        {/* Left: Description & Keywords */}
        <div className='w-full lg:w-3/4'>
          {/* Product Details */}
          <Suspense fallback={<LoadingSpinner />}>
            <div className='mb-10'>
              <h2 className='text-black font-bold text-2xl mb-6 capitalize'>
                About {singleProductData?.name}
              </h2>
              <pre
                dangerouslySetInnerHTML={{ __html: rawMarkup }}
                className='prose max-w-none break-words whitespace-pre-wrap font-sans text-lg'
              />
            </div>
          </Suspense>

          {/* Related Keywords */}
          <Suspense fallback={<LoadingSpinner />}>
            {Array.isArray(singleProductData?.meta_keywords) && (
              <div className='my-10'>
                <h2 className='text-black text-lg font-semibold mb-4'>
                  Related Keywords
                </h2>
                <div className='flex flex-wrap gap-2'>
                  {singleProductData?.meta_keywords.map((item, index) => (
                    <Link
                      href={`/search?searchQuery=${item.split(' ').join('+')}`}
                      key={index}
                      className='bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize hover:bg-black hover:text-white transition'
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Suspense>
        </div>

        {/* Right: Recommendations */}
        <Suspense fallback={<LoadingSpinner />}>
          <div className='w-full lg:w-1/2'>
            {/* Relevant Designs */}
            <div className='mb-10'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-black text-lg font-bold'>
                  Relevant Designs
                </h2>
                <Link
                  href={`/${singleProductData?.sub_category?.slug ? singleProductData?.category?.slug : 'category/' + singleProductData?.category?.slug}/${singleProductData?.sub_category?.slug ?? ''}`}
                  className='text-sm text-black underline'
                >
                  See All Designs
                </Link>
              </div>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {allProductData?.slice(0, 6).map((item, index) => (
                  <ProductCard item={item} key={`relevant-${index}`} />
                ))}
              </div>
            </div>

            {/* Most Popular Designs */}
            <Suspense fallback={<LoadingSpinner />}>
              <div>
                <div className='flex items-center justify-between mb-6'>
                  <h2 className='text-black text-lg font-bold'>
                    Most Popular Designs
                  </h2>
                  <Link
                    href='/products?filter=popular'
                    className='text-sm text-black underline'
                  >
                    All Popular Designs
                  </Link>
                </div>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {popularProducts?.slice(0, 4).map((item, index) => (
                    <ProductCard item={item} key={`popular-${index}`} />
                  ))}
                </div>
              </div>
            </Suspense>
          </div>
        </Suspense>
      </div>

      {/* Future Section */}
      {/* <SubscribeSearchSection /> */}
    </main>
  );
};
