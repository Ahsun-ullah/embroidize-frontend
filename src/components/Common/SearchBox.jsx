'use client';

import { Input, Spinner } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchIcon } from '../icons';

export default function SearchBox() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('searchQuery');
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      setLoading(true);

      setTimeout(() => {
        router.push(`/search?searchQuery=${trimmedQuery.split(' ').join('+')}`);
        setLoading(false);
      }, 500);
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
          disabled={loading}
        />
        <button
          type='submit'
          className='absolute right-[0.258rem] top-1/2 -translate-y-1/2 bg-black hover:bg-blue-500 rounded-full p-2 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500'
          aria-label='Submit search'
          disabled={loading}
        >
          {loading ? (
            <Spinner className='text-white h-4 w-4' />
          ) : (
            <SearchIcon className='text-white h-4 w-4' />
          )}
        </button>
      </form>
    </div>
  );
}
