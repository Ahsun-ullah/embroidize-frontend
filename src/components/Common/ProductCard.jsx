import { Divider } from '@heroui/react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductCard({ item, index }) {
  const imageUrl = item?.image?.url || '/category.jpg';

  return (
    <div className='bg-white border rounded-2xl shadow-xl overflow-hidden'>
      <Link
        href={`/product/${item?.name?.split(' ').join('-')}?id=${item?._id}`}
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
              className={`text-md font-semibold ${item.price === 0 ? 'text-green-900' : 'text-black'}`}
            >
              {item.price === 0 ? 'Free' : `$${item.price.toFixed(2)}`}
            </p>
          </div>

          <p className='text-sm text-black capitalize font-medium truncate'>
            {item?.category?.name ?? ''}
          </p>
        </div>
      </Link>
    </div>
  );
}
