'use client';

import ProductCard from '@/components/Common/ProductCard';

export default function ClientOnlyRecommendations({
  allProductData,
  popularProducts,
}) {
  return (
    <div className='w-full lg:w-1/2'>
      {/* Relevant Designs */}
      <div className='mb-10'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-black text-lg font-bold'>Relevant Designs</h2>
          <a href='/products' className='text-sm text-black underline'>
            See All Designs
          </a>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {allProductData?.slice(0, 6).map((item, index) => (
            <ProductCard item={item} key={`relevant-${index}`} />
          ))}
        </div>
      </div>

      {/* Most Popular Designs */}
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-black text-lg font-bold'>Most Popular Designs</h2>
          <a
            href='/products?filter=popular'
            className='text-sm text-black underline'
          >
            All Popular Designs
          </a>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          {popularProducts?.slice(0, 4).map((item, index) => (
            <ProductCard item={item} key={`popular-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
