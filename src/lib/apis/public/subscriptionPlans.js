import { getPlanOffer, planTerm } from '@/lib/subscriptions/planPricing';

// Public subscription plans — the same payload the /subscriptions page reads
// (GET /public/subscriptions), so a landing page can print real prices instead
// of numbers typed into a mockup. Before this existed the two landing pages
// hard-coded $99.99 and $79.99 a year while the live plan was $49.99.
//
// How that data is WORDED (discount badge, struck price, per-month framing of a
// yearly plan) lives in lib/subscriptions/planPricing, shared with the
// subscriptions page. This file is only about fetching and ordering.
//
// Uncached, for the same reason getSiteConfig() is uncached: this is money.
// A cached page advertising last week's price is a promise the checkout will
// not honour. The routes that call this render per request as a result.
//
// EMPTY, NOT ASSUMED: when the API cannot be read the list comes back empty and
// callers render their "see the plans" fallback. No price shown is recoverable;
// a wrong price is not.
export async function getSubscriptionPlans() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/public/subscriptions`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const result = await res.json();
    const plans = result?.data?.plans ?? [];
    return Array.isArray(plans) ? plans : [];
  } catch (error) {
    // Next signals "this route cannot be static" by THROWING out of the fetch;
    // swallowing that would be catching the framework's own control flow.
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('Error fetching subscription plans:', error);
    return [];
  }
}

/* Shortest commitment first, one-time last. The /subscriptions page sorts
   year-first because its yearly card is the hero; the landing designs put the
   flexible plan on the left and the badged best-value plan on the right, which
   is this order. */
const TERM_ORDER = ['week', 'month', 'year', 'one-time'];

export function sortPlansForLanding(plans) {
  return [...plans].sort(
    (a, b) => TERM_ORDER.indexOf(planTerm(a)) - TERM_ORDER.indexOf(planTerm(b)),
  );
}

/* The card that carries the "Best Value" badge — the same card the
   /subscriptions page marks "Most Popular": the yearly plan, or failing that
   whatever the API says saves the most. Null when nothing qualifies, rather
   than badging an arbitrary card. */
export function bestValuePlanId(plans) {
  const yearly = plans.find((plan) => planTerm(plan) === 'year');
  if (yearly) return yearly._id;

  const bySaving = [...plans].sort(
    (a, b) =>
      Number(getPlanOffer(b).savings || 0) -
      Number(getPlanOffer(a).savings || 0),
  );
  return Number(getPlanOffer(bySaving[0] ?? {}).savings) > 0
    ? bySaving[0]._id
    : null;
}

/* Whole-percent saving of the yearly plan against twelve monthly payments.
   Null unless both plans exist and the yearly one is genuinely cheaper — the
   page then says nothing rather than printing a made-up discount.
   NOTE: this is NOT plan.savePercent, which is the discount against the
   anchor/"was" price and is a much bigger number. */
export function yearlySavingPercent(plans) {
  const monthly = plans.find((plan) => planTerm(plan) === 'month');
  const yearly = plans.find((plan) => planTerm(plan) === 'year');
  if (!monthly || !yearly) return null;

  const twelveMonths = Number(monthly.price) * 12;
  const yearlyPrice = Number(yearly.price);
  if (!Number.isFinite(twelveMonths) || !Number.isFinite(yearlyPrice)) {
    return null;
  }
  if (twelveMonths <= 0 || yearlyPrice >= twelveMonths) return null;

  return Math.round((1 - yearlyPrice / twelveMonths) * 100);
}
