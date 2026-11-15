'use client';

import { getCurrentOffer } from '@/lib/apis/public/offers';
import { isOfferOpen } from '@/lib/offers/format';
import { useEffect, useState } from 'react';

/**
 * The live public offer for ONE placement, or null.
 *
 *   const offer = useCurrentOffer('topBar');
 *
 * Returns null when there is no offer, when the admin left this placement off,
 * and — on a timer — the moment the offer ends, so every placement on an open
 * page disappears together at the deadline without a reload.
 */
export function useCurrentOffer(placement) {
  const [offer, setOffer] = useState(null);

  useEffect(() => {
    let active = true;
    let timer = null;
    getCurrentOffer().then((o) => {
      if (!active) return;
      if (!o || !isOfferOpen(o) || (placement && !o.placements?.[placement])) {
        setOffer(null);
        return;
      }
      setOffer(o);
      const msLeft = new Date(o.endsAt).getTime() - Date.now();
      // setTimeout caps at ~24.8 days; an offer further out than that simply
      // gets re-checked on the next page view.
      if (msLeft > 0 && msLeft < 2 ** 31 - 1) {
        timer = setTimeout(() => active && setOffer(null), msLeft);
      }
    });
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [placement]);

  return offer;
}
