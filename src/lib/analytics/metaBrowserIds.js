'use client';

import Cookies from 'js-cookie';

// Meta browser identifiers for the server-side Purchase (Conversions API).
//
// _fbp is the Pixel's browser id; _fbc records the ad click (fbclid) that
// brought the visitor here. The payment webhook that sends the server-side
// Purchase has no browser, so both are handed to the API when checkout starts.
//
// The Pixel writes _fbc itself on the landing page — but only if it loads.
// Ad blockers, consent tools and slow in-app browsers often stop it, and then
// the click is lost for good. So the click id is also recorded here, in the
// exact format the Pixel uses, whenever a URL carries an fbclid.

const NINETY_DAYS = 90;

/** Records ?fbclid= as the _fbc cookie. Safe to call on every page load. */
export function captureFbclid() {
  if (typeof window === 'undefined') return;
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (!fbclid) return;

    // Same click already recorded (by the Pixel or by us) — keep its original
    // timestamp, which is part of what Meta matches on.
    const existing = Cookies.get('_fbc');
    if (existing && existing.split('.').slice(3).join('.') === fbclid) return;

    Cookies.set('_fbc', `fb.1.${Date.now()}.${fbclid}`, {
      expires: NINETY_DAYS,
      path: '/',
      sameSite: 'Lax',
      secure: window.location.protocol === 'https:',
    });
  } catch {
    /* cookies blocked — nothing to record */
  }
}

/** { fbp, fbc } as currently stored; either may be undefined. */
export function getMetaBrowserIds() {
  try {
    return { fbp: Cookies.get('_fbp'), fbc: Cookies.get('_fbc') };
  } catch {
    return {};
  }
}
