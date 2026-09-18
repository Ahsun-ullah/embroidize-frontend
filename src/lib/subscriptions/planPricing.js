/* Plan pricing presentation — the single source of truth for how a subscription
 * plan's money is worded.
 *
 * This used to live inside SubscriptionsPageClient. It was lifted out when the
 * two landing pages (/holiday-embroidery-designs, /embroidery-subscription)
 * started rendering the same plans: the discount badge, the struck-through
 * "was" price and the per-month framing of a yearly plan are the offer, and an
 * offer that reads differently on the page that sold it and the page that
 * closes it is worse than no offer at all.
 *
 * Everything here is pure — no JSX — so server and client components can both
 * use it. The subscriptions page adds its own icon on top.
 */

/* Money with cents only when they exist ($149, $4.99). */
export const money = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  return Number.isInteger(v) ? `$${v}` : `$${v.toFixed(2)}`;
};

/* 'one-time' | 'year' | 'month' | 'week' — a plan with no billingInterval is
   a one-time purchase. */
export function planTerm(plan) {
  const interval = (plan?.billingInterval || '').toLowerCase();
  if (!interval) return 'one-time';
  if (interval.startsWith('year')) return 'year';
  if (interval.startsWith('week')) return 'week';
  return 'month';
}

/* The offer, when the plan document does not carry an explicit originalPrice:
   savePercent is the discount against the anchor price, so the anchor is what
   the price would have been before it. */
export function getStaticDefaults(plan) {
  let savePercent = 0;

  if (plan?.billingInterval === null) savePercent = plan?.savePercent ?? '';
  else if (plan?.billingInterval === 'year')
    savePercent = plan?.savePercent ?? '';
  else if (plan?.billingInterval === 'month')
    savePercent = plan?.savePercent ?? '';

  const originalPrice = (Number(plan.price) / (1 - savePercent / 100)).toFixed(
    2,
  );

  return {
    savePercent,
    originalPrice: Number(originalPrice),
  };
}

/* ---------- Derive display info from billingInterval ----------
   Yearly plans are quoted as a per-month equivalent with the full term total
   underneath, because "$4.99/mo" beside the monthly plan's "$9.99/mo" is the
   only presentation that lets someone compare the two at a glance. The
   strikethrough price is divided by the same term so both stay in one unit.

   renewNote always quotes plan.price, never originalPrice: the gateway charges
   the same amount on renewal, so a higher "renews at" figure would be a price
   we never actually bill. */
export function getPlanPricing(plan, originalPrice) {
  const term = planTerm(plan);
  const price = Number(plan.price) || 0;
  const orig = originalPrice != null ? Number(originalPrice) : null;

  if (term === 'one-time') {
    return {
      term,
      tagline: 'Pay once, yours forever',
      pill: 'One-time payment',
      headlinePrice: price,
      headlineSuffix: '',
      strikePrice: orig,
      termTotalLine: null,
      renewNote: 'One-time payment — this never renews',
      renewsCell: 'Never',
      billingCell: 'One-time',
      ctaTitle: `Get ${plan.name}`,
    };
  }
  if (term === 'year') {
    return {
      term,
      tagline: 'Best value — our lowest monthly rate',
      pill: 'Billed yearly',
      headlinePrice: price / 12,
      headlineSuffix: '/mo',
      strikePrice: orig != null ? orig / 12 : null,
      termTotalLine: `Get 12 months for ${money(price)}`,
      renewNote: `Renews at ${money(price)}/year · cancel anytime`,
      renewsCell: 'Yearly',
      billingCell: 'Billed yearly',
      ctaTitle: `Choose ${plan.name}`,
    };
  }
  if (term === 'week') {
    return {
      term,
      tagline: 'Short commitment, full access',
      pill: 'Billed weekly',
      headlinePrice: price,
      headlineSuffix: '/wk',
      strikePrice: orig,
      termTotalLine: null,
      renewNote: `Renews at ${money(price)}/week · cancel anytime`,
      renewsCell: 'Weekly',
      billingCell: 'Billed weekly',
      ctaTitle: `Choose ${plan.name}`,
    };
  }
  return {
    term,
    tagline: 'Flexible — stop whenever you like',
    pill: 'Billed monthly',
    headlinePrice: price,
    headlineSuffix: '/mo',
    strikePrice: orig,
    termTotalLine: null,
    renewNote: `Renews at ${money(price)}/month · cancel anytime`,
    renewsCell: 'Monthly',
    billingCell: 'Billed monthly',
    ctaTitle: `Choose ${plan.name}`,
  };
}

/* Everything a card needs to show the offer, in one call: the percentage, the
   "was" price and whether striking it is honest.

   Only strike a price that is actually higher than the one we charge. A
   savePercent of 0 makes originalPrice === price, which used to render
   "$9.99 $9.99" with the second one crossed out. */
export function getPlanOffer(plan) {
  const staticVals = getStaticDefaults(plan);
  const savings = plan.savePercent ?? staticVals.savePercent;
  const originalPrice = plan.originalPrice ?? staticVals.originalPrice;
  const pricing = getPlanPricing(plan, originalPrice);

  return {
    ...pricing,
    savings,
    originalPrice,
    showStrike:
      Number(savings) > 0 &&
      pricing.strikePrice != null &&
      pricing.strikePrice > pricing.headlinePrice,
  };
}

/* True when at least one plan is actually discounted — the countdown bar is a
   lie next to undiscounted prices. */
export function hasLiveOffer(plans = []) {
  return plans.some((plan) => Number(getPlanOffer(plan).savings) > 0);
}
