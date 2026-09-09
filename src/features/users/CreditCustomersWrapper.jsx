'use client';

import { ErrorToast } from '@/components/Common/ErrorToast';
import { SuccessToast } from '@/components/Common/SuccessToast';
import AddCreditsModal from '@/features/admin/AddCreditsModal';
import { openInvoice } from '@/features/admin/invoice';
import { financeHeaders } from '@/lib/financeLock';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Credit customers.
//
// These people are invisible on the Subscribers page and always will be: a
// credit purchase deliberately never creates a UserSubscription row (the
// gateway webhooks upsert that row and would wipe paid-for credits), so a page
// built from subscriptions cannot see them. Hence a list of its own.
//
// A row can exist for three different reasons, and the filters name them: the
// customer still holds a balance, they bought and spent it all, or they were
// comped with no payment attached.
// ─────────────────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'holding', label: 'Has credits left' },
  { key: 'spent', label: 'Spent out' },
  { key: 'expired', label: 'Expired' },
  { key: 'comped', label: 'Comped' },
];

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '—';

const money = (cents, currency = 'USD') => {
  const v = (Number(cents) || 0) / 100;
  return currency === 'USD' ? `$${v.toFixed(2)}` : `${currency} ${v.toFixed(2)}`;
};

// A customer may have paid in more than one currency; adding those together
// would invent a number, so each is printed on its own.
const moneyMap = (byCurrency) => {
  const entries = Object.entries(byCurrency || {});
  if (entries.length === 0) return '—';
  return entries.map(([cur, cents]) => money(cents, cur)).join(' + ');
};

const apiBase = () => process.env.NEXT_PUBLIC_BASE_API_URL_PROD;

const authHeaders = () => {
  const token = Cookies.get('token');
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...financeHeaders(),
  };
};

// The printable receipt speaks the invoice-row shape the admin Invoices tab and
// the customer's own receipts already use. Built here from the ledger row so a
// credit purchase prints the identical document, not a second rendering that
// could drift away from the one support is looking at.
const toInvoice = (purchase) => ({
  id: purchase._id,
  source: 'manual',
  number: purchase.invoiceNumber,
  date: purchase.receivedAt,
  description: purchase.packName || `${purchase.credits} download credits`,
  amount: (purchase.amountCents || 0) / 100,
  amountRefunded: 0,
  currency: purchase.currency || 'USD',
  status: 'paid',
  manualMethod: purchase.method,
  manualReference: purchase.reference,
  receiptNumber: purchase.reference,
  manualPlan: {
    name: purchase.packName || `${purchase.credits} download credits`,
    type: 'one-time',
    accessType: 'credits',
    downloadLimit: purchase.credits,
    dailyLimit: null,
  },
});

export default function CreditCustomersWrapper({ customers = [], totals }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  // Topping up from the row is the whole point of having the list.
  const [grantUser, setGrantUser] = useState(null);

  // One customer's full ledger, loaded on demand.
  const [detailFor, setDetailFor] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTab, setDetailTab] = useState('ledger');

  // Credit packs shown on the pricing page. Config, not code: prices change,
  // and nothing may be quoted to a customer that wasn't typed here.
  const [showPacks, setShowPacks] = useState(false);
  const [packs, setPacks] = useState([]);
  const [packsNote, setPacksNote] = useState('');
  const [packsSaving, setPacksSaving] = useState(false);

  const loadPacks = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase()}/admin/credit-packs`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setPacks(data?.data?.creditPacks || []);
      setPacksNote(data?.data?.creditPacksNote || '');
    } catch {
      setPacks([]);
    }
  }, []);

  useEffect(() => {
    if (showPacks) loadPacks();
  }, [showPacks, loadPacks]);

  const savePacks = async () => {
    setPacksSaving(true);
    try {
      const res = await fetch(`${apiBase()}/admin/credit-packs`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ creditPacks: packs, creditPacksNote: packsNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Could not save');
      setPacks(data?.data?.creditPacks || []);
      SuccessToast('Saved', 'Credit packs updated on the pricing page.', 4000);
    } catch (err) {
      ErrorToast('Could not save', err.message, 5000);
    } finally {
      setPacksSaving(false);
    }
  };

  const openDetail = async (customer) => {
    setDetailFor(customer);
    setDetailTab('ledger');
    setDetail(null);
    setDetailLoading(true);
    try {
      const res = await fetch(`${apiBase()}/admin/users/${customer._id}/credits`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || 'Could not load');
      setDetail(data?.data || null);
    } catch (err) {
      ErrorToast('Could not load history', err.message, 5000);
      setDetailFor(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = customers;

    if (filter === 'holding') {
      list = list.filter((c) => c.balance > 0 && !c.creditsExpired);
    } else if (filter === 'spent') {
      list = list.filter((c) => c.balance === 0);
    } else if (filter === 'expired') {
      list = list.filter((c) => c.creditsExpired);
    } else if (filter === 'comped') {
      list = list.filter((c) => c.comped);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.lastInvoice?.toLowerCase().includes(q),
      );
    }
    return list;
  }, [customers, filter, query]);

  const counts = useMemo(
    () => ({
      all: customers.length,
      holding: customers.filter((c) => c.balance > 0 && !c.creditsExpired).length,
      spent: customers.filter((c) => c.balance === 0).length,
      expired: customers.filter((c) => c.creditsExpired).length,
      comped: customers.filter((c) => c.comped).length,
    }),
    [customers],
  );

  const exportCsv = () => {
    const head = [
      'Name',
      'Email',
      'Balance',
      'Expires',
      'Credits bought',
      'Purchases',
      'Paid',
      'Last payment',
      'Method',
      'Last invoice',
    ];
    const rows = filtered.map((c) => [
      c.name || '',
      c.email || '',
      c.creditsExpired ? 0 : c.balance,
      c.creditsExpireAt ? fmtDate(c.creditsExpireAt) : '',
      c.creditsBought,
      c.purchaseCount,
      c.comped ? '' : moneyMap(c.paidByCurrency),
      c.lastPurchaseAt ? fmtDate(c.lastPurchaseAt) : '',
      c.lastMethod || '',
      c.lastInvoice || '',
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `credit-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className='space-y-6'>
      <div className='rounded-2xl bg-white p-6 shadow-sm'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Credit Customers</h1>
            <p className='mt-1 max-w-3xl text-sm text-gray-500'>
              Everyone who has ever held download credits. Credits are a prepaid
              wallet on the account rather than a subscription, so these
              customers never appear on the Subscribers page.
            </p>
          </div>
          <button
            type='button'
            onClick={() => setShowPacks((v) => !v)}
            className='rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50'
          >
            {showPacks ? 'Hide packs' : 'Credit packs & pricing'}
          </button>
        </div>

        {showPacks && (
          <div className='mt-6 rounded-xl border border-gray-200 p-5'>
            <p className='text-sm font-bold text-gray-900'>
              Packs shown on the pricing page
            </p>
            <p className='mt-1 text-xs text-gray-500'>
              Leave this empty and the credits offer still appears, but with no
              prices — customers ask and you quote. Nothing here is charged
              automatically; it is what the page advertises.
            </p>

            <div className='mt-4 space-y-2'>
              {packs.map((p, i) => (
                <div key={i} className='flex flex-wrap items-center gap-2'>
                  <input
                    type='number'
                    min='1'
                    value={p.credits}
                    onChange={(e) =>
                      setPacks((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, credits: Number(e.target.value) } : x,
                        ),
                      )
                    }
                    className='w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm'
                    placeholder='Credits'
                  />
                  <span className='text-xs text-gray-500'>credits for</span>
                  <input
                    type='number'
                    min='0'
                    step='0.01'
                    value={(p.priceCents ?? 0) / 100}
                    onChange={(e) =>
                      setPacks((prev) =>
                        prev.map((x, j) =>
                          j === i
                            ? {
                                ...x,
                                priceCents: Math.round(Number(e.target.value) * 100),
                              }
                            : x,
                        ),
                      )
                    }
                    className='w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm'
                    placeholder='Price'
                  />
                  <select
                    value={p.currency || 'USD'}
                    onChange={(e) =>
                      setPacks((prev) =>
                        prev.map((x, j) =>
                          j === i ? { ...x, currency: e.target.value } : x,
                        ),
                      )
                    }
                    className='rounded-lg border border-gray-300 px-2 py-2 text-sm'
                  >
                    {['USD', 'EUR', 'GBP'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <button
                    type='button'
                    onClick={() => setPacks((prev) => prev.filter((_, j) => j !== i))}
                    className='text-xs font-semibold text-gray-500 underline'
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type='button'
              onClick={() =>
                setPacks((prev) => [
                  ...prev,
                  { credits: 100, priceCents: 500, currency: 'USD' },
                ])
              }
              className='mt-3 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
            >
              + Add a pack
            </button>

            <label className='mt-4 block text-xs font-bold uppercase tracking-wide text-gray-500'>
              Note under the packs (optional)
            </label>
            <input
              value={packsNote}
              onChange={(e) => setPacksNote(e.target.value)}
              placeholder='e.g. Need more? Ask us for a bulk price.'
              className='mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />

            <button
              type='button'
              onClick={savePacks}
              disabled={packsSaving}
              className='mt-4 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:opacity-50'
            >
              {packsSaving ? 'Saving…' : 'Save packs'}
            </button>
          </div>
        )}
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[
          {
            label: 'Credit customers',
            value: totals?.customers ?? customers.length,
          },
          { label: 'Credits sold', value: totals?.creditsSold ?? 0 },
          {
            label: 'Credits outstanding',
            value: totals?.creditsOutstanding ?? 0,
            sub: 'Paid for, not yet downloaded',
          },
          {
            label: 'Collected',
            value: moneyMap(totals?.revenueByCurrency),
            sub: 'Credit packs only',
          },
        ].map((s) => (
          <div key={s.label} className='rounded-2xl bg-white p-5 shadow-sm'>
            <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>
              {s.label}
            </p>
            <p className='mt-2 text-2xl font-bold text-gray-900'>{s.value}</p>
            {s.sub && <p className='mt-1 text-xs text-gray-400'>{s.sub}</p>}
          </div>
        ))}
      </div>

      <div className='rounded-2xl bg-white p-6 shadow-sm'>
        <div className='mb-4 flex flex-wrap items-center gap-2'>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type='button'
              onClick={() => setFilter(f.key)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
              <span className='ml-1.5 opacity-60'>{counts[f.key]}</span>
            </button>
          ))}

          <div className='ml-auto flex items-center gap-2'>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search name, email or invoice…'
              className='w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm'
            />
            <button
              type='button'
              onClick={exportCsv}
              disabled={filtered.length === 0}
              className='rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40'
            >
              Export CSV
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className='py-12 text-center text-sm text-gray-500'>
            {customers.length === 0
              ? 'Nobody has been given download credits yet.'
              : 'No customers match this filter.'}
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[900px] text-left text-sm'>
              <thead>
                <tr className='border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500'>
                  <th className='py-3 pr-4 font-bold'>Customer</th>
                  <th className='py-3 pr-4 font-bold'>Balance</th>
                  <th className='py-3 pr-4 font-bold'>Bought</th>
                  <th className='py-3 pr-4 font-bold'>Paid</th>
                  <th className='py-3 pr-4 font-bold'>Last payment</th>
                  <th className='py-3 pr-4 font-bold'>Also subscribed</th>
                  <th className='py-3 font-bold' />
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className='border-b border-gray-100 align-top'>
                    <td className='py-4 pr-4'>
                      <button
                        type='button'
                        onClick={() => openDetail(c)}
                        className='text-left font-semibold text-gray-900 hover:underline'
                      >
                        {c.name || '—'}
                      </button>
                      <p className='text-xs text-gray-500'>{c.email}</p>
                      {c.status === 'blocked' && (
                        <span className='mt-1 inline-block rounded bg-red-50 px-1.5 py-0.5 text-[11px] font-semibold text-red-700'>
                          Blocked
                        </span>
                      )}
                    </td>

                    <td className='py-4 pr-4'>
                      <span
                        className={`text-lg font-bold ${
                          c.creditsExpired
                            ? 'text-gray-400 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {c.balance}
                      </span>
                      {c.creditsExpireAt && (
                        <p
                          className={`text-xs ${
                            c.creditsExpired ? 'text-red-600' : 'text-gray-500'
                          }`}
                        >
                          {c.creditsExpired ? 'Expired ' : 'Expires '}
                          {fmtDate(c.creditsExpireAt)}
                        </p>
                      )}
                    </td>

                    <td className='py-4 pr-4 text-gray-700'>
                      {c.creditsBought || c.creditsGranted || 0}
                      <p className='text-xs text-gray-500'>
                        {c.purchaseCount > 0
                          ? `${c.purchaseCount} purchase${c.purchaseCount === 1 ? '' : 's'}`
                          : `${c.grantCount} grant${c.grantCount === 1 ? '' : 's'}`}
                      </p>
                    </td>

                    <td className='py-4 pr-4 text-gray-700'>
                      {c.comped ? (
                        <span
                          className='rounded bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600'
                          title='Credits were granted with no payment recorded'
                        >
                          Comped
                        </span>
                      ) : (
                        moneyMap(c.paidByCurrency)
                      )}
                    </td>

                    <td className='py-4 pr-4 text-gray-700'>
                      {c.lastPurchaseAt ? (
                        <>
                          {fmtDate(c.lastPurchaseAt)}
                          <p className='text-xs text-gray-500'>{c.lastMethod}</p>
                          {c.lastInvoice && (
                            <p className='text-xs text-gray-400'>{c.lastInvoice}</p>
                          )}
                        </>
                      ) : (
                        <span className='text-gray-400'>
                          {c.lastGrantAt ? fmtDate(c.lastGrantAt) : '—'}
                        </span>
                      )}
                    </td>

                    <td className='py-4 pr-4'>
                      {c.subscription ? (
                        <span
                          className='rounded bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white'
                          title={`${c.subscription.gateway} · ${c.subscription.status}`}
                        >
                          {c.subscription.active ? 'Active plan' : 'Past plan'}
                        </span>
                      ) : (
                        <span className='text-xs text-gray-400'>Credits only</span>
                      )}
                    </td>

                    <td className='py-4 text-right'>
                      <div className='flex justify-end gap-2'>
                        <button
                          type='button'
                          onClick={() => openDetail(c)}
                          className='rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
                        >
                          History
                        </button>
                        <button
                          type='button'
                          // The modal shows "Current balance: N" from
                          // availableCredits — the same name /userinfo uses, and
                          // an expired balance counts as 0 there.
                          onClick={() =>
                            setGrantUser({
                              ...c,
                              availableCredits: c.creditsExpired ? 0 : c.balance,
                            })
                          }
                          className='rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-black'
                        >
                          Add credits
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── One customer's ledger ── */}
      {detailFor && (
        <div
          className='fixed inset-0 z-40 flex justify-end bg-black/40'
          onClick={() => setDetailFor(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className='h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-2xl'
          >
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-lg font-bold text-gray-900'>
                  {detailFor.name || detailFor.email}
                </h2>
                <p className='text-sm text-gray-500'>{detailFor.email}</p>
              </div>
              <button
                onClick={() => setDetailFor(null)}
                aria-label='Close'
                className='rounded-lg px-2 text-2xl leading-none text-gray-400 hover:text-gray-700'
              >
                ×
              </button>
            </div>

            {detailLoading && (
              <p className='py-12 text-center text-sm text-gray-500'>Loading…</p>
            )}

            {detail && (
              <>
                <div className='mt-5 grid grid-cols-3 gap-3'>
                  {[
                    { label: 'Balance', value: detail.balance },
                    { label: 'Added', value: detail.totals?.added ?? 0 },
                    { label: 'Used', value: detail.totals?.used ?? 0 },
                  ].map((t) => (
                    <div key={t.label} className='rounded-xl bg-gray-50 p-4'>
                      <p className='text-xs font-bold uppercase tracking-wide text-gray-500'>
                        {t.label}
                      </p>
                      <p className='mt-1 text-xl font-bold text-gray-900'>
                        {t.value}
                      </p>
                    </div>
                  ))}
                </div>

                {detail.creditsExpired && (
                  <p className='mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700'>
                    {detail.rawBalance} credits expired on{' '}
                    {fmtDate(detail.creditsExpireAt)} — grant again with a new
                    expiry to restore them.
                  </p>
                )}

                <div className='mt-5 flex gap-1 rounded-xl bg-gray-100 p-1'>
                  {[
                    { key: 'ledger', label: 'Credits added' },
                    { key: 'invoices', label: 'Payments' },
                    { key: 'downloads', label: 'Used on' },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type='button'
                      onClick={() => setDetailTab(t.key)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        detailTab === t.key
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {detailTab === 'ledger' && (
                  <ul className='mt-4 divide-y divide-gray-100'>
                    {detail.events?.length === 0 && (
                      <li className='py-8 text-center text-sm text-gray-500'>
                        No grants recorded.
                      </li>
                    )}
                    {detail.events?.map((e) => (
                      <li key={e._id} className='py-3'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm font-semibold text-gray-900'>
                            {/* A correction REPLACED the balance rather than
                                adding to it; "+100" would misreport it. */}
                            {e.corrected
                              ? `Balance set to ${e.balanceAfter}`
                              : `+${e.added} credits`}
                          </p>
                          <span className='text-xs text-gray-500'>
                            {fmtDate(e.at)}
                          </span>
                        </div>
                        <p className='text-xs text-gray-500'>
                          Balance after: {e.balanceAfter}
                          {e.admin?.name ? ` · by ${e.admin.name}` : ''}
                          {e.expiresAt ? ` · expires ${fmtDate(e.expiresAt)}` : ''}
                        </p>
                        {e.note && (
                          <p className='mt-1 rounded bg-gray-50 px-2 py-1 text-xs text-gray-600'>
                            {e.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {detailTab === 'invoices' && (
                  <ul className='mt-4 divide-y divide-gray-100'>
                    {detail.purchases?.length === 0 && (
                      <li className='py-8 text-center text-sm text-gray-500'>
                        No payments recorded — these credits were comped.
                      </li>
                    )}
                    {detail.purchases?.map((p) => (
                      <li
                        key={p._id}
                        className='flex items-center justify-between gap-4 py-3'
                      >
                        <div>
                          <p className='text-sm font-semibold text-gray-900'>
                            {p.credits} credits ·{' '}
                            {money(p.amountCents, p.currency)}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {fmtDate(p.receivedAt)} · {p.method}
                            {p.reference ? ` · ${p.reference}` : ''}
                          </p>
                          <p className='text-xs text-gray-400'>{p.invoiceNumber}</p>
                        </div>
                        <button
                          type='button'
                          onClick={() =>
                            openInvoice({
                              invoice: toInvoice(p),
                              customer: {
                                name: detail.user?.name,
                                email: detail.user?.email,
                                country: detail.user?.country,
                              },
                            })
                          }
                          className='shrink-0 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50'
                        >
                          Invoice
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {detailTab === 'downloads' && (
                  <>
                    <ul className='mt-4 divide-y divide-gray-100'>
                      {detail.spends?.length === 0 && (
                        <li className='py-8 text-center text-sm text-gray-500'>
                          No credit has been spent yet.
                        </li>
                      )}
                      {detail.spends?.map((s) => (
                        <li
                          key={s._id}
                          className='flex items-center justify-between gap-4 py-3'
                        >
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-semibold text-gray-900'>
                              {s.product?.name || 'Design'}
                            </p>
                            <p className='text-xs text-gray-500'>
                              {fmtDate(s.downloadedAt)}
                              {s.fileType ? ` · ${s.fileType.toUpperCase()}` : ''}
                            </p>
                          </div>
                          <span className='shrink-0 text-xs font-semibold text-gray-500'>
                            −1 credit
                          </span>
                        </li>
                      ))}
                    </ul>
                    {detail.spendMeta?.total > (detail.spends?.length || 0) && (
                      <p className='mt-3 text-center text-xs text-gray-500'>
                        Showing the {detail.spends.length} most recent of{' '}
                        {detail.spendMeta.total}.
                      </p>
                    )}
                  </>
                )}

                <button
                  type='button'
                  onClick={() => {
                    setGrantUser({
                      ...detailFor,
                      availableCredits: detail.balance,
                    });
                    setDetailFor(null);
                  }}
                  className='mt-6 w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-black'
                >
                  Add credits for this customer
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {grantUser && (
        <AddCreditsModal
          user={grantUser}
          onClose={() => setGrantUser(null)}
          onAdded={() => router.refresh()}
        />
      )}
    </div>
  );
}
