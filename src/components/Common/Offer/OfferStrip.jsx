'use client';

import { endsLabel, offerLine } from '@/lib/offers/format';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useOfferAudience } from './useOfferAudience';

// Same places the event strip stays out of.
const HIDDEN_PREFIXES = ['/admin', '/auth', '/custom-order-checkout', '/reset-password'];

/**
 * The offer's top bar: black with a gold accent so it reads as a different,
 * bigger event than the everyday promo strip. Not dismissible — it is one line,
 * and the whole point is that every page shows the same offer and end date.
 * Rendered by SiteTopBar, which decides between this, the account warning and
 * the seasonal event strip.
 */
export default function OfferStrip({ offer }) {
  const pathname = usePathname() || '';
  const audience = useOfferAudience(offer);
  if (!offer || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;
  if (!audience.ready || !audience.canBuy) return null;

  return (
    <div className='bg-black text-white'>
      <Link
        href={offer.landingPath}
        prefetch={false}
        className='group mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-sm'
      >
        <span className='font-medium'>
          <span aria-hidden>🖤 </span>
          <span className='font-bold text-[#E8C26A]'>{offer.name}:</span> {offerLine(offer)}
          <span className='text-white/70'> · {endsLabel(offer)}</span>
        </span>
        <ArrowRight
          className='h-4 w-4 text-[#E8C26A] transition-transform group-hover:translate-x-0.5'
          aria-hidden
        />
      </Link>
    </div>
  );
}
