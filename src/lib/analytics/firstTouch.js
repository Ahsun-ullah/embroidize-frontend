'use client';

// Where a visitor first came from, kept until they sign up so the account can
// record it (Google search, Pinterest, a Facebook ad, a newsletter link...).
//
// Saved once, on the first page of the first visit, and never overwritten:
// "first touch" is the channel that brought them. Stored in localStorage only
// (no cookie, nothing sent anywhere) until the signup request carries it.

const KEY = 'embroidize.firstTouch';
const MAX = 120;

const clip = (v) => (typeof v === 'string' ? v.trim().slice(0, MAX) : '');

export function captureFirstTouch() {
  try {
    if (typeof window === 'undefined') return;
    if (window.localStorage.getItem(KEY)) return;
    const url = new URL(window.location.href);
    const p = url.searchParams;
    let referrer = '';
    try {
      const ref = document.referrer ? new URL(document.referrer) : null;
      // Our own pages are not a source.
      if (ref && ref.hostname !== url.hostname) referrer = ref.hostname;
    } catch {
      // Unparseable referrer: leave it empty.
    }
    const touch = {
      utmSource: clip(p.get('utm_source')),
      utmMedium: clip(p.get('utm_medium')),
      utmCampaign: clip(p.get('utm_campaign')),
      // Click ids mean a paid ad even when UTMs are missing.
      gclid: p.has('gclid') ? '1' : '',
      fbclid: p.has('fbclid') ? '1' : '',
      referrer: clip(referrer),
      landing: clip(url.pathname),
      at: new Date().toISOString(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(touch));
  } catch {
    // Private mode or storage blocked: nothing to record.
  }
}

export function readFirstTouch() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}
