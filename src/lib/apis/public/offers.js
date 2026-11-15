// Subscription offers (Admin → Content → Offers & Campaigns).
//
// getCurrentOffer — the one offer in its PUBLIC window, or null. Read by every
// site placement (top bar, hero, pricing card, pop-ups …). The browser keeps
// one in-flight/fresh copy per tab so eight placements on one page make one
// request, and the backend caches it for 30s.
//
// getOfferBySlug — the landing page. Also works during early access (the
// private link) and after the end (so the page can say it ended).
//
// Neither throws: an offer is marketing, and a failed request must never take
// a page down with it.

const API = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;
const CLIENT_TTL_MS = 60 * 1000;
let clientCache = null; // { at, promise }

async function fetchCurrent() {
  try {
    const res = await fetch(`${API()}/public/offers/current`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch {
    return null;
  }
}

export function getCurrentOffer() {
  if (typeof window === 'undefined') return fetchCurrent();
  if (clientCache && Date.now() - clientCache.at < CLIENT_TTL_MS) return clientCache.promise;
  clientCache = { at: Date.now(), promise: fetchCurrent() };
  return clientCache.promise;
}

export async function getOfferBySlug(slug) {
  try {
    const res = await fetch(`${API()}/public/offers/${encodeURIComponent(slug)}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || null;
  } catch {
    return null;
  }
}
