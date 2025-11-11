import { blurDataURL } from '@/utils/blur';
import Image from 'next/image';
import Link from 'next/link';

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
export default function ProductCard({ item, index = 0 }) {
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

  const isLCP = index === 0; // only the very first card in the grid

  const blur = item?.image?.blurDataURL || blurDataURL(600, 400);

  const categorySlug = (categoryName || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const categoryLink = `/category/${encodeURIComponent(categorySlug)}`;

  return (
    <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
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
            // Keep bytes down + let the browser choose smaller sources
            quality={78}
            sizes='(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw'
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            // LCP boost for the first card only
            priority={isLCP}
            fetchPriority={isLCP ? 'high' : 'auto'}
            placeholder='blur'
            blurDataURL={blur}
          />
        </div>

        <div className='flex flex-col p-4 gap-y-2'>
          <div className='flex items-center justify-between gap-4'>
            <p
              className='text-sm sm:text-base md:text-lg font-semibold capitalize truncate'
              title={productName}
            >
              {productName}
            </p>
            <span
              className={`text-sm sm:text-base md:text-lg px-2 rounded-md shadow- ${isFree ? ' font-extrabold uppercase' : 'text-black font-semibold'}`}
            >
              {priceLabel}
            </span>
          </div>

          <div className='flex items-center justify-between gap-4 text-xs sm:text-sm md:text-base'>
            <Link
              href={categoryLink}
              className='text-black capitalize font-semibold truncate'
              title={categoryName}
              aria-label={`View category ${categoryName}`}
            >
              {categoryName.replace(/embroidery designs/gi, '').trim()}
            </Link>
            <span className='font-semibold flex items-center gap-1'>
              <DownloadIcon />
              {new Intl.NumberFormat('en-US', {
                notation: 'compact',
                maximumFractionDigits: 1,
              }).format(downloadCount)}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
