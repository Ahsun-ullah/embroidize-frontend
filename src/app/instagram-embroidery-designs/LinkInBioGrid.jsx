'use client';

import {
  getLinkInBioPage,
  LINK_IN_BIO_PAGE_SIZE,
} from '@/lib/apis/public/linkInBio';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

// The first page arrives server-rendered; later pages load as the visitor
// nears the bottom. A small rootMargin starts the next page just before they
// reach it without chaining every page in at once on a tall screen, and only
// on-screen images download (next/image is lazy past the first row).
export default function LinkInBioGrid({ initialItems, initialHasMore, utm }) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (busyRef.current || !hasMore) return;
    busyRef.current = true;
    setLoading(true);
    setFailed(false);
    const next = pageRef.current + 1;
    const res = await getLinkInBioPage(next, LINK_IN_BIO_PAGE_SIZE, {
      server: false,
    });
    if (res.items.length || !res.hasMore) {
      pageRef.current = next;
      setItems((prev) => {
        const seen = new Set(prev.map((i) => i._id));
        return [...prev, ...res.items.filter((i) => !seen.has(i._id))];
      });
      setHasMore(res.hasMore);
    } else {
      setFailed(true);
    }
    setLoading(false);
    busyRef.current = false;
  }, [hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || failed) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, failed, loadMore, items.length]);

  return (
    <>
      <ul className='mt-3 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-3'>
        {items.map((item, i) => (
          <li key={item._id}>
            <Link
              href={`/product/${item.slug}?${utm}`}
              // Same 3:2 frame as the product cards and product page, so
              // designs show whole instead of being cropped to a square.
              className='group relative block aspect-[3/2] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm transition-shadow hover:shadow-md'
              title={item.name}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  // Three columns at every width inside a max-w-6xl page, so a
                  // tile is about a third of the viewport up to ~370px. The
                  // old 240px/25vw hint picked files smaller than the tile on
                  // desktop, which is what made designs look soft there.
                  sizes='(max-width: 1151px) 31vw, 370px'
                  quality={85}
                  className='object-cover object-center transition-transform duration-300 group-hover:scale-105'
                  // The first row is preloaded; the next few rows are on
                  // screen on a phone, so they load straight away instead of
                  // waiting for the lazy-load check after layout.
                  priority={i < 3}
                  loading={i < 3 ? undefined : i < 12 ? 'eager' : 'lazy'}
                />
              ) : (
                <span className='flex h-full items-center justify-center p-2 text-center text-xs text-gray-500'>
                  {item.name}
                </span>
              )}
            </Link>
          </li>
        ))}
        {loading &&
          Array.from({ length: 5 }).map((_, i) => (
            <li
              key={`sk-${i}`}
              className='aspect-[3/2] animate-pulse rounded-xl bg-gray-100'
              aria-hidden
            />
          ))}
      </ul>

      {hasMore && (
        <div ref={sentinelRef} className='mt-6 flex justify-center'>
          {/* Fallback for a failed fetch or a browser without
              IntersectionObserver. */}
          {!loading && (
            <button
              type='button'
              onClick={loadMore}
              className='rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50'
            >
              {failed ? 'Try again' : 'Load more designs'}
            </button>
          )}
        </div>
      )}
    </>
  );
}
