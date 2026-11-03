'use client';

import { trackUserEvent } from '@/lib/analytics/userEvents';
import { useEffect } from 'react';

/**
 * Sends one behaviour event when it mounts (e.g. a pricing page view) and
 * renders nothing. For server pages that have no client code of their own.
 * The backend dedupes repeat views within 30 minutes.
 */
export default function TrackUserEvent({ type, productId, planId, source, value }) {
  useEffect(() => {
    trackUserEvent(type, { productId, planId, source, value });
  }, [type, productId, planId, source, value]);
  return null;
}
