'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  getCachedCategories,
  setCachedCategories,
} from '@/lib/utils/categoryCache';
import { ArrowRight, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

// Strip the trailing "Embroidery Design(s)" the same way the rest of the app does.
const cleanName = (name = '') =>
  name.replace(/embroidery design(s)?/gi, '').trim();

// Categories may carry their thumbnail under any of these keys — use the first.
const getImage = (c) =>
  c?.image.url ||
  c?.thumbnail ||
  c?.icon ||
  c?.imageUrl ||
  c?.image_url ||
  c?.coverImage ||
  null;

// Same idea for a product count. Returns a number or null.
const getCount = (c) => {
  const v =
    c?.productCount ??
    c?.products_count ??
    c?.totalProducts ??
    c?.total ??
    c?.count ??
    null;
  return typeof v === 'number' ? v : null;
};

function CategoriesSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9'>
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-3'
        >
          <div className='mb-3 aspect-square w-full animate-pulse rounded-xl bg-neutral-100' />
          <div className='h-3 w-3/4 animate-pulse rounded bg-neutral-100' />
          <div className='mt-1.5 h-2.5 w-1/2 animate-pulse rounded bg-neutral-100' />
        </div>
      ))}
    </div>
  );
}

export default function BrowseCategories({
  viewAllHref = '/categories',
  limit = 8,
}) {
  // null on both server + first client render → no hydration mismatch.
  const [cachedData, setCachedDataState] = useState(null);

  // Load from localStorage after hydration.
  useEffect(() => {
    const cached = getCachedCategories();
    if (cached) setCachedDataState(cached);
  }, []);

  // Hit the API only when there's no cache.
  const { data: categoryData, isLoading } = useGetPublicProductCategoriesQuery(
    undefined,
    { skip: !!cachedData },
  );

  // Persist API response back into the cache.
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

  const visible = useMemo(
    () => categories.slice(0, limit),
    [categories, limit],
  );

  const Section = ({ children }) => (
    <section aria-labelledby='browse-categories-heading' className=' bg-white'>
      <div className='container mx-auto max-w-7xl py-10 sm:py-12'>
        {/* ── Header row ── */}
        <div className='mb-6 flex items-center justify-between gap-4'>
          <h2
            id='browse-categories-heading'
            style={{ fontFamily: 'Georgia, serif' }}
            className='text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900'
          >
            Browse Categories
          </h2>
          <Link
            href={viewAllHref}
            prefetch={false}
            className='group inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium text-neutral-500 transition hover:text-neutral-900'
          >
            View All Categories
            <ArrowRight
              className='h-4 w-4 transition-transform group-hover:translate-x-0.5'
              aria-hidden
            />
          </Link>
        </div>
        {children}
      </div>
    </section>
  );

  // While the first fetch is in flight (no cache yet), hold the space.
  if (!categories.length) {
    if (isLoading) {
      return (
        <Section>
          <CategoriesSkeleton />
        </Section>
      );
    }
    return null;
  }

  return (
    <Section>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9'>
        {visible.map((category) => {
          const name = cleanName(category.name);
          const img = getImage(category);
          const count = getCount(category);

          console.log(category?.image?.url);
          console.log(img);

          return (
            <Link
              key={category._id ?? category.slug}
              href={`/category/${category.slug}`}
              prefetch={false}
              aria-label={`${name}${count != null ? `, ${count.toLocaleString()} designs` : ''}`}
              className='group flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900'
            >
              <div className='relative mb-3 aspect-square w-full overflow-hidden rounded-xl bg-neutral-50'>
                {img ? (
                  <img
                    src={img}
                    alt={name}
                    fill={true}
                    sizes='(min-width: 1280px) 140px, (min-width: 1024px) 16vw, (min-width: 640px) 30vw, 45vw'
                    className='object-contain p-2 transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <span className='flex h-full w-full items-center justify-center text-2xl text-neutral-300'>
                    ✦
                  </span>
                )}
              </div>

              <span className='text-sm font-semibold capitalize leading-tight text-neutral-800'>
                {name}
              </span>
              {count != null && (
                <span className='mt-1 text-xs text-neutral-400'>
                  {count.toLocaleString()} Designs
                </span>
              )}
            </Link>
          );
        })}

        {/* ── "More Categories" tile ── */}
        <Link
          href={viewAllHref}
          prefetch={false}
          aria-label='More categories, explore more'
          className='group flex flex-col items-center rounded-2xl border border-neutral-100 bg-white p-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900'
        >
          <div className='relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-50'>
            <span className='flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-100 transition-transform duration-300 group-hover:scale-105'>
              <MoreHorizontal
                className='h-6 w-6 text-neutral-400'
                aria-hidden
              />
            </span>
          </div>
          <span className='text-sm font-semibold leading-tight text-neutral-800'>
            More Categories
          </span>
          <span className='mt-1 text-xs text-neutral-400'>Explore more</span>
        </Link>
      </div>
    </Section>
  );
}
