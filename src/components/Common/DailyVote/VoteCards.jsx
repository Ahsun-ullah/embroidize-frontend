'use client';

import { votePageUrl } from '@/lib/apis/public/dailyVote';
import { Crown, Download, Gift, Heart, Plus } from 'lucide-react';

// Same Free / Pro tag as ProductCard, so a design reads the same everywhere.
function TierBadge({ product }) {
  return product?.isFree === true ? (
    <span className='inline-flex shrink-0 items-center rounded-md border border-green-500 px-2.5 py-0.5 text-xs font-semibold text-green-600'>
      Free
    </span>
  ) : (
    <span className='inline-flex shrink-0 items-center gap-1 rounded-md bg-black px-2.5 py-1 text-xs font-semibold text-white'>
      <Crown size={11} className='fill-amber-400 text-amber-400' />
      Pro
    </span>
  );
}
import Image from 'next/image';
import Link from 'next/link';
import VoteButton from './VoteButton';
import VoteShareBar from './VoteShareBar';

const FALLBACK_IMG =
  'https://embroidize-assets.nyc3.cdn.digitaloceanspaces.com/image-not-found.png';

const RANK_STYLES = {
  1: 'bg-amber-400 text-amber-950 ring-amber-200',
  2: 'bg-gray-300 text-gray-800 ring-gray-100',
  3: 'bg-orange-300 text-orange-950 ring-orange-100',
};

function RankBadge({ rank }) {
  return (
    <span
      className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-extrabold ring-4 ${
        RANK_STYLES[rank] || 'bg-gray-100 text-gray-700 ring-white'
      }`}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}

function DesignImage({ product, priority = false }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className='relative block aspect-square w-full overflow-hidden rounded-2xl bg-white'
    >
      <Image
        src={product?.image?.url || FALLBACK_IMG}
        alt={product?.name || 'Embroidery design'}
        fill
        sizes='(max-width: 639px) 80vw, (max-width: 1023px) 45vw, 300px'
        className='object-contain p-2 transition-transform duration-300 hover:scale-105'
        priority={priority}
      />
    </Link>
  );
}

function Meta({ product, tier = true }) {
  return (
    <div className='flex items-start justify-between gap-2'>
      <MetaText product={product} />
      {tier && <TierBadge product={product} />}
    </div>
  );
}

function MetaText({ product }) {
  return (
    <div className='min-w-0'>
      <Link
        href={`/product/${product.slug}`}
        className='line-clamp-2 text-lg font-bold text-gray-900 hover:underline'
      >
        {product.name}
      </Link>
      {product?.category?.name && (
        <p className='text-sm font-medium text-gray-500'>
          {product.category.name}
        </p>
      )}
      {product?.sku_code && (
        <p className='text-xs text-gray-400'>SKU {product.sku_code}</p>
      )}
    </div>
  );
}

/** Today's free design (yesterday's winner). */
export function FreeTodayCard({ freeDesign }) {
  const p = freeDesign?.product;
  if (!p) return null;
  return (
    <div className='flex h-full flex-col gap-3 rounded-3xl border-2 border-green-300 bg-white p-4 shadow-sm'>
      <div className='flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-3 py-2'>
        <span className='flex items-center gap-1.5 text-sm font-extrabold uppercase tracking-wide text-amber-800'>
          <Crown className='h-4 w-4 text-amber-500' aria-hidden /> Today&apos;s
          free design
        </span>
        <span className='text-xs text-gray-500'>
          {freeDesign.source === 'votes'
            ? "Yesterday's winner"
            : freeDesign.source === 'admin'
              ? 'Our pick'
              : 'Free today'}
        </span>
      </div>
      <DesignImage product={p} priority />
      <div className='flex items-start justify-between gap-2'>
        <MetaText product={p} />
        <div className='flex shrink-0 flex-col items-end gap-1'>
          <span className='flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-extrabold text-green-800'>
            <Gift className='h-3.5 w-3.5' aria-hidden /> FREE TODAY
          </span>
          <span className='text-[11px] font-medium text-gray-500'>
            <TierBadge product={p} />
          </span>
        </div>
      </div>
      {freeDesign.source === 'votes' && freeDesign.votes > 0 && (
        <p className='text-xs text-gray-500'>
          Won with {freeDesign.votes} votes
        </p>
      )}
      <Link
        href={`/product/${p.slug}`}
        className='mt-auto inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 text-base font-bold text-black shadow-sm transition hover:bg-amber-500'
      >
        <Download className='h-5 w-5' aria-hidden /> Download Free
      </Link>
    </div>
  );
}

/** A design in today's race. */
export function VoteCard({ entry, highlight = false, showShare = true }) {
  const { product: p, rank, votes, percent } = entry;
  if (!p) return null;
  const leading = rank === 1 && votes > 0;
  return (
    <div
      id={`vote-${p.slug}`}
      className={`flex h-full flex-col gap-3 rounded-3xl border bg-white p-4 shadow-sm ${
        highlight ? 'border-amber-400 ring-4 ring-amber-200' : 'border-gray-100'
      }`}
    >
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          {rank ? (
            <RankBadge rank={rank} />
          ) : (
            <span className='text-xs font-semibold text-gray-400'>
              No votes yet
            </span>
          )}
          {leading && (
            <span className='flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold uppercase text-amber-800'>
              <Crown className='h-3.5 w-3.5 text-amber-500' aria-hidden />{' '}
              Leading
            </span>
          )}
        </div>
        <span className='flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-sm font-semibold text-gray-700'>
          <Heart className='h-4 w-4' aria-hidden /> {votes || 0}
        </span>
      </div>
      <DesignImage product={p} />
      <Meta product={p} />
      <div>
        <div className='mb-1 flex items-center justify-between text-sm'>
          <span className='font-bold text-gray-900'>
            {votes || 0} vote{votes === 1 ? '' : 's'}
          </span>
          <span className='font-semibold text-gray-500'>{percent || 0}%</span>
        </div>
        <div className='h-2.5 w-full overflow-hidden rounded-full bg-gray-100'>
          <div
            className='h-full rounded-full bg-amber-400 transition-all duration-700'
            style={{ width: `${Math.max(percent || 0, votes ? 3 : 0)}%` }}
          />
        </div>
      </div>
      {leading && (
        <p className='flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900'>
          <Crown className='h-3.5 w-3.5 shrink-0 text-amber-500' aria-hidden />{' '}
          If it stays #1, it&apos;ll be free tomorrow.
        </p>
      )}
      <div className='mt-auto flex items-center gap-2'>
        <div className='flex-1'>
          <VoteButton productId={p._id} productName={p.name} />
        </div>
        {showShare && <ShareDesignPopover product={p} />}
      </div>
    </div>
  );
}

// Small share menu on each card, so fans can rally votes for one design.
function ShareDesignPopover({ product }) {
  return (
    <details className='relative'>
      <summary
        className='flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50'
        aria-label={`Share ${product.name}`}
      >
        <i className='ri-share-forward-line text-xl' aria-hidden />
      </summary>
      <div className='absolute bottom-14 right-0 z-30 w-max rounded-2xl border bg-white p-3 shadow-xl'>
        <p className='mb-2 text-xs font-semibold text-gray-600'>
          Ask friends to vote for this one
        </p>
        <VoteShareBar
          compact
          url={votePageUrl(product.slug)}
          text={`Help make "${product.name}" FREE tomorrow! Vote here 👉`}
        />
      </div>
    </details>
  );
}

/** Placeholder when fewer designs than slots have votes yet. */
export function EmptyVoteSlot({ rank }) {
  return (
    <div className='flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-6 text-center'>
      {rank && <RankBadge rank={rank} />}
      <p className='text-base font-bold text-gray-800'>
        Your favourite could be here
      </p>
      <p className='text-sm text-gray-500'>
        Open any premium design and tap Vote. The most-voted design is free
        tomorrow.
      </p>
      <Link
        href='/free-design-vote#vote-any-design'
        className='inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white hover:bg-gray-800'
      >
        <Plus className='h-4 w-4' aria-hidden /> Pick a design
      </Link>
    </div>
  );
}
