'use client';

import GrantAccessModal from '@/features/admin/GrantAccessModal';
import { financeHeaders } from '@/lib/financeLock';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

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

export default function CreditCustomersWrapper({ customers = [], totals }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  // Topping up from the row is the whole point of having the list.
  const [grantUser, setGrantUser] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    if (!grantUser || plans.length) return;
    (async () => {
      try {
        const token = Cookies.get('token');
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/subscription-plans`,
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              ...financeHeaders(),
            },
          },
        );
        const data = await res.json();
        setPlans(data?.data?.plans || []);
      } catch {
        // Plans are only needed for a TIME grant. A credit top-up needs none,
        // so a failure here must not block the reason this button exists.
        setPlans([]);
      }
    })();
  }, [grantUser, plans.length]);

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
        <h1 className='text-xl font-bold text-gray-900'>Credit Customers</h1>
        <p className='mt-1 max-w-3xl text-sm text-gray-500'>
          Everyone who has ever held download credits. Credits are a prepaid
          wallet on the account rather than a subscription, so these customers
          never appear on the Subscribers page.
        </p>
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
                      <p className='font-semibold text-gray-900'>{c.name || '—'}</p>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {grantUser && (
        <GrantAccessModal
          user={grantUser}
          plans={plans}
          onClose={() => setGrantUser(null)}
          onGranted={() => router.refresh()}
        />
      )}
    </div>
  );
}
