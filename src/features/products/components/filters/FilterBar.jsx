'use client';

import { ChevronDown, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';
import ProductFilters from './ProductFilters';
import {
  SINCE_OPTIONS,
  TIER_OPTIONS,
  buildQuery,
  defaultSortFor,
  readFilterParams,
  sortOptionsFor,
  toggleCsvValue,
} from './filterConfig';

const shortName = (name = '') =>
  name
    .replace(/embroidery designs?/gi, '')
    .replace(/\s+/g, ' ')
    .trim() || name;

/**
 * The bar above the grid: result count, sort control, and one removable chip
 * per active filter. Chips matter more than they look — without them a user
 * who scrolled past the sidebar has no idea why the grid is short.
 */
export default function FilterBar({
  facets,
  total,
  locked = [],
  context = 'listing',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const state = useMemo(
    () => readFilterParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );

  // Relevance only exists on /search, so the option list and the fallback both
  // depend on which surface is rendering this bar.
  const sortOptions = useMemo(() => sortOptionsFor(context), [context]);
  const defaultSort = defaultSortFor(context);
  const activeSort = state.sort || defaultSort;
  const sortLabel =
    sortOptions.find((s) => s.value === activeSort)?.label || 'Newest first';

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
    const catBySlug = new Map(
      (facets?.categories || []).map((c) => [c.slug, c]),
    );
    const subBySlug = new Map(
      (facets?.subCategories || []).map((s) => [s.slug, s]),
    );

    if (!locked.includes('category')) {
      state.category.forEach((slug) => {
        out.push({
          key: `category:${slug}`,
          label: shortName(catBySlug.get(slug)?.name || slug),
          onRemove: () =>
            apply({
              category: toggleCsvValue(state.category, slug),
              sub_category: '',
            }),
        });
      });
    }

    if (!locked.includes('sub_category')) {
      state.sub_category.forEach((slug) => {
        out.push({
          key: `sub:${slug}`,
          label: shortName(subBySlug.get(slug)?.name || slug),
          onRemove: () =>
            apply({ sub_category: toggleCsvValue(state.sub_category, slug) }),
        });
      });
    }

    if (state.tier) {
      out.push({
        key: 'tier',
        label:
          TIER_OPTIONS.find((t) => t.value === state.tier)?.label || state.tier,
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
        label:
          SINCE_OPTIONS.find((s) => s.value === state.since)?.label ||
          state.since,
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
      <div className='flex flex-col gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between'>
        <div className='flex items-center gap-3'>
          {/* Opens the slide-over. Lives here rather than in a rail so the
              product grid keeps the full width of the page. */}
          <ProductFilters facets={facets} locked={locked} />
        </div>

        {context === 'search' ? (
          <p className='text-sm text-gray-600'>
            <span className='font-semibold text-gray-900'>
              {(total ?? 0).toLocaleString()}
            </span>{' '}
            design{total === 1 ? '' : 's'}
          </p>
        ) : (
          <label
            className={`relative flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors sm:w-auto ${
              state.sort
                ? 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
                : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400'
            }`}
          >
            <span
              className={`shrink-0 text-xs font-semibold uppercase tracking-wide ${
                state.sort ? 'text-gray-900' : 'text-gray-900'
              }`}
            >
              Sort
            </span>
            <span className='truncate font-medium'>{sortLabel}</span>
            <ChevronDown size={14} className='ml-auto shrink-0 text-gray-300' />

            <select
              aria-label='Sort designs'
              value={activeSort}
              onChange={(e) =>
                apply({
                  sort: e.target.value === defaultSort ? '' : e.target.value,
                })
              }
              className='absolute inset-0 h-full w-full cursor-pointer text-gray-900 opacity-0'
            >
              {sortOptions.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
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
