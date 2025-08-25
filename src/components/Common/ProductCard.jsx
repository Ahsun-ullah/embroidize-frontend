'use client';

import { formatNumber } from '@/utils/functions/page';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

export default function ProductCard({ item }) {
  const [isLoading, setIsLoading] = useState(true);
  if (!item || !item._id || !item.name) return null;

  const imageUrl = item?.image?.url || '/category.jpg';
  const productLink = `${process.env.NEXT_PUBLIC_BASE_URL_CLIENT}/product/${item.slug}`;
  const productName = item.name;
  const categoryName = item?.category?.name;
  const isFree = item?.price === 0;
  const priceLabel = isFree ? 'Free' : `$${item.price?.toFixed(2)}`;
  const downloadCount = item?.downloadCount || 0;

  return (
    <div className='bg-white  rounded-2xl shadow-xl overflow-hidden'>
      <Link
        href={productLink}
        prefetch={false}
        className='block group'
        aria-label={`View details for ${productName}`}
      >
        {/* Responsive Image */}
        <div className='relative w-full aspect-[3/2]'>
          {isLoading && (
            <div className='absolute inset-0 z-10 flex items-center justify-center '>
              <LoadingSpinner />
            </div>
          )}

          <Image
            src={imageUrl}
            alt={productName}
            fill
            quality={100}
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            onLoad={() => setIsLoading(false)}
            priority={false}
          />
        </div>

        {/* <Divider /> */}

        {/* Info Section */}
        <div className='flex flex-col p-4 gap-y-2'>
          <div className='flex items-center justify-between gap-4'>
            <p
              className='text-sm sm:text-base md:text-lg font-semibold capitalize truncate'
              title={productName}
            >
              {productName}
            </p>
            <span
              className={`text-sm sm:text-base md:text-lg font-semibold rounded-xl px-2 shadow ${isFree ? 'text-green-900 font-extrabold' : 'text-black'}`}
            >
              {priceLabel}
            </span>
          </div>

          <div className='flex items-center justify-between gap-4 text-xs sm:text-sm md:text-base'>
            <span
              className='text-black capitalize font-medium truncate'
              title={categoryName}
            >
              {categoryName.replace(/embroidery designs/gi, '').trim()}
            </span>
            <span className='font-semibold flex items-center gap-1'>
              <i className='ri-download-2-line' aria-hidden='true'></i>
              {formatNumber(downloadCount)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
