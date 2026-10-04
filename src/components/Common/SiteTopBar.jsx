'use client';

import EventStrip from '@/components/Common/EventPromotions/EventStrip';
import SubscriptionStatusBanner from '@/components/Common/SubscriptionStatusBanner';
import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import { useState } from 'react';

// The ONE bar above every page. Two notices can want that spot — the account
// warning (plan expired / payment failed) and the seasonal event strip — and
// stacked they push the warning down under an ad and eat a third of a phone
// screen. So only one shows, and the account warning always wins: it is about
// the customer's own access, the event is marketing.
//
// Once the customer closes the warning, the event strip may take the spot.
// Same cached /userinfo query the warning already used — no extra request.
export default function SiteTopBar() {
  const { data, isLoading } = useUserInfoQuery();
  const [accountDismissed, setAccountDismissed] = useState(false);

  // Wait for the account check before showing anything, or a lapsed
  // subscriber sees the event strip flash and then get replaced.
  if (isLoading) return null;

  const needsAction =
    data?.accessState === 'expired' || data?.accessState === 'payment_failed';

  if (needsAction && !accountDismissed) {
    return <SubscriptionStatusBanner onDismiss={() => setAccountDismissed(true)} />;
  }
  return <EventStrip />;
}
