// Public site config: the effective free-tier download limit/window, for
// marketing copy shown to logged-out visitors (subscriptions free-plan card,
// signup banners). Cached for 5 minutes — an admin change to the limit shows
// up here shortly after, and enforcement never reads this (the backend is the
// source of truth).
const FALLBACK = { freeDownloadLimit: 5, freeDownloadWindow: '1d' };

export async function getSiteConfig() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/public/site-config`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return FALLBACK;
    const result = await res.json();
    return {
      freeDownloadLimit:
        result?.data?.freeDownloadLimit ?? FALLBACK.freeDownloadLimit,
      freeDownloadWindow:
        result?.data?.freeDownloadWindow ?? FALLBACK.freeDownloadWindow,
    };
  } catch (error) {
    console.error('Error fetching site config:', error);
    return FALLBACK;
  }
}

// "1d" → "day", "2d" → "2 days", "1w" → "week", ... for sentence copy like
// "5 downloads per day".
export function windowPhrase(window) {
  const match = /^(\d+)([dwmy])$/.exec(window || '1d');
  if (!match) return 'day';
  const n = parseInt(match[1], 10);
  const unit = { d: 'day', w: 'week', m: 'month', y: 'year' }[match[2]];
  return n === 1 ? unit : `${n} ${unit}s`;
}
