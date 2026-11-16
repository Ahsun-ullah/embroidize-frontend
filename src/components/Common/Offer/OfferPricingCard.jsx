'use client';

import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { offerLine, perMonth, renewsLine, usd } from '@/lib/offers/format';
import { Check } from 'lucide-react';
import { OfferCountdownText } from './OfferCountdown';
import OfferCheckoutButton from './OfferCheckoutButton';
import { useOfferAudience } from './useOfferAudience';
import { offerSurfaceStyle } from '@/lib/offers/theme';

/**
 * The offer as a plan card on the pricing page. It sits ABOVE the regular plan
 * grid, full width, rather than squeezed in as a fifth column: the grid already
 * holds Free plus every paid term, and the offer is the one card that has to
 * win the eye.
 */
export default function OfferPricingCard() {
  const offer = useCurrentOffer('pricingCard');
  const audience = useOfferAudience(offer);
  if (!offer || !audience.ready || !audience.canBuy) return null;

  const perks = [
    offer.plan.dailyLimit ? `${offer.plan.dailyLimit} downloads a day, all year` : 'Daily downloads all year',
    offer.bonusCredits > 0
      ? `${offer.bonusCredits} bonus credits — they take over when your year ends, ${
          offer.bonusCreditsValidityDays ? `valid ${offer.bonusCreditsValidityDays} days` : 'and never expire'
        }`
      : null,
    'Every machine format (PES, DST, JEF, VP3, EXP, XXX …)',
    'Commercial use on physical products',
  ].filter(Boolean);

  return (
    <div className='mx-auto mb-10 max-w-5xl'>
      <div
        className='o-ring relative overflow-hidden rounded-3xl shadow-2xl'
        style={offerSurfaceStyle(offer)}
      >
        <div className='o-band flex items-center justify-center gap-2 px-6 py-2 text-xs font-extrabold uppercase tracking-wider'>
          {offer.badge || 'Best deal of the year'}
          <span className='font-semibold normal-case tracking-normal'>
            · ends in <OfferCountdownText endsAt={offer.endsAt} />
          </span>
        </div>
        <div className='grid gap-6 p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center'>
          <div>
            <h2 className='o-fg text-2xl font-extrabold sm:text-3xl'>{offer.name}</h2>
            <p className='o-muted mt-1'>{offerLine(offer)}</p>
            <ul className='mt-4 grid gap-2 text-sm sm:grid-cols-2'>
              {perks.map((p) => (
                <li key={p} className='flex items-start gap-2'>
                  <Check className='o-accent mt-0.5 h-4 w-4 shrink-0' aria-hidden />
                  <span className='o-fg'>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className='md:w-72 md:text-center'>
            <div className='flex items-baseline gap-2 md:justify-center'>
              <span className='o-fg text-5xl font-extrabold tracking-tight'>{usd(offer.offerPriceCents)}</span>
              {offer.savingsCents > 0 && (
                <span className='o-faint text-lg line-through'>{usd(offer.regularPriceCents)}</span>
              )}
            </div>
            <p className='o-faint mt-1 text-sm'>
              for 1 {offer.plan.billingInterval}
              {perMonth(offer) ? ` · just ${perMonth(offer)}` : ''}
            </p>
            <div className='mt-4'>
              <OfferCheckoutButton
                offer={offer}
                source='pricing_offer'
                className='o-btn flex h-12 w-full items-center justify-center rounded-xl text-base font-bold'
              >
                {offer.ctaLabel || `Get the ${offer.name}`}
              </OfferCheckoutButton>
            </div>
            <p className='o-faint mt-2 text-xs'>{renewsLine(offer)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
