'use client';

import { useDailyVoteCount } from '@/lib/hooks/useDailyVoteCounts';
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Gift,
  Vote,
  Search,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import VoteButton from './VoteButton';

// "Find a design and vote": every premium design, with search, category and
// sub-category filters and sorting, on the vote page itself. Reads the same
// public product list the shop uses (tier=premium), and today's vote counts
// for the whole page in one batched request.
//
// Filters live in the URL (?q=&cat=&sub=&sort=&page=) so a filtered view can
// be shared, but are written with replaceState so changing a filter does not
// re-render the server part of the page.

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
const PAGE_SIZE = 24;
const FALLBACK_IMG =
  'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/image-not-found.png';

const SORTS = [
  { value: 'popular', label: 'Popular' },
  { value: 'newest', label: 'Newest' },
  { value: 'most-downloaded', label: 'Most downloaded' },
  { value: 'most-favourited', label: 'Most loved' },
  { value: 'name-asc', label: 'Name A–Z' },
];

const readUrl = () => {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  return {
    q: p.get('q') || '',
    cat: p.get('cat') || '',
    sub: p.get('sub') || '',
    sort: SORTS.some((s) => s.value === p.get('sort'))
      ? p.get('sort')
      : 'popular',
    page: Math.max(1, parseInt(p.get('page') || '1', 10) || 1),
  };
};

const writeUrl = (f) => {
  const p = new URLSearchParams(window.location.search);
  const set = (k, v, def = '') =>
    v && v !== def ? p.set(k, String(v)) : p.delete(k);
  set('q', f.q);
  set('cat', f.cat);
  set('sub', f.sub);
  set('sort', f.sort, 'popular');
  set('page', f.page > 1 ? f.page : '');
  const qs = p.toString();
  window.history.replaceState(
    null,
    '',
    `${window.location.pathname}${qs ? `?${qs}` : ''}`,
  );
};

function VoteTile({ product }) {
  const { votes, isFreeToday } = useDailyVoteCount(product._id);
  const cat = product?.category?.name || product?.sub_category?.name || '';
  return (
    <div className='flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <Link
        href={`/product/${product.slug}`}
        className='relative block aspect-square w-full bg-white'
      >
        <Image
          src={product?.image?.url || FALLBACK_IMG}
          alt={product.name}
          fill
          sizes='(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 260px'
          className='object-contain p-2 transition-transform duration-300 hover:scale-105'
        />
        <span className='absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black px-2 py-1 text-[11px] font-semibold text-white'>
          <Crown size={10} className='fill-amber-400 text-amber-400' /> Pro
        </span>
        <span className='absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[11px] font-bold text-gray-800 shadow-sm'>
          <Vote className='h-3 w-3 text-amber-600' aria-hidden /> {votes}
        </span>
      </Link>
      <div className='flex flex-1 flex-col gap-2 p-3'>
        <div className='min-w-0'>
          <Link
            href={`/product/${product.slug}`}
            className='line-clamp-2 text-sm font-semibold text-gray-900 hover:underline'
            title={product.name}
          >
            {product.name
              .replace(/Embroidery Design, |Machine Embroidery Design/gi, '')
              .trim()}
          </Link>
          {cat && (
            <p className='truncate text-xs capitalize text-gray-500'>
              {cat.replace(/embroidery designs/gi, '').trim()}
            </p>
          )}
          {product?.sku_code && (
            <p className='text-[11px] text-gray-400'>SKU {product.sku_code}</p>
          )}
        </div>
        <div className='mt-auto'>
          {isFreeToday ? (
            <Link
              href={`/product/${product.slug}`}
              className='inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-green-100 text-sm font-bold text-green-800 hover:bg-green-200'
            >
              <Gift className='h-4 w-4' aria-hidden /> Free today
            </Link>
          ) : (
            <VoteButton
              productId={product._id}
              productName={product.name}
              size='sm'
            />
          )}
        </div>
      </div>
    </div>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'border-black bg-black text-white'
          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
      }`}
    >
      {children}
    </button>
  );
}

export default function VoteBrowser({ categories = [] }) {
  const topRef = useRef(null);
  const [filters, setFilters] = useState({
    q: '',
    cat: '',
    sub: '',
    sort: 'popular',
    page: 1,
  });
  const [input, setInput] = useState('');
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState({ items: [], total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Start from the URL, so a shared filtered link opens filtered.
  useEffect(() => {
    const f = readUrl();
    setFilters(f);
    setInput(f.q);
    setReady(true);
  }, []);

  const update = useCallback((patch, { scroll = false } = {}) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (!('page' in patch)) next.page = 1;
      writeUrl(next);
      return next;
    });
    if (scroll)
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Debounced search box.
  useEffect(() => {
    if (!ready) return undefined;
    const t = setTimeout(() => {
      if (input.trim() !== filters.q) update({ q: input.trim() });
    }, 350);
    return () => clearTimeout(t);
  }, [input, ready, filters.q, update]);

  useEffect(() => {
    if (!ready) return undefined;
    const ctrl = new AbortController();
    const params = new URLSearchParams({
      tier: 'premium',
      page: String(filters.page),
      limit: String(PAGE_SIZE),
    });
    if (filters.q) params.set('search', filters.q);
    // A search keeps relevance order unless a sort other than the default
    // was picked.
    if (!filters.q || filters.sort !== 'popular')
      params.set('sort', filters.sort);
    if (filters.cat) params.set('category', filters.cat);
    if (filters.sub) params.set('sub_category', filters.sub);

    setLoading(true);
    setError(false);
    fetch(`${BASE}/public/product?${params.toString()}`, {
      signal: ctrl.signal,
      cache: 'no-store',
    })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
      )
      .then((json) => {
        const items = json?.data?.data || [];
        const meta = json?.data?.meta || {};
        setResult({
          items,
          total: meta.total ?? items.length,
          totalPages: meta.totalPages ?? 1,
        });
      })
      .catch((e) => {
        if (e?.name !== 'AbortError') setError(true);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
    return () => ctrl.abort();
  }, [filters, ready]);

  const activeCat = categories.find((c) => c.slug === filters.cat);
  const subs = activeCat?.subcategories || [];
  const hasFilters = filters.q || filters.cat || filters.sub;

  return (
    <section
      ref={topRef}
      id='vote-any-design'
      className='container mx-auto max-w-7xl scroll-mt-24 px-4'
    >
      <div className='text-center'>
        <h2 className='text-2xl font-extrabold text-gray-900 sm:text-3xl'>
          Find a design and vote
        </h2>
        <p className='mt-1 text-gray-500'>
          Every premium design can win. Search or pick a category, then tap
          Vote.
        </p>
      </div>

      <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
        <label className='relative flex-1'>
          <span className='sr-only'>Search designs</span>
          <Search
            className='pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400'
            aria-hidden
          />
          <input
            type='search'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Search premium designs, e.g. puppy, Christmas, roses'
            className='h-12 w-full rounded-xl border border-gray-200 bg-white pl-12 pr-10 text-base outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200'
          />
          {input && (
            <button
              type='button'
              onClick={() => setInput('')}
              className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:text-gray-700'
              aria-label='Clear search'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </label>
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className='h-12 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 outline-none focus:border-amber-400'
          aria-label='Sort designs'
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {categories.length > 0 && (
        <div className='-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0'>
          <Pill
            active={!filters.cat}
            onClick={() => update({ cat: '', sub: '' })}
          >
            All categories
          </Pill>
          {categories.map((c) => (
            <Pill
              key={c._id}
              active={filters.cat === c.slug}
              onClick={() => update({ cat: c.slug, sub: '' })}
            >
              {c.name}
            </Pill>
          ))}
        </div>
      )}

      {subs.length > 0 && (
        <div className='-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0'>
          <Pill active={!filters.sub} onClick={() => update({ sub: '' })}>
            All {activeCat.name}
          </Pill>
          {subs.map((s) => (
            <Pill
              key={s._id}
              active={filters.sub === s.slug}
              onClick={() => update({ sub: s.slug })}
            >
              {s.name}
            </Pill>
          ))}
        </div>
      )}

      <div className='mt-4 flex items-center justify-between text-sm text-gray-500'>
        <span>
          {loading
            ? 'Loading…'
            : `${result.total.toLocaleString()} premium design${result.total === 1 ? '' : 's'}`}
        </span>
        {hasFilters && (
          <button
            type='button'
            onClick={() => {
              setInput('');
              update({ q: '', cat: '', sub: '' });
            }}
            className='font-semibold text-gray-900 underline-offset-4 hover:underline'
          >
            Clear filters
          </button>
        )}
      </div>

      <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5'>
        {loading && !result.items.length
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className='animate-pulse rounded-2xl bg-white p-3'>
                <div className='aspect-square rounded-xl bg-gray-200' />
                <div className='mt-3 h-3 rounded bg-gray-200' />
                <div className='mt-2 h-10 rounded-xl bg-gray-200' />
              </div>
            ))
          : result.items.map((p) => <VoteTile key={p._id} product={p} />)}
      </div>

      {!loading && !error && result.items.length === 0 && (
        <p className='py-12 text-center text-gray-500'>
          No premium designs match. Try another word or category.
        </p>
      )}
      {error && (
        <p className='py-12 text-center text-gray-500'>
          Designs couldn&apos;t load right now. Please refresh the page.
        </p>
      )}

      {result.totalPages > 1 && (
        <div className='mt-6 flex items-center justify-center gap-3'>
          <button
            type='button'
            disabled={filters.page <= 1 || loading}
            onClick={() => update({ page: filters.page - 1 }, { scroll: true })}
            className='inline-flex h-10 items-center gap-1 rounded-xl border bg-white px-4 text-sm font-semibold disabled:opacity-40'
          >
            <ChevronLeft className='h-4 w-4' /> Previous
          </button>
          <span className='text-sm font-semibold text-gray-700'>
            Page {filters.page} of {result.totalPages}
          </span>
          <button
            type='button'
            disabled={filters.page >= result.totalPages || loading}
            onClick={() => update({ page: filters.page + 1 }, { scroll: true })}
            className='inline-flex h-10 items-center gap-1 rounded-xl border bg-white px-4 text-sm font-semibold disabled:opacity-40'
          >
            Next <ChevronRight className='h-4 w-4' />
          </button>
        </div>
      )}
    </section>
  );
}
