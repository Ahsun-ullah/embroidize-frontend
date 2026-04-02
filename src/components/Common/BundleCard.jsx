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
    <div>
      <Link
        href={productLink}
        className='block group'
        aria-label={`View details for ${productName}`}
      >
        <div className='relative w-full aspect-[3/2] overflow-hidden rounded-3xl bg-gray-200'>
          <Image
            src={imageUrl}
            alt={productName}
            fill
            quality={78}
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw'
            priority={isLCP}
            fetchPriority={isLCP ? 'high' : 'auto'}
            placeholder='blur'
            blurDataURL={blur}
          />
        </div>

        <div className='flex flex-col p-4'>
          <p
            className='text-xs sm:text-xs md:text-sm font-medium capitalize truncate'
            title={productName}
          >
            {productName}
          </p>

          {item?.products?.length != null && (
            <p className='text-gray-500 font-medium text-base'>
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
