'use client';

import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { endsLabel } from '@/lib/offers/format';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useOfferAudience } from './useOfferAudience';
import { offerSurfaceStyle } from '@/lib/offers/theme';

const HIDDEN_PREFIXES = ['/admin', '/auth', '/custom-order-checkout', '/reset-password'];
const BAR_HEIGHT = '56px';

/**
 * Slim sticky bar at the bottom of phone screens. While it shows it publishes
 * its height as --offer-bar-h, which the WhatsApp button and the page bottom
 * padding read, so neither the floating button nor the footer ends up hidden
 * underneath it. The right edge is left clear for the Crisp chat bubble.
 */
export default function OfferMobileBar() {
  const pathname = usePathname() || '';
  const offer = useCurrentOffer('mobileBar');
  const audience = useOfferAudience(offer);
  const onLanding = offer && pathname === offer.landingPath;
  const show =
    !!offer &&
    audience.ready &&
    audience.canBuy &&
    !onLanding &&
    !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 767px)');
    const apply = () => root.style.setProperty('--offer-bar-h', show && mobile.matches ? BAR_HEIGHT : '0px');
    apply();
    mobile.addEventListener('change', apply);
    return () => {
      mobile.removeEventListener('change', apply);
      root.style.setProperty('--offer-bar-h', '0px');
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className='o-border fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t pl-4 pr-20 md:hidden'
      style={{ ...offerSurfaceStyle(offer), height: BAR_HEIGHT }}
    >
      <p className='o-fg min-w-0 flex-1 truncate text-sm'>
        <span className='o-accent font-bold'>{offer.name}</span>
        <span className='o-muted'> · {endsLabel(offer)}</span>
      </p>
      <Link
        href={offer.landingPath}
        prefetch={false}
        className='o-btn shrink-0 rounded-full px-4 py-1.5 text-sm font-bold'
      >
        Get it
      </Link>
    </div>
  );
}
