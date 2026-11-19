'use client';
import { Button, Input, Select, SelectItem, Spinner } from '@heroui/react';
import Cookies from 'js-cookie';
import UserTimelineModal from '@/features/users/UserTimelineModal';
import ZohoPushModal from '@/features/users/ZohoPushModal';
import { useEffect, useMemo, useState } from 'react';

// "Retarget" = never paid through any button in this period and not
// subscribed now. Everyone who paid somewhere is in paid / converted instead.
const STATUS = [
  ['retarget', 'Retarget: never paid'],
  ['started', 'Started checkout, never paid'],
  ['clicked', 'Clicked only, never paid'],
  ['paid', 'Paid'],
  ['converted', 'Paid elsewhere / subscribed'],
  ['all', 'All'],
];
const inStatus = (row, status) =>
  status === 'all' ||
  row.status === status ||
  (status === 'retarget' && (row.status === 'started' || row.status === 'clicked'));

const STATUS_CHIP = {
  paid: ['Paid', 'bg-gray-900 text-white'],
  converted: ['Paid elsewhere / subscribed', 'bg-gray-600 text-white'],
  started: ['Started, never paid', 'bg-gray-200 text-gray-800'],
  clicked: ['Clicked only', 'border border-gray-300 text-gray-600'],
};
const RANK = { paid: 4, converted: 3, started: 2, clicked: 1 };

// One row per user: buttons listed together, counts summed, best status kept
// (a user who paid through any button is "paid").
const mergeByUser = (rows) => {
  const map = new Map();
  rows.forEach((r) => {
    const k = String(r.userId);
    const m = map.get(k);
    if (!m) {
      map.set(k, { ...r, sources: [r.source], plans: [...r.plans] });
      return;
    }
    m.sources.push(r.source);
    m.planClicks += r.planClicks;
    m.checkoutsStarted += r.checkoutsStarted;
    m.paid += r.paid;
    m.paidCreditPacks += r.paidCreditPacks;
    m.plans = [...new Set([...m.plans, ...r.plans])];
    if (new Date(r.lastAt) > new Date(m.lastAt)) m.lastAt = r.lastAt;
    if (new Date(r.firstAt) < new Date(m.firstAt)) m.firstAt = r.firstAt;
    if (r.lastPaidAt && (!m.lastPaidAt || new Date(r.lastPaidAt) > new Date(m.lastPaidAt)))
      m.lastPaidAt = r.lastPaidAt;
    if (RANK[r.status] > RANK[m.status]) m.status = r.status;
  });
  return [...map.values()].map((m) => (m.paid > 0 ? { ...m, status: 'paid' } : m));
};

const PAGE = 50;

const when = (d) => {
  const t = new Date(d);
  return Number.isNaN(t.getTime())
    ? ''
    : t.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const csvCell = (v) => {
  const s = String(v ?? '');
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
};

/**
 * The people behind "Which buttons start checkouts": one row per user and
 * button, with their clicks, checkouts started and payments through it, and
 * whether they are subscribed now. Filter by button and by paid / not paid.
 */
export default function ButtonUsers({ days, sources, source, onSourceChange }) {
  const [state, setState] = useState({ loading: true, error: '', rows: [], truncated: false });
  const [status, setStatus] = useState('retarget');
  const [perUser, setPerUser] = useState(true);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const [timelineUser, setTimelineUser] = useState(null);
  const [zohoOpen, setZohoOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: '' }));
      try {
        const token = Cookies.get('token');
        const qs = new URLSearchParams({ days: String(days), ...(source ? { source } : {}) });
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_API_URL_PROD}/admin/tracking/button-users?${qs}`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} },
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || 'Could not load users.');
        if (!cancelled)
          setState({
            loading: false,
            error: '',
            rows: json.data.rows || [],
            truncated: !!json.data.truncated,
          });
      } catch (err) {
        if (!cancelled)
          setState({ loading: false, error: err.message || 'Could not load users.', rows: [], truncated: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [days, source]);

  useEffect(() => setShown(PAGE), [days, source, status, query, perUser]);

  const searched = useMemo(() => {
    const base = perUser
      ? mergeByUser(state.rows)
      : state.rows.map((r) => ({ ...r, sources: [r.source] }));
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (r) => r.email.toLowerCase().includes(q) || (r.name || '').toLowerCase().includes(q),
    );
  }, [state.rows, query, perUser]);

  const counts = useMemo(
    () => Object.fromEntries(STATUS.map(([k]) => [k, searched.filter((r) => inStatus(r, k)).length])),
    [searched],
  );

  const rows = searched.filter((r) => inStatus(r, status));
  const uniqueUserIds = [...new Set(rows.map((r) => String(r.userId)))];
  const statusLabel = STATUS.find(([k]) => k === status)?.[1] || status;

  const exportCsv = () => {
    const head = [
      'Email',
      'Name',
      'Button',
      'Status',
      'Plan clicks',
      'Checkouts started',
      'Payments',
      'Credit pack payments',
      'Plans',
      'Subscribed now',
      'First activity',
      'Last activity',
      'Last payment',
    ];
    const body = rows.map((r) =>
      [
        r.email,
        r.name,
        r.sources.join(' | '),
        STATUS_CHIP[r.status][0],
        r.planClicks,
        r.checkoutsStarted,
        r.paid,
        r.paidCreditPacks,
        r.plans.join(' | '),
        r.subscribedNow ? 'yes' : 'no',
        r.firstAt,
        r.lastAt,
        r.lastPaidAt || '',
      ]
        .map(csvCell)
        .join(','),
    );
    const blob = new Blob(['﻿' + [head.map(csvCell).join(','), ...body].join('\n')], {
      type: 'text/csv;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `button-users-${source || 'all'}-${status}-${days}d.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <section id='button-users' className='flex scroll-mt-24 flex-col gap-3'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h2 className='text-lg font-semibold'>Users behind each button</h2>
          <p className='text-sm text-gray-500'>
            One row per user and button in the last {days} days. Click a row to see that
            user&apos;s full activity.
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Select
            aria-label='Button'
            size='sm'
            className='w-56'
            selectedKeys={[source || 'all']}
            onChange={(e) => onSourceChange(e.target.value === 'all' ? '' : e.target.value)}
          >
            {[{ source: 'all' }, ...sources].map((s) => (
              <SelectItem key={s.source}>{s.source === 'all' ? 'All buttons' : s.source}</SelectItem>
            ))}
          </Select>
          <Input
            aria-label='Search users'
            size='sm'
            className='w-56'
            placeholder='Search email or name'
            value={query}
            onValueChange={setQuery}
            isClearable
            onClear={() => setQuery('')}
          />
          <Button size='sm' variant='bordered' onPress={exportCsv} isDisabled={!rows.length}>
            Download CSV
          </Button>
          <Button
            size='sm'
            className='bg-black text-white'
            onPress={() => setZohoOpen(true)}
            isDisabled={!uniqueUserIds.length}
          >
            Send to Zoho
          </Button>
        </div>
      </div>

      <div className='flex flex-wrap items-center gap-2 text-sm'>
        <span className='text-gray-500'>Show</span>
        {[
          [true, 'One row per user'],
          [false, 'One row per user and button'],
        ].map(([v, label]) => (
          <Button
            key={label}
            size='sm'
            variant={perUser === v ? 'solid' : 'flat'}
            className={perUser === v ? 'bg-black text-white' : ''}
            onPress={() => setPerUser(v)}
          >
            {label}
          </Button>
        ))}
      </div>

      <div className='flex flex-wrap gap-2'>
        {STATUS.map(([k, label]) => (
          <Button
            key={k}
            size='sm'
            variant={k === status ? 'solid' : 'flat'}
            className={k === status ? 'bg-black text-white' : ''}
            onPress={() => setStatus(k)}
          >
            {label} ({counts[k]})
          </Button>
        ))}
      </div>

      <div className='overflow-x-auto rounded-xl border border-gray-200 bg-white'>
        <table className='w-full min-w-[860px] text-sm'>
          <thead className='bg-gray-50 text-left text-xs uppercase text-gray-500'>
            <tr>
              <th className='px-4 py-2'>User</th>
              <th className='px-4 py-2'>Button</th>
              <th className='px-4 py-2'>Status</th>
              <th className='px-4 py-2 text-right'>Plan clicks</th>
              <th className='px-4 py-2 text-right'>Checkouts</th>
              <th className='px-4 py-2 text-right'>Paid</th>
              <th className='px-4 py-2'>Plans</th>
              <th className='px-4 py-2'>Subscribed now</th>
              <th className='px-4 py-2'>Last activity</th>
            </tr>
          </thead>
          <tbody>
            {state.loading && (
              <tr>
                <td colSpan={9} className='px-4 py-6 text-center'>
                  <Spinner size='sm' />
                </td>
              </tr>
            )}
            {!state.loading && state.error && (
              <tr>
                <td colSpan={9} className='px-4 py-3 text-red-600'>
                  {state.error}
                </td>
              </tr>
            )}
            {!state.loading && !state.error && rows.length === 0 && (
              <tr>
                <td colSpan={9} className='px-4 py-3 text-gray-500'>
                  No users match.
                </td>
              </tr>
            )}
            {!state.loading &&
              rows.slice(0, shown).map((r) => {
                const [chip, tone] = STATUS_CHIP[r.status];
                return (
                  <tr
                    key={perUser ? String(r.userId) : `${r.userId}-${r.source}`}
                    className='cursor-pointer border-t border-gray-100 hover:bg-gray-50'
                    onClick={() => setTimelineUser({ _id: r.userId, name: r.name, email: r.email })}
                  >
                    <td className='px-4 py-2'>
                      <div className='font-medium text-gray-900'>{r.name || '—'}</div>
                      <div className='text-xs text-gray-500'>{r.email}</div>
                    </td>
                    <td className='px-4 py-2'>{r.sources.join(', ')}</td>
                    <td className='px-4 py-2'>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>
                        {chip}
                      </span>
                    </td>
                    <td className='px-4 py-2 text-right'>{r.planClicks}</td>
                    <td className='px-4 py-2 text-right'>{r.checkoutsStarted}</td>
                    <td className='px-4 py-2 text-right'>
                      {r.paid}
                      {r.paidCreditPacks > 0 && (
                        <span className='ml-1 text-xs text-gray-500'>
                          ({r.paidCreditPacks} credit)
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-2 text-xs text-gray-600'>
                      {r.plans.length ? r.plans.join(', ') : '—'}
                    </td>
                    <td className='px-4 py-2'>{r.subscribedNow ? 'Yes' : 'No'}</td>
                    <td className='px-4 py-2 text-xs text-gray-600'>{when(r.lastAt)}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500'>
        <span>
          Showing {Math.min(shown, rows.length)} of {rows.length}
          {state.truncated && ' (only the 5,000 most recent rows are loaded)'}.
          &quot;Never paid&quot; means no payment through any button in this period and not
          subscribed now, so these lists are safe to retarget. Send to Zoho skips anyone who
          has not agreed to offer emails.
        </span>
        {shown < rows.length && (
          <Button size='sm' variant='flat' onPress={() => setShown((n) => n + PAGE)}>
            Show more
          </Button>
        )}
      </div>

      <ZohoPushModal
        isOpen={zohoOpen}
        onClose={() => setZohoOpen(false)}
        matchCount={uniqueUserIds.length}
        filterSummary={[
          source || 'All buttons',
          statusLabel,
          `last ${days} days`,
          ...(query.trim() ? [`search "${query.trim()}"`] : []),
        ]}
        loadRows={async (onProgress) => {
          onProgress?.(uniqueUserIds.length, uniqueUserIds.length);
          return uniqueUserIds.map((_id) => ({ _id }));
        }}
      />

      {timelineUser && (
        <UserTimelineModal user={timelineUser} onClose={() => setTimelineUser(null)} />
      )}
    </section>
  );
}
