'use client';

import { blurDataURL } from '@/utils/blur';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const BundleCard = React.memo(function BundleCard({ item, index = 0 }) {
  if (!item?._id || !item?.name) return null;

  const imageUrl =
    item?.image?.url ||
    'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/image-not-found.png';
  const productLink = `/bundles/${item.slug}`;
  const productName = item.name;
  const isLCP = index === 0;
  const blur = item?.image?.blurDataURL || blurDataURL(600, 400);

  return (
    <div className='bg-white rounded-3xl border overflow-hidden relative'>
      <Link
        href={productLink}
        className='block group'
        aria-label={`View details for ${productName}`}
      >
        <div className='relative w-full aspect-[3/2]'>
          <Image
            src={imageUrl}
            alt={productName}
            fill
            quality={78}
            sizes='(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw'
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            priority={isLCP}
            fetchPriority={isLCP ? 'high' : 'auto'}
            placeholder='blur'
            blurDataURL={blur}
          />
        </div>

        <div className='flex flex-col p-4 gap-y-2'>
          <p
            className='text-sm sm:text-base md:text-lg font-semibold capitalize truncate'
            title={productName}
          >
            {productName}
          </p>

          {item?.products?.length != null && (
            <p className='text-gray-500 font-bold text-base'>
              {item?.products?.length} Design
              {item?.products?.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
});

export default BundleCard;
