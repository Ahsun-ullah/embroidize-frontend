'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Cookies from 'js-cookie';
import { useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// "Pay another way" request form.
//
// Shared by the modal on /subscriptions and the standalone /payment-help page
// (the shareable link), so there is one implementation of the form and one place
// its behaviour can change.
//
// It now covers TWO different asks, because they are two different products:
//   • a plan — recurring access, priced per period
//   • download credits — a prepaid quantity, no period, no card, never renews
// The customer says which one they want; the queue, the emails and the grant
// modal all branch on it downstream.
//
// Selection is done with buttons rather than <select>. Native dropdowns inside a
// fixed, scroll-locked overlay are unreliable, and the method options were
// already displayed as chips — so the chips ARE the control now instead of
// decoration sitting next to a duplicate dropdown.
//
// Plans and credit packs are fetched here rather than taken on trust from a
// prop: the standalone page has no parent to pass them, and a prop that arrives
// empty would silently leave the customer unable to say what they want to buy.
// ─────────────────────────────────────────────────────────────────────────────

const METHODS = [
  'PayPal',
  'Payoneer',
  'US bank transfer',
  'Wise',
  'Something else',
];

const money = (cents, currency = 'USD') => {
  const v = (Number(cents) || 0) / 100;
  return currency === 'USD' ? `$${v.toFixed(2)}` : `${currency} ${v.toFixed(2)}`;
};

export default function PaymentHelpForm({
  plans: plansProp,
  onSent,
  compact = false,
  // 'subscription' | 'credits' — which ask the form opens on. The credits CTA
  // on the pricing page sends people here already in credit mode.
  initialType = 'subscription',
}) {
  const [requestType, setRequestType] = useState(initialType);
  const [plans, setPlans] = useState(plansProp?.length ? plansProp : []);
  const [planId, setPlanId] = useState('');

  const [packs, setPacks] = useState([]);
  const [packsNote, setPacksNote] = useState('');
  const [credits, setCredits] = useState('');

  const [method, setMethod] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (plans.length) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/subscriptions`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (active) setPlans(data?.data?.plans ?? []);
      } catch {
        // Non-fatal — they can still send a request without naming a plan.
      }
    })();
    return () => {
      active = false;
    };
  }, [plans.length]);

  // Credit pack sizes and prices are config, never hardcoded: nothing may be
  // quoted to a customer that the admin did not type. An empty list simply
  // means they type the quantity they want instead of picking one.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/public/site-config`,
        );
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setPacks(data?.data?.creditPacks ?? []);
        setPacksNote(data?.data?.creditPacksNote ?? '');
      } catch {
        // Non-fatal — the quantity field still works with no packs offered.
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const wantsCredits = requestType === 'credits';

  const submit = async () => {
    const token = Cookies.get('token');
    if (!token) {
      // We need to know WHICH account to set up, so the request is tied to a
      // signed-in user. Bring them back here afterwards.
      window.location.href = `/auth/login?pathName=${encodeURIComponent('/payment-help')}`;
      return;
    }

    setSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/manual-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestType,
            planId: wantsCredits ? undefined : planId || undefined,
            // Blank is allowed and meaningful: "how many can I get for $20?"
            creditQuantity: wantsCredits ? Number(credits) || undefined : undefined,
            preferredMethod: method,
            message,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data?.error?.message || data?.message || 'Could not send');

      setSent(true);
      SuccessToast('Request sent', data?.message || "We'll be in touch shortly.", 6000);
      onSent?.();
    } catch (err) {
      ErrorToast('Could not send', err.message, 5000);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className='space-y-4'>
        <div className='rounded-2xl border border-gray-300 bg-gray-50 p-5'>
          <p className='text-sm font-semibold text-gray-900'>
            Thanks — we&apos;ve got your request.
          </p>
          <p className='mt-2 text-sm leading-relaxed text-gray-700'>
            We&apos;ll email you payment details shortly. Once your payment
            arrives we&apos;ll{' '}
            {wantsCredits
              ? 'add the credits to your account'
              : 'switch your account on'}{' '}
            straight away — usually within a few hours.
          </p>
        </div>
        <p className='text-xs text-gray-500'>
          Nothing else to do for now. Keep an eye on the inbox for the address
          you signed up with.
        </p>
      </div>
    );
  }

  const Chip = ({ active, children, onClick }) => (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-xl px-3 py-2.5 text-center text-xs font-semibold transition ${
        active
          ? 'bg-black text-white ring-2 ring-black ring-offset-1'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* What are they asking for? Two different products, one queue. */}
      <label className='mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500'>
        What do you need?
      </label>
      <div className='mb-5 flex gap-1 rounded-xl bg-gray-100 p-1'>
        {[
          { key: 'subscription', label: 'A plan' },
          { key: 'credits', label: 'Download credits' },
        ].map((t) => (
          <button
            key={t.key}
            type='button'
            onClick={() => setRequestType(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              requestType === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {wantsCredits ? (
        <>
          <p className='mb-4 rounded-xl bg-gray-100 px-3 py-2.5 text-xs leading-relaxed text-gray-700'>
            Credits are prepaid downloads — one credit takes one premium design.
            There is no subscription, no card on file and nothing renews. Free
            designs never use a credit.
          </p>

          <label className='mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500'>
            How many credits?
          </label>
          {packs.length > 0 && (
            <div
              className={`mb-3 grid gap-2 ${compact ? 'grid-cols-2' : 'sm:grid-cols-3'}`}
            >
              {packs.map((p) => (
                <Chip
                  key={`${p.credits}-${p.priceCents}`}
                  active={Number(credits) === Number(p.credits)}
                  onClick={() => setCredits(String(p.credits))}
                >
                  {p.credits} credits
                  <span className='mt-0.5 block font-normal opacity-70'>
                    {money(p.priceCents, p.currency)}
                  </span>
                </Chip>
              ))}
            </div>
          )}
          <input
            type='number'
            min='1'
            value={credits}
            onChange={(e) => setCredits(e.target.value)}
            placeholder={
              packs.length ? 'Or type another number' : 'e.g. 100 — or leave blank to ask'
            }
            className='mb-2 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none'
          />
          <p className='mb-5 text-xs text-gray-500'>
            {packsNote ||
              "Not sure how many you need? Leave it blank and tell us your budget below — we'll quote you."}
          </p>
        </>
      ) : (
        <>
          <label className='mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500'>
            Which plan do you want?
          </label>
          <div
            className={`mb-5 grid gap-2 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2'}`}
          >
            {plans.map((p) => (
              <Chip
                key={p._id}
                active={planId === p._id}
                onClick={() => setPlanId(planId === p._id ? '' : p._id)}
              >
                {p.name} — ${p.price}
                {p.billingInterval ? `/${p.billingInterval}` : ''}
              </Chip>
            ))}
            <Chip active={planId === ''} onClick={() => setPlanId('')}>
              Not sure yet — please advise
            </Chip>
          </div>
        </>
      )}

      <label className='mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500'>
        How would you like to pay?
      </label>
      <div className='mb-5 grid grid-cols-2 gap-2 sm:grid-cols-3'>
        {METHODS.map((m) => (
          <Chip
            key={m}
            active={method === m}
            onClick={() => setMethod(method === m ? '' : m)}
          >
            {m}
          </Chip>
        ))}
      </div>

      <label className='mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500'>
        Anything else? <span className='font-normal normal-case'>(optional)</span>
      </label>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={
          wantsCredits
            ? 'e.g. I only need a few designs a month'
            : 'e.g. my card keeps getting declined'
        }
        className='mb-5 w-full resize-none rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none'
      />

      <button
        onClick={submit}
        disabled={sending}
        className='w-full rounded-xl bg-black py-3.5 font-semibold text-white transition hover:bg-gray-900 disabled:bg-gray-400'
      >
        {sending ? 'Sending…' : 'Send request'}
      </button>
      <p className='mt-3 text-center text-xs text-gray-500'>
        We&apos;ll reply to your account email. No card details are ever
        collected by email — we only use trusted payment services.
      </p>
    </>
  );
}
