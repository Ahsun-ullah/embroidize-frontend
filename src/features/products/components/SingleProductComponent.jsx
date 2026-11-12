'use client';

import LoadingSpinner from '@/components/Common/LoadingSpinner';
import {
  capitalize,
  preserveParagraphLineBreaks,
} from '@/utils/functions/page';
import { marked } from 'marked';
import { Suspense, useMemo, useState } from 'react';
import { BreadCrumb } from './BreadCrumb';
import ProductDownloadCard from './ProductDownloadCard';
import ClientOnlyRecommendations from './ProductMostPopularAndRelaventDesign';
import ProductSpecs from './ProductSpecs';
import ReviewSection from './ReviewSection/ReviewSection';
import { SingleProductImageCard } from './SingleProductImageCard';

const CARD = 'rounded-3xl border border-gray-100 bg-white shadow-sm';

export const SingleProductComponent = ({
  singleProductData,
  allProductData,
  plans = [],
  totalDesigns = null,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);

  const formattedMarkup = useMemo(
    () =>
      preserveParagraphLineBreaks(marked(singleProductData?.description || '')),
    [singleProductData?.description],
  );
  const isPremium = singleProductData?.isFree !== true;

  return (
    <main className='container mx-auto px-4 pb-12'>
      {/* Breadcrumb */}
      <div className='mb-6 font-normal text-xs'>
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
              label: '',
              href: '#',
            },
          ]}
        />
      </div>

      {/* Two columns on desktop. On mobile the column wrappers dissolve
          (display: contents) and `order-*` puts the blocks in buying order:
          media → buy box → formats → sizes → about → related → reviews. */}
      <div className='flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] lg:items-start lg:gap-6'>
        {/* ── Left column ── */}
        <div className='contents lg:flex lg:flex-col lg:gap-6'>
          <div className='order-1 lg:order-none'>
            <SingleProductImageCard
              data={singleProductData}
              isPremium={isPremium}
              onImageLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* About */}
          <section className={`order-6 lg:order-none ${CARD} p-5 sm:p-6`}>
            <h2 className='mb-4 text-xl font-bold capitalize text-[#1a1f4e] sm:text-2xl'>
              About {singleProductData?.name}
            </h2>

            <div className='relative'>
              <div
                dangerouslySetInnerHTML={{ __html: formattedMarkup }}
                className='custom-blog-content break-words text-black leading-relaxed overflow-hidden transition-all duration-500'
                itemProp='articleBody'
                style={{ maxHeight: descExpanded ? '2000px' : '30rem' }}
              />

              {/* Fade gradient when collapsed */}
              {!descExpanded && (
                <div className='absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none' />
              )}
            </div>

            <button
              onClick={() => setDescExpanded((v) => !v)}
              className='mt-3 flex w-full items-center justify-center gap-1.5 border-t border-gray-100 pt-3 text-sm font-semibold text-[#1a1f4e] transition hover:text-black'
            >
              {descExpanded ? 'Show less' : 'Show more'}
              <svg
                width={16}
                height={16}
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth={2.5}
                aria-hidden
              >
                <path d={descExpanded ? 'm18 15-6-6-6 6' : 'm6 9 6 6 6-6'} />
              </svg>
            </button>
          </section>

          {/* Reviews */}
          <div
            id='review-section'
            className={`order-8 scroll-mt-24 lg:order-none ${CARD} p-5 sm:p-6`}
          >
            <ReviewSection
              productId={singleProductData?._id}
              initialAvgRating={singleProductData?.averageRating ?? 0}
              initialReviewCount={singleProductData?.reviewCount ?? 0}
            />
          </div>
        </div>

        {/* ── Right column ── */}
        <div className='contents lg:flex lg:flex-col lg:gap-5'>
          <div className='order-3 lg:order-none'>
            <ProductDownloadCard
              data={singleProductData}
              plans={plans}
              totalDesigns={totalDesigns}
            />
          </div>

          <ProductSpecs
            description={singleProductData?.description}
            availableFileTypes={singleProductData?.available_file_types}
            formatsClassName={`order-4 lg:order-none ${CARD}`}
            sizesClassName={`order-5 lg:order-none ${CARD}`}
          />

          {/* Relevant designs wait for the hero image so they never compete
              with it for bandwidth (LCP). */}
          <div className='order-7 lg:order-none'>
            {imageLoaded && (
              <Suspense fallback={<LoadingSpinner />}>
                <ClientOnlyRecommendations
                  allProductData={allProductData}
                  singleProductData={singleProductData}
                />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
