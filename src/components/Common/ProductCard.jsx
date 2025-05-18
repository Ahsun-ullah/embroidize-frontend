'use client';

import { slugify } from '@/utils/functions/page';
import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ item }) {
  if (!item || !item._id || !item.name) return null;

  const imageUrl = item?.image?.url || '/category.jpg';
  const productSlug = slugify(item.name);
  const productLink = `/product/${productSlug}?id=${item._id}`;
  const productName = item.name;
  const categoryName = item?.category?.name || 'Uncategorized';
  const isFree = item?.price === 0;
  const priceLabel = isFree ? 'Free' : `$${item.price?.toFixed(2)}`;
  const downloadCount = item?.downloadCount || 0;

  return (
    <div className='bg-white border rounded-2xl shadow-xl overflow-hidden'>
      <Link
        href={productLink}
        className='block group'
        aria-label={`View details for ${productName}`}
      >
        {/* Responsive Image */}
        <div className='relative w-full aspect-[3/2]'>
          <Image
            src={imageUrl}
            alt={productName}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            placeholder='blur'
            blurDataURL='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/placeholder.jpg'
            priority={false}
          />
        </div>

        <Divider />

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
              {categoryName}
            </span>
            <span className='font-semibold flex items-center gap-1'>
              <i className='ri-download-2-line' aria-hidden='true'></i>
              {downloadCount}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
