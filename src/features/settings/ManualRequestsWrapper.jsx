'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import AddCreditsModal from '@/features/admin/AddCreditsModal';
import GrantAccessModal from '@/features/admin/GrantAccessModal';
import { financeHeaders } from '@/lib/financeLock';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// The manual-payment pipeline.
//
// Kept separate from Contact Submissions on purpose: this is a sales queue with
// a status that moves, not a mailbox. Each row carries the plan the customer
// asked for and the account to attach it to, so granting access is one click
// from here rather than a hunt through All Users.
// ─────────────────────────────────────────────────────────────────────────────

const STATUSES = [
  { key: 'new', label: 'New', chip: 'bg-blue-100 text-blue-700' },
  { key: 'contacted', label: 'Contacted', chip: 'bg-indigo-100 text-indigo-700' },
  {
    key: 'awaiting_payment',
    label: 'Awaiting payment',
    chip: 'bg-amber-100 text-amber-700',
  },
  { key: 'paid', label: 'Paid', chip: 'bg-emerald-100 text-emerald-700' },
  { key: 'granted', label: 'Granted', chip: 'bg-gray-900 text-white' },
  { key: 'cancelled', label: 'Cancelled', chip: 'bg-gray-100 text-gray-500' },
];

const chipFor = (s) => STATUSES.find((x) => x.key === s)?.chip || 'bg-gray-100';
const labelFor = (s) => STATUSES.find((x) => x.key === s)?.label || s;

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

// 1 → "1st", 2 → "2nd", 3 → "3rd", 11-13 → "11th"… (the teens are the reason
// this isn't just a lookup on the last digit).
const ordinal = (n) => {
  const v = Number(n) || 0;
  const mod100 = v % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${v}th`;
  return `${v}${{ 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th'}`;
};

// Hover text spelling out the whole relationship — the badge has to stay short,
// but "5th request · 3 granted" is worth being able to expand on before you
// decide how much attention someone gets.
const historyTitle = (h) => {
  if (!h) return '';
  const parts = [`${h.total} request${h.total === 1 ? '' : 's'} from this customer`];
  if (h.granted) parts.push(`${h.granted} granted`);
  if (h.cancelled) parts.push(`${h.cancelled} cancelled`);
  return parts.join(' · ');
};

export default function ManualRequestsWrapper() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [grantFor, setGrantFor] = useState(null);
  const [plans, setPlans] = useState([]);

  // Where customers are told to send money. Held in config, not code, because
  // these change and a wrong address must be fixable without a deploy.
  const [showSettings, setShowSettings] = useState(false);
  const [methods, setMethods] = useState([]);
  const [payNote, setPayNote] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  // The "send payment details" composer — pre-filled from the request, but the
  // amount stays editable so a discount or a different plan can be quoted.
  const [sendFor, setSendFor] = useState(null);
  const [sendPlanId, setSendPlanId] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sending, setSending] = useState(false);

  const authHeaders = () => {
    const token = Cookies.get('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...financeHeaders(),
    };
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/manual-requests?status=${filter}`,
        { headers: authHeaders(), cache: 'no-store' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Could not load requests');
      setRequests(data?.data?.requests || []);
      setCounts(data?.data?.counts || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  // Plans are needed only once the admin opens a grant, so they're fetched lazily.
  const loadPlans = async () => {
    if (plans.length) return;
    try {
      const token = Cookies.get('token');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/subscription-plans`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) return;
      const data = await res.json();
      setPlans(data?.data?.plans || []);
    } catch {
      // Non-fatal — the grant modal blocks submission with no plans.
    }
  };

  // Settings + plans are both needed by the composer, so they load together the
  // first time it's opened rather than on every page view.
  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/manual-payment-settings`,
        { headers: authHeaders(), cache: 'no-store' },
      );
      if (!res.ok) return;
      const data = await res.json();
      setMethods(data?.data?.manualPaymentMethods || []);
      setPayNote(data?.data?.manualPaymentNote || '');
    } catch {
      // Non-fatal — the send action will refuse with a clear message if empty.
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/manual-payment-settings`,
        {
          method: 'PUT',
          headers: authHeaders(),
          body: JSON.stringify({
            manualPaymentMethods: methods,
            manualPaymentNote: payNote,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Save failed');
      setMethods(data?.data?.manualPaymentMethods || []);
      SuccessToast('Saved', 'Payment details updated.', 3000);
    } catch (err) {
      ErrorToast('Could not save', err.message, 4000);
    } finally {
      setSavingSettings(false);
    }
  };

  const openComposer = async (r) => {
    await loadPlans();
    setSendFor(r);
    setSendPlanId(r.planId || '');
    setSendAmount(r.quotedAmount != null ? String(r.quotedAmount) : '');
  };

  // Keep the amount in step with the plan the admin picks, unless they've
  // already typed their own figure.
  useEffect(() => {
    if (!sendFor || !sendPlanId) return;
    const p = plans.find((x) => x._id === sendPlanId);
    if (p && !sendAmount) setSendAmount(String(p.price ?? ''));
  }, [sendPlanId, plans, sendFor, sendAmount]);

  const doSendPaymentDetails = async () => {
    setSending(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/manual-requests/${sendFor._id}/send-payment-details`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            planId: sendPlanId || undefined,
            amount: sendAmount === '' ? undefined : Number(sendAmount),
            currency: 'USD',
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Send failed');
      SuccessToast('Sent', data?.message || 'Payment details sent.', 5000);
      setSendFor(null);
      load();
    } catch (err) {
      ErrorToast('Could not send', err.message, 6000);
    } finally {
      setSending(false);
    }
  };

  const update = async (id, patch) => {
    setBusyId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/manual-requests/${id}`,
        { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(patch) },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Update failed');
      SuccessToast('Updated', 'Request updated.', 2500);
      load();
    } catch (err) {
      ErrorToast('Could not update', err.message, 4000);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className='min-h-screen bg-[#f4f4f4] p-6'>
      <div className='mx-auto max-w-6xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-black'>Manual Requests</h1>
          <p className='mt-1 text-sm text-gray-600'>
            Customers asking to pay outside the card gateways. Work each one down
            the pipeline, then grant their access from here.
          </p>
        </div>

        {/* Payment details config — lives here rather than a separate settings
            page because this is where it gets used. */}
        <div className='mb-5 rounded-2xl bg-white p-5 shadow-sm'>
          <button
            onClick={() => setShowSettings((s) => !s)}
            className='flex w-full items-center justify-between text-left'
          >
            <span>
              <span className='font-bold text-black'>Payment details</span>
              <span className='ml-2 text-xs text-gray-500'>
                {methods.length
                  ? `${methods.length} method${methods.length === 1 ? '' : 's'} — ${methods
                      .map((m) => m.label)
                      .join(', ')}`
                  : '⚠ none set — you can’t send payment emails yet'}
              </span>
            </span>
            <span className='text-gray-400'>{showSettings ? '▲' : '▼'}</span>
          </button>

          {showSettings && (
            <div className='mt-4 space-y-3'>
              {methods.map((m, i) => (
                <div key={i} className='flex gap-2'>
                  <input
                    value={m.label}
                    onChange={(e) => {
                      const next = [...methods];
                      next[i] = { ...next[i], label: e.target.value };
                      setMethods(next);
                    }}
                    placeholder='PayPal'
                    className='w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm'
                  />
                  <input
                    value={m.value}
                    onChange={(e) => {
                      const next = [...methods];
                      next[i] = { ...next[i], value: e.target.value };
                      setMethods(next);
                    }}
                    placeholder='you@example.com'
                    className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm'
                  />
                  <button
                    onClick={() => setMethods(methods.filter((_, x) => x !== i))}
                    className='rounded-lg px-3 text-gray-400 hover:text-red-600'
                    aria-label='Remove'
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                onClick={() => setMethods([...methods, { label: '', value: '' }])}
                className='rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200'
              >
                + Add a method
              </button>

              <textarea
                rows={2}
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                placeholder='Optional note added to the email — bank reference format, discounts, etc.'
                className='w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm'
              />

              <div className='flex items-center gap-3'>
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className='rounded-lg bg-black px-4 py-2 text-sm font-bold text-white disabled:opacity-50'
                >
                  {savingSettings ? 'Saving…' : 'Save payment details'}
                </button>
                <p className='text-xs text-gray-500'>
                  These appear in the email customers receive.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className='mb-5 flex flex-wrap gap-2'>
          <button
            onClick={() => setFilter('all')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
              filter === 'all' ? 'bg-black text-white' : 'bg-white text-gray-600'
            }`}
          >
            All
          </button>
          {STATUSES.map((s) => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${
                filter === s.key ? 'bg-black text-white' : 'bg-white text-gray-600'
              }`}
            >
              {s.label}
              {counts[s.key] ? (
                <span className='ml-1.5 opacity-70'>{counts[s.key]}</span>
              ) : null}
            </button>
          ))}
        </div>

        {error && (
          <div className='mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
            {error}
          </div>
        )}

        {loading ? (
          <div className='rounded-2xl bg-white p-10 text-center text-sm text-gray-500'>
            Loading…
          </div>
        ) : requests.length === 0 ? (
          <div className='rounded-2xl bg-white p-10 text-center'>
            <p className='font-semibold text-gray-800'>Nothing here</p>
            <p className='mt-1 text-sm text-gray-500'>
              Requests appear when a customer uses “Other payment methods” on the
              subscriptions page.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {requests.map((r) => (
              <div key={r._id} className='rounded-2xl bg-white p-5 shadow-sm'>
                <div className='flex flex-wrap items-start justify-between gap-3'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-bold text-black'>{r.name || 'Unnamed'}</p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${chipFor(r.status)}`}
                      >
                        {labelFor(r.status)}
                      </span>
                      {r.requestType === 'credits' && (
                        <span className='rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-700'>
                          Credits
                        </span>
                      )}
                      {/* Returning customers only. On a first-time request this
                          badge would be noise on every single row. */}
                      {r.history?.total > 1 && (
                        <span
                          title={historyTitle(r.history)}
                          className='rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-bold text-white'
                        >
                          {ordinal(r.history.sequence)} request
                          {r.history.granted > 0 &&
                            ` · ${r.history.granted} granted`}
                        </span>
                      )}
                    </div>
                    <p className='mt-0.5 text-sm text-gray-600'>{r.email}</p>
                    <p className='mt-2 text-sm text-gray-800'>
                      {/* A credit request has no plan — printing "not
                          specified" for one would report a blank answer to a
                          question the customer was never asked. */}
                      Wants:{' '}
                      <strong>
                        {r.requestType === 'credits'
                          ? r.creditQuantity
                            ? `${r.creditQuantity} download credits`
                            : 'download credits — quantity to be agreed'
                          : r.planName || 'not specified'}
                      </strong>
                      {r.preferredMethod ? ` · prefers ${r.preferredMethod}` : ''}
                    </p>
                    {r.message && (
                      <p className='mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700'>
                        {r.message}
                      </p>
                    )}
                    <p className='mt-2 text-xs text-gray-400'>
                      Received {fmt(r.createdAt)}
                      {r.paymentDetailsSentAt
                        ? ` · details sent ${fmt(r.paymentDetailsSentAt)}`
                        : ''}
                      {r.quotedAmount != null ? ` · quoted $${r.quotedAmount}` : ''}
                      {r.grantedAt ? ` · granted ${fmt(r.grantedAt)}` : ''}
                    </p>
                  </div>

                  <div className='flex shrink-0 flex-col items-end gap-2'>
                    <select
                      value={r.status}
                      disabled={busyId === r._id}
                      onChange={(e) => update(r._id, { status: e.target.value })}
                      className='rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold'
                    >
                      {STATUSES.map((s) => (
                        <option key={s.key} value={s.key}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => openComposer(r)}
                      className='rounded-lg bg-white px-4 py-2 text-xs font-bold text-gray-800 ring-1 ring-gray-300 hover:bg-gray-50'
                    >
                      {r.paymentDetailsSentAt
                        ? 'Re-send payment details'
                        : 'Send payment details'}
                    </button>
                    <button
                      onClick={async () => {
                        await loadPlans();
                        setGrantFor(r);
                      }}
                      className='rounded-lg bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-900'
                    >
                      {r.requestType === 'credits' ? 'Add credits →' : 'Grant access →'}
                    </button>
                    <a
                      href={`mailto:${r.email}?subject=${encodeURIComponent('Your Embroidize subscription')}`}
                      className='text-xs text-gray-500 underline'
                    >
                      Email customer
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send payment details — one screen, pre-filled, amount editable so a
          discount or a different plan can be quoted without leaving the queue. */}
      {sendFor && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
          onClick={() => setSendFor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl'
          >
            <h2 className='text-lg font-bold text-gray-900'>Send payment details</h2>
            <p className='mt-0.5 text-sm text-gray-500'>
              To {sendFor.name || sendFor.email} · {sendFor.email}
            </p>

            {methods.length === 0 && (
              <div className='mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900'>
                No payment methods are configured yet. Add at least one under
                <strong> Payment details</strong> above, or the email has nowhere
                to tell them to send money.
              </div>
            )}

            <label className='mb-1 mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Plan to quote
            </label>
            <select
              value={sendPlanId}
              onChange={(e) => {
                setSendPlanId(e.target.value);
                setSendAmount('');
              }}
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            >
              <option value=''>— pick a plan —</option>
              {plans.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — ${p.price}
                  {p.billingInterval ? `/${p.billingInterval}` : ''}
                </option>
              ))}
            </select>

            <label className='mb-1 mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Amount to quote (USD)
            </label>
            <input
              type='number'
              step='0.01'
              min='0'
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder='9.99'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />
            <p className='mt-1 text-xs text-gray-500'>
              Defaults to the plan price. Override it to apply a discount.
            </p>

            <div className='mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600'>
              They&apos;ll be told to put <strong>{sendFor.email}</strong> in the
              payment note, and to reply once sent. Status moves to{' '}
              <strong>Awaiting payment</strong>.
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <button
                onClick={() => setSendFor(null)}
                className='rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={doSendPaymentDetails}
                disabled={sending || methods.length === 0 || !sendPlanId}
                className='rounded-lg bg-black px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50'
              >
                {sending ? 'Sending…' : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {grantFor && (
        // Two products, two forms. The row says which one was asked for, so the
        // admin never opens a plan picker for a credit sale or vice versa.
        // Either way, granting marks the request done — that is what this queue
        // exists for, and relying on the admin to remember a second step is how
        // a paid request sits in "awaiting payment" forever.
        grantFor.requestType === 'credits' ? (
          <AddCreditsModal
            user={{ _id: grantFor.userId, name: grantFor.name, email: grantFor.email }}
            initialCreditAmount={grantFor.creditQuantity || undefined}
            onClose={() => setGrantFor(null)}
            onAdded={() => update(grantFor._id, { status: 'granted' })}
          />
        ) : (
          <GrantAccessModal
            user={{ _id: grantFor.userId, name: grantFor.name, email: grantFor.email }}
            plans={plans}
            onClose={() => setGrantFor(null)}
            onGranted={() => update(grantFor._id, { status: 'granted' })}
          />
        )
      )}
    </div>
  );
}
