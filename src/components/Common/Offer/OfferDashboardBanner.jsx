'use client';

import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { endsLabel, offerLine } from '@/lib/offers/format';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOfferAudience } from './useOfferAudience';
import { offerSurfaceStyle } from '@/lib/offers/theme';

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
        className='group flex flex-col gap-2 rounded-2xl px-5 py-4 sm:flex-row sm:items-center sm:justify-between'
        style={offerSurfaceStyle(offer)}
      >
        <span className='o-fg text-sm sm:text-base'>
          <span className='o-fg font-bold'>
            {who} <span className='o-accent'>{offer.name}</span> is waiting:
          </span>{' '}
          <span className='o-muted'>{offerLine(offer)}</span>
          <span className='o-faint'> · {endsLabel(offer)}</span>
        </span>
        <span className='o-accent inline-flex shrink-0 items-center gap-1 font-semibold'>
          See the offer
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-0.5' aria-hidden />
        </span>
      </Link>
    </div>
  );
}
