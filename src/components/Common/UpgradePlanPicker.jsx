'use client';

import { bestValuePlanId } from '@/lib/apis/public/subscriptionPlans';
import {
  getPlanPricing,
  money,
  planTerm,
} from '@/lib/subscriptions/planPricing';
import { startSubscriptionCheckout } from '@/lib/subscriptions/startCheckout';
import { ArrowRight, Check } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

// Yearly first: it is the pre-selected "Best Value" card in the design.
const TERM_ORDER = ['year', 'month', 'week'];

const TRUST_TICKS = [
  'Instant download',
  'PES, DST, JEF, VP3 & more',
  'Cancel anytime',
];

/** Downloads a day a plan allows, or null when it has no daily cap. */
export function planDailyLimit(plan) {
  if (plan?.dailyLimit != null) return plan.dailyLimit;
  if (plan?.downloadLimit != null) return plan.downloadLimit;
  return null;
}

/** Recurring plans only, in the order the picker shows them. */
export function upgradePlans(plans = []) {
  return plans
    .filter((plan) => planTerm(plan) !== 'one-time')
    .sort(
      (a, b) =>
        TERM_ORDER.indexOf(planTerm(a)) - TERM_ORDER.indexOf(planTerm(b)),
    );
}

function planSubline(plan) {
  const perDay = planDailyLimit(plan);
  const daily =
    perDay != null ? `${perDay} downloads a day` : 'Unlimited downloads';
  const term = planTerm(plan);
  if (term === 'year')
    return `${daily} · billed ${money(plan.price)} once a year`;
  if (term === 'week') return `${daily} · billed weekly · cancel anytime`;
  return `${daily} · cancel anytime`;
}

/**
 * Plan radio cards + checkout CTA for the free-plan upsell, shared by the
 * Download Limit popup and the My Plan page.
 *
 * Picking a card selects it; the CTA then goes straight to that plan's gateway
 * checkout through startSubscriptionCheckout — the same request and the same
 * `subscription_checkout` GTM event as the /subscriptions page and the landing
 * pages. A logged-out visitor is sent to login first (handled there too).
 *
 * When no plan can be bought online (API unreadable, gateway off, plan not
 * mapped) the CTA links to /subscriptions, which has the other ways to pay.
 */
export default function UpgradePlanPicker({
  plans = [],
  ctaLabel = 'Upgrade to Pro',
  showTrust = true,
}) {
  const router = useRouter();
  const pathName = usePathname();
  const ordered = useMemo(() => upgradePlans(plans), [plans]);
  const bestId = useMemo(() => bestValuePlanId(ordered), [ordered]);

  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  // Pre-select the best-value plan once the plans arrive.
  useEffect(() => {
    if (!selectedId && ordered.length) {
      setSelectedId(bestId ?? ordered[0]._id);
    }
  }, [ordered, bestId, selectedId]);

  const selected = ordered.find((plan) => plan._id === selectedId) ?? null;

  // Same purchasability rule as PurchaseButton / PlanCheckoutButton.
  const purchasable =
    !!selected &&
    !(
      selected.purchasable === false ||
      (selected.purchasable == null && !selected.stripePriceId)
    );

  const handleCheckout = async () => {
    if (!purchasable) {
      router.push('/subscriptions');
      return;
    }
    setBusy(true);
    try {
      await startSubscriptionCheckout(selected, pathName);
      // Leaving the page — keep the button disabled until it goes.
    } catch (err) {
      console.error('Checkout error:', err);
      window.location.href = '/subscriptions';
    }
  };

  const ctaClass =
    'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 text-[15px] font-semibold text-white shadow-sm transition hover:bg-pink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80';

  return (
    <div>
      {ordered.length > 0 && (
        <div role='radiogroup' aria-label='Choose a plan' className='space-y-3'>
          {ordered.map((plan) => {
            const isSelected = plan._id === selectedId;
            const isBest = plan._id === bestId;
            const pricing = getPlanPricing(plan);

            return (
              <button
                key={plan._id}
                type='button'
                role='radio'
                aria-checked={isSelected}
                onClick={() => setSelectedId(plan._id)}
                className={`relative flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 ${
                  isSelected
                    ? 'border-pink-600 bg-pink-50/60'
                    : 'border-slate-200 bg-white hover:border-pink-300'
                }`}
              >
                {isBest && (
                  <span className='absolute -top-2.5 left-3 rounded-full bg-pink-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white'>
                    Best value
                  </span>
                )}

                <span
                  aria-hidden
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-pink-600' : 'border-slate-300'
                  }`}
                >
                  {isSelected && (
                    <span className='h-2.5 w-2.5 rounded-full bg-pink-600' />
                  )}
                </span>

                <span className='min-w-0 flex-1'>
                  <span className='block text-[15px] font-bold text-slate-900'>
                    {plan.name}
                  </span>
                  <span className='block text-xs leading-snug text-slate-500'>
                    {planSubline(plan)}
                  </span>
                </span>

                <span className='shrink-0 text-right'>
                  <span
                    className={`block text-xl font-extrabold tabular-nums ${
                      isSelected ? 'text-pink-600' : 'text-slate-900'
                    }`}
                  >
                    {money(pricing.headlinePrice)}
                    {pricing.headlineSuffix && (
                      <span className='text-xs font-semibold text-slate-500'>
                        {pricing.headlineSuffix}
                      </span>
                    )}
                  </span>
                  <span className='block text-[11px] font-medium text-slate-500'>
                    Save {plan?.savePercent || 0}%
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <div className={ordered.length > 0 ? 'mt-4' : ''}>
        {ordered.length > 0 ? (
          <button
            type='button'
            onClick={handleCheckout}
            disabled={busy}
            aria-busy={busy}
            className={ctaClass}
          >
            {busy ? 'Opening checkout…' : ctaLabel}
            {!busy && <ArrowRight className='h-4 w-4' aria-hidden />}
          </button>
        ) : (
          <Link href='/subscriptions' className={ctaClass}>
            See Pro plans
            <ArrowRight className='h-4 w-4' aria-hidden />
          </Link>
        )}
      </div>

      {showTrust && (
        <ul className='mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs text-slate-600'>
          {TRUST_TICKS.map((tick) => (
            <li key={tick} className='flex items-center gap-1'>
              <Check className='h-3.5 w-3.5 text-green-600' aria-hidden />
              {tick}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
