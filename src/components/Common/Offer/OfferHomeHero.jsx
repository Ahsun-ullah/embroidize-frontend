'use client';

import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { bonusPhrase, offerLine, perMonth, usd } from '@/lib/offers/format';
import { ArrowRight } from 'lucide-react';
import { offerSurfaceStyle } from '@/lib/offers/theme';
import Link from 'next/link';
import OfferCountdownTiles from './OfferCountdown';
import { useOfferAudience } from './useOfferAudience';

/**
 * Homepage banner above the categories, with a live countdown. Built from the
 * offer's numbers (unlike event posters, whose words are baked into an image),
 * so the price here is always the price at checkout.
 */
export default function OfferHomeHero() {
  const offer = useCurrentOffer('homeHero');
  const audience = useOfferAudience(offer);
  if (!offer || !audience.ready || !audience.canBuy) return null;

  return (
    <section className='container mx-auto max-w-7xl px-4 pt-6'>
      <div
        className='relative overflow-hidden rounded-3xl px-6 py-8 shadow-xl sm:px-10 sm:py-10'
        style={offerSurfaceStyle(offer)}
      >
        {/* Thin accent rule along the top edge — the only decoration. */}
        <div aria-hidden className='o-rule absolute inset-x-0 top-0 h-1' />
        <div className='flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-2xl'>
            <p className='o-accent text-xs font-bold uppercase tracking-[0.2em]'>
              {offer.name}
            </p>
            <h2 className='o-fg mt-2 text-3xl font-extrabold leading-tight sm:text-4xl'>
              {offer.headline || 'Our biggest offer of the year'}
            </h2>
            <p className='o-muted mt-3 text-base sm:text-lg'>
              {offerLine(offer)}
              {perMonth(offer) && <span className='o-faint'> ({perMonth(offer)})</span>}
            </p>
            {offer.savingsCents > 0 && (
              <p className='o-faint mt-1 text-sm'>
                Save {usd(offer.savingsCents)} on the first year{bonusPhrase(offer) ? ', plus the bonus credits' : ''}.
              </p>
            )}
          </div>
          <div className='flex flex-col items-start gap-4 lg:items-end'>
            <OfferCountdownTiles endsAt={offer.endsAt} tone='theme' />
            <Link
              href={offer.landingPath}
              prefetch={false}
              className='o-btn group inline-flex items-center gap-2 rounded-full px-6 py-3 text-base font-bold'
            >
              {offer.ctaLabel || `Get the ${offer.name}`}
              <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-0.5' aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
