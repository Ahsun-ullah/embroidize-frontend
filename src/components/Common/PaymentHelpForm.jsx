'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';

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
  // What they'd pay for a quantity no pack prices. Nobody has a figure for
  // "300 credits" until someone names one, and an ask with no number attached
  // takes an email round trip before it can even be answered.
  const [offerAmount, setOfferAmount] = useState('');
  // One-shot: with a single pack on offer, that pack IS the choice, so it
  // starts selected. Guarded by a ref so clearing the field doesn't refill it —
  // a default that won't stay deleted is a broken input, not a convenience.
  const defaultedPack = useRef(false);

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

  // A single pack is not a choice — it's the offer. Pre-select it so the
  // customer isn't asked to pick from a list of one.
  useEffect(() => {
    if (defaultedPack.current) return;
    if (packs.length === 1 && credits === '') {
      setCredits(String(packs[0].credits));
      defaultedPack.current = true;
    }
  }, [packs, credits]);

  // The pack their quantity matches, if any. Everything below branches on this:
  // a pack has a published price, anything else has to be priced by hand.
  const matchedPack = packs.find((p) => Number(p.credits) === Number(credits));
  const customQuantity = !!Number(credits) && !matchedPack;

  const submit = async () => {
    if (wantsCredits) {
      // With packs published, "how many?" has an answer on screen — so it must
      // be answered, by picking one or typing a number. Without any packs
      // there is nothing to pick from, and a blank quantity stays a legitimate
      // "what would X buy me?" enquiry.
      if (packs.length > 0 && !Number(credits)) {
        ErrorToast(
          'How many credits?',
          packs.length === 1
            ? 'Choose the pack, or type how many credits you want.'
            : 'Pick one of the packs, or type how many credits you want.',
          4000,
        );
        return;
      }
      // A quantity nobody published a price for needs a figure from them,
      // otherwise the request cannot be answered without asking first.
      if (customQuantity && !(Number(offerAmount) > 0)) {
        ErrorToast(
          'What would you like to pay?',
          `Tell us what you'd pay for ${Number(credits)} credits — we'll confirm before anything is due.`,
          5000,
        );
        return;
      }
    }

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
            // Sent for a custom quantity only — where a pack matched, the
            // published price is the price, and echoing it back as an "offer"
            // would invite a haggle over a number we already set.
            offeredAmount:
              wantsCredits && customQuantity ? Number(offerAmount) : undefined,
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

          {/* A matched pack already has a price, so it is stated rather than
              asked for. Only a quantity nobody published needs their figure. */}
          {matchedPack && (
            <p className='mb-5 rounded-xl bg-gray-100 px-3 py-2.5 text-xs font-semibold text-gray-800'>
              {matchedPack.credits} credits —{' '}
              {money(matchedPack.priceCents, matchedPack.currency)}. We&apos;ll
              send you payment details for exactly this.
            </p>
          )}

          {customQuantity && (
            <div className='mb-5 rounded-xl border border-gray-300 p-3'>
              <label className='mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500'>
                What would you like to pay for {Number(credits)} credits?
              </label>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-gray-500'>$</span>
                <input
                  type='number'
                  min='1'
                  step='0.01'
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder='e.g. 20.00'
                  className='w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm focus:border-black focus:outline-none'
                />
              </div>
              <p className='mt-2 text-xs text-gray-500'>
                {Number(credits) > 0 && Number(offerAmount) > 0
                  ? `That's about $${(Number(offerAmount) / Number(credits)).toFixed(2)} per design. `
                  : ''}
                Nothing is charged now — we&apos;ll reply with the final price
                and payment details, and you decide then.
              </p>
            </div>
          )}

          {!matchedPack && !customQuantity && (
            <p className='mb-5 text-xs text-gray-500'>
              {packsNote ||
                "Not sure how many you need? Leave it blank and tell us your budget below — we'll quote you."}
            </p>
          )}
          {(matchedPack || customQuantity) && packsNote && (
            <p className='-mt-3 mb-5 text-xs text-gray-500'>{packsNote}</p>
          )}
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
