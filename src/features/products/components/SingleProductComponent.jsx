'use client';

import LoadingSpinner from '@/components/Common/LoadingSpinner';
import { capitalize } from '@/utils/functions/page';
import { Card } from '@heroui/react';
import { marked } from 'marked';
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { BreadCrumb } from './BreadCrumb';
import ProductDownloadCard from './ProductDownloadCard';
import ClientOnlyRecommendations from './ProductMostPopularAndRelaventDesign';
import { SingleProductImageCard } from './SingleProductImageCard';

export const SingleProductComponent = ({
  singleProductData,
  allProductData,
  popularProducts,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

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
        <div className=' flex  flex-col gap-6'>
          {/* <Suspense fallback={<LoadingSpinner />}> */}
          <SingleProductImageCard
            data={singleProductData}
            onImageLoad={() => setImageLoaded(true)}
          />

          {/* </Suspense> */}
        </div>

        <div className='flex flex-col gap-6 w-full rounded-2xl h-fit'>
          <ProductDownloadCard data={singleProductData} />

          <div className='flex flex-col gap-4 bg-slate-50 p-4 rounded-2xl'>
            <Card
              isFooterBlurred
              className='flex flex-col hover:bg-black/5 transition'
            >
              {singleProductData?.product_pdf?.url && (
                <a
                  href={singleProductData.product_pdf.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center justify-center gap-2 px-4 py-3 text-black font-bold '
                  title='Download Product PDF'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 24 24'
                    width='24'
                    height='24'
                    fill='black'
                  >
                    <path d='M3.9985 2C3.44749 2 3 2.44405 3 2.9918V21.0082C3 21.5447 3.44476 22 3.9934 22H20.0066C20.5551 22 21 21.5489 21 20.9925L20.9997 7L16 2H3.9985ZM10.5 7.5H12.5C12.5 9.98994 14.6436 12.6604 17.3162 13.5513L16.8586 15.49C13.7234 15.0421 10.4821 16.3804 7.5547 18.3321L6.3753 16.7191C7.46149 15.8502 8.50293 14.3757 9.27499 12.6534C10.0443 10.9373 10.5 9.07749 10.5 7.5ZM11.1 13.4716C11.3673 12.8752 11.6043 12.2563 11.8037 11.6285C12.2754 12.3531 12.8553 13.0182 13.5102 13.5953C12.5284 13.7711 11.5666 14.0596 10.6353 14.4276C10.8 14.1143 10.9551 13.7948 11.1 13.4716Z' />
                  </svg>

                  <span>MORE SEWING INFO (PDF)</span>
                </a>
              )}
            </Card>

            {/* Cards */}
            <div className='flex flex-col sm:flex-row justify-between gap-4 w-full'>
              {/* Card 1 */}
              <Card
                isFooterBlurred
                className='flex flex-col items-center justify-center p-4 hover:bg-black/5 transition-all  rounded-2xl flex-1 gap-2'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#50a54a'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-badge-check-icon lucide-badge-check'
                >
                  <path d='M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z' />
                  <path d='m9 12 2 2 4-4' />
                </svg>
                <p className='font-bold text-xs text-center'>
                  Commercial
                  <br />
                  License
                </p>
              </Card>

              {/* Card 2 */}
              <Card
                isFooterBlurred
                className='flex flex-col items-center justify-center p-4 hover:bg-black/5 transition-all  rounded-2xl flex-1 gap-2'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#8d928b'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-headset-icon lucide-headset'
                >
                  <path d='M3 11h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Zm0 0a9 9 0 1 1 18 0m0 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z' />
                  <path d='M21 16v2a4 4 0 0 1-4 4h-5' />
                </svg>
                <p className='font-bold text-xs text-center'>
                  Premium
                  <br />
                  Support
                </p>
              </Card>

              {/* Card 3 */}
              <Card
                isFooterBlurred
                className='flex flex-col items-center justify-center p-4 hover:bg-black/5 transition-all  rounded-2xl flex-1 gap-2'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='#aebcd0'
                  strokeWidth='3'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  className='lucide lucide-spool-icon lucide-spool'
                >
                  <path d='M17 13.44 4.442 17.082A2 2 0 0 0 4.982 21H19a2 2 0 0 0 .558-3.921l-1.115-.32A2 2 0 0 1 17 14.837V7.66' />
                  <path d='m7 10.56 12.558-3.642A2 2 0 0 0 19.018 3H5a2 2 0 0 0-.558 3.921l1.115.32A2 2 0 0 1 7 9.163v7.178' />
                </svg>
                <p className='font-bold text-xs text-center'>
                  Easy To
                  <br />
                  Use
                </p>
              </Card>
            </div>
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
              <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <h2 className='text-black font-bold text-3xl mb-6 capitalize'>
                  About {singleProductData?.name}
                </h2>
              </div>

              <div
                dangerouslySetInnerHTML={{ __html: rawMarkup }}
                className=' max-w-none break-words whitespace-pre-wrap text-2xl'
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
                      key={index}
                      href={`/search?searchQuery=${item.split(' ').join('+')}`}
                      prefetch={false}
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
        {imageLoaded && (
          <Suspense fallback={<LoadingSpinner />}>
            <ClientOnlyRecommendations
              allProductData={allProductData}
              popularProducts={popularProducts}
            />
          </Suspense>
        )}
      </div>

      {/* Future Section */}
      {/* <SubscribeSearchSection /> */}
    </main>
  );
};
