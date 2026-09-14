'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import AddCreditsModal from '@/features/admin/AddCreditsModal';
import { financeHeaders } from '@/lib/financeLock';
import Cookies from 'js-cookie';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Credit requests — customers asking to BUY download credits.
//
// Split out of Manual Requests on purpose. Credits are a different product from
// a subscription: a quantity, with no plan, no billing period and no renewal,
// granted through a different endpoint and a different modal. Sharing one queue
// meant every credit sale started on a page built around plans.
//
// The rows still live in the ManualRequest collection — one sales pipeline, one
// status machine — the two queues simply ask for their own `type`.
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
  { key: 'granted', label: 'Credits added', chip: 'bg-gray-900 text-white' },
  { key: 'cancelled', label: 'Cancelled', chip: 'bg-gray-100 text-gray-500' },
];

const chipFor = (s) => STATUSES.find((x) => x.key === s)?.chip || 'bg-gray-100';
const labelFor = (s) => STATUSES.find((x) => x.key === s)?.label || s;

const apiBase = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

const authHeaders = () => {
  const token = Cookies.get('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...financeHeaders(),
  };
};

const fmt = (d) =>
  d
    ? new Date(d).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const fmtDay = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const money = (cents, currency = 'USD') => {
  const v = (Number(cents) || 0) / 100;
  return currency === 'USD' || !currency
    ? `$${v.toFixed(2)}`
    : `${currency} ${v.toFixed(2)}`;
};

// Someone may have paid in more than one currency; adding those together would
// invent a number, so each is printed on its own.
const moneyMap = (byCurrency) => {
  const entries = Object.entries(byCurrency || {}).filter(([, v]) => v);
  if (!entries.length) return '—';
  return entries.map(([cur, cents]) => money(cents, cur)).join(' + ');
};

// 1 → "1st", 2 → "2nd"… the teens are why this isn't a last-digit lookup.
const ordinal = (n) => {
  const v = Number(n) || 0;
  const mod100 = v % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${v}th`;
  return `${v}${{ 1: 'st', 2: 'nd', 3: 'rd' }[v % 10] || 'th'}`;
};

const historyTitle = (h) => {
  if (!h) return '';
  const parts = [`${h.total} request${h.total === 1 ? '' : 's'} from this customer`];
  if (h.granted) parts.push(`${h.granted} granted`);
  if (h.cancelled) parts.push(`${h.cancelled} cancelled`);
  return parts.join(' · ');
};

const OPEN_STATUSES = ['new', 'contacted', 'awaiting_payment', 'paid'];

// How long someone has been waiting on YOU. Only shown while the request is
// still open — on a granted row it would be a stat about the past, and the
// number that matters is how long the person trying to pay has gone unanswered.
const waitingLabel = (r) => {
  if (!OPEN_STATUSES.includes(r.status)) return '';
  const ms = Date.now() - new Date(r.createdAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const hours = Math.floor(ms / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `Waiting ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Waiting ${days} day${days === 1 ? '' : 's'}`;
};

const copy = (text) => {
  if (!text) return;
  try {
    navigator.clipboard.writeText(text);
    SuccessToast('Copied', text, 1500);
  } catch {
    // Clipboard is blocked in some contexts; the address is on screen anyway.
  }
};

// What was ACTUALLY given for this request, recorded by the server at the
// moment of the grant. A queue row that only says "granted" leaves the two
// questions that matter — how many, and did they pay — to the audit log.
const givenParts = (f) => {
  if (!f) return [];
  const parts = [];
  if (f.credits) {
    parts.push(
      `${f.credits} credit${f.credits === 1 ? '' : 's'} added${
        f.balanceAfter != null ? ` · balance ${f.balanceAfter}` : ''
      }`,
    );
  }
  if (f.planName) parts.push(f.planName);
  if (f.creditsExpireAt) parts.push(`expires ${fmtDay(f.creditsExpireAt)}`);
  else if (f.credits) parts.push('no expiry');
  parts.push(
    f.amountCents != null
      ? `${money(f.amountCents, f.currency)}${f.method ? ` by ${f.method}` : ''}`
      : 'no payment recorded',
  );
  if (f.invoiceNumber) parts.push(f.invoiceNumber);
  if (f.at) parts.push(fmtDay(f.at));
  return parts;
};

const GivenStrip = ({ fulfillment }) => {
  const parts = givenParts(fulfillment);
  if (!parts.length) return null;
  return (
    <div className='flex flex-wrap items-center gap-x-2 gap-y-1 bg-gray-900 px-4 py-2 text-xs text-gray-200 sm:px-5'>
      <span className='font-bold uppercase tracking-wide text-white'>Given</span>
      {parts.map((p, i) => (
        <span key={i}>
          {i > 0 && <span className='mr-2 text-gray-600'>·</span>}
          {p}
        </span>
      ))}
    </div>
  );
};

// One number with its label and a quiet line of context under it.
const Cell = ({ label, hint, children }) => (
  <div className='bg-white px-4 py-3 sm:px-5'>
    <p className='text-[11px] font-bold uppercase tracking-wide text-gray-400'>
      {label}
    </p>
    <p className='mt-1 text-xl font-bold leading-tight text-gray-900'>{children}</p>
    {hint ? <p className='mt-0.5 text-[11px] text-gray-500'>{hint}</p> : null}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// The queue's data, lifted into a hook so the page can badge the tab with the
// open count without fetching the same list twice.
// ─────────────────────────────────────────────────────────────────────────────
export function useCreditRequests() {
  const [requests, setRequests] = useState([]);
  const [counts, setCounts] = useState({});
  const [open, setOpen] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${apiBase()}/admin/manual-requests?status=${filter}&type=credits`,
        { headers: authHeaders(), cache: 'no-store' },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Could not load requests');
      setRequests(data?.data?.requests || []);
      setCounts(data?.data?.counts || {});
      setOpen(data?.data?.open || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  return { requests, counts, open, filter, setFilter, loading, error, reload: load };
}

export default function CreditRequestsPanel({ queue, onGranted }) {
  const { requests, counts, filter, setFilter, loading, error, reload } = queue;

  const [busyId, setBusyId] = useState(null);
  const [grantFor, setGrantFor] = useState(null);

  // Cards or one-line rows. Remembered per browser only — a display preference
  // is not worth a round trip, and it must not break the page if storage is
  // blocked, so both reads and writes are guarded.
  const [view, setView] = useState('cards');
  useEffect(() => {
    try {
      const saved = localStorage.getItem('creditRequestsView');
      if (saved === 'list' || saved === 'cards') setView(saved);
    } catch {
      // Private windows and blocked storage — the default view is fine.
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('creditRequestsView', view);
    } catch {
      // Nothing to do; the choice just won't survive a reload.
    }
  }, [view]);

  // Where CREDIT buyers are told to send money. Its own list, edited here, so
  // credits can be collected into different accounts from subscriptions. Empty
  // is not "nothing configured" — it falls back to the subscription addresses,
  // because the same PayPal typed in two places is one that goes stale in one
  // of them.
  const [showSettings, setShowSettings] = useState(false);
  // The editor's working copy. `savedMethods` is what the server actually
  // holds — a half-typed row must not make the page believe a quote can be sent.
  const [creditMethods, setCreditMethods] = useState([]);
  const [savedMethods, setSavedMethods] = useState([]);
  const [creditNote, setCreditNote] = useState('');
  const [fallbackMethods, setFallbackMethods] = useState([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [packs, setPacks] = useState([]);

  // What a quote would actually use right now.
  const methods = savedMethods.length ? savedMethods : fallbackMethods;
  const usingFallback = savedMethods.length === 0 && fallbackMethods.length > 0;

  // The quote composer: quantity + amount, both editable so a bulk price can be
  // given without a pack existing for it.
  const [sendFor, setSendFor] = useState(null);
  const [sendCredits, setSendCredits] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          fetch(`${apiBase()}/admin/credit-payment-settings`, {
            headers: authHeaders(),
            cache: 'no-store',
          }),
          fetch(`${apiBase()}/admin/credit-packs`, {
            headers: authHeaders(),
            cache: 'no-store',
          }),
        ]);
        if (mRes.ok) {
          const d = await mRes.json();
          const saved = d?.data?.creditPaymentMethods || [];
          setSavedMethods(saved);
          setCreditMethods(saved);
          setCreditNote(d?.data?.creditPaymentNote || '');
          setFallbackMethods(d?.data?.fallbackMethods || []);
        }
        if (pRes.ok) {
          const d = await pRes.json();
          setPacks(d?.data?.creditPacks || []);
        }
      } catch {
        // Non-fatal — sending refuses with a clear message if nothing is set.
      }
    })();
  }, []);

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await fetch(`${apiBase()}/admin/credit-payment-settings`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
          creditPaymentMethods: creditMethods,
          creditPaymentNote: creditNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Save failed');
      // Trust the server's cleaned list — it drops half-filled rows, so the
      // editor and the "can we send?" check agree on what exists.
      const saved = data?.data?.creditPaymentMethods || [];
      setSavedMethods(saved);
      setCreditMethods(saved);
      SuccessToast(
        'Saved',
        saved.length
          ? 'Credit payment details updated.'
          : 'Cleared — credit quotes will use the subscription payment details.',
        4000,
      );
    } catch (err) {
      ErrorToast('Could not save', err.message, 5000);
    } finally {
      setSavingSettings(false);
    }
  };

  const openComposer = (r) => {
    const qty = r.creditQuantity || '';
    setSendFor(r);
    setSendCredits(qty ? String(qty) : '');
    // A saved pack prices itself; anything else the admin types. No price is
    // invented here — a figure in this email is one you then have to honour.
    const pack = packs.find((p) => Number(p.credits) === Number(qty));
    setSendAmount(
      r.quotedAmount != null
        ? String(r.quotedAmount)
        : pack
          ? String((pack.priceCents || 0) / 100)
          : // Their offer, as a starting point you can accept or overwrite —
            // it is the only figure anyone has named for this quantity.
            r.offeredAmount != null
            ? String(r.offeredAmount)
            : '',
    );
  };

  const doSend = async () => {
    setSending(true);
    try {
      const res = await fetch(
        `${apiBase()}/admin/manual-requests/${sendFor._id}/send-payment-details`,
        {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({
            credits: sendCredits === '' ? undefined : Number(sendCredits),
            amount: sendAmount === '' ? undefined : Number(sendAmount),
            currency: 'USD',
          }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Send failed');
      SuccessToast('Sent', data?.message || 'Payment details sent.', 5000);
      setSendFor(null);
      reload();
    } catch (err) {
      ErrorToast('Could not send', err.message, 6000);
    } finally {
      setSending(false);
    }
  };

  // What is still on your desk, in money and credits. Counted over the rows in
  // view so it answers the list you are actually looking at; the value only
  // counts asks that a saved pack prices, because a total padded with guesses
  // is worse than a total that admits what it can't price.
  const summary = useMemo(() => {
    const open = requests.filter((r) => OPEN_STATUSES.includes(r.status));
    const value = {};
    let priced = 0;
    for (const r of open) {
      if (r.quote?.source === 'pack' && r.quote.amountCents) {
        const cur = r.quote.currency || 'USD';
        value[cur] = (value[cur] || 0) + r.quote.amountCents;
        priced += 1;
      }
    }
    return {
      open: open.length,
      credits: open.reduce((n, r) => n + (Number(r.creditQuantity) || 0), 0),
      value,
      priced,
    };
  }, [requests]);

  const update = async (id, patch) => {
    setBusyId(id);
    try {
      const res = await fetch(`${apiBase()}/admin/manual-requests/${id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Update failed');
      SuccessToast('Updated', 'Request updated.', 2500);
      reload();
    } catch (err) {
      ErrorToast('Could not update', err.message, 4000);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className='rounded-2xl bg-white p-6 shadow-sm'>
      <div>
        <h2 className='text-lg font-bold text-gray-900'>Credit requests</h2>
        <p className='mt-1 max-w-2xl text-sm text-gray-500'>
          Customers asking to buy download credits. Quote them, then add the
          credits from here once the money lands. Subscription requests are a
          separate queue — Settings → Manual Requests.
        </p>
      </div>

      {/* Credit payment details — edited here rather than on a settings page
          because this is where they get used, and separate from the
          subscription addresses because credits may be collected elsewhere. */}
      <div className='mt-5 rounded-xl border border-gray-200 p-4'>
        <button
          type='button'
          onClick={() => setShowSettings((v) => !v)}
          className='flex w-full items-center justify-between text-left'
        >
          <span>
            <span className='font-bold text-gray-900'>
              Credit payment details
            </span>
            <span className='ml-2 text-xs text-gray-500'>
              {savedMethods.length
                ? `${savedMethods.length} method${savedMethods.length === 1 ? '' : 's'} — ${savedMethods
                    .map((m) => m.label)
                    .join(', ')}`
                : usingFallback
                  ? `using the subscription accounts — ${fallbackMethods
                      .map((m) => m.label)
                      .join(', ')}`
                  : '⚠ none set — you can’t send a quote yet'}
            </span>
          </span>
          <span className='text-gray-400'>{showSettings ? '▲' : '▼'}</span>
        </button>

        {showSettings && (
          <div className='mt-4 space-y-3'>
            <p className='text-xs text-gray-500'>
              Where credit buyers send money. Leave this empty and credit quotes
              use the subscription accounts from Settings → Manual Requests —
              fill it in only when credits are collected somewhere else.
            </p>

            {creditMethods.map((m, i) => (
              <div key={i} className='flex gap-2'>
                <input
                  value={m.label}
                  onChange={(e) => {
                    const next = [...creditMethods];
                    next[i] = { ...next[i], label: e.target.value };
                    setCreditMethods(next);
                  }}
                  placeholder='Payoneer'
                  className='w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
                <input
                  value={m.value}
                  onChange={(e) => {
                    const next = [...creditMethods];
                    next[i] = { ...next[i], value: e.target.value };
                    setCreditMethods(next);
                  }}
                  placeholder='you@example.com'
                  className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm'
                />
                <button
                  type='button'
                  onClick={() =>
                    setCreditMethods(creditMethods.filter((_, x) => x !== i))
                  }
                  className='rounded-lg px-3 text-gray-400 hover:text-red-600'
                  aria-label='Remove'
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type='button'
              onClick={() =>
                setCreditMethods([...creditMethods, { label: '', value: '' }])
              }
              className='rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200'
            >
              + Add a method
            </button>

            <textarea
              rows={2}
              value={creditNote}
              onChange={(e) => setCreditNote(e.target.value)}
              placeholder='Optional note added to the credit quote email — bank reference format, bulk terms, etc.'
              className='w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />

            <div className='flex flex-wrap items-center gap-3'>
              <button
                type='button'
                onClick={saveSettings}
                disabled={savingSettings}
                className='rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50'
              >
                {savingSettings ? 'Saving…' : 'Save credit payment details'}
              </button>
              <p className='text-xs text-gray-500'>
                These appear in the email credit buyers receive. The note only
                goes out while your own methods are set.
              </p>
            </div>
          </div>
        )}
      </div>

      {methods.length === 0 && (
        <div className='mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900'>
          No payment methods are set here or in Settings → Manual Requests, so no
          quote can be emailed yet. Add one under{' '}
          <strong>Credit payment details</strong> above.
        </div>
      )}

      <div className='mt-5 flex flex-wrap items-center gap-2'>
        <button
          type='button'
          onClick={() => setFilter('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {STATUSES.map((s) => (
          <button
            key={s.key}
            type='button'
            onClick={() => setFilter(s.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              filter === s.key
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
            {counts[s.key] ? (
              <span className='ml-1.5 opacity-60'>{counts[s.key]}</span>
            ) : null}
          </button>
        ))}

        {/* Cards read one request at a time; the list compares many. Which one
            you want depends on whether you are answering or reviewing, so it's
            a toggle, and it's remembered per browser. */}
        <div className='ml-auto flex overflow-hidden rounded-lg ring-1 ring-gray-300'>
          {[
            { key: 'cards', label: 'Cards' },
            { key: 'list', label: 'List' },
          ].map((v) => (
            <button
              key={v.key}
              type='button'
              onClick={() => setView(v.key)}
              className={`px-3 py-1.5 text-xs font-semibold transition ${
                view === v.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className='mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700'>
          {error}
        </div>
      )}

      {!loading && summary.open > 0 && (
        <div className='mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-gray-200 sm:grid-cols-3'>
          <Cell label='Still open' hint='new, contacted, awaiting payment or paid'>
            {summary.open}
          </Cell>
          <Cell label='Credits asked for' hint='where a quantity was named'>
            {summary.credits || '—'}
          </Cell>
          <Cell
            label='Worth'
            hint={
              summary.priced
                ? `${summary.priced} of ${summary.open} priced by a saved pack`
                : 'no open ask matches a saved pack'
            }
          >
            {moneyMap(summary.value)}
          </Cell>
        </div>
      )}

      {loading ? (
        <p className='py-12 text-center text-sm text-gray-500'>Loading…</p>
      ) : requests.length === 0 ? (
        <p className='py-12 text-center text-sm text-gray-500'>
          No credit requests here. They arrive when someone picks credits in the
          &ldquo;Pay per download&rdquo; section of the pricing page.
        </p>
      ) : view === 'list' ? (
        // Dense view: one line per request, for scanning or comparing many.
        // Everything here is also on the card — nothing is only visible in one
        // of the two views, or you'd have to switch to be sure.
        <div className='mt-5 overflow-x-auto'>
          <table className='w-full min-w-[1000px] text-left text-sm'>
            <thead>
              <tr className='border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500'>
                <th className='py-3 pr-4 font-bold'>Customer</th>
                <th className='py-3 pr-4 font-bold'>Wants</th>
                <th className='py-3 pr-4 font-bold'>Price</th>
                <th className='py-3 pr-4 font-bold'>Balance</th>
                <th className='py-3 pr-4 font-bold'>Paid before</th>
                <th className='py-3 pr-4 font-bold'>Status</th>
                <th className='py-3 font-bold' />
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => {
                const c = r.customer || {};
                const q = r.quote || {};
                const paid = r.payments || {};
                const given = givenParts(r.fulfillment);

                return (
                  <tr key={r._id} className='border-b border-gray-100 align-top'>
                    <td className='py-3 pr-4'>
                      <p className='font-semibold text-gray-900'>
                        {c.name || r.name || 'Unnamed'}
                      </p>
                      <p className='text-xs text-gray-500'>{r.email}</p>
                      <p className='text-xs text-gray-400'>
                        {[
                          c.country
                            ? `${c.country}${c.countryFromIp ? ' (IP)' : ''}`
                            : null,
                          c.joinedAt ? `joined ${fmtDay(c.joinedAt)}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <div className='mt-1 flex flex-wrap gap-1'>
                        {c.blocked && (
                          <span className='rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700'>
                            Blocked
                          </span>
                        )}
                        {c.emailVerified === false && (
                          <span className='rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800'>
                            Unverified
                          </span>
                        )}
                        {c.subscription?.active && (
                          <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[11px] font-semibold text-gray-600'>
                            Subscriber
                          </span>
                        )}
                      </div>
                    </td>

                    <td className='py-3 pr-4'>
                      <p className='font-semibold text-gray-900'>
                        {r.creditQuantity ? `${r.creditQuantity} credits` : '—'}
                      </p>
                      {r.preferredMethod && (
                        <p className='text-xs text-gray-500'>
                          via {r.preferredMethod}
                        </p>
                      )}
                    </td>

                    <td className='py-3 pr-4'>
                      <p className='font-semibold text-gray-900'>
                        {q.source === 'pack'
                          ? money(q.amountCents, q.currency)
                          : r.offeredAmount != null
                            ? `$${Number(r.offeredAmount).toFixed(2)}`
                            : '—'}
                      </p>
                      {q.source !== 'pack' && r.creditQuantity && (
                        <p className='text-xs text-gray-400'>
                          {r.offeredAmount != null
                            ? 'their offer'
                            : 'no saved pack'}
                        </p>
                      )}
                    </td>

                    <td className='py-3 pr-4'>
                      <span
                        className={
                          c.creditsExpired
                            ? 'font-semibold text-gray-400 line-through'
                            : 'font-semibold text-gray-900'
                        }
                      >
                        {c.creditBalance || 0}
                      </span>
                    </td>

                    <td className='py-3 pr-4'>
                      <p className='text-gray-900'>
                        {paid.count ? moneyMap(paid.paidByCurrency) : '—'}
                      </p>
                      {paid.lastAt && (
                        <p className='text-xs text-gray-400'>
                          {paid.lastMethod || 'payment'} · {fmtDay(paid.lastAt)}
                        </p>
                      )}
                    </td>

                    <td className='py-3 pr-4'>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${chipFor(r.status)}`}
                      >
                        {labelFor(r.status)}
                      </span>
                      <p className='mt-1 text-xs text-gray-400'>
                        {waitingLabel(r) || fmtDay(r.createdAt)}
                      </p>
                      {given.length > 0 && (
                        <p className='mt-1 text-xs text-gray-600'>
                          Given: {given.join(' · ')}
                        </p>
                      )}
                    </td>

                    <td className='py-3'>
                      <div className='flex flex-wrap items-center justify-end gap-2'>
                        <select
                          value={r.status}
                          disabled={busyId === r._id}
                          onChange={(e) => update(r._id, { status: e.target.value })}
                          className='rounded-lg border border-gray-300 px-2 py-1.5 text-xs font-semibold'
                        >
                          {STATUSES.map((s) => (
                            <option key={s.key} value={s.key}>
                              {s.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type='button'
                          onClick={() => openComposer(r)}
                          className='rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-gray-800 ring-1 ring-gray-300 hover:bg-gray-50'
                        >
                          {r.paymentDetailsSentAt ? 'Re-send' : 'Quote'}
                        </button>
                        <button
                          type='button'
                          onClick={() => setGrantFor(r)}
                          className='rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-black'
                        >
                          Add credits
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className='mt-5 space-y-4'>
          {requests.map((r) => {
            const c = r.customer || {};
            const q = r.quote || {};
            const paid = r.payments || {};
            const waiting = waitingLabel(r);

            return (
              <div
                key={r._id}
                className='overflow-hidden rounded-xl border border-gray-200'
              >
                {/* Who — identity first, because the answer to "how do I price
                    this?" usually starts with who is asking. */}
                <div className='flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 sm:px-5'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-bold text-gray-900'>
                        {c.name || r.name || 'Unnamed'}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${chipFor(r.status)}`}
                      >
                        {labelFor(r.status)}
                      </span>
                      {/* Only what changes a decision: whether they can even
                          use what you are about to sell them. */}
                      {c.blocked && (
                        <span className='rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold text-red-700'>
                          Blocked
                        </span>
                      )}
                      {c.emailVerified === false && (
                        <span className='rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800'>
                          Email unverified
                        </span>
                      )}
                      {c.subscription?.active && (
                        <span className='rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-bold text-gray-700'>
                          Also subscribed
                        </span>
                      )}
                      {/* Returning customers only — on a first request this
                          badge would be noise on every row. */}
                      {r.history?.total > 1 && (
                        <span
                          title={historyTitle(r.history)}
                          className='rounded-full bg-gray-900 px-2.5 py-0.5 text-[11px] font-bold text-white'
                        >
                          {ordinal(r.history.sequence)} request
                          {r.history.granted > 0 && ` · ${r.history.granted} granted`}
                        </span>
                      )}
                    </div>

                    <div className='mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600'>
                      <a
                        href={`mailto:${r.email}?subject=${encodeURIComponent('Your Embroidize download credits')}`}
                        className='font-semibold text-gray-800 underline decoration-gray-300 underline-offset-2'
                      >
                        {r.email}
                      </a>
                      <button
                        type='button'
                        onClick={() => copy(r.email)}
                        className='text-gray-400 hover:text-gray-700'
                        title='Copy email address'
                      >
                        copy
                      </button>
                      {c.country && (
                        <span title={c.countryFromIp ? 'From their IP — not entered by the customer' : 'From their account details'}>
                          {c.city ? `${c.city}, ` : ''}
                          {c.country}
                          {c.countryFromIp ? ' (IP)' : ''}
                        </span>
                      )}
                      {c.phone && <span>{c.phone}</span>}
                      {c.joinedAt && <span>joined {fmtDay(c.joinedAt)}</span>}
                      {c.downloads ? <span>{c.downloads} downloads</span> : null}
                    </div>
                  </div>

                  {waiting && (
                    <span className='shrink-0 rounded-lg bg-white px-3 py-1 text-xs font-semibold text-gray-600 ring-1 ring-gray-200'>
                      {waiting}
                    </span>
                  )}
                </div>

                {/* What they asked for, what it costs, and what they already
                    have — the four numbers the decision is made on. */}
                <div className='grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4'>
                  <Cell label='Wants'>
                    {r.creditQuantity ? (
                      <>
                        {r.creditQuantity}{' '}
                        <span className='text-sm font-semibold text-gray-500'>
                          credits
                        </span>
                      </>
                    ) : (
                      <span className='text-sm font-semibold text-gray-500'>
                        Quantity to agree
                      </span>
                    )}
                  </Cell>

                  {/* A published pack prices itself. Otherwise the only figure
                      in play is the customer's own offer — shown as theirs, so
                      it is never mistaken for a price we set. */}
                  <Cell
                    label={q.source === 'pack' ? 'Price' : 'They offered'}
                    hint={
                      q.source === 'pack'
                        ? q.perCreditCents != null
                          ? `${money(q.perCreditCents, q.currency)} per credit`
                          : 'saved pack'
                        : r.offeredAmount != null
                          ? `their offer for ${r.creditQuantity} — you still quote`
                          : r.creditQuantity
                            ? 'no saved pack this size — quote it yourself'
                            : 'quote once the quantity is agreed'
                    }
                  >
                    {q.source === 'pack' ? (
                      money(q.amountCents, q.currency)
                    ) : r.offeredAmount != null ? (
                      `$${Number(r.offeredAmount).toFixed(2)}`
                    ) : (
                      <span className='text-sm font-semibold text-gray-500'>—</span>
                    )}
                  </Cell>

                  <Cell
                    label='Balance now'
                    hint={
                      c.creditsExpireAt
                        ? c.creditsExpired
                          ? `expired ${fmtDay(c.creditsExpireAt)}`
                          : `expires ${fmtDay(c.creditsExpireAt)}`
                        : c.creditBalance
                          ? 'no expiry'
                          : ''
                    }
                  >
                    <span className={c.creditsExpired ? 'text-gray-400 line-through' : ''}>
                      {c.creditBalance || 0}
                    </span>
                  </Cell>

                  <Cell
                    label='Paid before'
                    hint={
                      paid.lastAt
                        ? `${paid.lastMethod || 'payment'} · ${fmtDay(paid.lastAt)}`
                        : c.boughtCreditsBefore
                          ? 'credits granted, no payment recorded'
                          : 'first purchase'
                    }
                  >
                    {paid.count ? (
                      moneyMap(paid.paidByCurrency)
                    ) : (
                      <span className='text-sm font-semibold text-gray-500'>—</span>
                    )}
                  </Cell>
                </div>

                <GivenStrip fulfillment={r.fulfillment} />

                <div className='flex flex-wrap items-end justify-between gap-3 px-4 py-3 sm:px-5'>
                  <div className='min-w-0 flex-1'>
                    {r.preferredMethod && (
                      <p className='text-sm text-gray-700'>
                        Prefers to pay by <strong>{r.preferredMethod}</strong>
                      </p>
                    )}
                    {r.message && (
                      <p className='mt-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700'>
                        {r.message}
                      </p>
                    )}
                    <p className='mt-2 text-xs text-gray-400'>
                      Received {fmt(r.createdAt)}
                      {r.paymentDetailsSentAt
                        ? ` · quote sent ${fmt(r.paymentDetailsSentAt)}`
                        : ''}
                      {r.quotedAmount != null ? ` · quoted $${r.quotedAmount}` : ''}
                      {r.grantedAt ? ` · credits added ${fmt(r.grantedAt)}` : ''}
                    </p>
                  </div>

                  <div className='flex shrink-0 flex-wrap items-center gap-2'>
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
                      type='button'
                      onClick={() => openComposer(r)}
                      className='rounded-lg bg-white px-4 py-2 text-xs font-bold text-gray-800 ring-1 ring-gray-300 hover:bg-gray-50'
                    >
                      {r.paymentDetailsSentAt ? 'Re-send quote' : 'Send payment details'}
                    </button>
                    <button
                      type='button'
                      onClick={() => setGrantFor(r)}
                      className='rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white hover:bg-black'
                    >
                      Add credits →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quote composer — a quantity and a price, nothing about plans. */}
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

            {methods.length === 0 ? (
              <div className='mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900'>
                No payment methods are configured yet. Add one under Credit
                payment details, or the email has nowhere to tell them to send
                money.
              </div>
            ) : (
              <p className='mt-3 text-xs text-gray-500'>
                They&apos;ll be asked to pay into{' '}
                {methods.map((m) => m.label).join(', ')}
                {usingFallback ? ' (your subscription accounts)' : ''}.
              </p>
            )}

            <label className='mb-1 mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Credits to quote
            </label>
            <input
              type='number'
              min='1'
              step='1'
              value={sendCredits}
              onChange={(e) => {
                const v = e.target.value;
                setSendCredits(v);
                const pack = packs.find((p) => Number(p.credits) === Number(v));
                if (pack) setSendAmount(String((pack.priceCents || 0) / 100));
              }}
              placeholder='100'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />
            {packs.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-2'>
                {packs.map((p, i) => (
                  <button
                    key={i}
                    type='button'
                    onClick={() => {
                      setSendCredits(String(p.credits));
                      setSendAmount(String((p.priceCents || 0) / 100));
                    }}
                    className='rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200'
                  >
                    {p.credits} for ${((p.priceCents || 0) / 100).toFixed(2)}
                  </button>
                ))}
              </div>
            )}

            <label className='mb-1 mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Amount to quote (USD)
            </label>
            <input
              type='number'
              step='0.01'
              min='0'
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              placeholder='5.00'
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />
            <p className='mt-1 text-xs text-gray-500'>
              {sendFor.offeredAmount != null
                ? `They offered $${Number(sendFor.offeredAmount).toFixed(2)} for ${sendFor.creditQuantity} credits — accept it or type your own.`
                : 'Fills in from a saved pack when the quantity matches one. Type your own for a bulk price — nothing is quoted that you didn’t enter.'}
            </p>

            <div className='mt-5 rounded-xl bg-gray-50 p-3 text-xs leading-relaxed text-gray-600'>
              They&apos;ll be told to put <strong>{sendFor.email}</strong> in the
              payment note, and to reply once sent. Status moves to{' '}
              <strong>Awaiting payment</strong>.
            </div>

            <div className='mt-5 flex justify-end gap-2'>
              <button
                type='button'
                onClick={() => setSendFor(null)}
                className='rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700'
              >
                Cancel
              </button>
              <button
                type='button'
                onClick={doSend}
                disabled={
                  sending ||
                  methods.length === 0 ||
                  !Number(sendCredits) ||
                  sendAmount === ''
                }
                className='rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50'
              >
                {sending ? 'Sending…' : 'Send email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {grantFor && (
        // Granting marks the request done from here rather than leaving it to
        // the admin to remember — that second step is how a paid request sits
        // in "awaiting payment" forever.
        <AddCreditsModal
          user={{ _id: grantFor.userId, name: grantFor.name, email: grantFor.email }}
          initialCreditAmount={grantFor.creditQuantity || undefined}
          requestId={grantFor._id}
          onClose={() => setGrantFor(null)}
          onAdded={(result) => {
            // The server closes the request and records what it gave. The PATCH
            // is only a fallback for the one case it couldn't (a deleted or
            // mismatched row), so the queue never strands a fulfilled request.
            if (!result?.requestClosed) update(grantFor._id, { status: 'granted' });
            else reload();
            setGrantFor(null);
            onGranted?.();
          }}
        />
      )}
    </div>
  );
}
