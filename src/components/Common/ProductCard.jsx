import { Divider } from '@heroui/react';
import Link from 'next/link';

export default function ProductCard({ item, index }) {
  return (
    <div className='bg-white border rounded-2xl shadow-xl'>
      <div
        style={{
          backgroundImage: `url('/category.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '200px',
          width: '100%',
        }}
        className='p-6 flex items-center justify-center rounded-t-2xl'
      />
      <Divider />
      <div className='flex flex-col border-default-600 dark:border-default-100 p-4'>
        <div className='flex items-center justify-between gap-4'>
          <p className='text-sm font-medium'>{`Your checklist for better sleep ${parseInt(
            index + 1,
          )}`}</p>
          <Link
            href='#'
            className='bg-black text-white px-3 py-1 rounded-full text-sm text-nowrap'
            style={{
              transition: 'background-color 0.3s ease',
            }}
            passHref
          >
            Get App
          </Link>
        </div>
        <div className='flex items-center justify-between mt-2'>
          <p className='text-xs text-black'>Get a good night sleep</p>
          <i className='ri-heart-fill text-red-500'></i>
        </div>
      </div>
    </div>
  );
}
