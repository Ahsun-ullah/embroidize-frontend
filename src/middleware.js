import { NextResponse } from 'next/server';

// Admin-managed redirects are stored in MongoDB and served by the backend at
// /public/redirects. We fetch them here and apply them at runtime so changes in
// the dashboard take effect immediately (no rebuild/redeploy).
//
// The list is cached in module memory with a short TTL to avoid hitting the API
// on every request. If the backend is unreachable we fail OPEN (serve the page)
// so a redirect-service hiccup never takes the whole site down.

const CACHE_TTL_MS = 60 * 1000; // refresh at most once per minute

let cache = {
  map: null, // Map<source, { destination, type }>
  fetchedAt: 0,
};

function apiBase() {
  return (
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL
  );
}

// Normalize a path the same way the backend stores `source`:
// lowercase, no query/hash, no trailing slash (except root).
function normalizePath(pathname) {
  if (!pathname) return '/';
  let s = pathname.trim().toLowerCase();
  if (s.length > 1) s = s.replace(/\/+$/, '');
  return s || '/';
}

async function getRedirectMap() {
  const now = Date.now();
  if (cache.map && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.map;
  }

  try {
    const res = await fetch(`${apiBase()}/public/redirects`, {
      headers: { Authorization: 'Bearer some-static-token' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`redirects fetch failed: ${res.status}`);

    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];

    const map = new Map();
    for (const item of list) {
      if (item?.source && item?.destination) {
        map.set(normalizePath(item.source), {
          destination: item.destination,
          type: item.type === 302 ? 302 : 301,
        });
      }
    }

    cache = { map, fetchedAt: now };
    return map;
  } catch (err) {
    // Fail open: keep serving with the last known map (or none).
    console.error('[middleware] redirect fetch error:', err?.message || err);
    return cache.map || new Map();
  }
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  const map = await getRedirectMap();
  if (!map || map.size === 0) return NextResponse.next();

  const hit = map.get(normalizePath(pathname));
  if (!hit) return NextResponse.next();

  // Build the destination URL. Relative destinations resolve against the current
  // origin; absolute ones (http...) are used as-is. Preserve the query string
  // unless the destination already carries its own.
  let target;
  if (/^https?:\/\//i.test(hit.destination)) {
    target = new URL(hit.destination);
  } else {
    target = new URL(hit.destination, request.nextUrl.origin);
  }
  if (search && !target.search) target.search = search;

  return NextResponse.redirect(target, hit.type);
}

// Run on real page paths only — skip Next internals, the API, static assets and
// anything with a file extension. Admin pages are excluded so dashboard routes
// are never accidentally redirected.
export const config = {
  matcher: ['/((?!_next/|api/|admin|favicon|.*\\.[\\w]+$).*)'],
};
