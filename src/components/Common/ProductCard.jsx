import { Divider } from '@heroui/react';
import Link from 'next/link';

export default function ProductCard({ item, index }) {
  return (
    <div className='bg-white border rounded-2xl shadow-xl'>
      <Link href={`/product/${item?._id}`}>
        <div
          className='aspect-[3/2] w-full bg-cover bg-center bg-no-repeat p-6 flex items-center justify-center rounded-t-2xl'
          style={{
            backgroundImage: `url(${item?.image?.url || '/category.jpg'})`,
          }}
        ></div>

        <Divider />
        <div className='flex flex-col border-default-600 dark:border-default-100 p-4 gap-y-2'>
          <div className='flex items-center justify-between gap-4'>
            {/* Title / Name */}
            <p className='text-md font-semibold capitalize'>
              {item?.meta_title ?? ''}
            </p>
            {/* price / Free */}
            <p className='text-md text-black font-semibold '>
              {item?.price === 0 ? 'Free' : (item?.price ?? '')}
            </p>
          </div>

          {/* catrgory name  */}
          <p className='text-sm text-black capitalize font-medium'>
            {item?.category?.name ?? ''}
          </p>
          {/* description */}
          {/* <div className='flex items-center justify-between'>
            <p className='text-xs text-black'>
              {item?.meta_description && item?.meta_description.slice(0, 100)}
            </p>
            <i className='ri-heart-fill text-red-500'></i>
          </div> */}
        </div>
      </Link>
    </div>
  );
}
