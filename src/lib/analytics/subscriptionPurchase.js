'use client';

import Cookies from 'js-cookie';

// GTM purchase event for a completed subscription checkout.
//
// The gateway sends the customer back to /subscriptions?status=success and that
// URL carries nothing else — deliberately. A transaction id, amount or plan
// read from the query string would be attacker-controlled: anyone could invent
// revenue in the analytics account by typing a URL. So the facts are fetched
// from the API, which reads them from the subscription record the gateway's own
// webhook wrote.
//
// Two things this has to get right:
//
//   TIMING  — the browser normally arrives back BEFORE the webhook has been
//             processed, so "not ready yet" is the expected first answer. We
//             retry for a few seconds and then give up in silence rather than
//             firing an event with missing values.
//
//   DUPLICATES — a refresh, a back-button, or a second visit inside the same
//             billing period must not report a second purchase. The
//             transaction id is unique per billing PERIOD, so it doubles as the
//             dedupe key: renewals count as new purchases, revisits do not.

const SEEN_KEY_PREFIX = 'sub_purchase_tracked:';
const MAX_ATTEMPTS = 8;
const RETRY_DELAY_MS = 1500;

const alreadyTracked = (transactionId) => {
  try {
    return localStorage.getItem(SEEN_KEY_PREFIX + transactionId) === '1';
  } catch {
    // Private mode, or storage disabled. Better to risk one duplicate event
    // than to skip the conversion entirely.
    return false;
  }
};

const markTracked = (transactionId) => {
  try {
    localStorage.setItem(SEEN_KEY_PREFIX + transactionId, '1');
  } catch {
    /* nothing to do — see alreadyTracked */
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fires `subscription_purchase` on window.dataLayer once the gateway's webhook
 * has confirmed what was charged. Safe to call on every render of the success
 * landing; it resolves to false when there is nothing to report.
 */
export async function trackSubscriptionPurchase() {
  if (typeof window === 'undefined') return false;

  const token = Cookies.get('token');
  if (!token) return false;

  const apiUrl =
    process.env.NEXT_PUBLIC_BASE_API_URL_PROD ||
    process.env.NEXT_PUBLIC_BASE_API_URL;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${apiUrl}/subscriptions/last-purchase`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return false;

      const purchase = (await res.json())?.data;

      if (purchase?.ready) {
        if (alreadyTracked(purchase.transactionId)) return false;

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'subscription_purchase',
          transaction_id: purchase.transactionId,
          value: purchase.value,
          currency: purchase.currency,
          subscription_plan: purchase.planName,
        });

        markTracked(purchase.transactionId);
        return true;
      }

      // 'amount_unknown' means the record exists but the gateway never told us
      // what it charged. Retrying cannot fix that, and inventing a number is
      // not an option, so stop.
      if (purchase?.reason === 'amount_unknown') return false;
    } catch {
      // Network hiccup — fall through to the retry.
    }

    if (attempt < MAX_ATTEMPTS - 1) await sleep(RETRY_DELAY_MS);
  }

  return false;
}
