'use client';

// GTM event for a subscription checkout that has just been started.
//
// Fired from the subscribe button once the API has created the gateway's
// checkout session, right before the redirect — so a logged-out click, an
// unavailable plan or a failed request is never counted as a checkout.
//
// Name and price come from the plan record the button was rendered with, never
// hard-coded, so renaming or repricing a plan in admin needs no code change.
// `plan.price` is the amount charged for the whole term (a yearly plan's card
// shows price / 12 per month; that figure must not be reported here).
//
// GTM maps this to Meta's InitiateCheckout. If a click-triggered
// InitiateCheckout tag also exists in the container, remove it, or every
// checkout is counted twice.

// Longest we hold the redirect for GTM's tags to send. GTM calls eventCallback
// when they finish; if GTM never loaded (ad blocker) it never calls it at all.
const MAX_WAIT_MS = 1000;

/**
 * Pushes `subscription_checkout` to window.dataLayer for the given plan, then
 * calls `onDone` once GTM has sent its tags (or after MAX_WAIT_MS). Navigating
 * away straight after a push can cancel the tags' requests, so the caller
 * redirects in `onDone`. `onDone` always runs exactly once.
 */
export function trackSubscriptionCheckout(plan, onDone = () => {}) {
  let finished = false;
  const done = () => {
    if (finished) return;
    finished = true;
    onDone();
  };

  const value = Number(plan?.price);
  if (typeof window === 'undefined' || !plan?.name || !Number.isFinite(value)) {
    done();
    return;
  }

  setTimeout(done, MAX_WAIT_MS);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'subscription_checkout',
    value,
    // Plans carry no currency of their own; every plan is sold in USD.
    currency: 'USD',
    subscription_plan: plan.name,
    eventCallback: done,
    eventTimeout: MAX_WAIT_MS,
  });
}
