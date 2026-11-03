'use client';

import { useEffect, useState } from 'react';

/**
 * Live data for the free-plan upsell (the Download Limit popup and the My Plan
 * page): the recurring subscription plans and the published catalogue size.
 *
 * Both are read from the same public endpoints the /subscriptions page and the
 * landing pages use, so a price or limit changed in admin shows up here with no
 * code change.
 *
 * EMPTY, NOT ASSUMED: while loading, or when the API cannot be read, `plans` is
 * empty and `totalDesigns` is null. Callers render a plain "See plans" link and
 * number-free copy rather than a made-up price.
 */
export function useUpgradeOffer() {
  const [plans, setPlans] = useState([]);
  const [totalDesigns, setTotalDesigns] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const api = process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

    const readJson = (path) =>
      fetch(`${api}${path}`)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

    Promise.all([
      readJson('/public/subscriptions'),
      readJson('/public/site-config'),
    ]).then(([subs, config]) => {
      if (!active) return;
      const list = subs?.data?.plans;
      setPlans(Array.isArray(list) ? list : []);
      const count = Number(config?.data?.totalDesigns);
      setTotalDesigns(Number.isFinite(count) && count > 0 ? count : null);
      setIsLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  return { plans, totalDesigns, isLoaded };
}

/**
 * Marketing rounding for the catalogue size: 18,437 → "18,000+", 940 → "940".
 * Rounds DOWN so the copy never promises more designs than exist.
 */
export function formatDesignCount(count) {
  const n = Number(count);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1000) return n.toLocaleString('en-US');
  return `${(Math.floor(n / 1000) * 1000).toLocaleString('en-US')}+`;
}
