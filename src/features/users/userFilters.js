// Filters for the admin Users page. They live in the URL (so a filtered view
// survives refresh and can be shared) and are passed to GET /all-users as-is.
// Shared by the server page (first load) and the client wrapper (export).

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
