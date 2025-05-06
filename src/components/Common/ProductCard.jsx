import { slugify } from '@/utils/functions/page';
import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ item, index }) {
  const imageUrl = item?.image?.url || '/category.jpg';

  return (
    <div className='bg-white border rounded-2xl shadow-xl overflow-hidden'>
      <Link
        href={`/product/${slugify(item?.name)}?id=${item?._id}`}
        className='block group'
      >
        {/* Image container */}
        <div className='relative w-full aspect-[3/2]'>
          <Image
            src={imageUrl}
            alt={item?.name ?? 'Machine Embroidery Design'}
            fill
            sizes='(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw'
            className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
            placeholder='blur'
            blurDataURL='https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/placeholder.jpg'
          />
        </div>

        {/* Divider */}
        <Divider />

        {/* Info Section */}
        <div className='flex flex-col p-4 gap-y-2'>
          <div className='flex items-center justify-between gap-4'>
            <p className='text-md font-semibold capitalize truncate'>
              {item?.name ?? ''}
            </p>
            <p
              className={`text-md font-semibold border-1 rounded-xl px-2 shadow-md ${item.price === 0 ? 'text-green-900 font-extrabold' : 'text-black'}`}
            >
              {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
            </p>
          </div>
          <div className='flex items-center justify-between gap-4'>
          <p className='text-sm text-black capitalize font-medium truncate'>
            {item?.category?.name ?? ''}
          </p>
            <p
              className={`text-md font-semibold px-2`}
            >
              <i className="ri-download-2-line me-1"></i>
              {item.downloadCount}
            </p>
          </div>


        </div>
      </Link>
    </div>
  );
}
