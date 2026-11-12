'use client';

import ProductCard from '@/components/Common/ProductCard';
import Link from 'next/link';

export default function ClientOnlyRecommendations({
  allProductData,
  singleProductData,
}) {
  if (!allProductData?.length) return null;

  const seeAllHref = singleProductData?.sub_category?.slug
    ? `/${singleProductData?.category?.slug}/${singleProductData.sub_category.slug}`
    : `/category/${singleProductData?.category?.slug}`;

  return (
    <section className='rounded-3xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-bold text-[#1a1f4e]'>Relevant Designs</h2>
        <Link
          href={seeAllHref}
          prefetch={false}
          className='inline-flex items-center gap-1 text-sm font-semibold text-neutral-900 hover:underline'
        >
          See All Designs
          <span aria-hidden>→</span>
        </Link>
      </div>
      <div className='grid grid-cols-2 gap-3'>
        {allProductData
          .filter((item) => item?._id !== singleProductData?._id)
          .slice(0, 6)
          .map((item, index) => (
            <ProductCard
              key={`relevant-${item._id}`}
              item={item}
              index={index + 1}
            />
          ))}
      </div>
    </section>
  );
}
