'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  getCachedCategories,
  setCachedCategories,
} from '@/lib/utils/categoryCache';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const cleanName = (name = '') =>
  name.replace(/embroidery design(s)?/gi, '').trim();

const getImage = (c) =>
  c?.image?.url ||
  c?.image ||
  c?.thumbnail ||
  c?.icon ||
  c?.imageUrl ||
  c?.image_url ||
  c?.coverImage ||
  null;

const matches = (name, q) =>
  cleanName(name).toLowerCase().includes(q) ||
  (name || '').toLowerCase().includes(q);

function Skeleton() {
  return (
    <div className='space-y-5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm'
        >
          <div className='mb-4 flex items-center gap-3'>
            <div className='h-12 w-12 animate-pulse rounded-xl bg-neutral-100' />
            <div className='h-4 w-44 animate-pulse rounded bg-neutral-100' />
          </div>
          <div className='flex flex-wrap gap-2'>
            {Array.from({ length: 6 }).map((_, j) => (
              <div
                key={j}
                className='h-8 w-24 animate-pulse rounded-full bg-neutral-100'
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AllCategoriesGrid() {
  const [cachedData, setCachedDataState] = useState(null);
  const [query, setQuery] = useState('');

  // Load cache after hydration (null on server + first render → no mismatch).
  useEffect(() => {
    const cached = getCachedCategories();
    if (cached) setCachedDataState(cached);
  }, []);

  const { data: categoryData, isLoading } = useGetPublicProductCategoriesQuery(
    undefined,
    { skip: !!cachedData },
  );

  useEffect(() => {
    if (categoryData?.data) {
      setCachedCategories(categoryData.data);
      setCachedDataState(categoryData.data);
    }
  }, [categoryData]);

  const categories = useMemo(
    () => cachedData || categoryData?.data || [],
    [cachedData, categoryData],
  );

  // Filter: keep a category if its name matches (then show ALL its subs),
  // otherwise keep only the subcategories that match.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q)
      return categories.map((c) => ({ cat: c, subs: c.subcategories || [] }));

    return categories
      .map((c) => {
        const all = c.subcategories || [];
        if (matches(c.name, q)) return { cat: c, subs: all };
        const subs = all.filter((s) => matches(s.name, q));
        return subs.length ? { cat: c, subs } : null;
      })
      .filter(Boolean);
  }, [categories, query]);

  const totalSubs = useMemo(
    () => filtered.reduce((n, { subs }) => n + subs.length, 0),
    [filtered],
  );

  return (
    <div className='container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10'>
      {/* ── Content ── */}
      {!categories.length ? (
        isLoading ? (
          <Skeleton />
        ) : (
          <p className='py-16 text-center text-neutral-500'>
            No categories available right now.
          </p>
        )
      ) : filtered.length === 0 ? (
        <p className='py-16 text-center text-neutral-500'>
          No categories or subcategories match “{query}”.
        </p>
      ) : (
        <>
          {query && (
            <p className='mb-5 text-sm text-neutral-500'>
              {filtered.length} categor{filtered.length === 1 ? 'y' : 'ies'} ·{' '}
              {totalSubs} subcategor{totalSubs === 1 ? 'y' : 'ies'}
            </p>
          )}

          <div className='space-y-5'>
            {filtered.map(({ cat, subs }) => {
              const name = cleanName(cat.name);
              const img = getImage(cat);

              return (
                <section
                  key={cat._id ?? cat.slug}
                  id={`cat-${cat.slug}`}
                  className='scroll-mt-32'
                >
                  {/* Header */}
                  <div className='mb-4 flex items-center gap-4'>
                    <div className='relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-neutral-50'>
                      {img ? (
                        <Image
                          src={img}
                          alt={name}
                          fill
                          sizes='48px'
                          className='object-contain p-1.5'
                        />
                      ) : (
                        <span className='flex h-full w-full items-center justify-center text-lg text-neutral-300'>
                          ✦
                        </span>
                      )}
                    </div>

                    <div className='min-w-0'>
                      <Link
                        href={`/category/${cat.slug}`}
                        prefetch={false}
                        className='block truncate text-lg font-bold capitalize text-[#0f1b34] transition hover:text-gray-500'
                      >
                        {name}
                      </Link>
                      <p className='text-xs text-neutral-400'>
                        {subs.length} subcategor
                        {subs.length === 1 ? 'y' : 'ies'}
                      </p>
                    </div>

                    <Link
                      href={`/category/${cat.slug}`}
                      prefetch={false}
                      className='group ml-auto inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-semibold text-gray-700'
                    >
                      View All Designs
                      <ChevronRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' />
                    </Link>
                  </div>

                  {/* Subcategories — image card + name (6-across) */}
                  {subs.length ? (
                    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'>
                      {subs.map((sub) => {
                        const subImg = getImage(sub);
                        const subName = cleanName(sub.name);
                        return (
                          <Link
                            key={sub._id ?? sub.slug}
                            href={`/${cat.slug}/${sub.slug}`}
                            prefetch={false}
                            aria-label={subName}
                            className='group flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-neutral-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400'
                          >
                            <div className='relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-neutral-50'>
                              {subImg ? (
                                <Image
                                  src={subImg}
                                  alt={subName}
                                  fill
                                  sizes='(min-width: 1024px) 180px, (min-width: 640px) 30vw, 45vw'
                                  className='object-contain p-3 transition-transform duration-300 group-hover:scale-105'
                                />
                              ) : (
                                <span className='flex h-full w-full items-center justify-center text-3xl text-neutral-300'>
                                  ✦
                                </span>
                              )}
                            </div>
                            <span className='text-sm font-semibold capitalize leading-tight text-[#0f1b34]'>
                              {subName}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  ) : (
                    <p className='text-sm text-neutral-400'>
                      No subcategories yet.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
