'use client';

import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { endsLabel, offerLine } from '@/lib/offers/format';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useOfferAudience } from './useOfferAudience';

const HIDDEN_PREFIXES = ['/admin', '/auth', '/custom-order-checkout', '/reset-password', '/user'];
const seenKey = (id) => `offer-exit-seen:${id}`;
// Don't ambush someone who just arrived.
const MIN_TIME_ON_SITE_MS = 8000;

/**
 * "Wait! The offer ends …" — free visitors only, at most ONCE per visit
 * (sessionStorage), on desktop when the pointer leaves through the top of the
 * window (heading for the tab bar or the back button). Phones have no such
 * signal; they get the sticky bottom bar instead.
 */
export default function OfferExitPopup() {
  const pathname = usePathname() || '';
  const offer = useCurrentOffer('exitPopup');
  const audience = useOfferAudience(offer);
  const [open, setOpen] = useState(false);
  const armedAt = useRef(Date.now());

  const eligible =
    !!offer &&
    audience.ready &&
    audience.isFree &&
    audience.canBuy &&
    pathname !== offer.landingPath &&
    !HIDDEN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!eligible) return undefined;
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    try {
      if (sessionStorage.getItem(seenKey(offer._id))) return undefined;
    } catch {
      // Storage blocked: still fine to show once for this page.
    }
    const onLeave = (e) => {
      if (e.clientY > 0 || e.relatedTarget) return;
      if (Date.now() - armedAt.current < MIN_TIME_ON_SITE_MS) return;
      try {
        sessionStorage.setItem(seenKey(offer._id), '1');
      } catch {
        // ignore
      }
      setOpen(true);
      document.removeEventListener('mouseout', onLeave);
    };
    document.addEventListener('mouseout', onLeave);
    return () => document.removeEventListener('mouseout', onLeave);
  }, [eligible, offer?._id]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || !offer) return null;

  return (
    <div
      className='fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={() => setOpen(false)}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='offer-exit-title'
        onClick={(e) => e.stopPropagation()}
        className='relative w-full max-w-md overflow-hidden rounded-3xl bg-black p-7 text-center text-white shadow-2xl ring-1 ring-[#E8C26A]/50'
      >
        <button
          type='button'
          onClick={() => setOpen(false)}
          aria-label='Close'
          className='absolute right-3 top-3 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white'
        >
          <X className='h-4 w-4' aria-hidden />
        </button>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-[#E8C26A]'>Wait!</p>
        <h2 id='offer-exit-title' className='mt-2 text-2xl font-extrabold'>
          The {offer.name} {endsLabel(offer).replace(/^Ends/, 'ends')}
        </h2>
        <p className='mt-3 text-white/80'>{offerLine(offer)}</p>
        <Link
          href={offer.landingPath}
          prefetch={false}
          onClick={() => setOpen(false)}
          className='mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#E8C26A] font-bold text-black transition hover:bg-[#F0D088]'
        >
          See the offer
        </Link>
        <button
          type='button'
          onClick={() => setOpen(false)}
          className='mt-3 text-sm text-white/50 underline underline-offset-2 hover:text-white/80'
        >
          No thanks
        </button>
      </div>
    </div>
  );
}
