// Single source of truth for the filter vocabulary. Server pages read the URL
// through `readFilterParams`, client components write it through `buildQuery`,
// so the two can never drift apart.

// `searchOnly` options are offered only where they mean something. Relevance is
// the ranking Atlas Search itself produced, so it exists on /search and nowhere
// else — but it MUST exist there: before it did, picking any sort discarded the
// ranking permanently and the only route back was to hand-edit the URL.
//
// "Most popular" is the rolling window (downloads in the last 15 days, see
// Product.recentDownloadCount). "Most downloaded" is the lifetime counter, which
// barely moves — the two are named apart on purpose because they used to be the
// same word attached to two different result sets.
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Best match', searchOnly: true },
  { value: 'newest', label: 'Newest first' },
  { value: 'popular', label: 'Most popular' },
  { value: 'most-downloaded', label: 'Most downloaded' },
  { value: 'most-favourited', label: 'Most favourited' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A–Z' },
  { value: 'name-desc', label: 'Name Z–A' },
];

export const SORT_VALUES = SORT_OPTIONS.map((s) => s.value);

/** The options a given surface should offer, and the one it falls back to. */
export function sortOptionsFor(context) {
  return context === 'search'
    ? SORT_OPTIONS
    : SORT_OPTIONS.filter((s) => !s.searchOnly);
}

export const defaultSortFor = (context) =>
  context === 'search' ? 'relevance' : 'newest';

export const TIER_OPTIONS = [
  { value: 'free', label: 'Free' },
  { value: 'premium', label: 'Premium' },
];

export const SINCE_OPTIONS = [
  { value: '30', label: 'Added in last 30 days' },
  { value: '90', label: 'Added in last 90 days' },
];

// The three tab views that already exist as indexed URLs (/products?filter=…).
// They are kept as short-hands rather than replaced, so old links, internal
// links and their canonicals keep resolving to the same content. Each expands
// into the granular params the sidebar uses.
export const LEGACY_FILTERS = {
  popular: { sort: 'popular' },
  'most-favourited': { sort: 'most-favourited', favourited: '1' },
  'embroidize-choice': { curated: '1' },
};

const csv = (value) =>
  typeof value === 'string'
    ? [...new Set(value.split(',').map((s) => s.trim()).filter(Boolean))]
    : [];

/**
 * Normalises a Next.js searchParams object into the filter state.
 * Unknown values are dropped rather than passed through, so a hand-edited URL
 * can't inject arbitrary query params into the API call.
 */
export function readFilterParams(searchParams = {}) {
  const raw = searchParams || {};
  const legacy = LEGACY_FILTERS[raw.filter] || {};

  const sort = SORT_VALUES.includes(raw.sort) ? raw.sort : legacy.sort || '';
  const tier = TIER_OPTIONS.some((t) => t.value === raw.tier) ? raw.tier : '';
  const since = SINCE_OPTIONS.some((s) => s.value === raw.since) ? raw.since : '';
  const curated = raw.curated === '1' || legacy.curated === '1' ? '1' : '';
  const favourited = raw.favourited === '1' || legacy.favourited === '1' ? '1' : '';

  return {
    category: csv(raw.category),
    sub_category: csv(raw.sub_category),
    tier,
    since,
    curated,
    favourited,
    sort,
    // The tab that is visually active, if any.
    legacyFilter: LEGACY_FILTERS[raw.filter] ? raw.filter : '',
  };
}

/** The subset that goes to the API, with empties stripped. */
export function toApiFilters(state) {
  const out = {};
  if (state.category?.length) out.category = state.category.join(',');
  if (state.sub_category?.length) out.sub_category = state.sub_category.join(',');
  if (state.tier) out.tier = state.tier;
  if (state.since) out.since = state.since;
  if (state.curated) out.curated = state.curated;
  if (state.favourited) out.favourited = state.favourited;
  if (state.sort) out.sort = state.sort;
  return out;
}

/** True when anything beyond a legacy tab is narrowing the results. */
export function hasGranularFilters(state) {
  return Boolean(
    state.category?.length ||
      state.sub_category?.length ||
      state.tier ||
      state.since ||
      (state.curated && !state.legacyFilter) ||
      (state.sort && !state.legacyFilter),
  );
}

/** Number of active filters, for the mobile "Filters (3)" badge. */
export function countActiveFilters(state) {
  return (
    (state.category?.length || 0) +
    (state.sub_category?.length || 0) +
    (state.tier ? 1 : 0) +
    (state.since ? 1 : 0) +
    (state.curated ? 1 : 0)
  );
}

/**
 * Applies a change to an existing URLSearchParams and returns the query string.
 * Always resets pagination: page 4 of an old filter is meaningless once the
 * result set changes.
 */
export function buildQuery(searchParams, changes) {
  const params = new URLSearchParams(searchParams?.toString?.() || '');

  Object.entries(changes).forEach(([key, value]) => {
    if (value == null || value === '' || (Array.isArray(value) && !value.length)) {
      params.delete(key);
    } else {
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });

  params.delete('page');

  // Writing a granular param retires the legacy tab short-hand, otherwise the
  // two would fight over the same result set.
  if (Object.keys(changes).some((k) => k !== 'filter') && params.has('filter')) {
    const expanded = LEGACY_FILTERS[params.get('filter')];
    if (expanded) {
      Object.entries(expanded).forEach(([k, v]) => {
        if (!params.has(k) && !(k in changes)) params.set(k, v);
      });
    }
    params.delete('filter');
  }

  return params.toString();
}

/** Toggles one value inside a comma-separated multi-select param. */
export function toggleCsvValue(current = [], value) {
  return current.includes(value)
    ? current.filter((v) => v !== value)
    : [...current, value];
}
