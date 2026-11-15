'use client';

import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { endsLabel, offerLine } from '@/lib/offers/format';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOfferAudience } from './useOfferAudience';

/**
 * Top of the account pages for logged-in FREE users:
 * "{first name}, your Black Friday Plan is waiting: 1 year of Pro for …".
 */
export default function OfferDashboardBanner() {
  const pathname = usePathname() || '';
  const offer = useCurrentOffer('dashboardBanner');
  const audience = useOfferAudience(offer);
  if (!offer || !audience.ready || !audience.loggedIn || !audience.isFree || !audience.canBuy) return null;
  // Not on the custom-order area: that is a support conversation, not a sale.
  if (pathname.startsWith('/user/custom-order')) return null;

  const who = audience.firstName ? `${audience.firstName}, your` : 'Your';
  return (
    <div className='container mx-auto max-w-7xl px-4 pt-4'>
      <Link
        href={offer.landingPath}
        prefetch={false}
        className='group flex flex-col gap-2 rounded-2xl bg-black px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between'
      >
        <span className='text-sm sm:text-base'>
          <span className='font-bold'>
            {who} <span className='text-[#E8C26A]'>{offer.name}</span> is waiting:
          </span>{' '}
          <span className='text-white/80'>{offerLine(offer)}</span>
          <span className='text-white/50'> · {endsLabel(offer)}</span>
        </span>
        <span className='inline-flex shrink-0 items-center gap-1 font-semibold text-[#E8C26A]'>
          See the offer
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' aria-hidden />
        </span>
      </Link>
    </div>
  );
}
