'use client';
import { Input } from '@heroui/react';
import { SearchIcon } from '../icons';

export default function SearchBox() {
  return (
    <div className='flex justify-center w-[180px] sm:w-[460px] md:w-[500px] lg:w-[600px] xl:w-[650px] px-2 '>
      <div className='relative w-full'>
        <Input
          type='search'
          placeholder='Search...'
          aria-label='Search'
          className='text-sm text-black px-2 border-1 border-black rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent  bg-transparent'
        />
        <button
          type='submit'
          className='absolute right-1.5 top-1/2 -translate-y-1/2 bg-black hover:bg-blue-500 rounded-full p-2 flex items-center justify-center'
        >
          <SearchIcon className='text-white h-4 w-4' />
        </button>
      </div>
    </div>
  );
}
