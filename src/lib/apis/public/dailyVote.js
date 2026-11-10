// Daily free-design vote: the public reads. Safe on the server and in the
// browser (no cookies, no server-only imports).
//
// Never throws: the vote is a homepage section, and a slow or failed request
// must not take the page down with it. Callers get null and hide the section.

const BASE = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

export const SITE_URL = 'https://embroidize.com';
export const VOTE_PAGE_PATH = '/free-design-vote';

async function getData(path, timeoutMs = 4000) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      cache: 'no-store',
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
  } catch {
    return null;
  }
}

// { enabled, day, endsAt, serverNow, freeDesign, leaders[], totalVotes }
export function getDailyVoteBoard(limit = 3) {
  return getData(`/public/daily-vote?limit=${limit}`);
}

// { enabled, isFreeToday, canBeVoted, votes, rank, percent, totalVotes, endsAt }
export function getDailyVoteStanding(productId) {
  if (!productId) return Promise.resolve(null);
  return getData(`/public/daily-vote/product/${productId}`);
}

// The public link to share: the vote page, optionally spotlighting one design.
export function votePageUrl(designSlug) {
  return designSlug
    ? `${SITE_URL}${VOTE_PAGE_PATH}?design=${encodeURIComponent(designSlug)}`
    : `${SITE_URL}${VOTE_PAGE_PATH}`;
}

// The preview picture a pasted link shows. `day` is part of the URL so
// Facebook and WhatsApp, which cache images by URL, fetch a new one each day.
export function voteShareImageUrl({ design, mode, day } = {}) {
  const params = new URLSearchParams();
  if (design) params.set('design', design);
  if (mode) params.set('mode', mode);
  if (day) params.set('d', day);
  const qs = params.toString();
  return `${BASE}/public/daily-vote/share-image${qs ? `?${qs}` : ''}`;
}
