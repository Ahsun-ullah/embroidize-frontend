'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { castDailyVote, useMyDailyVote } from '@/lib/hooks/useDailyVote';
import {
  bumpDailyVoteCount,
  useDailyVoteCount,
} from '@/lib/hooks/useDailyVoteCounts';
import { Check, Gift, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

// The vote row on a product card: vote straight from a listing, without
// opening the design. Premium designs only. Today's winner shows "Free today"
// instead. Renders nothing while the vote is off or the counts haven't loaded.
export default function CardVoteButton({
  productId,
  productName,
  productSlug,
  isFreeTier,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { ready, enabled, votes, isFreeToday } = useDailyVoteCount(productId);
  const { isLoggedIn, loaded, votedFor } = useMyDailyVote();
  const [busy, setBusy] = useState(false);

  if (!ready || !enabled) return null;

  if (isFreeToday) {
    return (
      <Link
        href={`/product/${productSlug}`}
        className='flex items-center justify-center gap-1.5 rounded-xl bg-green-100 px-3 py-2 text-xs font-extrabold text-green-800 hover:bg-green-200'
      >
        <Gift className='h-4 w-4' aria-hidden /> FREE TODAY · won the vote
      </Link>
    );
  }
  if (isFreeTier) return null;

  const votedThis = votedFor && String(votedFor._id) === String(productId);
  const votedOther = votedFor && !votedThis;

  const vote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      router.push(`/auth/login?pathName=${encodeURIComponent(pathname)}`);
      return;
    }
    if (votedFor || busy) return;
    setBusy(true);
    const res = await castDailyVote(productId);
    setBusy(false);
    if (res.ok) {
      bumpDailyVoteCount(productId);
      SuccessToast(
        'Vote counted',
        `If ${productName || 'this design'} finishes #1 today, it's free tomorrow.`,
        4000,
      );
    } else if (res.status === 401) {
      router.push(`/auth/login?pathName=${encodeURIComponent(pathname)}`);
    } else {
      ErrorToast('Vote not counted', res.message || 'Please try again.', 4000);
    }
  };

  return (
    <div className='flex items-center justify-between gap-2 rounded-xl bg-amber-50 py-1.5 pl-3 pr-1.5'>
      <span
        className='flex items-center gap-1 text-xs font-semibold text-amber-900'
        title='Votes today. The most-voted design is free tomorrow.'
      >
        <Heart
          className='h-3.5 w-3.5 fill-amber-400 text-amber-500'
          aria-hidden
        />
        {votes} vote{votes === 1 ? '' : 's'} today
      </span>
      {votedThis ? (
        <span className='inline-flex items-center gap-1 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-bold text-green-800'>
          <Check className='h-3.5 w-3.5' aria-hidden /> Voted
        </span>
      ) : (
        <button
          type='button'
          onClick={vote}
          disabled={busy || votedOther || (isLoggedIn && !loaded)}
          title={
            votedOther
              ? `You voted for ${votedFor?.name || 'another design'} today`
              : 'Vote to make this free tomorrow'
          }
          className='inline-flex items-center gap-1 rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-black hover:bg-amber-500 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500'
        >
          <Heart className='h-3.5 w-3.5' aria-hidden />
          {busy ? 'Voting…' : votedOther ? 'Voted today' : 'Vote'}
        </button>
      )}
    </div>
  );
}
