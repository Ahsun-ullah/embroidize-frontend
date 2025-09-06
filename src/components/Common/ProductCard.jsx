// 'use client';

// import { formatNumber } from '@/utils/functions/page';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useState } from 'react';
// import LoadingSpinner from './LoadingSpinner';

// export default function ProductCard({ item }) {
//   const [isLoading, setIsLoading] = useState(true);
//   if (!item || !item._id || !item.name) return null;

//   const imageUrl = item?.image?.url || '/category.jpg';
//   const productLink = `${process.env.NEXT_PUBLIC_BASE_URL_CLIENT}/product/${item.slug}`;
//   const productName = item.name;
//   const categoryName = item?.category?.name;
//   const isFree = item?.price === 0;
//   const priceLabel = isFree ? 'Free' : `$${item.price?.toFixed(2)}`;
//   const downloadCount = item?.downloadCount || 0;

//   return (
//     <div className='bg-white  rounded-2xl shadow-xl overflow-hidden'>
//       <Link
//         href={productLink}
//         prefetch={false}
//         className='block group'
//         aria-label={`View details for ${productName}`}
//       >
//         {/* Responsive Image */}
//         <div className='relative w-full aspect-[3/2]'>
//           {isLoading && (
//             <div className='absolute inset-0 z-10 flex items-center justify-center '>
//               <LoadingSpinner />
//             </div>
//           )}

//           <Image
//             src={imageUrl}
//             alt={productName}
//             fill
//             quality={100}
//             sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
//             className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
//             onLoad={() => setIsLoading(false)}
//             priority={false}
//           />
//         </div>

//         {/* <Divider /> */}

//         {/* Info Section */}
//         <div className='flex flex-col p-4 gap-y-2'>
//           <div className='flex items-center justify-between gap-4'>
//             <p
//               className='text-sm sm:text-base md:text-lg font-semibold capitalize truncate'
//               title={productName}
//             >
//               {productName}
//             </p>
//             <span
//               className={`text-sm sm:text-base md:text-lg font-semibold rounded-xl px-2 shadow ${isFree ? 'text-green-900 font-extrabold' : 'text-black'}`}
//             >
//               {priceLabel}
//             </span>
//           </div>

//           <div className='flex items-center justify-between gap-4 text-xs sm:text-sm md:text-base'>
//             <span
//               className='text-black capitalize font-medium truncate'
//               title={categoryName}
//             >
//               {categoryName.replace(/embroidery designs/gi, '').trim()}
//             </span>
//             <span className='font-semibold flex items-center gap-1'>
//               <i className='ri-download-2-line' aria-hidden='true'></i>
//               {formatNumber(downloadCount)}
//             </span>
//           </div>
//         </div>
//       </Link>
//     </div>
//   );
// }

// src/components/Common/ProductCard.jsx  (SERVER COMPONENT — no "use client")
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
  const categoryName = item?.category?.name || '';
  const isFree = Number(item?.price) === 0;
  const priceLabel = isFree
    ? 'Free'
    : `$${Number(item?.price || 0).toFixed(2)}`;
  const downloadCount = Number(item?.downloadCount || 0);

  const isLCP = index === 0; // only the very first card in the grid

  const blur = item?.image?.blurDataURL || blurDataURL(600, 400);

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
