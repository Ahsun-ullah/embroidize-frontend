'use client';

import { getDailyVoteStanding, votePageUrl } from '@/lib/apis/public/dailyVote';
import { Crown } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import VoteButton from './VoteButton';
import VoteShareBar from './VoteShareBar';

// On a design's own page: "Vote to make this free tomorrow", its votes and
// place today, and a share menu. Renders nothing for designs that cannot be
// voted for (already free) or when the vote is switched off.
export default function DesignVotePanel({ product, standing: initial = null }) {
  const [standing, setStanding] = useState(initial);
  useEffect(() => {
    if (initial || !product?._id) return;
    getDailyVoteStanding(product._id).then(setStanding);
  }, [product?._id, initial]);

  if (!standing?.enabled || !standing.canBeVoted) return null;

  const onVoted = (data) => {
    if (data) setStanding((s) => ({ ...s, ...data }));
  };

  return (
    <div className='rounded-2xl border border-amber-200 bg-amber-50/60 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <p className='flex items-center gap-1.5 text-sm font-extrabold text-amber-900'>
            <Crown className='h-4 w-4 text-amber-500' aria-hidden /> Want this
            design free?
          </p>
          <p className='mt-0.5 text-xs text-amber-900/80'>
            The most-voted design today is free for everyone tomorrow.{' '}
            <Link href='/free-design-vote' className='font-semibold underline'>
              See today&apos;s race
            </Link>
          </p>
        </div>
        <div className='shrink-0 text-right'>
          <p className='text-lg font-extrabold text-gray-900'>
            {standing.votes || 0}
          </p>
          <p className='text-[11px] font-medium text-gray-500'>
            {standing.rank ? `votes · #${standing.rank} today` : 'votes today'}
          </p>
        </div>
      </div>
      <div className='mt-3'>
        <VoteButton
          productId={product._id}
          productName={product.name}
          onVoted={onVoted}
        />
      </div>
      <VoteShareBar
        compact
        className='mt-3 justify-center'
        url={votePageUrl(product.slug)}
        text={`Help make "${product.name}" FREE tomorrow! Vote here 👉`}
      />
    </div>
  );
}
