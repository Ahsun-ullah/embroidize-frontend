'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import { financeHeaders } from '@/lib/financeLock';
import Cookies from 'js-cookie';
import { useEffect, useMemo, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Grant subscription access to a user who paid OUTSIDE any gateway.
//
// Shared by the All Users and Subscribers tables — first-time grants tend to
// start from All Users (the person isn't a subscriber yet) while renewals start
// from Subscribers, and both need exactly this form.
//
// It writes the same subscription shape a Stripe/Creem checkout writes, so the
// customer's experience afterwards is identical: same quotas, same My Plan page,
// same lifecycle emails. Nothing here touches the live gateways.
// ─────────────────────────────────────────────────────────────────────────────

const DURATIONS = [
  { label: '1 month', months: 1 },
  { label: '3 months', months: 3 },
  { label: '6 months', months: 6 },
  { label: '1 year', months: 12 },
  { label: 'Custom date…', months: null },
  { label: 'Lifetime (never expires)', months: 'lifetime' },
];

// Three states per limit, matching the backend contract exactly:
//   'plan'      → send nothing, inherit the plan's number
//   'unlimited' → send 0
//   'custom'    → send the typed value
const LIMIT_MODES = [
  { key: 'plan', label: 'Plan default' },
  { key: 'unlimited', label: 'Unlimited' },
  { key: 'custom', label: 'Custom' },
];

// Suggestions only — the field is free text, so a method we've never seen
// ("bKash", "Payoneer USD") can be typed straight in without a code change.
const METHOD_SUGGESTIONS = [
  'PayPal',
  'Payoneer',
  'Bank transfer (US)',
  'Bank transfer (international)',
  'Wise',
  'Crypto (USDT)',
  'Cash',
  'Other',
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'BDT', 'INR'];

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function GrantAccessModal({ user, plans = [], onClose, onGranted }) {
  // 'time' grants a subscription period; 'credits' tops up the download-credit
  // wallet and leaves any subscription completely untouched (they can coexist).
  const [grantType, setGrantType] = useState('time');
  const [creditAmount, setCreditAmount] = useState('100');
  const [creditsExpire, setCreditsExpire] = useState('');
  const [addToBalance, setAddToBalance] = useState(true);

  const [planId, setPlanId] = useState('');
  const [durationIdx, setDurationIdx] = useState(0);
  const [customDate, setCustomDate] = useState('');
  const [extend, setExtend] = useState(true);

  const [dailyMode, setDailyMode] = useState('plan');
  const [dailyValue, setDailyValue] = useState('');
  const [totalMode, setTotalMode] = useState('plan');
  const [totalValue, setTotalValue] = useState('');

  // Payment actually received, outside any gateway. Optional on purpose — an
  // admin may be comping or correcting access, and inventing a payment row for
  // that would corrupt the ledger the invoices are built from.
  const [recordPayment, setRecordPayment] = useState(true);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState('');
  const [methodDetail, setMethodDetail] = useState('');
  const [reference, setReference] = useState('');
  const [receivedAt, setReceivedAt] = useState(
    () => new Date().toISOString().slice(0, 10),
  );

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  // Set when the backend refuses because a live card subscription exists; the
  // admin then has to confirm explicitly before we overwrite it.
  const [conflict, setConflict] = useState(null);

  const sub = user?.subscription || null;
  const currentEnd = sub?.periodEndDate || null;
  const hasFutureEnd = currentEnd && new Date(currentEnd) > new Date();

  useEffect(() => {
    if (!planId && plans.length) setPlanId(plans[0]._id);
  }, [plans, planId]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p._id === planId) || null,
    [plans, planId],
  );

  const duration = DURATIONS[durationIdx];

  // Show the admin the date they are actually granting, before they commit.
  const previewEnd = useMemo(() => {
    if (duration?.months === 'lifetime') return null;
    if (duration?.months === null) return customDate || null;
    const base = extend && hasFutureEnd ? new Date(currentEnd) : new Date();
    const d = new Date(base);
    d.setMonth(d.getMonth() + duration.months);
    return d.toISOString();
  }, [duration, customDate, extend, hasFutureEnd, currentEnd]);

  const limitPayload = (mode, value) => {
    if (mode === 'plan') return undefined; // inherit
    if (mode === 'unlimited') return 0;
    const n = parseInt(value, 10);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };

  const submit = async (force = false) => {
    if (!planId) {
      ErrorToast('Plan required', 'Choose a plan for this grant.', 3000);
      return;
    }

    const body = { planId, note, force, grantType };

    if (grantType === 'credits') {
      const n = parseInt(creditAmount, 10);
      if (!Number.isFinite(n) || n <= 0) {
        ErrorToast('Credits required', 'Enter how many credits to add.', 3000);
        return;
      }
      body.creditAmount = n;
      body.addToBalance = addToBalance;
      if (creditsExpire) body.creditsExpireAt = new Date(creditsExpire).toISOString();
    } else {
      if (duration?.months === null && !customDate) {
        ErrorToast('Date required', 'Pick the date this access should end.', 3000);
        return;
      }
      body.extend = extend;
      if (duration?.months === 'lifetime') {
        // Neither duration nor endDate → backend stores null = never expires.
      } else if (duration?.months === null) {
        body.endDate = new Date(customDate).toISOString();
      } else {
        body.durationMonths = duration.months;
      }

      const daily = limitPayload(dailyMode, dailyValue);
      if (daily !== undefined) body.dailyLimit = daily;
      const total = limitPayload(totalMode, totalValue);
      if (total !== undefined) body.downloadLimit = total;
    }

    if (recordPayment) {
      const parsed = Number(amount);
      if (!Number.isFinite(parsed) || parsed < 0) {
        ErrorToast('Amount required', 'Enter the amount you received.', 3000);
        return;
      }
      if (!method.trim()) {
        ErrorToast('Method required', 'Enter how the payment was received.', 3000);
        return;
      }
      body.payment = {
        // Sent in cents so the server never has to reason about float money.
        amountCents: Math.round(parsed * 100),
        currency,
        method: method.trim(),
        methodDetail: methodDetail.trim() || undefined,
        reference: reference.trim() || undefined,
        receivedAt: receivedAt ? new Date(receivedAt).toISOString() : undefined,
      };
    }

    setSaving(true);
    try {
      const token = Cookies.get('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/users/${user._id}/subscription/grant`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...financeHeaders(),
          },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();

      if (res.status === 409 && data?.error?.gateway) {
        setConflict(data.error);
        setSaving(false);
        return;
      }
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Grant failed');

      SuccessToast('Access granted', data?.message || 'Subscriber updated.', 5000);
      onGranted?.();
      onClose?.();
    } catch (err) {
      ErrorToast('Could not grant access', err.message, 5000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className='w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl'
      >
        <div className='mb-5 flex items-start justify-between'>
          <div>
            <h2 className='text-lg font-bold text-gray-900'>Grant Access</h2>
            <p className='mt-0.5 text-sm text-gray-500'>
              {user?.name || user?.email}
              {currentEnd && (
                <>
                  {' · '}
                  <span className={hasFutureEnd ? 'text-gray-700' : 'text-red-600'}>
                    {hasFutureEnd ? 'active until' : 'ended'} {fmtDate(currentEnd)}
                  </span>
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className='rounded-lg px-2 text-2xl leading-none text-gray-400 hover:text-gray-700'
          >
            ×
          </button>
        </div>

        {conflict && (
          <div className='mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4'>
            <p className='text-sm font-semibold text-amber-900'>
              This user has a live {conflict.gateway} subscription
            </p>
            <p className='mt-1 text-xs leading-relaxed text-amber-800'>
              {conflict.message}
            </p>
            <div className='mt-3 flex gap-2'>
              <button
                onClick={() => submit(true)}
                disabled={saving}
                className='rounded-lg bg-amber-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-60'
              >
                Grant anyway
              </button>
              <button
                onClick={() => setConflict(null)}
                className='rounded-lg bg-white px-3 py-2 text-xs font-semibold text-amber-900 ring-1 ring-amber-300'
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* What kind of grant */}
        <div className='mb-4 flex gap-1 rounded-xl bg-gray-100 p-1'>
          {[
            { key: 'time', label: 'Time-based access' },
            { key: 'credits', label: 'Download credits' },
          ].map((t) => (
            <button
              key={t.key}
              type='button'
              onClick={() => setGrantType(t.key)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                grantType === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {grantType === 'credits' && (
          <p className='mb-4 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-relaxed text-blue-900'>
            Credits are prepaid premium downloads and are kept separately from
            subscriptions — this will not touch any plan this user has. They are
            only spent on premium designs while there is no active subscription.
            {user?.availableCredits != null && (
              <> Current balance: <strong>{user.availableCredits}</strong>.</>
            )}
          </p>
        )}

        {/* Plan */}
        <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          {grantType === 'credits' ? 'Credit pack (for the invoice)' : 'Plan'}
        </label>
        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className='mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
        >
          {plans.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
              {p.isActive === false ? ' (hidden)' : ''} — $
              {p.price}
              {p.billingInterval ? `/${p.billingInterval}` : ' one-time'}
            </option>
          ))}
        </select>

        {/* ── CREDIT FIELDS ── */}
        {grantType === 'credits' && (
          <div className='grid gap-3 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
                Credits to add
              </label>
              <input
                type='number'
                min='1'
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
              />
              <label className='mt-2 flex items-center gap-2 text-xs text-gray-700'>
                <input
                  type='checkbox'
                  checked={addToBalance}
                  onChange={(e) => setAddToBalance(e.target.checked)}
                />
                Add to their existing balance
              </label>
              {!addToBalance && (
                <p className='mt-1 text-xs text-red-600'>
                  Their balance will be REPLACED with this number.
                </p>
              )}
            </div>
            <div>
              <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
                Expires <span className='font-normal normal-case'>(optional)</span>
              </label>
              <input
                type='date'
                value={creditsExpire}
                onChange={(e) => setCreditsExpire(e.target.value)}
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
              />
              <p className='mt-1 text-xs text-gray-500'>
                Leave empty and the credits never expire.
              </p>
            </div>
          </div>
        )}

        {/* ── TIME FIELDS ── */}
        {grantType === 'time' && (
        <>
        <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          Access period
        </label>
        <select
          value={durationIdx}
          onChange={(e) => setDurationIdx(Number(e.target.value))}
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
        >
          {DURATIONS.map((d, i) => (
            <option key={d.label} value={i}>
              {d.label}
            </option>
          ))}
        </select>

        {duration?.months === null && (
          <input
            type='date'
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className='mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
          />
        )}

        {hasFutureEnd && duration?.months !== 'lifetime' && (
          <label className='mt-2 flex items-center gap-2 text-sm text-gray-700'>
            <input
              type='checkbox'
              checked={extend}
              onChange={(e) => setExtend(e.target.checked)}
            />
            Add to their current end date instead of starting from today
          </label>
        )}

        <p className='mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700'>
          Access will run until{' '}
          <strong>
            {duration?.months === 'lifetime' ? 'forever (no expiry)' : fmtDate(previewEnd)}
          </strong>
        </p>

        {/* Limits */}
        <div className='mt-5 grid gap-4 sm:grid-cols-2'>
          {[
            {
              title: 'Daily download limit',
              mode: dailyMode,
              setMode: setDailyMode,
              value: dailyValue,
              setValue: setDailyValue,
              planValue: selectedPlan?.dailyLimit,
            },
            {
              title: 'Total downloads for the period',
              mode: totalMode,
              setMode: setTotalMode,
              value: totalValue,
              setValue: setTotalValue,
              planValue: selectedPlan?.downloadLimit,
            },
          ].map((f) => (
            <div key={f.title}>
              <label className='mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500'>
                {f.title}
              </label>
              <div className='flex gap-1'>
                {LIMIT_MODES.map((m) => (
                  <button
                    key={m.key}
                    type='button'
                    onClick={() => f.setMode(m.key)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold ${
                      f.mode === m.key
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              {f.mode === 'custom' ? (
                <input
                  type='number'
                  min='1'
                  value={f.value}
                  onChange={(e) => f.setValue(e.target.value)}
                  placeholder='e.g. 20'
                  className='mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              ) : (
                <p className='mt-2 text-xs text-gray-500'>
                  {f.mode === 'unlimited'
                    ? 'No limit for this subscriber'
                    : f.planValue
                      ? `Plan allows ${f.planValue}`
                      : 'Plan is unlimited'}
                </p>
              )}
            </div>
          ))}
        </div>
        </>
        )}

        {/* Payment received */}
        <div className='mt-6 rounded-xl border border-gray-200 p-4'>
          <label className='flex items-center gap-2 text-sm font-bold text-gray-900'>
            <input
              type='checkbox'
              checked={recordPayment}
              onChange={(e) => setRecordPayment(e.target.checked)}
            />
            Record a payment for this grant
          </label>
          <p className='mt-1 text-xs text-gray-500'>
            Creates the invoice and emails the customer a receipt. Untick if you
            are comping or correcting access with no money involved.
          </p>

          {recordPayment && (
            <div className='mt-4 grid gap-3 sm:grid-cols-2'>
              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Amount
                </label>
                <div className='flex gap-2'>
                  <input
                    type='number'
                    step='0.01'
                    min='0'
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder='9.99'
                    className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className='rounded-lg border border-gray-300 px-2 py-2 text-sm'
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Method
                </label>
                {/* Free text with suggestions — a new method can be typed in
                    directly, no code change needed. */}
                <input
                  list='manual-payment-methods'
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder='PayPal'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
                <datalist id='manual-payment-methods'>
                  {METHOD_SUGGESTIONS.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Detail <span className='font-normal text-gray-400'>(optional)</span>
                </label>
                <input
                  value={methodDetail}
                  onChange={(e) => setMethodDetail(e.target.value)}
                  placeholder='amara@example.com'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Reference <span className='font-normal text-gray-400'>(optional)</span>
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder='8XY44821PL993'
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-600'>
                  Received on
                </label>
                <input
                  type='date'
                  value={receivedAt}
                  onChange={(e) => setReceivedAt(e.target.value)}
                  className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
              </div>
            </div>
          )}
        </div>

        {/* Note */}
        <label className='mb-1 mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
          Internal note
        </label>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='e.g. Card declined twice, paid $9.99 via PayPal ref 8XY44821'
          className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
        />
        <p className='mt-1 text-xs text-gray-400'>
          Saved to the subscription audit log{recordPayment ? ' and the payment record' : ''}.
        </p>

        <div className='mt-6 flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200'
          >
            Cancel
          </button>
          <button
            onClick={() => submit(false)}
            disabled={saving || !planId}
            className='rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-black disabled:opacity-50'
          >
            {saving ? 'Granting…' : 'Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
}
