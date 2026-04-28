'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { blurDataURL } from '@/utils/blur';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import AdminChoiceStar from './AdminChoiceStar';
import FavoriteButton from './FavoriteButton';
import SkuFlag from './SkuFlag';

function DownloadIcon(props) {
  return (
    <svg
      viewBox='0 0 24 24'
      width='16'
      height='16'
      aria-hidden='true'
      {...props}
    >
      <path d='M12 3v10.17l3.59-3.58L17 11l-5 5-5-5 1.41-1.41L11 13.17V3h1zM5 19h14v2H5z'></path>
    </svg>
  );
}

// pass `index` from parent map so the first visible image becomes the LCP image
const ProductCard = React.memo(function ProductCard({ item, index = 0 }) {
  if (!item?._id || !item?.name) return null;

  const imageUrl =
    item?.image?.url ||
    'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/image-not-found.png';
  const productLink = `/product/${item.slug}`;
  const productName = item.name;
  const categoryName = item?.category?.name
    ? item?.category?.name
    : item?.sub_category?.name || '';
  const isFree = Number(item?.price) === 0;
  const priceLabel = isFree
    ? 'Free'
    : `$${Number(item?.price || 0).toFixed(2)}`;
  const downloadCount = Number(item?.downloadCount || 0);

  const isLCP = index === 0;

  const blur = item?.image?.blurDataURL || blurDataURL(600, 400);

  const categorySlug = (categoryName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const categoryLink = `/category/${encodeURIComponent(categorySlug)}`;

  const { data: userInfoData } = useUserInfoQuery();

  return (
    <div className='relative'>
      {item?.sku_code && userInfoData?.role === 'admin' && (
        <SkuFlag sku={item.sku_code} />
      )}

      {item?.isAdminChoice && userInfoData?.role === 'admin' && (
        <div className='absolute top-3 left-3 z-20'>
          <AdminChoiceStar status={item.isAdminChoice} />
        </div>
      )}

      <div className='relative'>
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
              sizes='(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw'
              className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
              priority={isLCP}
              fetchPriority={isLCP ? 'high' : 'auto'}
              placeholder='blur'
              blurDataURL={blur}
            />
          </div>
        </Link>
        <div className='absolute top-2 right-2 z-20'>
          <FavoriteButton productId={item._id} />
        </div>
      </div>
      <div className='flex flex-col p-4 '>
        <div className='flex items-center justify-between gap-2'>
          <Link
            href={productLink}
            className='text-xs sm:text-xs md:text-sm font-medium capitalize truncate'
            title={productName}
          >
            {productName}
          </Link>
          <span
            className={` flex items-center gap-1 ${
              isFree ? ' text-base font-medium' : 'text-black font-medium'
            }`}
          >
            {priceLabel}
          </span>
        </div>

        <div className='flex items-center justify-between gap-4'>
          <Link
            href={categoryLink}
            className='text-black text-xs sm:text-xs md:text-sm font-medium capitalize  truncate'
            title={categoryName}
          >
            {categoryName.replace(/embroidery designs/gi, '').trim()}
          </Link>
          <span className='font-medium flex items-center gap-1'>
            <DownloadIcon />
            {new Intl.NumberFormat('en-US', {
              notation: 'compact',
              maximumFractionDigits: 1,
            }).format(downloadCount)}
          </span>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
