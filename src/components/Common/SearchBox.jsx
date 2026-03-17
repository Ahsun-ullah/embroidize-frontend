'use client';

import { Input } from '@heroui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { SearchIcon } from '../icons';

export default function SearchBox({ onFocusChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSearchQuery = useMemo(
    () => searchParams.get('searchQuery') || '',
    [searchParams],
  );

  useEffect(() => {
    setSearchQuery(currentSearchQuery);
  }, [currentSearchQuery]);

  // Stop loading only after route/search params actually update
  useEffect(() => {
    setLoading(false);
  }, [pathname, currentSearchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // If same query already on page, do nothing and don't show spinner
    if (
      pathname === '/search' &&
      trimmedQuery === currentSearchQuery
    ) {
      onFocusChange?.(false);
      return;
    }

    setLoading(true);
    onFocusChange?.(false);

    router.push(`/search?searchQuery=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <div className='w-full min-w-0'>
      <form
        onSubmit={handleSubmit}
        className='relative w-full'
        role='search'
        aria-label='Site Search'
      >
        <Input
          type='search'
          name='search'
          placeholder='Search designs...'
          aria-label='Search'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => {
            setTimeout(() => onFocusChange?.(false), 150);
          }}
          variant='bordered'
          radius='full'
          isClearable
          onClear={() => setSearchQuery('')}
          disabled={loading}
          className='w-full'
          classNames={{
            inputWrapper:
              'h-10 sm:h-11 md:h-12 pe-14 sm:pe-16 border-gray-300 transition-all duration-300',
            input: 'text-sm sm:text-base',
          }}
        />

        <button
          type='submit'
          className='absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black text-white transition-all duration-200 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-90 sm:h-9 sm:w-9'
          aria-label='Submit search'
          disabled={loading}
        >
          {loading ? (
            <span
              className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white'
              aria-hidden='true'
            />
          ) : (
            <SearchIcon className='h-4 w-4 text-white' />
          )}
        </button>
      </form>
    </div>
  );
}