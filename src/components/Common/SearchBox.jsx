'use client';

import { Input } from '@heroui/react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { SearchIcon } from '../icons';

const API = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
const SUGGEST_DEBOUNCE_MS = 300;
const MIN_SUGGEST_CHARS = 2;

export default function SearchBox({ onFocusChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null); // { products, categories }
  const [showSuggestions, setShowSuggestions] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

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
    setShowSuggestions(false);
  }, [pathname, currentSearchQuery]);

  // Debounced autocomplete: top products + categories as you type.
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const q = searchQuery.trim();
    if (q.length < MIN_SUGGEST_CHARS) {
      setSuggestions(null);
      return undefined;
    }
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch(
          `${API}/public/search/suggest?q=${encodeURIComponent(q)}`,
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const body = await res.json();
        const data = body?.data || {};
        setSuggestions({
          products: data.products || [],
          categories: data.categories || [],
        });
      } catch {
        // Aborted or network hiccup — suggestions are best-effort.
      }
    }, SUGGEST_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const closeSuggestions = () => setShowSuggestions(false);

  const goTo = (href) => {
    closeSuggestions();
    onFocusChange?.(false);
    setLoading(true);
    router.push(href);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    // If same query already on page, do nothing and don't show spinner
    if (pathname === '/search' && trimmedQuery === currentSearchQuery) {
      closeSuggestions();
      onFocusChange?.(false);
      return;
    }

    goTo(`/search?searchQuery=${encodeURIComponent(trimmedQuery)}`);
  };

  const hasSuggestions =
    suggestions &&
    (suggestions.products.length > 0 || suggestions.categories.length > 0);
  const suggestionsOpen =
    showSuggestions && searchQuery.trim().length >= MIN_SUGGEST_CHARS;

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
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            onFocusChange?.(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setTimeout(() => {
              onFocusChange?.(false);
              closeSuggestions();
            }, 150);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') closeSuggestions();
          }}
          variant='bordered'
          radius='full'
          isClearable
          onClear={() => {
            setSearchQuery('');
            setSuggestions(null);
          }}
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

        {/* Autocomplete dropdown. onMouseDown preventDefault keeps the input
            from blurring before the click lands. */}
        {suggestionsOpen && (
          <div
            onMouseDown={(e) => e.preventDefault()}
            className='absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl'
          >
            {hasSuggestions ? (
              <ul className='max-h-[70vh] overflow-y-auto py-1'>
                {suggestions.categories.map((c) => (
                  <li key={`c-${c._id}`}>
                    <button
                      type='button'
                      onClick={() => goTo(`/category/${c.slug}`)}
                      className='flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-gray-100'
                    >
                      <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500'>
                        <SearchIcon className='h-3.5 w-3.5' />
                      </span>
                      <span className='min-w-0'>
                        <span className='block truncate font-medium text-gray-900'>
                          {c.name}
                        </span>
                        <span className='text-xs text-gray-400'>Category</span>
                      </span>
                    </button>
                  </li>
                ))}
                {suggestions.products.map((p) => (
                  <li key={`p-${p._id}`}>
                    <button
                      type='button'
                      onClick={() => goTo(`/product/${p.slug}`)}
                      className='flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100'
                    >
                      {p.image?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image.url}
                          alt=''
                          loading='lazy'
                          className='h-9 w-9 shrink-0 rounded-lg border border-gray-200 object-cover'
                        />
                      ) : (
                        <span className='h-9 w-9 shrink-0 rounded-lg bg-gray-100' />
                      )}
                      <span className='truncate text-gray-900'>{p.name}</span>
                    </button>
                  </li>
                ))}
                <li className='border-t border-gray-100'>
                  <button
                    type='button'
                    onClick={handleSubmit}
                    className='flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold text-gray-900 hover:bg-gray-100'
                  >
                    <SearchIcon className='h-4 w-4 shrink-0' />
                    See all results for &ldquo;{searchQuery.trim()}&rdquo;
                  </button>
                </li>
              </ul>
            ) : (
              suggestions && (
                <button
                  type='button'
                  onClick={handleSubmit}
                  className='flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-100'
                >
                  <SearchIcon className='h-4 w-4 shrink-0' />
                  Search for &ldquo;{searchQuery.trim()}&rdquo;
                </button>
              )
            )}
          </div>
        )}
      </form>
    </div>
  );
}
