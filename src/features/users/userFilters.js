// Filters for the admin Users page. They live in the URL (so a filtered view
// survives refresh and can be shared) and are passed to GET /all-users as-is.
// Shared by the server page (first load) and the client wrapper (export).

// Behaviour filters, all thresholds typed by the admin and computed live from
// the download log. `window` (days, default 30) applies to winMin..freeMin.
export const BEHAVIOUR_FILTER_KEYS = [
  'window',
  'winMin', // downloads in window
  'winMax',
  'daysMin', // distinct download days in window
  'daysMax',
  'freeMin', // free-tier downloads in window
  'inactiveDays', // downloaded before, nothing in the last N days
  'everDownloaded', // yes | no
  'subState', // active | cancelling | payment_failed | lapsed | never
  // Tracked behaviour (same window, capped at the 180 days events are kept)
  'viewsMin', // design page views
  'pricingMin', // pricing page visits
  'limitHitsMin', // downloads refused by a limit
  'premiumMin', // premium designs refused to a free user
  'checkout', // started | abandoned | completed | none
  'notSeenDays', // not on the site for N days
  'marketing', // emailable | opted_in | opted_out | not_asked | unsubscribed
];

export const USER_FILTER_KEYS = [
  'search',
  'plan', // free | premium
  'planId',
  'provider', // local | google | apple
  'verified', // yes | no
  'credits', // has | ever | never
  'country',
  'activeWithin', // days
  'minDownloads',
  'maxDownloads',
  'startDate',
  'endDate',
  'sort', // newest | oldest
  'blocked', // '1' = blocked users only
  ...BEHAVIOUR_FILTER_KEYS,
];

// searchParams may be a plain object (server component) or URLSearchParams.
export function readUserFilters(searchParams) {
  const get = (k) =>
    typeof searchParams?.get === 'function'
      ? searchParams.get(k)
      : searchParams?.[k];
  const out = {};
  USER_FILTER_KEYS.forEach((k) => {
    const v = get(k);
    if (v != null && String(v) !== '') out[k] = String(v);
  });
  return out;
}

export function userFiltersToQuery(filters, extra = {}) {
  const params = new URLSearchParams();
  Object.entries({ ...filters, ...extra }).forEach(([k, v]) => {
    if (v != null && String(v) !== '') params.set(k, String(v));
  });
  return params;
}
