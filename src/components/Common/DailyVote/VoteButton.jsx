'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { castDailyVote, useMyDailyVote } from '@/lib/hooks/useDailyVote';
import { bumpDailyVoteCount } from '@/lib/hooks/useDailyVoteCounts';
import { Check, Heart } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

// The one Vote button every surface uses. Handles the four states:
// logged out (sends them to log in and back), not voted yet, voted for THIS
// design, and voted for another design today.
export default function VoteButton({
  productId,
  productName,
  onVoted,
  size = 'md',
  className = '',
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const { isLoggedIn, loaded, votedFor } = useMyDailyVote();
  const [busy, setBusy] = useState(false);

  const votedThis = votedFor && String(votedFor._id) === String(productId);
  const votedOther = votedFor && !votedThis;

  const handle = async () => {
    if (!isLoggedIn) {
      const back = `${pathname}${search?.toString() ? `?${search.toString()}` : ''}`;
      router.push(`/auth/login?pathName=${encodeURIComponent(back)}`);
      return;
    }
    if (votedFor || busy) return;
    setBusy(true);
    const res = await castDailyVote(productId);
    setBusy(false);
    if (res.ok) {
      SuccessToast(
        'Vote counted',
        `Thanks! If ${productName || 'this design'} finishes #1 today, it's free tomorrow.`,
        4000,
      );
      bumpDailyVoteCount(productId);
      onVoted?.(res.data);
      router.refresh();
    } else if (res.status === 401) {
      router.push(`/auth/login?pathName=${encodeURIComponent(pathname)}`);
    } else {
      ErrorToast('Vote not counted', res.message || 'Please try again.', 4000);
    }
  };

  const small = size === 'sm';
  const h =
    size === 'lg' ? 'h-14 text-lg' : small ? 'h-10 text-sm' : 'h-12 text-base';
  const base = `inline-flex w-full items-center justify-center gap-2 rounded-xl font-bold transition ${h} ${className}`;

  if (votedThis) {
    return (
      <button
        type='button'
        disabled
        className={`${base} cursor-default bg-green-100 text-green-800`}
      >
        <Check className='h-5 w-5' aria-hidden />{' '}
        {small ? 'Voted' : 'You voted for this today'}
      </button>
    );
  }
  if (votedOther) {
    return (
      <button
        type='button'
        disabled
        className={`${base} cursor-not-allowed bg-gray-100 text-gray-500`}
        title={`You voted for ${votedFor?.name || 'another design'} today`}
      >
        <Heart className='h-5 w-5' aria-hidden />{' '}
        {small ? 'Voted today' : 'Voted today · back tomorrow'}
      </button>
    );
  }
  return (
    <button
      type='button'
      onClick={handle}
      disabled={busy || (isLoggedIn && !loaded)}
      className={`${base} bg-amber-400 text-black shadow-sm hover:bg-amber-500 disabled:opacity-60`}
    >
      <Heart className='h-5 w-5' aria-hidden />
      {busy ? 'Voting…' : isLoggedIn || small ? 'Vote' : 'Log in to vote'}
    </button>
  );
}
