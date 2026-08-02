'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { formatDate } from '@/utils/functions/page';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Site-wide notice for the two states that need the customer to act.
//
// My Plan already explains both, but a lapsed subscriber doesn't visit My Plan —
// they go straight to a design and click Download. This is what makes the
// situation unmissable wherever they happen to be, so "nobody told me" is never
// true. Rendered from `accessState`, the same server-computed label the download
// gate enforces, so the banner can never contradict what actually happens.
//
// Silent for every other state: active, cancelling, lifetime and free users see
// nothing at all.
export default function SubscriptionStatusBanner() {
  const { data: userInfoData } = useUserInfoQuery();
  const router = useRouter();
  const [dismissed, setDismissed] = useState(false);

  const accessState = userInfoData?.accessState;
  const isExpired = accessState === 'expired';
  const isPaymentFailed = accessState === 'payment_failed';

  if (dismissed || (!isExpired && !isPaymentFailed)) return null;

  const planName = userInfoData?.subscription?.planId?.name || 'subscription';
  const endedOn = userInfoData?.subscriptionEndedAt;
  const graceEndsOn = userInfoData?.graceEndsAt;

  const message = isPaymentFailed
    ? `We couldn't take payment for your ${planName} plan. Your downloads still work${
        graceEndsOn ? ` until ${formatDate(graceEndsOn)}` : ''
      } — update your card to avoid interruption.`
    : `Your ${planName} plan ended${
        endedOn ? ` on ${formatDate(endedOn)}` : ''
      }. You're on the free plan — renew any time to get your full limits back.`;

  const ctaLabel = isPaymentFailed ? 'Update payment method' : 'Renew my plan';

  return (
    <div
      role='status'
      className='w-full border-b border-slate-200 bg-slate-900 text-white'
    >
      <div className='mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between '>
        <p className='text-sm leading-relaxed text-white'>
          <span aria-hidden className='mr-2'>
            ⚠️
          </span>
          {message}
        </p>

        <div className='flex shrink-0 items-center gap-2'>
          <button
            onClick={() => router.push('/user/my-plan')}
            className='rounded-lg bg-white px-4 py-2 text-xs font-bold text-slate-900 transition hover:bg-slate-100'
          >
            {ctaLabel}
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label='Dismiss notice'
            className='rounded-lg px-2 py-2 text-lg leading-none text-white/60 transition hover:text-white'
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
