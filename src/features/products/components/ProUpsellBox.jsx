'use client';

import {
  planDailyLimit,
  upgradePlans,
} from '@/components/Common/UpgradePlanPicker';
import { formatDesignCount } from '@/lib/hooks/useUpgradeOffer';
import { money, planTerm } from '@/lib/subscriptions/planPricing';
import { CrownIcon } from 'lucide-react';

/**
 * Everything the Pro box says, derived from the live plans + catalogue size.
 * Nothing is hard-coded: a price or daily limit changed in admin shows here on
 * the next render. Unknown values are left out rather than guessed.
 */
export function buildProOffer(plans = [], totalDesigns = null) {
  const recurring = upgradePlans(plans);
  const yearly = recurring.find((p) => planTerm(p) === 'year');
  const monthly = recurring.find((p) => planTerm(p) === 'month');
  const lead = yearly || monthly || recurring[0] || null;

  let headline = null;
  let suffix = '';
  let billing = null;

  if (yearly && Number(yearly.price) > 0) {
    headline = `$${(Number(yearly.price) / 12).toFixed(2)}`;
    suffix = '/month';
    billing = `billed ${money(yearly.price)} a year`;
    if (monthly && Number(monthly.price) > 0) {
      billing += ` · or ${money(monthly.price)} monthly`;
    }
  } else if (lead && Number(lead.price) > 0) {
    const term = planTerm(lead);
    headline = money(lead.price);
    suffix = term === 'week' ? '/week' : '/month';
    billing = `billed ${term === 'week' ? 'weekly' : 'monthly'} · cancel anytime`;
  }

  const designCount = formatDesignCount(totalDesigns);
  const perDay = lead ? planDailyLimit(lead) : null;
  const parts = [
    designCount
      ? `Get this design + ${designCount.replace(/\+$/, '')} more`
      : 'Get this design + the full library',
    perDay != null ? `${perDay} downloads a day` : null,
  ].filter(Boolean);

  return { headline, suffix, billing, perks: parts.join(' · ') };
}

export default function ProUpsellBox({ plans, totalDesigns, onGetAccess }) {
  const offer = buildProOffer(plans, totalDesigns);

  return (
    <div className='rounded-2xl border border-amber-100 bg-[#fdf6e7] p-5 sm:p-6'>
      <p className='text-sm font-semibold text-neutral-700'>
        Included with Embroidize Pro
      </p>

      {offer.headline && (
        <p className='mt-2 flex items-baseline gap-1 text-neutral-900'>
          <span className='text-4xl font-extrabold tracking-tight'>
            {offer.headline}
          </span>
          <span className='text-lg font-semibold'>{offer.suffix}</span>
        </p>
      )}
      {offer.billing && (
        <p className='mt-1 text-sm text-neutral-500'>{offer.billing}</p>
      )}

      <button
        type='button'
        onClick={onGetAccess}
        className='mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-neutral-900 text-lg font-semibold text-white transition-colors hover:bg-black'
      >
        <CrownIcon
          size={22}
          fill='#F59E0B'
          color='#F59E0B'
          strokeWidth={1.8}
          aria-hidden
        />
        Download with Pro
      </button>

      <p className='mt-3 text-center text-sm text-neutral-500'>{offer.perks}</p>
    </div>
  );
}
