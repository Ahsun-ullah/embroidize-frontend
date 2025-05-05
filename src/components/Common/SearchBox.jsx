'use client';
import { useState } from 'react';

import { Input } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { SearchIcon } from '../icons';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?searchQuery=${searchQuery.split(' ').join('+')}`);
    }
  };

  return (
    <div className='flex justify-center w-[200px] sm:w-[370px] md:w-[380px] lg:w-[600px] xl:w-[650px] '>
      <form onSubmit={handleSubmit} className='relative w-full '>
        <Input
          style={{
            paddingInlineEnd: '4rem',
          }}
          type='search'
          placeholder='Search...'
          aria-label='Search'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant='bordered'
          className=''
          radius='full'
          isClearable={true}
          onClear={() => setSearchQuery('')}
        />
        <button
          type='submit'
          className='absolute right-[0.258rem] top-1/2 -translate-y-1/2 bg-black hover:bg-blue-500 rounded-full p-2 flex items-center justify-center'
        >
          <SearchIcon className='text-white h-4 w-4' />
        </button>
      </form>
    </div>
  );
}
