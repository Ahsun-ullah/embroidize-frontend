'use client';

import Cookies from 'js-cookie';

// Behaviour events for the admin tracking pages (backend POST /track).
//
// Only for signed-in users: the backend ties every event to an account, and a
// logged-out visitor has none. Fire-and-forget: never awaited, never throws,
// and `keepalive` lets the request finish when the page is navigating away
// (a plan click that redirects to checkout).
//
// Money and quota events (checkout started / completed, limit hits, refused
// premium downloads) are NOT sent from here: the server records those itself.

const ALLOWED = ['design_view', 'pricing_view', 'plan_click', 'search'];

export function trackUserEvent(type, data = {}) {
  try {
    if (typeof window === 'undefined' || !ALLOWED.includes(type)) return;
    const token = Cookies.get('token');
    if (!token) return;
    fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/track`, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type, ...data }),
    }).catch(() => {});
  } catch {
    // Tracking must never break the page.
  }
}

// A short, safe `source` label from a path: "/embroidery-subscription" →
// "embroidery-subscription", "/" → "home". The backend accepts [a-z0-9_-].
export function sourceFromPath(path) {
  const slug = String(path || '')
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40)
    .replace(/^-+|-+$/g, '');
  return slug || 'home';
}
