'use client';

import { ChevronDown, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
import {
  SINCE_OPTIONS,
  SORT_OPTIONS,
  TIER_OPTIONS,
  buildQuery,
  readFilterParams,
  toggleCsvValue,
} from './filterConfig';

const shortName = (name = '') =>
  name.replace(/embroidery designs?/gi, '').replace(/\s+/g, ' ').trim() || name;

/**
 * The bar above the grid: result count, sort control, and one removable chip
 * per active filter. Chips matter more than they look — without them a user
 * who scrolled past the sidebar has no idea why the grid is short.
 */
export default function FilterBar({ facets, total, locked = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state = useMemo(
    () => readFilterParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  const apply = useCallback(
    (changes) => {
      startTransition(() => {
        const qs = buildQuery(searchParams, changes);
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  // Slug → display name, so a chip reads "Animals & Wildlife", not a slug.
  const chips = useMemo(() => {
    const out = [];
    const catBySlug = new Map((facets?.categories || []).map((c) => [c.slug, c]));
    const subBySlug = new Map((facets?.subCategories || []).map((s) => [s.slug, s]));

    if (!locked.includes('category')) {
      state.category.forEach((slug) => {
        out.push({
          key: `category:${slug}`,
          label: shortName(catBySlug.get(slug)?.name || slug),
          onRemove: () =>
            apply({ category: toggleCsvValue(state.category, slug), sub_category: '' }),
        });
      });
    }

    if (!locked.includes('sub_category')) {
      state.sub_category.forEach((slug) => {
        out.push({
          key: `sub:${slug}`,
          label: shortName(subBySlug.get(slug)?.name || slug),
          onRemove: () => apply({ sub_category: toggleCsvValue(state.sub_category, slug) }),
        });
      });
    }

    if (state.tier) {
      out.push({
        key: 'tier',
        label: TIER_OPTIONS.find((t) => t.value === state.tier)?.label || state.tier,
        onRemove: () => apply({ tier: '' }),
      });
    }

    if (state.curated === '1') {
      out.push({
        key: 'curated',
        label: 'Embroidize Choice',
        onRemove: () => apply({ curated: '' }),
      });
    }

    if (state.since) {
      out.push({
        key: 'since',
        label: SINCE_OPTIONS.find((s) => s.value === state.since)?.label || state.since,
        onRemove: () => apply({ since: '' }),
      });
    }

    return out;
  }, [state, facets, locked, apply]);

  const clearAll = () =>
    apply({
      category: locked.includes('category') ? undefined : '',
      sub_category: locked.includes('sub_category') ? undefined : '',
      tier: '',
      since: '',
      curated: '',
      favourited: '',
      filter: '',
    });

  return (
    <div className={isPending ? 'opacity-60 transition-opacity' : ''}>
      <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between'>
        <p className='text-sm text-gray-600'>
          <span className='font-semibold text-gray-900'>
            {(total ?? 0).toLocaleString()}
          </span>{' '}
          design{total === 1 ? '' : 's'}
        </p>

        <label className='relative flex items-center gap-2 text-sm'>
          <span className='shrink-0 text-gray-500'>Sort</span>
          <span className='relative'>
            <select
              value={state.sort || 'newest'}
              onChange={(e) => apply({ sort: e.target.value })}
              className='appearance-none rounded-lg border border-gray-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-gray-900 outline-none focus:border-black'
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className='pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500'
            />
          </span>
        </label>
      </div>

      {chips.length > 0 && (
        <div className='mt-3 flex flex-wrap items-center gap-2'>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type='button'
              onClick={chip.onRemove}
              className='group flex items-center gap-1.5 rounded-full border border-gray-300 bg-white py-1 pl-3 pr-2 text-xs font-medium capitalize text-gray-800 hover:border-black'
            >
              {chip.label}
              <X size={13} className='text-gray-400 group-hover:text-black' />
            </button>
          ))}
          <button
            type='button'
            onClick={clearAll}
            className='px-1 text-xs font-semibold text-gray-500 underline underline-offset-2 hover:text-black'
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
