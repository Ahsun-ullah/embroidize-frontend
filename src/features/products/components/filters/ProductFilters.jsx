'use client';

import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState, useTransition } from 'react';
import {
  SINCE_OPTIONS,
  TIER_OPTIONS,
  buildQuery,
  countActiveFilters,
  readFilterParams,
  toggleCsvValue,
} from './filterConfig';

// Subcategory lists run to 105 entries, so anything past this is collapsed
// behind "Show all" with a type-to-narrow box.
const COLLAPSE_AFTER = 8;

const fmt = (n) => (typeof n === 'number' ? n.toLocaleString() : '0');

/** Strips the "Embroidery Designs" suffix every taxonomy name carries. */
const shortName = (name = '') =>
  name.replace(/embroidery designs?/gi, '').replace(/\s+/g, ' ').trim() || name;

function Checkbox({ checked, disabled }) {
  return (
    <span
      aria-hidden='true'
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors ${
        checked
          ? 'border-black bg-black'
          : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 bg-white group-hover:border-gray-500'
      }`}
    >
      {checked && (
        <svg viewBox='0 0 12 12' className='h-3 w-3 text-white' fill='none'>
          <path
            d='M2.5 6.2L4.8 8.5L9.5 3.8'
            stroke='currentColor'
            strokeWidth='1.8'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )}
    </span>
  );
}

function Option({ label, count, checked, onToggle, isRadio = false }) {
  // A zero-count option can still be un-checked, so only disable it when
  // clicking it would lead to an empty grid.
  const disabled = count === 0 && !checked;

  return (
    <li>
      <button
        type='button'
        disabled={disabled}
        onClick={onToggle}
        aria-pressed={checked}
        className={`group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
          disabled
            ? 'cursor-not-allowed text-gray-300'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        {isRadio ? (
          <span
            aria-hidden='true'
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
              checked ? 'border-black' : 'border-gray-300 group-hover:border-gray-500'
            }`}
          >
            {checked && <span className='h-2 w-2 rounded-full bg-black' />}
          </span>
        ) : (
          <Checkbox checked={checked} disabled={disabled} />
        )}
        <span className={`flex-1 capitalize ${checked ? 'font-semibold text-black' : ''}`}>
          {label}
        </span>
        <span className='shrink-0 text-xs tabular-nums text-gray-400'>{fmt(count)}</span>
      </button>
    </li>
  );
}

function Group({ title, children, defaultOpen = true, count }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className='border-b border-gray-100 last:border-b-0'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className='flex w-full items-center justify-between px-4 py-3 text-left'
      >
        <span className='text-sm font-semibold text-gray-900'>
          {title}
          {count > 0 && (
            <span className='ml-1.5 rounded-full bg-black px-1.5 py-0.5 text-[10px] font-bold text-white'>
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className='px-2 pb-3'>{children}</div>}
    </div>
  );
}

/** A list that collapses past COLLAPSE_AFTER rows and gains a filter box. */
function OptionList({ items, renderOption, searchLabel }) {
  const [expanded, setExpanded] = useState(false);
  const [needle, setNeedle] = useState('');

  const matched = useMemo(() => {
    const q = needle.trim().toLowerCase();
    return q ? items.filter((i) => i.label.toLowerCase().includes(q)) : items;
  }, [items, needle]);

  const overflows = matched.length > COLLAPSE_AFTER;
  const visible = expanded || needle ? matched : matched.slice(0, COLLAPSE_AFTER);

  return (
    <>
      {items.length > COLLAPSE_AFTER && (
        <div className='px-2 pb-2'>
          <input
            type='text'
            value={needle}
            onChange={(e) => setNeedle(e.target.value)}
            placeholder={searchLabel}
            className='w-full rounded-md border border-gray-200 px-2.5 py-1.5 text-xs text-gray-700 outline-none placeholder:text-gray-400 focus:border-gray-900'
          />
        </div>
      )}
      <ul className='space-y-0.5'>{visible.map(renderOption)}</ul>
      {overflows && !needle && (
        <button
          type='button'
          onClick={() => setExpanded((v) => !v)}
          className='mt-1 px-2 text-xs font-semibold text-gray-900 underline underline-offset-2'
        >
          {expanded ? 'Show less' : `Show all ${matched.length}`}
        </button>
      )}
      {!visible.length && (
        <p className='px-2 py-1 text-xs text-gray-400'>No matches</p>
      )}
    </>
  );
}

/**
 * URL-driven filter panel. Renders as a sticky rail on desktop and a
 * full-screen drawer on mobile; both share the same option list, so there is
 * one implementation to keep correct.
 *
 * `locked` names groups the host page owns — the category page is already a
 * category, so it hides that group instead of letting you contradict the URL.
 */
export default function ProductFilters({ facets, locked = [] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const state = useMemo(
    () => readFilterParams(Object.fromEntries(searchParams.entries())),
    [searchParams],
  );
  const activeCount = countActiveFilters(state);

  const apply = useCallback(
    (changes) => {
      startTransition(() => {
        const qs = buildQuery(searchParams, changes);
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams],
  );

  // Memoised, not inlined: a bare `facets?.categories || []` hands the hooks
  // below a fresh array identity on every render, so their memoisation would
  // never actually hold.
  const categories = useMemo(() => facets?.categories || [], [facets]);
  const subCategories = useMemo(() => facets?.subCategories || [], [facets]);

  // Subcategories belonging to the selected categories only — 105 unscoped
  // entries is a wall of text, and the ones outside your category selection
  // would all read 0 anyway.
  const selectedCategoryIds = useMemo(() => {
    const bySlug = new Map(categories.map((c) => [c.slug, String(c._id)]));
    return new Set(state.category.map((slug) => bySlug.get(slug)).filter(Boolean));
  }, [categories, state.category]);

  const visibleSubCategories = useMemo(() => {
    const scoped = selectedCategoryIds.size
      ? subCategories.filter((s) => selectedCategoryIds.has(String(s.category)))
      : subCategories;
    return [...scoped].sort((a, b) => b.count - a.count);
  }, [subCategories, selectedCategoryIds]);

  const clearAll = () =>
    apply({
      category: '',
      sub_category: '',
      tier: '',
      since: '',
      curated: '',
      favourited: '',
      filter: '',
    });

  const panel = (
    <div className='divide-y divide-gray-100'>
      {!locked.includes('category') && (
        <Group title='Category' count={state.category.length}>
          <OptionList
            items={categories.map((c) => ({ ...c, label: shortName(c.name) }))}
            searchLabel='Find a category'
            renderOption={(c) => (
              <Option
                key={c._id}
                label={c.label}
                count={c.count}
                checked={state.category.includes(c.slug)}
                onToggle={() =>
                  apply({
                    category: toggleCsvValue(state.category, c.slug),
                    // Subcategory choices belong to the old category selection.
                    sub_category: '',
                  })
                }
              />
            )}
          />
        </Group>
      )}

      {!locked.includes('sub_category') && visibleSubCategories.length > 0 && (
        <Group title='Subcategory' count={state.sub_category.length}>
          <OptionList
            items={visibleSubCategories.map((s) => ({ ...s, label: shortName(s.name) }))}
            searchLabel='Find a subcategory'
            renderOption={(s) => (
              <Option
                key={s._id}
                label={s.label}
                count={s.count}
                checked={state.sub_category.includes(s.slug)}
                onToggle={() =>
                  apply({ sub_category: toggleCsvValue(state.sub_category, s.slug) })
                }
              />
            )}
          />
        </Group>
      )}

      <Group title='Design type' count={state.tier ? 1 : 0}>
        <ul className='space-y-0.5'>
          {TIER_OPTIONS.map((t) => (
            <Option
              key={t.value}
              isRadio
              label={t.label}
              count={facets?.tier?.[t.value] ?? 0}
              checked={state.tier === t.value}
              // Radio semantics: clicking the active one clears it.
              onToggle={() => apply({ tier: state.tier === t.value ? '' : t.value })}
            />
          ))}
        </ul>
      </Group>

      <Group title='Collection' count={state.curated ? 1 : 0}>
        <ul className='space-y-0.5'>
          <Option
            label='Embroidize Choice'
            count={facets?.curated ?? 0}
            checked={state.curated === '1'}
            onToggle={() => apply({ curated: state.curated === '1' ? '' : '1' })}
          />
        </ul>
      </Group>

      <Group title='Date added' count={state.since ? 1 : 0} defaultOpen={false}>
        <ul className='space-y-0.5'>
          {SINCE_OPTIONS.map((s) => (
            <Option
              key={s.value}
              isRadio
              label={s.label}
              count={facets?.since?.[s.value] ?? 0}
              checked={state.since === s.value}
              onToggle={() => apply({ since: state.since === s.value ? '' : s.value })}
            />
          ))}
        </ul>
      </Group>
    </div>
  );

  return (
    <>
      {/* Trigger only — no desktop rail. A 260px sidebar cost roughly a third
          of every product image, and on this catalogue the design IS the
          product, so the filters slide over the page instead of pushing the
          grid narrower. */}
      <button
        type='button'
        onClick={() => setDrawerOpen(true)}
        className='flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 transition-colors hover:border-black'
      >
        <SlidersHorizontal size={16} />
        Filters
        {activeCount > 0 && (
          <span className='rounded-full bg-black px-2 py-0.5 text-[11px] font-bold text-white'>
            {activeCount}
          </span>
        )}
      </button>

      {/* ── Slide-over panel ── */}
      {drawerOpen && (
        <div className='fixed inset-0 z-50 flex' role='dialog' aria-modal='true'>
          <button
            type='button'
            aria-label='Close filters'
            onClick={() => setDrawerOpen(false)}
            className='absolute inset-0 bg-black/40'
          />
          <div className='relative ml-auto flex h-full w-full max-w-sm flex-col bg-white'>
            <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3'>
              <span className='text-sm font-bold uppercase tracking-wide'>Filters</span>
              <button
                type='button'
                onClick={() => setDrawerOpen(false)}
                aria-label='Close filters'
                className='rounded-full p-1 hover:bg-gray-100'
              >
                <X size={18} />
              </button>
            </div>

            <div className={`flex-1 overflow-y-auto ${isPending ? 'opacity-60' : ''}`}>
              {panel}
            </div>

            <div className='flex items-center gap-3 border-t border-gray-200 p-4'>
              <button
                type='button'
                onClick={clearAll}
                disabled={activeCount === 0}
                className='flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-40'
              >
                Clear all
              </button>
              <button
                type='button'
                onClick={() => setDrawerOpen(false)}
                className='flex-1 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white'
              >
                Show {fmt(facets?.total ?? 0)}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
