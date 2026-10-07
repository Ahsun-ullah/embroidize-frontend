'use client';

import { useUserInfoQuery } from '@/lib/redux/common/user/userInfoSlice';
import Cookies from 'js-cookie';
import { Clock, Flame, Layers, Tag } from 'lucide-react';
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

// How long a pack lasts, in words — and ONLY when we actually know.
//
// A blank validity means two different things depending on the pack. On one that
// can be bought with a card it means exactly what it says: the credits never
// expire, because that is the rule the wallet follows. On a quote-and-transfer
// pack it means nothing has been decided — the admin sets a deadline when they
// grant it — so promising "no expiry" on the pricing page would be committing us
// to something no one agreed to. Those rows simply say nothing.
const validity = (pack) => {
  const days = pack.validityDays;
  if (!days) return pack.purchasable ? 'no expiry' : '';
  if (days % 365 === 0) return `valid ${days / 365} year${days === 365 ? '' : 's'}`;
  if (days % 30 === 0) return `valid ${days / 30} month${days === 30 ? '' : 's'}`;
  return `valid ${days} days`;
};

// "$0.27" — what one design costs inside the pack. Rounded to the cent for
// display only; nothing is charged from this number.
const perDesign = (pack) =>
  money(Math.round((Number(pack.priceCents) || 0) / (pack.credits || 1)), pack.currency);

// `variant`:
//   'compact' — the plain stacked list the My credits page uses.
//   'rich'    — the pricing page's selectable rows, with the per-design price,
//               validity and design count spelled out as chips.
export default function CreditPackList({
  note = '',
  onUnavailable = null,
  variant = 'compact',
}) {
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
  const [selected, setSelected] = useState(0);

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

  const buyButton = (p, className = '') =>
    p.purchasable && !coveredBySubscription ? (
      <button
        type='button'
        onClick={() => buy(p)}
        disabled={buying === p.credits}
        className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${className} ${
          buying === p.credits
            ? 'cursor-not-allowed bg-gray-300 text-gray-600'
            : 'bg-black text-white hover:bg-gray-800'
        }`}
      >
        {buying === p.credits ? 'Opening…' : 'Buy now'}
      </button>
    ) : null;

  const footer = (
    <>
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
    </>
  );

  if (variant === 'rich') {
    // Biggest pack first, and it carries the badge: it is the best value per
    // design, so it leads the list and is selected by default.
    const ordered = [...packs].sort((a, b) => b.credits - a.credits);
    const largest = ordered[0]?.credits;

    return (
      <div className='mb-4 space-y-2.5' role='radiogroup' aria-label='Credit packs'>
        {ordered.map((p, i) => {
          const isSelected = selected === i;
          const valid = validity(p);
          const chips = [
            { icon: Tag, text: `${perDesign(p)} per design` },
            valid ? { icon: Clock, text: valid === 'no expiry' ? 'No expiry' : valid } : null,
            { icon: Layers, text: `${p.credits} designs` },
          ].filter(Boolean);

          return (
            <div
              key={`${p.credits}-${p.priceCents}`}
              role='radio'
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => setSelected(i)}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  setSelected(i);
                }
              }}
              className={`relative flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border px-4 py-3.5 transition md:flex-nowrap md:gap-x-3 ${
                isSelected
                  ? 'border-violet-300 bg-violet-50/60 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {p.credits === largest ? (
                <span className='absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm'>
                  <Flame size={12} className='fill-orange-300 text-orange-300' />
                  Most Popular
                </span>
              ) : null}

              <span
                aria-hidden='true'
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? 'border-violet-600' : 'border-gray-300'
                }`}
              >
                {isSelected ? <span className='h-3 w-3 rounded-full bg-violet-600' /> : null}
              </span>

              <span className='w-[5.75rem] flex-shrink-0 whitespace-nowrap text-base font-bold text-black'>
                {p.credits} credits
              </span>

              <span className='order-last flex w-full flex-wrap gap-1.5 md:order-none md:w-auto md:flex-1 xl:flex-nowrap'>
                {chips.map(({ icon: Icon, text }) => (
                  <span
                    key={text}
                    className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700'
                  >
                    <Icon size={13} className='text-violet-600' aria-hidden='true' />
                    {text}
                  </span>
                ))}
              </span>

              <span className='ml-auto text-lg font-bold text-black md:ml-0'>
                {money(p.priceCents, p.currency)}
              </span>

              {buyButton(p, 'flex-shrink-0')}
            </div>
          );
        })}

        {footer}
      </div>
    );
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
            {validity(p) ? (
              <p className='text-xs text-gray-500'>{validity(p)}</p>
            ) : null}
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

      {footer}
    </div>
  );
}
