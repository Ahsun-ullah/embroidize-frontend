// Every sentence a placement shows about an offer is built here from the
// offer's numbers, so the top bar, the pricing card, the pop-ups and the
// checkout can never disagree. Admin-typed copy (headline, badge, CTA) only
// ever surrounds these.

// Offer deadlines are stated in US Eastern time — that is what the emails say.
export const OFFER_TIMEZONE = 'America/New_York';

export const usd = (cents) => {
  const n = Number(cents) / 100;
  if (!Number.isFinite(n)) return '';
  return `$${n % 1 === 0 ? n.toFixed(0) : n.toFixed(2)}`;
};

const termWord = (interval) =>
  interval === 'year' ? '1 year' : interval === 'month' ? '1 month' : `1 ${interval || 'year'}`;

/** "Ends Dec 1" — the last day the offer can be bought, in US Eastern. */
export function endsLabel(offer) {
  if (!offer?.endsAt) return '';
  // endsAt is the first instant it is OVER (e.g. Dec 2 00:00 ET); the last
  // buyable day is one minute earlier.
  const last = new Date(new Date(offer.endsAt).getTime() - 60 * 1000);
  return `Ends ${last.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: OFFER_TIMEZONE,
  })}`;
}

/** "December 1 at 11:59 PM ET" — for FAQs and fine print. */
export function endsLong(offer) {
  if (!offer?.endsAt) return '';
  const last = new Date(new Date(offer.endsAt).getTime() - 60 * 1000);
  const day = last.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    timeZone: OFFER_TIMEZONE,
  });
  const time = last.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: OFFER_TIMEZONE,
  });
  return `${day} at ${time} ET`;
}

/** "+ 150 bonus credits" or "" */
export const bonusPhrase = (offer) =>
  offer?.bonusCredits > 0 ? ` + ${offer.bonusCredits} bonus credits` : '';

/** "1 year of Pro for $39.50 + 150 bonus credits" */
export function offerLine(offer) {
  if (!offer) return '';
  return `${termWord(offer.plan?.billingInterval)} of Pro for ${usd(offer.offerPriceCents)}${bonusPhrase(offer)}`;
}

/** "$3.29/mo" or "" */
export const perMonth = (offer) =>
  offer?.perMonthCents && offer.plan?.billingInterval === 'year'
    ? `${usd(offer.perMonthCents)}/mo`
    : '';

/** "Renews at $49.99/year after 12 months, cancel anytime." */
export function renewsLine(offer) {
  if (!offer) return '';
  const unit = offer.plan?.billingInterval || 'year';
  const after = unit === 'year' ? '12 months' : `the first ${unit}`;
  return `Renews at ${usd(offer.regularPriceCents)}/${unit} after ${after}, cancel anytime.`;
}

/** True while the offer can still be bought (client clock). */
export const isOfferOpen = (offer, now = Date.now()) =>
  !!offer &&
  (offer.phase === 'public' || offer.phase === 'early') &&
  new Date(offer.endsAt).getTime() > now;
