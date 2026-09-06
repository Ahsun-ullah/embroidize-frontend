'use client';

import { useEffect, useState } from 'react';

/* Time left in today's promo, as HH:MM:SS.
 *
 * Shared by the pricing page and the homepage promo card so the two can never
 * show different numbers — they are the same offer, and a visitor moving
 * between the pages would notice.
 *
 * The deadline is captured once on mount (today, 23:59:59.999 local), which is
 * the behaviour the pricing page already had: a tab left open past midnight
 * settles on "Offer ended" rather than rolling into the next day.
 *
 * Returns null until mounted. The server has no idea what time it is in the
 * visitor's timezone, so rendering a real value during SSR would guarantee a
 * hydration mismatch — callers render a placeholder instead.
 */
export function useDailyOfferCountdown() {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const deadline = new Date();
    deadline.setHours(23, 59, 59, 999);

    const tick = () => {
      const diff = deadline.getTime() - Date.now();

      if (diff <= 0) {
        setRemaining('Offer ended');
        return;
      }

      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setRemaining(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
      );
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return remaining;
}

/* Just the ticking text, so each caller keeps its own surrounding styling.
   `tabular-nums` stops the width jittering as the digits change. */
export default function OfferCountdown({ className = '' }) {
  const remaining = useDailyOfferCountdown();

  return (
    <span className={`tabular-nums ${className}`}>
      {remaining ?? '--:--:--'}
    </span>
  );
}
