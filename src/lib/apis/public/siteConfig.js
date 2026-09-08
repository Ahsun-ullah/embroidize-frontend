// Public site config: the effective free-tier download limit/window, for
// marketing copy shown to logged-out visitors (subscriptions free-plan card,
// signup banners). Enforcement never reads this — the backend is the source of
// truth — so everything here is about what the copy SAYS.
//
// Uncached on purpose. The limit is managed from the admin dashboard, and a
// five-minute cache meant the pricing page could advertise the old number
// while the download gate was already enforcing the new one. The setting is
// changed rarely and read on a handful of marketing pages, so paying for one
// request per render is the right trade for copy that is never out of date.
//
// UNKNOWN, NOT ASSUMED: when the config cannot be read the limit comes back
// null rather than falling back to a number. It used to fall back to 5, which
// meant an API blip could have the pricing page promising five downloads a day
// to visitors whose accounts would be cut off at two. Callers render
// number-free wording when it is null — saying less is always recoverable,
// promising the wrong allowance is not.
const UNKNOWN = { freeDownloadLimit: null, freeDownloadWindow: null };

export async function getSiteConfig() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
    const res = await fetch(`${apiUrl}/public/site-config`, {
      cache: 'no-store',
    });
    if (!res.ok) return UNKNOWN;
    const result = await res.json();
    return {
      freeDownloadLimit: result?.data?.freeDownloadLimit ?? null,
      freeDownloadWindow: result?.data?.freeDownloadWindow ?? null,
    };
  } catch (error) {
    // Next signals "this route cannot be static" by THROWING out of the fetch.
    // Swallowing that would be catching the framework's own control flow: the
    // build log fills with a scary error, and the route's bail-out to dynamic
    // rendering rests on Next noticing by other means. Re-throw it and let the
    // bail-out happen the way it is meant to — the no-store fetch above is
    // deliberate, so this page is meant to be dynamic.
    if (error?.digest === 'DYNAMIC_SERVER_USAGE') throw error;
    console.error('Error fetching site config:', error);
    return UNKNOWN;
  }
}

// "1d" → "day", "2d" → "2 days", "1w" → "week", ... for sentence copy like
// "5 downloads per day".
//
// Returns null for a missing or unparseable window rather than defaulting to
// "day": the window is admin-configurable too, so a default here would quietly
// assert a reset period nobody promised.
export function windowPhrase(window) {
  const match = /^(\d+)([dwmy])$/.exec(window || '');
  if (!match) return null;
  const n = parseInt(match[1], 10);
  const unit = { d: 'day', w: 'week', m: 'month', y: 'year' }[match[2]];
  return n === 1 ? unit : `${n} ${unit}s`;
}
