'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { blurDataURL } from '@/utils/blur';
import { Crown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import AdminChoiceToggle from './AdminChoiceToggle';
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

function StarIcon(props) {
  return (
    <svg
      viewBox='0 0 24 24'
      width='15'
      height='15'
      aria-hidden='true'
      {...props}
    >
      <path d='M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' />
    </svg>
  );
}

// pass `index` from parent map so the first visible image becomes the LCP image
const ProductCard = React.memo(function ProductCard({ item, index = 0 }) {
  const { data: userInfoData } = useUserInfoQuery();

  if (!item?._id || !item?.name) return null;

  const imageUrl =
    item?.image?.url ||
    'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/image-not-found.png';
  const productLink = `/product/${item.slug}`;
  const productName = item.name;
  const categoryName = item?.category?.name
    ? item?.category?.name
    : item?.sub_category?.name || '';
  const downloadCount = Number(item?.downloadCount || 0);
  const averageRating = Number(item?.averageRating || 0);
  const reviewCount = Number(item?.reviewCount || 0);
  // Pricing tier flag. Missing field counts as premium, matching the backend's
  // isFree!==true gating.
  const isFreeTier = item?.isFree === true;

  const isLCP = index === 0;
  const isAdmin = userInfoData?.role === 'admin';

  const blur = item?.image?.blurDataURL || blurDataURL(600, 400);

  const categorySlug = (categoryName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const categoryLink = `/category/${encodeURIComponent(categorySlug)}`;

  return (
    <div className='group relative flex flex-col overflow-hidden rounded-3xl'>
      <div className='relative flex flex-col overflow-hidden rounded-3xl border border-gray-100  shadow-sm'>
        {/* ── Image + overlays ── */}
        <div className='relative w-full aspect-[3/2] overflow-hidden bg-gray-200'>
          <Link
            href={productLink}
            className='block group h-full w-full'
            aria-label={`View details for ${productName}`}
          >
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
          </Link>

          {/* Admin-only Embroidize Choice toggle — top-left */}
          {isAdmin && (
            <div className='absolute top-3 left-3 z-20'>
              <AdminChoiceToggle
                productId={item._id}
                initialStatus={!!item?.isAdminChoice}
              />
            </div>
          )}

          {/* Favourite heart — top-right */}
          <div className='absolute top-2 right-2 z-20'>
            <FavoriteButton
              productId={item._id}
              initialCount={item?.favoriteCount || 0}
              variant='card'
            />
          </div>

          {/* SKU flag — just below the heart (admin only) */}
          {isAdmin && item?.sku_code && (
            <div className='absolute top-12 right-0 z-20'>
              <div className='relative'>
                <SkuFlag sku={item.sku_code} />
              </div>
            </div>
          )}
        </div>

        {/* ── Downloads (left) + reviews (right) ── */}
        {/* <div className='flex items-center justify-between px-4 pb-4 pt-2'>
        <span className='flex items-center gap-1 text-xs font-medium text-gray-700'>
          <DownloadIcon />
          {new Intl.NumberFormat('en-US', {
            notation: 'compact',
            maximumFractionDigits: 1,
          }).format(downloadCount)}
        </span>
        <span className='flex items-center gap-1 text-xs font-medium text-gray-700'>
          <StarIcon fill='#F59E0B' />
          {averageRating.toFixed(1)}
          <span className='text-gray-400'>({reviewCount})</span>
        </span>
      </div> */}
      </div>
      {/* ── Title + category (left) with tier badge (right) ── */}
      <div className='flex items-center justify-between gap-4 p-4'>
        {/* Left */}
        <div className='min-w-0 flex-1 gap-0.5 flex flex-col'>
          <Link
            href={productLink}
            className='block truncate text-sm font-semibold text-neutral-900 hover:text-black'
            title={productName}
          >
            {productName
              .replace(/Embroidery Design, |Machine Embroidery Design/gi, '')
              .trim()}
          </Link>

          <Link
            href={categoryLink}
            className='mt-1 block truncate text-xs text-neutral-500 hover:text-neutral-700 capitalize hover:underline'
            title={categoryName}
          >
            {categoryName.replace(/embroidery designs/gi, '').trim()}
          </Link>
        </div>

        {/* Right */}
        <div className='flex flex-col items-center gap-0.5 shrink-0'>
          {isFreeTier ? (
            <span className='inline-flex items-center rounded-md border border-green-500 px-2.5 py-0.5 text-xs font-semibold text-green-600'>
              Free
            </span>
          ) : (
            <span className='inline-flex items-center gap-1 rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-white'>
              <Crown size={11} className='fill-amber-400 text-amber-400' />
              Pro
            </span>
          )}

          <span className='inline-flex items-center justify-center gap-1 text-md font-medium text-neutral-700'>
            <DownloadIcon className='h-4 w-4' />
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
