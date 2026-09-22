'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// The credit packs on offer, with a Buy button on the ones that can actually be
// paid for on the spot.
//
// Deliberately fetches /public/credit-packs rather than reading the packs out of
// the site config: the config knows the prices, but only this endpoint knows
// whether a pack is sellable right now — which needs the live payment gateway
// and the pack's product mapping, neither of which belongs in a public config
// blob. A pack with no card route is still listed, because it can still be
// bought the slow way; it just shows no button, and the page's own "ask us"
// CTA is what covers it.
// ─────────────────────────────────────────────────────────────────────────────

const apiBase = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

const money = (cents, currency = 'USD') => {
  const value = (Number(cents) || 0) / 100;
  return currency === 'USD' ? `$${value.toFixed(2)}` : `${currency} ${value.toFixed(2)}`;
};

const validity = (days) => {
  if (!days) return 'no expiry';
  if (days % 365 === 0) return `valid ${days / 365} year${days === 365 ? '' : 's'}`;
  if (days % 30 === 0) return `valid ${days / 30} month${days === 30 ? '' : 's'}`;
  return `valid ${days} days`;
};

export default function CreditPackList({ note = '', onUnavailable = null }) {
  const pathName = usePathname();

  // A credit cannot be spent while a subscription is running — the download gate
  // only reaches for the wallet when there is no active plan — so the server
  // refuses the purchase outright. The button is hidden here for the same
  // reason, rather than left to fail: offering someone a thing they will be told
  // off for wanting is worse than not offering it.
  const isLoggedIn = !!Cookies.get('token');
  const { data: me } = useUserInfoQuery(undefined, { skip: !isLoggedIn });
  const coveredBySubscription = me?.isSubscribed === true;

  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${apiBase()}/public/credit-packs`, {
          cache: 'no-store',
        });
        const data = await res.json();
        if (!cancelled) setPacks(data?.data?.packs || []);
      } catch {
        // A price list that fails to load must not take the section with it —
        // the page still has an "ask us" route, which is what it had before any
        // of this existed.
        if (!cancelled) setPacks([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const buy = useCallback(
    async (pack) => {
      const token = Cookies.get('token');
      if (!token) {
        window.location.href = `/auth/login?pathName=${pathName}`;
        return;
      }

      setBuying(pack.credits);
      setError('');

      try {
        const res = await fetch(`${apiBase()}/credits/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          // The size is the whole request. The price comes from the saved pack
          // on the server, so there is nothing here worth tampering with.
          body: JSON.stringify({ credits: pack.credits }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error?.message || 'Could not start checkout.');
        }

        const url = data?.data?.url;
        if (!url) throw new Error('No checkout link came back. Please try again.');

        window.location.href = url;
      } catch (err) {
        setError(err.message || 'Could not start checkout.');
        setBuying(null);
      }
    },
    [pathName],
  );

  if (loading) {
    return (
      <div className='mb-4 space-y-2'>
        {[0, 1].map((i) => (
          <div key={i} className='h-14 animate-pulse rounded-xl bg-gray-100' />
        ))}
      </div>
    );
  }

  if (!packs.length) {
    return onUnavailable ? onUnavailable() : null;
  }

  return (
    <div className='mb-4 space-y-2'>
      {packs.map((p) => (
        <div
          key={`${p.credits}-${p.priceCents}`}
          className='flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3'
        >
          <div>
            <p className='text-sm font-semibold text-black'>{p.credits} credits</p>
            <p className='text-xs text-gray-500'>{validity(p.validityDays)}</p>
          </div>

          <div className='flex items-center gap-3'>
            <span className='text-sm font-bold text-black'>
              {money(p.priceCents, p.currency)}
            </span>

            {p.purchasable && !coveredBySubscription ? (
              <button
                type='button'
                onClick={() => buy(p)}
                disabled={buying === p.credits}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  buying === p.credits
                    ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {buying === p.credits ? 'Opening…' : 'Buy now'}
              </button>
            ) : null}
          </div>
        </div>
      ))}

      {coveredBySubscription ? (
        <p className='px-1 text-xs text-gray-600'>
          Your plan already covers premium downloads, so there is nothing to buy
          here — credits are only spent when there is no active plan. If you want
          some ready for after your plan ends, just ask us.
        </p>
      ) : null}

      {error ? (
        <p role='alert' className='px-1 text-xs font-semibold text-red-600'>
          {error}
        </p>
      ) : null}

      {note ? <p className='px-1 text-xs text-gray-500'>{note}</p> : null}
    </div>
  );
}
