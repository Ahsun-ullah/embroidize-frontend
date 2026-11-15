'use client';

import EventStrip from '@/components/Common/EventPromotions/EventStrip';
import OfferStrip from '@/components/Common/Offer/OfferStrip';
import SubscriptionStatusBanner from '@/components/Common/SubscriptionStatusBanner';
import { useCurrentOffer } from '@/lib/hooks/useCurrentOffer';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { useState } from 'react';

// The ONE bar above every page. Three notices can want that spot — the account
// warning (plan expired / payment failed), a live offer (Black Friday …) and
// the seasonal event strip — and stacked they push the warning down under an
// ad and eat a third of a phone screen. So only one shows:
//
//   1. the account warning — it is about the customer's own access
//   2. the live offer, when the admin turned its top bar on
//   3. the seasonal event strip
//
// Once the customer closes the warning, the next one may take the spot.
// Same cached /userinfo query the warning already used — no extra request.
export default function SiteTopBar() {
  const { data, isLoading } = useUserInfoQuery();
  const [accountDismissed, setAccountDismissed] = useState(false);
  const offer = useCurrentOffer('topBar');

  // Wait for the account check before showing anything, or a lapsed
  // subscriber sees the event strip flash and then get replaced.
  if (isLoading) return null;

  const needsAction =
    data?.accessState === 'expired' || data?.accessState === 'payment_failed';

  if (needsAction && !accountDismissed) {
    return <SubscriptionStatusBanner onDismiss={() => setAccountDismissed(true)} />;
  }
  if (offer) return <OfferStrip offer={offer} />;
  return <EventStrip />;
}
