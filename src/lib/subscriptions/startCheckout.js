'use client';

import { getMetaBrowserIds } from '@/lib/analytics/metaBrowserIds';
import { trackSubscriptionCheckout } from '@/lib/analytics/subscriptionCheckout';
import Cookies from 'js-cookie';

// Starts the gateway checkout for one subscription plan — shared by the
// /subscriptions page's PurchaseButton and the landing pages' plan buttons, so
// both send the same request and the same GTM event.
//
// Resolves to:
//   'login'       — no session; the browser is on its way to the login page
//   'redirecting' — checkout created and tracked; the browser is on its way to
//                   the gateway
// Throws when the checkout could not be created.
export async function startSubscriptionCheckout(plan, returnPath) {
  const token = Cookies.get('token');
  if (!token) {
    window.location.href = `/auth/login?pathName=${returnPath}`;
    return 'login';
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/subscriptions/create-checkout-session`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      // Canonical planId — the backend resolves the active gateway's product.
      // _fbp/_fbc ride along for the server-side Meta Purchase the payment
      // webhook sends (it has no browser of its own).
      body: JSON.stringify({ planId: plan._id, ...getMetaBrowserIds() }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create checkout session');
  }

  const data = await response.json();
  const checkoutSessionUrl = data?.data?.url;
  if (!checkoutSessionUrl) {
    throw new Error('No checkout session URL received from backend.');
  }

  trackSubscriptionCheckout(plan, () => {
    window.location.href = checkoutSessionUrl;
  });
  return 'redirecting';
}
