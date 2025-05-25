'use client';

import { Input } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { SearchIcon } from '../icons';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      // Use encodeURIComponent to encode the query string safely
      router.push(`/search?searchQuery=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <div className='flex justify-center w-[200px] sm:w-[370px] md:w-[380px] lg:w-[600px] xl:w-[650px]'>
      <form
        onSubmit={handleSubmit}
        className='relative w-full'
        role='search'
        aria-label='Site Search'
      >
        <Input
          style={{ paddingInlineEnd: '4rem' }}
          type='search'
          name='search'
          placeholder='Search...'
          aria-label='Search'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant='bordered'
          radius='full'
          isClearable={true}
          onClear={() => setSearchQuery('')}
        />
        <button
          type='submit'
          className='absolute right-[0.258rem] top-1/2 -translate-y-1/2 bg-black hover:bg-blue-500 rounded-full p-2 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
          aria-label='Submit search'
        >
          <SearchIcon className='text-white h-4 w-4' />
        </button>
      </form>
    </div>
  );
}
