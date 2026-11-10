'use client';

import { useGetPublicProductCategoriesQuery } from '@/lib/redux/admin/categoryAndSubcategory/categoryAndSubcategorySlice';
import {
  getCachedCategories,
  setCachedCategories,
} from '@/lib/utils/categoryCache';
import { MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import HomeSection from './HomeSection';

// Strip the trailing "Embroidery Design(s)" the same way the rest of the app does.
const cleanName = (name = '') =>
  name.replace(/embroidery design(s)?/gi, '').trim();

// Categories may carry their thumbnail under any of these keys — use the first.
const getImage = (c) =>
  c?.image?.url ||
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
    <div className='grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-5 lg:grid-cols-9'>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col items-center rounded-xl border border-neutral-100 bg-white p-1.5 sm:p-2.5'
        >
          <div className='mb-2 aspect-square w-full animate-pulse rounded-lg bg-neutral-100' />
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

  // Defined per render as a thin pass-through so the grid and the skeleton
  // share one header; the real shell lives in HomeSection.
  const Section = ({ children }) => (
    <HomeSection
      id='browse-categories-heading'
      title='Browse Categories'
      viewAllHref={viewAllHref}
      viewAllLabel='View All Categories'
      tone='white'
    >
      {children}
    </HomeSection>
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
      <div className='grid grid-cols-4 gap-2 sm:gap-3 md:grid-cols-5 lg:grid-cols-9'>
        {visible.map((category) => {
          const name = cleanName(category.name);
          const img = getImage(category);
          const count = getCount(category);

          return (
            <Link
              key={category._id ?? category.slug}
              href={`/category/${category.slug}`}
              prefetch={false}
              aria-label={`${name}${count != null ? `, ${count.toLocaleString()} designs` : ''}`}
              className='group flex flex-col items-center rounded-xl border border-neutral-100 bg-white p-1.5 pb-2 text-center sm:p-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900'
            >
              <div className='relative mb-2 aspect-square w-full overflow-hidden rounded-lg bg-neutral-50'>
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={name}
                    loading='lazy'
                    className='absolute inset-0 h-full w-full object-contain p-1 sm:p-2 transition-transform duration-300 group-hover:scale-105'
                  />
                ) : (
                  <span className='flex h-full w-full items-center justify-center text-2xl text-neutral-300'>
                    ✦
                  </span>
                )}
              </div>

              <span className='line-clamp-2 text-[11px] font-semibold capitalize leading-tight text-neutral-800 sm:text-xs xl:text-sm'>
                {name}
              </span>
              {count != null && (
                <span className='mt-0.5 text-[10px] text-neutral-400 sm:text-xs'>
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
          className='hidden md:flex group flex-col items-center rounded-xl border border-neutral-100 bg-white p-2.5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900'
        >
          <div className='relative mb-2 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg bg-neutral-50'>
            <span className='flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-neutral-100 transition-transform duration-300 group-hover:scale-105'>
              <MoreHorizontal
                className='h-5 w-5 text-neutral-400'
                aria-hidden
              />
            </span>
          </div>

          <span className='text-xs font-semibold leading-tight text-neutral-800 xl:text-sm'>
            More Categories
          </span>

          <span className='mt-0.5 text-[10px] text-neutral-400 sm:text-xs'>
            Explore more
          </span>
        </Link>
      </div>
    </Section>
  );
}
